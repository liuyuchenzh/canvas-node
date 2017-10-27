const ts = require('rollup-plugin-typescript2')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
module.exports = {
  input: 'src/index.ts',
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    ts({
      tsconfigOverride: {
        compilerOptions: {
          target: 'es6'
        }
      }
    })
  ],
  output: {
    file: 'index_es.js',
    format: 'es',
    name: 'CanvasNode'
  }
}
