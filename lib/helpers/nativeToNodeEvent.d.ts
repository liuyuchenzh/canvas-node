import { NodeEventCallback } from '../node';
export declare type Handler = (input: any) => any;
export declare function listenToNodeEvent(type: string, cb: NodeEventCallback): void;
export declare function removeNodeEvent(type: string, cb?: Handler): void;
