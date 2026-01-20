import * as https from 'https';
import * as http from 'http';
import type { IncomingMessage } from 'http';

interface LocationData {
  city: string;
  country: string;
  countryCode: string;
}

const OPENWEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';

const GEOLOCATION_APIS = [
  'http://ip-api.com/json/',
  'https://ipapi.co/json/',
];

// Function to fetch current location with callback
const fetchCurrentLocation = (
  callback: (error: Error | null, locationData?: LocationData) => void,
) => {
  let attemptIndex = 0;

  const tryNextAPI = () => {
    if (attemptIndex >= GEOLOCATION_APIS.length) {
      console.log('All geolocation APIs failed, using default location: Johannesburg, ZA');
      const defaultLocation: LocationData = {
        city: 'Johannesburg',
        country: 'South Africa',
        countryCode: 'za'
      };
      return callback(null, defaultLocation);
    }

    const apiUrl = GEOLOCATION_APIS[attemptIndex];
    console.log(`Trying geolocation API: ${apiUrl}`);

    const client = apiUrl.startsWith('https:') ? https : http;
    
    client.get(apiUrl, (res: IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: string | Buffer) => (data += chunk));
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            console.log(`API Response from ${apiUrl}:`, JSON.stringify(parsedData, null, 2));

            let location: LocationData | null = null;

            if (parsedData.city && parsedData.countryCode) {
              location = {
                city: parsedData.city,
                country: parsedData.country,
                countryCode: parsedData.countryCode.toLowerCase(),
              };
            }
            else if (parsedData.city && parsedData.country_code) {
              location = {
                city: parsedData.city,
                country: parsedData.country_name || parsedData.country,
                countryCode: parsedData.country_code.toLowerCase(),
              };
            }

            if (location) {
              callback(null, location);
            } else {
              console.log(`API ${apiUrl} failed: Location data not found in response`);
              attemptIndex++;
              tryNextAPI();
            }
          } catch (e) {
            console.log(`API ${apiUrl} failed: ${(e as Error).message}`);
            attemptIndex++;
            tryNextAPI();
          }
        });
      })
      .on('error', (e: Error) => {
        console.log(`API ${apiUrl} failed: ${e.message}`);
        attemptIndex++;
        tryNextAPI();
      });
  };

  tryNextAPI();
};

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

//Callback chain
fetchCurrentLocation((locationError, locationData) => {
  if (locationError) {
    console.error(`Error fetching location: ${locationError.message}`);
    return;
  }

  console.log(`Detected location: ${locationData!.city}, ${locationData!.country}`);

  fetchWeather(locationData!.city, locationData!.countryCode, OPENWEATHER_API_KEY, (weatherError, weatherData) => {
    if (weatherError) {
      console.error(`Error fetching weather: ${weatherError.message}`);
      return;
    }

    fetchNews((newsError, newsData) => {
      if (newsError) {
        console.error(`Error fetching news: ${newsError.message}`);
        return;
      }

      console.log(`\nWeather in: ${locationData!.city}, ${locationData!.country}`);
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
});