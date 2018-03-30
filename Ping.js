const width = $device.info.screen.width;
const period = 0.2;
const timeout = 2.0;
let W, H;
let ratio = 10;
let hostIp = void 0;
let rtts = [];
let x = 0;
let min = 0;
let max = 0;
let avg = 0;
let rec = 0;
let loss = 0;
let offsetX = 0;
let isRunning = false;

Array.prototype.max = function () {
  return Math.max(...this);
};
Array.prototype.min = function () {
  return Math.min(...this);
};
Array.prototype.avg = function () {
  return this.reduce((partial, value) => (partial + value)) / this.length;
};

$app.keyboardToolbarEnabled = true;
$ui.render({
  props: {
    title: 'Ping'
  },
  views: [{
      type: "label",
      props: {
        id: 'info',
        font: $font("ArialRoundedMTBold", 12),
        color: $color("#666"),
        bgcolor: $rgba(233, 233, 233, 0.8),
        align: $align.center
      },
      layout: m => {
        m.bottom.inset(0);
        m.width.equalTo(width);
        m.height.equalTo(22);
      }
    },
    {
      type: "label",
      props: {
        id: 'ip',
        font: $font(20),
        color: $color("#777"),
        align: $align.center
      },
      layout: m => {
        m.bottom.equalTo($('info').top).inset(10);
        m.width.equalTo(width);
        m.height.equalTo(30);
      }
    },
    {
      type: "canvas",
      layout: $layout.fill,
      events: {
        draw: function (view, ctx) {
          W = view.frame.width;
          H = view.frame.height;
          if (rtts.length > 0) {
            drawMinMaxLine(view, ctx);
            drawAvgLine(view, ctx);
            drawStdRect(view, ctx);
            drawLineGraph(view, ctx);
          }
        },
      },
    },
    {
      type: "input",
      props: {
        placeholder: "请输入域名或IP",
        font: $font("ArialRoundedMTBold", 16),
        textColor: $color("#666"),
        align: $align.natural,
        type: $kbType.search,
        darkKeyboard: true,
      },
      layout: (m, v) => {
        m.right.equalTo(v.left).offset(-10);
        m.height.equalTo(30);
        m.top.inset(5);
        m.left.inset(10);
        m.right.inset(65);
      },
      events: {
        didBeginEditing: function (sender) {
          stopPing();
          reset();
        }
      }
    },
    {
      type: "button",
      props: {
        font: $font("ArialRoundedMTBold", 16),
        bgcolor: $rgba(100, 100, 100, 0.9),
        title: "Ping"
      },
      layout: (m, v) => {
        let _v = $("input");
        m.bottom.height.equalTo(_v);
        m.width.equalTo(55);
        m.left.equalTo(_v.right).offset(5);
      },
      events: {
        tapped: function () {
          let input = $("input").text;
          let host = input.replace(/^\s*|\s*$/g, '');
          testPing(host);
          isRunning && stopPing();
        }
      }
    }
  ],
});
let cvs = $("canvas");

function testPing(host) {
  $network.startPinging({
    host: host,
    timeout: 2.0,
    period: 1.0,
    payloadSize: 1,
    ttl: 49,
    didReceiveReply: function (summary) {
      hostIp = summary.host;
      $network.stopPinging();
      if (hostIp) {
        $('ip').text = hostIp;
        startPing(hostIp);
      }
    },
  });
}

function startPing(ip) {
  isRunning = true;
  $('button').title = 'Stop';
  $network.startPinging({
    host: ip,
    timeout: timeout,
    period: period,
    payloadSize: 24,
    ttl: 49,
    didReceiveReply: function (summary) {
      rec++;
      let rtt = parseFloat((summary.rtt * 1000).toFixed(1));
      rtts.push(rtt);
      update(rtt);
    },
    didTimeout: function (summary) {
      $ui.toast('Timeout', 1);
      loss++;
    },
    didFail: function (error) {
      $ui.toast(error);
    },
    didFailToSendPing: function (response) {
      $ui.toast('FailToSendPing');
    }
  });
}

function stopPing() {
  isRunning = false;
  $('button').title = 'Ping';
  $network.stopPinging();
}

function reset() {
  rtts = [];
  hostIp = void 0;
  offsetX = 0;
  ratio = 10;
  avg = 0;
  cvs.runtimeValue().invoke("setNeedsDisplay");
  $("info").text = '';
  $("ip").text = '';
}

function drawLineGraph(view, ctx) {
  ctx.saveGState();
  ctx.setAlpha(0.9);
  ctx.strokeColor = $color("#08a4df");
  ctx.moveToPoint(-10, H / 1.125 - rtts[0] * ratio);
  ctx.setLineWidth(4);
  ctx.setLineCap(1);
  ctx.setLineJoin(1);
  ctx.setShadow($size(1, 1), 3.3, $color("#999"));
  for (let i = 1; i < rtts.length; ++i) {
    x = i * 10 + 10;
    ctx.addLineToPoint(x - offsetX, H / 1.125 - rtts[i] * ratio);
  }
  if (max * ratio > H / 1.125 - 40) {
    ratio *= 0.9;
    // $ui.toast(ratio);
  }
  ctx.strokePath();
  ctx.restoreGState();
}

function drawMinMaxLine(view, ctx) {
  ctx.saveGState();
  ctx.setAlpha(0.6);
  ctx.setLineWidth(2);
  ctx.strokeColor = $color("#ccc");
  ctx.moveToPoint(0, H / 1.125 - min * ratio);
  ctx.addLineToPoint(W, H / 1.125 - min * ratio);
  ctx.moveToPoint(0, H / 1.125 - max * ratio);
  ctx.addLineToPoint(W, H / 1.125 - max * ratio);
  ctx.strokePath();
  ctx.restoreGState();
}

function drawAvgLine(view, ctx) {
  ctx.saveGState();
  ctx.setAlpha(0.5);
  ctx.setLineWidth(2);
  ctx.strokeColor = $color("#8ce69c");
  ctx.moveToPoint(0, H / 1.125 - avg * ratio);
  ctx.addLineToPoint(W, H / 1.125 - avg * ratio);
  ctx.strokePath();
  ctx.restoreGState();
}

function drawStdRect(view, ctx) {
  let deviations = rtts.map(x => x - avg);
  let stddev = Math.sqrt(deviations.map(i => i * i).reduce((x, y) => x + y) / (rtts.length - 1));
  ctx.saveGState();
  ctx.setAlpha(0.1);
  ctx.fillColor = $color("#8ce69c");
  ctx.fillRect($rect(0, (H / 1.125 - avg * ratio) - stddev * ratio * 0.5, W, stddev * ratio));
  ctx.restoreGState();
}

function update(rtt) {
  avg = rtts.avg();
  if (x > W - 10) {
    offsetX += 10;
    // rtts.shift();
  }
  min = rtts.min();
  max = rtts.max();
  let lossRate = loss / (loss + rec);
  cvs.runtimeValue().invoke("setNeedsDisplay");
  $("info").text = `NOW: ${rtt} AVG:${avg.toFixed(1)}  MIN: ${min}  MAX: ${max}  LOSS: ${(lossRate*100).toFixed(2)}%`;
}