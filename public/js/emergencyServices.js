// REST API calls
let isESP = false;
let SUSPEND_NORMAL_OPERATION = false;   
let currentWall = null;

const getUser = async (username) => {
    const user = await fetch('/user/'+username,{
        method: 'GET',
        headers: {"Content-type": "application/json; charset=UTF-8",},
    });
    return user;
}

const createRequest = async () => {
    const form = document.getElementById("emergencyRequestForm");
    const severity = form.elements["severity"].value;
    if(severity){    
        await fetch("/request", {
            method: "POST",
            body: JSON.stringify({
                username: this.localStorage.getItem('username'),
                content: form.elements["content"].value,
                severity    
            }),
            headers: {"Content-type": "application/json; charset=UTF-8",},
        })
    } else { alert("Empty severity");}
}

const registerAsEsp = async ()=>{
    const result = await fetch('/registerAsEsp',{
        method: 'POST',
        body: JSON.stringify({username: this.localStorage.getItem('username')}),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },        
    })
    if(result.status==200){
        openEspSuccessModal();
        $('#espRegisterSuccessModal').on('hidden.bs.modal', function (e) {
            window.location.reload();
        })
    }
}

const getRequestsForESP = async ()=>{
    const result = await fetch('/request?status=UNRESOLVED&status=ONGOING', {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    const json = await result.json();
    return json;
}

const getRequestsForMe = async ()=>{
    const result = await fetch('/request?username='+localStorage.getItem('username'), {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    const json = await result.json();
    return json;
}

const getRequestById = async (id)=>{
    const result = await fetch('/request/'+id,{
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    const request = await result.json();
    return request;
}

const updateRequestById = async (id, updatedRequest)=>{
    const result = await fetch('/request/'+id,{
        method: "PUT",
        body: JSON.stringify(updatedRequest),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
    const request = await result.json();
    return request;
}

const deleteRequestById = async (id)=>{
    await fetch('/request/'+id, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });
};

const showAlert = (message)=>{
    console.log('alert', message);
}

const openEspSuccessModal = ()=>{
    closeRegisterEspModal();
    $('#espRegisterSuccessModal').modal('show');
}

const hideEspSuccessModal = ()=>{
    $('#espRegisterSuccessModal').modal('hide');
}

const openRegisterEspModal = ()=>{
    $('#registerEspModal').modal('show');
}

const closeRegisterEspModal = ()=>{
    $('#registerEspModal').modal('hide');
}

const openEmergencyRequestModal = ()=>{
    $('#emergencyRequestModal').modal('show');
}

const closeEmergencyRequestModal = ()=>{
    $('#emergencyRequestModal').modal('hide');
}

const openNotificationModal = () => {
    $('#espNotificationModal').modal('show');
}

const closeNotificationModal = () => {
    $('#espNotificationModal').modal('hide');
}

const navigateToChatroom = ()=>{
    location.replace('/chatroom');
}

function clearAllRequestCards() {
    const cardContainer = document.getElementById('request-wall');
    cardContainer.innerHTML = '';
}

const displayRequestContainer = ()=>{
    const requestContainer = document.getElementById('request-container');
    requestContainer.style.display = 'block';
}

const hideRequestContainer = ()=>{
    const requestContainer = document.getElementById('request-container');
    requestContainer.style.display = 'none';
}

const getAndDisplayRequestsESP = async ()=>{
    const requests = await getRequestsForESP();
    if(requests.length>0) {
        requests.forEach(request => {
            addRequestCard({
                username: request.username,
                status: request.status,
                severity: request.severity,
                content: request.content,
                id: request.id,
            }, 'ESP');
        });    
    }
}

const getAndDisplayMyRequests = async (type) => {
    const requests = await getRequestsForMe();
    if(requests.length>0) {
        requests.forEach(request => {
            addRequestCard({
                username: request.username,
                status: request.status,
                severity: request.severity,
                content: request.content,
                id: request.id,
            }, 'my');
        });    
    }
}

const openRequestWall = ()=>{
    clearAllRequestCards();
    displayRequestContainer();
    getAndDisplayRequestsESP();
    currentWall = "esp";
}

const openMyRequestWall = ()=>{
    clearAllRequestCards();
    displayRequestContainer();
    getAndDisplayMyRequests();
    currentWall = "my";
}

const getAllowedOptions = (status, type)=>{
    if(type == "my") {
        if(status == "UNRESOLVED") {
            return ['resolve', 'remove'];
        } else if (status == "RESOLVED") {
            return ['reset', 'remove'];
        } else if (status == "ONGOING") {
            return ['reset', 'remove'];    
        }
    } else {
        if(status == "UNRESOLVED") {
            return ['help'];
        }
    }
}

function createCardElement(request, type) {
    const card = document.createElement('div');
    card.className = 'request-card mb-3';

    const cardBody = document.createElement('div');
    cardBody.className = 'request-card-body';

    const allowedOptions = getAllowedOptions(request.status, type);
    if (allowedOptions){
        const kebabMenu = createKebabMenu(allowedOptions, request.id);
        cardBody.appendChild(kebabMenu);
    }
    
    const username = document.createElement('h5');
    username.className = 'request-card-title';
    username.textContent = `${request.username}`;

    const status = document.createElement('p');
    status.className = 'request-card-text';
    status.textContent = `Status: ${request.status}`;

    const severity = document.createElement('p');
    severity.className = 'request-card-text';   
    severity.textContent = `Severity: ${request.severity}`;

    const content = document.createElement('p');
    content.className = 'request-card-text';
    content.textContent = `Content: ${request.content}`;

    cardBody.appendChild(username);
    cardBody.appendChild(status);
    cardBody.appendChild(severity);
    cardBody.appendChild(content);
    card.appendChild(cardBody);

    return card;
}

function addRequestCard(request, type) {
    const cardContainer = document.getElementById('request-wall');
    const cardElement = createCardElement(request, type);
    cardElement.id = request.id;
    cardContainer.appendChild(cardElement);
}

const resolveRequest = async (requestId)=>{
    updateRequestById = await updateRequestById(requestId, {status: 'RESOLVED'});
    // TODO: function to reload all requests
}

const resetRequest = async (requestId)=>{
    updateRequestById = await updateRequestById(requestId, {status: 'UNRESOLVED'});
    // TODO: function to reload all requests
}

const removeRequest = async (requestId)=>{
    deleteRequestById(requestId);
    // TODO: function to reload all requests
}

const helpRequest = async (requestId)=>{
    const newRequest = {
        status: 'ONGOING',
        assignedTo: localStorage.getItem('username'),
    }
    await updateRequestById(requestId, newRequest);
    closeNotificationModal();
}

function createKebabMenu(allowedOptions, cardId) {
    const menu = document.createElement('div');
    menu.className = 'request-actions-dropdown';

    const menuButton = document.createElement('button');
    menuButton.className = 'btn btn-secondary dropdown-toggle';
    menuButton.setAttribute('type', 'button');
    menuButton.setAttribute('data-bs-toggle', 'dropdown');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '<i class="las la-ellipsis-v"></i>'; // Line Awesome kebab menu icon

    const menuOptions = document.createElement('ul');
    menuOptions.className = 'dropdown-menu';
    console.log("cardid", cardId);
    const optionActions = {
        'resolve': { text: 'Resolve', icon: 'las la-check', action: () => resolveRequest(cardId) },
        'remove': { text: 'Remove', icon: 'las la-trash', action: () => removeRequest(cardId) },
        'reset': { text: 'Reset', icon: 'las la-sync', action: () => resetRequest(cardId) },
        'help': { text: 'Help', icon: 'las la-help', action: () => helpRequest(cardId) },
    };

    allowedOptions.forEach(option => {
        const menuItem = document.createElement('li');
        const menuLink = document.createElement('a');
        menuLink.className = 'dropdown-item';
        menuLink.href = '#';
        menuLink.innerHTML = `<i class="${optionActions[option].icon}"></i> ${optionActions[option].text}`;
        menuLink.onclick = optionActions[option].action; // Add onclick event listener
        menuItem.appendChild(menuLink);
        menuOptions.appendChild(menuItem);
    });

    menu.appendChild(menuButton);
    menu.appendChild(menuOptions);

    return menu;
}

const updateEspRequests = () => {
    clearAllRequestCards();
    if(currentWall=="my"){
        getAndDisplayMyRequests();
    } else if(currentWall=="esp"){
        getAndDisplayRequestsESP();
    }
} 

const notifyCitizen = async (requestId) => {
    const request = await getRequestById(requestId);
    const titleElement = document.getElementById('notification-modal-title');
    const contentElement = document.getElementById('notification-modal-content');
    const buttonElement = document.getElementById('notification-modal-button');
    titleElement.innerHTML = 'Help is on the way!';
    contentElement.innerHTML = request.assignedTo + " is on the way!";
    buttonElement.innerHTML = 'Chat with '+request.assignedTo;
    buttonElement.addEventListener('click', () => {
        console.log("Open chatroom");
    });
    openNotificationModal();
}

const appendTitleAndContentToEspNotification = (contentElement, request) => {
    const severity = document.createElement('p');
    severity.className = 'request-card-text';   
    severity.textContent = `Severity: ${request.severity}`;
    contentElement.appendChild(severity);
    
    const message = document.createElement('p');
    severity.className = 'notification-modal-content';   
    severity.textContent = `Message: ${request.severity}`;
    contentElement.appendChild(message);   
}


const notifyESP = async (requestId) => {
    console.log("Send notification");
    const request = await getRequestById(requestId);
    if(request.username == localStorage.getItem('username')) return;
    const titleElement = document.getElementById('notification-modal-title');
    const contentElement = document.getElementById('notification-modal-content');
    const buttonElement = document.getElementById('notification-modal-button');

    titleElement.innerHTML = request.username + ' needs help!';
    appendTitleAndContentToEspNotification(contentElement, request);
    buttonElement.innerHTML = 'Help ' + request.username;
    buttonElement.addEventListener('click', () => {
        helpRequest(requestId);
    });
    openNotificationModal();
}

const connectToSocket = async () => {
    const socket = await io();
    socket.on("connect", async () => { 
        console.log("isEsp", isESP);
        if(isESP) {
            await registerSocket(localStorage.getItem("username"), socket.id, true); 
            document.getElementById("request-wall-btn").style.display = "block";
        } else {
            await registerSocket(localStorage.getItem("username"), socket.id, false); 
        }
        localStorage.setItem("socketID", socket.id);
        localStorage.setItem("esp", isESP); 
    });
    socket.on("update-request-wall", () => { if (!SUSPEND_NORMAL_OPERATION) updateEspRequests(); });
    socket.on("notify-esp", (requestId) => {notifyESP(requestId)});
    socket.on("notify-citizen", (requestId) => {notifyCitizen(requestId)});
};

const registerSocket = async (username, socketId, esp) => {
    if (SUSPEND_NORMAL_OPERATION) return;
    try {
      await fetch("/sockets/users/" + username, {
        method: "POST",
        body: JSON.stringify({ socketId, esp }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    } catch (e) {
      console.log("socket registration error", e);
    }
};

checkifCititzenIsESP = async ()=>{
    const result = await getUser(localStorage.getItem("username"));
    const user = await result.json();
    console.log('user',user.esp );
    isESP = user.esp; 
}

const execute = async ()=>{
    localStorage.removeItem("esp");
    console.log('Emergency services loaded successfully');
    await checkifCititzenIsESP();
    if(isESP){
        const requestWallBtn = document.getElementById("request-wall-btn");
        requestWallBtn.style.display = "inline";
    } else {
        document.getElementById("register-esp-btn").style.display = "inline";
    }
    await connectToSocket();
}
window.onload = execute;

