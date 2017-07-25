# 小不点住院点餐系统

## 项目简介

住院患者自助点餐系统，适用于患者住院情况下，住院患者或者家属，通过医院提供的特定二维码扫码关注公众号，按照护理人员设定的健康食谱，进行在线点餐。护理人员按照患者点餐记录，审核后录入院内系统，消费结算使用住院结算通道。
系统通过2个微信服务号实现，分别为医院端和患者端。

使用了以下开发框架及工具：

- 样式预编译器：less
- JS 模块依赖管理：requireJS
- 任务流工具：gulp
- 样式交互库：[Framework7](http://framework7.io/)
- 服务端采用node.js + mongodb + redis

## 源码结构

```
.
├── app
│   ├── css			--LESS预编译产生的css文件
│   ├── font 		--字库，保留
│   ├── img 		--图片
│   ├── js 			--客户端JS文件
│   ├── lib			--第三方库
│   ├── hospital	--医院端HTML文件
│   ├── patient		--患者端HTML文件
│   └── pages
├── less			--样式源文件
├── routes			--服务端路由
├── views			--服务端展示层ejs模板
├── models			--服务端数据层
└── controllers		--服务端控制层
```

## 开发预览

在终端中定位至项目目录，执行 `gulp`

```
🌎  => Server is running on port 3005
[BS] Proxying: http://192.168.0.101:3005
[BS] Access URLs:
 --------------------------------------
       Local: http://localhost:5000
    External: http://192.168.0.101:5000
 --------------------------------------
          UI: http://localhost:3001
 UI External: http://192.168.0.101:3001
 --------------------------------------
```

根据终端提示，打开浏览器进行调试开发。

## 布署

执行 "gulp dist"
启动 "pm2 start pm2.json"


## 许可


## Wiki

