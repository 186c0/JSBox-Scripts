let version = 0.1
let versionURL = 'https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/Pixiv/version'
let updateURL = `jsbox://install?url=${encodeURI('https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/Pixiv/Pixiv.js')}`
let imgSearchURL = 'https://saucenao.com/search.php?db=999&url='
let api = 'https://api.imjad.cn/pixiv/v1'
let header = {
  'Referer': 'https://www.pixiv.net'
}
let {
  width,
  height,
  scale
} = $device.info.screen
let i = 0
let template = [{
    type: "view",
    props: {
      id: 'itemBaseView',
      bgcolor: $color("#eee")
    },
    layout: $layout.fill
  },
  {
    type: "image",
    props: {
      id: "image"
    },
    views: [{
      type: 'blur',
      props: {
        id: 'blur',
        style: 1,
        alpha: 0
      },
      layout: $layout.fill
    }],
    layout: $layout.fill
  },
  {
    type: "label",
    props: {
      id: 'resolution',
      alpha: 0.8,
      font: $font(9),
      autoFontSize: true,
      align: $align.center,
      bgcolor: $color("#eee"),
      textColor: $color("#666")
    },
    layout: (make, view) => {
      make.bottom.equalTo($('image'))
      make.size.equalTo($size(50, 9))
    }
  }
]

function render() {
  $ui.render({
    props: {
      debugging: true,
      title: "Pixiv"
    },
    views: [{
        type: "view",
        props: {
          id: "baseView",
          bgcolor: $color("clear"),
        },
        layout: $layout.fill
      },
      {
        type: "matrix",
        props: {
          id: "matrix",
          bgcolor: $color("clear"),
          columns: 3,
          spacing: 1 / scale,
          square: true,
          template
        },
        layout(make) {
          make.left.right.top.bottom.inset(0)
        },
        events: {
          didReachBottom(sender) {
            sender.endFetchingMore()
          }
        }
      }
    ]
  })
  $('baseView').add({
    type: 'image',
    props: {
      id: 'bgImage',
      alpha: 0.6
    },
    views: [{
      type: 'blur',
      props: {
        style: 1,
        alpha: 1
      },
      layout: $layout.fill
    }],
    layout: $layout.fill
  })
}

function request(method, url, header, handler) {
  // $ui.toast(`正在发送 ${method} 请求`, 0.2)
  $http.request({
    method,
    url,
    header,
    handler
  })
}

function cacheImgData(key, data) {
  $cache.setAsync({
    key,
    value: data,
    handler(object) {
      $ui.toast("已缓存", 0.5)
    }
  })
}

function download(url) {
  request('GET', url, null, resp => resp.data.response.forEach(i => {
    let {
      image_urls,
      title,
      tags,
      width,
      height,
      stats,
      age_limit,
      user,
      type
    } = i
    $http.download({
      url: image_urls.px_480mw,
      header,
      progress: function (bytesWritten, totalBytes) {
        let percentage = bytesWritten * 1.0 / totalBytes
      },
      handler: resp => {
        let imgData = resp.data
        insertImg(0, imgData, title, width, height, user)
        $photo.save({
          data: imgData,
          handler: success => $ui.toast(`已保存${i}张`)
        })
        if (i++ < 10) cacheImgData('img' + i, imgData);
      }
    })
  }))
}

async function upload(img) {
  $ui.loading(true)
  $ui.toast("正在上传...", 10)
  let resp = await $http.upload({
    url: "https://sm.ms/api/upload",
    files: [{
      "data": img,
      "name": "smfile"
    }]
  })
  $ui.loading(false)
  $ui.toast("", 0)
  let data = resp.data.data
  if (!data) return $ui.toast("上传出错，请检查网络")
  return data.url
}

function insertImg(index, imgData, title, width, height, user) {
  $('matrix').insert({
    indexPath: $indexPath(0, index),
    value: {
      image: {
        data: imgData
      },
      resolution: {
        text: `${width} x ${height}`
      }
    }
  })
  let blur = $('matrix').cell($indexPath(0, index)).views[0].views[1].get('blur')
  blur.alpha = 1.5
  blur.animator.makeOpacity(0).easeInQuad.animate(1)
  $delay(1, () => blur.remove())
}

function checkUpdate() {
  request('GET', versionURL, null, resp => {
    if (version == resp.data) return;
    $ui.action({
      title: "更新提示",
      message: "发现新版本, 是否更新 ?",
      actions: [{
          title: "更新",
          handler: () => {
            $app.openURL(updateURL)
            $ui.toast("正在安装更新...")
          }
        },
        {
          title: "取消"
        }
      ]
    })
  })
}

async function getUserInfo(userID) {
  let resp = await $http.get(`${api}?id=${userID}&type=member`)
  return resp.data.response[0]
}
async function getImgInfo(illustID) {

}

function actionUserInfo(data) {
  let {
    id,
    account,
    name,
    stats
  } = data
  $ui.action({
    title: "作者信息",
    message: `昵称: ${name}\n帐户名: ${account}\n数字ID: ${id}\n\n作品: ${stats.works} 收藏: ${stats.favorites} 跟随: ${stats.following}`,
    actions: [{
        title: "下载全部作品",
        handler: () => {
          downImg(id)
        }
      },
      {
        title: "取消"
      }
    ]
  })
}

async function downImg(userID) {
  let data = await getUserInfo(userID)
  let count = data.stats.works
  let url = `${api}?id=${userID}&type=member_illust&per_page=${count}`
  download(url)
}
async function searchCreator(url) {
  $ui.toast("正在查找作者...", 5)
  let resp = await $http.get(imgSearchURL + encodeURI(url))
  let creator = resp.data.match(/member\.php\?id=\d+/)
  let illust = resp.data.match(/illust_id=\d+/)
  if (!(creator && illust)) {
    $ui.toast("作品过于冷门或非P站画师所作")
    return
  }
  let [creatorID, illustID] = [creator[0], illust[0]].map(i => i.match(/\d+/)[0])
  return {
    creatorID,
    illustID
  }
}

async function main() {
  let text = ($context.text || $clipboard.text || '').match(/id=\d+/)
  let userID = text ? text[0].replace('id=', '') : null
  if (userID) {
    downImg(userID)
  } else {
    $ui.toast("选择图片来查找画师")
    let photo = await $photo.pick({
      format: "data"
    })
    if (!photo.data) return;
    let url = await upload(photo.data)
    let {
      creatorID,
      illustID
    } = await searchCreator(url)
    let userInfo = await getUserInfo(creatorID)
    actionUserInfo(userInfo)
  }
}

$cache.getAsync({
  key: `img${~~(Math.random()*11)}`,
  handler: (object) => {
    $('bgImage').data = object
  }
})
render()
main()
$thread.background({
  delay: 0,
  handler: checkUpdate
})