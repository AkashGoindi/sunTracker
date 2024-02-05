const searchInput = document.getElementById("searchInput");
const resultsDropdown = document.getElementById("results-dropdown");
const resultsList = resultsDropdown.querySelector("ul");
const locationSearch = document.getElementById("locationSearch");
const locationLatLon = document.getElementById("locationLatLon");
const errorMsg = document.getElementById("error_msg");


  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // 800 m.sec on purpose delay
  //This will avoid too many api calls on typing fast.
  const debouncedSearch = debounce(async () => {
    const searchTerm = searchInput.value.trim();
    resultsList.innerHTML = '';
    if (searchTerm.length === 0) {
      resultsDropdown.style.display = 'none';
      errorMsg.innerHTML="";
      return;
    }
    if(errorMsg.innerHTML.length) {
      errorMsg.innerHTML="";
    }
    try {
      const results = await searchLatLon();
      displayDropdown(results);
    } catch (error) {
    }
  }, 800);

searchInput.addEventListener("input", debouncedSearch);

function displayDropdown(results) {
  results.forEach(result => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = result.display_name;

    listItem.addEventListener("click", async() => {
      showLoader();
      const { lat, lon } = result;
      locationSearch.innerHTML=  " "+ result.display_name;
      locationLatLon.innerHTML =  `( ${lat}, ${lon} )`;
      reteriveSunData(lat, lon);
      removePlaceholder();
      resultsDropdown.style.display = 'none';
      searchInput.value = '';
    });
    resultsList.appendChild(listItem);
  });
  resultsDropdown.style.display = 'block';
}

async function reteriveSunData(lat, lon) {
  const today = await sunriseSunsetApi(lat, lon, 'today');
  const tomorrow = await sunriseSunsetApi(lat, lon, 'tomorrow');
  displayDetails(today, 'today');
  displayDetails(tomorrow, 'tomorrow');
  hideLoader();
}

async function sunriseSunsetApi(latitude, longitude, day) {
  let res = await getDetails(latitude, longitude, day);
  if (res.status) {
    return res.data;
  } else {
    errorMsg.innerHTML = `Nothing found for search: ${res.message}`;
  }
}

function fetchCurrentLoc() {
  showLoader();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      reteriveSunData(lat, lon);
      removePlaceholder();
      locationSearch.innerHTML = " My Current Location";
      locationLatLon.innerHTML =  `( ${lat}, ${lon} )`;
    },function(error) {
      hideLoader();
    }
  );
  } else {
    alert("Geolocation is not supported by this browser.");
    hideLoader();
  }
}

async function searchLatLon() {
  const str = document.getElementById('searchInput').value;
  if (!str) return alert("Please Enter Valid Location !");
  let res = await searchPlace(str);
  const { data, status } = res;
  if (status) {
    if (data && data.length) {
      return data;
    } else {
      errorMsg.innerHTML = `Nothing found for search: ${str}`;
    }
  } else {
    errorMsg.innerHTML = `Unable to fetch location: ${res.message}`;
  }
}

function displayDetails(data, key) {
  const [hours, minutes, seconds] = data.day_length.split(':').map(Number);
  const formattedTime = `${hours}h ${minutes}m ${seconds}s`;
  document.getElementById(`${key}_sunrise`).innerHTML = data.sunrise;
  document.getElementById(`${key}_sunset`).innerHTML = data.sunset;
  document.getElementById(`${key}_dawn`).innerHTML = data.dawn;
  document.getElementById(`${key}_dusk`).innerHTML = data.dusk;
  document.getElementById(`${key}_solar`).innerHTML = data.solar_noon;
  document.getElementById(`${key}_timezone`).innerHTML = data.timezone;
  document.getElementById(`${key}_length`).innerHTML = `(${formattedTime} Long)`;
}

function removePlaceholder() {
  document.getElementById('ss_info_blank').style.display = 'none';
  document.getElementById('ss_info').style.display = 'block';
}

function showLoader() {
  document.getElementById('loader').style.display="block";
}

function hideLoader() {
  document.getElementById('loader').style.display="none";
}
