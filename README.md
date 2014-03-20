Rin
===

saber-component 预编译工具

Usage
---

通过 `npm` 安装

    npm intall rin

simple demo
```javascript
var fs      = require('fs');
var rin     = require('rin');

var input   = fs.readFileSync('input.html', 'utf-8'); 
var output  = rin.compile(input);
```

input
```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Document</title>
</head>
<body>
    <s-nav>mnav</s-nav>
    <p>
        hello world
        <s-input disabled />
        <s-btn>mbtn</s-btn>
        <s-input />
        <!-- 测试注释 -->
        <input type="text" />
    </p>
    <footer>footer</footer>
</body>
</html>
```

output
```html
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Document</title>
</head>
<body>
    <nav class="r-nav">mnav</nav>
    <p>
        hello world
        <input class="r-input" disabled />
        <button class="r-btn">mbtn</button>
        <input class="r-input"  />
        <!-- 测试注释 -->
        <input type="text" />
    </p>
    <footer>footer</footer>
</body>
</html>
```