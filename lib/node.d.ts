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
export declare type Callback = (node: CanvasNode) => any;
export declare type NodeEventCallback = (e: Event, node: CanvasNode) => any;
export interface CanvasNodeOption {
    name: string;
    path?: Path2D;
    pos: Pos;
    ctx?: CanvasRenderingContext2D;
    data?: any;
    size?: Pos;
    style?: string;
    strokeStyle?: string;
    color?: string;
    font?: string;
    text?: string;
    drawCb?: Callback;
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
    color: string;
    text: string;
    drawCbs: Callback[];
    rawVertexes: RawVertexes;
    lines: ArrowNode[];
    private autoUpdateFields;
    private hoverInCb;
    private hoverOutCb;
    private clickCb;
    constructor(option: CanvasNodeOption);
    proxy(): void;
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
    addDrawCb(cb: Callback): void;
    hover(inCb: NodeEventCallback, outCb?: NodeEventCallback): void;
    click(clickCb: NodeEventCallback): void;
    destory(): void;
}
