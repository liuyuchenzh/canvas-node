import { CanvasNode, CanvasNodeOption, Pos } from './node'
import { drawLine } from './helpers/drawArrow'
import { Manager } from './manager'
import { calculateStop } from './helpers/drawArrow'

export interface ArrowOption extends CanvasNodeOption {
  ratio?: number
  arrowPath?: Path2D & CanvasFillRule
}

export interface Color {
  style: string
  strokeStyle: string
}

function getDefaultOption() {
  return {
    ratio: 0.5
  }
}

export class ArrowNode extends CanvasNode {
  from: CanvasNode
  to: CanvasNode
  endPos: Pos
  ratio: number
  arrowPath: Path2D & CanvasFillRule

  constructor(option: ArrowOption) {
    super(Object.assign({}, getDefaultOption(), option))
  }

  get stops(): [number, number][] {
    const stop: [number, number] = calculateStop(
      this.pos.x,
      this.pos.y,
      this.endPos.x,
      this.endPos.y
    )
    return [[this.pos.x, this.pos.y], stop, [this.endPos.x, this.endPos.y]]
  }

  get colorObj(): Color {
    return {
      strokeStyle: this.strokeStyle,
      style: this.style
    }
  }

  // overRide
  $moveTo(end: Pos) {
    this.updateEndPos(end)
    drawLine(this.ctx, this.pos, end, this.ratio, this.arrowPath, this.colorObj)
  }

  // overRide
  $draw() {
    drawLine(
      this.ctx,
      this.pos,
      this.endPos,
      this.ratio,
      this.arrowPath,
      this.colorObj
    )
  }

  updateEndPos(end: Pos) {
    this.endPos = end
  }

  connect(from: CanvasNode, to: CanvasNode) {
    // cache start point and end point
    this.from = from
    this.to = to
    // update lines for each node
    ;[from, to].forEach(node => {
      node.addLine(this)
    })
  }

  abort() {
    Manager.deleteNode(this)
    // redraw view
    Manager.draw()
  }
}
