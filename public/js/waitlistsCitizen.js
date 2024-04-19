
let url = "";

document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  /**
   * Sticky header on scroll
   */
  const selectHeader = document.querySelector('#header');
  if (selectHeader) {
    document.addEventListener('scroll', () => {
      window.scrollY > 100 ? selectHeader.classList.add('sticked') : selectHeader.classList.remove('sticked');
    });
  }

  /**
   * Mobile nav toggle
   */

  const mobileNavToggleButton = document.querySelector('.mobile-nav-toggle');

  if (mobileNavToggleButton) {
    mobileNavToggleButton.addEventListener('click', function(event) {
      event.preventDefault();
      mobileNavToggle();
    });
  }

  function mobileNavToggle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleButton.classList.toggle('bi-list');
    mobileNavToggleButton.classList.toggle('bi-x');
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navbar a').forEach(navbarlink => {

    if (!navbarlink.hash) return;

    let section = document.querySelector(navbarlink.hash);
    if (!section) return;

    navbarlink.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToggle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  const navDropdowns = document.querySelectorAll('.navbar .dropdown > a');

  navDropdowns.forEach(el => {
    el.addEventListener('click', function(event) {
      if (document.querySelector('.mobile-nav-active')) {
        event.preventDefault();
        this.classList.toggle('active');
        this.nextElementSibling.classList.toggle('dropdown-active');

        let dropDownIndicator = this.querySelector('.dropdown-indicator');
        dropDownIndicator.classList.toggle('bi-chevron-up');
        dropDownIndicator.classList.toggle('bi-chevron-down');
      }
    })
  });

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const togglescrollTop = function() {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
    window.addEventListener('load', togglescrollTop);
    document.addEventListener('scroll', togglescrollTop);
    scrollTop.addEventListener('click', window.scrollTo({
      top: 0,
      behavior: 'smooth'
    }));
  }

  /**
   * Animation on scroll function and init
   */
  function aos_init() {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', () => {
    aos_init();
  });

});

const getNotification = async () => {
  try {
    const response = await fetch(url + "/waitlists/notifications/" + localStorage.getItem("username"), {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { notifications } = await response.json();
    
    if (notifications.length == 0) {
      document.getElementById("bell-count").style.display = "none";
    }
    document.getElementById("bell-count").innerHTML = notifications.length;
    handleNotification(notifications);
  } catch (err) {
    
  }
}

const deleteNotification = async (id) => {
  try {
    const response = await fetch(url + "/waitlists/notifications/" + id, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response.status == 200) {
      document.getElementById("notification-" + id).remove();
    }
  } catch (err) {
    
  }
}

const handleNotification = async (notifications) => {
  const mainSection = document.getElementById('main-notifications');
  if (mainSection) {
    mainSection.innerHTML = "";
    notifications.forEach(notification => {
      
      const postEntry = document.createElement('div');
      postEntry.id = "notification-" + notification._id.toString();
      postEntry.classList.add('post-entry-1','border-bottom');
      postEntry.innerHTML = `Your request for <h3>${notification.medname}</h3> has been fulfilled by <h3>${notification.supplier}</h3> at ${notification.timestamp}`;
      postEntry.innerHTML += `
        <p id="notification-id" style="display: None;">${notification._id.toString()}</p>
        <div class="text-center">
        <button type="button" class="btn btn-primary" style="margin: .5rem" >dismiss</button></div>
      `;
      postEntry.querySelector("button").onclick = () => {
        deleteNotification(notification._id.toString());
      };
      mainSection.appendChild(postEntry);
    });
  }
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
    
  }
};

function updateWaitlist(medname, status) {
  
  if (document.getElementById(medname + "-button").innerHTML == "Join") {
    if (status == "join") {
      document.getElementById(medname + "-count").innerHTML = parseInt(document.getElementById(medname + "-count").innerHTML) + 1;
    } else if (status == "join-stock") {
      if (document.getElementById(medname + "-counttext").innerHTML == "Number in queue") {
        
        return;
      }
      const num = parseInt(document.getElementById(medname + "-count").innerHTML) - 1;
      if (num == 0) {
        document.getElementById(medname + "-counttext").innerHTML = "Number in queue";
      }
      document.getElementById(medname + "-count").innerHTML = num;
    } else {
      document.getElementById(medname + "-count").innerHTML = parseInt(document.getElementById(medname + "-count").innerHTML) - 1;
    }
  }
}

const updateSupplyCount = async (medname, supply) => {
  let curr = document.getElementById(medname + "-count").innerHTML;
  let text = document.getElementById(medname + "-counttext").innerHTML;
  if (text == 'Number in queue') {
    if (supply == curr) {
      document.getElementById(medname + "-count").innerHTML = "0";
    } else if (supply < curr) {
      document.getElementById(medname + "-count").innerHTML = (parseInt(curr) - parseInt(supply)).toString();
    } else {
      document.getElementById(medname + "-counttext").innerHTML = "Medicine available";
      document.getElementById(medname + "-count").innerHTML = (parseInt(supply) - parseInt(curr)).toString();
    }
  } else {
    document.getElementById(medname + "-count").innerHTML = (parseInt(supply) + parseInt(curr)).toString();
  }
}

const handleSupplyNotification = async (data, action) => {
  if (action == "limit") {
    if (data.target != localStorage.getItem("username")) {
      return;
    }
  }
  document.getElementById("bell-count").innerHTML = "!!!";
  document.getElementById("bell-count").style.display = "block";
  await getNotification();
  alert("You have a new notification on your waitlist request!");
}



const connectToSocket = async (positions) => {
  const socket = await io(url);
  socket.on("connect", async () => { registerSocket(localStorage.getItem("username"), socket.id)});
  positions.forEach(item => {
    socket.emit("joinRoom", item.name);
  });
  socket.on("waitlist-join", async (data) => { updateWaitlist(data.medname, "join"); });
  socket.on("waitlist-join-stock", async (data) => { updateWaitlist(data.medname, "join-stock"); });
  socket.on("waitlist-leave", async (data) => { updateWaitlist(data.medname, "leave"); });
  socket.on("waitlist-provider-supply", async (data) => { updateSupplyCount(data.medname, data.num); });
  socket.on("waitlist-supply", async (data) => { handleSupplyNotification(data, "normal"); });
  socket.on("waitlist-limit-supply", async (data) => { handleSupplyNotification(data, "limit"); });
};



function leaveWaitlist(name) {
  try {
    if (confirm("Are you sure you want to leave the waitlist?")) {
      fetch("/waitlists/citizens/" + localStorage.getItem("username") + "/" + name, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      location.reload();
    }
  } catch (err) {
    
  }
}

const createNotification = async (username, supplier, medname, timestamp) => {
  try {
    const response = await fetch("/waitlists/notifications", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({username: username, supplier: supplier, medname: medname, timestamp: timestamp}),
    });
  } catch (err) {
    
  }
}

const joinStockedWaitlist = async (name) => {
  try {
    const response = await fetch("/waitlists/citizens/stock", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({medname: name}),
    });
    const { supplier } = await response.json();
    await createNotification(localStorage.getItem("username"), supplier, name, new Date().toString());
    alert("Your request has been fulfilled by " + supplier + "!");
    await getNotification();
  } catch (err) {
    
  }
}

