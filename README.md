# proxy-pre-mock
简单的mock插件，快速实现mock开发需求

## 1.下载
```
npm i proxy-pre-mock -D
```

## 2.使用
### a、在webpack5项目中
`vue.config.js`:

```js
const {webpack5Middleware} = require('proxy-pre-mock')
module.exports = defineConfig({
    devServer: {
        setupMiddlewares: (middlewares) => {
            middlewares.unshift(webpack5Middleware('mock'));
            return middlewares;
        }
    }
})
```
webpack5Middleware接受一个参数：mock文件所在的目录（可以是相对定位，也可以是绝对定位）

`mock目录下创建js文件：`
>
> 1、支持热更新：新增、修改、注释、删除js文件都能立刻响应，不需要重启项目。
> 2、一个文件中可以调用多次addMock。
> 3、【注意】避免添加两个相同的addMock，不然会出现意想不到的bug，如果出现，请删除后重启项目。

addMock支持三个参数：
- path：请求地址pathname
- method：请求方法
- handle(req, res)：响应体函数，你可以使用req， res中的任何数据或方法


```js
// commonjs：
const { addMock } = require('proxy-pre-mock')

// 基础用法
addMock('/api/check', 'get',(req)=>{
    return {
        code: 200,
        data: {
            name: 'check',
            age: 14
        }
    }
})
```
```js
// 修改状态码
addMock('/api/check', 'get',(req, res)=>{
    res.statusCode = 500
    return {
        code: 200,
        data: {
            name: 'check',
            age: 14
        }
    }
})
```
```js
// 延迟响应
addMock('/api/check', 'get',(req, res)=>{
    setTimeout(()=>{
        res.end('dddddddddd')
    },3000)
})
```
```js
// 3.使用第三方库
import Mock from 'mockjs'

addMock('/api/check', 'get',(req, res)=>{
    const list =  Mock.mock({
        'list|1-10': [{
            'id|+2': 0
        }]
    })
    return {
        code: 200,
        data: list
    }
})

```
### b、在vite项目中
>vite5Plugin方法和webpack版本的大致相同，只是在vite5中是以插件的形式启动的

`vite.config.js`:
```js
import { vite5Plugin } from 'proxy-pre-mock'
export default defineConfig({
    plugins: [
        vite5Plugin('mock')
    ]
})
```
