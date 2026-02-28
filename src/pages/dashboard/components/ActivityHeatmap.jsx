const ActivityHeatmap = ({
  last28,
  loading,
  hoverInfo,
  setHoverInfo,
}) => {
  if (loading) {
    return (
      <div className="glass-card heatmap-card">
        <h3 className="heatmap-title">
          Activity Heatmap (28 days)
        </h3>
        <div className="muted">Loading activity…</div>
      </div>
    );
  }

  const countsArr =
    Array.isArray(last28) && last28.length === 28
      ? last28.map((d) => Number(d.count) || 0)
      : new Array(28).fill(0);

  const max = Math.max(...countsArr, 1);

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

  return (
    <>
      <div className="glass-card heatmap-card">
        <h3 className="heatmap-title">
          Activity Heatmap (28 days)
        </h3>

        <div className="heatmap-wrapper">
          <div className="heatmap-grid">
            {countsArr.map((cnt, i) => {
              const dayObj = last28[i];
              const safeDate = dayObj?.date || null;

              return (
                <div
                  key={i}
                  className="heatmap-tile"
                  style={{
                    background: getColor(cnt),
                  }}
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
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip OUTSIDE glass-card to prevent clipping */}
      {hoverInfo && (
        <div
          className="heatmap-tooltip"
          style={{
            left: hoverInfo.x + 12,
            top: hoverInfo.y + 12,
          }}
        >
          <strong className="heatmap-tooltip-count">
            {hoverInfo.count}
          </strong>

          <div className="heatmap-tooltip-text">
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