
import React, { useState, useMemo } from 'react';
import { calculateStructuredFee, formatCurrency, FEE_CONFIG } from '../../utils/feeConfig';

interface FeeCalculatorProps {
    onClose: () => void;
}

const FeeCalculator: React.FC<FeeCalculatorProps> = ({ onClose }) => {
    const [days, setDays] = useState<number>(0);

    const calculation = useMemo(() => {
        const totalFine = calculateStructuredFee(days);
        const grossFee = days * FEE_CONFIG.DAILY_RATE;
        const savings = grossFee - totalFine;

        return {
            totalFine,
            grossFee,
            savings,
            isCapped: savings > 0
        };
    }, [days]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80] animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Fee Calculator</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Overdue Duration</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={days === 0 ? '' : days}
                                    onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                                    placeholder="Enter duration"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all text-lg font-medium"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
                            <p className="text-sm font-medium opacity-80 mb-1">Total Accumulated Fine</p>
                            <h3 className="text-4xl font-bold">{formatCurrency(calculation.totalFine)}</h3>

                            {calculation.isCapped && (
                                <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                                    <span className="text-lg">🎉</span>
                                    <p className="text-sm font-medium">
                                        You saved <span className="underline decoration-2 underline-offset-4">{formatCurrency(calculation.savings)}</span> with our capped structure!
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Weekly Cap</p>
                                <p className="text-lg font-bold text-slate-700">{formatCurrency(FEE_CONFIG.WEEKLY_CAP)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Monthly Cap</p>
                                <p className="text-lg font-bold text-slate-700">{formatCurrency(FEE_CONFIG.MONTHLY_CAP)}</p>
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 leading-relaxed italic">
                            * Our fee structure is designed to be student-friendly. Rates are ₹10/day, capped at ₹50/week and ₹150/month to prevent high debt.
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm"
                    >
                        Close Calculator
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeCalculator;
