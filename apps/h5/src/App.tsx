import { useEffect } from 'react'
import { useUIStore } from './store/ui'
import { useTasksStore } from './store/tasks'
import { Topbar } from './components/Topbar'
import { TabBar } from './components/TabBar'
import { MatrixView } from './views/MatrixView'
import { ListView } from './views/ListView'
import { CalendarView } from './views/CalendarView'
import { GanttView } from './views/GanttView'
import { ProfileView } from './views/ProfileView'
import { OkrManager } from './modals/OkrManager'
import { TaskModal } from './modals/TaskModal'
import { AuthModal } from './modals/AuthModal'

const VIEWS: Record<string, () => JSX.Element> = {
  matrix: MatrixView,
  list: ListView,
  calendar: CalendarView,
  gantt: GanttView,
  profile: ProfileView,
}

export function App() {
  const activeTab = useUIStore((s) => s.activeTab)
  const init = useTasksStore((s) => s.init)
  const ActiveView = VIEWS[activeTab] ?? MatrixView

  useEffect(() => {
    init()
  }, [init])

  return (
    <div className="gg-app">
      <Topbar />
      <main className="gg-main">
        <ActiveView />
      </main>
      <TabBar />
      <OkrManager />
      <TaskModal />
      <AuthModal />
    </div>
  )
}
