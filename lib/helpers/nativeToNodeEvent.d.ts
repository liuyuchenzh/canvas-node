import { CanvasNode } from '../node';
export declare type Cb = (node: CanvasNode) => any;
export declare type Handler = (input: any) => any;
export declare function listenToNodeEvent(type: string, cb: Cb): void;
export declare function removeNodeEvent(type: string, cb?: Handler): void;
