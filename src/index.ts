import { Manager, ManagerOption } from './manager'
import { CanvasNodeOption, Pos } from './node'
import { Box } from './box'
import {
  listenToNodeEvent,
  removeNodeEvent,
  Cb
} from './helpers/nativeToNodeEvent'
import { ArrowNode } from './arrow'
import { addEvent, removeEvent } from './helpers/eventHelper'
import {
  getClickedBox,
  getClickedNode,
  getClickedLine
} from './helpers/isClicked'

class Entry {
  static init(option: ManagerOption) {
    Manager.init(option)
  }

  static drawBox(option: CanvasNodeOption) {
    return new Box(option)
  }

  static addEvent(type: string, cb: Cb) {
    listenToNodeEvent(type, cb)
  }

  static removeEvent(type: string) {
    removeNodeEvent(type)
  }

  static drawLine(from: Pos, to: Pos): ArrowNode {
    const line: ArrowNode = new ArrowNode({
      name: 'line',
      pos: from
    })
    line.moveTo(to)
    return line
  }

  static connect(line: ArrowNode, from: Box, to: Box) {
    line.connect(from, to)
  }

  static nativeAddEvent = addEvent
  static nativeRemoveEvent = removeEvent
  static getClickedBox = getClickedBox
  static getClickedNode = getClickedNode
  static getClickedLine = getClickedLine
}

export { Entry as default }
