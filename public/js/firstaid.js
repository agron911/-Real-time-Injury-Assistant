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

window.onload = async () => {
  try {
    const username = localStorage.getItem("username");
    if (username) {
      document.getElementById("welcome").innerHTML = "Welcome, " + username;
    }
    const response = await fetch("/injuries/" + username, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const { injury } = await response.json();
    
    if (injury.reported) {
      USER_REPORTED = true;
      document.getElementById("past_report").innerHTML = "You have a reported " + injury.parts + " injury on " + injury.timestamp + ". <br>Click to update.";
    }
  } catch (err) {
    
  }
};

function report_injury() {
  document.getElementById("main-status").style.display = "none";
  document.getElementById("main-report").style.display = "block";
}

function update_injury(section, status) {
  if (section == "body") {
    document.getElementById("injury-body").innerHTML = status;
  } else if (section == "bleeding") {
    document.getElementById("injury-bleed").innerHTML = status;
    if (status == "Yes") {
      USER_BLEEDING = true;
    } else {
      USER_BLEEDING = false;
    }
  } else if (section == "numbness") {
    document.getElementById("injury-numb").innerHTML = status;
    if (status == "No") {
      USER_NUMBNESS = true;
    } else {
      USER_NUMBNESS = false;
    }
  } else {
    document.getElementById("injury-cons").innerHTML = status;
    if (status == "Yes") {
      USER_CONSCIOUS = false;
    } else {
      USER_CONSCIOUS = true;
    }
  }
}

function submission_prompt() {
  if (USER_REPORTED) {
    document.getElementById("submitModalText").innerHTML = "Do you wish to update your injury as follows? <br> Body Parts: " + document.getElementById("injury-body").innerHTML + "<br>Bleeding: " + document.getElementById("injury-bleed").innerHTML + "<br>Feel the affected area: " + document.getElementById("injury-numb").innerHTML + "<br>Loss of conscious: " + document.getElementById("injury-cons").innerHTML;
  } else {
    document.getElementById("submitModalText").innerHTML = "Do you wish to report your injury as follows? <br> Body Parts: " + document.getElementById("injury-body").innerHTML + "<br>Bleeding: " + document.getElementById("injury-bleed").innerHTML + "<br>Feel the affected area: " + document.getElementById("injury-numb").innerHTML + "<br>Loss of conscious: " + document.getElementById("injury-cons").innerHTML;
  }
}

const ask_gpt = async () => {
  try {
    document.getElementById("main-title").style.display = "none";
    document.getElementById("main-report").style.display = "none";
    document.getElementById("main-gpt-title").style.display = "block";
    document.getElementById("main-gpt-text").style.display = "block";
    const response2 = await fetch("/injuries/instructions/" + localStorage.getItem("username"), {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    document.getElementById("main-gpt-loading").style.display = "none";
    const { message } = await response2.json();
    document.getElementById("gpt-instruction").innerHTML = message.replace(/\n/g, "<br />");
  } catch (err) {
    
  }
}

const save_injury = async () => {
  try {
    const response = await fetch("/injuries/" + localStorage.getItem("username"), {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({timestamp: new Date().toString(), parts: document.getElementById("injury-body").innerHTML, bleeding: USER_BLEEDING, numbness: USER_NUMBNESS, conscious: USER_CONSCIOUS}),
    });
    if (document.getElementById("flexCheckChecked").checked) {
      
      document.getElementById("main-gpt-loading").style.display = "block";
      await ask_gpt();
    } else {
      location.reload();
    }
  } catch(err) {
    
  }
  
}

