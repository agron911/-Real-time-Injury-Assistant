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

// Function to toggle the mobile menu and icons
function openMainMenu() {
    const menu = document.getElementById('mobile-menu');
    const openIcon = document.querySelector('.block.h-6.w-6');
    const closeIcon = document.querySelector('.hidden.h-6.w-6');
  
    // Toggle the display of the mobile menu
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }

    openIcon.classList.toggle('block');
    closeIcon.classList.toggle('hidden');
    openIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('block');
  
    // Toggle the icons
  }
  
function toggleDropdownMenu() {
    var dropdownMenu = document.getElementById('dropDownMenu');

    if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
        dropdownMenu.style.opacity = '0';
        dropdownMenu.style.transform = 'scale(0.95)';
    } else {
        dropdownMenu.style.display = 'block';
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.transform = 'scale(1)';
    }
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
        closeEmergencyRequestModal();
    } else { alert("Empty severity");}
}

const registerAsEsp = async ()=>{
    const result = await fetch('/user/'+localStorage.getItem('username')+"/esp",{
        method: 'PUT',
        body: JSON.stringify({esp: true}),
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

const deregisterAsEsp = async ()=>{
    const result = await fetch('/user/'+localStorage.getItem('username')+"/esp",{
        method: 'PUT',
        body: JSON.stringify({esp: false}),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },        
    })
    if(result.status==200){
        openDeregisterSuccessModal();
        $('#espDeregisterSuccessModal').on('hidden.bs.modal', function (e) {
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
    
}

const toggleRegisterAndDeregisterEspButton = (isEsp)=>{
    if(isESP) {
        document.getElementById('user-menu-item-0').style.display = 'none';
        document.getElementById('user-menu-item-1').style.display = 'block';
    }
    else {
        document.getElementById('user-menu-item-0').style.display = 'block';
        document.getElementById('user-menu-item-1').style.display = 'none';
    }
}

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
    } catch (e) { }
  };

const openEspSuccessModal = ()=>{
    closeRegisterEspModal();
    $('#espRegisterSuccessModal').modal('show');
}

const openInformCitizenModal = ()=>{
    closeInformCitizenModal();
    $('#severityModal').modal('show');
}

const closeInformCitizenModal = ()=>{
    $('#severityModal').modal('hide');
}

const openDeregisterSuccessModal = ()=>{
    closeDeregisterEspModal();
    $('#espDeregisterSuccessModal').modal('show');
}

const closeDeregisterEspModal = ()=>{
    $('#espDeregisterSuccessModal').modal('hide');
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
    const form = document.getElementById("emergencyRequestForm");
    form.elements["severity"].value = "Dog";
    form.elements["content"].value = null;
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

const closeInformModalAndOpenEmergencyServicesModal = () => {
    closeInformCitizenModal();
    openEmergencyRequestModal();
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
            addRequestCard(request, 'ESP');
        });    
    }
}

const getAndDisplayMyRequests = async () => {
    
    const requests = await getRequestsForMe();
    if(requests.length>0) {
        requests.forEach(request => {
            addRequestCard(request, 'MY');
        });    
    }
}

const openRequestWall = ()=>{
    clearAllRequestCards();
    displayRequestContainer();
    getAndDisplayRequestsESP();
    currentWall = "ESP";
}

const openMyRequestWall = ()=>{
    
    clearAllRequestCards();
    displayRequestContainer();
    getAndDisplayMyRequests();
    currentWall = "MY";
}

const getAllowedOptions = (status, type)=>{
    
    if(type == "MY") {
        if(status == "UNRESOLVED") {
            return ['resolve', 'remove'];
        } else if (status == "RESOLVED") {
            return ['reset', 'remove'];
        } else if (status == "ONGOING") {
            return ['resolve', 'reset', 'remove'];    
        }
    } else {
        if(status == "UNRESOLVED") {
            return ['help'];
        }
    }
}

function appendClassAccordingToSeverity(severity){
    if(severity == "Dog"){
        return " border-yellow-200 bg-yellow-50"
    } else if(severity == "Tiger"){
        return " border-red-200 bg-red-50"
    } else if(severity == "Monster"){
        return " border-blue-200 bg-blue-50"
    } else if(severity == "God"){
        return " border-black-200 bg-black-50"
    }
}

function createCardElementForCitizen(request, type) {
    const card = document.createElement('div');
    classes = 'request-card border-2 border-solid rounded-lg shadow-md';
    classes += appendClassAccordingToSeverity(request.severity);    
    card.className = classes;
    const cardBody = document.createElement('div');
    cardBody.className = 'request-card-body p-4 ';

    const allowedOptions = getAllowedOptions(request.status, type);
    if (allowedOptions){
        
        const kebabMenu = createKebabMenu(allowedOptions, request.id);
        cardBody.appendChild(kebabMenu);
    }
    
    const username = document.createElement('h5');
    username.className = 'request-card-title font-bold text-lg mb-2';
    username.textContent = `${request.content}`;

    const status = document.createElement('p');
    status.className = 'request-card-text text-sm mb-1';
    status.textContent = `Status: ${request.status=='ONGOING'?request.assignedTo+' is on the way':request.status}`;

    const severity = document.createElement('p');
    severity.className = 'request-card-text text-sm mb-1';
    severity.textContent = `Severity: ${request.severity}`;

    // const content = document.createElement('p');
    // content.className = 'request-card-text text-sm';
    // content.textContent = `Content: ${request.content}`;

    cardBody.appendChild(username);
    cardBody.appendChild(status);
    cardBody.appendChild(severity);
    // cardBody.appendChild(content);
    card.appendChild(cardBody);

    return card;
}


function createCardElement(request, type) {
    const card = document.createElement('div');
    classes = 'request-card border-2 border-solid rounded-lg shadow-md';
    classes += appendClassAccordingToSeverity(request.severity);    
    card.className = classes;
    
    const cardBody = document.createElement('div');
    cardBody.className = 'request-card-body p-4';

    const allowedOptions = getAllowedOptions(request.status, type);
    if (allowedOptions){
        const kebabMenu = createKebabMenu(allowedOptions, request.id);
        cardBody.appendChild(kebabMenu);
    }
    
    const username = document.createElement('h5');
    username.className = 'request-card-title font-bold text-xl mb-2';
    username.textContent = `${request.username}`;

    const status = document.createElement('p');
    status.className = `request-card-text text-sm mb-1 ${request.status=="UNRESOLVED"?'bg-red-600 text-white w-fit p-2':''}`;
    status.textContent = `Status: ${request.status=='ONGOING'?request.assignedTo+' is on the way':request.status}`;

    const severity = document.createElement('p');
    severity.className = 'request-card-text text-sm mb-1';
    severity.textContent = `Severity: ${request.severity}`;

    const content = document.createElement('p');
    content.className = 'request-card-text text-lg text-gray-800';
    content.textContent = `${request.content}`;

    cardBody.appendChild(username);
    cardBody.appendChild(content);
    cardBody.appendChild(status);
    cardBody.appendChild(severity);
    card.appendChild(cardBody);

    return card;
}


function addRequestCard(request, type) {
    const cardContainer = document.getElementById('request-wall');
    const cardElement = type=="ESP"?createCardElement(request, type):createCardElementForCitizen(request, type);
    cardElement.id = request.id;
    cardContainer.appendChild(cardElement);
}

// Function to highlight the selected menu item
function highlightMenuItem(selectedItem) {
    // Get all menu items
    const menuItems = document.querySelectorAll('#mobile-menu a');
  
    // Remove the active class from all menu items
    menuItems.forEach(item => {
      item.classList.remove('bg-gray-900', 'text-white');
      item.classList.add('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
    });
  
    // Add the active class to the selected menu item
    selectedItem.classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
    selectedItem.classList.add('bg-gray-900', 'text-white');
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
    if(currentWall=="MY"){
        getAndDisplayMyRequests();
    } else if(currentWall=="ESP"){
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
    buttonElement.innerHTML = 'Close';
    buttonElement.addEventListener('click', () => {
        closeNotificationModal();
    });
    openNotificationModal();
}

const appendTitleAndContentToEspNotification = (contentElement, request) => {
    contentElement.innerHTML = "";
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
        
        if(isESP) {
            await registerSocket(localStorage.getItem("username"), socket.id, true); 
            document.getElementById("esp-requests-action-mobile").style.display = "block";
            document.getElementById("esp-requests-action-desktop").style.display = "block";
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
      
    }
};

checkifCititzenIsESP = async ()=>{
    const result = await getUser(localStorage.getItem("username"));
    const user = await result.json();
    
    isESP = user.esp; 
}

const execute = async ()=>{
    localStorage.removeItem("esp");
    
    await checkifCititzenIsESP();
    if(isESP){
        document.getElementById("esp-requests-action-mobile").style.display = "block";
        document.getElementById("esp-requests-action-desktop").style.display = "block";
    } else {
        document.getElementById("esp-requests-action-mobile").style.display = "none";
        document.getElementById("esp-requests-action-desktop").style.display = "none";
    }
    toggleRegisterAndDeregisterEspButton();
    await connectToSocket();
}


window.onload = execute;

