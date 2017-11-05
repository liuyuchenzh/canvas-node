# class ArrowNode

ArrowNode inherit all methods from `CanvasNode`, and has some own ones.

## connect(from, to)

- from `<CanvasNode>`: from which `CanvasNode`.
- to `<CanvasNode>`: to which `CanvasNode`.

```js
line.connect(box1, box2)
```

## abort()

Abort from the current connecting process.

```js
line.abort()
```