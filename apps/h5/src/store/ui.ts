import { create } from 'zustand'

export type TabKey = 'matrix' | 'list' | 'calendar' | 'gantt' | 'profile'
export type MatrixSubTab = 'all' | 'today' | 'week'

interface UIState {
  activeTab: TabKey
  matrixSub: MatrixSubTab
  okrMgrOpen: boolean
  taskModalOpen: boolean
  authOpen: boolean
  shareOpen: boolean
  shareKind: 'calendar' | 'gantt' | 'profile'
  setActiveTab: (t: TabKey) => void
  setMatrixSub: (m: MatrixSubTab) => void
  openOkrMgr: () => void
  closeOkrMgr: () => void
  openTaskModal: () => void
  closeTaskModal: () => void
  openAuth: () => void
  closeAuth: () => void
  openShare: (kind?: 'calendar' | 'gantt' | 'profile') => void
  closeShare: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'matrix',
  matrixSub: 'all',
  okrMgrOpen: false,
  taskModalOpen: false,
  authOpen: false,
  shareOpen: false,
  shareKind: 'calendar',
  setActiveTab: (t) => set({ activeTab: t }),
  setMatrixSub: (m) => set({ matrixSub: m }),
  openOkrMgr: () => set({ okrMgrOpen: true }),
  closeOkrMgr: () => set({ okrMgrOpen: false }),
  openTaskModal: () => set({ taskModalOpen: true }),
  closeTaskModal: () => set({ taskModalOpen: false }),
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  openShare: (kind) => set({ shareOpen: true, shareKind: kind ?? 'calendar' }),
  closeShare: () => set({ shareOpen: false }),
}))
