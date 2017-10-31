import { CanvasNode, Pos } from '../node'
import { getDirective, simulateCurve } from './isClicked'

const MARGIN_ERROR: number = 5

function drawTriangle(): Path2D | CanvasFillRule {
  const triangle = new Path2D()

  triangle.moveTo(0, 0)
  triangle.lineTo(0, 5)
  triangle.lineTo(15, 0)
  triangle.lineTo(0, -5)
  triangle.closePath()
  return triangle
}

/**
 * whether to consider two value are the same
 * @param {number} diff
 * @returns {boolean}
 */
function withInMargin(diff: number) {
  return Math.abs(diff) < MARGIN_ERROR
}

/**
 * normalize end point
 * @param startPoint
 * @param endPoint
 * @returns {number}
 */
function normalizeEndPoint(startPoint: number, endPoint: number) {
  const diff: number = startPoint - endPoint
  return withInMargin(diff) ? startPoint : endPoint
}

/**
 * get direction of the arrow (for end point)
 * @param {Pos} start
 * @param {Pos} end
 * @returns {string}
 */
function getDirection(start: Pos, end: Pos): string {
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  if (withInMargin(startY - endY)) {
    return startX > endX ? 'left' : 'right'
  } else if (withInMargin(startX - endX)) {
    return startY > endY ? 'top' : 'bottom'
  } else {
    return startY > endY ? 'top' : 'bottom'
  }
}

/**
 * get direction for start point
 * @param {Pos} start
 * @param {Pos} end
 * @returns {string}
 */
function getDirectionForStart(start: Pos, end: Pos): string {
  const dir: string = getDirection(start, end)
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  switch (dir) {
    case 'top':
    case 'bottom':
      if (withInMargin(startX - endX)) {
        return endY > startY ? 'bottom' : 'top'
      }
      return endX > startX ? 'right' : 'left'
    case 'left':
    case 'right':
      if (withInMargin(startY - endY)) {
        return endX > startX ? 'right' : 'left'
      }
      return endY > startY ? 'bottom' : 'top'
  }
}

/**
 * get the control point of a single line
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {[number , number]}
 */
export function calculateStop(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): [number, number] {
  const dir: string = getDirection(
    {
      x: x1,
      y: y1
    },
    {
      x: x2,
      y: y2
    }
  )
  switch (dir) {
    case 'top':
    case 'bottom':
      return [x2, y1]
    case 'left':
    case 'right':
      return [x1, y2]
    default:
      return [x1, y2]
  }
}

/**
 * draw a line with arrow
 * @param {CanvasRenderingContext2D} ctx
 * @param {Pos} start
 * @param {Pos} end
 * @param {number} ratio
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Pos,
  end: Pos,
  ratio: number
) {
  const { x: startX, y: startY } = start

  const { x: endX, y: endY } = end

  const $endX: number = normalizeEndPoint(startX, endX)
  const $endY: number = normalizeEndPoint(startY, endY)

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  const stop = calculateStop(startX, startY, $endX, $endY)
  // draw curve
  ctx.quadraticCurveTo(stop[0], stop[1], $endX, $endY)
  // get where to put arrow
  const arrowX: number = simulateCurve(startX, stop[0], $endX, ratio)
  const arrowY: number = simulateCurve(startY, stop[1], $endY, ratio)
  // calculate tan
  const arrowDirX: number = getDirective(startX, stop[0], $endX, ratio)
  const arrowDirY: number = getDirective(startY, stop[1], $endY, ratio)
  const tan: number = arrowDirY / arrowDirX
  // get rotate angle
  const angle: number = Math.atan(tan)
  const goLeft: boolean = $endX < startX
  const rotateAngle: number = goLeft ? angle - Math.PI : angle
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.save()
  ctx.translate(arrowX, arrowY)
  ctx.rotate(rotateAngle)
  const triangle = drawTriangle()
  ctx.fill(triangle as CanvasFillRule)
  ctx.restore()
}

/**
 * make sure every line start/end at the center of a node
 * @param {CanvasNode} node
 * @returns {Pos}
 */
export function centralizePoint(node: CanvasNode): Pos {
  const [width, height] = node.rawVertexes.slice(2)
  return {
    x: node.pos.x + width / 2,
    y: node.pos.y + height / 2
  }
}

/**
 * place point on the edge of polygon
 * @param {Pos} start
 * @param {Pos} end
 * @param {CanvasNode} node
 * @param {boolean} isStart
 * @returns {Pos}
 */
export function placePointOnEdge(
  start: Pos,
  end: Pos,
  node: CanvasNode,
  isStart: boolean = true
): Pos {
  const dir: string = isStart
    ? getDirectionForStart(start, end)
    : getDirection(start, end)
  return calculatePos(dir, node)
}

/**
 * given direction and targeted node, get the coordinate of point on edge
 * @param {string} dir
 * @param {CanvasNode} node
 * @returns {Pos}
 */
function calculatePos(dir: string, node: CanvasNode): Pos {
  const [width, height] = node.rawVertexes.slice(2)
  let x: number
  let y: number
  switch (dir) {
    case 'top':
      x = node.pos.x + width / 2
      y = node.pos.y
      break
    case 'bottom':
      x = node.pos.x + width / 2
      y = node.pos.y + height
      break
    case 'left':
      x = node.pos.x
      y = node.pos.y + height / 2
      break
    case 'right':
      x = node.pos.x + width
      y = node.pos.y + height / 2
      break
  }
  return {
    x,
    y
  }
}
