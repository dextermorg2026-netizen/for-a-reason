const SubjectSearch = ({
  value,
  onChange,
  resultCount,
  totalCount,
}) => {
  const hasQuery = value.trim().length > 0;

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-slate-500 text-sm group-focus-within:text-secondary transition-colors">search</span>
      </div>
      
      <input
        type="text"
        placeholder="SEARCH_SECTOR..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#131313] border border-white/10 rounded px-12 py-3 font-headline text-xs font-semibold text-on-surface placeholder:text-slate-700 uppercase tracking-widest focus:outline-none focus:border-secondary transition-all"
      />

      {hasQuery && (
        <button
          type="button"
          className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-on-surface"
          onClick={() => onChange("")}
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}

      <div className="absolute -bottom-6 right-0">
        <p className="font-headline text-[8px] font-semibold text-slate-600 uppercase tracking-[0.2em]">
          {hasQuery ? (
            `QUERY_MATCHES: ${resultCount}`
          ) : (
            `TOTAL_ENTRIES: ${totalCount}`
          )}
        </p>
      </div>
    </div>
  );
};

export default SubjectSearch;