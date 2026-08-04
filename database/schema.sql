-- Livestock Management System Database Schema
-- Compatible with Supabase/PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Animals Table
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ear_tag TEXT NOT NULL UNIQUE,
    name TEXT,
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    breed TEXT NOT NULL,
    sire_id UUID REFERENCES animals(ear_tag),
    dam_id UUID REFERENCES animals(ear_tag),
    birth_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'sold', 'deceased', 'quarantine')) NOT NULL DEFAULT 'active',
    location_id TEXT NOT NULL,
    location_name TEXT,
    acquisition_date DATE,
    acquisition_cost NUMERIC(10,2),
    current_weight NUMERIC(8,2),
    expected_weight NUMERIC(8,2),
    milk_production_today NUMERIC(10,2),
    milk_production_lifetime NUMERIC(12,2),
    days_in_milk INTEGER DEFAULT 0,
    body_condition_score NUMERIC(3,1),
    genetic_value NUMERIC(5,2),
    health_score NUMERIC(5,1),
    productivity_score NUMERIC(5,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_animals_ear_tag ON animals(ear_tag);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_location ON animals(location_id);
CREATE INDEX idx_animals_gender_breed ON animals(gender, breed);

-- Health Events Table
CREATE TABLE health_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('vaccination', 'treatment', 'health_check', 'disease_outbreak', 'parasite_check', 'castration', 'ewe_rapping', 'hoof_trim', 'dental')) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    veterinarian_id TEXT,
    veterinarian_name TEXT,
    cost NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    next_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_events_animal ON health_events(animal_id);
CREATE INDEX idx_health_events_type_date ON health_events(type, date);

-- Breeding Events Table
CREATE TABLE breeding_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dam_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
    sire_id UUID REFERENCES animals(id),
    bull_name TEXT,
    service_date DATE NOT NULL,
    method TEXT CHECK (method IN ('AI', 'Natural')) NOT NULL,
    expected_calving_date DATE NOT NULL,
    actual_calving_date DATE,
    outcome TEXT CHECK (outcome IN ('pregnant', 'not_pregnant', 'c_section', 'stillborn', 'aborted')),
    calf_id UUID REFERENCES animals(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_breeding_dam ON breeding_events(dam_id);
CREATE INDEX idx_breeding_expected_calving ON breeding_events(expected_calving_date);
CREATE INDEX idx_breeding_outcome ON breeding_events(outcome);

-- Feed Consumption Table
CREATE TABLE feed_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    feed_type TEXT CHECK (feed_type IN ('hay', 'silage', 'grain', 'supplement', 'mineral')) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_consumption_animal ON feed_consumption(animal_id);
CREATE INDEX idx_feed_consumption_date_type ON feed_consumption(date, feed_type);

-- Feed Inventory Table
CREATE TABLE feed_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_type TEXT CHECK (feed_type IN ('hay', 'silage', 'grain', 'supplement', 'mineral')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    quantity_received NUMERIC(12,2) NOT NULL,
    quantity_consumed NUMERIC(12,2) DEFAULT 0,
    quantity_remaining NUMERIC(12,2) NOT NULL,
    cost_per_unit NUMERIC(10,2) NOT NULL,
    supplier TEXT NOT NULL,
    storage_location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_inventory_type ON feed_inventory(feed_type);
CREATE INDEX idx_feed_inventory_remaining ON feed_inventory(quantity_remaining);

-- Financial Records Table
CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT CHECK (type IN ('birth', 'sale', 'veterinary', 'feed', 'labor', 'other')) NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT NOT NULL,
    related_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    related_event_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_financial_date_type ON financial_records(date, type);
CREATE INDEX idx_financial_animal ON financial_records(related_animal_id);

-- Vaccination Schedules Table (Reference data)
CREATE TABLE vaccination_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vaccine TEXT NOT NULL,
    age_months INTEGER NOT NULL,
    dose TEXT NOT NULL,
    route TEXT NOT NULL,
    applicable_breeds TEXT[],
    contraindications TEXT[],
    valid_for_months INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) NOT NULL DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) NOT NULL DEFAULT 'medium',
    category TEXT CHECK (category IN ('feeding', 'health', 'maintenance', 'milking', 'breeding')) NOT NULL,
    assignee_name TEXT,
    assignee_avatar TEXT,
    due_date DATE NOT NULL,
    estimated_time TEXT,
    location TEXT,
    related_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_name);

-- Workers Table
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT CHECK (status IN ('Active', 'On Leave', 'Off Duty')) NOT NULL DEFAULT 'Active',
    avatar TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    specialization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workers_role ON workers(role);
CREATE INDEX idx_workers_status ON workers(status);

-- Reports Table (Historical data)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('Production', 'Health', 'Inventory', 'Breeding', 'Maintenance', 'Compliance', 'Financial')) NOT NULL,
    status TEXT CHECK (status IN ('Completed', 'Processing')) NOT NULL DEFAULT 'Completed',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_type_status ON reports(type, status);
CREATE INDEX idx_reports_date ON reports(date);

-- Insert default vaccination schedules
INSERT INTO vaccination_schedules (vaccine, age_months, dose, route, applicable_breeds, contraindications, valid_for_months) VALUES
('Clostridial (CD&T)', 1, '1', 'Subcutaneous', ARRAY['all'], ARRAY[], 12),
('Leptospirosis', 1, '1', 'Subcutaneous', ARRAY['all'], ARRAY[], 6),
('Rabies', 3, '1', 'Subcutaneous', ARRAY['all'], ARRAY[], 12),
('Mastitis (Prepartum)', 0, '1', 'Subcutaneous', ARRAY['dairy'], ARRAY[], 0);

-- Seed data for vaccination schedule
INSERT INTO vaccination_schedules (vaccine, age_months, dose, route, applicable_breeds, contraindications, valid_for_months) VALUES
('Brucellosis', 2, '1', 'Subcutaneous', ARRAY['cattle'], ARRAY[], 12),
('BTV (Bluetongue)', 6, '1', 'Subcutaneous', ARRAY['all'], ARRAY[], 12),
('Influenza', 6, '1', 'Intranasal', ARRAY['all'], ARRAY[], 6),
('Footrot', 12, '1', 'Topical', ARRAY['all'], ARRAY[], 0);