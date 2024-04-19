
url = ""

function displayfacilities(){
    document.getElementById("facilities-list").innerHTML=''
    hideContainers('facilities-container');
    toggleContainer("facilities");
    fetch('/facilities/directory',{
        method:'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
    }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(facilities => {
            
            const facilitiesContainer = document.getElementById('facilities-list');
            facilities.forEach(facility => {
                const facilityDiv = document.createElement('div');
                facilityDiv.classList.add('facility');
                const nameElement = document.createElement('h2');
                nameElement.textContent = facility.name.replace(/-/g, ' ');
                const typeElement = document.createElement('p');
                typeElement.textContent = `Type: ${facility.type}`;
                facilityDiv.appendChild(nameElement);
                facilityDiv.appendChild(typeElement);
                facilityDiv.id = facility.name;
                facilityDiv.className = 'facility'
                facilitiesContainer.appendChild(facilityDiv);
                facilityDiv.addEventListener('click', function() {
                    
                var facilityName = facility.name.replace(/-/g, ' ');
                
                var facilityAddress = facility.address;
                var facilityType = facility.type;
                const hours = facility.hours
                var latitude = facility.latitude; 
                var longitude = facility.longitude;
                displayFacilityInfo(facilityName, facilityAddress, facilityType, latitude, longitude, hours);
                var facilitiesContainer = document.getElementById('facilities-container');
                if (window.innerWidth <= 768) { // Change 768 to the desired breakpoint
                    var facilitiesContainer = document.getElementById('facilities-container');
                    var informationContainer = document.getElementById('information-container');
                    facilitiesContainer.style.display = 'none';
                    informationContainer.style.display = 'block';
                }
                });
                
            });
            
        })
        .catch(error => {
            console.error('Error fetching data:', error.message);
        });
}

function displayFacilityInfo(facilityName) {
    var facilityInfo = document.getElementById('facility-info');
    //document.getElementById('facilities-container').style.display = 'none';
    document.getElementById('search-results-container').style.display = 'none';
    navigator.geolocation.getCurrentPosition(function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        localStorage.setItem('latitude', latitude);
        localStorage.setItem('longitude', longitude);
    },(error)=>{
        
    },{enableHighAccuracy: true});
    facilityInfo.style.display = "block";
    const fname = facilityName.replace(/\s+/g, '-');
    fetch(url+"/facilities/"+fname, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
    }).then(response =>{
        return response.json()
    }).then(facility=>{
        initMap();
        const distance = calculateDistance(facility.latitude, facility.longitude);
    facilityInfo.innerHTML = `
      <strong>Name:</strong> ${facility.name.replace()}<br>
      <strong>Address:</strong> ${facility.address}<br>
      <strong>Type:</strong> ${facility.type}<br>
      <strong> Hours:</strong> ${facility.hours}<br>
      <strong> Distance:</strong> ${Math.ceil(distance*10)/10} miles
      <div id="map-container"></div>
      <button id="delete-facility-button" type="button"  onclick="deleteFacility('${facility.name.replace(/\s+/g, '-')}')">Report This Facility Closed</button>
      <button id="edit-facility-button" type="button" , onclick="displayEditFacility('${facility.name}','${facility.hours}')">Edit</button>
    `;
    let mapdiv = document.getElementById('map-container');
    mapdiv.style.display = 'block';
    var map = new google.maps.Map(document.getElementById('map-container'), {
        center: {lat: facility.latitude, lng: facility.longitude},
        zoom: 10 // Adjust zoom level as needed
    });
    
    var marker = new google.maps.Marker({
        position: {lat: facility.latitude, lng: facility.longitude},
        map: map,
        title: facility.name
    });
    marker.setMap(map)
    })
    
}

async function deleteFacility(fname){
    await fetch(url+"/facilities?fname="+fname,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
    })
}

document.addEventListener('DOMContentLoaded', () => {
    // Send a GET request on page load
    displayfacilities()
});



function toggleContainer(containerId) {
   
    if (containerId === 'facilities') {
        hideContainers('facilities-container');
    }
    else if(containerId==='search'){
        hideContainers('search-container');
    } else {
        hideContainers('information-container');
    }
  }

  
  
  // Add event listeners to each facility element
  

  window.addEventListener('resize', function() {
    var facilitiesContainer = document.getElementById('facilities-container');
    var informationContainer = document.getElementById('information-container');
    
    // If viewport becomes larger, show facilities container if it was hidden
    if (window.innerWidth > 768 && facilitiesContainer.style.display === 'none') { // Change 768 to the desired breakpoint
      facilitiesContainer.style.display = 'block';
      informationContainer.style.display = 'block';
    }
  });

function initMap() {
    var map = new google.maps.Map(document.getElementById('map-container'), {
        center: {lat: 37.377641, lng: -122.019290}, // Default center coordinates
        zoom: 8 // Default zoom level
    });
}

