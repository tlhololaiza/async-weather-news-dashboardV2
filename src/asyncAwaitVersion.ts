import * as https from 'https';

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

const OPENWEATHER_API_KEY = 'fb9bce8c66477a7ff08ebcc24bfd43f6';
const CITY = 'Pretoria';
const COUNTRY_CODE = 'za';
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY_CODE}&appid=${OPENWEATHER_API_KEY}&units=metric`;
const NEWS_API_URL = 'https://dummyjson.com/posts';


// Function to fetch weather data
async function fetchWeather(): Promise<WeatherData> {
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


// Display weather information
function displayWeather(weather: WeatherData): void {
    console.log(`Weather in: Pretoria, za`);
    console.log(`- Temperature: ${weather.temperature}°C`);
    console.log(`- Feels like: ${weather.feelsLike}°C`);
    console.log(`- Condition: ${weather.condition}`);
    console.log(`- Humidity: ${weather.humidity}%`);
    console.log(`- Wind Speed: ${weather.windSpeed} m/s`);
    console.log('');
}


// Display news headlines
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
        const weatherData = await fetchWeather();
        displayWeather(weatherData);

        const newsData = await fetchNews();
        displayNews(newsData);
    } catch (error) {
        handleError(error, 'async/await chain');
    }

    console.log('--- Running Promise.all() with Async/Await ---');
    console.log('----------------------------------------------');
    try {
        const [weatherData, newsData] = await Promise.all([
            fetchWeather(),
            fetchNews()
        ]);
        console.log('Both requests completed successfully and simultaneously.');
        console.log('');
        displayWeather(weatherData);
        displayNews(newsData);
    } catch (error) {
        handleError(error, 'Promise.all()');
    }

    console.log('--- Running Promise.race() with Async/Await ---');
    console.log('-----------------------------------------------');
    try {
        const fastestResult = await Promise.race([
            fetchWeather(),
            fetchNews()
        ]);
        if ('temperature' in fastestResult) {
            console.log('The weather API won the race!');
            console.log('First result to settle:');
            displayWeather(fastestResult as WeatherData);
        } else {
            console.log('The news API won the race!');
            console.log('First result to settle:');
            displayNews(fastestResult as NewsPost[]);
        }
    } catch (error) {
        handleError(error, 'Promise.race()');
    }
}

runAsyncAwaitVersion();
