import { useEffect, useState } from "react";

const ActivityHeatmap = ({
  last28,
  loading,
  hoverInfo,
  setHoverInfo,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="glass-card heatmap-card">
        <h3 className="heatmap-title">
          Activity
        </h3>
        <div className="muted">
          Loading activity…
        </div>
      </div>
    );
  }

  const countsArr =
    Array.isArray(last28) && last28.length === 28
      ? last28.map((d) => Number(d.count) || 0)
      : new Array(28).fill(0);

  const max = Math.max(...countsArr, 1);

  const today = new Date().toDateString();

  const theme =
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") ||
        "light"
      : "light";

  const lightColors = [
    "#faf5ff",
    "#f3e8ff",
    "#e9d5ff",
    "#c4b5fd",
    "#7c3aed",
  ];

  const darkColors = [
    "#1f0f2e",
    "#2b123f",
    "#3b1b59",
    "#582a7a",
    "#9b6cf8",
  ];

  const palette =
    theme === "dark" ? darkColors : lightColors;

  const getColor = (n) => {
    if (!n) return palette[0];
    const step = Math.ceil(
      (n / max) * (palette.length - 1)
    );
    return palette[Math.min(palette.length - 1, step)];
  };

  const totalActivity = countsArr.reduce(
    (a, b) => a + b,
    0
  );

  return (
    <>
      <div className="glass-card heatmap-card">
        <div className="heatmap-header">
          <h3 className="heatmap-title">
            Activity (Last 4 Weeks)
          </h3>
          <p className="heatmap-subtitle">
            {totalActivity > 0
              ? `${totalActivity} total submissions`
              : "Start practicing to build your streak 🚀"}
          </p>
        </div>

        <div className="heatmap-wrapper">
          <div className="heatmap-grid">
            {countsArr.map((cnt, i) => {
              const dayObj = last28[i];
              const safeDate = dayObj?.date || null;
              const isToday =
                safeDate &&
                new Date(safeDate).toDateString() ===
                  today;

              return (
                <div
                  key={i}
                  className={`heatmap-tile ${
                    mounted ? "tile-visible" : ""
                  } ${
                    isToday ? "heatmap-today" : ""
                  }`}
                  style={{
                    background: getColor(cnt),
                    animationDelay: `${i * 20}ms`,
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${cnt} submissions`}
                  onMouseEnter={(e) =>
                    setHoverInfo({
                      index: i,
                      count: cnt,
                      date: safeDate,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseMove={(e) =>
                    setHoverInfo((prev) =>
                      prev
                        ? {
                            ...prev,
                            x: e.clientX,
                            y: e.clientY,
                          }
                        : null
                    )
                  }
                  onMouseLeave={() =>
                    setHoverInfo(null)
                  }
                  onFocus={(e) =>
                    setHoverInfo({
                      index: i,
                      count: cnt,
                      date: safeDate,
                      x:
                        e.target.getBoundingClientRect()
                          .left,
                      y:
                        e.target.getBoundingClientRect()
                          .top,
                    })
                  }
                  onBlur={() =>
                    setHoverInfo(null)
                  }
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="heatmap-legend">
            <span>Less</span>
            {palette.map((color, i) => (
              <div
                key={i}
                className="heatmap-legend-box"
                style={{ background: color }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {hoverInfo && (
        <div
          className="heatmap-tooltip heatmap-tooltip-visible"
          style={{
            left: hoverInfo.x + 12,
            top: hoverInfo.y + 12,
          }}
        >
          <strong>
            {hoverInfo.count}
          </strong>

          <div>
            {hoverInfo.count === 1
              ? "submission"
              : "submissions"}
          </div>

          {hoverInfo.date && (
            <div className="heatmap-tooltip-date">
              {new Date(
                hoverInfo.date
              ).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ActivityHeatmap;