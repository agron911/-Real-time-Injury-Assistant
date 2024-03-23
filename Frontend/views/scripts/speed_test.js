url = ""
twentycharstr = "aaaaaaaaaaaaaaaaaaaa"
var post_counter = 0;
async function send_post_request(){
    const resp = await fetch(url+"/messages/public", {
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
    return resp
}

async function send_get_request(){
    const resp = await fetch(
        url +
        "messages/public" +
        currentUsername +
        "&username2=" +
        otherUsername,
        {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }
    );
}

function start_speed_test(){
    fetch(url+"/speedtest", {
        method:"POST",
        body: JSON.stringify({
            
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
}

async function run_test(interval, duration){
    const postIntervalId = setInterval(async function(){
        const resp = await send_post_request()
        post_counter+=1;
    }, interval);
    setTimeout(()=>{
        clearInterval(postIntervalId);
    },duration )
    console.log(post_counter/duration)

}