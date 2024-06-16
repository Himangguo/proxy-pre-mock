const path = require('path')
const {watchDir, getMockHandle} = require('./app')

function webpack5Middleware(mockDir) {
    if (!path.isAbsolute(mockDir)) {
        mockDir = path.resolve(process.cwd(), mockDir)
    }
    // 监听并加载目录文件
    watchDir(mockDir)

    const middleware = {
        name: 'proxy-pre-mock',
        middleware: (req, res, next) => {
            // 1.解析pathname和method
            const pathname = req._parsedUrl.pathname
            const method = req.method
            // 2.找到命中的mock路由
            const handle = getMockHandle(pathname, method)
            if (handle) {
                const result = handle(req, res)
                if (!res.finished && result) {
                    // 命中返回mock数据
                    res.json(result)
                }
            } else {
                // 没命中，走devServer的proxy正向代理逻辑
                next()
            }
        }
    }
    return middleware
}

module.exports = webpack5Middleware
