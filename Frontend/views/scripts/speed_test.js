url = ""
twentycharstr = "aaaaaaaaaaaaaaaaaaaa"
function send_post_request(){
    fetch(url+"/speedtest", {
        method:"POST",
        body: JSON.stringify({
            username: "test",
            content: twentycharstr,
            status: "ok",
            receiver: "test",
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
}