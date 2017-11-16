export function isUndef(input: any): boolean {
  return typeof input === 'undefined'
}

export function isNull(input: any): boolean {
  return input === null
}

export function isFn(input: any): boolean {
  return typeof input === 'function'
}