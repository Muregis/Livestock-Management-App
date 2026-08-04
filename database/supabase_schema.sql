-- ============================================================
-- Supabase Database Schema - MySQL Aligned with RLS Protection
-- Compatible with PostgreSQL via Supabase
-- ============================================================

create extension if not exists "uuid-ossp";

alter database "livestock-management-app" set row_security = on;

-- ============================================================
-- USERS TABLE (For Authentication & RBAC)
-- ============================================================
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    password_hash text,
    name text not null,
    role text check (role in ('superadmin', 'admin', 'manager', 'veterinarian', 'farmhand', 'viewer')) not null default 'viewer',
    permissions jsonb not null default '[]'::jsonb,
    avatar text,
    phone text,
    birth_date date,
    hire_date date not null,
    is_active boolean default true,
    last_login timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);
create index if not exists idx_users_active on users(is_active);

-- ============================================================
-- PERMISSIONS TABLE (For RBAC)
-- ============================================================
create table if not exists permissions (
    permission_key text primary key,
    description text not null,
    category text default 'general',
    created_at timestamptz default now()
);

insert into permissions (permission_key, description, category) values
('read', 'Read access to data', 'general'),
('write', 'Write/modify data', 'general'),
('delete', 'Delete data', 'general'),
('manage_users', 'Create/modify users and roles', 'admin'),
('manage_animals', 'Create/modify animal records', 'operations'),
('manage_financial', 'View/edit financial records', 'finance'),
('view_reports', 'View production reports', 'operations'),
('manage_health', 'Manage health events', 'operations')
on conflict (permission_key) do nothing;

