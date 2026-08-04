import { supabase } from '@/lib/supabase';
import type { Animal, HealthEvent, BreedingEvent, FeedConsumption, FeedInventory, FinancialRecord, VaccinationSchedule, Task, TaskStatusType, TaskCategory, Worker, User, UserRole, Permission, WorkerRole, WorkerStatus, FeedType, HealthEventType, EconomicEvent } from '@/types';

export class HealthEventService {
  static async getByAnimal(animalId: string): Promise<HealthEvent[]> {
    const { data, error } = await supabase
      .from('health_events')
      .select('*')
      .eq('animal_id', animalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(e => ({
      id: e.id,
      animalId: e.animal_id,
      type: e.type as HealthEventType,
      date: new Date(e.date),
      description: e.description,
      veterinarianId: e.veterinarian_id,
      veterinarianName: e.veterinarian_name,
      cost: Number(e.cost),
      notes: e.notes,
      nextDueDate: e.next_due_date ? new Date(e.next_due_date) : undefined,
      relatedEventId: e.related_event_id
    }));
  }
}

export class BreedingService {
  static async create(event: Omit<BreedingEvent, 'id'>): Promise<BreedingEvent> {
    const { data, error } = await supabase
      .from('breeding_events')
      .insert({
        dam_id: event.damId,
        sire_id: event.sireId,
        bull_name: event.bullName,
        service_date: event.serviceDate.toISOString(),
        method: event.method,
        expected_calving_date: event.expectedCalvingDate.toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      damId: data.dam_id,
      sireId: data.sire_id,
      bullName: data.bull_name,
      serviceDate: new Date(data.service_date),
      method: data.method,
      expectedCalvingDate: new Date(data.expected_calving_date),
      actualCalvingDate: data.actual_calving_date ? new Date(data.actual_calving_date) : undefined,
      outcome: data.outcome,
      calfId: data.calf_id,
      notes: data.notes
    };
  }
}

export class FeedService {
  static async addConsumption(consumption: Omit<FeedConsumption, 'id'>): Promise<FeedConsumption> {
    const { data, error } = await supabase
      .from('feed_consumption')
      .insert({
        animal_id: consumption.animalId,
        feed_type: consumption.feedType,
        quantity: consumption.quantity,
        unit: consumption.unit,
        date: consumption.date.toISOString(),
        notes: consumption.notes
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      animalId: data.animal_id,
      feedType: data.feed_type as FeedType,
      quantity: Number(data.quantity),
      unit: data.unit,
      date: new Date(data.date),
      notes: data.notes
    };
  }
}

export class FinancialService {
  static async recordFinancial(record: Omit<FinancialRecord, 'id' | 'createdAt'>): Promise<FinancialRecord> {
    const { data, error } = await supabase
      .from('financial_records')
      .insert({
        type: record.type,
        date: record.date.toISOString(),
        amount: record.amount,
        description: record.description,
        related_animal_id: record.relatedAnimalId,
        related_event_id: record.relatedEventId
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      type: data.type as EconomicEvent,
      date: new Date(data.date),
      amount: Number(data.amount),
      description: data.description,
      relatedAnimalId: data.related_animal_id,
      relatedEventId: data.related_event_id
    };
  }
}

export class VaccinationService {
  static async getSchedules(): Promise<VaccinationSchedule[]> {
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .select('*')
      .order('age_months');

    if (error) throw error;
    return (data || []).map(v => ({
      id: v.id,
      vaccine: v.vaccine,
      ageMonths: v.age_months,
      dose: v.dose,
      route: v.route,
      applicableBreeds: v.applicable_breeds || [],
      contraindications: v.contraindications || [],
      validForMonths: v.valid_for_months
    }));
  }
}

export class TaskService {
  static async getAll(status?: TaskStatusType): Promise<Task[]> {
    let query = supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as TaskStatusType,
      priority: t.priority,
      category: t.category as TaskCategory,
      assignee: t.assignee_name ? {
        name: t.assignee_name,
        avatar: t.assignee_avatar || '',
        role: 'Worker'
      } : undefined,
      dueDate: t.due_date,
      estimatedTime: t.estimated_time,
      location: t.location,
      relatedAnimalId: t.related_animal_id,
      recurring: t.recurring || false,
      recurrencePattern: t.recurrence_pattern as 'daily' | 'weekly' | 'monthly' | undefined
    }));
  }

  static async create(task: Omit<Task, 'id'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        assignee_name: task.assignee?.name,
        assignee_avatar: task.assignee?.avatar,
        due_date: task.dueDate,
        estimated_time: task.estimatedTime,
        location: task.location,
        related_animal_id: task.relatedAnimalId,
        recurring: task.recurring || false,
        recurrence_pattern: task.recurrencePattern
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as TaskStatusType,
      priority: data.priority,
      category: data.category as TaskCategory,
      assignee: data.assignee_name ? {
        name: data.assignee_name,
        avatar: data.assignee_avatar || '',
        role: 'Worker'
      } : undefined,
      dueDate: data.due_date,
      estimatedTime: data.estimated_time,
      location: data.location,
      relatedAnimalId: data.related_animal_id,
      recurring: data.recurring || false,
      recurrencePattern: data.recurrence_pattern as 'daily' | 'weekly' | 'monthly' | undefined
    };
  }
}

export class WorkerService {
  static async getAll(): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(w => ({
      id: w.id,
      name: w.name,
      role: w.role as WorkerRole,
      status: w.status as WorkerStatus,
      avatar: w.avatar,
      phone: w.phone,
      email: w.email,
      location: w.location,
      startDate: w.start_date,
      specialization: w.specialization,
      currentTasks: 0
    }));
  }
}

