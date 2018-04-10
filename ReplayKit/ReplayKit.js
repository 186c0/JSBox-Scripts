// https://t.me/Eva1ent
$app.tips('用法:运行开始录屏，摇晃设备结束录屏\n在需要录制的拓展中 require 此脚本');
const W = $device.info.screen.width;
const H = $device.info.screen.height;
let NSBundle = $objc('NSBundle');
NSBundle.invoke('bundleWithPath:', '/System/Library/Frameworks/ReplayKit.framework').invoke('load');
let rootViewController = $objc("UIApplication").invoke("sharedApplication").invoke("keyWindow").invoke("rootViewController");
let RPScreenRecorder = $objc("RPScreenRecorder");
let recorder = RPScreenRecorder.invoke('sharedRecorder');
let isAvailable = recorder.invoke('isAvailable');
// let volume = $system.volume;

function navigationController() {
  return rootViewController.invoke("topViewController.navigationController");
}

function start() {
  $ui.toast("开始录制", 0.5);
  recorder.invoke('startRecordingWithMicrophoneEnabled:handler:', 'NO', null);
}

function stop() {
  $ui.toast("停止录制");
  let handler = $block("void, RPPreviewViewController *, NSError *", function (vc, error) {
    let btn = {
      type: "button",
      props: {
        bgcolor: $rgba(0, 0, 0, 0.01),
      },
      layout: make => {
        make.top.left.inset(0);
        make.size.equalTo($size(100, 55));
      },
      events: {
        tapped: function () {
          vc.invoke("dismissModalViewControllerAnimated", 'YES');
        }
      }
    };
    vc.invoke('view').rawValue().add(btn);
    navigationController().invoke("presentModalViewController:animated", vc, 'YES');
  });
  recorder.invoke('stopRecordingWithHandler:', handler);
}

if (!isAvailable) {
  $ui.toast('不支持');
  // $app.close();
} else {
  start();
  $motion.startUpdates({
    interval: 0.1,
    handler: function (resp) {
      let {x, y, z} = resp.acceleration;
      if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) > 1.2) {
        $motion.stopUpdates();
        stop();
      }
    }
  });
}

// $app.tips('按音量 + 键开始录屏，音量 - 键结束录屏');
// let timer = $timer.schedule({
//     interval: 1,
//     handler: () => {
//         if ($system.volume > volume) {
//             start();
//         } else if ($system.volume < volume) {
//             timer.invalidate()
//             stop();
//         }
//     }
// });

// ^(RPPreviewViewController * _Nullable previewViewController, NSError * _Nullable error)