const loadFacilities = async ()=>{
    const resp = await fetch(
        url + "/facilities",
        {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }
    )
    window.location.href='/facilities'

}

function toggleContainer(containerId) {
    var facilitiesContainer = document.getElementById('facilities-container');
    var informationContainer = document.getElementById('information-container');
    
    if (containerId === 'facilities') {
      facilitiesContainer.style.display = 'block';
      informationContainer.style.display = 'none';
    } else {
      facilitiesContainer.style.display = 'none';
      informationContainer.style.display = 'block';
    }
  }

  function displayFacilityInfo(facilityName, facilityAddress, facilityType) {
    var facilityInfo = document.getElementById('facility-info');
    facilityInfo.innerHTML = `
      <strong>Name:</strong> ${facilityName}<br>
      <strong>Address:</strong> ${facilityAddress}<br>
      <strong>Type:</strong> ${facilityType}
    `;
  }
  
  // Add event listeners to each facility element
  var facilities = document.querySelectorAll('.facility');
  facilities.forEach(function(facility) {
    facility.addEventListener('click', function() {
      var facilityName = this.dataset.name;
      var facilityAddress = this.dataset.address;
      var facilityType = this.dataset.type;
      displayFacilityInfo(facilityName, facilityAddress, facilityType);
      var facilitiesContainer = document.getElementById('facilities-container');
      if (window.innerWidth <= 768) { // Change 768 to the desired breakpoint
        var facilitiesContainer = document.getElementById('facilities-container');
        var informationContainer = document.getElementById('information-container');
        facilitiesContainer.style.display = 'none';
        informationContainer.style.display = 'block';
      }
    });
  });

  window.addEventListener('resize', function() {
    var facilitiesContainer = document.getElementById('facilities-container');
    var informationContainer = document.getElementById('information-container');
    
    // If viewport becomes larger, show facilities container if it was hidden
    if (window.innerWidth > 768 && facilitiesContainer.style.display === 'none') { // Change 768 to the desired breakpoint
      facilitiesContainer.style.display = 'block';
      informationContainer.style.display = 'block';
    }
  });
