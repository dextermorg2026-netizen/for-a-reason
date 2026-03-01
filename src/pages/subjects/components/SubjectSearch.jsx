const SubjectSearch = ({ value, onChange, resultCount, totalCount }) => {
  const hasQuery = value.trim().length > 0;
  const showClear = hasQuery;

  return (
    <div className="subject-search">
      <div className="subject-search-row">
        <span className="subject-search-icon" aria-hidden="true">
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
        {showClear && (
          <button
            type="button"
            className="subject-search-clear"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>
      {(totalCount !== undefined || (hasQuery && resultCount !== undefined)) && (
        <p className="subject-search-meta">
          {hasQuery
            ? resultCount === 0
              ? "No subjects match your search."
              : `Showing ${resultCount} subject${resultCount === 1 ? "" : "s"}`
            : totalCount !== undefined
            ? `${totalCount} subject${totalCount === 1 ? "" : "s"}`
            : null}
        </p>
      )}
    </div>
  );
};

export default SubjectSearch;
