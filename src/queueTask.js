const path = require('path')
const {loadMockRoute} = require('./app')
// 加载模块任务列表
const loadTask = {
    queue: [],
    finished: true
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

module.exports = {
    addLoadTask,
    runLoadTask
}
