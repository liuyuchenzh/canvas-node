import { ManagerOption } from './manager';
import { CanvasNode, CanvasNodeOption, Pos } from './node';
import { Box } from './box';
import { Menu } from './menu';
import { Cb } from './helpers/nativeToNodeEvent';
import { ArrowNode } from './arrow';
import { addEvent, removeEvent } from './helpers/eventHelper';
import { getClickedBox, getClickedNode, getClickedLine } from './helpers/isClicked';
import { centralizePoint, placePointOnEdge } from './helpers/drawArrow';
declare class Entry {
    static init(option: ManagerOption): void;
    static drawBox(option: CanvasNodeOption): Box;
    static addEvent(type: string, cb: Cb): void;
    static removeEvent(type: string): void;
    static drawLine(from: Pos, to?: Pos): ArrowNode;
    static connect(line: ArrowNode, from: Box, to: Box): void;
    static nativeAddEvent: typeof addEvent;
    static nativeRemoveEvent: typeof removeEvent;
    static getClickedBox: typeof getClickedBox;
    static getClickedNode: typeof getClickedNode;
    static getClickedLine: typeof getClickedLine;
    static centralizePoint: typeof centralizePoint;
    static placePointOnEdge: typeof placePointOnEdge;
    static ArrowNode: typeof ArrowNode;
    static Box: typeof Box;
    static Menu: typeof Menu;
    static Node: typeof CanvasNode;
}
export { Entry as default };