async function searchFacilities(){
    var injury_type = document.getElementById('injury-type').value.replace(/\s+/g, '-');
    var mobility = document.getElementById('mobility').value;
    document.getElementById('search-results-container').style.display = 'block';
    document.getElementById("search-results-container").innerHTML='';
    document.getElementById('search-container').style.display = 'none';
    fetch(url+"/facility/search?description="+injury_type+"&mobility="+mobility,{
        method:'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
    }).then(response=>{
        return response.json()
    }).then(facilities=>{
        facilities.searchresult.forEach(facility => {
            facilitiesContainer = document.getElementById("search-results-container");
            ;
            const facilityDiv = document.createElement('div');
            facilityDiv.classList.add('facility');
            const nameElement = document.createElement('h2');
            nameElement.textContent = facility.name.replace(/-/g, ' ');
            const typeElement = document.createElement('p');
            typeElement.textContent = `Type: ${facility.type}`;
            facilityDiv.appendChild(nameElement);
            facilityDiv.appendChild(typeElement);
            facilityDiv.id = facility.name;
            facilityDiv.className = 'facility'
            facilitiesContainer.appendChild(facilityDiv);
            facilityDiv.addEventListener('click', function() {
                
                var facilityName = facility.name.replace(/-/g, ' ');
                
                var facilityAddress = facility.address;
                var facilityType = facility.type;
                var latitude = facility.latitude; //parseFloat(this.dataset.latitude); // Replace with actual latitude attribute
                var longitude = facility.longitude//parseFloat(this.dataset.longitude); // Replace with actual longitude attribute
                displayFacilityInfo(facilityName, facilityAddress, facilityType, latitude, longitude);
                var facilitiesContainer = document.getElementById('facilities-container');
                if (window.innerWidth <= 768) { // Change 768 to the desired breakpoint
                    var facilitiesContainer = document.getElementById('facilities-container');
                    var informationContainer = document.getElementById('information-container');
                    facilitiesContainer.style.display = 'none';
                    informationContainer.style.display = 'block';
                }
            });
            
        });
    });
}
function addNewFacility(){
    document.getElementById('add-facility-container').style.display='block';
    document.getElementById('facilities-container').style.display='none';
    document.getElementById('information-container').style.display='none';
    document.getElementById('search-container').style.display='none';  
}

function addFacility(){
    var longitude = document.getElementById('longitude').value;
    var latitude = document.getElementById('latitude').value;
    var name = document.getElementById('name').value.replace(/\s+/g, '-');
    var type = document.getElementById('type').value;
    var hours = document.getElementById('hours').value;
    var address = document.getElementById('address').value;
    
    if(longitude == ''||latitude==''||name==''||type==''||hours==''||address==''){
        alert("Please fill in all fields");
        return;
    }
    else{
        fetch(url +"/facilities/newfacility", {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
            body:JSON.stringify({
                "longitude": longitude,
                "latitude": latitude,
                "name": name,
                "type": type,
                "address":address,
                "hours":hours
            })
        }).then(resp=>{
            return resp.json()
        }).then(resp=>{
            alert( resp.added);
            document.getElementById('facilities-container').style.display = "block";
            document.getElementById('information-container').style.display = "none";
            document.getElementById('search-container').style.display = "none";
            document.getElementById('add-facility-container').style.display = "none";
            document.getElementById('edit-facility-container').style.display = "none";
            document.getElementById('longitude').value;
            document.getElementById('latitude').value='';
            document.getElementById('name').value='';
            document.getElementById('type').value='';
            document.getElementById('hours').value='';
            document.getElementById('address').value='';
        })
    }
}

function displayEditFacility(name, hours){
    hideContainers('edit-facility-container');
    document.getElementById('name-change').value=name;
    document.getElementById('hours-change').value=hours;
    
}

async function editFacility(){
    const newname = document.getElementById('name-change').value.replace(/\s+/g, '-');
    const newhours = document.getElementById('hours-change').value;
    if(newname==''||newhours==''){
        alert("cannot submit empty fields");
    }else{
        fetch(url+"/facilities/newinfo",{
            method:'PATCH',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
            body:JSON.stringify({
                "name":newname,
                "hours":newhours
            })
        }).then(resp=>{
            alert("New informqation submited");
            hideContainers('edit-facility-container');
        })
    }

}

function hideContainers(display){
    document.getElementById('facilities-container').style.display = "none";
    if($(window).width()<768){
        document.getElementById('information-container').style.display = "none";
    }
    
    document.getElementById('search-results-container').style.display = "none";
    document.getElementById('search-container').style.display = "none";
    document.getElementById('add-facility-container').style.display = "none";
    document.getElementById('edit-facility-container').style.display = "none";
    document.getElementById(display).style.display = "block";
}

function calculateDistance(facilityLatitude, facilityLongitude) {
    const userLatitude = localStorage.getItem('latitude');
    const userLongitude = localStorage.getItem('longitude');
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (facilityLatitude - userLatitude) * Math.PI / 180; 
    const dLon = (facilityLongitude - userLongitude) * Math.PI / 180; 
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLatitude * Math.PI / 180) * Math.cos(facilityLatitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in miles
    return distance;
}