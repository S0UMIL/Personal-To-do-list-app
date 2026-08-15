import { registerPlugin } from '@capacitor/core'
import type { WidgetSnapshot } from './types'

export interface WidgetBridgePlugin {
  syncSnapshot(options: { snapshot: string }): Promise<void>
  requestWidgetUpdate(): Promise<void>
  getPendingWidgetRoute(): Promise<{ route?: string }>
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge', {
  web: {
    async syncSnapshot(): Promise<void> {
      /* no-op on web */
    },
    async requestWidgetUpdate(): Promise<void> {
      /* no-op on web */
    },
    async getPendingWidgetRoute(): Promise<{ route?: string }> {
      return {}
    },
  },
})

export async function syncWidgetSnapshotToNative(snapshot: WidgetSnapshot): Promise<void> {
  await WidgetBridge.syncSnapshot({ snapshot: JSON.stringify(snapshot) })
  await WidgetBridge.requestWidgetUpdate()
}

export { WidgetBridge }
