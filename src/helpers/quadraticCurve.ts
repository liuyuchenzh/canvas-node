import { distanceBetween2Points, Poly, MARGIN_ERROR } from './isClicked'
import { Pos } from '../node'

/**
 * get a point on Quadratic Bézier curve
 * @param {number} p0
 * @param {number} p1
 * @param {number} p2
 * @param {number} t
 * @returns {number}
 */
export function simulateCurve(
  p0: number,
  p1: number,
  p2: number,
  t: number
): number {
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
export function getDirective(
  p0: number,
  p1: number,
  p2: number,
  t: number
): number {
  return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1)
}

export function getLimitedExamTimes(times: number, limit: number = 150): number {
  return Math.min(times, limit)
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
  const $numOfTest: number = getLimitedExamTimes(numOfTest)
  const inc: number = 1 / $numOfTest
  let t: number = inc
  while (t < 1) {
    const lineX: number = simulateCurve(startX, controlX, endX, t)
    const lineY: number = simulateCurve(startY, controlY, endY, t)
    if (distanceBetween2Points(x, y, lineX, lineY) < MARGIN_ERROR) return true
    t += inc
  }
  return false
}
