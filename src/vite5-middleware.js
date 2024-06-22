const path = require('path')
const {getMockHandle} = require('./app')
const {watchDir} = require('./watch')

function vite5Plugin(mockDir) {
    if (!path.isAbsolute(mockDir)) {
        mockDir = path.resolve(process.cwd(), mockDir)
    }
    // 监听并加载目录文件
    watchDir(mockDir)

    return {
        name: 'proxy-pre-mock',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                // 1.解析pathname和method
                const pathname = req._parsedUrl.pathname
                const method = req.method
                // 2.找到命中的mock路由
                const {handle, params} = getMockHandle(pathname, method) || {}
                if (handle) {
                    req.params = params
                    // 在vite5环境下运行时报错res没有json这个方法,所以改成res.end
                    res.setHeader('Content-Type', 'application/json');
                    const result = handle(req, res)
                    if (!res.finished && result) {
                        // 命中返回mock数据
                        res.end(JSON.stringify(result))
                    }
                } else {
                    // 没命中，走devServer的proxy正向代理逻辑
                    next()
                }
            })
        }
    }
}

module.exports = vite5Plugin
