import { CanvasNode, Pos, UpdateLineCallback } from './node';
import { ArrowNode } from './arrow';
export interface ManagerOption {
    canvas: HTMLCanvasElement;
    updateLineCb?: UpdateLineCallback;
    arrowPath?: Path2D & CanvasFillRule;
}
export declare class Manager {
    static size: Pos;
    static ctx: CanvasRenderingContext2D;
    static list: CanvasNode[];
    static canvas: HTMLCanvasElement;
    static updateLineCb: UpdateLineCallback;
    static arrowPath: Path2D & CanvasFillRule;
    static init(option: ManagerOption): void;
    static add(node: CanvasNode): void;
    static bindSize(size: Pos): void;
    static bindCtx(ctx: CanvasRenderingContext2D): void;
    static bindCanvas(canvas: HTMLCanvasElement): void;
    static draw(): void;
    static moveTo(target: CanvasNode, pos: Pos): void;
    static deleteNode(target: CanvasNode): void;
    static deleteConnectedBox(line: ArrowNode): void;
}
