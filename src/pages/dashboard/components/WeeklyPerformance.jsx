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

const WeeklyPerformance = ({ performanceData }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const totalQuestions = useMemo(() => {
    return performanceData.reduce(
      (sum, d) => sum + (Number(d.questions) || 0),
      0
    );
  }, [performanceData]);

  const bestDay = useMemo(() => {
    if (!performanceData.length) return null;
    return performanceData.reduce((prev, curr) =>
      curr.questions > prev.questions ? curr : prev
    );
  }, [performanceData]);

  const maxQuestions = Math.max(
    0,
    ...performanceData.map((d) => Number(d.questions) || 0)
  );

  const yAxisMax =
    maxQuestions === 0 ? 5 : Math.ceil(maxQuestions);

  const isEmpty = totalQuestions === 0;

  return (
    <div className="glass-card weekly-card">
      <div className="weekly-header">
        <h3 className="weekly-title">
          Weekly Performance
        </h3>

        <p className="weekly-subtitle">
          {isEmpty
            ? "Start practicing to see your growth 📈"
            : `Best day: ${bestDay.day} (${bestDay.questions} questions)`}
        </p>
      </div>

      {isEmpty ? (
        <div className="weekly-empty">
          No activity this week yet.
          <br />
          Complete a quiz to get started 🚀
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={performanceData}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#a1a1aa"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#a1a1aa"
              allowDecimals={false}
              domain={[0, yAxisMax]}
              ticks={Array.from(
                { length: yAxisMax + 1 },
                (_, i) => i
              )}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "none",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.4)",
              }}
              formatter={(value) =>
                `${value} questions`
              }
            />

            <Line
              type="monotone"
              dataKey="questions"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={({ payload }) => ({
                r:
                  payload.questions ===
                  bestDay?.questions
                    ? 6
                    : 4,
              })}
              activeDot={{
                r: 7,
                strokeWidth: 2,
              }}
              isAnimationActive={mounted}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeeklyPerformance;