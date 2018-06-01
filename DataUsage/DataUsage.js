$app.tips("首次使用请在脚本前两行填写邮箱和密码!")
const email = "";
const passwd = "";

//let site = 'https://xn--nos809b.com';
let site = "https://www.cordcloud.me"
let header = {
  origin: site,
  referer: site + "/user"
}
let isCheckIn = false
let checkIn = site + "/user/checkin"
let colors = ['#e46367', '#e8b4b6', '#7dd1f0', '#ff6369', '#c2b5fa']

async function login(email, passwd) {
  let resp = await $http.request({
    method: "POST",
    url: site + "/auth/login",
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "email": email,
      "passwd": passwd
    }
  })
  return resp.response.statusCode;
}

async function getUsage() {
  let resp = await $http.get(site + "/user");
  let res = resp.data.match(/dataPoints:[\s\S]*?\]/);
  isCheckIn = /不能续命||不能签到/.test(resp.data)
  return eval(`{${res}}`);
}

function setText(usage) {
  let text = `■ ${usage.map(i => i.legendText).reverse().join(" ■ ")}`
  let str = $objc("NSMutableAttributedString").invoke("alloc.initWithString", text)
  for (let i = 0, j = 2; i < text.length; i++) {
    if (text.charAt(i) === '■') str.invoke("addAttribute:value:range:", "NSColor", $color(colors[j--]), $range(i, 1))
  }
  $("label").runtimeValue().invoke("setAttributedText", str)
}

function render() {
  $ui.render({
    props: {
      title: ""
    },
    views: [{
        type: "label",
        props: {
          id: "name",
          font: $font('ArialRoundedMTBold', 14),
          align: $align.center,
          text: "CordCloud",
          textColor: $color("#555")
        },
        layout: (make, view) => {
          make.top.inset(8)
          make.centerX.equalTo()
          make.width.equalTo(200)
        }

      }, {
        type: "canvas",
        props: {
          id: "cvs"
        },
        layout: (make, view) => {
          make.edges.equalTo($insets(30, 20, 0, 20))
        },
        events: {
          draw: function (view, ctx) {
            let points = usage.map(i => i.y);
            if (points.length < 2) return;
            ctx.translateCTM(view.frame.width, view.frame.height);
            ctx.rotateCTM(Math.PI);
            ctx.setAlpha(0.9);
            ctx.fillColor = $color(colors[2])
            ctx.fillRect($rect(0, view.frame.height * 0.5, view.frame.width, 80));
            for (let i = 0; i < 2; i++) {
              ctx.saveGState();
              ctx.fillColor = $color(colors[i])
              ctx.fillRect($rect(0, view.frame.height * 0.5, points[i] / 100 * view.frame.width, 80));
              ctx.restoreGState();
            }
          }
        }
      },
      {
        type: "label",
        props: {
          font: $font('ArialRoundedMTBold', 14),
          textColor: $color("#555"),
          autoFontSize: true,
          align: $align.center
        },
        layout: function (make, view) {
          make.centerX.equalTo($("cvs"));
          make.centerY.equalTo($("cvs")).offset(25);
          make.width.equalTo($("cvs"));
        }
      }
    ]
  })
}

let usage = $cache.get("usage") || []
render()
setText(usage)
$ui.loading(true)
usage = await getUsage()
if (!usage) {
  if (await login(email, passwd) == 200) {
    $ui.toast("登录成功")
    usage = await getUsage()
  } else {
    $ui.toast("登录失败")
    $app.close()
  }
}
$ui.loading(false)
$('cvs').runtimeValue().invoke('setNeedsDisplay')
setText(usage)
$cache.set("usage", usage)

if (!isCheckIn) {
  $http.post({
    url: checkIn,
    header: header
  }).then(value => $push.schedule({
    title: value.data.msg
  }))
}

if ($app.env !== $env.app) return;
(async function checkUpdate() {
  const version = 1.6
  const versionURL = 'https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/DataUsage/version'
  const updateURL = `jsbox://install?url=${encodeURI('https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/DataUsage/DataUsage.js')}`
  let resp = await $http.get(versionURL)
  if (version == resp.data) return
  $ui.action({
    title: '更新提示',
    message: '发现新版本, 是否更新 ?',
    actions: [{
        title: '更新',
        handler: () => {
          $app.openURL(updateURL)
          $ui.toast('正在安装更新...')
        }
      },
      {
        title: '取消'
      }
    ]
  })
})()