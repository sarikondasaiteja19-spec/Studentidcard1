import React from 'react';

interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

export const DonutChart: React.FC<{
  data: Record<string, number>;
  total: number;
}> = ({ data, total }) => {
  const segments: DonutSegment[] = [
    { label: 'CSE', count: data.CSE || 68, color: '#2563eb' },
    { label: 'ECE', count: data.ECE || 52, color: '#10b981' },
    { label: 'EEE', count: data.EEE || 42, color: '#f59e0b' },
    { label: 'MECH', count: data.MECH || 38, color: '#06b6d4' },
    { label: 'CIVIL', count: data.CIVIL || 28, color: '#8b5cf6' },
    { label: 'OTHER', count: data.OTHER || 20, color: '#64748b' },
  ];

  const effectiveTotal = total > 0 ? total : 248;

  // SVG parameters
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* SVG Ring */}
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, idx) => {
            const percent = (seg.count / effectiveTotal);
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-slate-800">{effectiveTotal}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 w-full text-xs">
        {segments.map((seg) => {
          const pct = ((seg.count / effectiveTotal) * 100).toFixed(1);
          return (
            <div key={seg.label} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="font-semibold text-slate-700">{seg.label}</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                <strong className="text-slate-800">{seg.count}</strong> ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BarChart: React.FC<{
  data: Record<string, number>;
}> = ({ data }) => {
  const bars = [
    { label: '1st Year', value: data['1st Year'] || 66, color: 'from-blue-500 to-blue-600' },
    { label: '2nd Year', value: data['2nd Year'] || 58, color: 'from-cyan-500 to-teal-500' },
    { label: '3rd Year', value: data['3rd Year'] || 62, color: 'from-indigo-500 to-purple-600' },
    { label: '4th Year', value: data['4th Year'] || 42, color: 'from-blue-600 to-indigo-700' },
  ];

  const maxValue = Math.max(...bars.map(b => b.value), 80);

  return (
    <div className="h-44 w-full flex items-end justify-between gap-4 pt-6 pb-2 px-4">
      {bars.map((bar) => {
        const heightPercent = (bar.value / maxValue) * 100;
        return (
          <div key={bar.label} className="flex-1 flex flex-col items-center h-full justify-end group">
            <span className="text-[11px] font-bold text-slate-700 mb-1.5 opacity-90 group-hover:scale-110 transition-transform">
              {bar.value}
            </span>
            <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg h-full max-h-[110px] flex items-end overflow-hidden p-0.5">
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-md bg-gradient-to-t ${bar.color} transition-all duration-700 group-hover:brightness-110 shadow-sm`}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
