import { CanvasNode, Pos } from '../node';
export declare function calculateStop(x1: number, y1: number, x2: number, y2: number): [number, number];
export declare function drawLine(ctx: CanvasRenderingContext2D, start: Pos, end: Pos, ratio: number): void;
export declare function centralizePoint(node: CanvasNode): Pos;
