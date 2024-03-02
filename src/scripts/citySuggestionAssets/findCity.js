async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", 
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json();
}

export default async function (lat, long) {
  const request = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`,
    {
      mode: "cors",
    }
  );
  const response = await request.json();

  const cities = await postData(
    "https://countriesnow.space/api/v0.1/countries/cities",
    { iso2: response.countryCode }
  );

  return {
    continent: response.continent,
    city: response.city,
    country: response.countryName,
    citiesOnCountry: cities.data
  };
}
