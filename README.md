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

`mock文件`:在上面传的mock目录下创建一个js文件
>
> 支持热更新：新增js文件，修改js文件都能立刻响应，不需要重启项目

```js
const { addMock } = require('proxy-pre-mock')

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
addMock支持四个参数：
- path：请求地址pathname
- method：请求方法
- handle：响应体函数
### b、在vite项目中
>vite5Plugin方法和webpack版本的大致相同，只是在vite5中是以插件的形式启动的

#### 注意：由于本插件中使用了动态require，所以在vite项目中必须将package.json中的type=module删除，不然编译时会报错。当然如果在webpack项目中你有type=module也需要删除。

`vite.config.js`:
```js
import { vite5Plugin } from 'proxy-pre-mock'
export default defineConfig({
    plugins: [
        vite5Plugin('mock')
    ]
})
```
