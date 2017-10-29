import { ArrowNode } from './arrow';
export interface Pos {
    x: number;
    y: number;
}
export declare type x = number;
export declare type y = number;
export declare type width = number;
export declare type height = number;
export declare type RawVertexes = [x, y, width, height];
export declare type DrawCb = (node: CanvasNode) => any;
export interface CanvasNodeOption {
    name: string;
    path?: Path2D;
    pos: Pos;
    ctx?: CanvasRenderingContext2D;
    data?: any;
    size?: Pos;
    style?: string;
    strokeStyle?: string;
    font?: string;
    text?: string;
    drawCb?: DrawCb;
    rawVertexes?: RawVertexes;
}
export declare class CanvasNode implements CanvasNodeOption {
    name: string;
    path?: Path2D;
    pos: Pos;
    ctx: CanvasRenderingContext2D;
    data: any;
    font?: string;
    size: Pos;
    style: string;
    strokeStyle: string;
    text: string;
    drawCbs: DrawCb[];
    rawVertexes: RawVertexes;
    lines: ArrowNode[];
    constructor(option: CanvasNodeOption);
    readonly vertexes: number[];
    moveTo(pos: Pos): void;
    $moveTo(pos: Pos): void;
    $draw(): void;
    draw(): void;
    updatePos(pos: Pos): void;
    drawBorder(): void;
    fill(): void;
    fillText(text?: string): void;
    updateText(text: string): void;
    invokeDrawCb(): void;
    addLine(line: ArrowNode): void;
    updateLinePos(): void;
    remove(node?: CanvasNode): void;
    forEach(fn: (node: CanvasNode, i: number, list: CanvasNode[]) => any): void;
    setOrigin(): void;
    addDrawCb(cb: DrawCb): void;
}
