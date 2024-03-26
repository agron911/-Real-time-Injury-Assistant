url = ""
twentycharstr = "aaaaaaaaaaaaaaaaaaaa"
let postIntervalId;
let getIntervalId;


async function send_post_request(){
    const resp = await fetch(url+"/messages/public", {
        method:"POST",
        body: JSON.stringify({
            username: "test",
            content: twentycharstr,
            timestamp: new Date().toString(),
            status: "ok",
            receiver: "all",
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
    return resp;
}

async function send_get_request(){
    const response = await fetch(url + "/messages/public", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
}

// function start_speed_test(){
//     fetch(url+"/speedtest", {
//         method:"POST",
//         body: JSON.stringify({
            
//         }),
//         headers: {
//             "Content-type": "application/json; charset=UTF-8",
//         },
//     })
// }

function stoptest(intervalid, duration){
    return new Promise(resolve =>{
        setTimeout(()=>{
            clearInterval(intervalid);
            resolve();

        },duration )
    })
}

function sleep(duration){
    return new Promise(resolve =>{
        setTimeout(()=>{
            resolve();
        },duration)
    })
}

async function run_test(interval, duration){
    
    var post_duration;
    var limitflag;
    var post_start = Date.now();
    var post_counter = 0;
    var get_counter = 0;
    postIntervalId = setInterval(async function(){
        const resp = await send_post_request();
        post_counter+=1;
        if(post_counter==1000){
            clearInterval(postIntervalId);
            limitflag = true
            alert("Request limit exceeded: 1000");
            stopSpeedTest();
            //tell user test was terminated
        }
    }, interval);

    await stoptest(postIntervalId, (duration/2)*1000);
    post_duration = (Date.now() - post_start)/1000;
    if(limitflag){
        // console.log("we here");
       
        return 0;
    }
    console.log('res',post_counter, post_duration);
    var get_start = Date.now();
    getIntervalId = setInterval(async function(){
        const resp = await send_get_request();
        if(Date.now() - post_start > (duration+5000)){
            // clearInterval(getIntervalId);
            //tell user test was terminated
        }
        else{
            get_counter+=1;
        }
    }, interval);
    await stoptest(getIntervalId, (duration - post_duration)*1000);
    var get_duration = (Date.now() - get_start)/1000;
    
    await sleep(5*1000);

    const performanceData = document.getElementById('performanceData');
    performanceData.style.display = 'block';
    document.getElementById('postPerformance').innerHTML = post_counter / post_duration;
    document.getElementById('getPerformance').innerHTML = get_counter / get_duration;
    stopSpeedTest();
    console.log(get_counter, get_duration);
}

const stopSpeedTest = async () => {
    clearInterval(postIntervalId);
    clearInterval(getIntervalId);
    await fetch(url+"speedTest/done",{
        method: "POST",
    });
    console.log("Speed stopped");
};

const showSpeedTestModal = () => {
    if(SUSPEND_NORMAL_OPERATION) return;
    const speedTestModal = new bootstrap.Modal('#speedTestModal');
    // const modal = document.getElementById('speedTestModal');
    // console.log("modal: ",modal);
    speedTestModal.show();
}

const start_speed_test = async () => {
    await fetch(url+'/speedtest', {
        method: 'POST',
        body: JSON.stringify({
            username: "test",
            socketID: localStorage.getItem('socketID'),
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    const interval = document.getElementById('interval').value;
    const duration = document.getElementById('duration').value;
     
    // console.log("interval: ",interval, duration);

    run_test(interval, duration);
}