/*
UglifyJS + Babel 压缩格式化,复制或从分享面板运行
暂不支持转换 async
by https://t.me/Eva1ent
*/
// 填写调试端地址
const port = 5588;
const URL = "http://192.168.1.111:" + port;
//设定分享文件类型 html, pdf
const SHARETYPE = 'pdf';
//自定义空白间距
const WHITESPACE = `&ensp;`;
const PDF_PAGESIZE = $pageSize.A1;

$app.debug = true;
String.prototype.delExtension = function () {
  return this.lastIndexOf('.') === -1 ? this + '' : this.slice(0, this.lastIndexOf('.'));
};

function install(fileName, string) {
  $addin.save({
    name: fileName,
    data: $data({
      string: string
    })
  });
  $ui.toast("已导入", 1.2);
  $delay(2, () => {
    $context.close();
  });
}

function getName() {
  if ($env.app == $app.env || void 0 === $context.data) {
    return new Date().toISOString();
  } else {
    return $context.data.fileName.delExtension() + ' ' + mode + "ed";
  }
}

function makePDF(fileName, html) {
  $ui.loading = true;
  $ui.toast("正在生成PDF,请等待...");
  $pdf.make({
    html: html,
    pageSize: PDF_PAGESIZE,
    handler: function (resp) {
      var data = resp.data;
      if (data) {
        $share.sheet([fileName + '.pdf', data]);
      }
    }
  });
}

function share(string) {
  let fileName = getName();
  if (mode === 'more') {
    if (SHARETYPE === 'pdf') {
      makePDF(fileName, html);
    } else {
      $share.sheet([fileName + '.html', html]);
    }
  } else if (string) {
    $share.sheet([fileName + '.js', $data({
      "string": string
    })]);
  }
}

function run(t) {
  if (text) {
    $ui.loading(true);
    $http.request({
      method: "POST",
      url: "https://www.css-js.com/taskserver.do",
      header: header,
      body: {
        tasks: tasks[t],
        body: text
      },
      handler: function (t) {
        $ui.loading(false);
        if (4 === t.data.code) {
          $ui.toast("代码存在语法错误！");
        } else {
          renderCode(t.data.data);
          let p = (output.length / text.length * 100).toFixed(2);
          $ui.action(`处理前 ${text.length} 字符，处理后 ${output.length} 字符，压缩率 ${p}%`);
        }
      }
    });
  }
}

function encode(code) {
  return code.replace(/[\u00A0-\u9999<>\&]/gim, t => "&#" + t.charCodeAt(0) + ";")
}

function renderCode(code, style, noEncode) {
  if (!code) {
    return;
  }
  $ui.toast("Rendering...");
  html = `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="user-scalable=no" /><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/agate.min.css'><style>*{margin: 0;padding: 0;}pre{font-size: 14px;white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;${style}}</style></head><body class='hljs'><script src="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script><script>hljs.initHighlightingOnLoad();</script><pre><code class='hljs'>${encode(code).replace(/ {4}|\t/g, WHITESPACE)}</code></pre></body></html>`;
  $("web").html = html;
  output = code;
}

function Button(id, title, bgcolor, frameY, tapped) {
  this.type = "button";
  this.props = {
    id: id,
    title: title,
    bgcolor: bgcolor,
    titleColor: $color("white"),
    alpha: 0.8,
    frame: $rect($device.info.screen.width - 60, frameY, 65, 33)
  };
  this.events = {
    tapped: e => {
      if (timer) {
        timer.invalidate();
        timer = false;
        $delay(0.5, () => {
          $ui.toast("stopped");
        });
      }
      tapped();
    }
  };
}

function remoteDebugging() {
  timer = $timer.schedule({
    interval: 0.6,
    handler: function () {
      $http.get({
        url: URL + "/download?path=%2Fdata.json",
        handler: function (resp) {
          let data = resp.data;
          let timestamp = data.timestamp;
          if (timestamp) {
            //$ui.toast("Receiving...", 2);
            let debugData = `UIViewControllers: ${data.viewControllers}

            UIViews: ${data.views}`;
            if (debugData !== output) {
              renderCode(debugData);
            } else {
              $ui.toast("Keeping...", 2);
            }
          } else {
            $ui.toast("Waiting...", 2);
          }
        }
      });
    }
  });
}

function _views() {
  renderCode(keyWindow.invoke("recursiveDescription").rawValue().toString());
}

function _viewControllers() {
  renderCode(rootVC.invoke("_printHierarchy").rawValue().toString());
}

function _propsMethods(className) {
  renderCode($objc(className).invoke("_methodDescription").rawValue().toString());
}

function OCPropsMethods() {
  $input.text({
    type: $kbType.text,
    placeholder: "Input Objective-C Class name",
    handler: function (text) {
      if (text) {
        _propsMethods(text);
      }
    }
  });
}

function printAllFrameworks() {
  renderCode($objc("NSBundle").invoke('allFrameworks').rawValue().map(i => '[' + i.runtimeValue().invoke('bundlePath').rawValue().replace('/System/Library/', '') + ']').join('\n\n'), 'font-size:22px;');
}

let timer;
let UIApp = $objc("UIApplication"),
  SApp = UIApp.invoke("sharedApplication"),
  keyWindow = SApp.invoke("keyWindow"),
  rootVC = keyWindow.invoke("rootViewController");
let text = ($context.safari ? $context.safari.items.source : null) || $context.text || ($context.data ? $context.data.string : null) || $clipboard.text || "";
let output = "";
let html = "";
let codeView = {
  type: "web",
  props: {
    id: "web"
  },
  layout: t => {
    t.top.inset(-3);
    t.bottom.left.right.inset(0);
  }
};
let btn_comp = new Button('btn_comp', '压缩', $color("#2e5266"), 5, e => {
  mode = "Compress";
  run(mode);
});
let btn_format = new Button('btn_format', '排版', $color("#6e8898"), 42,
  e => {
    mode = "Decompress";
    run(mode);
  }
);
let btn_share = new Button('btn_share', '分享', $color("#9fb1bc"), 80, e => share(output));
let btn_save = new Button("btn_save", "导入", $color("gray"), 118,
  e => {
    let name = getName();
    install(name, output);
  }
);
let btn_more = new Button("btn_more", "More", $color("gray"), 156,
  e => {
    mode = 'more';
    $ui.menu({
      items: Object.keys(Options),
      handler: i => Options[i]()
    });
  }
);

$ui.render({
  props: {
    id: "view",
    title: "Script Tools"
  },
  views: [
    codeView,
    btn_comp,
    btn_format,
    btn_share,
    btn_save,
    btn_more
  ]
});

let Options = {
  Views: _views,
  ViewControllers: _viewControllers,
  RemoteDebugging: remoteDebugging,
  OCPropsMethods: OCPropsMethods,
  PrintAllFrameworks: printAllFrameworks
};

let mode = "";
let tasks = {
  Compress: '[{"name":"babel","options":{}},{"name":"uglify"}]',
  Decompress: '[{"name":"babel","options":{}},{"name":"uglify","options":{"output":{"beautify":true}}}]'
};
const header = {
  Host: "www.css-js.com",
  Connection: "keep-alive",
  Accept: "application/json, text/javascript, */*; q=0.01",
  Origin: "https://www.css-js.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.30 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded",
  Referer: "https://www.css-js.com/tools/compressor.html?tab=uglifyjs"
};

if (text) {
  output = text;
  renderCode(text);
  $("btn_save").bgcolor = $color("tint");
}