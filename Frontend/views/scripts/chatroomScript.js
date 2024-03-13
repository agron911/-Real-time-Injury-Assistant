const url = "";

let CHATROOM_USER = "";

const getPrivateMessages = async (otherUsername) => {
    const currentUsername = localStorage.getItem("username");
    const data = await fetch(
        url +
        "/messages/private?username1=" +
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
    const { archive } = await data.json();
    console.log(archive);
    return archive;
};

const sendMessage = async () => {
    
    if (CHATROOM_USER) {
        sendPrivateMessage(CHATROOM_USER);
    } else {
        sendPublicMessage();
    }
};

const sendPrivateMessage = async (receiverUsername) => {
    const textInput = document.getElementById("textInput");
    const username = localStorage.getItem("username");
    if (textInput.value) {
        const inputbuf = textInput.value;
        textInput.value = "";
        const status = await getStatus(username);
        if (status) setStatusButtonUI(status);
        await fetch(url + "/messages/private", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                content: inputbuf,
                status: status,
                receiver: receiverUsername,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });
        
        showPrivateMessage(receiverUsername);
    }
};

const sendPublicMessage = async () => {
    const textInput = document.getElementById("textInput");
    const username = localStorage.getItem("username");
    if (textInput.value) {
        const inputbuf = textInput.value;
        textInput.value = "";
        const status = await getStatus(username);
        if (status) setStatusButtonUI(status);
        await fetch(url + "/messages/public", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                content: inputbuf,
                timestamp: new Date().toString(),
                status: status,
                receiver: "all", // to send messages to public wall
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });
    }
};



const showPrivateMessage = async (otherUsername) => {
    document.getElementById("elect-form").style.display = "none";
    document.getElementById("wall").style.display = "flex";

    const chatroomTypeTitleElement = document.getElementById("chatroom-type-title");
    
    const msgs = await getPrivateMessages(otherUsername);
    const messageContainer = document.getElementById("messages");
    console.log("msgs", msgs);
    messageContainer.innerHTML = "";
    chatroomTypeTitleElement.innerHTML = otherUsername+" Chatroom";
    if (!msgs.empty) {
        for (let msg of msgs) {
            addMessages(msg);
        }
    }
    const messageElement = document.getElementById("messages");
    messageElement.scrollTo(0, messageElement.scrollHeight);
    CHATROOM_USER = otherUsername;
};

function getArchive() {
    document.getElementById("elect-form").style.display = "none";
    document.getElementById("wall").style.display = "flex";
    fetch(url + "/messages/public", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    }).then(async (response) => {
        data = await response.json();
        if (!data.empty) {
            for (let msg of data.archive) {
                let msgCard = createMsgCard(msg);
                messages.appendChild(msgCard);
            }
        }
    });
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
    if (user.status === "ok") {
        iconElement.classList.add("la-check-circle");
        iconElement.classList.add("check-icon");
    } else if (user.status === "help") {
        iconElement.classList.add("la-exclamation-circle");
        iconElement.classList.add("danger-icon");
    } else if (user.status === "emergency") {
        iconElement.classList.add("la-plus-square");
        iconElement.classList.add("plus-icon");
    }

    let title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = user.username;
    title.style.cursor = "pointer";
    title.addEventListener("click", () => showPrivateMessage(user.username));

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

    console.log("msg status", msg.status);

    setIconClass(msg.status, iconElement);

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
    iconElement.classList.remove("la-check-circle");
    iconElement.classList.remove("la-exclamation-circle");
    iconElement.classList.remove("la-plus-square");
    iconElement.classList.remove("check-icon");
    iconElement.classList.remove("danger-icon");
    iconElement.classList.remove("plus-icon");

    if (status === "ok") {
        iconElement.classList.add("la-check-circle");
        iconElement.classList.add("check-icon");
    } else if (status === "help") {
        iconElement.classList.add("la-exclamation-circle");
        iconElement.classList.add("danger-icon");
    } else if (status === "emergency") {
        iconElement.classList.add("la-plus-square");
        iconElement.classList.add("plus-icon");
    }
};

const updateUserStatusIconEverywhere = (status, username) => {
    const icon = document.getElementById("user-status-icon-" + username);
    setIconClass(status, icon);
};

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

const connectToSocket = async () => {
    const socket = await io(url);
    socket.on("connect", async () => {
        const username = localStorage.getItem("username");
        await registerSocket(localStorage.getItem("username"), socket.id);
    });
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
        updateUserStatusIconEverywhere(data.status, data.username);
    });

    socket.on("private-message", (data) => {
        console.log("private-message", data);
        showMessageAlert(data, "primary");
    })
};

