function getVertexesForRect(raw) {
    if (raw.length > 4)
        console.error('only support rect now!');
    const [x, y, w, h] = raw;
    return [x, y, x + w, y, x + w, y + h, x, y + h];
}

class Box extends CanvasNode {
    constructor(option) {
        super(option);
    }
}

var pointInPolygon = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

const MARGIN_ERROR$1 = 4;
function isPointInPolygon(vertexes, pos) {
    const poly = convertToPoly(vertexes);
    return isPointInPath(pos.x, pos.y, poly);
}
function isPointInPath(x, y, poly) {
    return pointInPolygon([x, y], poly);
}
function convertToPoly(vertexes) {
    return vertexes.reduce((last, vertex, i) => {
        const pos = Math.floor(i / 2);
        if (!last[pos]) {
            last[pos] = [];
        }
        last[pos].push(vertex);
        return last;
    }, []);
}
function isPointOnCurve(poly, pos) {
    if (poly.length !== 3) {
        console.error('only support Quadratic Bézier curves for now');
        return false;
    }
    const { x, y } = pos;
    const [start, control, end] = poly;
    const [startX, startY] = start;
    const [controlX, controlY] = control;
    const [endX, endY] = end;
    const numOfTest = Math.floor(distanceBetween2Points(startX, startY, endX, endY)) / 2;
    const inc = 1 / numOfTest;
    let t = inc;
    while (t < 1) {
        const lineX = simulateCurve(startX, controlX, endX, t);
        const lineY = simulateCurve(startY, controlY, endY, t);
        if (distanceBetween2Points(x, y, lineX, lineY) < MARGIN_ERROR$1)
            return true;
        t += inc;
    }
    return false;
}
function simulateCurve(p0, p1, p2, t) {
    return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2;
}
function getDirective(p0, p1, p2, t) {
    return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
}
function distanceBetween2Points(x1, y1, x2, y2) {
    const squareDis = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.pow(squareDis, 0.5);
}
function getClickedNode(pos) {
    const list = Manager.list;
    return list.find(node => {
        if (node instanceof ArrowNode) {
            return isPointOnCurve(node.stops, pos);
        }
        if (!node.vertexes)
            return false;
        return isPointInPolygon(node.vertexes, pos);
    });
}
function getClickedBox(pos) {
    return Manager.list.filter(node => node instanceof Box).find(node => {
        if (!node.vertexes)
            return false;
        return isPointInPolygon(node.vertexes, pos);
    });
}
function getClickedLine(pos) {
    return Manager.list
        .filter(node => node instanceof ArrowNode)
        .find((node) => isPointOnCurve(node.stops, pos));
}

const MARGIN_ERROR = 5;
function drawTriangle() {
    const triangle = new Path2D();
    triangle.moveTo(0, 0);
    triangle.lineTo(0, 5);
    triangle.lineTo(15, 0);
    triangle.lineTo(0, -5);
    triangle.closePath();
    return triangle;
}
function withInMargin(diff) {
    return Math.abs(diff) < MARGIN_ERROR;
}
function normalizeEndPoint(startPoint, endPoint) {
    const diff = startPoint - endPoint;
    return withInMargin(diff) ? startPoint : endPoint;
}
function getDirection(start, end) {
    const { x: startX, y: startY } = start;
    const { x: endX, y: endY } = end;
    if (withInMargin(startY - endY)) {
        return startX > endX ? 'left' : 'right';
    }
    else if (withInMargin(startX - endX)) {
        return startY > endY ? 'top' : 'bottom';
    }
    else {
        return startY > endY ? 'top' : 'bottom';
    }
}
function calculateStop(x1, y1, x2, y2) {
    const dir = getDirection({
        x: x1,
        y: y1
    }, {
        x: x2,
        y: y2
    });
    switch (dir) {
        case 'top':
        case 'bottom':
            return [x2, y1];
        case 'left':
        case 'right':
            return [x1, y2];
        default:
            return [x1, y2];
    }
}
function drawLine(ctx, start, end, ratio) {
    const { x: startX, y: startY } = start;
    const { x: endX, y: endY } = end;
    const $endX = normalizeEndPoint(startX, endX);
    const $endY = normalizeEndPoint(startY, endY);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const stop = calculateStop(startX, startY, $endX, $endY);
    ctx.quadraticCurveTo(stop[0], stop[1], $endX, $endY);
    const arrowX = simulateCurve(startX, stop[0], $endX, ratio);
    const arrowY = simulateCurve(startY, stop[1], $endY, ratio);
    const arrowDirX = getDirective(startX, stop[0], $endX, ratio);
    const arrowDirY = getDirective(startY, stop[1], $endY, ratio);
    const tan = arrowDirY / arrowDirX;
    const angle = Math.atan(tan);
    const goLeft = $endX < startX;
    const rotateAngle = goLeft ? angle - Math.PI : angle;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(rotateAngle);
    const triangle = drawTriangle();
    ctx.fill(triangle);
    ctx.restore();
}
function centralizePoint(node) {
    const [width, height] = node.rawVertexes.slice(2);
    return {
        x: node.pos.x + width / 2,
        y: node.pos.y + height / 2
    };
}

