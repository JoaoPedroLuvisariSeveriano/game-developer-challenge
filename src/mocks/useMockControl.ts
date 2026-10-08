import { useSyncExternalStore } from 'react'
import { mockControl, type MockControlState } from './control'

/** Subscribes a component to the mock control state (scenario, seed, latency override). */
export function useMockControl(): MockControlState {
  return useSyncExternalStore(mockControl.subscribe, mockControl.getState, mockControl.getState)
}
