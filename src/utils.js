function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]'
}

function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]'
}

module.exports = {
    isString,
    isFunction
}