function defaultData() {
    return {
        font: '14px Arial',
        style: '#fff',
        strokeStyle: '#000',
        data: {}
    };
}
class CanvasNode {
    constructor(option) {
        this.drawCbs = [];
        this.lines = [];
        Object.assign(this, defaultData(), option, {
            ctx: Manager.ctx,
            size: Manager.size
        });
        this.$moveTo(this.pos);
        Manager.add(this);
    }
    get vertexes() {
        if (!this.rawVertexes)
            return;
        const rawData = this.rawVertexes.map((vertex, i) => {
            const pos = i === 0 ? 'x' : i === 1 ? 'y' : 'z';
            return i < 2 ? vertex + this.pos[pos] : vertex;
        });
        return getVertexesForRect(rawData);
    }
    moveTo(pos) {
        Manager.moveTo(this, pos);
    }
    $moveTo(pos) {
        this.updatePos(pos);
        this.$draw();
        this.updateLinePos();
    }
    $draw() {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.drawBorder();
        this.fill();
        this.fillText();
        this.invokeDrawCb();
        this.ctx.restore();
    }
    draw() {
        Manager.draw();
    }
    updatePos(pos) {
        this.pos = pos;
    }
    drawBorder() {
        if (!this.path)
            return;
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke(this.path);
    }
    fill() {
        if (!this.path)
            return;
        this.ctx.fillStyle = this.style;
        this.ctx.fill(this.path);
    }
    fillText(text = this.text) {
        if (!this.path)
            return;
        const $text = typeof text === 'string' ? text : this.text;
        const [width, height] = this.rawVertexes.slice(2);
        this.ctx.font = this.font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.save();
        this.ctx.translate(width / 2, height / 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fillText($text, 0, 0);
        this.updateText($text);
        this.ctx.restore();
    }
    updateText(text) {
        this.text = text;
    }
    invokeDrawCb() {
        this.drawCbs.forEach(cb => cb(this));
    }
    addLine(line) {
        this.lines.push(line);
    }
    updateLinePos() {
        this.lines.forEach(line => {
            switch (this) {
                case line.from:
                    line.pos = centralizePoint(this);
                    break;
                case line.to:
                    line.endPos = centralizePoint(this);
                    break;
            }
        });
    }
    remove(node) {
        node && Manager.deleteNode(node);
        Manager.deleteNode(this);
        Manager.draw();
    }
    forEach(fn) {
        Manager.list.forEach(fn);
    }
    setOrigin() {
        this.data['origin'] = true;
    }
    addDrawCb(cb) {
        this.drawCbs.push(cb);
    }
}

function getDefaultOption() {
    return {
        ratio: 0.5
    };
}
class ArrowNode extends CanvasNode {
    constructor(option) {
        super(Object.assign({}, getDefaultOption(), option));
    }
    get stops() {
        const stop = calculateStop(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y);
        return [[this.pos.x, this.pos.y], stop, [this.endPos.x, this.endPos.y]];
    }
    $moveTo(end) {
        this.updateEndPos(end);
        drawLine(this.ctx, this.pos, end, this.ratio);
    }
    $draw() {
        drawLine(this.ctx, this.pos, this.endPos, this.ratio);
    }
    updateEndPos(end) {
        this.endPos = end;
    }
    connect(from, to) {
        this.from = from;
        this.to = to;
        [from, to].forEach(node => {
            node.addLine(this);
        });
    }
    abort() {
        Manager.deleteNode(this);
        Manager.draw();
    }
}

class Manager {
    static init(option) {
        const { canvas } = option;
        const size = {
            x: canvas.width,
            y: canvas.height
        };
        const ctx = canvas.getContext('2d');
        this.bindSize(size);
        this.bindCtx(ctx);
        this.bindCanvas(canvas);
    }
    static add(node) {
        this.list.push(node);
    }
    static bindSize(size) {
        this.size = size;
    }
    static bindCtx(ctx) {
        this.ctx = ctx;
    }
    static bindCanvas(canvas) {
        this.canvas = canvas;
    }
    static draw() {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.save();
        this.list.forEach(node => {
            node.$draw();
        });
        this.ctx.restore();
    }
    static moveTo(target, pos) {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.save();
        this.list.forEach(node => {
            const isArrowNode = node instanceof ArrowNode;
            const $pos = node === target
                ? pos
                : isArrowNode ? node.endPos : node.pos;
            node.$moveTo($pos);
        });
        this.ctx.restore();
    }
    static deleteNode(target) {
        const index = this.list.findIndex(node => node === target);
        this.list.splice(index, 1);
        if (target.lines.length) {
            target.lines.forEach(line => {
                this.list = this.list.filter(node => node !== line);
            });
        }
        if (target instanceof ArrowNode) {
            this.deleteConnectedBox(target);
        }
    }
    static deleteConnectedBox(line) {
        if (!line.to || !line.from)
            return;
        const fromNode = line.from;
        const toNode = line.to;
        [fromNode, toNode].forEach(node => {
            node.lines = node.lines.filter(oldLine => oldLine !== line);
        });
    }
}
Manager.list = [];

class EventManager {
    static add(el, type, cb) {
        let item = findEventItem(el, type);
        if (!item) {
            item = {
                el,
                type,
                cbs: []
            };
        }
        item.cbs.push(cb);
        this.list.push(item);
    }
    static remove(el, type, cb) {
        const item = findEventItem(el, type);
        if (!item)
            return;
        if (!cb) {
            item.cbs = [];
        }
        else {
            item.cbs = item.cbs.filter(oldCb => oldCb !== cb);
        }
    }
}
EventManager.list = [];
function findEventItem(el, type) {
    return EventManager.list.find(item => item.el === el && item.type === type);
}
function addEvent(el, type, cb) {
    const item = findEventItem(el, type);
    if (!item) {
        el.addEventListener(type, function handler(e) {
            const cbs = findEventItem(el, type).cbs;
            cbs.forEach(cb => {
                cb(e);
            });
        });
    }
    EventManager.add(el, type, cb);
}
function removeEvent(el, type, cb) {
    EventManager.remove(el, type, cb);
}

const NORMALIZE_LIST = ['mousemove', 'mouseout'];
let target;
function shouldNormalizeEvent(type) {
    return NORMALIZE_LIST.includes(type);
}
function normalizeEvent(type, cb) {
    switch (type) {
        case 'mousemove':
            return generateMouseMoveHandler(cb);
        case 'mouseout':
            return generateMouseOutHandler(cb);
    }
}
function normalizeEventType(type) {
    if (type === 'mouseout')
        return 'mousemove';
    return type;
}
function generateMouseMoveHandler(cb) {
    return function handler(e) {
        const pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        const node = getClickedNode(pos);
        if (!node)
            return;
        target = node;
        cb(node);
    };
}
function generateMouseOutHandler(cb) {
    return function handler(e) {
        const pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        const node = getClickedNode(pos);
        if (node === target)
            return;
        if (!target)
            return;
        cb(target);
        target = null;
    };
}

class NodeEventManager {
    static add(type, cb) {
        let item = this.getItem(type);
        if (!item) {
            item = {
                type,
                cbs: [cb]
            };
            this.list.push(item);
        }
        else {
            item.cbs.push(cb);
        }
    }
    static getCbs(type) {
        return this.getItem(type).cbs;
    }
    static getItem(type) {
        return this.list.find(item => item.type === type);
    }
    static remove(type, cb) {
        if (!cb) {
            this.list = this.list.filter(item => item.type !== type);
        }
        else {
            const item = this.getItem(type);
            if (!item)
                return;
            item.cbs = item.cbs.filter(oldCb => oldCb !== cb);
        }
    }
}
NodeEventManager.list = [];
function listenToNodeEvent(type, cb) {
    const $type = normalizeEventType(type);
    let fn;
    if (shouldNormalizeEvent(type)) {
        fn = normalizeEvent(type, cb);
    }
    else {
        fn = eventHandler;
    }
    function eventHandler(e) {
        const pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        const target = getClickedNode(pos);
        if (!target)
            return;
        cb(target);
    }
    addEvent(Manager.canvas, $type, fn);
    NodeEventManager.add(type, fn);
}
function removeNodeEvent(type, cb) {
    const $type = normalizeEventType(type);
    if (cb) {
        removeEvent(Manager.canvas, $type, cb);
        NodeEventManager.remove(type, cb);
    }
    else {
        NodeEventManager.getCbs(type).forEach(cb => {
            removeEvent(Manager.canvas, $type, cb);
        });
        NodeEventManager.remove(type);
    }
}

class Entry {
    static init(option) {
        Manager.init(option);
    }
    static drawBox(option) {
        return new Box(option);
    }
    static addEvent(type, cb) {
        listenToNodeEvent(type, cb);
    }
    static removeEvent(type) {
        removeNodeEvent(type);
    }
    static drawLine(from, to) {
        const line = new ArrowNode({
            name: 'line',
            pos: from
        });
        line.moveTo(to);
        return line;
    }
    static connect(line, from, to) {
        line.connect(from, to);
    }
}
Entry.nativeAddEvent = addEvent;
Entry.nativeRemoveEvent = removeEvent;
Entry.getClickedBox = getClickedBox;
Entry.getClickedNode = getClickedNode;
Entry.getClickedLine = getClickedLine;

export default Entry;
