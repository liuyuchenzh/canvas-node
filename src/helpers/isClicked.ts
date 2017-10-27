import { CanvasNode, Pos } from '../node'
import { ArrowNode } from '../arrow'
import { Box } from '../box'
import pointInPolygon from 'point-in-polygon'
import { Manager } from '../manager'

type Poly = [number, number][]
const MARGIN_ERROR = 4

/**
 * detect whether a point is in a polygon
 * @param {number[]} vertexes
 * @param {Pos} pos
 * @returns {boolean}
 */
export function isPointInPolygon(vertexes: number[], pos: Pos): boolean {
  const poly: Poly = convertToPoly(vertexes)
  return isPointInPath(pos.x, pos.y, poly)
}

/**
 * helper function
 * @param {number} x
 * @param {number} y
 * @param {Poly} poly
 * @returns {boolean}
 */
function isPointInPath(x: number, y: number, poly: Poly): boolean {
  return pointInPolygon([x, y], poly)
}

/**
 * convert array of vertexes to the typeof Poly
 * @param {number[]} vertexes
 * @returns {Poly}
 */
function convertToPoly(vertexes: number[]): Poly {
  return vertexes.reduce((last, vertex, i) => {
    const pos: number = Math.floor(i / 2)
    if (!last[pos]) {
      last[pos] = []
    }
    last[pos].push(vertex)
    return last
  }, [])
}

/**
 * detect whether a point is on the track of a Quadratic Bézier curve
 * @param {Poly} poly
 * @param {Pos} pos
 * @returns {boolean}
 */
export function isPointOnCurve(poly: Poly, pos: Pos): boolean {
  if (poly.length !== 3) {
    console.error('only support Quadratic Bézier curves for now')
    return false
  }
  const { x, y } = pos
  const [start, control, end] = poly
  const [startX, startY] = start
  const [controlX, controlY] = control
  const [endX, endY] = end
  // subjective number
  const numOfTest: number =
    Math.floor(distanceBetween2Points(startX, startY, endX, endY)) / 2
  const inc: number = 1 / numOfTest
  let t: number = inc
  while (t < 1) {
    const lineX: number = simulateCurve(startX, controlX, endX, t)
    const lineY: number = simulateCurve(startY, controlY, endY, t)
    if (distanceBetween2Points(x, y, lineX, lineY) < MARGIN_ERROR) return true
    t += inc
  }
  return false
}

/**
 * get a point on Quadratic Bézier curve
 * @param {number} p0
 * @param {number} p1
 * @param {number} p2
 * @param {number} t
 * @returns {number}
 */
export function simulateCurve(p0: number, p1: number, p2: number, t: number): number {
  return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2
}

/**
 * get directive of the curve
 * @param {number} p0
 * @param {number} p1
 * @param {number} p2
 * @param {number} t
 * @returns {number}
 */
export function getDirective(p0: number, p1: number, p2: number, t: number): number {
  return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1)
}

/**
 * get distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function distanceBetween2Points(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const squareDis: number = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
  return Math.pow(squareDis, 0.5)
}

/**
 * find out which node is clicked
 * @param {Pos} pos
 * @returns {CanvasNode}
 */
export function getClickedNode(pos: Pos): CanvasNode {
  const list: CanvasNode[] = Manager.list
  return list.find(node => {
    if (node instanceof ArrowNode) {
      return isPointOnCurve(node.stops, pos)
    }
    if (!node.vertexes) return false
    return isPointInPolygon(node.vertexes, pos)
  })
}

/**
 * get the clicked Box or undefined
 * @param {Pos} pos
 * @returns {Box}
 */
export function getClickedBox(pos: Pos): Box {
  return Manager.list.filter(node => node instanceof Box).find(node => {
    if (!node.vertexes) return false
    return isPointInPolygon(node.vertexes, pos)
  })
}

/**
 * get the clicked/hover line or undefined
 * @param {Pos} pos
 * @returns {ArrowNode}
 */
export function getClickedLine(pos: Pos): ArrowNode {
  return <ArrowNode>Manager.list
    .filter(node => node instanceof ArrowNode)
    .find((node: ArrowNode) => isPointOnCurve(node.stops, pos))
}
