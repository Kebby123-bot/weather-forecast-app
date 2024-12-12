const apiKey = '8b04c255b9fe20458865e8a3db5b6036';

document.addEventListener('DOMContentLoaded', () => {
    // Delay fetching the weather for 4 seconds
    setTimeout(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            }, handleGeolocationError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }, 4000); // 4000 milliseconds = 4 seconds
});

function handleGeolocationError(error) {
    console.error("Geolocation error:", error);
    alert("Unable to retrieve your location. Please enter a city manually.");
}

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        
        const data = await response.json();
        displayCurrentWeather(data);
        setDynamicBackground(data.weather[0].main.toLowerCase());
        displayLocalTime(data.timezone);
        getForecast(data.name);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data. Please try again.");
    }
}

document.getElementById('getWeather').addEventListener('click', async () => {
    const city = document.getElementById('city').value;
    if (city) {
        await getWeather(city);
    }
});

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        
        if (!response.ok) {
            if (response.status === 404) {
                alert(`Location "${city}" not found. Please try another search.`);
            }
            throw new Error("Location not found");
        }
        
        const data = await response.json();
        displayCurrentWeather(data);
        setDynamicBackground(data.weather[0].main.toLowerCase());
        displayLocalTime(data.timezone);
        getForecast(city);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function displayCurrentWeather(data) {
    const temperature = data.main.temp;
    const condition = data.weather[0].description;
    const location = data.name;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.getElementById('weatherResult').innerHTML = ` 
        <h2>${location}</h2>
        <img src="${iconUrl}" alt="${condition}" style="width: 80px; height: 80px;">
        <p><i class="fas fa-thermometer-half"></i> <strong>${temperature}°C</strong></p>
        <p><i class="fas fa-tint"></i> <strong>Humidity:</strong> ${humidity}%</p>
        <p><i class="fas fa-wind"></i> <strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        <p><strong>Condition:</strong> ${condition.charAt(0).toUpperCase() + condition.slice(1)}</p>
    `;
}

function setDynamicBackground(weatherCondition) {
    document.body.className = ''; // Reset previous class
    if (weatherCondition.includes('sunny') || weatherCondition.includes('clear')) {
        document.body.classList.add('sunny');
    } else if (weatherCondition.includes('cloud')) {
        document.body.classList.add('cloudy');
    } else if (weatherCondition.includes('rain')) {
        document.body.classList.add('rainy');
    } else if (weatherCondition.includes('snow')) {
        document.body.classList.add('snowy');
    } else {
        document.body.classList.add('clear');
    }
}

function displayLocalTime(timezoneOffset) {
    const localTimeContainer = document.getElementById('localTime');
    
    const updateLocalTime = () => {
        const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const localTime = new Date(utcTime + timezoneOffset * 1000);
        localTimeContainer.textContent = `Local Time: ${localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    };
    
    updateLocalTime(); 
    setInterval(updateLocalTime, 1000);
}

// Function to fetch and display forecast data
async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch forecast data");
        }
        
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        alert("Error fetching forecast data. Please try again.");
    }
}

function displayForecast(data) {
    const forecastItems = document.getElementById('forecastItems');
    forecastItems.innerHTML = ''; 

    let dailyData = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // Get the date part only (YYYY-MM-DD format)
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

    Object.keys(dailyData).slice(0, 5).forEach(date => { 
        const dayData = dailyData[date];
        const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 1) / dayData.length;
        const condition = dayData[0].weather[0].description;
        const icon = dayData[0].weather[0].icon;

        // Convert date to a readable format with day and month
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });

        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');
        dayElement.innerHTML = `
            <p><strong>${formattedDate}</strong></p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${condition}">
            <p>${Math.round(avgTemp)}°C</p>
            <p>${condition.charAt(0).toUpperCase() + condition.slice(1)}</p>
        `;
        forecastItems.appendChild(dayElement);
    });
}

