function debug() {
  let json = {
    timestamp: new Date().toISOString(),
    views: keyWindow.invoke('recursiveDescription').rawValue().toString(),
    viewControllers: rootVC.invoke('_printHierarchy').rawValue().toString()
  }
  $file.write({
    data: $data({
      string: JSON.stringify(json)
    }),
    path: 'data.json'
  })
}
let UIApp = $objc('UIApplication'),
  SApp = UIApp.invoke('sharedApplication'),
  keyWindow = SApp.invoke('keyWindow'),
  rootVC = keyWindow.invoke('rootViewController')
let timer
let Options = {
  start: function () {
    $http.startServer({
      port: 5588,
      path: ''
    })
    timer = $timer.schedule({
      interval: 0.5,
      handler: debug
    })
  },
  stop: function () {
    $http.stopServer()
    timer.invalidate()
    $file.delete('data.json')
    $ui.toast('stopped')
  }
}

$ui.menu({
  items: Object.keys(Options),
  handler: i => Options[i]()
})