function joinWaitlist(name) {
  
  try {
    if (document.getElementById(name + "-counttext").innerHTML == "Number in queue") {
      fetch("/waitlists/citizens/", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({username: localStorage.getItem("username"), medname: name, timestamp: new Date().toString()}),
      });
      location.reload();
    } else {
      joinStockedWaitlist(name);
    }
    
    // location.reload();
  } catch (err) {
    
  }
}

function updatePosition(positions) {
  positions.forEach(item => {
    document.getElementById(item.name + "-counttext").innerHTML = "Position in queue";
    document.getElementById(item.name + "-count").innerHTML = item.position + 1;
    document.getElementById(item.name + "-button").classList.remove("btn-primary");
    document.getElementById(item.name + "-button").classList.add("btn-secondary");
    document.getElementById(item.name + "-button").innerHTML = "Leave";
    document.getElementById(item.name + "-button").onclick = () => {
      leaveWaitlist(item.name);
    };
  });
}

function generatePostEntries(waitlists) {
  const mainWaitlistSection = document.getElementById('main-waitlists');
  if (mainWaitlistSection) {
    waitlists.forEach(waitlist => {
      
      const postEntry = document.createElement('div');
      postEntry.classList.add('post-entry-1','border-bottom');
      postEntry.id = "waitlist-" + waitlist.name;
      postEntry.innerHTML = `<h2 class="mb-2" style="display: inline-block">${waitlist.name}</h2>`;
      const count = document.createElement('div');
      count.classList.add("post-meta");
      count.style = "display: inline-block; float: right";
      if (waitlist.count > 0) {
        count.innerHTML = `<span id="${waitlist.name}-counttext" class="date">Medicine available</span> <span class="mx-1">&bullet;</span> <span id="${waitlist.name}-count">${waitlist.count}</span>`;
      } else {
        count.innerHTML = `<span id="${waitlist.name}-counttext" class="date">Number in queue</span> <span class="mx-1">&bullet;</span> <span id="${waitlist.name}-count">${waitlist.citizens.length}</span>`;
      }
      postEntry.appendChild(count);
      postEntry.innerHTML += `
        <p class="mb-4 d-block">${waitlist.description}</p>
        <div class="text-center">
        <button id="${waitlist.name}-button" type="button" class="btn btn-primary" style="margin: .5rem" >Join</button></div>
      `;
      postEntry.querySelector("button").onclick = () => {
        joinWaitlist(waitlist.name);
      };
      mainWaitlistSection.appendChild(postEntry);
    });
  }
}

window.onload = async () => {
  try {
    const response = await fetch("/waitlists/citizens/" + localStorage.getItem("username"), {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { waitlists, positions } = await response.json();
    generatePostEntries(waitlists);
    if (positions.length > 0) {
      updatePosition(positions);
    }
    await connectToSocket(positions);
    await getNotification();
  } catch (err) {
    
  }
};

  

