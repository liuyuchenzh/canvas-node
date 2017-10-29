import { CanvasNode, CanvasNodeOption, Pos } from './node';
export interface ArrowOption extends CanvasNodeOption {
    ratio?: number;
}
export declare class ArrowNode extends CanvasNode {
    from: CanvasNode;
    to: CanvasNode;
    endPos: Pos;
    ratio: number;
    constructor(option: ArrowOption);
    readonly stops: [number, number][];
    $moveTo(end: Pos): void;
    $draw(): void;
    updateEndPos(end: Pos): void;
    connect(from: CanvasNode, to: CanvasNode): void;
    abort(): void;
}
