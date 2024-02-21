const url = "http://localhost:3000"

function electPost() {
    document.getElementById("elect-form").style.display = "none";
    document.getElementById("public-wall").style.display = "block";
}
// Create usercard for 'users' ul
function createUserCard (user) {
    var listItem = document.createElement("li");
    listItem.className = "list-group-item";


    var cardBody = document.createElement("div");
    cardBody.className = "card-body";

    var title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = user.username;

    var dot = document.createElement("span");
    dot.className = "dot";
    dot.classList.add(user.online ? "online" : "offline");

    var statusText = document.createTextNode(user.online ? "Online" : "Offline");

    cardBody.appendChild(title);
    cardBody.appendChild(dot);
    cardBody.appendChild(statusText);

    listItem.appendChild(cardBody);
    return listItem;
}

function createMsgCard (msg) {
    var listItem = document.createElement("li");
    listItem.className = "list-group-item";

    var card = document.createElement("div");
    card.className = "card mx-3 my-3";
    card.style = "max-width: 36rem;";

    var cardBody = document.createElement("div");
    cardBody.className = "card-body";

    var title = document.createElement("h5");
    title.className = "card-title fw-bold";

    if (msg.username == localStorage.getItem("username")) {
        card.className = "card ms-auto my-3 mx-3";
        title.textContent = "Me";
    } else {
        title.textContent = msg.username;
    }

    var text = document.createElement("p");
    text.className = "card-text";
    text.textContent = msg.content;

    var timestamp = document.createElement("p");
    timestamp.className = "card-text text-end";
    var time = document.createElement("small");
    time.className = "text-body-secondary";
    time.textContent = msg.timestamp;
    timestamp.appendChild(time);

    cardBody.appendChild(title);
    cardBody.appendChild(text);
    cardBody.appendChild(timestamp);
    card.appendChild(cardBody);
    listItem.appendChild(card);
    return listItem;
}

const registerSocket = async (username, socketId) => {
    try {
        await fetch(url + "/socket/users/" + username, {
            method: "POST",
            body: JSON.stringify({ socketId }),
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
    socket.on("connect", async () => {
        console.log("connection established", socket.id);
        await registerSocket(localStorage.getItem('username'), socket.id);
    })
    socket.on("initMessages", (data) => {
        initMessages(data);
    });
    socket.on("chat message", (msg) => {
        addMessages(msg);
    });
    socket.on('updateUserList', (data) => {
        console.log("users123", data);

        updateUserList(data)
    });

}

const updateUserList = (data) => {
    const usersListElement = document.getElementById("users");
    usersListElement.innerHTML = "";

    data.forEach(user => {
        var userCard = createUserCard(user);
        usersListElement.appendChild(userCard);
    });
}

const logout = async () => {
    try {
        await fetch(url + "/auth/users", {
            method: "PATCH",
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

const fetchInitialUserList = async () => {
    const response = await fetch(url + "/users");
    const users = await response.json();
    displayUsers(users);
};

const displayUsers = (users) => {
    const usersListElement = document.getElementById("users");
    usersListElement.innerHTML = "";
    console.log("users", users);

    users.users.forEach(user => {
        var userCard = createUserCard(user);
        usersListElement.appendChild(userCard);
    });
};

window.onload = async () => {
    try {
        const username = localStorage.getItem('username');
        if (username) {
            const messages = document.getElementById("messages");
            const messageForm = document.getElementById("messageForm");
            const textInput = document.getElementById("textInput");
            const toggleButton = document.getElementById("toggle-btn");
            
            // Load past messages
            const initMessages = (data) => {
                if (!data.empty) {
                    for (var msg of data.archive) {
                        var msgCard = createMsgCard(msg);
                        messages.appendChild(msgCard);

                    }
                }
            }

            // When user submit a new message
            messageForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (textInput.value) {
                    const inputbuf = textInput.value;
                    textInput.value = "";
                    await fetch("http://localhost:3000/message", {
                        method: "POST",
                        body: JSON.stringify({
                            username: username,
                            content: inputbuf,
                            timestamp: (new Date()).toString(),
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                    });
                }
            });
            const addMessage = (msg) => {
                var msgCard = createMsgCard(msg);
                messages.appendChild(msgCard);
                window.scrollTo(0, document.body.scrollHeight);
            }
            await connectToSocket(initMessages, addMessage);

            toggleButton.addEventListener("click", async (e) => {
                e.preventDefault();
                await logout();
                window.location.replace('/');
            });

            fetchInitialUserList();

        }
    } catch (err) {
        console.log("err", err);
        // alert(
        //   `Failed to load chatroom for user ${err?.message || "Unknown error."}`
        // );
        // window.location.href = "/";
    }
};
