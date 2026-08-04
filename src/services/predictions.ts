import type { Animal, FeedConsumption, FeedInventory, TreatmentProtocol, VaccinationSchedule } from '../types/livestock';

export interface PredictionResult<T> {
  confidence: number;
  factors: string[];
  prediction: T;
  recommendations: string[];
}

export class HealthPredictionEngine {
  private static readonly HEALTH_FACTORS = {
    ageRisk: 0.3,
    weightRisk: 0.25,
    BCSRisk: 0.2,
    locationRisk: 0.15,
    recentEventsRisk: 0.1
  };

  static calculateHealthScore(animal: Animal): PredictionResult<number> {
    let score = 100;
    const factors: string[] = [];
    const recommendations: string[] = [];

    if (animal.ageInDays < 30) {
      score -= 15;
      factors.push('Very young animal');
      recommendations.push('Increase monitoring frequency');
    }

    if (animal.ageInDays > 2555 && animal.gender === 'female' as const) {
      score -= 10;
      factors.push('Older lactating female');
      recommendations.push('Regular health checks monthly');
    }

    if (animal.bodyConditionScore && animal.bodyConditionScore < 2) {
      score -= 25;
      factors.push('Poor body condition score');
      recommendations.push('Veterinary consultation recommended');
    } else if (animal.bodyConditionScore && animal.bodyConditionScore > 3.5) {
      score -= 20;
      factors.push('Overconditioned');
      recommendations.push('Reduce feed intake, monitor BCS');
    }

    if (animal.currentWeight && animal.expectedWeight && animal.expectedWeight > 0) {
      const ratio = animal.currentWeight / animal.expectedWeight;
      if (ratio < 0.8) {
        score -= 15;
        factors.push('Significant weight loss');
        recommendations.push('Investigate feed intake, check for illness');
      } else if (ratio > 1.15) {
        score -= 10;
        factors.push('Overweight condition');
        recommendations.push('Adjust feed rations, increase exercise');
      }
    }

    score = Math.max(0, Math.min(100, score));

    return {
      confidence: Math.min(0.9, 1 - (factors.length * 0.1)),
      prediction: Math.round(score),
      factors,
      recommendations
    };
  }

  static predictDiseaseRisk(animal: Animal): PredictionResult<{
    pneumoniaRisk: number;
    mastitisRisk: number;
    lamenessRisk: number;
    metabolicRisk: number;
  }> {
    const risks = {
      pneumoniaRisk: 0,
      mastitisRisk: 0,
      lamenessRisk: 0,
      metabolicRisk: 0
    };

    const factors: string[] = [];
    const recommendations: string[] = [];

    if (animal.ageInDays < 90) {
      risks.pneumoniaRisk += 30;
      factors.push('Young animal - respiratory vulnerability');
    }

    if (animal.currentWeight && animal.currentWeight > 800) {
      risks.metabolicRisk += 25;
      factors.push('High-producing animal - metabolic stress');
    }

    if (animal.gender === 'female' as const && animal.daysInMilk && animal.daysInMilk > 305) {
      risks.mastitisRisk += 35;
      factors.push('Late lactation - increased mastitis risk');
      recommendations.push('Dry cow therapy 30 days before calving');
    }

    if (!animal.bodyConditionScore || animal.bodyConditionScore < 2) {
      risks.pneumoniaRisk += 20;
      recommendations.push('Monitor for signs of chronic wasting');
    }

    if (animal.locationName?.toLowerCase().includes('summer') || 
        animal.locationName?.toLowerCase().includes('pasture')) {
      risks.lamenessRisk += 15;
      factors.push('Pasture housing - hoof health concerns');
      recommendations.push('Weekly hoof checks, clean water access');
    }

    Object.keys(risks).forEach(key => {
      const value = (risks as any)[key];
      (risks as any)[key] = Math.max(0, Math.min(100, value));
    });

    return {
      confidence: 0.85,
      prediction: risks,
      factors,
      recommendations
    };
  }

  static predictWeaningDate(birthDate: Date, weaningAgeDays: number = 210): Date {
    return new Date(birthDate.getTime() + weaningAgeDays * 24 * 60 * 60 * 1000);
  }

  static predictMarketWeight(ageInDays: number, breed: string): number {
    const growthRates: Record<string, number> = {
      'Angus': 2.2,
      'Hereford': 2.0,
      'Charolais': 2.4,
      'Limousin': 2.5,
      'Holstein': 1.8,
      'Jersey': 1.5,
      'BrownSwiss': 1.9,
      'Simmental': 2.3,
      'Debrine': 2.1,
      'Suffolk': 1.8,
      'Dorper': 1.7,
      'LargeWhite': 2.0,
      'Flanders': 2.1,
      'Arabian': 1.5,
      'Thoroughbred': 1.4
    };

    const dailyGain = growthRates[breed] || 2.0;
    return Math.round(ageInDays * dailyGain);
  }
}

