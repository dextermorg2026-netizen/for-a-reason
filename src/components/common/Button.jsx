const base =
  'inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150'

const variants = {
  primary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 border-sky-400',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-100 border-slate-700',
}

function Button({ variant = 'primary', children, ...props }) {
  const classes = `${base} ${variants[variant] ?? variants.primary}`
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button

