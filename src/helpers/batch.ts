import { isUndef, isNull } from './types'

export type BatchCallback = (...args: any[]) => any
const PRIVATE_KEY: string = 'canvas-node'
const KEY_NAME: symbol = Symbol(PRIVATE_KEY)

export class Batch {
  static timer: number = 0
  static list: BatchCallback[] = []

  /**
   * add callback to list
   * @param {BatchCallback} fn 
   * @param {any=} uniqueKey: used to track callback. For callbacks share the same key, only the last fn will be fired (throttle)
   * @returns {void}
   */
  static add(fn: BatchCallback, uniqueKey?: any) {
    if (!isUndef(uniqueKey) && !isNull(uniqueKey)) {
      fn[KEY_NAME] = uniqueKey
      const existed: boolean = this.includes(uniqueKey)
      if (existed) {
        this.unify(uniqueKey, fn)
      } else {
        this.list.push(fn)
      }
    } else {
      this.list.push(fn)
    }
    this.batch()
  }

  /**
   * find whether the type of callback (with the same uniqueKey) existed
   * @param {any} key
   * @return {boolean} 
   */
  static includes(key: any): boolean {
    return this.list.some(cb => {
      return cb[KEY_NAME] === key
    })
  }

  /**
   * make sure only one callback with the sepecific uniqueKey existed
   * @param {any} key : unique key for the callback
   * @param {BatchCallback} fn 
   */
  static unify(key: any, fn: BatchCallback) {
    this.list.map(cb => {
      if (cb[KEY_NAME] === key) {
        return fn
      }
      return cb
    })
  }

  static batch() {
    cancelAnimationFrame(this.timer)
    this.timer = requestAnimationFrame(() => {
      this.invoke()
    })
  }

  static invoke() {
    const len: number = this.list.length
    let i: number = 0
    while (i < len) {
      const cb: BatchCallback = this.list[i]
      cb()
      i++
    }
    this.list = []
  }
}
