### 关于 Runtime 

> ​	引入 Runtime 最根本的原因是**为有缺陷的 API 提供一个备用方案**，正如 Runtime 绝大多时候的应用场景一样，它是一把屠龙的刀，屠龙之技是不会用在日常生活中的。假设你有一个功能要实现，JSBox 提供的 API 没有满足你，或者是满足的有缺陷，你可以考虑通过 JSBox 提供的 Runtime 接口直接调用 Objective-C 的 API。当然，**在你可以实现功能的时候，应该尽量避免使用 Runtime 接口，因为调用起来比较复杂，查错也相对困难**。


[Script-Tools.js](https://xteko.com/redir?url=https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/Script-Tools.js)

[实时调试插件](https://xteko.com/redir?url=https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/debug-tool.js)

![IMG_0121.PNG](https://i.loli.net/2018/02/25/5a92598705135.png)
![IMG_0123.PNG](https://i.loli.net/2018/02/25/5a92598ad1dad.png)
![IMG_0122.PNG](https://i.loli.net/2018/02/25/5a92598bc40b4.png)

实时打印UIView层级(demo) 

![ ](https://github.com/186c0/JSBox-Scripts/raw/master/demo.gif)

更新: 换用 WEB服务器 API，现在调试插件运行时不会再往脚本列表写入 tmp.js ，想要调试任意拓展的 UI 直接 require("debug-tool"); 即可。

[ScreenRecording](http://ou201w6db.bkt.clouddn.com/ScreenRecording_x264.mp4)
