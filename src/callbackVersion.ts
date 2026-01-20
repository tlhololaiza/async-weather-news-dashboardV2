import * as https from 'https';
import type { IncomingMessage } from 'http';

const OPENWEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const CITY = 'Pretoria';
const COUNTRY_CODE = 'za';

// Function to fetch weather data with a callback
const fetchWeather = (
  city: string,
  countryCode: string,
  apiKey: string,
  callback: (error: Error | null, weatherData?: any) => void,
) => {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${apiKey}&units=metric`;

  https
    .get(weatherUrl, (weatherRes: IncomingMessage) => {
      let data = '';
      weatherRes.on('data', (chunk: string | Buffer) => (data += chunk));
      weatherRes.on('end', () => {
        try {
          const weatherData = JSON.parse(data);
          if (weatherRes.statusCode !== 200) {
            return callback(
              new Error(
                `Weather API Error: ${weatherData.message || 'Unknown error'}`,
              ),
            );
          }
          callback(null, weatherData);
        } catch (e) {
          callback(e as Error);
        }
      });
    })
    .on('error', (e: Error) => {
      callback(e);
    });
};

// Function to fetch news headlines with a callback
const fetchNews = (
  callback: (error: Error | null, newsData?: any) => void,
) => {
  const newsUrl = 'https://dummyjson.com/posts';
  https
    .get(newsUrl, (newsRes: IncomingMessage) => {
      let data = '';
      newsRes.on('data', (chunk: string | Buffer) => (data += chunk));
      newsRes.on('end', () => {
        try {
          const newsData = JSON.parse(data);
          if (newsRes.statusCode !== 200) {
            return callback(
              new Error(
                `News API Error: Failed to fetch news headlines. Status Code: ${newsRes.statusCode}`,
              ),
            );
          }
          callback(null, newsData);
        } catch (e) {
          callback(e as Error);
        }
      });
    })
    .on('error', (e: Error) => {
      callback(e);
    });
};

console.log('Fetching data using callbacks...');

// Callback hell
fetchWeather(CITY, COUNTRY_CODE, OPENWEATHER_API_KEY, (weatherError, weatherData) => {
  if (weatherError) {
    console.error(`Error fetching weather: ${weatherError.message}`);
    return;
  }

  // Weather data received successfully, now fetch news
  fetchNews((newsError, newsData) => {
    if (newsError) {
      console.error(`Error fetching news: ${newsError.message}`);
      return;
    }

    // Both weather and news data received successfully
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

    console.log('\n--- Callback-based implementation complete ---');
  });
});