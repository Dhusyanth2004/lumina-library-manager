
export const FEE_CONFIG = {
    DAILY_RATE: 10,
    WEEKLY_CAP: 50,
    MONTHLY_CAP: 150,
    CURRENCY: '₹',
};

/**
 * Calculates the fine based on a structured fee system.
 * - Daily Rate: ₹10
 * - Weekly Cap: ₹50
 * - Monthly Cap: ₹150
 * 
 * Formula:
 * - Total Months = floor(totalDays / 30)
 * - Remaining Days after Months = totalDays % 30
 * - In those remaining days:
 *   - Total Weeks = floor(remainingDays / 7)
 *   - Remaining Days after Weeks = remainingDays % 7
 * 
 * Total Fine = (Months * MonthlyCap) + min(MonthlyCap, (Weeks * WeeklyCap) + min(WeeklyCap, RemainingDays * DailyRate))
 */
export const calculateStructuredFee = (totalDays: number): number => {
    if (totalDays <= 0) return 0;

    const months = Math.floor(totalDays / 30);
    const daysAfterMonths = totalDays % 30;

    const weeksInMonth = Math.floor(daysAfterMonths / 7);
    const finalDays = daysAfterMonths % 7;

    const weeklyFee = (weeksInMonth * FEE_CONFIG.WEEKLY_CAP) + Math.min(FEE_CONFIG.WEEKLY_CAP, finalDays * FEE_CONFIG.DAILY_RATE);
    const monthRemainderFee = Math.min(FEE_CONFIG.MONTHLY_CAP, weeklyFee);

    return (months * FEE_CONFIG.MONTHLY_CAP) + monthRemainderFee;
};

export const formatCurrency = (amount: number): string => {
    return `${FEE_CONFIG.CURRENCY}${amount.toLocaleString('en-IN')}`;
};
