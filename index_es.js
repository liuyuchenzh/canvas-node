/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function getVertexesForRect(raw) {
    if (raw.length > 4)
        console.error('only support rect now!');
    var x = raw[0], y = raw[1], w = raw[2], h = raw[3];
    return [x, y, x + w, y, x + w, y + h, x, y + h];
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

function findFromRight(list, fn) {
    var len = list.length;
    var i = len - 1;
    while (i && i > -1) {
        var item = list[i];
        if (fn(item, i, list))
            return item;
        i--;
    }
}

var MARGIN_ERROR$1 = 4;
function isPointInPolygon(vertexes, pos) {
    var poly = convertToPoly(vertexes);
    return isPointInPath(pos.x, pos.y, poly);
}
function isPointInPath(x, y, poly) {
    return pointInPolygon([x, y], poly);
}
function convertToPoly(vertexes) {
    return vertexes.reduce(function (last, vertex, i) {
        var pos = Math.floor(i / 2);
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
    var x = pos.x, y = pos.y;
    var start = poly[0], control = poly[1], end = poly[2];
    var startX = start[0], startY = start[1];
    var controlX = control[0], controlY = control[1];
    var endX = end[0], endY = end[1];
    var numOfTest = Math.floor(distanceBetween2Points(startX, startY, endX, endY)) / 2;
    var inc = 1 / numOfTest;
    var t = inc;
    while (t < 1) {
        var lineX = simulateCurve(startX, controlX, endX, t);
        var lineY = simulateCurve(startY, controlY, endY, t);
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
    var squareDis = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.pow(squareDis, 0.5);
}
function getClickedNode(pos) {
    var list = Manager.list;
    return findFromRight(list, function (node) {
        if (node instanceof ArrowNode) {
            return isPointOnCurve(node.stops, pos);
        }
        if (!node.vertexes)
            return false;
        return isPointInPolygon(node.vertexes, pos);
    });
}
function getClickedBox(pos) {
    var list = Manager.list.filter(function (node) { return !(node instanceof ArrowNode); });
    return findFromRight(list, function (node) { return isPointInPolygon(node.vertexes, pos); });
}
function getClickedLine(pos) {
    var list = Manager.list.filter(function (node) { return node instanceof ArrowNode; });
    return findFromRight(list, function (node) { return isPointOnCurve(node.stops, pos); });
}

var MARGIN_ERROR = 5;
function drawTriangle() {
    var triangle = new Path2D();
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
    var diff = startPoint - endPoint;
    return withInMargin(diff) ? startPoint : endPoint;
}
function getDirection(start, end) {
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
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
function getDirectionForStart(start, end) {
    var dir = getDirection(start, end);
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    switch (dir) {
        case 'top':
        case 'bottom':
            if (withInMargin(startX - endX)) {
                return endY > startY ? 'top' : 'bottom';
            }
            return endX > startX ? 'left' : 'right';
        case 'left':
        case 'right':
            if (withInMargin(startY - endY)) {
                return endX > startX ? 'left' : 'right';
            }
            return endY > startY ? 'top' : 'bottom';
    }
}
function calculateStop(x1, y1, x2, y2) {
    var dir = getDirection({
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
function fixRatio(ratio) {
    return Math.min(Math.max(0.001, ratio), 0.999);
}
function drawLine(ctx, start, end, ratio, arrowPath, colorObj) {
    var style = colorObj.style, strokeStyle = colorObj.strokeStyle;
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    var $endX = normalizeEndPoint(startX, endX);
    var $endY = normalizeEndPoint(startY, endY);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    var stop = calculateStop(startX, startY, $endX, $endY);
    ctx.quadraticCurveTo(stop[0], stop[1], $endX, $endY);
    var arrowX = simulateCurve(startX, stop[0], $endX, fixRatio(ratio));
    var arrowY = simulateCurve(startY, stop[1], $endY, fixRatio(ratio));
    var arrowDirX = getDirective(startX, stop[0], $endX, fixRatio(ratio));
    var arrowDirY = getDirective(startY, stop[1], $endY, fixRatio(ratio));
    var tan = arrowDirY / arrowDirX;
    var angle = Math.atan(tan);
    var goLeft = $endX < startX;
    var rotateAngle = goLeft ? angle - Math.PI : angle;
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(rotateAngle);
    var triangle = drawTriangle();
    ctx.fillStyle = style;
    ctx.fill(arrowPath || triangle);
    ctx.restore();
}
function centralizePoint(node) {
    var _a = node.rawVertexes.slice(2), width = _a[0], height = _a[1];
    return {
        x: node.pos.x + width / 2,
        y: node.pos.y + height / 2
    };
}
function placePointOnEdge(start, end, node, isStart) {
    if (isStart === void 0) { isStart = true; }
    var dir = isStart
        ? getDirectionForStart(start, end)
        : getDirection(start, end);
    return calculatePos(dir, node);
}
function calculatePos(dir, node) {
    var _a = node.rawVertexes.slice(2), width = _a[0], height = _a[1];
    var x;
    var y;
    switch (dir) {
        case 'bottom':
            x = node.pos.x + width / 2;
            y = node.pos.y;
            break;
        case 'top':
            x = node.pos.x + width / 2;
            y = node.pos.y + height;
            break;
        case 'right':
            x = node.pos.x;
            y = node.pos.y + height / 2;
            break;
        case 'left':
            x = node.pos.x + width;
            y = node.pos.y + height / 2;
            break;
    }
    return {
        x: x,
        y: y
    };
}

function random() {
    return parseInt(Date.now() + '' + Math.floor(Math.random() * 1000000), 16);
}
var PRIVATE_KEY = 'canvas-node-fn-key';
var TAG_NAME = Symbol(PRIVATE_KEY);
function tagFn(fn) {
    fn[TAG_NAME] = random();
    return fn;
}
function inheritTag(source, target) {
    var tag = source[TAG_NAME];
    if (tag) {
        target[TAG_NAME] = tag;
    }
    return target;
}
function isSameFn(fn1, fn2) {
    var fn1Tag = fn1[TAG_NAME];
    var fn2Tag = fn2[TAG_NAME];
    if (fn1Tag && fn2Tag) {
        return fn1Tag !== fn2Tag;
    }
    return fn1 !== fn2;
}

var EventManager = (function () {
    function EventManager() {
    }
    EventManager.add = function (el, type, cb) {
        var item = findEventItem(el, type);
        if (!item) {
            item = {
                el: el,
                type: type,
                cbs: []
            };
        }
        item.cbs.push(cb);
        this.list.push(item);
    };
    EventManager.remove = function (el, type, cb) {
        var item = findEventItem(el, type);
        if (!item)
            return;
        if (!cb) {
            item.cbs = [];
        }
        else {
            item.cbs = item.cbs.filter(function (oldCb) { return isSameFn(oldCb, cb); });
        }
    };
    EventManager.list = [];
    return EventManager;
}());
function findEventItem(el, type) {
    return EventManager.list.find(function (item) { return item.el === el && item.type === type; });
}
function addEvent(el, type, cb) {
    var item = findEventItem(el, type);
    if (!item) {
        el.addEventListener(type, function handler(e) {
            var cbs = findEventItem(el, type).cbs;
            cbs.forEach(function (cb) {
                cb(e);
            });
        });
    }
    EventManager.add(el, type, cb);
}
function removeEvent(el, type, cb) {
    EventManager.remove(el, type, cb);
}

var NORMALIZE_LIST = ['mousemove', 'mouseout'];
var target;
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
        var pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        var node = getClickedNode(pos);
        if (!node)
            return;
        target = node;
        cb(e, node);
    };
}
function generateMouseOutHandler(cb) {
    return function handler(e) {
        var pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        var node = getClickedNode(pos);
        if (node === target)
            return;
        if (!target)
            return;
        cb(e, target);
        target = null;
    };
}

var NodeEventManager = (function () {
    function NodeEventManager() {
    }
    NodeEventManager.add = function (type, cb) {
        var item = this.getItem(type);
        if (!item) {
            item = {
                type: type,
                cbs: [cb]
            };
            this.list.push(item);
        }
        else {
            item.cbs.push(cb);
        }
    };
    NodeEventManager.getCbs = function (type) {
        return this.getItem(type).cbs;
    };
    NodeEventManager.getItem = function (type) {
        return this.list.find(function (item) { return item.type === type; });
    };
    NodeEventManager.remove = function (type, cb) {
        if (!cb) {
            this.list = this.list.filter(function (item) { return item.type !== type; });
        }
        else {
            var item = this.getItem(type);
            if (!item)
                return;
            item.cbs = item.cbs.filter(function (oldCb) { return isSameFn(oldCb, cb); });
        }
    };
    NodeEventManager.list = [];
    return NodeEventManager;
}());
function listenToNodeEvent(type, cb) {
    var $type = normalizeEventType(type);
    var fn;
    if (shouldNormalizeEvent(type)) {
        fn = normalizeEvent(type, cb);
    }
    else {
        fn = eventHandler;
    }
    function eventHandler(e) {
        var pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        var target = getClickedNode(pos);
        if (!target)
            return;
        cb(e, target);
    }
    inheritTag(cb, fn);
    addEvent(Manager.canvas, $type, fn);
    NodeEventManager.add(type, fn);
}
function removeNodeEvent(type, cb) {
    var $type = normalizeEventType(type);
    if (cb) {
        removeEvent(Manager.canvas, $type, cb);
        NodeEventManager.remove(type, cb);
    }
    else {
        NodeEventManager.getCbs(type).forEach(function (cb) {
            removeEvent(Manager.canvas, $type, cb);
        });
        NodeEventManager.remove(type);
    }
}

function isUndef(input) {
    return typeof input === 'undefined';
}
function isNull(input) {
    return input === null;
}

var PRIVATE_KEY$1 = 'canvas-node';
var KEY_NAME = Symbol(PRIVATE_KEY$1);
var Batch = (function () {
    function Batch() {
    }
    Batch.add = function (fn, uniqueKey) {
        if (!isUndef(uniqueKey) && !isNull(uniqueKey)) {
            fn[KEY_NAME] = uniqueKey;
            var existed = this.includes(uniqueKey);
            if (existed) {
                this.unify(uniqueKey, fn);
            }
            else {
                this.list.push(fn);
            }
        }
        else {
            this.list.push(fn);
        }
        this.batch();
    };
    Batch.includes = function (key) {
        return this.list.some(function (cb) {
            return cb[KEY_NAME] === key;
        });
    };
    Batch.unify = function (key, fn) {
        this.list.map(function (cb) {
            if (cb[KEY_NAME] === key) {
                return fn;
            }
            return cb;
        });
    };
    Batch.batch = function () {
        var _this = this;
        cancelAnimationFrame(this.timer);
        this.timer = requestAnimationFrame(function () {
            _this.invoke();
        });
    };
    Batch.invoke = function () {
        var len = this.list.length;
        var i = 0;
        while (i < len) {
            var cb = this.list[i];
            cb();
            i++;
        }
        this.list = [];
    };
    Batch.timer = 0;
    Batch.list = [];
    return Batch;
}());

function defaultData() {
    return {
        font: '14px Arial',
        style: '#fff',
        strokeStyle: '#000',
        color: '#000',
        data: {}
    };
}
var CanvasNode = (function () {
    function CanvasNode(option) {
        this.drawCbs = [];
        this.lines = [];
        this.autoUpdateFields = [
            'font',
            'size',
            'style',
            'strokeStyle',
            'color',
            'text'
        ];
        this.hoverInCb = [];
        this.hoverOutCb = [];
        this.clickCb = [];
        this.proxy();
        Object.assign(this, defaultData(), option, {
            ctx: Manager.ctx,
            size: Manager.size
        });
        this.$moveTo(this.pos);
        Manager.add(this);
    }
    CanvasNode.prototype.proxy = function () {
        var _this = this;
        var inited = [];
        this.autoUpdateFields.forEach(function (key) {
            Object.defineProperty(_this, key, {
                get: function () {
                    return this['$' + key];
                },
                set: function (val) {
                    var _this = this;
                    this['$' + key] = val;
                    if (!inited.includes(key)) {
                        return inited.push(key);
                    }
                    Batch.add(function () {
                        _this.draw();
                    }, this);
                }
            });
        });
    };
    Object.defineProperty(CanvasNode.prototype, "vertexes", {
        get: function () {
            var _this = this;
            if (!this.rawVertexes)
                return;
            var rawData = this.rawVertexes.map(function (vertex, i) {
                var pos = i === 0 ? 'x' : i === 1 ? 'y' : 'z';
                return i < 2 ? vertex + _this.pos[pos] : vertex;
            });
            return getVertexesForRect(rawData);
        },
        enumerable: true,
        configurable: true
    });
    CanvasNode.prototype.moveTo = function (pos) {
        Manager.moveTo(this, pos);
    };
    CanvasNode.prototype.$moveTo = function (pos) {
        this.updatePos(pos);
        this.$draw();
        this.updateLinePos();
    };
    CanvasNode.prototype.$draw = function () {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.drawBorder();
        this.fill();
        this.fillText();
        this.invokeDrawCb();
        this.ctx.restore();
    };
    CanvasNode.prototype.draw = function () {
        Manager.draw();
    };
    CanvasNode.prototype.updatePos = function (pos) {
        this.pos = pos;
    };
    CanvasNode.prototype.drawBorder = function () {
        if (!this.path)
            return;
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke(this.path);
    };
    CanvasNode.prototype.fill = function () {
        if (!this.path)
            return;
        this.ctx.fillStyle = this.style;
        this.ctx.fill(this.path);
    };
    CanvasNode.prototype.fillText = function (text) {
        if (text === void 0) { text = this.text; }
        if (!this.path)
            return;
        var $text = typeof text === 'string' ? text : this.text;
        var _a = this.rawVertexes.slice(2), width = _a[0], height = _a[1];
        this.ctx.font = this.font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.save();
        this.ctx.translate(width / 2, height / 2);
        this.ctx.fillStyle = this.color || '#000';
        this.ctx.fillText($text, 0, 0);
        this.updateText($text);
        this.ctx.restore();
    };
    CanvasNode.prototype.updateText = function (text) {
        this.text = text;
    };
    CanvasNode.prototype.invokeDrawCb = function () {
        var _this = this;
        this.drawCbs.forEach(function (cb) { return cb(_this); });
    };
    CanvasNode.prototype.addLine = function (line) {
        this.lines.push(line);
    };
    CanvasNode.prototype.updateLinePos = function () {
        var _this = this;
        this.lines.forEach(function (line) {
            switch (_this) {
                case line.from:
                    line.pos = centralizePoint(_this);
                    break;
                case line.to:
                    line.endPos = centralizePoint(_this);
                    break;
            }
        });
    };
    CanvasNode.prototype.remove = function (node) {
        node && Manager.deleteNode(node);
        Manager.deleteNode(this);
        Manager.draw();
    };
    CanvasNode.prototype.forEach = function (fn) {
        Manager.list.forEach(fn);
    };
    CanvasNode.prototype.addDrawCb = function (cb) {
        this.drawCbs.push(cb);
    };
    CanvasNode.prototype.hover = function (inCb, outCb) {
        var _this = this;
        var $inCb = function (e, node) {
            if (node !== _this)
                return;
            inCb(e, node);
        };
        tagFn($inCb);
        listenToNodeEvent('mousemove', $inCb);
        this.hoverInCb.push($inCb);
        if (!outCb)
            return;
        var $outCb = function (e, node) {
            if (node !== _this)
                return;
            outCb(e, node);
        };
        tagFn($outCb);
        listenToNodeEvent('mouseout', $outCb);
        this.hoverOutCb.push($outCb);
    };
    CanvasNode.prototype.click = function (clickCb) {
        var _this = this;
        var $clickCb = function (e, node) {
            if (node !== _this)
                return;
            clickCb(e, node);
        };
        tagFn($clickCb);
        listenToNodeEvent('click', $clickCb);
        this.clickCb.push($clickCb);
    };
    CanvasNode.prototype.destory = function () {
        this.remove();
        this.hoverInCb.forEach(function (cb) {
            removeNodeEvent('mousemove', cb);
        });
        this.hoverOutCb.forEach(function (cb) {
            removeNodeEvent('mouseout', cb);
        });
        this.clickCb.forEach(function (cb) {
            removeNodeEvent('click', cb);
        });
    };
    return CanvasNode;
}());

function getDefaultOption() {
    return {
        ratio: 0.5
    };
}
var ArrowNode = (function (_super) {
    __extends(ArrowNode, _super);
    function ArrowNode(option) {
        return _super.call(this, Object.assign({}, getDefaultOption(), option)) || this;
    }
    Object.defineProperty(ArrowNode.prototype, "stops", {
        get: function () {
            var stop = calculateStop(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y);
            return [[this.pos.x, this.pos.y], stop, [this.endPos.x, this.endPos.y]];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrowNode.prototype, "colorObj", {
        get: function () {
            return {
                strokeStyle: this.strokeStyle,
                style: this.style
            };
        },
        enumerable: true,
        configurable: true
    });
    ArrowNode.prototype.$moveTo = function (end) {
        this.updateEndPos(end);
        drawLine(this.ctx, this.pos, end, this.ratio, this.arrowPath, this.colorObj);
    };
    ArrowNode.prototype.$draw = function () {
        drawLine(this.ctx, this.pos, this.endPos, this.ratio, this.arrowPath, this.colorObj);
    };
    ArrowNode.prototype.updateEndPos = function (end) {
        this.endPos = end;
    };
    ArrowNode.prototype.connect = function (from, to) {
        var _this = this;
        this.from = from;
        this.to = to;
        [from, to].forEach(function (node) {
            node.addLine(_this);
        });
    };
    ArrowNode.prototype.abort = function () {
        Manager.deleteNode(this);
        Manager.draw();
    };
    return ArrowNode;
}(CanvasNode));

var Manager = (function () {
    function Manager() {
    }
    Manager.init = function (option) {
        var canvas = option.canvas;
        var size = {
            x: canvas.width,
            y: canvas.height
        };
        var ctx = canvas.getContext('2d');
        this.bindSize(size);
        this.bindCtx(ctx);
        this.bindCanvas(canvas);
    };
    Manager.add = function (node) {
        this.list.push(node);
    };
    Manager.bindSize = function (size) {
        this.size = size;
    };
    Manager.bindCtx = function (ctx) {
        this.ctx = ctx;
    };
    Manager.bindCanvas = function (canvas) {
        this.canvas = canvas;
    };
    Manager.draw = function () {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.save();
        this.list.forEach(function (node) {
            node.$draw();
        });
        this.ctx.restore();
    };
    Manager.moveTo = function (target, pos) {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.save();
        this.list.forEach(function (node) {
            var isArrowNode = node instanceof ArrowNode;
            var $pos = node === target
                ? pos
                : isArrowNode ? node.endPos : node.pos;
            node.$moveTo($pos);
        });
        this.ctx.restore();
    };
    Manager.deleteNode = function (target) {
        var _this = this;
        var index = this.list.findIndex(function (node) { return node === target; });
        this.list.splice(index, 1);
        if (target.lines.length) {
            target.lines.forEach(function (line) {
                _this.list = _this.list.filter(function (node) { return node !== line; });
            });
        }
        if (target instanceof ArrowNode) {
            this.deleteConnectedBox(target);
        }
    };
    Manager.deleteConnectedBox = function (line) {
        if (!line.to || !line.from)
            return;
        var fromNode = line.from;
        var toNode = line.to;
        [fromNode, toNode].forEach(function (node) {
            node.lines = node.lines.filter(function (oldLine) { return oldLine !== line; });
        });
    };
    Manager.list = [];
    return Manager;
}());

var Menu = (function (_super) {
    __extends(Menu, _super);
    function Menu(option) {
        return _super.call(this, option) || this;
    }
    return Menu;
}(CanvasNode));

var Entry = (function () {
    function Entry() {
    }
    Entry.init = function (option) {
        Manager.init(option);
    };
    Entry.drawBox = function (option) {
        return new CanvasNode(option);
    };
    Entry.addEvent = function (type, cb) {
        listenToNodeEvent(type, cb);
    };
    Entry.removeEvent = function (type) {
        removeNodeEvent(type);
    };
    Entry.drawLine = function (from, to) {
        var line = new ArrowNode({
            name: 'line',
            pos: from
        });
        to && line.moveTo(to);
        return line;
    };
    Entry.connect = function (line, from, to) {
        line.connect(from, to);
    };
    Entry.nativeAddEvent = addEvent;
    Entry.nativeRemoveEvent = removeEvent;
    Entry.getClickedNode = getClickedNode;
    Entry.getClickedLine = getClickedLine;
    Entry.getClickedBox = getClickedBox;
    Entry.centralizePoint = centralizePoint;
    Entry.placePointOnEdge = placePointOnEdge;
    Entry.ArrowNode = ArrowNode;
    Entry.Menu = Menu;
    Entry.Node = CanvasNode;
    return Entry;
}());

export default Entry;
