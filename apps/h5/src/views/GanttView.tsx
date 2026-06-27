export function GanttView() {
  return (
    <div className="gg-view">
      <h2 className="gg-view-title">
        甘特图 <span className="gg-view-title-sub">·  本季度 / 全年</span>
      </h2>
      <div className="gg-placeholder">
        <div className="gg-placeholder-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h10M3 18h14" />
          </svg>
        </div>
        <div className="gg-placeholder-title">甘特图 Tab 占位</div>
        <div className="gg-placeholder-sub">对应 BACKLOG F-015，下一轮实现</div>
      </div>
    </div>
  )
}
