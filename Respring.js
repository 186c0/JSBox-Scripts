var html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        div {
            width: 10000px;
            height: 10000px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
    </style>
</head>

<body>
    <script>
        window.onload = function () {
            appendDiv(document.body)
            function appendDiv(node) {
                setTimeout(() => {
                    appendDiv(node.appendChild(document.createElement('div')))
                }, 0)
            }
        }
    </script>
</body>

</html>`;

let window = $ui.controller.runtimeValue().$view();
let webView = $ui.create({
  type: "web",
  props: {
    html: html
  }
}).runtimeValue();

window.$addSubview(webView);