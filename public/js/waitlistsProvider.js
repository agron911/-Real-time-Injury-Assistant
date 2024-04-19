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

const createNewWaitlist = async () => {
  try {
    if (confirm("Are you sure you want to create a new waitlist?")) {
      const mednameInput = document.getElementById("medNameInput");
      const descriptionInput = document.getElementById("descriptionInput");
      if (mednameInput.value && descriptionInput.value) {
        
        const response = await fetch("/waitlists/providers", {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({ description: descriptionInput.value, medname: mednameInput.value }),
        });
        if (response.status == 200) location.reload();
      } else {
        alert("Input elements not found");
      }
    }
  } catch (err) {
    
  }
}

function updateWaitlist(medname, action) {
  if (action == "join") {
    document.getElementById(medname + "-count").innerHTML = parseInt(document.getElementById(medname + "-count").innerHTML) + 1;
  } else if (action == "join-stock") {
    const num = parseInt(document.getElementById(medname + "-count").innerHTML) - 1;
      if (num == 0) {
        document.getElementById(medname + "-counttext").innerHTML = "Number in queue";
      }
      document.getElementById(medname + "-count").innerHTML = num;
  } else {
    document.getElementById(medname + "-count").innerHTML = parseInt(document.getElementById(medname + "-count").innerHTML) - 1;
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

const manageSupply = async (medname) => {
  
  const radios = document.getElementsByName("inlineRadioOptions");
  let num = "0";
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      num = radios[i].nextElementSibling.innerHTML;
      if (num == "All in queue") {
        if (document.getElementById(medname + "-counttext").innerHTML == "Number in queue") {
          num = document.getElementById(medname + "-count").innerHTML;
        } else {
          num = "0";
        }
      }
      break;
    }
  }
  if (num != "0") {
    // updateSupplyCount(medname, num);
    const response = await fetch("/waitlists/providers/supplies", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ medname: medname, num: parseInt(num), supplier: localStorage.getItem("username") }),
    });
  }
}

function createRadioButtons(frame, medname) {
  let nums = ["5", "10", "20", "All in queue"];
  nums.forEach((num, index) => {
    const radio = document.createElement('div');
    radio.classList.add('form-check', 'form-check-inline');
    radio.innerHTML = `<input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio${index}${medname}">`;
    radio.innerHTML += `<label class="form-check-label" for="inlineRadio${index}${medname}">${num}</label>`;
    frame.appendChild(radio);
  })
  frame.innerHTML += `<button type="button" class="btn btn-primary" style="float: right" >Supply</button>`;
}

function setButton(waitlistName, action) {
  const button = document.getElementById(waitlistName + "-button");
  if (action == "collapse") {
    button.innerHTML = "Collapse";
    button.onclick = () => {
      removeWaitlistDetails(waitlistName);
    }
  } else {
    button.innerHTML = "View Citizens";
    button.onclick = () => {
      viewWaitlistMember(waitlistName);
    }
  }
}

function addWaitlistDetails(waitlistName, info) {
  const waitlist = document.getElementById("waitlist-" + waitlistName);
  if (waitlist) {
    const details = document.createElement('div');
    details.classList.add('post-entry-1');
    details.innerHTML = `<h2 class="mb-2">Member Citizens</h2>`;
    info.forEach(member => {
      const memberEntry = document.createElement('div');
      memberEntry.classList.add('border-bottom');
      memberEntry.innerHTML += `<p>Citizen username: ${member.username}</p>`;
      memberEntry.innerHTML += `<p>Joined time: ${member.time}</p>`;
      const injury = member.injury
        if (injury.reported) {
          memberEntry.innerHTML += `<p>Injured parts: ${injury.parts}</p>`;
          memberEntry.innerHTML += `<p>Injury reported time: ${injury.timestamp}</p>`;
          if (injury.bleeding) memberEntry.innerHTML += `<p>Citizen is bleeding</p>`;
          if (!injury.conscious) memberEntry.innerHTML += `<p>Citizen is unconscious</p>`;
          if (injury.numbness) memberEntry.innerHTML += `<p>Citizen unable to feel injured parts</p>`;
        }
      details.appendChild(memberEntry);
    });
    waitlist.appendChild(details);
    setButton(waitlistName, "collapse");
  }
}

function removeWaitlistDetails(waitlistName) {
  const waitlist = document.getElementById("waitlist-" + waitlistName);
  if (waitlist) {
    const details = waitlist.querySelector(".post-entry-1");
    if (details) {
      waitlist.removeChild(details);
    }
    setButton(waitlistName, "show");
  }
}

const viewWaitlistMember = async (waitlistName) => {
  const response = await fetch("/waitlists/providers/details/" + waitlistName, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  const { member } = await response.json();
  addWaitlistDetails(waitlistName, member);
}


function generatePostEntries(waitlists) {
  const mainWaitlistSection = document.getElementById('main-waitlists');
  if (mainWaitlistSection) {
    waitlists.forEach(waitlist => {
      const postFrame = document.createElement('div');
      postFrame.classList.add('border-bottom');
      const postEntry = document.createElement('div');
      postEntry.classList.add('post-entry-1');
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
      postEntry.innerHTML += `<p class="mb-4 d-block">${waitlist.description}</p>`;
      postFrame.appendChild(postEntry);
      createRadioButtons(postFrame, waitlist.name);
      postFrame.innerHTML += `
        <div class="text-center" style="margin-top: 1rem">
        <button id="${waitlist.name}-button" type="button" class="btn btn-secondary link-underline" style="margin: .5rem" >View Citizens</button></div>
      `;
      postFrame.querySelector("button").onclick = () => {
        manageSupply(waitlist.name);
      }
      const button = postFrame.querySelector("#" + waitlist.name + "-button");
      if (button) {
        button.onclick = () => {
          viewWaitlistMember(waitlist.name);
        };
      }
      
      mainWaitlistSection.appendChild(postFrame);
    });
  }
}

const connectToSocket = async () => {
  const socket = await io(url);
  socket.on("connect", async () => { registerSocket(localStorage.getItem("username"), socket.id)});
  socket.on("waitlist-join", async (data) => { updateWaitlist(data.medname, "join"); });
  socket.on("waitlist-join-stock", async (data) => { updateWaitlist(data.medname, "join-stock")});
  socket.on("waitlist-leave", async (data) => { updateWaitlist(data.medname, "leave"); });
  socket.on("waitlist-provider-supply", async (data) => { updateSupplyCount(data.medname, data.num); });
};

window.onload = async () => {
  try {
    await connectToSocket();
    const response = await fetch("/waitlists/citizens/" + localStorage.getItem("username"), {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { waitlists, positions } = await response.json();
    generatePostEntries(waitlists);
  } catch (err) {
    
  }
};
