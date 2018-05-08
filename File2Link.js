if (void 0 === $context.data) {
    $ui.toast("请从分享面板运行");
    $app.close();
}
$http.request({
    method: "PUT",
    url: "https://transfer.sh/" + encodeURIComponent($context.data.fileName),
    body: $context.data,
    handler: resp => {
        let data = resp.data;
        if (data) {
            $clipboard.text = data;
            $ui.toast("链接已复制");
        } else {
            $ui.toast("Error");
        }
        $delay(1, () => $context.close());
    }
})