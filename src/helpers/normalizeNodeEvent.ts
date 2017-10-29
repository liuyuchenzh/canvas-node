/**
 * handle mousemove and mouseout of a node
 * mouseout from a node is just when mouse not moving over the node
 * given the fact that we can only gain knowledge of whether the mouse is over any node
 * so 'not over' is just when stop 'over'
 * in other words, we are detecting when the current over 'target' is not the node which mouse was just 'over'
 */
import { CanvasNode, Pos } from '../node'
import { getClickedNode } from './isClicked'
import { Cb } from './nativeToNodeEvent'

const NORMALIZE_LIST = ['mousemove', 'mouseout']
let target: null | CanvasNode

export type EventHandler = (e: Event) => any

export function shouldNormalizeEvent(type: string) {
  return NORMALIZE_LIST.includes(type)
}

export function normalizeEvent(type: string, cb: Cb): EventHandler {
  switch (type) {
    case 'mousemove':
      return generateMouseMoveHandler(cb)
    case 'mouseout':
      return generateMouseOutHandler(cb)
  }
}

export function normalizeEventType(type: string) {
  if (type === 'mouseout') return 'mousemove'
  return type
}

function generateMouseMoveHandler(cb: Cb): EventHandler {
  return function handler(e: MouseEvent) {
    const pos: Pos = {
      x: e.offsetX,
      y: e.offsetY
    }
    const node: CanvasNode = getClickedNode(pos)
    if (!node) return
    target = node
    cb(node)
  }
}

function generateMouseOutHandler(cb: Cb): EventHandler {
  return function handler(e: MouseEvent) {
    const pos: Pos = {
      x: e.offsetX,
      y: e.offsetY
    }
    const node: CanvasNode = getClickedNode(pos)
    if (node === target) return
    if (!target) return
    cb(target)
    target = null
  }
}
