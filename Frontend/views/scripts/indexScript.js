// const socket = io();

//const { response } = require("express");

const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const userHelpBlock = document.getElementById('userHelpBlock');
const passwordHelpBlock = document.getElementById('passwordHelpBlock');

const url = "http://localhost:3000"

function cancelUser(){
    usernameInput.value = '';
    passwordInput.value = '';
    document.getElementById("acknowlegementmodal").style.display="none"

}

function saveUser(){
    fetch(url+"/users",{
        method:"POST",
        body: JSON.stringify({
            "username": usernameInput.value,
            "password": passwordInput.value,
        }),
        headers: {
        "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(async(response)=>{
        const {data} = await response.json();
        localStorage.setItem("username", data.username);
        document.getElementById("acknowlegementmodal").style.display="none";
        
        //Display acknowlegement modal
        document.getElementById("acknowlegementmodal1").style.display="block";
    })
    .catch(error => console.log(error))
}

const login = async (username, password) => {
    try {    
        const response = await fetch(url+"/auth/users",{
            method:"PATCH",
            body: JSON.stringify({
                username, 
                password,
                isOnline: true
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        if (response.status==200) {
            const data = await response.json();
            console.log("data", data);
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            // await connectToSocket();
            window.location.replace("/chatroom");
        }
    } catch (e) {
        console.log("login error", e);
    }
}

function submitJoinForm(){
    console.log(`button clicked!`);

    if (usernameInput && passwordInput) {
        console.log(usernameInput.value + passwordInput.value)
        fetch(url+"/users/verification", {
            method: "POST",
            body: JSON.stringify({
                "username": usernameInput.value,
                "password": passwordInput.value,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then((response) => {
            console.log(response)
            if (response.status == 201) {
                document.getElementById("acknowlegementmodal").style.display="block"
                //alert(`Success! Please login with your new username.`);
            } else if (response.status == 205){
                login(usernameInput.value, passwordInput.value)
            } else if (response.status == 400){
                alert(`Username exist. \nPlease re-enter a different username or input correct password.`);
            } else if (response.status == 401) {
                alert(`Username must be at least 3 characters long.`);
            } else if (response.status == 402) {
                alert(`Your password must be at least 4 characters long. \nPasswords are case sensitive!`);
            } else if (response.status == 403) {
                alert(`Your username is prohibited. Try again.`);
            } else {
                alert(`Server experienced a problem`);
            }
            //return response.json()
        })
        .catch(error => console.log(error))
    }
} 
    

async function userAcknowledged(){
    try{
        const url = "http://localhost:3000/users/acknowledgement"
        const username = localStorage.getItem("username");
        console.log('username: ' + username)
        const response = await fetch(url,{
            method: "POST",
            body: JSON.stringify({
                "username": localStorage.getItem("username"),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        if(response.status==200){
            window.location.replace('/chatroom');
            console.log('closing modal');
            document.getElementById("acknowlegementmodal1").style.display="none"
            usernameInput.value = '';
            passwordInput.value = '';
        }
    } catch(error) {
        console.log(error);
    }
}

