const getDetails = async (latitude, longitude, day) => {
  const url = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${day}`;
  try {
    const response = await axios.get(url);
    if(response.status == 200) {
      if(response.data.status == "OK") {
        return {data: response.data.results, status: true, message: ""};
      } else {
        return {data: null, status: false, message: response.body};
      }
    } else {throw new Error("Something went wrong!");}
  } catch (error) {
    return {data: null, status: false, message: error.message};
  }
};


const searchPlace = async (searchString) => {
  const url = `https://geocode.maps.co/search?q=${searchString}`;
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(`Failed to fetch geocoding data. Status: ${response.status}`);
    }
    return {data: response.data, status: true, message: ""};
  } catch (error) {
    return {data: null, status: false, message: error.message};
  }
 }