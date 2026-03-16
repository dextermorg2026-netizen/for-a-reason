import { useEffect, useState } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ActivityHeatmap = ({ last28 = [], loading }) => {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use last28 as the activity data, fallback to zeros
  const countsArr = Array.isArray(last28) && last28.length === 28
    ? last28.map(d => typeof d === 'object' && d !== null ? d.count : d)
    : Array(28).fill(0);

  // Find max for color scaling
  const max = Math.max(...countsArr, 1);
  // Color scale: from light to dark purple
  function getColor(count) {
    if (max === 0) return "#ede9fe"; // fallback color
    // Interpolate between two purples based on count
    const base = 124; // 7c3aed
    const intensity = Math.round(58 + (199 - 58) * (count / max));
    return `rgba(${base}, ${intensity}, 237, ${0.2 + 0.8 * (count / max)})`;
  }

  // Tooltip position and content
  function handleMouseEnter(e, cnt, i) {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      count: cnt,
      day: days[i % 7],
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  }
  function handleMouseLeave() {
    setTooltip(null);
  }
  // For mobile: show tooltip on tap
  function handleTileClick(e, cnt, i) {
    if (window.innerWidth <= 768) {
      if (tooltip && tooltip.day === days[i % 7] && tooltip.count === cnt) {
        setTooltip(null);
      } else {
        handleMouseEnter(e, cnt, i);
      }
    }
  }

  const styles = (
    <style>
      {`
        .heatmap-card {
          background: var(--bg-surface);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-lg);
          padding: 16px;
          border: 1px solid var(--glass-border);
          max-width: 340px;
          width: 100%;
          height: fit-content;
          transition: transform 0.25s ease;
        }
        .heatmap-title {
          margin: 0 0 12px 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          width: 100%;
        }
        .heatmap-tile {
          aspect-ratio: 1 / 1;
          width: 100%;
          border-radius: 3px;
          cursor: pointer;
          background: var(--bg-elevated);
          transition: transform 0.2s ease;
          min-width: 0;
        }
        .heatmap-tile:hover {
          transform: scale(1.2);
          z-index: 5;
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 4px;
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-top: 10px;
        }
        .heatmap-legend-box {
          width: 8px;
          height: 8px;
          border-radius: 1px;
        }
        .heatmap-tooltip {
          position: fixed;
          background: #fff;
          color: #222;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          padding: 6px 12px;
          font-size: 0.85rem;
          pointer-events: none;
          z-index: 9999;
          white-space: nowrap;
        }
        [data-theme='dark'] .heatmap-tooltip {
          background: #23223a;
          color: #fff;
        }
        @media (max-width: 600px) {
          .heatmap-card { max-width: 100%; }
        }
      `}
    </style>
  );

  return (
    <>
      {styles}
      <div className="glass-card heatmap-card">
        <h3 className="heatmap-title">Activity</h3>
        <div className="heatmap-grid">
          {countsArr.map((cnt, i) => (
            <div
              key={i}
              className="heatmap-tile"
              style={{
                background: getColor(cnt),
                opacity: mounted ? 1 : 0,
                minHeight: window.innerWidth <= 600 ? 24 : undefined
              }}
              onMouseEnter={e => handleMouseEnter(e, cnt, i)}
              onMouseLeave={handleMouseLeave}
              onClick={e => handleTileClick(e, cnt, i)}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
            <div key={i} className="heatmap-legend-box" style={{ background: `rgba(124, 58, 237, ${op})` }} />
          ))}
          <span>More</span>
        </div>
        {tooltip && (
          <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <strong>{tooltip.day}</strong>: {tooltip.count} activity
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityHeatmap;