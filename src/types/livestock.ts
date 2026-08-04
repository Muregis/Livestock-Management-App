export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'quarantine';
export type AnimalGender = 'male' | 'female';
export type AnimalSpecies = 'dairy_cattle' | 'beef_cattle' | 'sheep' | 'goats' | 'poultry' | 'rabbits' | 'pigs' | 'horses' | 'buffalo' | 'camel' | 'other';
export type AnimalBreed = 'Holstein' | 'Jersey' | 'Angus' | 'Hereford' | 'Charolais' | 'Limousin' | 'Simmental' | 'Debrine' | 'BrownSwiss' | 'Texel' | 'Suffolk' | 'Dorper' | 'Katahdin' | 'Bergerac' | 'Rhodesian' | 'WhiteLeghorn' | 'RhodeIslandRed' | 'PlymouthRock' | 'SusScrofa' | 'LargeWhite' | 'Bergerpig' | 'Flanders' | 'Arabian' | 'Thoroughbred' | 'ClevelandBay' | 'draft' | 'BuffaloSilk' | 'BubalusBubalis' | 'Dromedary' | 'other';

export type WorkerRole = 'Veterinarian' | 'Farm Hand' | 'Milking Specialist' | 'Maintenance' | 'Manager' | 'Nutritionist' | 'BreedingSpecialist' | 'SalesAgent';
export type WorkerStatus = 'Active' | 'On Leave' | 'Off Duty';

export type ReportType = 'Production' | 'Health' | 'Inventory' | 'Breeding' | 'Maintenance' | 'Compliance' | 'Financial';
export type ReportStatusType = 'Completed' | 'Processing';

export interface GeneticTraitScores {
  growth: number;
  milk: number;
  fertility: number;
  health: number;
  conformation: number;
  maternal: number;
}

export interface Animal {
  id: string;
  earTag: string;
  name?: string;
  gender: AnimalGender;
  species: AnimalSpecies;
  breed: AnimalBreed;
  sireId?: string;
  damId?: string;
  birthDate: Date;
  status: AnimalStatus;
  locationId: string;
  locationName?: string;
  acquisitionDate?: Date;
  acquisitionCost?: number;
  currentWeight?: number;
  expectedWeight?: number;
  milkProductionToday?: number;
  milkProductionLifetime?: number;
  daysInMilk?: number;
  bodyConditionScore?: number;
  ageInDays?: number;
  ageDisplay?: string;
  geneticValue?: number;
  healthScore?: number;
  productivityScore?: number;
  traitScores?: GeneticTraitScores;
  isPregnant?: boolean;
  expectedCalvingDate?: Date;
  lastMilkDate?: Date;
}

export type HealthEventType = 
  | 'vaccination'
  | 'treatment'
  | 'health_check'
  | 'disease_outbreak'
  | 'parasite_check'
  | 'castration'
  | 'ewe_rapping'
  | 'hoof_trim'
  | 'dental';

export interface HealthEvent {
  id: string;
  animalId: string;
  type: HealthEventType;
  date: Date;
  description: string;
  veterinarianId?: string;
  veterinarianName?: string;
  cost: number;
  notes?: string;
  nextDueDate?: Date;
  relatedEventId?: string;
}

export type BreedingMethod = 'AI' | 'Natural';
export type BreedingOutcome = 'pregnant' | 'not_pregnant' | 'c_section' | 'stillborn' | 'aborted';

export interface BreedingEvent {
  id: string;
  damId: string;
  sireId?: string;
  bullName?: string;
  serviceDate: Date;
  method: BreedingMethod;
  expectedCalvingDate: Date;
  actualCalvingDate?: Date;
  outcome?: BreedingOutcome;
  calfId?: string;
  notes?: string;
  conceptionRate?: number;
}

export type TreatmentProtocol = {
  disease: string;
  drug: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  withdrawalPeriod: number;
  contraindications: string[];
};

export interface VaccinationSchedule {
  vaccine: string;
  ageMonths: number;
  dose: string;
  route: string;
  applicableBreeds: string[];
  contraindications: string[];
  validForMonths: number;
}

export type FeedType = 'hay' | 'silage' | 'grain' | 'supplement' | 'mineral';

export interface FeedConsumption {
  id: string;
  animalId: string;
  feedType: FeedType;
  quantity: number;
  unit: string;
  date: Date;
  notes?: string;
}

export interface FeedInventory {
  id: string;
  feedType: FeedType;
  startDate: Date;
  endDate?: Date;
  quantityReceived: number;
  quantityConsumed: number;
  quantityRemaining: number;
  costPerUnit: number;
  supplier: string;
  storageLocation: string;
}

export type EconomicEvent = 'birth' | 'sale' | 'veterinary' | 'feed' | 'labor' | 'other';

export interface FinancialRecord {
  id: string;
  type: EconomicEvent;
  date: Date;
  amount: number;
  description: string;
  relatedAnimalId?: string;
  relatedEventId?: string;
}

export interface FeedlotReport {
  id: string;
  title: string;
  date: string;
  type: ReportType;
  status: ReportStatusType;
  description: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'feeding' | 'health' | 'maintenance' | 'milking' | 'breeding';
export type TaskStatusType = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatusType;
  priority: TaskPriority;
  category: TaskCategory;
  assignee?: {
    name: string;
    avatar: string;
    role: string;
  };
  dueDate: string;
  estimatedTime?: string;
  location?: string;
  relatedAnimalId?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
}

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
  avatar: string;
  phone: string;
  email: string;
  location: string;
  startDate: string;
  specialization?: string;
  currentTasks?: number;
}

export interface FarmSetting {
  id: string;
  title: string;
  value: string;
  type: 'text' | 'select' | 'number' | 'textarea' | 'switch';
  options?: string[];
  description?: string;
  category: 'general' | 'operations' | 'environment' | 'utilities';
  unit?: string;
  min?: number;
  max?: number;
}

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'veterinarian' | 'farmhand' | 'viewer';
export type Permission = 'read' | 'write' | 'delete' | 'manage_users' | 'manage_animals' | 'manage_financial';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  phone?: string;
  birthDate?: Date;
  hireDate: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface PedigreeNode {
  id: string;
  earTag: string;
  name?: string;
  breed: string;
  birthDate: Date;
  geneticValue: number;
  generation?: number;
  relationship?: 'sire' | 'dam';
  parent?: string;
}

export interface PedigreeTree {
  animalId: string;
  ancestors: PedigreeNode[];
  descendants: PedigreeNode[];
  relatedAnimals: PedigreeNode[];
  commonAncestors: PedigreeNode[];
  inbreedingCoefficient: number;
}

export interface GeneticProfile {
  animalId: string;
  traitScores: GeneticTraitScores;
  geneticValue: number;
  diversityIndex?: number;
  preferredMate?: string;
}

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  category: 'health' | 'feeding' | 'breeding' | 'financial' | 'operational';
  title: string;
  description: string;
  actionRequired: string;
  affectedAnimals?: string[];
  confidence: number;
  estimatedImpact?: number;
}

export interface FarmRecommendationReport {
  date: Date;
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  recommendations: Recommendation[];
}

export interface PredictionResult<T> {
  confidence: number;
  factors: string[];
  prediction: T;
  recommendations: string[];
}