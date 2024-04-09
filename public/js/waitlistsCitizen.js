let USER_REPORTED = false;
let USER_BLEEDING = false;
let USER_NUMBNESS = false;
let USER_CONSCIOUS = true;

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



function leaveWaitlist(name) {
  try {
    fetch("/waitlists/citizens/" + localStorage.getItem("username") + "/" + name, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    
  } catch (err) {
    console.log("err", err);
  }
}

function joinWaitlist(name) {
  console.log("joinWaitlist", name);
  try {
    fetch("/waitlists/citizens/" + localStorage.getItem("username") + "/" + name, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    
  } catch (err) {
    console.log("err", err);
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
      console.log("waitlist", waitlist);
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
    console.log(positions);
    generatePostEntries(waitlists);
    if (positions.length > 0) {
      updatePosition(positions);
    }
  } catch (err) {
    console.log("err", err);
  }
};

  

