/**
 * Historical Price Data (3 Years: Jan 2024 – Feb 2026)
 * Realistic monthly average prices (₹) for all 18 commodities
 * 
 * Data is modeled with:
 * - Seasonal patterns (Kharif/Rabi/Zaid cycles)
 * - Monsoon effects (Jul-Sep volatility)
 * - Gradual inflation (~4-6% annual)
 * - Crop-specific harvest glut dips
 * - Festival demand spikes (Diwali Oct/Nov, Holi Mar)
 * 
 * Sources for base patterns: data.gov.in AGMARKNET, APEDA
 */

export interface MonthlyPrice {
    /** YYYY-MM format */
    month: string;
    /** Average price in ₹ per unit */
    avg: number;
    /** Min price in ₹ */
    min: number;
    /** Max price in ₹ */
    max: number;
}

export interface CommodityHistory {
    commodityId: string;
    unit: string;
    /** Monthly data points sorted chronologically */
    data: MonthlyPrice[];
}

// --- Helper to generate realistic seasonal price curves ---

function generateSeries(
    basePrice: number,
    /** Multipliers for each calendar month (Jan=0..Dec=11), representing seasonal pattern */
    seasonalFactors: number[],
    /** Annual inflation rate */
    annualInflation: number = 0.05,
    /** Random noise amplitude (0-1 scale) */
    noiseAmp: number = 0.06,
): MonthlyPrice[] {
    const data: MonthlyPrice[] = [];
    // Seed a deterministic pseudo-random from basePrice so data is stable across renders
    let seed = basePrice * 137;
    const pseudoRandom = () => {
        seed = (seed * 16807 + 12345) % 2147483647;
        return (seed % 10000) / 10000;
    };

    const now = new Date();
    // End historical data in the previous month (we predict from current month onwards)
    const endYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const endMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;

    // Give 2 years of historical data
    const startYear = endYear - 2;
    const startMonth = endMonth;
    for (let y = startYear; y <= endYear; y++) {
        const mEnd = y === endYear ? endMonth : 11;
        const mStart = y === startYear ? startMonth : 0;
        for (let m = mStart; m <= mEnd; m++) {
            const yearsElapsed = (y - startYear) + m / 12;
            const inflationMultiplier = Math.pow(1 + annualInflation, yearsElapsed);
            const seasonal = seasonalFactors[m];
            const noise = 1 + (pseudoRandom() - 0.5) * 2 * noiseAmp;

            const avg = Math.round(basePrice * seasonal * inflationMultiplier * noise);
            const spread = Math.max(3, Math.round(avg * 0.08));
            const min = avg - spread;
            const max = avg + spread;

            const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;
            data.push({ month: monthStr, avg, min, max });
        }
    }
    return data;
}

// --- Seasonal factor profiles for each commodity type ---

// Grains: cheaper post harvest (Nov-Jan for Kharif rice, Apr-May for Rabi wheat)
const RICE_SEASONAL = [0.95, 0.93, 0.96, 1.00, 1.04, 1.06, 1.08, 1.10, 1.08, 1.04, 0.98, 0.95];
const WHEAT_SEASONAL = [0.98, 0.96, 0.94, 0.92, 0.93, 0.97, 1.02, 1.06, 1.08, 1.06, 1.03, 1.00];

// Vegetables: highly volatile, monsoon spike, harvest glut dip
const TOMATO_SEASONAL = [0.85, 0.80, 0.90, 1.00, 1.20, 1.40, 1.60, 1.50, 1.30, 1.00, 0.85, 0.82];
const ONION_SEASONAL = [0.90, 0.88, 0.92, 1.00, 1.10, 1.15, 1.25, 1.35, 1.30, 1.10, 0.95, 0.90];
const POTATO_SEASONAL = [0.88, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.12, 1.08, 1.02, 0.95, 0.90];

// Fruits: seasonal availability
const MANGO_SEASONAL = [1.30, 1.20, 1.10, 0.85, 0.75, 0.70, 0.72, 0.80, 0.95, 1.10, 1.25, 1.35];
const BANANA_SEASONAL = [0.98, 0.96, 1.00, 1.02, 1.04, 1.02, 1.00, 0.98, 0.96, 0.98, 1.02, 1.00];
const APPLE_SEASONAL = [1.15, 1.20, 1.18, 1.10, 1.05, 1.00, 0.95, 0.85, 0.80, 0.82, 0.90, 1.05];

