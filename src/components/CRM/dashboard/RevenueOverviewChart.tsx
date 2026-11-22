import React, { useState } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { DashboardRevenueOverview } from '../../../types/crm';

interface RevenueOverviewChartProps {
  overview?: DashboardRevenueOverview;
  onNavigateToFinancials?: () => void;
}

export const RevenueOverviewChart: React.FC<RevenueOverviewChartProps> = ({
  overview,
  onNavigateToFinancials
}) => {
  const [selectedRange, setSelectedRange] = useState('Last 6 Months');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const months = overview?.months || ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const receivedData = overview?.receivedData || [0, 0, 0, 0, 0, 0];
  const outstandingData = overview?.outstandingData || [0, 0, 0, 0, 0, 0];
  const totalReceived = overview?.totalReceived ?? 0;
  const totalOutstanding = overview?.totalOutstanding ?? 0;

  // Calculate dynamic scale for Y-axis
  const maxVal = Math.max(
    ...receivedData,
    ...outstandingData,
    totalReceived,
    totalOutstanding,
    600000 // default 6L scale matching reference image
  );

  // Y-axis steps: 6 intervals (e.g. 0, 1L, 2L, 3L, 4L, 5L, 6L)
  const step = Math.ceil(maxVal / 6 / 100000) * 100000;
  const yLabels = [step * 6, step * 5, step * 4, step * 3, step * 2, step, 0].map(val => {
    if (val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${Math.round(val / 100000)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  });

  // SVG Chart dimensions
  const width = 520;
  const height = 190;
  const paddingX = 42;
  const paddingY = 28;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const yMax = step * 6 || 1;

  const getPoints = (data: number[]) => {
    return data.map((val, idx) => {
      const x = paddingX + (idx / (months.length - 1 || 1)) * chartWidth;
      const y = paddingY + chartHeight - (val / yMax) * chartHeight;
      return { x, y, val };
    });
  };

  const receivedPoints = getPoints(receivedData);
  const outstandingPoints = getPoints(outstandingData);

  const makeSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const receivedLinePath = makeSmoothPath(receivedPoints);
  const outstandingLinePath = makeSmoothPath(outstandingPoints);

  // Gradient area path for received revenue
  const receivedAreaPath = receivedPoints.length > 0
    ? `${receivedLinePath} L ${receivedPoints[receivedPoints.length - 1].x} ${paddingY + chartHeight} L ${receivedPoints[0].x} ${paddingY + chartHeight} Z`
    : '';

  const lastReceived = receivedPoints[receivedPoints.length - 1] || { x: width - paddingX, y: height - paddingY };
  const lastOutstanding = outstandingPoints[outstandingPoints.length - 1] || { x: width - paddingX, y: height - paddingY };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Revenue Overview
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Received revenue vs. outstanding (last 6 months)
            </p>
          </div>
        </div>

        {/* Dropdown Range Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>{selectedRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-20 text-[11px] font-semibold">
              {['Last 6 Months', 'Last 30 Days', 'Current Year'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedRange(opt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer ${
                    selectedRange === opt ? 'text-indigo-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden my-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="receivedAreaGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 1, 2, 3, 4, 5, 6].map(idx => {
            const y = paddingY + (idx / 6) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                  strokeDasharray={idx === 6 ? 'none' : '3 3'}
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-semibold"
                >
                  {yLabels[idx]}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {receivedAreaPath && (
            <path d={receivedAreaPath} fill="url(#receivedAreaGradV2)" />
          )}

          {/* Outstanding Line (Emerald Green matching Approved Design) */}
          {outstandingLinePath && (
            <path
              d={outstandingLinePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Received Line (Purple/Indigo) */}
          {receivedLinePath && (
            <path
              d={receivedLinePath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Received Data Points */}
          {receivedPoints.map((pt, i) => (
            <circle
              key={`rec_${i}`}
              cx={pt.x}
              cy={pt.y}
              r={i === receivedPoints.length - 1 ? 5 : 3.5}
              fill="#8b5cf6"
              stroke="#ffffff"
              strokeWidth="2"
              className="drop-shadow-xs"
            />
          ))}

          {/* Outstanding Data Points */}
          {outstandingPoints.map((pt, i) => (
            <circle
              key={`out_${i}`}
              cx={pt.x}
              cy={pt.y}
              r={i === outstandingPoints.length - 1 ? 4.5 : 3}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="drop-shadow-xs"
            />
          ))}

          {/* Callout Bubble: Received Revenue (Top Purple Callout) */}
          {totalReceived > 0 && (
            <g transform={`translate(${Math.min(lastReceived.x - 38, width - 95)}, ${Math.max(lastReceived.y - 34, 8)})`}>
              <rect
                width="84"
                height="26"
                rx="8"
                fill="#4c1d95"
                className="drop-shadow-md"
              />
              <text
                x="42"
                y="12"
                textAnchor="middle"
                className="fill-white text-[10px] font-black"
              >
                ₹{totalReceived.toLocaleString('en-IN')}
              </text>
              <text
                x="42"
                y="21"
                textAnchor="middle"
                className="fill-purple-200 text-[8px] font-semibold"
              >
                Received Revenue
              </text>
            </g>
          )}

          {/* Callout Bubble: Outstanding Balance (Green Callout matching Approved Design) */}
          {totalOutstanding > 0 && (
            <g transform={`translate(${Math.min(lastOutstanding.x - 35, width - 85)}, ${Math.min(lastOutstanding.y + 10, height - 20)})`}>
              <rect
                width="74"
                height="24"
                rx="7"
                fill="#10b981"
                className="drop-shadow-md"
              />
              <text
                x="37"
                y="11"
                textAnchor="middle"
                className="fill-white text-[9.5px] font-black"
              >
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </text>
              <text
                x="37"
                y="19"
                textAnchor="middle"
                className="fill-emerald-100 text-[7.5px] font-bold"
              >
                Outstanding
              </text>
            </g>
          )}

          {/* X-Axis Month Labels */}
          {months.map((m, idx) => {
            const x = paddingX + (idx / (months.length - 1 || 1)) * chartWidth;
            return (
              <text
                key={m}
                x={x}
                y={height - 2}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 dark:fill-slate-500 font-semibold"
              >
                {m}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 3. Bottom Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-bold">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
          <span className="text-slate-700 dark:text-slate-300">Received Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-slate-700 dark:text-slate-300">Outstanding Balance</span>
        </div>
      </div>
    </div>
  );
};
