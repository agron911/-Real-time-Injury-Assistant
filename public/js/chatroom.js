const url = "";
let CHATROOM_USER = "";
let ANNOUNCEMENT = false;
let notificationOpen = false;
let USERS_SEARCH_CONTEXT = "username";
let USERS_SEARCH_STATUS = "";
let MESSAGE_RECEIVER = "";

const getPrivateMessages = async (otherUsername) => {
  const currentUsername = localStorage.getItem("username");
  const data = await fetch(
    url + "/messages/private?username1=" + currentUsername + "&username2=" + otherUsername,
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
  const textInput = document.getElementById("textInput");
  const username = localStorage.getItem("username");
  if (textInput.value) {
    const status = await getStatus(username);
    if (status) setStatusButtonUI(status);
    if (CHATROOM_USER) {
      await sendPrivateMessage(CHATROOM_USER, status, textInput.value);
      showPrivateMessage(CHATROOM_USER);
    } else if (ANNOUNCEMENT){
      // TODO: check for coordinator status
      sendAnnouncementMessage(textInput.value);
    } else {
      sendPublicMessage(status, textInput.value);
    }
    textInput.value = "";
}
};

const sendPrivateMessage = async (receiverUsername, status, message) => {
    await fetch(url + "/messages/private", {
      method: "POST",
      body: JSON.stringify({username: localStorage.getItem("username"),content: message, status: status, receiver: receiverUsername}),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
};


const sendPublicMessage = async (status, message) => {
    await fetch(url + "/messages/public", {
      method: "POST",
      body: JSON.stringify({username: localStorage.getItem("username"), content: message, timestamp: new Date().toString(), status: status, receiver: "all"}),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
};

const sendAnnouncementMessage = async (message) => {
  await fetch(url + "/messages/announcement", {
    method: "POST",
    body: JSON.stringify({username: localStorage.getItem("username"), content: message, timestamp: new Date().toString(), status: "undefined", receiver: "announcement"}),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
};

const showPrivateMessage = async (otherUsername) => {
  setSearchPrivate(otherUsername);
  document.getElementById("elect-form").style.display = "none";
  document.getElementById("wall").style.display = "flex";
  const chatroomTypeTitleElement = document.getElementById("chatroom-title");
  const msgs = await getPrivateMessages(otherUsername);
  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";
  chatroomTypeTitleElement.innerHTML = otherUsername + " Chatroom";
  if (!msgs.empty) {
    for (let msg of msgs) {
      addMessages(msg);
    }
  }
  const messageElement = document.getElementById("messages");
  messageElement.scrollTo(0, messageElement.scrollHeight);
  CHATROOM_USER = otherUsername;
};

const getPublicMessages = async () => {
    const response = await fetch(url + "/messages/public", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    return response;
}

const getAnnouncement = async () => {
  const response = await fetch(url + "/messages/announcement", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { archive } = await response.json();
    console.log(archive);
  return archive;
}

async function getArchive() {
  setSearchPublic();
  document.getElementById("elect-form").style.display = "none";
  document.getElementById("wall").style.display = "flex";
  const response = await getPublicMessages();
  const data = await response.json();
    if (!data.empty) {
      for (let msg of data.archive) {
        let msgCard = createMsgCard(msg);
        messages.appendChild(msgCard);
      }
    };
}

const createIconElement = (username, status) => {
  const iconElement = document.createElement("i");
  iconElement.classList.add("las");
  iconElement.id = "user-status-icon-" + username;
  setIconClass(status, iconElement);
  return iconElement;
};

const createUserBodyHeader = (user) =>{
    let title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = user.username;
    title.style.cursor = "pointer";
    title.addEventListener("click", () => showPrivateMessage(user.username));
  let cardHeader = document.createElement("div");
  cardHeader.className = "card-header";
  const iconElement = createIconElement(user.username , user.status);
  cardHeader.appendChild(title);
  cardHeader.appendChild(iconElement);
  return cardHeader;
}


const  createUserCardBody = (user) => {
  let cardBody = document.createElement("div");
  cardBody.className = "card-body";
  let dot = document.createElement("span");
  dot.className = "dot";
  dot.classList.add(user.online ? "online" : "offline");
  let statusText = document.createTextNode(user.online ? "Online" : "Offline");
  const cardHeader = createUserBodyHeader(user);
  cardBody.appendChild(cardHeader);
  cardBody.appendChild(dot);
  cardBody.appendChild(statusText);
  return cardBody;
}

// Create usercard for 'users' ul
function createUserCard(user) {
  let listItem = document.createElement("li");
  listItem.className = "list-group-item";
  const cardBody = createUserCardBody(user);
  listItem.appendChild(cardBody);
  return listItem;
}

const createTimeStampElement = (timestampDate)=> {
    let timestamp = document.createElement("p");
    timestamp.className = "card-text text-end";
    let time = document.createElement("small");
    time.className = "text-body-secondary";
    time.textContent = timestampDate;
    timestamp.appendChild(time);
    return timestamp;
} 

const createTitleElement = (username)=> {
    let title = document.createElement("h5");
    title.className = "card-title fw-bold";
    if (username == localStorage.getItem("username")) {
        title.textContent = "Me";
    } else {
        title.textContent = username;
    }
    return title;
}

const createMsgCardBody = (msg)=>{
    let cardBody = document.createElement("div");
    cardBody.className = "card-body";
    const iconElement = document.createElement("i");
    iconElement.classList.add("las");
    setIconClass(msg.status, iconElement);
    const titleElement = createTitleElement(msg.username)
    const timestampElement = createTimeStampElement(msg.timestamp);
    let text = document.createElement("p");
    text.className = "card-text";
    text.textContent = msg.content;
    cardBody.appendChild(titleElement);
    cardBody.appendChild(iconElement);
    cardBody.appendChild(text);
    cardBody.appendChild(timestampElement);
    return cardBody;
}

function createMsgCard(msg) {
    let listItem = document.createElement("li");
    listItem.className = "list-group-item";
    const cardBody = createMsgCardBody(msg);
    let card = document.createElement("div");
    card.className = "card mx-3 my-3";
    card.style = "max-width: 36rem;";
    if (msg.username == localStorage.getItem("username")) {
        card.className = "card ms-auto my-3 mx-3";
    }
    card.appendChild(cardBody);
    listItem.appendChild(card);
    return listItem;
}

const setIconClass = (status, iconElement) => {
  const classes = ["la-check-circle", "la-exclamation-circle", "la-plus-square", "check-icon", "danger-icon", "plus-icon"];
  classes.forEach((className)=>{iconElement.classList.remove(className)});
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
  socket.on("connect", async () => {registerSocket(localStorage.getItem("username"), socket.id);});
  socket.on("chat message", (msg) => {addMessages(msg)});
  socket.on("updateUserList", async () => {await fetchInitialUserList();});
  socket.on("status-update", (data) => {updateUserStatusIconEverywhere(data.status, data.username);});
  socket.on("private-message", (data) => {showMessageAlert(data, "primary");});
};

const showMessage = (message)=>{
    const titleElement = document.getElementById("message-modal-title");
    const statusElement = document.getElementById("message-modal-status");
    const iconElement = createIconElement(message.username, message.status);
    const timeStampElement = document.getElementById("message-modal-timestamp");
    const contentElement = document.getElementById("message-modal-content");
    titleElement.innerHTML = `New Message from ${message.username}`;
    while (statusElement.firstChild) {
        statusElement.removeChild(statusElement.firstChild);
    }
    statusElement.appendChild(iconElement);
    timeStampElement.innerHTML = message.timestamp;
    contentElement.innerHTML = message.content;
}

const closeAlert = (message) => {
  const alert = bootstrap.Alert.getOrCreateInstance("#" + message._id);
  alert.close();
  const alertContainer = document.getElementById("liveAlertPlaceholder");
  if (alertContainer.children.length == 0) {
    hideNotificationDot();
    alertContainer.style.display = "none";
  }
};


const createAlertHTMLElement = (message, type)=>{
    const wrapper = document.createElement("div");
    wrapper.id = message._id;
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible alert-fse" role="alert">`,
      `<div>${message.username}: ${message.content}</div>`,
      `<div class ="alert-button-container">`,
      `<button type="button" id="button-${message._id}" aria-label="Close" data-bs-toggle="modal"  data-bs-target="#exampleModal" >`,
      `<i class="las la-eye">`,
      `</i>`,
      `</button>`,
      `</div>`,
      "</div>",
    ].join("");
    return wrapper;  
}

const showMessageAlert = (message, type) => {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
  const alertElement = createAlertHTMLElement(message, type);
  alertPlaceholder.append(alertElement);
  const button = document.getElementById(`button-${message._id}`);
  button.addEventListener("click", () => {
    closeAlert(message);
    showMessage(message);
    CHATROOM_USER = message.username;
  });
  showNotificationDot();
};

const replyToUser = () => {
  showPrivateMessage(CHATROOM_USER);
};

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
  } catch (err) {}
};

const logout = async () => {
  try {
    window.location.replace("/");
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
  } catch (e) {}
};


const announcement = async () => {
  ANNOUNCEMENT = true;
  setSearchAnnouncement();
  document.getElementById("elect-form").style.display = "none";
  document.getElementById("wall").style.display = "flex";
  const chatroomTypeTitleElement = document.getElementById("chatroom-title");
  const msgs = await getAnnouncement();
  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";
  chatroomTypeTitleElement.innerHTML = "Announcement";
  if (!msgs.empty) {
    for (let msg of msgs) {
      addMessages(msg);
    }
  }
  const messageElement = document.getElementById("messages");
  messageElement.scrollTo(0, messageElement.scrollHeight);
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
  const data = await fetch(url + "/messages/private/" + username, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const { archive } = await data.json();

  return archive;
};

const getAlerts = async () => {
  const unreadMessages = await getUnreadMessages();
  console.log("archives", unreadMessages);
  for (const msg of unreadMessages) {
    console.log("msg", msg);
    showMessageAlert(msg, "primary");
  }
};

function showNotificationDot() {
  document.querySelector(".notification-dot").style.display = "block";
}

function hideNotificationDot() {
  document.querySelector(".notification-dot").style.display = "none";
}

function handleAlertClick() {
  const alertContainer = document.getElementById("liveAlertPlaceholder");
  if (!notificationOpen) {
    alertContainer.style.display = "block";
  } else {
    alertContainer.style.display = "none";
  }
  if (alertContainer.children.length == 0) {
    hideNotificationDot();
  }
  notificationOpen = !notificationOpen;
}

function setContextUsername() {
  USERS_SEARCH_CONTEXT = "username";
  USERS_SEARCH_STATUS = "";
  document.getElementById("users-search-input").style.display = "block";
  document.getElementById("users-search-status").style.display = "none";
  document.getElementById("users-search-button").textContent = "Username";
}

function setContextStatus() {
  USERS_SEARCH_CONTEXT = "status";
  document.getElementById("users-search-input").style.display = "none";
  document.getElementById("users-search-status").style.display = "block";
  document.getElementById("users-search-button").textContent = "Status";
}

function setSearchStatusOK() {
  USERS_SEARCH_STATUS = "ok";
  const button = document.getElementById("users-search-status-button");
  button.textContent = "Status - OK";
  button.classList.remove("btn-primary");
  button.classList.remove("btn-warning");
  button.classList.remove("btn-danger");
  button.classList.add("btn-success");
}

function setSearchStatusHelp() {
  USERS_SEARCH_STATUS = "help";
  const button = document.getElementById("users-search-status-button");
  button.textContent = "Status - Help";
  button.classList.remove("btn-primary");
  button.classList.remove("btn-success");
  button.classList.remove("btn-danger");
  button.classList.add("btn-warning");
}

function setSearchStatusEmergency() {
  USERS_SEARCH_STATUS = "emergency";
  const button = document.getElementById("users-search-status-button");
  button.textContent = "Status - Emergency";
  button.classList.remove("btn-primary");
  button.classList.remove("btn-success");
  button.classList.remove("btn-warning");
  button.classList.add("btn-danger");
}

const searchByUsername = async (searchValue) => {
  console.log(`searching by username: ${searchValue}`);
  try {
    const response = await fetch(url + "/users/username/search/" + searchValue, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const data = {users: search_result};
    console.log("search result", data);
    displayUsers(data);
  } catch (e) {
    console.log("Database retrieval error", e);
  }
}

const searchByStatus = async () => {
  console.log(`searching by status: ${USERS_SEARCH_STATUS}`);
  try {
    const response = await fetch(url + "/users/status/search/" + USERS_SEARCH_STATUS, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const data = {users: search_result};
    console.log("search result", data);
    displayUsers(data);
  } catch (e) {
    console.log("Database retrieval error", e);
  }
}

function searchUsers() {
  const searchInput = document.getElementById("users-search-input");
  if (USERS_SEARCH_CONTEXT === "username") {
    if (searchInput.value) {
      searchByUsername(searchInput.value);
    }
  } else {
    searchByStatus();
  }
}

function setSearchPublic() {
  MESSAGE_RECEIVER = "all";
  document.getElementById("messages-search-input").placeholder = "Search Public Messages";
} 

function setSearchAnnouncement() {
  MESSAGE_RECEIVER = "announcement";
  document.getElementById("messages-search-input").placeholder = "Search Announcement Messages";
}

function setSearchPrivate(receiver) {
  MESSAGE_RECEIVER = receiver;
  document.getElementById("messages-search-input").placeholder = "Search Private Messages";
}

const searchPublicMessages = async (searchValue) => {
  console.log(`searching by public message: ${searchValue}`);
  try {
    const response = await fetch(url + "/messages/public/search/" + searchValue, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    for (let msg of search_result) {
      let msgCard = createMsgCard(msg);
      messages.appendChild(msgCard);
    }
  } catch (e) {
    console.log("Database retrieval error", e);
  }
}

const searchAnnouncementMessages = async (searchValue) => {
  console.log(`searching by announcement message: ${searchValue}`);
  try {
    const response = await fetch(url + "/messages/announcement/search/" + searchValue, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    for (let msg of search_result) {
      let msgCard = createMsgCard(msg);
      messages.appendChild(msgCard);
    }
  } catch (e) {
    console.log("Database retrieval error", e);
  }
}

const searchPrivateMessages = async (searchValue) => {
  console.log(`searching by private message: ${searchValue}`);
  try {
    const response = await fetch(url + "/messages/private/search/" + localStorage.getItem("username") + "/" + MESSAGE_RECEIVER + "/" + searchValue, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    for (let msg of search_result) {
      let msgCard = createMsgCard(msg);
      messages.appendChild(msgCard);
    }
  } catch (e) {
    console.log("Database retrieval error", e);
  }
}


function searchMessages() {
  const searchInput = document.getElementById("messages-search-input");
  const searchValue = searchInput.value;
  if (searchInput.value) {
    if (MESSAGE_RECEIVER === "all") {
      searchPublicMessages(searchValue);
    } else if (MESSAGE_RECEIVER === "announcement") {
      searchAnnouncementMessages(searchValue);
    } else {
      searchPrivateMessages(searchValue);
    }
  }
}

window.onload = async () => {
  try {
    const username = localStorage.getItem("username");
    if (username) {
      const toggleButton = document.getElementById("toggle-btn");
      await connectToSocket();
      // toggleButton.addEventListener("click", async (e) => {
      //   e.preventDefault();
      //   await logout();
      //   window.location.replace("/");
      // });
      const status = await getStatus(username);
      if (status) setStatusButtonUI(status);
      await getAlerts();
    }
  } catch (err) {
    console.log("err", err);
  }
};