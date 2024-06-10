const path = require('path')
const chokidar = require('chokidar')
const {isString, isFunction} = require('./utils')
const handleMap = new Map() // method-path -> handle
const pathMockMap = new Map() // pathname -> mock key list

const CUR_FILE = {
    path: null,
    cache: []
}

// 加载mock路由
function loadMockRoute(filePath) {
    if (!filePath) return
    if (require.cache[filePath]) {
        // 实现热更新
        delete require.cache[filePath]
    }
    // 非法文件类型直接return
    if (path.extname(filePath) !== '.js') return
    try {
        CUR_FILE.path = filePath
        CUR_FILE.cache = []
        require(filePath)
        checkNeedDelMock()
    } catch (err) {
        throw new Error(err)
    } finally {
        CUR_FILE.path = null
        CUR_FILE.cache = []
    }
}

// 监听并加载目录文件
function watchDir(path) {
    const watcher = chokidar.watch(path, {
        persistent: true // 持续监听
    });

    watcher
        .on('add', path => {
            console.log(`[proxy-pre-mock]${path} add`)
            loadMockRoute(path)
        })
        .on('change', path => {
            console.log(`[proxy-pre-mock]${path} update`)
            loadMockRoute(path)
        })
        .on('unlink', path => {
            console.log(`[proxy-pre-mock]${path} delete`)
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
