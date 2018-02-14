$app.debug = true
var UIApp = $objc("UIApplication"),
  SApp = UIApp.invoke("sharedApplication"),
  keyWindow = SApp.invoke("keyWindow");
var rootVc = keyWindow.invoke("rootViewController")

var view = keyWindow.invoke("recursiveDescription").rawValue().toString()
$console.info(view)
var vc = rootVc.invoke("_printHierarchy").rawValue()
$console.info(vc)
var HintView = $objc("BaseHintView").invoke("alloc.init")
var CodeEditor = $objc("CodeEditor").invoke("alloc.init")
$console.info(HintView.invoke("_methodDescription").rawValue())
$console.info(CodeEditor.invoke("_methodDescription").rawValue())

//navVC.invoke("presentModalViewController:animated",CodeEditor,true)

$ui.render({
  props: {
    id: "v1",
    title: ""
  },
  views: [{
    type: "button",
    props: {
      id: "btn1",
      title: ">",
      bgcolor: $color("#2e5266"),
      titleColor: $color("white")
    },
    layout: function (t) {
      t.bottom.inset(30)
      t.right.inset(20)
      t.width.equalTo(65);
    },
    events: {
      tapped: function (t) {
        var navVC = rootVc.invoke("topViewController").invoke("navigationController")

        navVC.invoke("presentModalViewController:animated", CodeEditor, true)
        var button = {
          type: "button",
          props: {
            title: "X",
            bgcolor: $rgba(0, 0, 0, 0)
          },
          layout: function (make) {
            make.right.inset(10)
            make.top.inset(15)
          },
          events: {
            tapped(sender) {
              CodeEditor.invoke("dismissModalViewControllerAnimated", true)
            }
          }
        }

        CodeEditor.invoke("view").rawValue().add(button)

        $console.info(CodeEditor.invoke("view").rawValue().views)
      }
    }
  }]
})
