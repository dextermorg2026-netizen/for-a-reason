function Loader() {
  return (
    <div className="center" style={{ padding: '2rem 0' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '999px',
          border: '3px solid rgba(148, 163, 184, 0.3)',
          borderTopColor: '#38bdf8',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}

export default Loader

