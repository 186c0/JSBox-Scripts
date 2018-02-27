/*
UglifyJS + Babel 压缩格式化,复制或从分享面板运行
暂不支持转换async
by https://t.me/Eva1ent
*/
// 填写调试端地址
const URL = "http://10.0.0.5/";
//设定分享文件类型 html, pdf
const SHARETYPE = 'pdf';
//自定义空白间距
const WHITESPACE = `&nbsp;&nbsp;`;
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
    $app.close();
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

function renderCode(code, style) {
  if (code) {
    $ui.toast("Rendering...");
    let e = code.replace(/[\u00A0-\u9999<>\&]/gim, t => "&#" + t.charCodeAt(0) + ";").replace(/    |\t/g, WHITESPACE);
    html = `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="user-scalable=no" /><link rel='stylesheet' href='http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/agate.min.css'><style>*{margin: 0;padding: 0;}pre{font-size: 12px;}${wrap}${style}</style></head><body class='hljs'><script src="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script><script>hljs.initHighlightingOnLoad();</script><pre><code class='hljs'>${e}</code></pre></body></html>`;
    $("web").html = html;
    output = code;
  }
}

function Button(id, title, bgcolor, layout, tapped) {
  this.type = "button";
  this.props = {
    id: id,
    title: title,
    bgcolor: bgcolor,
    titleColor: $color("white"),
    alpha: 0.8
  };
  this.layout = layout;
  this.events = {
    tapped: e => {
      if (timer) {
        timer.invalidate();
        timer = null;
        $ui.toast("stopped");
      }
      tapped();
    }
  };
}

function receivingDebugData() {
  timer = $timer.schedule({
    interval: 1,
    handler: function () {
      $http.get({
        url: URL + "download?path=%2Ftmp.js",
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

function printPropsMethods() {
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

let timer;
let UIApp = $objc("UIApplication"),
  SApp = UIApp.invoke("sharedApplication"),
  keyWindow = SApp.invoke("keyWindow"),
  rootVC = keyWindow.invoke("rootViewController");
let text = ($context.safari ? $context.safari.items.source : null) || $context.text || ($context.data ? $context.data.string : null) || $clipboard.text || "",
  output = "",
  html = "";
let wrap = `pre{white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;}`;
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
let btn_comp = new Button(
  'btn_comp',
  '压缩',
  $color("#2e5266"),
  m => {
    m.top.right.equalTo(5);
    m.width.equalTo(65);
  },
  e => {
    mode = "Compress";
    run(mode);
  }
);

let btn_format = new Button(
  'btn_format',
  '排版',
  $color("#6e8898"),
  m => {
    m.top.equalTo($("btn_comp").bottom).inset(5);
    m.right.equalTo($("btn_comp").right);
    m.width.equalTo(65);
  },
  e => {
    mode = "Decompress";
    run(mode);
  }
);

let btn_share = new Button(
  'btn_share',
  '分享',
  $color("#9fb1bc"),
  m => {
    m.top.equalTo($("btn_format").bottom).inset(5);
    m.right.equalTo($("btn_format").right);
    m.width.equalTo(65);
  },
  e => {
    share(output);
  }
);

let btn_save = new Button(
  "btn_save",
  "导入",
  $color("gray"),
  m => {
    m.top.equalTo($("btn_share").bottom).inset(5);
    m.right.equalTo($("btn_share").right);
    m.width.equalTo(65);
  },
  e => {
    let name = getName();
    install(name, output);
  }
);

let btn_more = new Button(
  "btn_more",
  "More",
  $color("gray"),
  m => {
    m.top.equalTo($("btn_save").bottom).inset(5);
    m.right.equalTo($("btn_save").right);
    m.width.equalTo(65);
  },
  e => {
    $ui.menu({
      items: Options.map(i => i.name),
      handler: (e, i) => {
        mode = 'more';
        Options[i].func();
      }
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

let Options = [{
    name: "打印UIViews",
    func: _views
  }, {
    name: "打印viewControllers",
    func: _viewControllers
  }, {
    name: 'ReceivingDebugData',
    func: receivingDebugData
  },
  {
    name: "查看OC类属性和方法",
    func: printPropsMethods
  }
];

let mode = "",
  tasks = {
    Compress: '[{"name":"babel","options":{}},{"name":"uglify"}]',
    Decompress: '[{"name":"babel","options":{}},{"name":"uglify","options":{"output":{"beautify":true}}}]'
  };

let header = {
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