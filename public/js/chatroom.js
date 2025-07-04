const url = "";
let CHATROOM_USER = "";
let ANNOUNCEMENT = false;
let notificationOpen = false;
let SUSPEND_NORMAL_OPERATION = false;
let USERS_SEARCH_CONTEXT = "username";
let USERS_SEARCH_STATUS = "";
let MESSAGE_RECEIVER = "";
let PUBLIC_SEARCH_COUNTER = 1;
let ANNOUNCEMENT_SEARCH_COUNTER = 1
let PRIVATE_SEARCH_COUNTER = 1;
let GROUPCHAT = false;
let PRIVATE_CHAT_OPEN = false;
let IS_SPECIALIST = false;
let Anxiety_rule = "You're not alone in your feelings of anxiety; here, you'll find a compassionate space to explore your experiences, learn coping strategies, and connect with others who truly understand."
let Depression_rule = "Welcome to a place of understanding and support, where we can share our struggles with depression without judgment, and together, find moments of light and hope."
let Stress_rule = "Join us in discovering effective ways to manage stress, where we share tools, experiences, and support to help each other navigate life's pressures more calmly and confidently"
let Grief_rule = "In this group, you'll find a comforting community ready to hold space for your grief, share in your memories, and support you through your journey of healing and remembrance"


const getPrivateMessages = async (otherUsername) => {
  if (SUSPEND_NORMAL_OPERATION) return [];
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

  return archive;
};


const sendMessage = async () => {
  const textInput = document.getElementById("textInput");
  const username = localStorage.getItem("username");
  const userid = localStorage.getItem("userid");
  if (textInput.value) {
    const status = await getStatus(userid);
    if (status) setStatusButtonUI(status);
    if (CHATROOM_USER) {
      await sendPrivateMessage(userid, CHATROOM_USER, status, textInput.value);
      showPrivateMessage(CHATROOM_USER);
    } else if (ANNOUNCEMENT) {
      // TODO: check for coordinator status
      const privilege = await checkPrivilege(userid);
      if (privilege === "Coordinator" || privilege === "Administrator") {
        sendAnnouncementMessage(textInput.value);
      } else {
        alert("You do not have the privilege to send an announcement");
      }
    } else if (GROUPCHAT) {
      sendGroupMessage(MESSAGE_RECEIVER, textInput.value);
    } else {
      // 
      sendPublicMessage(userid, status, textInput.value);
    }
    textInput.value = "";
  }
  return;
};

