/**
 * vue-virtual-scroller 类型声明
 */

declare module 'vue-virtual-scroller' {
  import { DefineComponent, Plugin } from 'vue'

  export interface RecycleScrollerProps {
    items: any[]
    itemSize?: number | null
    minItemSize?: number | string | null
    sizeField?: string
    typeField?: string
    keyField?: string
    pageMode?: boolean
    prerender?: number
    buffer?: number
    emitUpdate?: boolean
    updateInterval?: number
    direction?: 'vertical' | 'horizontal'
    listTag?: string
    itemTag?: string
    listClass?: string | object | any[]
    itemClass?: string | object | any[]
  }

  export interface DynamicScrollerProps extends RecycleScrollerProps {
    minItemSize: number | string
  }

  export interface DynamicScrollerItemProps {
    item: any
    active: boolean
    sizeDependencies?: any[]
    watchData?: boolean
    tag?: string
    emitResize?: boolean
  }

  export const RecycleScroller: DefineComponent<RecycleScrollerProps>
  export const DynamicScroller: DefineComponent<DynamicScrollerProps>
  export const DynamicScrollerItem: DefineComponent<DynamicScrollerItemProps>

  const plugin: Plugin
  export default plugin
}