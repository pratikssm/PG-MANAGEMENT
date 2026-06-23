import { useSyncExternalStore } from 'react'
import { store, notify, type DB } from './store'

export function useStore(): DB {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.get(),
    () => store.get()
  )
}

export function updateDB(mutator: (db: DB) => DB) {
  store.set(mutator)
  notify()
}

export function resetDB() {
  store.reset()
  notify()
}
