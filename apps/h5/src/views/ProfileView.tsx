export function ProfileView() {
  return (
    <div className="gg-view">
      <div className="gg-me-profile">
        <div className="gg-me-avatar">林</div>
        <div className="gg-me-id">
          <div className="gg-me-name-row">
            <span className="gg-me-name">林小白</span>
            <span className="gg-me-badge">PRO</span>
          </div>
          <div className="gg-me-role">独立 iOS 工程师 · 在职</div>
          <div className="gg-me-bio">用一格一事的方式推进 OKR，把目标拆成可执行的格子。</div>
        </div>
        <button type="button" className="gg-me-edit">编辑资料</button>
      </div>

      <div className="gg-me-stats">
        <div className="gg-me-stat">
          <div className="gg-me-stat-num">24</div>
          <div className="gg-me-stat-label">已完成</div>
        </div>
        <div className="gg-me-stat-sep" />
        <div className="gg-me-stat">
          <div className="gg-me-stat-num">86h</div>
          <div className="gg-me-stat-label">专注时长</div>
        </div>
        <div className="gg-me-stat-sep" />
        <div className="gg-me-stat">
          <div className="gg-me-stat-num">12</div>
          <div className="gg-me-stat-label">连胜天数</div>
        </div>
      </div>

      <div className="gg-me-footer">格行 GridGo · v0.1.0 · 一格一事，循格而行</div>
    </div>
  )
}
