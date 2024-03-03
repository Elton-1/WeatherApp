import openMeteoWeather from "../weatherAssets/openMeteoWeather.mjs";
import headerWrapperInitilizer from "./headerWrapperInitilizer";
import findCity from "../citySuggestionAssets/findCity";

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      console.log("Getting user geolocation..");

      // Options for watchPosition
      const options = {
        timeout: 2000, 
        maximumAge: 100 * 10 * 60 * 60 * 24,
      };

      // Watch the user's position
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log("Got user location");
          // Clear the watch position once we have received the data
          navigator.geolocation.clearWatch(watchId);
          resolve(position.coords);
        },
        (error) => {
          // Clear the watch position in case of errors
          navigator.geolocation.clearWatch(watchId);
          reject(error);
        },
        options
      );
    }
  });
}

function handleUserLocationError(fn, ...param) {
  return (...param) => {
    return new Promise((resolve, reject) => {
      fn(...param)
        .catch(async (e) => {
          try {
            console.log("User location error, getting IP");
            const fetchedData = await fetch(
              "https://api.ipify.org?format=json"
            );
            const response = await fetchedData.json();
            const ipAddress = response.ip;
            //After getting the IP make sure to get the geolocation of it
            console.log("Getting ip geolocation");
            const fetchedGeolocationData = await fetch(
              `https://ipgeolocation.abstractapi.com/v1/?api_key=f1b6c1943ccb4f2d887969d86367649d&ip_address=${ipAddress}`
            );
            const GeolocationResponse = await fetchedGeolocationData.json();
            resolve({
              latitude: GeolocationResponse.latitude,
              longitude: GeolocationResponse.longitude,
            });
          } catch (e) {
            //If neither the IP and location are provided then theres no other choice other than to default to an location (london)
            resolve({
              latitude: 51.5072,
              longitude: 0.1276,
            });
          }
        })
        .then((value) => {
          resolve(value);
        });
    });
  };
}

export default async function (
  weatherObjectConstructor,
  weatherIconHandeler,
  weatherIconObject,
  headerWrapper,
  weatherCardContainer,
  WMOdata,
  location
) {
  console.log("prev location: " + location);
  if (!location) {
    const safeLocationHandeler = handleUserLocationError(getUserLocation);
    location = await safeLocationHandeler();
  }

  console.log("Getting weather data");
  const weather = await weatherObjectConstructor(
    openMeteoWeather(location.latitude, location.longitude, WMOdata)
  );

  console.log("All operations done!");

  headerWrapperInitilizer(
    headerWrapper,
    weather,
    location.latitude,
    location.longitude,
    findCity,
    weatherIconHandeler,
    weatherIconObject(
      "./day-cloudy.svg",
      "./cloud.svg",
      "./night-alt-cloudy.svg",
      "./night-clear.svg",
      "./day-sunny.svg",
      "./rain.svg",
      "./rain.svg",
      "./snow.svg",
      "./snow.svg",
      "./thunderstorm.svg",
      weather.getCurrentWeatherData().isDay,
    ),
    WMOdata
  );

}