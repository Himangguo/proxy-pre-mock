const path = require('path')
const chokidar = require('chokidar')
const {isString, isFunction} = require('./utils')
const handleMap = new Map()

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
        require(filePath)
    } catch (err) {
        console.log(err)
    }
}

// 监听并加载目录文件
function watchDir(path) {
    const watcher = chokidar.watch(path, {
        persistent: true // 持续监听
    });

    watcher
        .on('add', path => {
            console.log(`文件 ${path} 已添加`)
            loadMockRoute(path)
        })
        .on('change', path => {
            console.log(`文件 ${path} 已更新`)
            loadMockRoute(path)
        })
        .on('unlink', path => console.log(`文件 ${path} 已删除`))
        .on('error', error => console.log(`Watcher 错误: ${error}`));
}


function addMock(path, method, enable = true, handle) {
    if (!isString(path) || !isString(method) || !isFunction(handle)) {
        console.error('请输入合法的参数：path: String, method: String, handle: Function')
        return
    }
    const key = `${method.toUpperCase()}-${path}`
    if (!enable) {
        // 如果不启用mock，就删除此mock的hash
        console.log('删除mock', key)
        handleMap.delete(key)
    } else {
        console.log('启用mock', key)
        handleMap.set(key, handle)
    }
}

function getMockHandle(path, method) {
    return handleMap.get(`${method.toUpperCase()}-${path}`)
}

module.exports = {
    addMock,
    watchDir,
    getMockHandle
}
