import { create } from 'zustand'

export type TabKey = 'matrix' | 'list' | 'calendar' | 'gantt' | 'profile'
export type MatrixSubTab = 'all' | 'today' | 'week'

interface UIState {
  activeTab: TabKey
  matrixSub: MatrixSubTab
  okrMgrOpen: boolean
  taskModalOpen: boolean
  setActiveTab: (t: TabKey) => void
  setMatrixSub: (m: MatrixSubTab) => void
  openOkrMgr: () => void
  closeOkrMgr: () => void
  openTaskModal: () => void
  closeTaskModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'matrix',
  matrixSub: 'all',
  okrMgrOpen: false,
  taskModalOpen: false,
  setActiveTab: (t) => set({ activeTab: t }),
  setMatrixSub: (m) => set({ matrixSub: m }),
  openOkrMgr: () => set({ okrMgrOpen: true }),
  closeOkrMgr: () => set({ okrMgrOpen: false }),
  openTaskModal: () => set({ taskModalOpen: true }),
  closeTaskModal: () => set({ taskModalOpen: false }),
}))