-- ============================================================
-- ANIMALS TABLE (with Species Support - MySQL Aligned)
-- ============================================================
create table if not exists animals (
    id uuid primary key default uuid_generate_v4(),
    ear_tag text not null unique,
    name text,
    gender text check (gender in ('male', 'female')) not null,
    species text check (species in ('dairy_cattle', 'beef_cattle', 'sheep', 'goats', 'poultry', 'rabbits', 'pigs', 'horses', 'buffalo', 'camel', 'other')) not null default 'dairy_cattle',
    breed text not null,
    sire_id uuid references animals(id) on delete set null,
    dam_id uuid references animals(id) on delete set null,
    birth_date timestamptz not null,
    status text check (status in ('active', 'sold', 'deceased', 'quarantine')) not null default 'active',
    location_id text not null,
    location_name text,
    acquisition_date timestamptz,
    acquisition_cost numeric(10,2),
    current_weight numeric(8,2),
    expected_weight numeric(8,2),
    milk_production_today numeric(10,2),
    milk_production_lifetime numeric(12,2),
    days_in_milk integer default 0,
    body_condition_score numeric(3,1),
    genetic_value numeric(5,2),
    health_score numeric(5,1),
    productivity_score numeric(5,1),
    age_in_days integer,
    age_display text,
    is_pregnant boolean default false,
    expected_calving_date timestamptz,
    last_milk_date timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_animals_ear_tag on animals(ear_tag);
create index if not exists idx_animals_status on animals(status);
create index if not exists idx_animals_location on animals(location_id);
create index if not exists idx_animals_gender_breed on animals(gender, breed);
create index if not exists idx_animals_birth_date on animals(birth_date);
create index if not exists idx_animals_genetic_value on animals(genetic_value);
create index if not exists idx_animals_species on animals(species);
create index if not exists idx_animals_pregnant on animals(is_pregnant);
create index if not exists idx_animals_expected_calving on animals(expected_calving_date);

-- ============================================================
-- HEALTH EVENTS TABLE
-- ============================================================
create table if not exists health_events (
    id uuid primary key default uuid_generate_v4(),
    animal_id uuid references animals(id) on delete cascade not null,
    type text check (type in ('vaccination', 'treatment', 'health_check', 'disease_outbreak', 'parasite_check', 'castration', 'ewe_rapping', 'hoof_trim', 'dental')) not null,
    date date not null,
    description text not null,
    veterinarian_id text,
    veterinarian_name text,
    cost numeric(10,2) default 0,
    notes text,
    next_due_date timestamptz,
    related_event_id uuid references health_events(id),
    created_at timestamptz default now()
);

create index if not exists idx_health_events_animal on health_events(animal_id);
create index if not exists idx_health_events_type_date on health_events(type, date);
create index if not exists idx_health_events_next_due on health_events(next_due_date);

-- ============================================================
-- BREEDING EVENTS TABLE
-- ============================================================
create table if not exists breeding_events (
    id uuid primary key default uuid_generate_v4(),
    dam_id uuid references animals(id) on delete cascade not null,
    sire_id uuid references animals(id) on delete set null,
    bull_name text,
    service_date timestamptz not null,
    method text check (method in ('AI', 'Natural')) not null,
    expected_calving_date timestamptz not null,
    actual_calving_date timestamptz,
    outcome text check (outcome in ('pregnant', 'not_pregnant', 'c_section', 'stillborn', 'aborted')),
    calf_id uuid references animals(id) on delete set null,
    notes text,
    created_at timestamptz default now()
);

create index if not exists idx_breeding_dam on breeding_events(dam_id);
create index if not exists idx_breeding_expected_calving on breeding_events(expected_calving_date);
create index if not exists idx_breeding_outcome on breeding_events(outcome);
create index if not exists idx_breeding_service_date on breeding_events(service_date);

-- ============================================================
-- FEED CONSUMPTION TABLE
-- ============================================================
create table if not exists feed_consumption (
    id uuid primary key default uuid_generate_v4(),
    animal_id uuid references animals(id) on delete cascade,
    feed_type text check (feed_type in ('hay', 'silage', 'grain', 'supplement', 'mineral')) not null,
    quantity numeric(10,2) not null,
    unit text default 'kg',
    date timestamptz not null,
    notes text,
    created_at timestamptz default now()
);

create index if not exists idx_feed_consumption_animal on feed_consumption(animal_id);
create index if not exists idx_feed_consumption_date_type on feed_consumption(date, feed_type);
create index if not exists idx_feed_consumption_date on feed_consumption(date);

-- ============================================================
-- FEED INVENTORY TABLE
-- ============================================================
create table if not exists feed_inventory (
    id uuid primary key default uuid_generate_v4(),
    feed_type text check (feed_type in ('hay', 'silage', 'grain', 'supplement', 'mineral')) not null,
    start_date timestamptz not null,
    end_date timestamptz,
    quantity_received numeric(12,2) not null,
    quantity_consumed numeric(12,2) default 0,
    quantity_remaining numeric(12,2) not null,
    cost_per_unit numeric(10,2) not null,
    supplier text not null,
    storage_location text not null,
    created_at timestamptz default now()
);

create index if not exists idx_feed_inventory_type on feed_inventory(feed_type);
create index if not exists idx_feed_inventory_remaining on feed_inventory(quantity_remaining);
create index if not exists idx_feed_inventory_dates on feed_inventory(start_date, end_date);

-- ============================================================
-- FINANCIAL RECORDS TABLE
-- ============================================================
create table if not exists financial_records (
    id uuid primary key default uuid_generate_v4(),
    type text check (type in ('birth', 'sale', 'veterinary', 'feed', 'labor', 'other')) not null,
    date timestamptz not null,
    amount numeric(12,2) not null,
    description text not null,
    related_animal_id uuid references animals(id) on delete set null,
    related_event_id uuid,
    created_at timestamptz default now()
);

create index if not exists idx_financial_date_type on financial_records(date, type);
create index if not exists idx_financial_animal on financial_records(related_animal_id);
create index if not exists idx_financial_type on financial_records(type);

-- ============================================================
-- TASKS TABLE
-- ============================================================
create table if not exists tasks (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    status text check (status in ('todo', 'in-progress', 'done')) not null default 'todo',
    priority text check (priority in ('high', 'medium', 'low')) not null default 'medium',
    category text check (category in ('feeding', 'health', 'maintenance', 'milking', 'breeding')) not null,
    assignee_name text,
    assignee_avatar text,
    due_date date not null,
    estimated_time text,
    location text,
    related_animal_id uuid references animals(id) on delete set null,
    recurring boolean default false,
    recurrence_pattern text check (recurrence_pattern in ('daily', 'weekly', 'monthly')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_tasks_status_priority on tasks(status, priority);
create index if not exists idx_tasks_category on tasks(category);
create index if not exists idx_tasks_assignee on tasks(assignee_name);

-- ============================================================
-- WORKERS TABLE (MySQL Aligned)
-- ============================================================
create table if not exists workers (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    role text check (role in ('Veterinarian', 'Farm Hand', 'Milking Specialist', 'Maintenance', 'Manager', 'Nutritionist', 'Breeding Specialist', 'Sales Agent')) not null,
    status text check (status in ('Active', 'On Leave', 'Off Duty')) not null default 'Active',
    avatar text,
    phone text not null,
    email text not null,
    location text not null,
    start_date date not null,
    specialization text,
    current_tasks integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_workers_role on workers(role);
create index if not exists idx_workers_status on workers(status);
create index if not exists idx_workers_email on workers(email);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
create table if not exists reports (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    date date not null,
    type text check (type in ('Production', 'Health', 'Inventory', 'Breeding', 'Maintenance', 'Compliance', 'Financial')) not null,
    status text check (status in ('Completed', 'Processing')) not null default 'Completed',
    description text,
    data jsonb,
    created_at timestamptz default now()
);

create index if not exists idx_reports_type_status on reports(type, status);
create index if not exists idx_reports_date on reports(date);

-- ============================================================
-- VACCINATION SCHEDULES TABLE
-- ============================================================
create table if not exists vaccination_schedules (
    id uuid primary key default uuid_generate_v4(),
    vaccine text not null,
    age_months integer not null,
    dose text not null,
    route text not null,
    applicable_breeds jsonb not null default '["all"]'::jsonb,
    contraindications jsonb,
    valid_for_months integer not null,
    created_at timestamptz default now()
);

create index if not exists idx_vaccination_age on vaccination_schedules(age_months);

-- ============================================================
-- BREEDS TABLE (For Species Support)
-- ============================================================
create table if not exists breeds (
    id text primary key,
    species text check (species in ('dairy_cattle', 'beef_cattle', 'sheep', 'goats', 'poultry', 'rabbits', 'pigs', 'horses', 'buffalo', 'camel', 'other')) not null,
    name text not null,
    growth_rate numeric(4,2) default 2.0,
    lactation_capacity numeric(6,2) default 0,
    gestation_period integer default 283,
    description text,
    unique_breed_per_species (species, name)
);

insert into breeds (id, species, name, growth_rate, lactation_capacity, gestation_period, description) values
('HOLSTEIN', 'dairy_cattle', 'Holstein', 1.8, 2600.00, 283, 'High milk producing dairy breed'),
('JERSEY', 'dairy_cattle', 'Jersey', 1.5, 2000.00, 278, 'Rich butterfat dairy breed'),
('ANGUS', 'beef_cattle', 'Angus', 2.2, 0, 210, 'Premium beef cattle breed'),
('HERESTON', 'beef_cattle', 'Hereford', 2.0, 0, 210, 'Good beef cattle for crossbreeding'),
('SUFFOLK', 'sheep', 'Suffolk', 1.8, 0, 152, 'Hardy sheep breed'),
('DEBRINE', 'sheep', 'Debrine', 2.1, 0, 150, 'Commercial sheep breed'),
('TEXEL', 'sheep', 'Texel', 2.0, 0, 150, 'Muscular meat sheep'),
('WHITE_LEGHORN', 'poultry', 'White Leghorn', 0.02, 250, 0, 'High egg production chicken'),
('RHODE_ISLAND_RED', 'poultry', 'Rhode Island Red', 0.025, 220, 0, 'Dual purpose chicken'),
('LARGE_WHITE', 'pigs', 'Large White', 0.5, 0, 114, 'Commercial swine breed'),
('ARABIAN', 'horses', 'Arabian', 0.9, 0, 336, 'Endurance horse breed'),
('THOROUGHBRED', 'horses', 'Thoroughbred', 0.7, 0, 365, 'Racehorse breed'),
('BUFFALO_SILK', 'buffalo', 'Buffalo Silk', 2.5, 1500, 310, 'Water buffalo for dairy'),
('DROMEDARY', 'camel', 'Dromedary', 0.9, 600, 380, 'Single hump camel')
on conflict do nothing;

-- ============================================================
-- VACCINATION SCHEDULE SEED
-- ============================================================
insert into vaccination_schedules (vaccine, age_months, dose, route, applicable_breeds, valid_for_months) values
('Clostridial (CD&T)', 1, '1', 'Subcutaneous', '["all"]'::jsonb, 12),
('Leptospirosis', 1, '1', 'Subcutaneous', '["all"]'::jsonb, 6),
('Rabies', 3, '1', 'Subcutaneous', '["all"]'::jsonb, 12),
('Mastitis (Prepartum)', 0, '1', 'Subcutaneous', '["dairy"]'::jsonb, 0)
on conflict do nothing;

-- ============================================================
-- ERROR LOGS TABLE (For Security Auditing)
-- ============================================================
create table if not exists error_logs (
    id uuid primary key default uuid_generate_v4(),
    error_message text not null,
    stack_trace text,
    user_id uuid references users(id) on delete set null,
    location text,
    severity text check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
    created_at timestamptz default now()
);

create index if not exists idx_error_logs_severity on error_logs(severity);
create index if not exists idx_error_logs_created on error_logs(created_at);

-- ============================================================
-- AUDIT LOG TABLE (For Compliance)
-- ============================================================
create table if not exists audit_log (
    id uuid primary key default uuid_generate_v4(),
    table_name text not null,
    record_id uuid not null,
    action text check (action in ('INSERT', 'UPDATE', 'DELETE')) not null,
    old_values jsonb,
    new_values jsonb,
    user_id uuid references users(id) on delete set null,
    ip_address text,
    user_agent text,
    created_at timestamptz default now()
);

create index if not exists idx_audit_table on audit_log(table_name);
create index if not exists idx_audit_record on audit_log(record_id);
create index if not exists idx_audit_user on audit_log(user_id);
create index if not exists idx_audit_created on audit_log(created_at);

-- ============================================================
-- ANIMAL DASHBOARD VIEW
-- ============================================================
create or replace view v_animal_dashboard as
select 
    a.id,
    a.ear_tag,
    a.name,
    a.species,
    a.breed,
    a.gender,
    coalesce(a.age_in_days, 0) as age_in_days,
    coalesce(a.health_score, 75) as health_score,
    a.milk_production_today,
    a.current_weight,
    a.genetic_value,
    a.status,
    a.location_name,
    concat(floor(coalesce(a.age_in_days, 0) / 365), 'y ', floor((coalesce(a.age_in_days, 0) % 365) / 30), 'm') as age_display,
    case when coalesce(a.health_score, 75) < 50 then 'critical' when coalesce(a.health_score, 75) < 70 then 'warning' else 'normal' end as health_risk,
    case a.species when 'dairy_cattle' then 'dairy' when 'beef_cattle' then 'beef' when 'sheep' then 'small_ruminant' when 'goats' then 'small_ruminant' when 'poultry' then 'poultry' when 'rabbits' then 'small_mammal' when 'pigs' then 'swine' else 'other' end as species_category
from animals a 
where a.status = 'active';

-- ============================================================
-- RLS POLICIES - COMPACT & SECURE
-- ============================================================

-- Enable RLS on all sensitive tables
alter table animals enable row level security;
alter table health_events enable row level security;
alter table breeding_events enable row level security;
alter table feed_consumption enable row level security;
alter table feed_inventory enable row level security;
alter table financial_records enable row level security;
alter table tasks enable row level security;
alter table workers enable row level security;
alter table reports enable row level security;

-- Compact policies: Public read, Authenticated write
create policy "animals_rls" on animals for select using (true);
create policy "animals_rls_write" on animals for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager', 'veterinarian', 'farmhand'));

create policy "health_events_rls" on health_events for select using (true);
create policy "health_events_rls_write" on health_events for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager', 'veterinarian', 'farmhand'));

create policy "breeding_events_rls" on breeding_events for select using (true);
create policy "breeding_events_rls_write" on breeding_events for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager', 'veterinarian', 'farmhand'));

create policy "feed_consumption_rls" on feed_consumption for select using (true);
create policy "feed_consumption_rls_write" on feed_consumption for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager', 'farmhand'));

create policy "feed_inventory_rls" on feed_inventory for select using (true);
create policy "feed_inventory_rls_write" on feed_inventory for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager'));

create policy "financial_records_rls" on financial_records for select using (true);
create policy "financial_records_rls_write" on financial_records for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager'));

create policy "tasks_rls" on tasks for select using (true);
create policy "tasks_rls_write" on tasks for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager', 'farmhand'));

create policy "workers_rls" on workers for select using (true);
create policy "workers_rls_write" on workers for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager'));

create policy "reports_rls" on reports for select using (true);
create policy "reports_rls_write" on reports for insert, update, delete using (auth.role() in ('superadmin', 'admin', 'manager'));

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_animals_updated_at before update on animals
    for each row execute function update_updated_at_column();

create trigger update_tasks_updated_at before update on tasks
    for each row execute function update_updated_at_column();

create trigger update_workers_updated_at before update on workers
    for each row execute function update_updated_at_column();

-- ============================================================
-- VERIFY SETUP
-- ============================================================
select 'Schema created successfully with RLS protection!' as status;
select count(*) as table_count from information_schema.tables where table_schema = 'public';
select 'Tables with RLS enabled:' as info;
select tablename from pg_tables where schemaname = 'public' and tablename in ('animals', 'health_events', 'breeding_events', 'feed_consumption', 'feed_inventory', 'financial_records', 'tasks', 'workers', 'reports');