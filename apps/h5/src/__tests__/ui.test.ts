import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../store/ui'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ activeTab: 'matrix', matrixSub: 'all' })
  })

  it('starts on matrix / all', () => {
    expect(useUIStore.getState().activeTab).toBe('matrix')
    expect(useUIStore.getState().matrixSub).toBe('all')
  })

  it('switches tabs and matrix sub', () => {
    useUIStore.getState().setActiveTab('calendar')
    expect(useUIStore.getState().activeTab).toBe('calendar')
    useUIStore.getState().setMatrixSub('today')
    expect(useUIStore.getState().matrixSub).toBe('today')
  })

  it('opens/closes okr mgr', () => {
    useUIStore.getState().openOkrMgr()
    expect(useUIStore.getState().okrMgrOpen).toBe(true)
    useUIStore.getState().closeOkrMgr()
    expect(useUIStore.getState().okrMgrOpen).toBe(false)
  })
})