// Dairy & Poultry: relatively stable with slight winter demand
const MILK_SEASONAL = [1.02, 1.00, 0.98, 0.97, 0.98, 1.00, 1.02, 1.03, 1.04, 1.05, 1.04, 1.03];
const EGG_SEASONAL = [1.05, 1.02, 1.00, 0.98, 0.96, 0.95, 0.97, 0.98, 1.00, 1.02, 1.04, 1.06];
const CHICKEN_SEASONAL = [1.04, 1.02, 1.00, 0.98, 0.96, 0.95, 0.98, 1.00, 1.02, 1.03, 1.05, 1.06];

// Pulses: post-harvest dip in Feb-Mar (Rabi pulses)
const LENTIL_SEASONAL = [1.02, 0.98, 0.95, 0.93, 0.96, 1.00, 1.04, 1.06, 1.08, 1.06, 1.04, 1.03];

// Sugar: crushing season Oct-Mar = lower prices
const SUGAR_SEASONAL = [0.95, 0.94, 0.96, 0.98, 1.00, 1.02, 1.04, 1.06, 1.05, 1.00, 0.97, 0.95];

// Beverages: tea peaks in flush seasons
const TEA_SEASONAL = [0.98, 0.96, 1.00, 1.04, 1.06, 1.05, 1.02, 1.00, 0.98, 0.97, 0.98, 0.99];
const COFFEE_SEASONAL = [1.00, 0.98, 0.97, 0.96, 0.98, 1.00, 1.02, 1.03, 1.04, 1.03, 1.02, 1.01];

// Spices: post-harvest glut in Apr-May for turmeric, chili
const TURMERIC_SEASONAL = [1.02, 1.00, 0.98, 0.92, 0.90, 0.93, 0.98, 1.02, 1.05, 1.06, 1.05, 1.04];
const CHILI_SEASONAL = [1.04, 1.02, 0.98, 0.90, 0.88, 0.92, 0.98, 1.04, 1.08, 1.06, 1.05, 1.04];
const CORIANDER_SEASONAL = [1.00, 0.96, 0.94, 0.92, 0.95, 1.00, 1.06, 1.10, 1.08, 1.04, 1.02, 1.00];

// Garlic: harvested Feb-Mar (Rabi), prices low post-harvest, high before monsoon
const GARLIC_SEASONAL = [1.06, 1.02, 0.92, 0.88, 0.90, 0.96, 1.04, 1.10, 1.12, 1.08, 1.06, 1.05];

// Cauliflower: winter crop (Nov-Feb is peak supply = cheap), summer = scarce = expensive
const CAULIFLOWER_SEASONAL = [0.85, 0.82, 0.90, 1.05, 1.20, 1.35, 1.40, 1.30, 1.15, 0.98, 0.88, 0.84];

// Green Peas: Rabi crop available Dec-Mar, expensive in off-season
const GREENPEAS_SEASONAL = [0.88, 0.85, 0.90, 1.00, 1.15, 1.25, 1.30, 1.28, 1.20, 1.05, 0.92, 0.88];

// Mustard: harvested Mar-Apr (Rabi oilseed), stable demand
const MUSTARD_SEASONAL = [1.00, 0.98, 0.94, 0.90, 0.92, 0.96, 1.02, 1.05, 1.06, 1.04, 1.02, 1.01];

// Groundnut: Kharif harvest Oct-Nov, Rabi harvest Mar
const GROUNDNUT_SEASONAL = [0.98, 0.96, 0.94, 0.96, 1.00, 1.04, 1.06, 1.08, 1.06, 1.00, 0.96, 0.97];

// Coconut: fairly stable, slight seasonal variation
const COCONUT_SEASONAL = [0.98, 0.97, 0.98, 1.00, 1.02, 1.03, 1.04, 1.03, 1.02, 1.00, 0.99, 0.98];

// Jaggery: sugarcane crushing season Nov-Mar = lower prices
const JAGGERY_SEASONAL = [0.94, 0.92, 0.93, 0.96, 1.00, 1.04, 1.08, 1.10, 1.08, 1.04, 0.98, 0.95];

