import { xml2js } from 'xml-js'

const createModule = code => `export default "${code}"`

export default () => ({
  name: 'rollup-plugin-svg',
  transform: (code, id) => {
    if (!id.endsWith('.svg')) {
      return
    }
    const path = xml2js(code).elements[1].elements[0].attributes.d
    return {
      code: createModule(path),
      map: { mappings: '' },
    }
  },
})
