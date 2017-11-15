# class ArrowNode

ArrowNode inherit all methods from `CanvasNode`, and has some own ones.

## connect(from, to)

- from `<CanvasNode>`: from which `CanvasNode`.
- to `<CanvasNode>`: to which `CanvasNode`.

```js
line.connect(box1, box2)
```

> `conncet` only save the referrence of `from` and `to` to the line.\
Viusally, you need to set proper `pos` and call `moveTo` to actually 'connect' two box.

## abort()

Abort from the current connecting process.

```js
line.abort()
```