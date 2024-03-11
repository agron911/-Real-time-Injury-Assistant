const url = "http://localhost:3000";

function electPost() {
    
    document.getElementById("elect-form").style.display = "none";
    document.getElementById("public-wall").style.display = "block";
    fetch (url+'/messages', {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        }
    }).then(async (response)=>{
        data = await response.json()
        if (!data.empty) {
            for (let msg of data.archive) {
                let msgCard = createMsgCard(msg);
                messages.appendChild(msgCard);

            }
        }
    })
}
// Create usercard for 'users' ul
function createUserCard(user) {


    let listItem = document.createElement("li");
    listItem.className = "list-group-item";

    let cardBody = document.createElement("div");
    cardBody.className = "card-body";

    let cardHeader = document.createElement("div");
    cardHeader.className = "card-header";

    const iconElement = document.createElement("i");
    iconElement.classList.add("las");
    iconElement.id = "user-status-icon-" + user.username;
    console.log("user status123", user.username, user.status);
    if (user.status === "ok") {
        iconElement.classList.add("la-check-circle");
        iconElement.classList.add("check-icon");
    } else if (user.status === "help") {
        console.log("setting icon class", user.status);
        iconElement.classList.add("la-exclamation-circle");
        iconElement.classList.add("danger-icon");
    } else if (user.status === "emergency") {
        iconElement.classList.add("la-plus-square");
        iconElement.classList.add("plus-icon");
    } 

    let title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = user.username;


    cardHeader.appendChild(title);
    cardHeader.appendChild(iconElement);


    let dot = document.createElement("span");
    dot.className = "dot";
    dot.classList.add(user.online ? "online" : "offline");

    let statusText = document.createTextNode(user.online ? "Online" : "Offline");
    
    
    cardBody.appendChild(cardHeader);
    cardBody.appendChild(dot);
    cardBody.appendChild(statusText);

    listItem.appendChild(cardBody);
    return listItem;
}

function createMsgCard(msg) {
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";

    let card = document.createElement("div");
    card.className = "card mx-3 my-3";
    card.style = "max-width: 36rem;";

    let cardBody = document.createElement("div");
    cardBody.className = "card-body";

    let title = document.createElement("h5");
    title.className = "card-title fw-bold";

    // let status = document.createElement("p");
    // status.className = "card-text";

    const iconElement = document.createElement("i");
    iconElement.classList.add("las");




    // let txt = document.createElement("small");
    // txt.className = "text-body-secondary";
    // txt.textContent = msg.status;
    // status.appendChild(txt);

    if (msg.username == localStorage.getItem("username")) {
        card.className = "card ms-auto my-3 mx-3";
        title.textContent = "Me";
    } else {
        title.textContent = msg.username;
    }

    let text = document.createElement("p");
    text.className = "card-text";
    text.textContent = msg.content;

    let timestamp = document.createElement("p");
    timestamp.className = "card-text text-end";
    let time = document.createElement("small");
    time.className = "text-body-secondary";
    time.textContent = msg.timestamp;
    timestamp.appendChild(time);

    cardBody.appendChild(title);
    cardBody.appendChild(iconElement);
    cardBody.appendChild(text);
    cardBody.appendChild(timestamp);
    card.appendChild(cardBody);
    listItem.appendChild(card);
    return listItem;
}

const setIconClass = (status, iconElement) => {
    iconElement.remove("las");
    // iconElement.remove("la-check-circle");
    // iconElement.remove("la-exclamation-circle");
    // iconElement.remove("la-plus-square");
    // iconElement.remove("check-icon");
    // iconElement.remove("danger-icon");
    // iconElement.remove("plus-icon");

    iconElement.classList.add("las");

    
    if (status === "ok") {
        iconElement.classList.add("la-check-circle");
        iconElement.classList.add("check-icon");
    } else if (status === "help") {
        console.log("setting icon class", status);
        iconElement.classList.add("la-exclamation-circle");
        iconElement.classList.add("danger-icon");
    } else if (status === "emergency") {
        iconElement.classList.add("la-plus-square");
        iconElement.classList.add("plus-icon");
    }
} 

