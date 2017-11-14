import { CanvasNode, Pos } from '../node';
import { ArrowNode } from '../arrow';
export declare type Poly = [number, number][];
export declare function isPointInPolygon(vertexes: number[], pos: Pos): boolean;
export declare function isPointOnCurve(poly: Poly, pos: Pos): boolean;
export declare function simulateCurve(p0: number, p1: number, p2: number, t: number): number;
export declare function getDirective(p0: number, p1: number, p2: number, t: number): number;
export declare function getClickedNode(pos: Pos): CanvasNode;
export declare function getClickedLine(pos: Pos): ArrowNode;
