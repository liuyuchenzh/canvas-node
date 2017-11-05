# API

> `CanvasNode` means two thing in this doc.
> One is the exposed object with all the methods described below.
> Anthoer one is internal class, defination of which can be found [here](./canvasNode.md).
> Should be easy to tell which is which based on the context.
>
> And here you can find out what is [`ArrowNode`](./line.md)

## CanvasNode.init(option)

- option `<object>`
  - canvas `<HTMLCanvasElement>`

```js
CanvasNode.init({
  canvas: canvasDom
})
```

## CanvasNode.drawBox(option)

- option `<object>`
  - name `<string>`: name of the instance.
  - pos `<object>`: starting point of the box. In form of `{x: number, y: number}`.
  - path `<Path2D>`: path for the box.
  - rawVertexes `<number[]>`: [x, y, width, height] of the box. More likely should be [0, 0, width, height].
  - [text] `<string>`: text to show.
  - [data] `<any>`: any thing to bind with the box.
  - [style] `<string>`: fill style of the box.
  - [strokeStyle] `<string>`: stroke style of the box.
  - [font] `<string>`: font style of the text.
  - [drawCb] `<function>`: custom callback for extra drawing.

return `<Box>`

## CanvasNode.drawLine(from [, to])

- from `<object>`: starting point in form of `{x: number, y: number}`.
- [to] `<object>`: ending point.

return `<ArrowNode>`

## CanvasNode.connect(line, fromBox, toBox)

- line `<ArrowNode>`
- fromBox `<Box>`
- toBox `<Box>`

## CanvasNode.addEvent(type, cb)

- type `<string>`: type of event to be listened to. Type name just like the native ones, like `click` etc.
- cb `<function(node)>`: handler function.
  - node `<CanvasNode>`: the target node that such event happening on.

```js
CanvasNode.addEvent('mouseover', node => {
  console.log(node) // when the cursor is over the node, this will execute
})
```

## CanvasNode.removeEvent(type)

- type `<string>`: type of event wish to stop listening to.

## CanvasNode.nativeAddEvent(el, type, handler)

- el `<HTMLElement>`: delegating element.
- type `<string>`: type of native event to listen to.
- handler `<function(event)>`: event handler.

## CanvasNode.nativeRemoveEvent(el, type [, handler])

- el `<HTMLElement>`: delegating element.
- type `<string>`: type of native event wish to stop listening to.
- [handler] `<function(event)>`: specific handler to be removed. If not provided, all handlers registered by `CanvasNode.nativeAddEvent` for such type of event will be removed.

## CanvasNode.getClickedBox(position)

- position `{object}`: clicked position in form of `{x: number, y: number}`.

return `Box`

## CavansNode.getClickedLine(position)

- position `{object}`: clicked position in form of `{x: number, y: number}`.

return `ArrowNode`

## CanvasNode.centralizePoint(box)

- box `<Box>`: the center point of which will be returned.

return `{x: number, y: number}`

## CanvasNode.placePointOnEdge(startPos, endPos, box [, isStart])

- startPos `<object>`: start point position.
- endPos `<object>`: end point position.
- box `<Box>`: of which the point will be placed on.
- [isStart]: if the point is starting point, default `true`.