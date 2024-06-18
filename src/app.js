const path = require('path')
const chokidar = require('chokidar')

const {bundleRequire, JS_EXT_RE} = require('bundle-require')
const {isString, isFunction} = require('./utils')
const handleMap = new Map() // method-path -> handle
const pathMockMap = new Map() // pathname -> mock key list

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

// 加载模块任务列表
const loadTask = {
    queue: [],
    finished: true
}

// 记录正在加载的模块
const CUR_FILE = {
    path: null,
    cache: []
}

function addLoadTask(filePath) {
    if (!filePath || path.extname(filePath) !== '.js') return
    loadTask.queue.push(filePath)
}

async function runLoadTask() {
    if (!loadTask.finished) return
    loadTask.finished = false
    while (loadTask.queue.length) {
        const filePath = loadTask.queue.shift()
        console.log('模块加载开始：', filePath)
        try {
            await loadMockRoute(filePath)
            console.log('模块加载完成：', filePath)
        } catch (error) {
            console.log('模块加载失败：', filePath)
            console.log(error)
        }
    }
    loadTask.finished = true
}


// 加载mock路由
async function loadMockRoute(filePath) {
    CUR_FILE.path = filePath
    CUR_FILE.cache = []
    try {
        await resolveModule(filePath)
        checkNeedDelMock()
    } catch (err) {
        throw new Error(err)
    }
    CUR_FILE.path = null
    CUR_FILE.cache = []
}


// 监听并加载目录文件
function watchDir(path) {
    const watcher = chokidar.watch(path, {
        persistent: true // 持续监听
    });

    watcher
        .on('add', path => {
            addLoadTask(path)
            runLoadTask().then(res => {
            })
        })
        .on('change', path => {
            addLoadTask(path)
            runLoadTask().then(res => {
            })
        })
        .on('unlink', path => {
            pathMockCacheDelete(path)

        })
        .on('error', error => console.log(`[proxy-pre-mock]Watcher error: ${error}`));
}


function checkNeedDelMock() {
    // 新旧mock数据的diff
    const oldKeys = pathMockMap.get(CUR_FILE.path) || []
    const newKeys = CUR_FILE.cache
    const delKeys = oldKeys.filter(key => !newKeys.includes(key))
    delKeys.forEach(key => {
        handleMap.delete(key)
    })
    pathMockMap.set(CUR_FILE.path, CUR_FILE.cache)
}

function pathMockCacheDelete(filePath) {
    // 非法文件类型直接return
    if (path.extname(filePath) !== '.js') return
    console.log('模块已删除：', filePath)
    // 将path文件里面的mock删除
    const mockKeyList = pathMockMap.get(filePath)
    if (mockKeyList && mockKeyList.length) {
        mockKeyList.forEach(key => {
            handleMap.delete(key)
        })
    }
}

function addMock(path, method, handle) {

    if (!isString(path) || !isString(method) || !isFunction(handle)) {
        console.error(`[proxy-pre-mock][${method}-${path}]Please enter valid parameters: path: String, method: String, handle: Function`)
        return
    }

    const key = `${method.toUpperCase()}-${path}`

    CUR_FILE.cache.push(key)
    handleMap.set(key, handle)
}

function getMockHandle(path, method) {
    return handleMap.get(`${method.toUpperCase()}-${path}`)
}

module.exports = {
    addMock,
    watchDir,
    getMockHandle
}
