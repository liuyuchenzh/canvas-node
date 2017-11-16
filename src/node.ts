import { Manager } from './manager'
import { getVertexesForRect } from './helpers/getVertexes'
import { ArrowNode } from './arrow'
import { centralizePoint } from './helpers/drawArrow'
import { listenToNodeEvent, removeNodeEvent } from './helpers/nativeToNodeEvent'
import { Batch } from './helpers/batch'
import { tagFn } from './helpers/tagFn'
import { isFn } from './helpers/types'

export interface Pos {
  x: number
  y: number
}

export type x = number
export type y = number
export type width = number
export type height = number
export type RawVertexes = [x, y, width, height]

export type Callback = (node: CanvasNode) => any
export type NodeEventCallback = (e: Event, node: CanvasNode) => any
export type UpdateLineCallback = (
  node: CanvasNode,
  line: ArrowNode,
  isFrom: boolean
) => Pos

export interface CanvasNodeOption {
  name: string
  path?: Path2D
  pos: Pos
  ctx?: CanvasRenderingContext2D
  data?: any
  size?: Pos
  style?: string
  strokeStyle?: string
  color?: string
  font?: string
  text?: string
  drawCb?: Callback
  rawVertexes?: RawVertexes
  updateLineCb?: UpdateLineCallback
}

function defaultData() {
  return {
    font: '14px Arial',
    style: '#fff',
    strokeStyle: '#000',
    color: '#000',
    data: {}
  }
}

export class CanvasNode implements CanvasNodeOption {
  name: string
  path?: Path2D
  pos: Pos
  ctx: CanvasRenderingContext2D
  data: any
  font?: string
  size: Pos
  style: string
  strokeStyle: string
  color: string
  text: string
  drawCbs: Callback[] = []
  rawVertexes: RawVertexes
  lines: ArrowNode[] = []
  updateLineCb: UpdateLineCallback

  // properties to be proxied
  private autoUpdateFields: string[] = [
    'font',
    'size',
    'style',
    'strokeStyle',
    'color',
    'text'
  ]

  private hoverInCb: NodeEventCallback[] = []
  private hoverOutCb: NodeEventCallback[] = []
  private clickCb: NodeEventCallback[] = []

  constructor(option: CanvasNodeOption) {
    this.proxy()
    Object.assign(this, defaultData(), option, {
      ctx: Manager.ctx,
      size: Manager.size
    })
    // go to the initial position
    this.$moveTo(this.pos)
    // add instance to Manager to monitor
    Manager.add(this)
  }

  proxy() {
    const finished: any[] = []
    this.autoUpdateFields.forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return this['$' + key]
        },
        set(val) {
          this['$' + key] = val
          if (!finished.includes(key)) {
            return finished.push(key)
          }
          // auto update view
          Batch.add(() => {
            this.draw()
          }, this)
        }
      })
    })
  }

  get vertexes(): number[] {
    // since the node could move around
    // every time it moves, the coordinate of its upper-left point will change
    // the input of getVertexesForRect need to always use the real coordinate of the node's upper-left
    if (!this.rawVertexes) return
    // x, y, w, h
    const rawData: number[] = this.rawVertexes.map(
      (vertex: number, i: number) => {
        const pos: string = i === 0 ? 'x' : i === 1 ? 'y' : 'z'
        return i < 2 ? vertex + this.pos[pos] : vertex
      }
    )
    return getVertexesForRect(rawData)
  }

  moveTo(pos: Pos) {
    Manager.moveTo(this, pos)
  }

  $moveTo(pos: Pos) {
    this.updatePos(pos)
    this.$draw()
    // so the line will be redrew with new from and to positions
    // tricky point is, every line is drew after node, so it will be updated later then its from and to node
    this.updateLinePos()
  }

  $draw() {
    this.ctx.save()
    // move to the desired position
    this.ctx.translate(this.pos.x, this.pos.y)
    // draw border
    this.drawBorder()
    // fill color
    this.fill()
    // fill text
    this.fillText()
    // custom callback
    this.invokeDrawCb()
    this.ctx.restore()
  }

  draw() {
    Manager.draw()
  }

  updatePos(pos: Pos) {
    this.pos = pos
  }

  // use Decorator instead
  drawBorder() {
    if (!this.path) return
    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.stroke(this.path)
  }

  fill() {
    if (!this.path) return
    this.ctx.fillStyle = this.style
    this.ctx.fill(<any>this.path)
  }

  fillText(text: string = this.text) {
    if (!this.path) return
    const $text = typeof text === 'string' ? text : this.text
    const [width, height] = this.rawVertexes.slice(2)
    // make the text display in the center of box
    this.ctx.font = this.font
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.save()
    this.ctx.translate(width / 2, height / 2)
    this.ctx.fillStyle = this.color || '#000'
    this.ctx.fillText($text, 0, 0)
    this.updateText($text)
    this.ctx.restore()
  }

  updateText(text: string) {
    this.text = text
  }

  invokeDrawCb(): void {
    this.drawCbs.forEach(cb => cb(this))
  }

  addLine(line: ArrowNode) {
    this.lines.push(line)
  }

  /**
   * there is a priority tree here
   * own > Manager > default
   */
  updateLinePos() {
    this.lines.forEach(line => {
      switch (this) {
        case line.from:
          line.pos = isFn(this.updateLineCb)
            ? this.updateLineCb(this, line, true)
            : isFn(Manager.updateLineCb)
              ? Manager.updateLineCb(this, line, true)
              : centralizePoint(this)
          break
        case line.to:
          line.endPos = isFn(this.updateLineCb)
            ? this.updateLineCb(this, line, false)
            : isFn(Manager.updateLineCb)
              ? Manager.updateLineCb(this, line, false)
              : centralizePoint(this)
          break
      }
    })
  }

  remove(node?: CanvasNode) {
    node && Manager.deleteNode(node)
    Manager.deleteNode(this)
    Manager.draw()
  }

  forEach(fn: (node: CanvasNode, i: number, list: CanvasNode[]) => any) {
    Manager.list.forEach(fn)
  }

  addDrawCb(cb: Callback) {
    this.drawCbs.push(cb)
  }

  hover(inCb: NodeEventCallback, outCb?: NodeEventCallback) {
    const $inCb = (e, node) => {
      if (node !== this) return
      inCb(e, node)
    }
    tagFn($inCb)
    listenToNodeEvent('mousemove', $inCb)
    this.hoverInCb.push($inCb)
    if (!outCb) return
    const $outCb = (e, node) => {
      if (node !== this) return
      outCb(e, node)
    }
    tagFn($outCb)
    listenToNodeEvent('mouseout', $outCb)
    this.hoverOutCb.push($outCb)
  }

  click(clickCb: NodeEventCallback) {
    const $clickCb = (e, node) => {
      if (node !== this) return
      clickCb(e, node)
    }
    tagFn($clickCb)
    listenToNodeEvent('click', $clickCb)
    this.clickCb.push($clickCb)
  }

  destory() {
    this.remove()
    this.hoverInCb.forEach(cb => {
      removeNodeEvent('mousemove', cb)
    })
    this.hoverOutCb.forEach(cb => {
      removeNodeEvent('mouseout', cb)
    })
    this.clickCb.forEach(cb => {
      removeNodeEvent('click', cb)
    })
  }
}
