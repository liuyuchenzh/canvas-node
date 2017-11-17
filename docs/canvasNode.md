# class CanvasNode

CanvasNode will proxy a list of properties.\
Whenever you assign values to them, the view will be automatically updated, aka invoking `draw` method.\
List showed below.

```js
font
size
style
strokeStyle
color
text
end
endPos
display
```

## draw()

Draw the node on canvas.\
In fact, this would update the whole canvas, in other wrods, redraw everything.

> In most cases, you don't need to call `draw` since the `CanvasNode` handle the update for you.\
But if you have some unique need to update the view, then you can alway use `draw` manually.

```js
node.draw()
```

## moveTo(pos)

- pos `<object>`: where to move to. In form of `{x: number, y: number}`

Internally, this would also invoke `draw` method.

```js
node.moveTo({x: 100, y: 100})
```

## addDrawCb(callback)

- callback `<function(node)>`: drawing callback. You can draw anything.
  - node `<CanvaseNode>`: node being drew on.
  
## addBeforeDrawCb(callback)

- callback `<function(node)>`: drawing callback. You can draw anything.
  - node `<CanvaseNode>`: node being drew on.

## remove([node])

- node `<CanvasNode>`: another node to be removed with. If not provided, only the invoking one will be removed.

```js
node.remove()
```

## show()

Display the instance.

## hide()

Hide the instance.

## watch(key, callback)

- key `<string>`: member of auto-update-list listed on the top of this page.
- callback `<function(newVal, oldVal)>`: callback to react to change
  - newVal `<any>`: new value for the `key` field.
  - oldVal `<any>`: old value for the `key` field

## hover(inCallback[, outCallback])

- inCallback `<function(event, node)>`: called (multiple times) when the node is being hovered.
  - event `<Event>`: native event.
  - node `<CanvasNode>`: node being hovered.
- [outCallback] `<function(event, node)>`: called (only once) when the node stops being hovered.

```js
const color = node.color
const hoverColor = '#fff'
node.hover(() => {
  node.color = hoverColor
}, () => {
  node.color = color
})
```

## click(callback)

- callback `<function(event, node)>`: called (once) when the node is being clicked
  - event `<Event>`: native event.
  - node `<CanvasNode>`: node being clicked.

```js
node.click((e, target) => {
  console.log('node is clicked', target)
})
```

## forEach(fn)

- fn `<function(item, index, arr)>`: just like `Array.prototype.forEach`. This iterates all `CanvasNode` instances.

```js
node.forEach(item => {
  item.remove()
})
node.draw() // no CanvasNode would remain
```

## destroy()

Like it suggests, destroy the node