# class CanvasNode

## draw()

Draw the node on canvas.\
In fact, this would update the whole canvas, in other wrods, redraw everything.

```js
node.draw()
```

## moveTo(pos)

- pos `<object>`: where to move to. In form of `{x: number, y: number}`

Internally, this would also invoke `draw` method.

```js
node.moveTo({x: 100, y: 100})
```

## remove([node])

- node `<CanvasNode>`: another node to be removed with. If not provided, only the invoking one will be removed.

```js
node.remove()
```

## forEach(fn)

- fn `<function(item, index, arr)>`: just like `Array.prototype.forEach`. This iterates all `CanvasNode` instances.

```js
node.forEach(item => {
  item.remove()
})
node.draw() // no CanvasNode would remain
```