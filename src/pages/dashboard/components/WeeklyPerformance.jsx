import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const WeeklyPerformance = ({ performanceData }) => {
  const maxQuestions = Math.max(
    0,
    ...performanceData.map((d) => Number(d.questions) || 0)
  );

  const yAxisMax = maxQuestions === 0 ? 5 : Math.ceil(maxQuestions);

  return (
    <div
      className="glass-card"
      style={{ marginTop: "50px", height: "320px" }}
    >
      <h3 style={{ marginBottom: "20px" }}>
        Weekly Performance
      </h3>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={performanceData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />

          <XAxis dataKey="day" stroke="#a1a1aa" />

          <YAxis
            stroke="#a1a1aa"
            allowDecimals={false}
            domain={[0, yAxisMax]}
            ticks={Array.from({ length: yAxisMax + 1 }, (_, i) => i)}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e25",
              border: "none",
              borderRadius: "12px",
            }}
            formatter={(value) => `${value} questions`}
          />

          <Line
            type="linear"
            dataKey="questions"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyPerformance;