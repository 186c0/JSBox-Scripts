let LAContext = $objc("LAContext").invoke("alloc.init");
let handler = $block("void, BOOL", success => $thread.main({
  delay: 0,
  handler: () => $ui.alert(success ? "验证成功" : "验证失败")
}));
LAContext.invoke("evaluatePolicy:localizedReason:reply:", 2, "验证以继续", handler);