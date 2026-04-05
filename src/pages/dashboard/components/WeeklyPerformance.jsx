import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest border border-outline-variant/30 px-3 py-2 rounded text-[10px] font-headline font-semibold text-on-surface shadow-xl">
        <span className="text-secondary">{payload[0].value}</span> OPS_LOGGED
      </div>
    );
  }
  return null;
};

const WeeklyPerformance = ({ performanceData = [] }) => {
  const defaultWeek = [
    { day: "Mon", questions: 0 },
    { day: "Tue", questions: 0 },
    { day: "Wed", questions: 0 },
    { day: "Thu", questions: 0 },
    { day: "Fri", questions: 0 },
    { day: "Sat", questions: 0 },
    { day: "Sun", questions: 0 },
  ];

  const displayData = performanceData.length === 7 ? performanceData : defaultWeek;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="font-headline text-lg font-semibold uppercase tracking-widest text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary drop-shadow-[0_0_5px_rgba(76,215,246,0.6)]">query_stats</span>
          Weekly Performance
        </h2>
        <span className="text-[10px] font-semibold text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-1 rounded">
          This Week
        </span>
      </div>
      <div className="flex-1 w-full relative -mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#ddb7ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(221,183,255,0.2)', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Space Grotesk', fontWeight: 'bold' }} 
              dy={10} 
            />
            <Area 
              type="monotone" 
              dataKey="questions" 
              stroke="#4cd7f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#neonGradient)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyPerformance;