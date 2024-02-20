const url = "http://localhost:3000"

const registerSocket = async (username, socketId) =>{
    try {
        await fetch(url+"/socket/users/"+username, {
            method:"POST",
            body: JSON.stringify({socketId}),  
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    } catch (e) {
        console.log("socket registration error", e);
    }
}

const connectToSocket = async (initMessages, addMessages) => {
    const socket = io(url);
    socket.on("connect", async()=>{
        console.log("connection established", socket.id);
        await registerSocket(localStorage.getItem('username'), socket.id);
    })
    socket.on("initMessages", (data) => {
        initMessages(data);
    });
    socket.on("chat message", (msg) => {
        addMessages(msg);
    });
}

const logout = async() => {
    try {
        await fetch(url+"/auth/users",{
            method:"PATCH",
            body: JSON.stringify({
                isOnline: false,
                username: localStorage.getItem('username'),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        localStorage.setItem("token", null);
        localStorage.setItem("username", null);
    } catch (e) {

    }
}

window.onload = async () => {
  try {
    const username = localStorage.getItem('username');
    if(username){
        const message = document.getElementById("messages");
        const messageForm = document.getElementById("messageForm");
        const textInput = document.getElementById("textInput");
        const toggleButton = document.getElementById("toggle-btn");
        const initMessages = (data) => {
            if (!data.empty) {
                for (var msg of data.archive) {
                  const item = document.createElement("li");
                  item.className = "message";
                  // Change username to 'me' when user matches+
                  if (msg.username == localStorage.getItem("username")) {
                    item.innerHTML = `<strong>Me</strong><span class="timestamp">${msg.timestamp}</span><p>${msg.content}</p>`;
                  } else {
                    item.innerHTML = `<strong>${msg.username}</strong><span class="timestamp">${msg.timestamp}</span><p>${msg.content}</p>`;
                  }
                  message.appendChild(item);
                }
            }
        }
        messageForm.addEventListener("submit", async(e) => {
            e.preventDefault();
            if (textInput.value) {
              await fetch("http://localhost:3000/message", {
                method: "POST",
                body: JSON.stringify({
                  username: username,
                  content: textInput.value,
                }),
                headers: {
                  "Content-type": "application/json; charset=UTF-8",
                },
              });
              textInput.value = "";
            }
        });
        const addMessage = (msg) => {
            const item = document.createElement("li");
            item.className = "message";
            if (username == msg.username) {
                item.innerHTML = `<strong>Me</strong><span class="timestamp">${msg.timestamp}</span><p>${msg.content}</p>`;
            } else {
                item.innerHTML = `<strong>${msg.username}</strong><span class="timestamp">${msg.timestamp}</span><p>${msg.content}</p>`;
            }
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }
        await connectToSocket(initMessages, addMessage);
        
        toggleButton.addEventListener("click", async(e) => {
            e.preventDefault();
            await logout();
            window.location.replace('/');
        }); 
    }   
  } catch (err) {
    console.log("err", err);
    // alert(
    //   `Failed to load chatroom for user ${err?.message || "Unknown error."}`
    // );
    // window.location.href = "/";
  }
};
