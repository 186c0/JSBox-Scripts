let email = "xxx";
let passwd = "xxx";
let site = 'https://xn--nos809b.com';

let colors = ['#e46367', '#e8b4b6', '#7dd1f0', '#ff6369', '#c2b5fa'];
async function login(email, passwd) {
    let resp = await $http.request({
        method: "POST",
        url: site + "/auth/login",
        header: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: {
            "email": email,
            "passwd": passwd
        }
    })
    return resp.response.statusCode;
}

async function getUsage() {
    let resp = await $http.get(site + "/user");
    let res = resp.data.match(/dataPoints:[\s\S]*?\]/);
    return eval(`{${res}}`);
}

function render() {
    $ui.render({
        props: {
            title: ""
        },
        views: [{
                type: "canvas",
                props: {
                    id: "cvs"
                },
                layout: (make, view) => {
                    make.edges.equalTo($insets(30, 20, 0, 20))
                },
                events: {
                    draw: function (view, ctx) {
                        if (points.length < 2) return;
                        ctx.translateCTM(view.frame.width, view.frame.height);
                        ctx.rotateCTM(-Math.PI);
                        ctx.setAlpha(0.9);
                        ctx.fillColor = $color(colors[2])
                        ctx.fillRect($rect(0, view.frame.height * 0.5, view.frame.width, 80));
                        for (let i = 0; i < 2; i++) {
                            ctx.saveGState();
                            ctx.fillColor = $color(colors[i])
                            ctx.fillRect($rect(0, view.frame.height * 0.5, points[i] / 100 * view.frame.width, 80));
                            ctx.restoreGState();
                        }
                    }
                }
            },
            {
                type: "label",
                props: {
                    text: text.join(" | "),
                    font: $font('ArialRoundedMTBold', 14),
                    textColor: $color("#555"),
                    autoFontSize: true,
                    align: $align.center
                },
                layout: function (make, view) {
                    make.centerX.equalTo($("cvs"));
                    make.centerY.equalTo($("cvs")).offset(25);
                    make.width.equalTo($("cvs"));
                }
            }
        ]
    })
}


let usage = await getUsage();
if (usage.length < 1) {
    if (await login(email, passwd) !== 200) {
        $ui.toast("登录失败");
        $app.close();
    } else {
        $ui.toast("登录成功");
        usage = await getUsage();
    }
}
let points = usage.map(i => i.y);
let text = usage.map(i => i.legendText);
render();