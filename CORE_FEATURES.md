# Livestock Management System - Core Software Features

## Implemented Data Models & Services

### 1. Core Type Definitions (`src/types/livestock.ts`)

**Animal Profile Schema:**
- Ear tag, name, gender, breed
- Lineage tracking (sireId, damId)
- Birth date, acquisition details
- Health metrics: weight, BCS, healthScore
- Production metrics: milk, genetics
- Location tracking

**Health Events:**
- Complete veterinary record system
- Vaccination, treatment, health check tracking
- Next due date scheduling
- Cost tracking

**Breeding Events:**
- Mating records with AI/Natural methods
- Expected and actual calving dates
- Outcome tracking

**Feed Management:**
- Consumption tracking per animal
- Inventory management
- Nutritional requirements

**Financial Records:**
- Cost tracking per animal/event
- Profitability calculations

### 2. Prediction Engines (`src/services/predictions.ts`)

**HealthPredictionEngine:**
- `calculateHealthScore()` - Composite animal health score
- `predictDiseaseRisk()` - Pneumonia, mastitis, lameness, metabolic risk
- `calculateWeaningDate()` - Age-based weaning predictions
- `predictMarketWeight()` - Breed-specific growth curves

**FeedOptimizationEngine:**
- `calculateFeedRequirements()` - Phase-specific nutrition
- `optimizeFeedMix()` - Inventory-based ration optimization
- `predictFeedNeeds()` - Consumption forecasting

**ProfitabilityEngine:**
- `calculateROAS()` - Return on asset analysis
- `projectBreakEven()` - Cost-volume-profit analysis

**BreedingOptimizer:**
- `calculateConceptionRate()` - Reproductive efficiency
- `predictCalvingInterval()` - Gestation and weaning dates

### 3. Genetic Analysis (`src/services/genetics.ts`)

**GeneticAnalysisEngine:**
- `calculateTotalMerit()` - Weighted genetic value
- `calculateInbreedingCoefficient()` - Coefficient of inbreeding
- `recommendBreedingPair()` - Mate selection with diversity
- `calculateExpectedProgenyPerformance()` - EBV predictions
- `identifyOptimalMatingPairs()` - Ranked breeding recommendations
- `calculateGenerationInterval()` - Breeding frequency analysis
- `predictReplacementNeed()` - Herd turnover projections

### 4. Recommendation Engine (`src/services/recommendations.ts`)

**RecommendationEngine:**
- `generateFarmRecommendations()` - Consolidated farm alerts
- `calculateFarmHealthIndex()` - Overall farm health score
- `generateWorkerRecommendations()` - Labor allocation suggestions

**Features:**
- Automated health alerts
- Feed requirement notifications
- Breeding opportunity identification
- Task efficiency analysis
- Multi-priority recommendations (critical/high/medium/low)

### 5. Analytics (`src/services/analytics.ts`)

**FarmAnalytics:**
- `calculateDashboardMetrics()` - Real-time farm overview
- `calculateMortalityRate()` - Death rate analysis
- `calculateWeaningRate()` - Conversion efficiency
- `calculateAverageDailyGain()` - Growth performance
- `calculateFeedEfficiency()` - Feed conversion ratio
- `calculateProductionIndex()` - Milk/weight output

**DataFormatter:**
- Number, date, duration formatting
- Age display formatting
- Status color mapping

### 6. Service Layer (`src/services/livestockService.ts`)

**Supabase Integration:**
- Full CRUD operations for all entities
- Animal management
- Health event tracking
- Breeding event management
- Feed consumption/inventory
- Financial records

### 7. Database Schema (`database/schema.sql`)

Complete PostgreSQL schema with:
- All tables with proper relationships
- Indexing for performance
- Check constraints for data integrity
- Seed data for vaccination schedules

## Core Algorithms Implemented

### Health Scoring Algorithm
```
Health Score = Base(100) 
  - Age Risk (young/old) 
  - Weight Deviation (± from expected)
  - Body Condition Score (< 2: -25, > 3.5: -10)
  - Lactation Stage (mature cows penalty)
```

### Genetic Value Calculation
```
Total Merit = Σ(Trait Score × Weight)
Weights: Growth(15%), Milk(25%), Fertility(20%), Health(20%), Conformation(10%), Maternal(10%)
```

### Feed Requirements
- Phase-based nutritional guidelines
- Weight-adjusted rations
- Inventory optimization
- Concentrate-to-forage ratios

### Breeding Selection
- Minimum genetic merit threshold
- Inbreeding avoidance
- Diversity index calculation
- Progeny performance prediction

## Dashboard Component Example (`FarmdashboardOverview.tsx`)

Real-time overview including:
- Animal health statistics
- At-risk animal highlighting
- Health trend visualization
- Critical recommendations list

## Usage Examples

```typescript
import { 
  AnimalService, 
  HealthPredictionEngine, 
  GeneticAnalysisEngine,
  RecommendationEngine 
} from '@/services';

// Calculate animal health score
const health = HealthPredictionEngine.calculateHealthScore(animal);
console.log(`Health Score: ${health.prediction}`);
health.recommendations.forEach(r => console.log(`- ${r}`));

// Predict disease risk
const diseaseRisk = HealthPredictionEngine.predictDiseaseRisk(animal);
console.log(`Mastitis Risk: ${diseaseRisk.prediction.mastitisRisk}%`);

// Recommend breeding pair
const pair = GeneticAnalysisEngine.recommendBreedingPair(herd, {
  minGeneticMerit: 60,
  preferredBreeds: [],
  gender: 'male'
});

// Generate farm recommendations
const report = RecommendationEngine.generateFarmRecommendations(
  animals, feedInventory, tasks
);
```

## Key Business Metrics Calculated

| Metric | Formula | Purpose |
|--------|---------|---------|
| Health Score | Composite algorithm | Animal welfare monitoring |
| Genetic Value | Weighted trait scores | Breeding decisions |
| Feed Efficiency | Feed consumed / Weight gain | Nutrition optimization |
| Conception Rate | Conceptions / Services | Reproductive performance |
| Mortality Rate | Deaths / Births | Health program effectiveness |
| ROAS | Return / Investment | Capital allocation decisions |

## Next Steps for Implementation

1. Connect services to actual Supabase database
2. Implement real-time data subscriptions
3. Add batch processing for historical data
4. Create import/export utilities
5. Implement user-facing dashboards
6. Add mobile-responsive components