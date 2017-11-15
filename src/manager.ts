import { CanvasNode, Pos, UpdateLineCallback } from './node'
import { ArrowNode } from './arrow'

export interface ManagerOption {
  canvas: HTMLCanvasElement
  updateLineCb?: UpdateLineCallback
  arrowPath?: Path2D & CanvasFillRule
}

export class Manager {
  // size of canvas
  static size: Pos
  // context
  static ctx: CanvasRenderingContext2D
  // all CanvasNode instances
  static list: CanvasNode[] = []
  static canvas: HTMLCanvasElement
  static updateLineCb: UpdateLineCallback
  static arrowPath: Path2D & CanvasFillRule

  static init(option: ManagerOption) {
    const { canvas, updateLineCb, arrowPath } = option
    const size: Pos = {
      x: canvas.width,
      y: canvas.height
    }
    const ctx = canvas.getContext('2d')
    this.bindSize(size)
    this.bindCtx(ctx)
    this.bindCanvas(canvas)
    this.updateLineCb = updateLineCb
    this.arrowPath = arrowPath
  }

  static add(node: CanvasNode) {
    this.list.push(node)
  }

  static bindSize(size: Pos) {
    this.size = size
  }

  static bindCtx(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  static bindCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  // draw every thing
  static draw() {
    this.ctx.clearRect(0, 0, this.size.x, this.size.y)
    this.ctx.save()
    // draw all node
    this.list.forEach(node => {
      node.$draw()
    })
    this.ctx.restore()
  }

  // move one node
  static moveTo(target: CanvasNode, pos: Pos) {
    this.ctx.clearRect(0, 0, this.size.x, this.size.y)
    this.ctx.save()
    this.list.forEach(node => {
      // if it is an arrow
      // then simply redraw it based on its endPos
      const isArrowNode: boolean = node instanceof ArrowNode
      const $pos: Pos =
        node === target
          ? pos
          : isArrowNode ? (<ArrowNode>node).endPos : node.pos
      node.$moveTo($pos)
    })
    this.ctx.restore()
  }

  // delete the specific node
  static deleteNode(target: CanvasNode) {
    const index: number = this.list.findIndex(node => node === target)
    this.list.splice(index, 1)
    // if the node has lines connect to it
    // then remove all those lines
    if (target.lines.length) {
      target.lines.forEach(line => {
        this.list = this.list.filter(node => node !== line)
      })
    }
    // if it is a line
    // find its fromNode and toNode
    // delete the reference of the line from both nodes
    if (target instanceof ArrowNode) {
      this.deleteConnectedBox(target)
    }
  }

  static deleteConnectedBox(line: ArrowNode) {
    if (!line.to || !line.from) return
    const fromNode: CanvasNode = line.from
    const toNode: CanvasNode = line.to
    ;[fromNode, toNode].forEach(node => {
      node.lines = node.lines.filter(oldLine => oldLine !== line)
    })
  }
}
