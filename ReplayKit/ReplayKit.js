// https://t.me/Eva1ent
// 用法:运行开始录屏, 再次运行结束录屏，中途摇晃设备快速结束录屏
const W = $device.info.screen.width
const H = $device.info.screen.height
const NSBundle = $objc('NSBundle')
NSBundle.invoke('bundleWithPath:', '/System/Library/Frameworks/ReplayKit.framework').invoke('load')
const rootViewController = $objc('UIApplication').invoke('sharedApplication').invoke('keyWindow').invoke('rootViewController')
const topNavigationController = () => rootViewController.invoke('topViewController.navigationController')
const RPScreenRecorder = $objc('RPScreenRecorder')
const recorder = RPScreenRecorder.invoke('sharedRecorder')
const isAvailable = recorder.invoke('isAvailable')
const isRecording = () => recorder.invoke('isRecording')
// let volume = $system.volume;


function start() {
  $ui.toast('开始录制', 0.5)
  recorder.invoke('startRecordingWithMicrophoneEnabled:handler:', 'NO', null)
  $motion.startUpdates({
    interval: 0.1,
    handler: function (resp) {
      let [
        x,
        y,
        z
      ] = Object.values(resp.acceleration).map(i => Math.abs(i))
      if (x + y + z > 1.2) {
        $motion.stopUpdates()
        stop()
      }
    }
  })
}

function stop() {
  $ui.toast('停止录制')
  // ^(RPPreviewViewController * _Nullable previewViewController, NSError * _Nullable error)
  const handler = $block('void, RPPreviewViewController *, NSError *', function (vc, error) {
    const btn = {
      type: 'button',
      props: {
        bgcolor: $rgba(255, 255, 255, 0.001)
      },
      layout: make => {
        make.top.left.inset(0)
        make.size.equalTo($size(100, 55))
      },
      events: {
        tapped: () => vc.invoke('dismissViewControllerAnimated:completion:', 'YES', null)
      }
    }
    vc.invoke('view').rawValue().add(btn)
    topNavigationController().invoke('presentViewController:animated:completion:', vc, 'YES', null)
  })
  recorder.invoke('stopRecordingWithHandler:', handler)
}

function main() {
  isAvailable ? isRecording() ? stop() : start() : $ui.toast('不支持')
}

main()
