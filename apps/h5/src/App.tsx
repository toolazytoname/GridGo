import { useUIStore } from './store/ui'
import { Topbar } from './components/Topbar'
import { TabBar } from './components/TabBar'
import { MatrixView } from './views/MatrixView'
import { ListView } from './views/ListView'
import { CalendarView } from './views/CalendarView'
import { GanttView } from './views/GanttView'
import { ProfileView } from './views/ProfileView'

const VIEWS: Record<string, () => JSX.Element> = {
  matrix: MatrixView,
  list: ListView,
  calendar: CalendarView,
  gantt: GanttView,
  profile: ProfileView,
}

export function App() {
  const activeTab = useUIStore((s) => s.activeTab)
  const ActiveView = VIEWS[activeTab] ?? MatrixView

  return (
    <div className="gg-app">
      <Topbar />
      <main className="gg-main">
        <ActiveView />
      </main>
      <TabBar />
    </div>
  )
}