// Soybean: Kharif crop, harvested Oct-Nov
const SOYBEAN_SEASONAL = [1.02, 1.00, 0.98, 0.97, 0.98, 1.00, 1.04, 1.06, 1.05, 0.96, 0.94, 0.98];

// --- Generate all commodity histories ---

export const HISTORICAL_PRICES: CommodityHistory[] = [
    { commodityId: 'rice', unit: 'kg', data: generateSeries(50, RICE_SEASONAL, 0.04, 0.05) },
    { commodityId: 'wheat', unit: 'kg', data: generateSeries(30, WHEAT_SEASONAL, 0.04, 0.04) },
    { commodityId: 'tomato', unit: 'kg', data: generateSeries(40, TOMATO_SEASONAL, 0.05, 0.12) },
    { commodityId: 'onion', unit: 'kg', data: generateSeries(35, ONION_SEASONAL, 0.05, 0.10) },
    { commodityId: 'potato', unit: 'kg', data: generateSeries(25, POTATO_SEASONAL, 0.04, 0.06) },
    { commodityId: 'mango', unit: 'kg', data: generateSeries(80, MANGO_SEASONAL, 0.05, 0.08) },
    { commodityId: 'banana', unit: 'dozen', data: generateSeries(50, BANANA_SEASONAL, 0.04, 0.05) },
    { commodityId: 'apple', unit: 'kg', data: generateSeries(120, APPLE_SEASONAL, 0.05, 0.07) },
    { commodityId: 'milk', unit: 'liter', data: generateSeries(60, MILK_SEASONAL, 0.06, 0.03) },
    { commodityId: 'egg', unit: 'dozen', data: generateSeries(70, EGG_SEASONAL, 0.05, 0.05) },
    { commodityId: 'chicken', unit: 'kg', data: generateSeries(180, CHICKEN_SEASONAL, 0.05, 0.06) },
    { commodityId: 'lentil', unit: 'kg', data: generateSeries(100, LENTIL_SEASONAL, 0.04, 0.05) },
    { commodityId: 'sugar', unit: 'kg', data: generateSeries(45, SUGAR_SEASONAL, 0.04, 0.04) },
    { commodityId: 'tea', unit: 'kg', data: generateSeries(400, TEA_SEASONAL, 0.05, 0.05) },
    { commodityId: 'coffee', unit: 'kg', data: generateSeries(600, COFFEE_SEASONAL, 0.06, 0.05) },
    { commodityId: 'turmeric', unit: 'kg', data: generateSeries(150, TURMERIC_SEASONAL, 0.05, 0.06) },
    { commodityId: 'chili', unit: 'kg', data: generateSeries(200, CHILI_SEASONAL, 0.05, 0.07) },
    { commodityId: 'coriander', unit: 'kg', data: generateSeries(80, CORIANDER_SEASONAL, 0.04, 0.06) },
    { commodityId: 'garlic', unit: 'kg', data: generateSeries(120, GARLIC_SEASONAL, 0.05, 0.08) },
    { commodityId: 'cauliflower', unit: 'kg', data: generateSeries(30, CAULIFLOWER_SEASONAL, 0.04, 0.10) },
    { commodityId: 'greenpeas', unit: 'kg', data: generateSeries(60, GREENPEAS_SEASONAL, 0.04, 0.09) },
    { commodityId: 'mustard', unit: 'kg', data: generateSeries(70, MUSTARD_SEASONAL, 0.05, 0.05) },
    { commodityId: 'groundnut', unit: 'kg', data: generateSeries(90, GROUNDNUT_SEASONAL, 0.05, 0.05) },
    { commodityId: 'coconut', unit: 'piece', data: generateSeries(25, COCONUT_SEASONAL, 0.04, 0.04) },
    { commodityId: 'jaggery', unit: 'kg', data: generateSeries(55, JAGGERY_SEASONAL, 0.04, 0.05) },
    { commodityId: 'soybean', unit: 'kg', data: generateSeries(65, SOYBEAN_SEASONAL, 0.05, 0.06) },
];

/**
 * Get historical prices for a specific commodity
 */
export function getHistoricalPrices(commodityId: string): CommodityHistory | undefined {
    return HISTORICAL_PRICES.find(h => h.commodityId === commodityId);
}

/**
 * Get all available commodity IDs with history
 */
export function getAvailableCommodityIds(): string[] {
    return HISTORICAL_PRICES.map(h => h.commodityId);
}
