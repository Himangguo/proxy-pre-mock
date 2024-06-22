const chokidar = require('chokidar')
const {pathMockCacheDelete} = require('./app')
const {addLoadTask, runLoadTask} = require('./queueTask')
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
        .on('error', error => console.log(`【proxy-pre-mock】Watcher error: ${error}`));
}


module.exports = {
    watchDir
}
