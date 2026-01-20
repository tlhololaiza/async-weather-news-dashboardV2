# Weather and News Dashboard

This project demonstrates a simple command-line dashboard that fetches and displays real-time weather and news information. It's built in TypeScript and showcases three different approaches to handling asynchronous operations: **callbacks**, **Promises**, and **async/await**.

## Key Features

  - **Dynamic Location Detection**: Automatically detects your current location to provide relevant weather information.
  - **Real-time Weather**: Fetches and displays the current temperature, conditions, and wind speed using the OpenWeatherMap API.
  - **Latest News Headlines**: Fetches recent headlines from a dummy news API.
  - **Asynchronous Patterns**: Provides implementations for asynchronous operations using:
    1.  Callback functions
    2.  Promises
    3.  Async/Await syntax

## Usage

### Prerequisites

  - Node.js and npm installed on your machine.

### Installation

1.  Clone this repository.
2.  Navigate to the project directory.
3.  Install the dependencies:

<!-- end list -->

```bash
npm install
```

### Running the Code

You can run each version of the dashboard using the following npm scripts:

  - **Callback Version:**
    ```bash
    npm run callback
    ```
  - **Promise Version:**
    ```bash
    npm run promise
    ```
  - **Async/Await Version:**
    ```bash
    npm run async
    ```

## Sample Console Outputs

The output will vary based on your location and the current weather/news data.

### 1\. `callbackVersion.ts`

This version executes operations in a chain.

```bash
$ npm run callback

> async-weather-news-dashboardv2@1.0.0 callback
> ts-node src/callbackVersion.ts

Fetching data using callbacks...
Detected location: Johannesburg, South Africa

Weather in: Johannesburg, South Africa
- Temperature: 18.27°C
- Feels like: 17.8°C
- Condition: clear sky
- Humidity: 60%
- Wind Speed: 2.1 m/s

Latest News Headlines:
- The Best Laptop for Developers in 2024
- 10 Tips for a Productive Remote Work Setup
- Top 5 Programming Languages to Learn
```

-----

### 2\. `promiseVersion.ts`

This version demonstrates a sequential Promise chain, `Promise.all()`, and `Promise.race()`.

```bash
$ npm run promise

> async-weather-news-dashboardv2@1.0.0 promise
> npx ts-node src/promiseVersion.ts

--- Running Promise Chain ---
Detected location: Johannesburg, South Africa

Weather in: Johannesburg, South Africa
- Temperature: 18.27°C
- Feels like: 17.8°C
- Condition: clear sky
- Humidity: 60%
- Wind Speed: 2.1 m/s

Latest News Headlines:
- The Best Laptop for Developers in 2024
- 10 Tips for a Productive Remote Work Setup
- Top 5 Programming Languages to Learn
-----------------------------

--- Running Promise.all() ---
Detected location: Johannesburg, South Africa
Both requests completed successfully and simultaneously.

Weather in: Johannesburg, South Africa
- Temperature: 18.27°C
- Feels like: 17.8°C
- Condition: clear sky
- Humidity: 60%
- Wind Speed: 2.1 m/s

Latest News Headlines:
- The Best Laptop for Developers in 2024
- 10 Tips for a Productive Remote Work Setup
- Top 5 Programming Languages to Learn
------------------------------

--- Running Promise.race() ---
Detected location: Johannesburg, South Africa
The weather API won the race!
First result to settle: {"coord":{"lon":28.0583,"lat":-26.2309},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}],"base":"stations","main":...
------------------------------
```

-----

### 3\. `asyncAwaitVersion.ts`

This version uses the `async/await` syntax to make asynchronous code look synchronous. It also shows `Promise.all()` and `Promise.race()` for concurrency.

```bash
$ npm run async

> async-weather-news-dashboardv2@1.0.0 async
> npx ts-node src/asyncAwaitVersion.ts

--- Running Async/Await Chain ---
---------------------------------
Detected location: Johannesburg, South Africa
Weather in: Johannesburg, South Africa
- Temperature: 18.27°C
- Feels like: 17.8°C
- Condition: clear sky
- Humidity: 60%
- Wind Speed: 2.1 m/s

Latest News Headlines:
- The Best Laptop for Developers in 2024
- 10 Tips for a Productive Remote Work Setup
- Top 5 Programming Languages to Learn

--- Running Promise.all() with Async/Await ---
----------------------------------------------
Detected location: Johannesburg, South Africa
Both requests completed successfully and simultaneously.

Weather in: Johannesburg, South Africa
- Temperature: 18.27°C
- Feels like: 17.8°C
- Condition: clear sky
- Humidity: 60%
- Wind Speed: 2.1 m/s

Latest News Headlines:
- The Best Laptop for Developers in 2024
- 10 Tips for a Productive Remote Work Setup
- Top 5 Programming Languages to Learn

--- Running Promise.race() with Async/Await ---
-----------------------------------------------
Detected location: Johannesburg, South Africa
The news API won the race!
First result to settle:
Latest News Headlines:
- The Best Laptop for Developers in 2024
- 10 Tips for a Productive Remote Work Setup
- Top 5 Programming Languages to Learn
```