export class AnimalService {
  static async getAll(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('birthDate', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(animal => this.mapAnimalFromDB(animal));
  }

  private static mapAnimalFromDB(animal: any): Animal {
    return {
      id: animal.id,
      earTag: animal.ear_tag,
      name: animal.name,
      gender: animal.gender,
      species: animal.species || 'dairy_cattle',
      breed: animal.breed,
      sireId: animal.sire_id,
      damId: animal.dam_id,
      birthDate: new Date(animal.birth_date),
      status: animal.status,
      locationId: animal.location_id,
      locationName: animal.location_name,
      acquisitionDate: animal.acquisition_date ? new Date(animal.acquisition_date) : undefined,
      acquisitionCost: animal.acquisition_cost,
      currentWeight: animal.current_weight,
      expectedWeight: animal.expected_weight,
      milkProductionToday: animal.milk_production_today,
      milkProductionLifetime: animal.milk_production_lifetime,
      daysInMilk: animal.days_in_milk,
      bodyConditionScore: animal.body_condition_score,
      ageInDays: animal.age_in_days,
      ageDisplay: animal.age_display,
      geneticValue: animal.genetic_value,
      healthScore: animal.health_score,
      productivityScore: animal.productivity_score,
      traitScores: animal.trait_scores,
      isPregnant: animal.is_pregnant,
      expectedCalvingDate: animal.expected_calving_date ? new Date(animal.expected_calving_date) : undefined,
      lastMilkDate: animal.last_milk_date ? new Date(animal.last_milk_date) : undefined
    };
  }

  static async getBySpecies(species: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('species', species);

    if (error) throw error;
    return (data || []).map(animal => this.mapAnimalFromDB(animal));
  }

  static async create(animal: Omit<Animal, 'id' | 'ageInDays' | 'ageDisplay'>): Promise<Animal> {
    const ageInDays = Math.floor((Date.now() - new Date(animal.birthDate).getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.floor(ageInDays / 365);
    const months = Math.floor((ageInDays % 365) / 30);
    const ageDisplay = `${years}y ${months}m`;

    const { data, error } = await supabase
      .from('animals')
      .insert([{
        ear_tag: animal.earTag,
        name: animal.name,
        gender: animal.gender,
        species: animal.species,
        breed: animal.breed,
        sire_id: animal.sireId,
        dam_id: animal.damId,
        birth_date: animal.birthDate.toISOString(),
        status: animal.status || 'active',
        location_id: animal.locationId,
        location_name: animal.locationName,
        acquisition_date: animal.acquisitionDate?.toISOString(),
        acquisition_cost: animal.acquisitionCost,
        current_weight: animal.currentWeight,
        expected_weight: animal.expectedWeight,
        age_in_days: ageInDays,
        age_display: ageDisplay,
        genetic_value: animal.geneticValue,
        health_score: animal.healthScore,
        productivity_score: animal.productivityScore,
        trait_scores: animal.traitScores,
        is_pregnant: animal.isPregnant || false,
        expected_calving_date: animal.expectedCalvingDate?.toISOString(),
        last_milk_date: animal.lastMilkDate?.toISOString()
      }])
      .select('*')
      .single();

    if (error) throw error;
    return this.mapAnimalFromDB(data);
  }

  static async update(id: string, updates: Partial<Animal>): Promise<Animal> {
    const { data, error } = await supabase
      .from('animals')
      .update({
        ...this.extractUpdateFields(updates),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return this.mapAnimalFromDB(data);
  }

  private static extractUpdateFields(updates: Partial<Animal>): Record<string, any> {
    const fields: Record<string, any> = {};
    
    if (updates.earTag !== undefined) fields.ear_tag = updates.earTag;
    if (updates.name !== undefined) fields.name = updates.name;
    if (updates.gender !== undefined) fields.gender = updates.gender;
    if (updates.species !== undefined) fields.species = updates.species;
    if (updates.breed !== undefined) fields.breed = updates.breed;
    if (updates.sireId !== undefined) fields.sire_id = updates.sireId;
    if (updates.damId !== undefined) fields.dam_id = updates.damId;
    if (updates.birthDate !== undefined) fields.birth_date = updates.birthDate.toISOString();
    if (updates.status !== undefined) fields.status = updates.status;
    if (updates.currentWeight !== undefined) fields.current_weight = updates.currentWeight;
    if (updates.geneticValue !== undefined) fields.genetic_value = updates.geneticValue;
    
    return fields;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export class UserService {
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) return null;
    
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
      permissions: profile.permissions as Permission[],
      avatar: profile.avatar,
      phone: profile.phone,
      birthDate: profile.birth_date ? new Date(profile.birth_date) : undefined,
      hireDate: profile.hire_date,
      isActive: profile.is_active,
      lastLogin: profile.last_login ? new Date(profile.last_login) : undefined
    };
  }

  static async hasPermission(permission: Permission): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user?.isActive) return false;
    
    if (user.role === 'superadmin') return true;
    return user.permissions.includes(permission);
  }

  static async createUser(userData: {
    email: string;
    name: string;
    role: UserRole;
    permissions: Permission[];
    phone?: string;
  }): Promise<User> {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: crypto.randomUUID(),
      email_confirm: true
    });

    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions,
        phone: userData.phone,
        is_active: true,
        hire_date: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (profileError) throw profileError;
    
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      permissions: profile.permissions as Permission[],
      phone: profile.phone,
      hireDate: profile.hire_date,
      isActive: profile.is_active
    };
  }
}