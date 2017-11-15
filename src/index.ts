import { Manager, ManagerOption } from './manager'
import { CanvasNode, CanvasNodeOption, Pos, NodeEventCallback } from './node'
import { Menu } from './menu'
import { listenToNodeEvent, removeNodeEvent } from './helpers/nativeToNodeEvent'
import { ArrowNode } from './arrow'
import { addEvent, removeEvent } from './helpers/eventHelper'
import { getClickedNode, getClickedLine, getClickedBox } from './helpers/isClicked'
import { centralizePoint, placePointOnEdge } from './helpers/drawArrow'

class Entry {
  static init(option: ManagerOption) {
    Manager.init(option)
  }

  static drawBox(option: CanvasNodeOption) {
    return new CanvasNode(option)
  }

  static addEvent(type: string, cb: NodeEventCallback) {
    listenToNodeEvent(type, cb)
  }

  static removeEvent(type: string) {
    removeNodeEvent(type)
  }

  static drawLine(from: Pos, to?: Pos): ArrowNode {
    const line: ArrowNode = new ArrowNode({
      name: 'line',
      pos: from
    })
    to && line.moveTo(to)
    return line
  }

  static connect(line: ArrowNode, from: CanvasNode, to: CanvasNode) {
    line.connect(from, to)
  }

  static nativeAddEvent = addEvent
  static nativeRemoveEvent = removeEvent
  static getClickedNode = getClickedNode
  static getClickedLine = getClickedLine
  static getClickedBox = getClickedBox
  static centralizePoint = centralizePoint
  static placePointOnEdge = placePointOnEdge
  static ArrowNode = ArrowNode
  static Menu = Menu
  static Node = CanvasNode
}

export { Entry as default }
