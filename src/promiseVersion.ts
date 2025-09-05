import * as https from 'https';
import type { IncomingMessage } from 'http';

const OPENWEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const DUMMYJSON_URL = 'https://dummyjson.com/posts';
const CITY = 'Pretoria';
const COUNTRY_CODE = 'za';

// Helper function to promisify https.get
const promisifyHttpsGet = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    https
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

// Functions that return a Promise
const fetchWeather = () => {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  return promisifyHttpsGet(weatherUrl);
};

const fetchNews = () => {
  return promisifyHttpsGet(DUMMYJSON_URL);
};

// Function to display the results
const displayResults = (weatherData: any, newsData: any) => {
  console.log(`\nWeather in: ${CITY}, ${COUNTRY_CODE}`);
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
fetchWeather()
  .then((weatherData) => {
    return fetchNews().then((newsData) => ({ weatherData, newsData }));
  })
  .then(({ weatherData, newsData }) => {
    displayResults(weatherData, newsData);
  })
  .catch((error) => {
    console.error(`Error in Promise Chain: ${error.message}`);
  });
console.log('-----------------------------\n');

// --- Promise.all() Example ---
console.log('--- Running Promise.all() ---');
Promise.all([fetchWeather(), fetchNews()])
  .then(([weatherData, newsData]) => {
    console.log('Both requests completed successfully and simultaneously.');
    displayResults(weatherData, newsData);
  })
  .catch((error) => {
    console.error(`Error in Promise.all(): ${error.message}`);
  });
console.log('------------------------------\n');

// --- Promise.race() ---
console.log('--- Running Promise.race() ---');
Promise.race([fetchWeather(), fetchNews()])
  .then((result) => {
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