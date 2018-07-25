import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import copy from 'rollup-plugin-copy-assets'
import domProps from 'terser/tools/domprops'
import htmlAttributes from 'html-element-attributes'
import postcss from 'rollup-plugin-postcss'
import svg from './rollup-plugin-svg'

const reservedProperties = Array.from(
  new Set([...domProps].concat(...Object.values(htmlAttributes))),
)

const dev = process.env.NODE_ENV === 'development'
const watching = process.argv.includes('--watch') || process.argv.includes('-w')

export default {
  input: './src/index.tsx',
  output: {
    file: './dist/index.js',
    format: 'iife',
    sourcemap: dev,
  },
  plugins: [
    postcss({
      modules: true,
      extract: true,
    }),
    nodeResolve({
      extensions: [
        '.mjs',
        '.js',
        '.json',
        '.node',
        '.ts',
        '.tsx',
        '.css',
        '.svg',
      ],
    }),
    svg(),
    babel(),
    copy({
      assets: ['./src/index.html'],
    }),
    ...(dev
      ? []
      : [
          terser({
            compress: { unsafe: true, passes: 3 },
            mangle: {
              properties: {
                reserved: reservedProperties,
                regex: /^(?!on)/,
              },
            },
          }),
        ]),
    ...(watching ? [serve('dist')] : []),
  ],
}
