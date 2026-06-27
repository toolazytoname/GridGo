export function CalendarView() {
  return (
    <div className="gg-view">
      <h2 className="gg-view-title">
        日历 <span className="gg-view-title-sub">·  月 / 周 / 日</span>
      </h2>
      <div className="gg-placeholder">
        <div className="gg-placeholder-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <div className="gg-placeholder-title">日历 Tab 占位</div>
        <div className="gg-placeholder-sub">对应 BACKLOG F-014，下一轮实现</div>
      </div>
    </div>
  )
}
