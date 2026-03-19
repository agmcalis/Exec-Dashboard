import premierLogo from '../../assets/premier-logo.svg'

// Premier-branded top bar
export default function TopBar() {
  return (
    <header className="h-14 flex items-center px-6 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-3">
        {/* Premier animated logo mark */}
        <img src={premierLogo} alt="Premier" className="w-9 h-9 shrink-0" />
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-white tracking-tight leading-none">
            Quality Intelligence
          </span>
          <span className="hidden sm:inline text-[11px] text-premier-light/60 font-medium">
            by Premier
          </span>
        </div>
      </div>
    </header>
  )
}
