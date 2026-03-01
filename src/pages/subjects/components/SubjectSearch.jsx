const SubjectSearch = ({ value, onChange }) => {
    return (
      <div className="subject-search">
        <input
          type="text"
          placeholder="Search subjects..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="subject-search-input"
        />
      </div>
    );
  };
  
  export default SubjectSearch;