const updateUserStatusIconEverywhere = (status, username)=>{
    const icon = document.getElementById("user-status-icon-"+username);
    setIconClass(status, icon);
}

const registerSocket = async (username, socketId) => {
    try {
        await fetch(url + "/sockets/users/" + username, {
            method: "POST",
            body: JSON.stringify({ socketId }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });
    } catch (e) {
        console.log("socket registration error", e);
    }
};

const connectToSocket = async ( addMessages) => {
    const socket = await io(url);
    socket.on("connect", async () => {
        console.log("connection established", socket.id);
        await registerSocket(localStorage.getItem('username'), socket.id);
    })
    // socket.on("initMessages", (data) => {
    //     initMessages(data);
    // });
    socket.on("chat message", (msg) => {
        addMessages(msg);
    });

    socket.on("updateUserList", async () => {
        await fetchInitialUserList();
    });

    socket.on("status-update", (data) => {
        console.log("status update", data);
        updateUserStatusIconEverywhere(data.status, data.username);
    })
};

const getStatus = async (username) => {
    try {
        const res = await fetch(url + "/user/status/" + username, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        });
        const { status } = await res.json();
        return status;
    } catch (e) {
        console.log("error fetching status");
    }
};

const setStatusButtonUI = (status) => {
    const statusElement = document.getElementById("status-button");
    if (status === "ok") {
        statusElement.innerHTML = '<i class="las la-check-circle check-icon">';
    } else if (status === "help") {
        statusElement.innerHTML =
            '<i class="las la-exclamation-circle danger-icon"></i>';
    } else if (status === "emergency") {
        statusElement.innerHTML = '<i class="las la-plus-square plus-icon"></i>';
    }
};

const changeStatus = async (status) => {
    try {
        const username = localStorage.getItem("username");
        const res = await fetch(url + "/user/status/" + username , {
            method: "PUT",
            body: JSON.stringify({ status }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });
        if (!res.ok) {
            throw new Error(`Error fetching status: ${response.statusText}`);
        }
        setStatusButtonUI(status);
    } catch (err) { }
};

const logout = async () => {
    try {
        await fetch(url + "/auth/users", {
            method: "PATCH",
            body: JSON.stringify({
                isOnline: false,
                username: localStorage.getItem("username"),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });
        localStorage.setItem("token", null);
        localStorage.setItem("username", null);
    } catch (e) { }
};

const fetchInitialUserList = async () => {
    console.log("fetching users");
    const response = await fetch(url + "/users");
    const users = await response.json();
    displayUsers(users);
};

const displayUsers = (users) => {
    console.log("users", users);
    const usersListElement = document.getElementById("users");
    usersListElement.innerHTML = "";

    users.users.forEach((user) => {
        let userCard = createUserCard(user);
        usersListElement.appendChild(userCard);
    });
};

window.onload = async () => {
    try {
        const username = localStorage.getItem("username");
        if (username) {
            
            
            const messages = document.getElementById("messages");
            const messageForm = document.getElementById("messageForm");
            const textInput = document.getElementById("textInput");
            const toggleButton = document.getElementById("toggle-btn");
            
            // When user submit a new message
            messageForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (textInput.value) {
                    const inputbuf = textInput.value;
                    textInput.value = "";
                    const status = await getStatus(username);
                    console.log("status", status);
                    if (status) setStatusButtonUI(status);
                    await fetch(url + "/messages", {
                        method: "POST",
                        body: JSON.stringify({
                            username: username,
                            content: inputbuf,
                            timestamp: new Date().toString(),
                            status : status
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                    });
                }
            });
            const addMessage = (msg) => {
                let msgCard = createMsgCard(msg);
                messages.appendChild(msgCard);
                window.scrollTo(0, document.body.scrollHeight);
            }
            await connectToSocket( addMessage);

            toggleButton.addEventListener("click", async (e) => {
                e.preventDefault();
                await logout();
                window.location.replace("/");
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
