import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

const WeeklyPerformance = ({ performanceData = [] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const totalQuestions = useMemo(() => {
    return performanceData.reduce((sum, d) => sum + (Number(d?.questions) || 0), 0);
  }, [performanceData]);

  const bestDay = useMemo(() => {
    if (!performanceData.length) return null;
    return performanceData.reduce((prev, curr) =>
      Number(curr?.questions) > Number(prev?.questions) ? curr : prev
    );
  }, [performanceData]);

  const maxQuestions = Math.max(0, ...performanceData.map((d) => Number(d?.questions) || 0));
  const yAxisMax = maxQuestions === 0 ? 5 : Math.ceil(maxQuestions);
  const isEmpty = totalQuestions === 0;

  return (
    <>
      <style>
        {`
          .weekly-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            font-family: 'Inter', sans-serif;
            height: 100%;
          }
          .weekly-header { margin-bottom: 20px; }
          .weekly-title { margin: 0; font-size: 1rem; color: #2d3436; font-weight: 700; }
          .weekly-subtitle { margin: 4px 0 0 0; font-size: 0.75rem; color: #636e72; }
          .weekly-empty { 
            height: 200px; display: flex; align-items: center; 
            justify-content: center; text-align: center; color: #b2bec3; font-size: 0.8rem;
          }
          /* Custom Tooltip Styling */
          .custom-tooltip {
            background: #2d3436;
            color: white;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 0.75rem;
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
          }
        `}
      </style>

      <div className="glass-card weekly-card">
        <div className="weekly-header">
          <h3 className="weekly-title">Weekly Performance</h3>
          <p className="weekly-subtitle">
            {isEmpty ? "Start practicing to see growth 📈" : `Best: ${bestDay?.day} (${bestDay?.questions} qns)`}
          </p>
        </div>

        {isEmpty ? (
          <div className="weekly-empty">No activity this week.</div>
        ) : (
          // Inside WeeklyPerformance.js
<ResponsiveContainer width="100%" height={220}>
  <style>{`
    .weekly-card {
       color: var(--text-primary);
    }
    /* This ensures axis text is visible in both modes */
    .recharts-cartesian-axis-tick text {
      fill: var(--text-muted) !important;
      font-size: 11px;
    }
  `}</style>
  <LineChart 
    data={performanceData} 
    /* Increased left margin to 20 so 'Mon' isn't cut off */
    margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
    <XAxis 
      dataKey="day" 
      axisLine={false} 
      tickLine={false} 
      dy={10}
    />
    <YAxis hide={true} domain={[0, yAxisMax + 2]} />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: 'var(--bg-glass)', 
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        color: 'var(--text-primary)' 
      }} 
    />
    <Line
      type="linear"
      dataKey="questions"
      stroke="#6c5ce7"
      strokeWidth={3}
      dot={{ r: 4, fill: "#6c5ce7", strokeWidth: 2, stroke: "#fff" }}
      activeDot={{ r: 6, strokeWidth: 0 }}
    />
  </LineChart>
</ResponsiveContainer>
        )}
      </div>
    </>
  );
};

export default WeeklyPerformance;