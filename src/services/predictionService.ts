/**
 * Price Prediction Service
 * Uses historical data + simple statistical models to generate forecasts
 * 
 * Algorithms:
 * 1. Weighted Moving Average (WMA) for short-term
 * 2. Seasonal decomposition for medium-term
 * 3. Linear regression for long-term trend
 * 
 * All predictions are LOCAL computation — no external API needed.
 */

import { getHistoricalPrices, MonthlyPrice } from '../data/historicalPrices';

export interface PriceForecast {
    month: string;
    predicted: number;
    lower: number;
    upper: number;
}

export interface PredictionResult {
    commodityId: string;
    /** Historical data used */
    historical: MonthlyPrice[];
    /** Future predictions (next 6 months) */
    forecast: PriceForecast[];
    /** Trend: annual % change */
    annualTrendPercent: number;
    /** Best month to buy (lowest avg historical price) */
    bestBuyMonth: number;
    /** Best month to sell (highest avg historical price) */
    bestSellMonth: number;
    /** Year-over-Year change */
    yoyChangePercent: number;
    /** Seasonal volatility score 0-100 */
    volatilityScore: number;
    /** Model confidence (0-100%) */
    confidence: number;
}

// Month names for display
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Compute Weighted Moving Average (used internally by seasonal decomposition)
 * @internal
 */
export function weightedMovingAvg(values: number[], weights?: number[]): number {
    const n = values.length;
    if (n === 0) return 0;
    const w = weights || values.map((_, i) => i + 1); // linearly increasing weights
    const totalW = w.reduce((a, b) => a + b, 0);
    return values.reduce((sum, v, i) => sum + v * w[i], 0) / totalW;
}

/**
 * Simple linear regression: returns [slope, intercept]
 */
function linearRegression(ys: number[]): [number, number] {
    const n = ys.length;
    if (n < 2) return [0, ys[0] || 0];
    const xs = ys.map((_, i) => i);
    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - xMean) * (ys[i] - yMean);
        den += (xs[i] - xMean) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = yMean - slope * xMean;
    return [slope, intercept];
}

/**
 * Compute seasonal indices (average multiplier per calendar month)
 */
function computeSeasonalIndices(history: MonthlyPrice[]): number[] {
    const monthSums = new Array(12).fill(0);
    const monthCounts = new Array(12).fill(0);
    const overallAvg = history.reduce((s, d) => s + d.avg, 0) / history.length;

    for (const d of history) {
        const m = parseInt(d.month.split('-')[1]) - 1;
        monthSums[m] += d.avg / overallAvg;
        monthCounts[m] += 1;
    }

    return monthSums.map((s, i) => monthCounts[i] > 0 ? s / monthCounts[i] : 1);
}

/**
 * Calculate volatility score (0-100) based on coefficient of variation
 */
function calcVolatility(history: MonthlyPrice[]): number {
    const prices = history.map(d => d.avg);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / prices.length;
    const cv = Math.sqrt(variance) / mean; // coefficient of variation
    // Map cv to 0-100 score (cv of 0.05=low(10), 0.20=high(80))
    return Math.min(100, Math.max(0, Math.round(cv * 400)));
}

/**
 * Generate prediction for a commodity
 */
export function generatePrediction(commodityId: string): PredictionResult | null {
    const history = getHistoricalPrices(commodityId);
    if (!history || history.data.length < 6) return null;

    const data = history.data;
    const prices = data.map(d => d.avg);

    // 1. Linear trend
    const [slope, intercept] = linearRegression(prices);
    const n = prices.length;

    // 2. Seasonal indices
    const seasonal = computeSeasonalIndices(data);

    // 3. Forecast next 6 months
    const lastMonth = data[data.length - 1].month;
    const [lastY, lastM] = lastMonth.split('-').map(Number);
    const forecast: PriceForecast[] = [];

    for (let i = 1; i <= 6; i++) {
        let fm = lastM + i;
        let fy = lastY;
        while (fm > 12) { fm -= 12; fy++; }

        const trendValue = intercept + slope * (n - 1 + i);
        const seasonalMultiplier = seasonal[fm - 1];
        const predicted = Math.round(trendValue * seasonalMultiplier);

        // Confidence interval widens with distance
        const uncertainty = 0.05 + 0.02 * i;
        const lower = Math.round(predicted * (1 - uncertainty));
        const upper = Math.round(predicted * (1 + uncertainty));

        forecast.push({
            month: `${fy}-${String(fm).padStart(2, '0')}`,
            predicted,
            lower,
            upper,
        });
    }

    // 4. Annual trend %
    const firstYearAvg = prices.slice(0, 12).reduce((a, b) => a + b, 0) / Math.min(12, prices.length);
    const lastYearPrices = prices.slice(-12);
    const lastYearAvg = lastYearPrices.reduce((a, b) => a + b, 0) / lastYearPrices.length;
    const annualTrendPercent = Math.round(((lastYearAvg - firstYearAvg) / firstYearAvg) * 100);

    // 5. Best buy/sell months
    const seasonalWithIndex = seasonal.map((s, i) => ({ s, i }));
    const bestBuyMonth = seasonalWithIndex.sort((a, b) => a.s - b.s)[0].i;
    const bestSellMonth = seasonalWithIndex.sort((a, b) => b.s - a.s)[0].i;

    // 6. YoY change (last 12 months vs prior 12 months)
    let yoyChangePercent = 0;
    if (prices.length >= 24) {
        const prior12 = prices.slice(-24, -12);
        const last12 = prices.slice(-12);
        const priorAvg = prior12.reduce((a, b) => a + b, 0) / 12;
        const lastAvg = last12.reduce((a, b) => a + b, 0) / 12;
        yoyChangePercent = Math.round(((lastAvg - priorAvg) / priorAvg) * 100);
    }

    // 7. Volatility
    const volatilityScore = calcVolatility(data);

    // 8. Confidence based on data quantity and volatility
    const dataConfidence = Math.min(100, Math.round(data.length / 26 * 100));
    const stabilityBonus = Math.max(0, 50 - volatilityScore / 2);
    const confidence = Math.min(95, Math.max(40, Math.round(dataConfidence * 0.6 + stabilityBonus)));

    return {
        commodityId,
        historical: data,
        forecast,
        annualTrendPercent,
        bestBuyMonth,
        bestSellMonth,
        yoyChangePercent,
        volatilityScore,
        confidence,
    };
}

/**
 * Get month name from 0-indexed month number
 */
export function getMonthName(monthIndex: number): string {
    return MONTH_NAMES[monthIndex] || '';
}

/**
 * Format month string (YYYY-MM) to readable short form
 */
export function formatMonthLabel(monthStr: string): string {
    const [y, m] = monthStr.split('-').map(Number);
    return `${MONTH_NAMES[m - 1]} ${y % 100}`;
}
