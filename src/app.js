const path = require('path')
const {pathToRegexp} = require('path-to-regexp')
const {resolveModule} = require('./resolve')
const {MockMethodList} = require('./enum')

const {isString, isFunction} = require('./utils')
const handleMap = new Map() // method-path -> handle
const pathMockMap = new Map() // pathname -> mock key list

// 记录正在加载的模块
const CUR_FILE = {
    path: null,
    cache: []
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

function addMockCore(path, method, handle, mockSwitch = true) {
    if (!mockSwitch) return
    if (!isString(path) || !isString(method) || !isFunction(handle)) {
        console.error(`[proxy-pre-mock][${method}-${path}]Please enter valid parameters: path: String, method: String, handle: Function`)
        return
    }

    const key = `${method.toUpperCase()}-${path}`

    CUR_FILE.cache.push(key)
    handleMap.set(key, handle)
}

function addMock(path, method, handle, mockSwitch) {
    return addMockCore(path, method, handle, mockSwitch)
}

MockMethodList.forEach(method => {
    addMock[method] = function (path, handle, mockSwitch) {
        return addMockCore(path, method, handle, mockSwitch)
    }
})

function getMockHandle(path, method) {
    // 由于path可能存在动态路由参数，所以需要匹配一下
    for (const key of handleMap.keys()) {
        const [_, m, p] = key.match(/([^-/]+)-(.+)/)
        const regexp = pathToRegexp(p);
        const match = regexp.exec(path);

        if (method.toUpperCase() === m.toUpperCase() && match) {
            // 如果路由匹配上了
            const params = {};
            regexp.keys.forEach((key, index) => {
                params[key.name] = match[index + 1];
            });
            return {
                params,
                handle: handleMap.get(key)
            }
        }
    }
}

module.exports = {
    addMock,
    getMockHandle,
    pathMockCacheDelete,
    loadMockRoute
}
