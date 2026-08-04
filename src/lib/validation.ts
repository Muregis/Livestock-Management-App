import { z } from 'zod';

export const animalSchema = z.object({
  id: z.string().uuid().optional(),
  earTag: z.string().min(1, 'Ear tag is required').max(50, 'Ear tag too long'),
  name: z.string().max(100, 'Name too long').optional(),
  gender: z.enum(['male', 'female']),
  species: z.enum(['dairy_cattle', 'beef_cattle', 'sheep', 'goats', 'poultry', 'rabbits', 'pigs', 'horses', 'buffalo', 'camel', 'other']).default('dairy_cattle'),
  breed: z.string().min(1, 'Breed is required').max(50, 'Breed too long'),
  sireId: z.string().uuid().optional(),
  damId: z.string().uuid().optional(),
  birthDate: z.date().refine(date => date <= new Date(), 'Birth date cannot be in the future'),
  status: z.enum(['active', 'sold', 'deceased', 'quarantine']).default('active'),
  locationId: z.string().min(1, 'Location is required'),
  locationName: z.string().max(100, 'Location name too long').optional(),
  acquisitionDate: z.date().optional(),
  acquisitionCost: z.number().min(0, 'Cost cannot be negative').max(999999.99, 'Cost too high').optional(),
  currentWeight: z.number().min(0, 'Weight cannot be negative').max(999999, 'Weight too high').optional(),
  expectedWeight: z.number().min(0, 'Expected weight cannot be negative').max(999999, 'Expected weight too high').optional(),
  milkProductionToday: z.number().min(0, 'Milk production cannot be negative').optional(),
  daysInMilk: z.number().int().min(0, 'Days in milk cannot be negative').default(0),
  bodyConditionScore: z.number().min(1, 'BCS must be at least 1').max(5, 'BCS cannot exceed 5').optional(),
  geneticValue: z.number().min(0, 'Genetic value cannot be negative').max(9999.99, 'Genetic value too high').optional(),
  healthScore: z.number().min(0, 'Health score cannot be negative').max(100, 'Health score cannot exceed 100').optional(),
  isPregnant: z.boolean().default(false),
});

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  role: z.enum(['superadmin', 'admin', 'manager', 'veterinarian', 'farmhand', 'viewer']).default('farmhand'),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'manage_users', 'manage_animals', 'manage_financial'])).min(1, 'At least one permission required'),
});

export const healthEventSchema = z.object({
  id: z.string().uuid().optional(),
  animalId: z.string().uuid('Invalid animal ID'),
  type: z.enum(['vaccination', 'treatment', 'health_check', 'disease_outbreak', 'parasite_check', 'castration', 'ewe_rapping', 'hoof_trim', 'dental']),
  date: z.date(),
  description: z.string().min(10, 'Description too short').max(1000, 'Description too long'),
  cost: z.number().min(0, 'Cost cannot be negative').max(999999.99, 'Cost too high').optional(),
  nextDueDate: z.date().optional(),
});

export const taskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.enum(['feeding', 'health', 'maintenance', 'milking', 'breeding']),
  dueDate: z.date().refine(date => date >= new Date(), 'Due date cannot be in the past'),
  relatedAnimalId: z.string().uuid().optional(),
});

export const feedingInputSchema = z.object({
  animalId: z.string().uuid(),
  feedType: z.enum(['hay', 'silage', 'grain', 'supplement', 'mineral']),
  quantity: z.number().positive('Quantity must be positive').max(10000, 'Quantity too high'),
  unit: z.string().default('kg'),
  notes: z.string().max(500).optional(),
});

export const breedingEventSchema = z.object({
  damId: z.string().uuid('Invalid dam ID'),
  sireId: z.string().uuid().optional(),
  bullName: z.string().max(100, 'Bull name too long').optional(),
  serviceDate: z.date(),
  method: z.enum(['AI', 'Natural']),
  expectedCalvingDate: z.date().refine(date => date > new Date(), 'Expected calving date must be in the future'),
});