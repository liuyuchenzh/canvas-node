import { isUndef, isNull } from './types';
var PRIVATE_KEY = 'canvas-node';
var KEY_NAME = Symbol(PRIVATE_KEY);
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
export { Batch };
//# sourceMappingURL=batch.js.map