const sendPrivateMessage = async (userid, receiverUsername, status, message) => {
  if (SUSPEND_NORMAL_OPERATION) return [];
  console.log("receiver: " + receiverUsername);
  await fetch(url + "/messages/private", {
    method: "POST",
    body: JSON.stringify({ userid: userid, username: localStorage.getItem("username"), content: message, status: status, receiver: receiverUsername }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
};


const sendPublicMessage = async (userid, status, message) => {
  if (SUSPEND_NORMAL_OPERATION) return;
  await fetch(url + "/messages/public", {
    method: "POST",
    body: JSON.stringify({ userid: userid, username: localStorage.getItem("username"), content: message, timestamp: new Date().toString(), status: status, receiver: "all" }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
};

const sendAnnouncementMessage = async (message) => {
  if (SUSPEND_NORMAL_OPERATION) return
  await fetch(url + "/messages/announcement", {
    method: "POST",
    body: JSON.stringify({ username: localStorage.getItem("username"), userid: localStorage.getItem("userid"), content: message, timestamp: new Date().toString(), status: "undefined", receiver: "announcement" }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
};



const showPrivateMessage = async (otherUsername) => {
  ANNOUNCEMENT = false;
  GROUPCHAT = false;
  // let resp = await fetch(url + "/users/profile/" + otherUsername, {
  //   method: "GET",
  //   headers: {
  //     "Content-type": "application/json; charset=UTF-8",
  //   },
  // })

  PRIVATE_CHAT_OPEN = true;
  setSearchPrivate(otherUsername);
  document.getElementById("elect-form").style.display = "none";
  document.getElementById("wall").style.display = "flex";
  const chatroomTypeTitleElement = document.getElementById("chatroom-title");
  const msgs = await getPrivateMessages(otherUsername);
  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";
  chatroomTypeTitleElement.innerHTML = otherUsername + " Chatroom";
  if (msgs && msgs.length > 0) {
    for (let msg of msgs) {
      addMessages(msg);
    }
  }
  window.scrollTo(0, document.body.scrollHeight);
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
  CHATROOM_USER = otherUsername;

};

const getPublicMessages = async () => {
  if (SUSPEND_NORMAL_OPERATION) return [];
  const response = await fetch(url + "/messages/public", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  return response;
}

const getAnnouncement = async () => {
  if (SUSPEND_NORMAL_OPERATION) return;
  const response = await fetch(url + "/messages/announcement", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const { archive } = await response.json();

  return archive;
}



async function getArchive() {
  ANNOUNCEMENT = false;
  GROUPCHAT = false;
  PRIVATE_CHAT_OPEN = false;
  CHATROOM_USER = "";
  setSearchPublic();
  document.getElementById("elect-form").style.display = "none";
  document.getElementById("wall").style.display = "flex";
  const chatroomTypeTitleElement = document.getElementById("chatroom-title");
  chatroomTypeTitleElement.innerHTML = "Public Chatroom";
  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";
  const response = await getPublicMessages();
  const data = await response.json();
  if (!data.empty) {
    for (let msg of data.archive) {
      let msgCard = createMsgCard(msg);
      messages.appendChild(msgCard);
    }
  };
  messages.scrollTo(0, messages.scrollHeight);
  window.scrollTo(0, document.body.scrollHeight);

}


const createLoadMoreButton = () => {
  const messagesList = document.getElementById("messages");
  const loadMoreButton = document.createElement("div");
  loadMoreButton.id = "load-more";
  loadMoreButton.className = "text-center";

  const button = document.createElement("button");
  button.className = "btn btn-primary";
  button.textContent = "Load More";
  button.onclick = searchMessages;

  loadMoreButton.appendChild(button);
  messagesList.appendChild(loadMoreButton);
}

const createIconElement = (username, status) => {
  const iconElement = document.createElement("i");
  iconElement.classList.add("las");
  iconElement.id = "user-status-icon-" + username;
  setIconClass(status, iconElement);
  return iconElement;
};

const getAdministratorsFromLocalStorage = () => {
  const administratorsJSON = localStorage.getItem('administrators');
  if (administratorsJSON) {
    return JSON.parse(administratorsJSON).map(admin => admin.username);
  }
  return [];
};

hideUserAndShowChatroomUIIfOnMobile = () => {
  if (window.innerWidth <= 640) {
    hideUsersUI();
    showChatroomUI();
  }
}

const createUserBodyHeader = (user) => {
  let title = document.createElement("h5");
  title.className = "card-title dropdown-toggle";
  title.textContent = user.username;
  title.setAttribute("data-bs-toggle", "dropdown");
  title.style.cursor = "pointer";
  // add show profile on click
  let dropdown = document.createElement("div");
  dropdown.className = "dropdown-menu";
  title.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdown.classList.toggle("show");
  });
  let dropdownMenu = document.createElement("div");
  dropdownMenu.className = "dropdown-menu";

  let chatOption = document.createElement("a");
  chatOption.className = "dropdown-item";
  chatOption.textContent = "Open Chat";
  chatOption.addEventListener("click", () => { hideUserAndShowChatroomUIIfOnMobile(); showPrivateMessage(user.username) });

  let administrators = getAdministratorsFromLocalStorage();

  const currentUsername = localStorage.getItem("username");
  if (administrators.includes(currentUsername.toLowerCase()) || user.username === currentUsername) {
    let editOption = document.createElement("a");
    editOption.className = "dropdown-item";
    editOption.textContent = "Edit Profile";
    editOption.addEventListener("click", () => editUserProfile(user._id));
    dropdownMenu.appendChild(editOption);
  }


  dropdownMenu.appendChild(chatOption);
  // title.addEventListener("click", () => showPrivateMessage(user.username));
  let cardHeader = document.createElement("div");
  cardHeader.className = "card-header";
  const iconElement = createIconElement(user.username, user.status);
  cardHeader.appendChild(title);
  cardHeader.appendChild(iconElement);
  cardHeader.appendChild(dropdownMenu);
  return cardHeader;
}


const createUserCardBody = (user) => {
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

const createTimeStampElement = (timestampDate) => {
  let timestamp = document.createElement("p");
  timestamp.className = "card-text text-end";
  let time = document.createElement("small");
  time.className = "text-body-secondary";
  time.textContent = timestampDate;
  timestamp.appendChild(time);
  return timestamp;
}

const createTitleElement = (username) => {
  let title = document.createElement("h5");
  title.className = "card-title fw-bold";
  if (username == localStorage.getItem("username")) {
    title.textContent = "Me";
  } else if (IS_SPECIALIST) {
    title.textContent = "Specialist : " + username;
  } else {
    title.textContent = username;
  }
  return title;
}



const createMsgCardBody = (msg) => {
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
  if (msg.username == localStorage.getItem("username") && GROUPCHAT) {
    createEditableMessage(cardBody, msg);
  };
  cardBody.appendChild(iconElement);
  cardBody.appendChild(text);
  cardBody.appendChild(timestampElement);
  return cardBody;
}

function createMsgCard(msg) {
  let listItem = document.createElement("li");
  listItem.className = "list-group-item";
  listItem.setAttribute("data-message-id", msg._id);
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
  classes.forEach((className) => { iconElement.classList.remove(className) });
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
  if (SUSPEND_NORMAL_OPERATION) return;
  try {
    await fetch(url + "/sockets/users/" + username, {
      method: "POST",
      body: JSON.stringify({ socketId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  } catch (e) {

  }
};

const connectToSocket = async () => {
  const socket = await io(url);
  socket.on("connect", async () => { registerSocket(localStorage.getItem("username"), socket.id); localStorage.setItem("socketID", socket.id); });
  socket.on("chat message", (msg) => { if (!SUSPEND_NORMAL_OPERATION) addMessages(msg) });
  socket.on("updateUserList", async () => { await fetchInitialUserList(); });
  socket.on("status-update", (data) => { updateUserStatusIconEverywhere(data.status, data.username); });
  socket.on("private-message", (data) => {
    showMessageAlert(data, "primary");
    if (PRIVATE_CHAT_OPEN) {
      addMessages(data);
    }
  });
  socket.on("suspendNormalOps", (socketID) => { if (socketID != localStorage.getItem('socketID')) logout(); });
  socket.on("enableNormalOperation", (data) => { SUSPEND_NORMAL_OPERATION = false; });
  socket.on("group-message", async (data) => {
    if (!SUSPEND_NORMAL_OPERATION) {

      IS_SPECIALIST = true;

      addMessages(data.msg);

      if (data.specialist_online && data.msg.username != localStorage.getItem("username")) {
        showMessageAlert(data.msg, "primary");
      } else if (!data.specialist_online) {
        // showMessageAlert(data.msg, "secondary");
        showMessageAlert(data.msg, "info");
      }
    }
  });
  socket.on("edit-group-message", (msg) => { editMessages(msg) });
  socket.on("delete-group-message", (msgId) => { deleteMessages(msgId); });
  socket.on("inactive-logout", (data) => {
    $('#logoutModal').find('.modal-body').text(data.message);
    $('#logoutModal').modal('show');

  });

};

$('#logoutConfirm').click(function () {
  sessionStorage.clear();
  logout();
});

const showMessage = (message) => {
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


const createAlertHTMLElement = (message, type) => {
  const wrapper = document.createElement("div");
  wrapper.id = message._id;

  if (type === "primary") {
    alert_msg = `<div>${message.username}: ${message.content}</div>`
    if (message.receiver == "Anxiety" || message.receiver == "Depression" || message.receiver == "Stress" || message.receiver == "Grief") {
      button = `<button type="button" id="button-${message._id}" onclick = ConfirmGroupChat('${message.receiver}')> <i class="las la-eye"></i>`
    } else {
      button = `<button type="button" id="button-${message._id}" aria-label="Close" data-bs-toggle="modal"  data-bs-target="#exampleModal" ><i class="las la-eye"></i>`
    }
  } else if (type === "info") {
    button = `<button type="button" id="button-${message._id}" aria-label="Close"> <i class="las la-check"></i>`

    alert_msg = `<div>There's no specialist online yet, please be patience.</div>`
  }

  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible alert-fse" role="alert">`,
    alert_msg,
    `<div class ="alert-button-container">`,
    button,
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
  if (GROUPCHAT) {
    GroupChat(MESSAGE_RECEIVER);
  } else {
    showPrivateMessage(CHATROOM_USER);
  }
};

const navigateToEmergencyServices = () => {
  window.location.replace('/emergencyServices');
}

const getStatus = async (userid) => {
  if (SUSPEND_NORMAL_OPERATION) return;
  try {
    const res = await fetch(url + "/user/status/" + userid, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { status } = await res.json();
    return status;
  } catch (e) {

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
  if (SUSPEND_NORMAL_OPERATION) return;
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
  if (SUSPEND_NORMAL_OPERATION) return;
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
    localStorage.clear()
  } catch (e) { }
};


const announcement = async () => {

  ANNOUNCEMENT = true;
  CHATROOM_USER = "";
  GROUPCHAT = false;
  PRIVATE_CHAT_OPEN = false;
  setSearchAnnouncement();
  document.getElementById("elect-form").style.display = "none";
  document.getElementById("wall").style.display = "flex";
  const chatroomTypeTitleElement = document.getElementById("chatroom-title");
  const msgs = await getAnnouncement();
  const messageContainer = document.getElementById("messages");
  messageContainer.innerHTML = "";
  chatroomTypeTitleElement.innerHTML = "Announcement";
  if (msgs.length > 0) {
    for (let msg of msgs) {
      addMessages(msg);
    }
  }
  window.scrollTo(0, document.body.scrollHeight);
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
};

const getSpecialists = async (group) => {
  if (SUSPEND_NORMAL_OPERATION) return;
  const response = await fetch(url + "/specialists/" + group);
  const { specialists } = await response.json();
  return specialists;
};

const fetchInitialUserList = async () => {
  if (SUSPEND_NORMAL_OPERATION) return;
  const response = await fetch(url + "/users");
  let users = await response.json();
  let administrators = users.users.filter(user => user.usertype === 'Administrator');
  localStorage.setItem("administrators", JSON.stringify(administrators));
  if (administrators) {
    console.log("Administrators", users);
    administrators = administrators.map((administrator) => administrator.username);
    if (!administrators.includes(localStorage.getItem("username"))) {
      console.log("here", administrators);
      users.users = users.users.filter(user => user.useraccountstatus == "Active");
    }
  }
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
  messages.scrollTo(0, messages.scrollHeight);
};

const getUnreadMessages = async () => {
  if (SUSPEND_NORMAL_OPERATION) return [];
  const username = localStorage.getItem("username");
  const data = await fetch(url + "/messages/private/unread?username=" + username, {
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

  for (const msg of unreadMessages) {

    showMessageAlert(msg, "primary");
  }
};

const checkIfTestOngoing = async () => {
  const response = await fetch(url + "/speedTest", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const responseData = await response.json();

  if (responseData) {
    SUSPEND_NORMAL_OPERATION = true;
  }
}

const hideChatroomUI = () => {
  document.getElementById("chatroom-container").style.display = "none";
}

const hideUsersUI = () => {
  document.getElementById("user-container").style.display = "none";
}

const showUsersUI = () => {
  document.getElementById("user-container").style.display = "block";
}

const showChatroomUI = () => {
  document.getElementById("chatroom-container").style.display = "block";
}

const getUserProfile = async () => {
  const response = await fetch(url + "/users/profile/" + localStorage.getItem('userid'), {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  return await response.json();
}

window.onload = async () => {
  try {
    if (window.innerWidth <= 640) {
      hideChatroomUI();
      showUsersUI();
    }
    await checkIfTestOngoing();
    const userid = localStorage.getItem("userid");
    const username = (await getUserProfile()).username;
    localStorage.setItem("username", username);
    if (username) {
      await connectToSocket();
      const status = await getStatus(userid);
      if (status) setStatusButtonUI(status);
      await getAlerts();
    }
  } catch (err) {

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

  try {
    const response = await fetch(url + "/users/username/search?user=" + searchValue, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const data = { users: search_result };

    displayUsers(data);
  } catch (e) {

  }
}

const searchByStatus = async () => {

  try {
    const response = await fetch(url + "/users/status/search?status=" + USERS_SEARCH_STATUS, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    const data = { users: search_result };

    displayUsers(data);
  } catch (e) {

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
const setSearchGroup = (group) => {
  SEARCH_COUNTER = 1;
  // document.getElementById("messages-search-input").style.display = "none";
  // document.getElementById("message-button").style.display = "none";
}

function setSearchPublic() {
  PUBLIC_SEARCH_COUNTER = 1;
  MESSAGE_RECEIVER = "all";
  document.getElementById("messages-search-input").placeholder = "Search Public Messages";
}

function setSearchAnnouncement() {
  ANNOUNCEMENT_SEARCH_COUNTER = 1;
  MESSAGE_RECEIVER = "announcement";
  document.getElementById("messages-search-input").placeholder = "Search Announcement Messages";
}

function setSearchPrivate(receiver) {
  PRIVATE_SEARCH_COUNTER = 1;
  MESSAGE_RECEIVER = receiver;
  document.getElementById("messages-search-input").placeholder = "Search Private Messages";
}


function createMessageElement(search_result) {
  const messages = document.getElementById("messages");
  messages.innerHTML = "";
  if (!search_result.empty) {
    createLoadMoreButton();
    for (let msg of search_result) {
      let msgCard = createMsgCard(msg);
      messages.appendChild(msgCard);
    }
  }
}

const searchPublicMessages = async (searchValue) => {
  try {
    const response = await fetch(url + "/messages/public/search?content=" + searchValue + "&limit=" + (PUBLIC_SEARCH_COUNTER * 10).toString(), {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    createMessageElement(search_result);
  } catch (e) {

  }
  PUBLIC_SEARCH_COUNTER += 1;
}


const searchAnnouncementMessages = async (searchValue) => {

  try {
    const response = await fetch(url + "/messages/announcement/search?content=" + searchValue + "&limit=" + (ANNOUNCEMENT_SEARCH_COUNTER * 10).toString(), {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    createMessageElement(search_result);

  } catch (e) {

  }
  ANNOUNCEMENT_SEARCH_COUNTER += 1;
}


const searchPrivateMessages = async (searchValue) => {

  try {
    const response = await fetch(url + "/messages/private/search?receiver=" + localStorage.getItem("username") + "&sender=" + MESSAGE_RECEIVER + "&content=" + searchValue + "&limit=" + (PRIVATE_SEARCH_COUNTER * 10).toString(), {

      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { search_result } = await response.json();
    createMessageElement(search_result);

  } catch (e) {

  }
  if (searchValue == "status") {
    PRIVATE_SEARCH_COUNTER = 0;
  }
  else {
    PRIVATE_SEARCH_COUNTER += 1;
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




function closeNavbar() {
  const navbarCollapse = document.getElementById('navbarSupportedActions');
  const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
    toggle: false
  });
  bsCollapse.hide();
}

const loadFacilities = async () => {
  window.location.href = '/facilities'

}
