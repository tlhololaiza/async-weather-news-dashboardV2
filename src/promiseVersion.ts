import * as https from 'https';
import * as http from 'http';
import type { IncomingMessage } from 'http';

interface LocationData {
  city: string;
  country: string;
  countryCode: string;
}

const OPENWEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const DUMMYJSON_URL = 'https://dummyjson.com/posts';

const GEOLOCATION_APIS = [
  'http://ip-api.com/json/',
  'https://ipapi.co/json/',
];

// Helper function to promisify https.get
const promisifyHttpsGet = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    client
      .get(url, (res: IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: string | Buffer) => (data += chunk));
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            if (res.statusCode !== 200) {
              return reject(
                new Error(
                  `API Error: ${parsedData.message || 'Unknown error'}. Status Code: ${res.statusCode}`,
                ),
              );
            }
            resolve(parsedData);
          } catch (e) {
            reject(e as Error);
          }
        });
      })
      .on('error', (e: Error) => {
        reject(e);
      });
  });
};

// Function to fetch current location
const fetchCurrentLocation = (): Promise<LocationData> => {
  const tryGeolocationAPI = (url: string): Promise<LocationData> => {
    return promisifyHttpsGet(url).then((parsedData) => {
      const city = parsedData.city;
      const country = parsedData.country || parsedData.country_name;
      const countryCode = parsedData.countryCode || parsedData.country_code;

      if (city && countryCode) {
        return {
          city: city,
          country: country,
          countryCode: countryCode.toLowerCase(),
        };
      } else {
        throw new Error(`Location data not found in response from ${url}. Available fields: ${Object.keys(parsedData).join(', ')}`);
      }
    });
  };

  const tryAPIs = (index: number): Promise<LocationData> => {
    if (index >= GEOLOCATION_APIS.length) {
      console.log('All geolocation APIs failed, using default location: Johannesburg, ZA');
      return Promise.resolve({
        city: 'Johannesburg',
        country: 'South Africa',
        countryCode: 'za'
      });
    }

    const apiUrl = GEOLOCATION_APIS[index];
    console.log(`Trying geolocation API: ${apiUrl}`);
    
    return tryGeolocationAPI(apiUrl)
      .then((location) => location)
      .catch((error) => {
        console.log(`API ${apiUrl} failed:`, (error as Error).message);
        return tryAPIs(index + 1);
      });
  };

  return tryAPIs(0);
};

// Functions that return a Promise
const fetchWeather = (city: string, countryCode: string) => {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  return promisifyHttpsGet(weatherUrl);
};

const fetchNews = () => {
  return promisifyHttpsGet(DUMMYJSON_URL);
};

// Function to display the results
const displayResults = (weatherData: any, newsData: any, location: LocationData) => {
  console.log(`\nWeather in: ${location.city}, ${location.country}`);
  console.log(`- Temperature: ${weatherData.main.temp}°C`);
  console.log(`- Feels like: ${weatherData.main.feels_like}°C`);
  console.log(`- Condition: ${weatherData.weather[0].description}`);
  console.log(`- Humidity: ${weatherData.main.humidity}%`);
  console.log(`- Wind Speed: ${weatherData.wind.speed} m/s`);
  console.log('\nLatest News Headlines:');
  newsData.posts.forEach((post: any) => {
    console.log(`- ${post.title}`);
  });
};

// --- Promise Chain Example ---
console.log('--- Running Promise Chain ---');
fetchCurrentLocation()
  .then((location) => {
    console.log(`Detected location: ${location.city}, ${location.country}`);
    return fetchWeather(location.city, location.countryCode).then((weatherData) => 
      fetchNews().then((newsData) => ({ weatherData, newsData, location }))
    );
  })
  .then(({ weatherData, newsData, location }) => {
    displayResults(weatherData, newsData, location);
  })
  .catch((error) => {
    console.error(`Error in Promise Chain: ${error.message}`);
  });
console.log('-----------------------------\n');

// --- Promise.all() Example ---
console.log('--- Running Promise.all() ---');
fetchCurrentLocation()
  .then((location) => {
    console.log(`Detected location: ${location.city}, ${location.country}`);
    return Promise.all([fetchWeather(location.city, location.countryCode), fetchNews()])
      .then(([weatherData, newsData]) => ({ weatherData, newsData, location }));
  })
  .then(({ weatherData, newsData, location }) => {
    console.log('Both requests completed successfully and simultaneously.');
    displayResults(weatherData, newsData, location);
  })
  .catch((error) => {
    console.error(`Error in Promise.all(): ${error.message}`);
  });
console.log('------------------------------\n');

// --- Promise.race() ---
console.log('--- Running Promise.race() ---');
fetchCurrentLocation()
  .then((location) => {
    console.log(`Detected location: ${location.city}, ${location.country}`);
    return Promise.race([fetchWeather(location.city, location.countryCode), fetchNews()])
      .then((result) => ({ result, location }));
  })
  .then(({ result, location }) => {
    if (result.posts) {
      console.log('The news API won the race!');
    } else {
      console.log('The weather API won the race!');
    }
    console.log(`First result to settle: ${JSON.stringify(result).substring(0, 100)}...`);
  })
  .catch((error) => {
    console.error(`Error in Promise.race(): ${error.message}`);
  });
console.log('------------------------------\n');