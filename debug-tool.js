// 注意:本拓展运行期间可能会造成JSBox不稳定

function debug() {
  let json = {
    timestamp: new Date().toISOString(),
    views: keyWindow.invoke("recursiveDescription").rawValue().toString(),
    viewControllers: rootVC.invoke("_printHierarchy").rawValue().toString()
  };
  $addin.save({
    name: "tmp.js",
    data: $data({
      string: JSON.stringify(json)
    })
  });
  // $ui.toast("running...");
}

let UIApp = $objc("UIApplication"),
  SApp = UIApp.invoke("sharedApplication"),
  keyWindow = SApp.invoke("keyWindow"),
  rootVC = keyWindow.invoke("rootViewController");
let timer;
let Options = [{
    name: 'START',
    func: start
  },
  {
    name: 'STOP',
    func: stop
  }
];

function start() {
  timer = $timer.schedule({
    interval: 0.9,
    handler: debug
  });
}

function stop() {
  timer.invalidate();
  $ui.toast("stopped");
}
$ui.menu({
  items: Options.map(i => i.name),
  handler: (e, i) => {
    Options[i].func();
  }
});