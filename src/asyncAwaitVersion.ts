import * as https from 'https';
import * as http from 'http';

interface WeatherData {
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

interface NewsPost {
    id: number;
    title: string;
    body: string;
}

interface NewsResponse {
    posts: NewsPost[];
}

interface LocationData {
    city: string;
    country: string;
    countryCode: string;
}

const OPENWEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const NEWS_API_URL = 'https://dummyjson.com/posts';
const GEOLOCATION_API_URL = 'https://ipapi.co/json/';


// Function to fetch current location
async function fetchCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
        https.get(GEOLOCATION_API_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.city && parsedData.country_code) {
                        const location: LocationData = {
                            city: parsedData.city,
                            country: parsedData.country_name || parsedData.country,
                            countryCode: parsedData.country_code.toLowerCase(),
                        };
                        resolve(location);
                    } else {
                        reject(new Error('Location data not found in response.'));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse location data: ${(error as Error).message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Failed to fetch location data: ${(error as Error).message}`));
        });
    });
}


// Function to fetch weather data
async function fetchWeather(city: string, countryCode: string): Promise<WeatherData> {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    return new Promise((resolve, reject) => {
        https.get(WEATHER_API_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.main && parsedData.weather && parsedData.wind) {
                        const weather: WeatherData = {
                            temperature: parsedData.main.temp,
                            feelsLike: parsedData.main.feels_like,
                            condition: parsedData.weather[0].description,
                            humidity: parsedData.main.humidity,
                            windSpeed: parsedData.wind.speed,
                        };
                        resolve(weather);
                    } else {
                        reject(new Error('Weather data not found in response.'));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse weather data: ${(error as Error).message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Failed to fetch weather data: ${(error as Error).message}`));
        });
    });
}


// Function to fetch news headlines
async function fetchNews(): Promise<NewsPost[]> {
    return new Promise((resolve, reject) => {
        https.get(NEWS_API_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData: NewsResponse = JSON.parse(data);
                    if (parsedData.posts) {
                        resolve(parsedData.posts);
                    } else {
                        reject(new Error('News posts not found in response.'));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse news data: ${(error as Error).message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Failed to fetch news data: ${(error as Error).message}`));
        });
    });
}

// Displayng weather information
function displayWeather(weather: WeatherData, location: LocationData): void {
    console.log(`Weather in: ${location.city}, ${location.country}`);
    console.log(`- Temperature: ${weather.temperature}°C`);
    console.log(`- Feels like: ${weather.feelsLike}°C`);
    console.log(`- Condition: ${weather.condition}`);
    console.log(`- Humidity: ${weather.humidity}%`);
    console.log(`- Wind Speed: ${weather.windSpeed} m/s`);
    console.log('');
}


// Displaying news headlines
function displayNews(newsPosts: NewsPost[]): void {
    console.log('Latest News Headlines:');
    newsPosts.forEach(post => console.log(`- ${post.title}`));
    console.log('');
}

// Centralized error handling
function handleError(error: unknown, context: string): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${context}: ${message}`);
    console.error('---------------------------------');
}

// The main async/await function
async function runAsyncAwaitVersion(): Promise<void> {
    console.log('--- Running Async/Await Chain ---');
    console.log('---------------------------------');
    try {
        const location = await fetchCurrentLocation();
        console.log(`Detected location: ${location.city}, ${location.country}`);
        
        const weatherData = await fetchWeather(location.city, location.countryCode);
        displayWeather(weatherData, location);

        const newsData = await fetchNews();
        displayNews(newsData);
    } catch (error) {
        handleError(error, 'async/await chain');
        
        const fallbackLocation: LocationData = {
            city: 'Johannesburg',
            country: 'South Africa',
            countryCode: 'za'
        };
        console.log(`Failed to get dynamic location. Now using fallback: ${fallbackLocation.city}, ${fallbackLocation.country}`);

        try {
            const weatherData = await fetchWeather(fallbackLocation.city, fallbackLocation.countryCode);
            displayWeather(weatherData, fallbackLocation);
            const newsData = await fetchNews();
            displayNews(newsData);
        } catch (fallbackError) {
            handleError(fallbackError, 'fallback weather/news fetch');
        }
    }

    console.log('--- Running Promise.all() with Async/Await ---');
    console.log('----------------------------------------------');
    try {
        const location = await fetchCurrentLocation();
        console.log(`Detected location: ${location.city}, ${location.country}`);
        
        const [weatherData, newsData] = await Promise.all([
            fetchWeather(location.city, location.countryCode),
            fetchNews()
        ]);
        console.log('Both requests completed successfully and simultaneously.');
        console.log('');
        displayWeather(weatherData, location);
        displayNews(newsData);
    } catch (error) {
        handleError(error, 'Promise.all()');

        const fallbackLocation: LocationData = {
            city: 'Johannesburg',
            country: 'South Africa',
            countryCode: 'za'
        };
        console.log(`Failed to get dynamic location. Now using fallback: ${fallbackLocation.city}, ${fallbackLocation.country}`);

        try {
            const [weatherData, newsData] = await Promise.all([
                fetchWeather(fallbackLocation.city, fallbackLocation.countryCode),
                fetchNews()
            ]);
            console.log('Both requests completed successfully using fallback location.');
            displayWeather(weatherData, fallbackLocation);
            displayNews(newsData);
        } catch (fallbackError) {
            handleError(fallbackError, 'fallback Promise.all()');
        }
    }

    console.log('--- Running Promise.race() with Async/Await ---');
    console.log('-----------------------------------------------');
    try {
        const location = await fetchCurrentLocation();
        console.log(`Detected location: ${location.city}, ${location.country}`);
        
        const fastestResult = await Promise.race([
            fetchWeather(location.city, location.countryCode),
            fetchNews()
        ]);
        if ('temperature' in fastestResult) {
            console.log('The weather API won the race!');
            console.log('First result to settle:');
            displayWeather(fastestResult as WeatherData, location);
        } else {
            console.log('The news API won the race!');
            console.log('First result to settle:');
            displayNews(fastestResult as NewsPost[]);
        }
    } catch (error) {
        handleError(error, 'Promise.race()');

        const fallbackLocation: LocationData = {
            city: 'Johannesburg',
            country: 'South Africa',
            countryCode: 'za'
        };
        console.log(`Failed to get dynamic location. Now using fallback: ${fallbackLocation.city}, ${fallbackLocation.country}`);

        try {
            const fastestResult = await Promise.race([
                fetchWeather(fallbackLocation.city, fallbackLocation.countryCode),
                fetchNews()
            ]);
            console.log('One of the requests completed successfully using fallback location.');
            if ('temperature' in fastestResult) {
                console.log('The weather API won the race!');
                displayWeather(fastestResult as WeatherData, fallbackLocation);
            } else {
                console.log('The news API won the race!');
                displayNews(fastestResult as NewsPost[]);
            }
        } catch (fallbackError) {
            handleError(fallbackError, 'fallback Promise.race()');
        }
    }
}

runAsyncAwaitVersion();