export class FeedOptimizationEngine {
  private static readonly NUTRITION_GUIDELINES = {
    growingCalves: { protein: 16, energy: 2.2, calcium: 1.0 },
    growingSteers: { protein: 14, energy: 3.0, calcium: 1.2 },
    finishingSteers: { protein: 12, energy: 3.5, calcium: 1.3 },
    lactatingCows: { protein: 16, energy: 3.2, calcium: 1.5 },
    dryCows: { protein: 10, energy: 2.0, calcium: 1.3 }
  };

  static calculateFeedRequirements(
    animal: Animal,
    currentPhase: 'calf' | 'grower' | 'finisher' | 'lactating' | 'dry'
  ): PredictionResult<{
    dailyFeedlbs: number;
    proteinPct: number;
    energyMcal: number;
    calciumPct: number;
  }> {
    const ageYears = animal.ageInDays / 365;
    const weight = animal.currentWeight || 500;
    
    let requirements = this.NUTRITION_GUIDELINES[currentPhase];
    
    if (weight > 0) {
      const weightFactor = weight / 500;
      requirements = {
        protein: requirements.protein * Math.sqrt(weightFactor),
        energy: requirements.energy * weightFactor,
        calcium: requirements.calcium * (0.8 + 0.4 * weightFactor)
      };
    }

    const dailyFeedlbs = Math.round(weight * 0.025 * 2.20462);

    return {
      confidence: 0.8,
      prediction: {
        dailyFeedlbs,
        proteinPct: Math.round(requirements.protein * 10) / 10,
        energyMcal: Math.round(requirements.energy * 10) / 10,
        calciumPct: Math.round(requirements.calcium * 10) / 10
      },
      factors: [`Age: ${ageYears.toFixed(1)} years`, `Weight: ${weight} kg`],
      recommendations: [`Provide ${dailyFeedlbs} lbs of ${this.getSuggestedFeedType(weight, currentPhase)}`]
    };
  }

  private static getSuggestedFeedType(weight: number, phase: string): string {
    if (phase === 'lactating') return 'high-quality hay + concentrate blend';
    if (phase === 'finisher') return 'corn silage + protein supplement';
    if (phase === 'grower') return 'grass hay + vitamin-mineral premix';
    return 'pasture grazing with mineral supplement';
  }

  static optimizeFeedMix(
    inventory: FeedInventory[],
    requirements: { proteinPct: number; energyMcal: number; calciumPct: number }
  ): PredictionResult<string[]> {
    const mix: string[] = [];
    
    const hay = inventory.find(f => f.feedType === 'hay');
    const grain = inventory.find(f => f.feedType === 'grain');
    const supplement = inventory.find(f => f.feedType === 'supplement');
    const mineral = inventory.find(f => f.feedType === 'mineral');

    if (hay?.quantityRemaining && hay.quantityRemaining > 0) {
      mix.push(`Hay: ${Math.max(1, hay.quantityRemaining * 0.4).toFixed(0)} units`);
    }

    if (grain?.quantityRemaining && grain.quantityRemaining > 0) {
      mix.push(`Grain: ${Math.max(1, grain.quantityRemaining * 0.3).toFixed(0)} units`);
    }

    if (supplement?.quantityRemaining && supplement.quantityRemaining > 0) {
      mix.push(`Supplement: ${Math.max(1, supplement.quantityRemaining * 0.2).toFixed(0)} units`);
    }

    if (mineral?.quantityRemaining && mineral.quantityRemaining > 0) {
      mix.push(`Mineral: full allowance`);
    }

    return {
      confidence: 0.85,
      prediction: mix,
      factors: ['Based on inventory levels and nutritional requirements'],
      recommendations: ['Monitor feed consumption daily', 'Adjust based on weight gain']
    };
  }

  static predictFeedNeeds(
    herdSize: number,
    days: number,
    currentConsumption: FeedConsumption[]
  ): PredictionResult<{
    projectedConsumption: number;
    reorderPoint: number;
    recommendedPurchase: number;
  }> {
    const avgDailyPerAnimal = currentConsumption.length > 0
      ? currentConsumption.reduce((sum, c) => sum + c.quantity, 0) / currentConsumption.length
      : 5;

    const projectedConsumption = avgDailyPerAnimal * herdSize * days;
    const reorderPoint = projectedConsumption * 0.7;
    const recommendedPurchase = projectedConsumption * 1.2;

    return {
      confidence: 0.9,
      prediction: {
        projectedConsumption,
        reorderPoint,
        recommendedPurchase
      },
      factors: [`Herd size: ${herdSize}`, `Daily average: ${avgDailyPerAnimal} units`],
      recommendations: [
        `Order ${recommendedPurchase.toFixed(0)} units ${days}-day supply`,
        `Reorder when inventory drops below ${reorderPoint.toFixed(0)} units`
      ]
    };
  }
}