const closeAlertAndShowMessage = (message) => {
    console.log("message", message, message._id);
    const alert = bootstrap.Alert.getOrCreateInstance('#'+message._id);
    CHATROOM_USER = message.username;
    const titleElement = document.getElementById('message-modal-title');
    const statusElement = document.getElementById('message-modal-status');

    const iconElement = document.createElement("i");
    iconElement.classList.add("las");
    iconElement.id = "user-status-icon-" + message.username;
    if (message.status === "ok") {
        iconElement.classList.add("la-check-circle");
        iconElement.classList.add("check-icon");
    } else if (message.status === "help") {
        iconElement.classList.add("la-exclamation-circle");
        iconElement.classList.add("danger-icon");
    } else if (message.status === "emergency") {
        iconElement.classList.add("la-plus-square");
        iconElement.classList.add("plus-icon");
    }

    const timeStampElement = document.getElementById('message-modal-timestamp');
    const contentElement = document.getElementById('message-modal-content');

    titleElement.innerHTML = `New Message from ${message.username}`
    while (statusElement.firstChild) {
        statusElement.removeChild(statusElement.firstChild);
    }
    statusElement.appendChild(iconElement);

    timeStampElement.innerHTML = message.timestamp;
    contentElement.innerHTML = message.content;
    
    alert.close();
    const alertContainer = document.getElementById("liveAlertPlaceholder");
    if(alertContainer.children.length == 0){
        hideNotificationDot();
        alertContainer.style.display = "none";
    }
}

const showMessageAlert = (message, type) => {
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    const wrapper = document.createElement('div');
    wrapper.id  = message._id;
    console.log("showMessage", message);
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible alert-fse" role="alert">`,
      `   <div>${message.username}: ${message.content}</div>`,
      `<div class ="alert-button-container">`,
      `   <button type="button" id="button-${message._id}" aria-label="Close" data-bs-toggle="modal"  data-bs-target="#exampleModal" ><i class="las la-eye"></i></button>`,
      `</div>`,
      '</div>'
    ].join('')
    
    alertPlaceholder.append(wrapper);
    const button = document.getElementById(`button-${message._id}`);
    button.addEventListener('click', () => closeAlertAndShowMessage(message));
    showNotificationDot();
  }

const replyToUser = ()=>{
    showPrivateMessage(CHATROOM_USER);
}
  

const getStatus = async (username) => {
    try {
        const res = await fetch(url + "/user/status/" + username, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
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
        const res = await fetch(url + "/user/status/" + username, {
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
    const usersListElement = document.getElementById("users");
    usersListElement.innerHTML = "";

    users.users.forEach((user) => {
        let userCard = createUserCard(user);
        usersListElement.appendChild(userCard);
    });
};

const addMessages = (msg) => {
    const messages = document.getElementById("messages");
    let msgCard = createMsgCard(msg);
    messages.appendChild(msgCard);
    window.scrollTo(0, document.body.scrollHeight);
};

const getUnreadMessages = async () => {
    const username = localStorage.getItem("username");
    const data = await fetch(
        url +
        "/messages/private/" +
        username,
        {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }
    );
    const {archive} = await data.json();
    
    return archive;
};

const getAlerts = async () => {
    const unreadMessages = await getUnreadMessages();
    console.log("archives",unreadMessages);
    for (const msg of unreadMessages){
        console.log("msg", msg);
        showMessageAlert(msg, "primary");
    }
}

window.onload = async () => {
    try {
        const username = localStorage.getItem("username");
        if (username) {
            const toggleButton = document.getElementById("toggle-btn");
            await connectToSocket();
            toggleButton.addEventListener("click", async (e) => {
                e.preventDefault();
                await logout();
                window.location.replace("/");
            });
            const status = await getStatus(username);
            if (status) setStatusButtonUI(status);
            await getAlerts();
        }
    } catch (err) {
        console.log("err", err);
        // alert(
        //   `Failed to load chatroom for user ${err?.message || "Unknown error."}`
        // );
        // window.location.href = "/";
    }
};


function showNotificationDot() {
    document.querySelector('.notification-dot').style.display = 'block';
}

function hideNotificationDot() {
    document.querySelector('.notification-dot').style.display = 'none';
}

let notificationOpen = false;

function handleAlertClick() {
    // Your logic here
    const alertContainer = document.getElementById("liveAlertPlaceholder");
    if(!notificationOpen) {
        alertContainer.style.display = 'block';
    } else {
        alertContainer.style.display = 'none';
        
    }
    if(alertContainer.children.length == 0){
        hideNotificationDot();
    }
    notificationOpen = !notificationOpen;
}