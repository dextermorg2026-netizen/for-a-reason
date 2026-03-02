const SubjectSearch = ({
    value,
    onChange,
    resultCount,
    totalCount,
  }) => {
    const hasQuery = value.trim().length > 0;
  
    return (
      <div className="subject-search">
  
        <div className="subject-search-row">
          <span
            className="subject-search-icon"
            aria-hidden="true"
          >
            🔍
          </span>
  
          <input
            type="search"
            placeholder="Search subjects..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="subject-search-input"
            aria-label="Search subjects"
          />
  
          {hasQuery && (
            <button
              type="button"
              className="subject-search-clear"
              onClick={() => onChange("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
  
        <div className="subject-search-meta">
          {hasQuery ? (
            resultCount === 0 ? (
              <span className="meta-empty">
                No matches found
              </span>
            ) : (
              <span>
                Showing{" "}
                <strong>{resultCount}</strong>{" "}
                result{resultCount === 1 ? "" : "s"}
              </span>
            )
          ) : totalCount !== undefined ? (
            <span>
              <strong>{totalCount}</strong>{" "}
              subject{totalCount === 1 ? "" : "s"} available
            </span>
          ) : null}
        </div>
      </div>
    );
  };
  
  export default SubjectSearch;