$app.tips("使用方式:\n1.点击上方半透明矩形选择图片查找P站画师\n2.从Pixiv App上画师主页分享处运行或复制个人链接后打开本脚本下载全部作品")
$app.strings = {
  en: {
    downloadAll: 'Download All'
  },
  'zh-Hans': {
    downloadAll: '下载所有作品'
  }
};

const version = 0.5;
const versionURL = 'https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/Pixiv/version';
const updateURL = `jsbox://install?url=${encodeURI('https://raw.githubusercontent.com/186c0/JSBox-Scripts/master/Pixiv/Pixiv.js')}`;
const imgSearchURL = 'https://saucenao.com/search.php?db=999&url=';
const api = 'https://api.imjad.cn/pixiv/v1';
const header = {
  Referer: 'https://www.pixiv.net'
};

class Range {
  constructor(start, end, step) {
      this.start = start;
      this.end = end;
      this.step = step;
    }
    [Symbol.iterator]() {
      let curr = this.start,
        _this = this;
      return (function* () {
        while (curr < _this.end) {
          yield curr;
          curr += _this.step;
        }
      })();
    }
}

const range = (start, end, step = 1) => new Range(start, end, step);

const {
  width,
  height,
  scale
} = $device.info.screen;

let n = 0;
let action = $app.env === $env.action;
let text = ($context.text || $clipboard.text || '').match(/id=\d+/);
let readyToDownID = text ? text[0].replace('id=', '') : null;


