import React from 'react';
import { PieChart } from 'lucide-react';
import { DashboardPaymentsOverview } from '../../../types/crm';

interface PaymentsOverviewChartProps {
  overview?: DashboardPaymentsOverview;
  onNavigateToPayments?: () => void;
}

export const PaymentsOverviewChart: React.FC<PaymentsOverviewChartProps> = ({
  overview,
  onNavigateToPayments
}) => {
  const recRev = overview?.receivedRevenue ?? 0;
  const outBal = overview?.outstandingBalance ?? 0;
  const flPay = overview?.freelancerPayouts ?? 0;
  const totalVal = overview?.totalValue ?? (recRev + outBal + flPay);

  const recPct = totalVal > 0 ? (recRev / totalVal) * 100 : 0;
  const outPct = totalVal > 0 ? (outBal / totalVal) * 100 : 0;
  const flPct = totalVal > 0 ? (flPay / totalVal) * 100 : 0;

  // Donut SVG parameters
  const size = 135;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke-dasharray and stroke-dashoffset
  const recStroke = (recPct / 100) * circumference;
  const outStroke = (outPct / 100) * circumference;
  const flStroke = (flPct / 100) * circumference;

  const recOffset = 0;
  const outOffset = -recStroke;
  const flOffset = -(recStroke + outStroke);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <PieChart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Payments Overview
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Collections, dues, and payouts
            </p>
          </div>
        </div>
      </div>

      {/* 2. Donut Chart + Legend Side-by-Side */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
        {/* SVG Donut */}
        <div className="relative w-[135px] h-[135px] shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="rotate-[-90deg] overflow-visible"
          >
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth={strokeWidth}
            />

            {/* Received Revenue (Purple) */}
            {recStroke > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#7c3aed"
                strokeWidth={strokeWidth}
                strokeDasharray={`${recStroke} ${circumference}`}
                strokeDashoffset={recOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )}

            {/* Outstanding Balance (Emerald Green matching Approved Reference) */}
            {outStroke > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeDasharray={`${outStroke} ${circumference}`}
                strokeDashoffset={outOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )}

            {/* Freelancer Payouts (Sky Blue) */}
            {flStroke > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth={strokeWidth}
                strokeDasharray={`${flStroke} ${circumference}`}
                strokeDashoffset={flOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
              {totalVal > 0 ? `₹${totalVal.toLocaleString('en-IN')}` : '₹0'}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Total Value
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2 text-left w-full sm:w-auto">
          {/* Item 1: Received Revenue */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7c3aed] shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">
                Received Revenue
              </span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {recRev > 0 ? `₹${recRev.toLocaleString('en-IN')}` : '₹0'}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({recPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Item 2: Outstanding Balance */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">
                Outstanding Balance
              </span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {outBal > 0 ? `₹${outBal.toLocaleString('en-IN')}` : '₹0'}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({outPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Item 3: Freelancer Payouts */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">
                Freelancer Payouts
              </span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-900 dark:text-white">
                {flPay > 0 ? `₹${flPay.toLocaleString('en-IN')}` : '₹0'}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({flPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
