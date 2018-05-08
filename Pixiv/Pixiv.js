let version =0.1
let updateUrl = 
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
      font: $font(10),
      autoFontSize: true,
      align: $align.center,
      bgcolor: $color("#eee"),
      textColor: $color("#666")
    },
    layout: (make, view) => {
      make.bottom.equalTo($('image'))
      make.size.equalTo($size(60, 10))
    }
  }
]

$ui.render({
  props: {
    debugging: true,
    title: "Pixiv"
  },
  views: [{
    type: "matrix",
    props: {
      id: "matrix",
      columns: 3,
      spacing: 1,
      square: true,
      template
    },
    layout(make) {
      make.left.right.top.bottom.inset(0)
    },
    // events: {
    //     didReachBottom(sender) {
    //         sender.endFetchingMore()
    //     }
    // }
  }]
})

function request(method, url, header, cb) {
  $ui.toast(`正在发送 ${method} 请求`, 0.2)
  let args = {
    method,
    url,
    header,
    handler: cb
  }
  method !== 'DOWNLOAD' ? $http.request(args) : delete args.method, $http.download(args)
}

function cacheData(key, data) {
  $cache.setAsync({
    key,
    value: data,
    handler(object) {
      // $ui.toast("已缓存", 0.5)
    }
  })
}

function main() {
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
    request('DOWNLOAD', image_urls.px_480mw, header, resp => {
      let imgData = resp.data
      insertImg(0, imgData, title, width, height, user)
      // cacheData('img' + id, imgData)
      imgID++
    })
  }))

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
    blur.alpha = 1
    blur.animator.makeOpacity(0).easeInQuad.animate(1)
    $delay(1, () => blur.remove())
  }
}

function checkUpdate() {
  request('GET', versionUrl, resp => {
    if (version == resp.data) return;
    $ui.alert({
      title: "更新提示",
      message: `发现新版本: ${resp.data}\n当前版本: ${version}\n是否更新 ?`,
      actions: [{
        title: '取消'
      }, {
        title: '更新',
        handler() {
          $ui.toast('正在更新');
          $app.openURL(updateURL);
        }
      }]
    })
  })
}

let text = ($context.text || $clipboard.text).match(/id=\d+/) || ['' + await $input.text()]
let userID = text[0].replace('id=', '')
//https://www.pixiv.net/member.php?id=1655331
$ui.toast(userID)
let url = `https://api.imjad.cn/pixiv/v1?id=${userID}&type=member_illust&per_page=1000`
let header = {
  'Referer': 'https://www.pixiv.net'
}

let imgID = 0;
let page = 1;
main()
