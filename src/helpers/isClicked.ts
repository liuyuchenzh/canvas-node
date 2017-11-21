import { CanvasNode, Pos } from '../node'
import { ArrowNode } from '../arrow'
import pointInPolygon from 'point-in-polygon'
import { Manager } from '../manager'
import { findFromRight } from './findFromRight'
import { isPointOnBezierCurve } from './cubicCurve'
import { isPointOnCurve } from './quadraticCurve'

export type Poly = [number, number][]
export const MARGIN_ERROR = 4

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
 * get distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function distanceBetween2Points(
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
  return findFromRight(list, node => {
    if (!node.display) return false
    if (node instanceof ArrowNode) {
      if (Manager.useCubicBezier) {
        const isValidLine: boolean =
          node.from &&
          node.to &&
          node.from instanceof CanvasNode &&
          node.to instanceof CanvasNode
        return !isValidLine || isPointOnBezierCurve(node.pos, node.endPos, pos)
      } else {
        return isPointOnCurve(node.stops, pos)
      }
    }
    if (!node.vertexes) return false
    return isPointInPolygon(node.vertexes, pos)
  })
}

/**
 * whether the box is clicked, exclude line
 * @param {Pos} pos
 * @returns {CanvasNode | null}
 */
export function getClickedBox(pos: Pos): CanvasNode {
  const list: CanvasNode[] = Manager.list.filter(
    node => !(node instanceof ArrowNode) && node.display
  )
  return findFromRight(list, node => isPointInPolygon(node.vertexes, pos))
}

/**
 * get the clicked/hover line or undefined
 * @param {Pos} pos
 * @returns {ArrowNode}
 */
export function getClickedLine(pos: Pos): ArrowNode {
  const list: ArrowNode[] = <ArrowNode[]>Manager.list.filter(
    node => node instanceof ArrowNode && node.display
  )
  return findFromRight(list, node => {
    if (!preExamForLine(node, pos)) return false
    if (Manager.useCubicBezier) {
      return isPointOnBezierCurve(node.pos, node.endPos, pos)
    } else {
      return isPointOnCurve(node.stops, pos)
    }
  })
}

/**
 * form the rect area for the line based on its start point and end point
 * used with preExamForLine
 * @param {ArrowNode} line
 * @return {number[]}
 */
function formLineRect(line: ArrowNode): number[] {
  const { x: startX, y: startY } = line.pos
  const { x: endX, y: endY } = line.endPos
  const $startX: number = Math.min(startX, endX)
  const $startY: number = Math.min(startY, endY)
  const width: number = Math.abs(startX - endX)
  const height: number = Math.abs(startY - endY)
  return [$startX, $startY, width, height]
}

/**
 * if the (clicked) point is not within the rect area formed from line,
 * it cannot be on line, therefore return false
 * @param {ArrowNode} line
 * @param {Pos} pos
 * @return {boolean}
 */
function preExamForLine(line: ArrowNode, pos: Pos): boolean {
  return isPointInPolygon(formLineRect(line), pos)
}
