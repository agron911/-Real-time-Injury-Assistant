url = ""
twentycharstr = "aaaaaaaaaaaaaaaaaaaa"
var post_counter = 0;
var get_counter = 0;
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

function stoptest(intervalid, duration){
    return new Promise(resolve =>{
        setTimeout(()=>{
            clearInterval(intervalid);
            resolve();

        },duration )
    })
}

async function run_test(interval, duration){
    var post_duration;
    var limitflag;
    var post_start = Date.now();
    const postIntervalId = setInterval(async function(){
        const resp = await send_post_request();
        post_counter+=1;
        if(post_counter==1000){
            clearInterval(postIntervalId);
            limitflag = true
            //tell user test was terminated
        }
    }, interval);

    await stoptest(postIntervalId);
    const post_duration = Date.now() - post_start;
    if(limitflag){
        return 0;
    }
    console.log(post_counter/dur);
    var get_start = Date.now();
    const getIntervalId = setInterval(async function(){
        const resp = await send_get_request();
        if(Date.now() - post_start > duration+5){
            clearInterval(getIntervalId);
            //tell user test was terminated
        }
        else{
            get_counter+=1;
        }
    },interval);
    await stoptest(getIntervalId, (duration - post_duration));
    await sleep(5);
    var get_duration = Date.now() - get_start;
    
    /*setTimeout(()=>{
        clearInterval(getIntervalId);
    }, duration/2);*/
    console.log(get_counter/get_duration);

}