export class ProfitabilityEngine {
  static calculateROAS(
    investment: number,
    annualReturn: number
  ): PredictionResult<number> {
    const returnOnAsset = investment > 0 ? annualReturn / investment : 0;
    
    return {
      confidence: 0.95,
      prediction: Math.round(returnOnAsset * 100) / 100,
      factors: ['Financial data provided'],
      recommendations: returnOnAsset > 1 
        ? ['Investment performing well'] 
        : ['Review ROI projections and implementation timeline']
    };
  }

  static projectBreakEven(
    fixedCosts: number,
    variableCostPerUnit: number,
    revenuePerUnit: number
  ): PredictionResult<{
    breakEvenUnits: number;
    marginPct: number;
  }> {
    const contributionMargin = revenuePerUnit - variableCostPerUnit;
    const breakEvenUnits = contributionMargin > 0 
      ? fixedCosts / contributionMargin 
      : Infinity;
    const marginPct = revenuePerUnit > 0 
      ? (contributionMargin / revenuePerUnit) * 100 
      : 0;

    return {
      confidence: 0.9,
      prediction: {
        breakEvenUnits: Math.ceil(breakEvenUnits),
        marginPct: Math.round(marginPct * 100) / 100
      },
      factors: ['Based on cost structure'],
      recommendations: [
        `Break-even at ${Math.ceil(breakEvenUnits)} units`,
        `Margin: ${marginPct.toFixed(1)}% per unit`
      ]
    };
  }
}

export class BreedingOptimizer {
  static calculateConceptionRate(
    animalId: string,
    services: number,
    conceptions: number
  ): PredictionResult<number> {
    const rate = services > 0 ? (conceptions / services) * 100 : 0;
    
    const factors = [];
    const recommendations = [];

    if (rate < 30) {
      factors.push('Low conception rate');
      recommendations.push('Evaluate bull fertility, heat detection timing');
    } else if (rate > 60) {
      factors.push('High conception rate');
      recommendations.push('Continue current breeding program');
    }

    return {
      confidence: 0.85,
      prediction: Math.round(rate * 100) / 100,
      factors,
      recommendations
    };
  }

  static predictCalvingInterval(
    lastCalvingDate: Date,
    currentDays: number
  ): PredictionResult<{
    expectedCalvingDate: Date;
    gestationLength: number;
    weaningDate: Date;
  }> {
    const gestationLength = 283;
    const weaningAge = 210;
    
    const expectedCalvingDate = new Date(lastCalvingDate.getTime() + gestationLength * 24 * 60 * 60 * 1000);
    const weaningDate = new Date(expectedCalvingDate.getTime() + weaningAge * 24 * 60 * 60 * 1000);

    return {
      confidence: 0.95,
      prediction: {
        expectedCalvingDate,
        gestationLength,
        weaningDate
      },
      factors: ['Standard gestation length applied'],
      recommendations: [
        'Monitor cow 21 days before expected calving',
        'Prepare calving pen 2 weeks prior'
      ]
    };
  }
}

export class AlertThresholdEngine {
  static checkHealthAlerts(animal: Animal): string[] {
    const alerts: string[] = [];

    if (animal.healthScore && animal.healthScore < 50) {
      alerts.push('CRITICAL: Health score below threshold');
    } else if (animal.healthScore && animal.healthScore < 70) {
      alerts.push('WARNING: Health score declining');
    }

    if (animal.bodyConditionScore && animal.bodyConditionScore < 2) {
      alerts.push('CRITICAL: Severe weight loss (BCS < 2)');
    } else if (animal.bodyConditionScore && animal.bodyConditionScore > 3.5) {
      alerts.push('WARNING: Overconditioned (BCS > 3.5)');
    }

    if (animal.daysInMilk && animal.daysInMilk > 305 && animal.gender === 'female' as const) {
      alerts.push('WARNING: Extended lactation period');
    }

    if (animal.currentWeight && animal.expectedWeight && animal.expectedWeight > 0 &&
        animal.currentWeight / animal.expectedWeight < 0.8) {
      alerts.push('WARNING: Significant growth deviation');
    }

    return alerts;
  }

  static checkProductionAlerts(animal: Animal): string[] {
    const alerts: string[] = [];

    if (animal.milkProductionToday !== undefined && animal.milkProductionToday < 10) {
      alerts.push('WARNING: Low milk production');
    }

    if (animal.daysInMilk && animal.daysInMilk > 305) {
      alerts.push('INFO: Cow approaching dry period');
    }

    return alerts;
  }
}