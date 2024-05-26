async function getGeolocationByIP(ip) {
  const apiURL = `https://get.geojs.io/v1/ip/geo/${ip}.json`;

  try {
      const response = await fetch(apiURL);
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
          const geolocation = {
            lat: data.latitude ? data.latitude : null,
            long: data.longitude ? data.longitude : null,
            region: data.region ? data.region : null,
            city: data.city ? data.city : null,
          };
          return geolocation;
      } else {
          return null;
      }
  } catch (error) {
      return null;
  }
}

module.exports = { getGeolocationByIP };