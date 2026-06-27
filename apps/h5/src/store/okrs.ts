import { create } from 'zustand'
import { SEED_OKRS, SEED_KRS, SEED_SUBTASKS, quadrantTag } from './tree'
import type { Okr, KeyResult, SubTask, OkrCategory } from '@gridgo/types'

interface OkrState {
  okrs: Okr[]
  krs: KeyResult[]
  subTasks: SubTask[]
  toggleKr: (id: string) => void
  toggleSub: (id: string) => void
}

export const useOkrStore = create<OkrState>((set) => ({
  okrs: SEED_OKRS as Okr[],
  krs: SEED_KRS,
  subTasks: SEED_SUBTASKS,

  toggleKr: (id) =>
    set((s) => ({
      krs: s.krs.map((k) =>
        k.id === id ? { ...k, done: !k.done, progress: !k.done ? 1 : k.progress } : k,
      ),
    })),

  toggleSub: (id) =>
    set((s) => ({
      subTasks: s.subTasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
    })),
}))

export { quadrantTag }

export const okrColorClass: Record<OkrCategory, string> = {
  product: 'o1',
  health: 'o2',
  skill: 'o3',
  finance: 'o4',
}
