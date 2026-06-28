import { useUIStore, type TabKey } from '../store/ui'

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
  {
    key: 'matrix',
    label: '四象限',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    key: 'list',
    label: '列表',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
  },
  {
    key: 'calendar',
    label: '日历',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    key: 'gantt',
    label: '甘特图',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 6h18M3 12h10M3 18h14" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: '我的',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
]

export function TabBar() {
  const active = useUIStore((s) => s.activeTab)
  const setActive = useUIStore((s) => s.setActiveTab)
  return (
    <nav className="gg-tabbar" role="tablist" aria-label="主导航">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`gg-tab ${active === t.key ? 'gg-tab-active' : ''}`}
          onClick={() => setActive(t.key)}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
