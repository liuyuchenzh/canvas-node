export function isBoolean(input: any): boolean {
  return typeof input === 'boolean'
}

export function isNum(input: number): boolean {
  return typeof input === 'number' && !isNaN(input)
}
