const {bundleRequire, JS_EXT_RE} = require('bundle-require')

const getRandomId = () => {
    return Math.random().toString(36).substring(2, 15);
}

const getOutputFile = (filepath, format) => filepath.replace(
    JS_EXT_RE,
    `.bundled_${getRandomId()}.${format === "esm" ? "mjs" : "cjs"}`
)

async function resolveModule(filepath) {
    await bundleRequire({
        filepath,
        getOutputFile
    })
}

module.exports = {
    resolveModule
}
