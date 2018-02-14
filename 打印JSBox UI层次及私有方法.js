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
