$app.strings = {
  en: {
    input: 'Input class name like: BaseHintView',
    toast_wrong: 'Wrong class name'
  },
  'zh-Hans': {
    input: '输入类名如: BaseHintView',
    toast_wrong: '类名输入有误'
  }
}

function renderCode(text) {
  if (!text) return
  let code = text
    .replace(/[\u00A0-\u9999<>\&]/gim, i => `&#${i.charCodeAt(0)};`)
    .replace(/\t/g, '  ')
    .replace(/\s\(0x\w+\)/g, '')
    .replace(/(\nin[^\n]+?:)/g, '\n\n$1')
  $('web').html = `<html><meta name="viewport" content="user-scalable=no" /><link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/github-gist.min.css'><style>*{margin:0;padding:0;}pre{font-size:18px;}</style><script src='http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js'></script><script>hljs.initHighlightingOnLoad();</script><body class='hljs'><pre><code class='hljs'>${code}</code></pre></body></html>`
}

$ui.render({
  props: {
    title: 'Class Viewer'
  },
  views: [
    {
      type: 'input',
      props: {
        type: $kbType.ascii,
        placeholder: $l10n('input')
      },
      layout(make) {
        make.height.equalTo(30)
        make.left.top.right.inset(5)
      },
      events: {
        returned(sender) {
          let className = sender.text
          if (!className) return
          let methods = $objc(className).invoke('_methodDescription')
          if (methods === false) {
            $ui.toast($l10n('toast_wrong'))
            sender.runtimeValue().invoke('selectAll')
          } else {
            sender.blur()
            renderCode(methods.rawValue().toString())
          }
        },
        didBeginEditing(sender) {
          sender.runtimeValue().invoke('selectAll')
        }
      }
    },
    {
      type: 'web',
      props: {
        id: 'web',
        style:
          'pre{white-space:pre-wrap;white-space:-pre-wrap;word-wrap:break-word;}'
      },
      layout(make, view) {
        let pre = view.prev
        make.top.equalTo(pre.bottom).offset(5)
        make.bottom.left.right.inset(0)
      }
    }
  ]
})

$('input').focus()
