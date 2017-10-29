import { ManagerOption } from './manager';
import { CanvasNodeOption, Pos } from './node';
import { Box } from './box';
import { Cb } from './helpers/nativeToNodeEvent';
import { ArrowNode } from './arrow';
import { addEvent, removeEvent } from './helpers/eventHelper';
import { getClickedBox, getClickedNode, getClickedLine } from './helpers/isClicked';
declare class Entry {
    static init(option: ManagerOption): void;
    static drawBox(option: CanvasNodeOption): Box;
    static addEvent(type: string, cb: Cb): void;
    static removeEvent(type: string): void;
    static drawLine(from: Pos, to: Pos): ArrowNode;
    static connect(line: ArrowNode, from: Box, to: Box): void;
    static nativeAddEvent: typeof addEvent;
    static nativeRemoveEvent: typeof removeEvent;
    static getClickedBox: typeof getClickedBox;
    static getClickedNode: typeof getClickedNode;
    static getClickedLine: typeof getClickedLine;
}
export { Entry as default };
