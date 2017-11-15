import { ManagerOption } from './manager';
import { CanvasNode, CanvasNodeOption, Pos, NodeEventCallback } from './node';
import { Menu } from './menu';
import { ArrowNode } from './arrow';
import { addEvent, removeEvent } from './helpers/eventHelper';
import { getClickedNode, getClickedLine } from './helpers/isClicked';
import { centralizePoint, placePointOnEdge } from './helpers/drawArrow';
declare class Entry {
    static init(option: ManagerOption): void;
    static drawBox(option: CanvasNodeOption): CanvasNode;
    static addEvent(type: string, cb: NodeEventCallback): void;
    static removeEvent(type: string): void;
    static drawLine(from: Pos, to?: Pos): ArrowNode;
    static connect(line: ArrowNode, from: CanvasNode, to: CanvasNode): void;
    static nativeAddEvent: typeof addEvent;
    static nativeRemoveEvent: typeof removeEvent;
    static getClickedNode: typeof getClickedNode;
    static getClickedLine: typeof getClickedLine;
    static centralizePoint: typeof centralizePoint;
    static placePointOnEdge: typeof placePointOnEdge;
    static ArrowNode: typeof ArrowNode;
    static Menu: typeof Menu;
    static Node: typeof CanvasNode;
}
export { Entry as default };
