let json = $file.read('/assets/data.json').string
let duration = 0
let html = json => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title></title>
</head>
<style>
    body,
    html {
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

    #svgContainer {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        width: 375px;
        height: 375px;
        background-color: #fff;
    }
</style>
</head>

<body>
    <div id="svgContainer"></div>
    <script src="https://www.lottiefiles.com/js/lottie.min.js"></script>
    <script>
        var animationData = ${json}
        var svgContainer = document.getElementById("svgContainer")
        var animItem = bodymovin.loadAnimation({ wrapper: svgContainer, animType: "svg", loop: !0, animationData: animationData })
        setTimeout(() => {
            let duration = animItem.getDuration(true)
            $notify('getDuration', duration)
        }, 0)
    </script>
</body>

</html>`

$app.autoKeyboardEnabled = true
$ui.render({
  props: {},
  views: [
    {
      type: 'input',
      props: {
        type: $kbType.search,
        darkKeyboard: true
      },
      layout: function (make, view) {
        make.left.top.right.inset(15)
        make.height.equalTo(30)
      },
      events: {
        didEndEditing: async function (sender) {
          $('web').html = html($file.read('/assets/loading.json').string)
          let {data} = await $http.get(sender.text)
          json = JSON.stringify(data)
          $('web').html = html(json)
        }
      }
    },
    {
      type: 'web',
      props: {
        id: 'web',
        scrollEnabled: !1,
        showsProgress: !1,
        html: html(json)
      },
      layout: (make, view) => {
        make.top.equalTo($('input').bottom).inset(5)
        make.left.right.inset(0)
        make.bottom.inset(180)
      },
      events: {
        getDuration: function (frame) {
          duration = frame
          $('slider').max = duration
        }
      }
    },
    {
      type: 'stepper',
      props: {
        max: 5.0,
        min: 0.25,
        value: 1,
        step: 0.25
      },
      layout: function (make, view) {
        // make.right.inset(15)
        make.centerX.inset(0)
        make.height.equalTo(12)
        make.bottom.inset(190)
      },
      events: {
        changed: function (sender) {
          $ui.toast(sender.value + 'x')
          $('web').eval({
            script: `animItem.setSpeed(${sender.value})`,
            handler: function (result, error) {}
          })
        }
      }
    },
    {
      type: 'slider',
      props: {
        value: 1.0,
        max: 1.0,
        min: 1.0
      },
      layout: function (make, view) {
        make.bottom.inset(140)
        make.left.right.inset(15)
      },
      events: {
        changed: function (sender) {
          $ui.toast(~~sender.value + ' frame')
          $('web').eval({
            script: `animItem.goToAndStop(${~~sender.value}, true)`,
            handler: function (result, error) {}
          })
        }
      }
    },
    {
      type: 'list',
      props: {
        scrollEnabled: !1,
        rowHeight: 34,
        data: ['PLAY', 'PAUSE', 'STOP', 'Export To HTML']
      },
      layout: (make, view) => {
        make.height.equalTo(135)
        make.left.bottom.right.inset(0)
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          $ui.toast(data)
          if (data === 'Export To HTML') return $share.sheet(html(json))
          $('web').eval({
            script: `animItem.${data.toLocaleLowerCase()}()`,
            handler: function (result, error) {}
          })
        }
      }
    }
  ]
})