const imgBlurView = {
  type: 'image',
  props: {
    id: 'bgImage',
    alpha: 1
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
};

const illustDetailView = {
  type: 'view',
  props: {
    id: 'detailBaseView',
    smoothRadius: 20,
    bgcolor: $rgba(0, 0, 0, 0.3)
  },
  layout: (make, view) => {
    make.top.left.bottom.right.inset(16);
  },
  views: [{
      type: 'image',
      props: {
        id: 'illustImg',
        bgcolor: $rgba(0, 0, 0, 0.25)
      },
      layout: (make, view) => {
        make.top.inset(0);
        make.left.right.inset(0);
        make.height.equalTo(~~(height * 0.4));
      },
      events: {
        tapped: () => {
          chooseToDownload();
        }
      }
    },
    {
      type: 'button',
      props: {
        id: 'btn',
        font: $font(14),
        title: $l10n('downloadAll'),
        bgcolor: $rgba(0, 0, 0, 0.3)
      },
      layout: (make, view) => {
        let v = $('illustImg');
        make.left.right.inset(60);
        make.bottom.inset(10);
      },
      events: {
        tapped: sender => {
          $ui.push({
            props: {
              title: ""
            },
            views: [{
              type: "view",
              props: {
                id: ""
              },
              layout: $layout.fill,
              views: [imgBlurView, canvas, matrixView],
              events: {}
            }]
          })
          getImgURL(readyToDownID);
        }
      }
    },
    {
      type: 'view',
      props: {
        id: 'line',
        alpha: 0.6,
        bgcolor: $color('tint'),
        userInteractionEnabled: false
      },
      layout: (make, view) => {
        make.bottom.equalTo($('btn').top).inset(8);
        make.left.right.inset(20);
        make.height.equalTo(5 / scale);
      }
    },
    {
      type: 'text',
      props: {
        id: 'infoText',
        align: $align.left,
        font: $font('iosevka', 12),
        editable: false,
        bgcolor: $color("clear")
      },
      layout: (make, view) => {
        make.top.equalTo($('illustImg').bottom)
        make.bottom.equalTo($('line').top)
        make.left.right.inset(20);
      }
    }
  ]
};

const template = [{
    type: 'view',
    props: {
      id: 'itemBaseView',
      bgcolor: $color('#eee')
    },
    layout: $layout.fill
  },
  {
    type: 'image',
    props: {
      id: 'image'
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
  }

  // {
  //   type: 'label',
  //   props: {
  //     id: 'resolution',
  //     alpha: 0.8,
  //     font: $font(9),
  //     autoFontSize: true,
  //     align: $align.center,
  //     bgcolor: $color('#eee'),
  //     textColor: $color('#666')
  //   },
  //   layout: (make, view) => {
  //     make.bottom.equalTo($('image'));
  //     make.size.equalTo($size(40, 8));
  //   }
  // }
];

const matrixView = {
  type: 'matrix',
  props: {
    id: 'matrix',
    bgcolor: $color('clear'),
    columns: width > 375 ? 4 : 3,
    spacing: 4 / scale,
    square: true,
    template
  },
  layout: (make, view) => {
    make.top.left.right.bottom.inset(3 / scale)
  },
  events: {
    didReachBottom(sender) {
      sender.endFetchingMore();
    },
    didSelect: function (sender, indexPath, data) {}
  }
};

const canvas = {
  type: "canvas",
  props: {
    bgcolor: $color("clear")
  },
  layout: $layout.fill,
  events: {
    // modified from http://evanyou.me/
    draw: function (view, ctx) {
      let x = ctx,
        pr = scale,
        w = 1.5 * view.frame.width,
        h = view.frame.height,
        f = 60,
        q,
        m = Math,
        r = 0,
        u = m.PI * 2,
        v = m.cos,
        z = m.random
      x.setAlpha(0.6)
      x.scaleCTM(1 / 1.5, 1)
      x.allowsAntialiasing = true

      function i() {
        x.clearRect(0, 0, w, h)
        q = [{
          x: 0,
          y: h * 0.7 + f
        }, {
          x: 0,
          y: h * 0.7 - f
        }]
        while (q[1].x < w + f) d(q[0], q[1])
      }

      function d(i, j) {
        x.beginPath()
        x.moveToPoint(i.x, i.y)
        x.addLineToPoint(j.x, j.y)
        let k = j.x + (z() * 2 - 0.25) * f,
          n = y(j.y)
        x.addLineToPoint(k, n)
        x.closePath()
        r -= u / -50
        x.fillColor = $color('#' + (v(r) * 127 + 128 << 16 | v(r + u / 3) * 127 + 128 << 8 | v(r + u / 3 * 2) * 127 + 128).toString(16))
        x.fillPath()
        q[0] = q[1]
        q[1] = {
          x: k,
          y: n
        }
      }

      function y(p) {
        let t = p + (z() * 2 - 1.1) * f
        return (t > h || t < 0) ? y(p) : t
      }
      i()
    }
  }
}

function render() {
  $ui.render({
    props: {
      // debugging: true,
      title: readyToDownID ? 'PixivDownloader' : 'Pixiv插画检索'
    },
    views: [{
      type: 'view',
      props: {
        id: 'baseView',
        bgcolor: $color('clear')
      },
      layout: $layout.fill
    }]
  });
  $('baseView').add(imgBlurView);
  if (readyToDownID) {
    $('baseView').add(canvas);
    $('baseView').add(matrixView);
    getImgURL(readyToDownID);
  } else {
    $('baseView').add(illustDetailView);
  }
}


function cacheImgData(key, data) {
  $cache.setAsync({
    key,
    value: data,
    handler(object) {
      // $ui.toast("已缓存" + key, 1)
    }
  });
}

async function download(url) {
  $ui.toast("正在请求数据...", 5)
  let resp = await $http.get(url)
  $ui.toast("正在下载图片...", 5)
  console.log(resp.data.response[0]);
  resp.data.response.forEach(i => $http.download({
    url: i.image_urls.large,
    header,
    progress: function (bytesWritten, totalBytes) {
      let percentage = bytesWritten * 1.0 / totalBytes
    },
    handler: resp => {
      let imgData = resp.data;
      let length = $('matrix').data.length
      insertImg(0, action ? 0 : length, imgData);
      $photo.save({
        data: imgData
      });
      if (length < 5) cacheImgData('img' + length, imgData);
    }
  }))
}

async function upload(img) {
  $ui.loading(true);
  $ui.toast('正在上传...', 10);
  let resp = await $http.upload({
    url: 'https://sm.ms/api/upload',
    files: [{
      data: img,
      name: 'smfile'
    }]
  });
  $ui.loading(false);
  $ui.toast('', 0);
  let data = resp.data.data;
  if (!data) return $ui.toast('上传出错，请检查网络');
  return data.url;
}

function insertImg(s, row, imgData) {
  $('matrix').insert({
    indexPath: $indexPath(s, row),
    value: {
      image: {
        data: imgData
      }
    }
  });
  let blur = $('matrix').cell($indexPath(0, row)).views[0].views[1].get('blur');
  blur.alpha = 1;
  blur.animator.makeOpacity(0).easeInQuad.animate(1);
  $delay(1, () => blur.remove());
}

async function checkUpdate() {
  let resp = await $http.get(versionURL)
  if (version == resp.data) return;
  $ui.action({
    title: '更新提示',
    message: '发现新版本, 是否更新 ?',
    actions: [{
        title: '更新',
        handler: () => {
          $app.openURL(updateURL);
          $ui.toast('正在安装更新...');
        }
      },
      {
        title: '取消'
      }
    ]
  });
}


async function getUserInfo(userID) {
  let resp = await $http.get(`${api}?id=${userID}&type=member`);
  return resp.data.response[0];
}

async function getImgInfo(illustID) {
  let resp = await $http.get(`${api}?id=${illustID}&type=illust`);
  return resp.data.response[0];
}

function getInfo(userID, illustID) {
  Promise.all([
    getUserInfo(userID),
    getImgInfo(illustID)
  ]).then(value => {
    fillInfo(value[1], value[0])
  })
}

function fillInfo(i, u) {
  $('infoText').text = `作品信息
    图片ID:        ${i.id}
    标  题:        ${i.title}
    类  型:        ${i.type}
    Rating:        ${i.stats.score}
    查看量:        ${i.stats.views_count}
    收藏量:        ${i.stats.favorited_count.public}
    标  签:        \n${i.tags.map(i => `    ${i}\n`).join('')}
    工  具:        ${i.tools.map(i => i).join(', ')}
    说  明:        ${i.caption}
    分辨率:        ${i.width} x ${i.height}
    分  级:        ${i.age_limit}

作者信息
    用户ID:        ${u.id}
    昵  称:        ${u.name}
    性  别:        ${u.gender}
    帐户名:        ${u.account}
    作  品:        ${u.stats.works}
    收  藏:        ${u.stats.favorites}
    跟  随:        ${u.stats.following}
    好  友:        ${u.stats.friends}
    简  介:        ${u.profile.introduction}
    `;
  readyToDownID = u.id;
}

async function getImgURL(userID, type = 'member_illust') {
  let data = await getUserInfo(userID);
  let count = data.stats.works;
  let url = `${api}?id=${userID}&type=${type}&per_page=${count}`;
  n = 0
  download(url);
}
async function searchCreator(url) {
  $ui.toast('正在查找作者...', 10);
  let resp = await $http.get(imgSearchURL + encodeURI(url));
  let creator = resp.data.match(/member\.php\?id=\d+/);
  let illust = resp.data.match(/illust_id=\d+/);
  if (!creator) return $ui.toast('作品过于冷门或非P站画师所作');
  let [creatorID, illustID] = [creator[0], illust[0]].map(i => i.match(/\d+/)[0]);
  return {
    creatorID,
    illustID
  };
}

async function chooseToDownload() {
  let photo = await $photo.pick({
    format: 'data'
  });
  let data = photo.data;
  if (!data) return;
  $('illustImg').data = data;
  $('infoText').text = ''
  let url = await upload(data);
  let {
    creatorID,
    illustID
  } = await searchCreator(url);
  getInfo(creatorID, illustID)
}


function setBackground() {
  let set = data => {
    $('bgImage').data = data
    imgBlurView.props.data = data
  }
  $cache.getAsync({
    key: `img${~~(Math.random() * 6)}`,
    handler: object => {
      if (object) return set(object)
      $http.download({
        url: 'https://i.loli.net/2018/05/14/5af95f86135ef.png'
      }).then(value => set(value.data))
    }
  });
}
render();
setBackground();
$thread.background({
  delay: 0,
  handler: checkUpdate
})