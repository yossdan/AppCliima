document.getElementById('city').addEventListener('input', function () { 
    var city = this.value;
    getWeather(city);
    document.getElementById('ciudad').textContent = city; // Actualizar el div oculto
});

document.getElementById('local-weather-btn').addEventListener('click', function () {
    getLocationAndWeather();
});

async function getWeather(city) {
    try {
        console.log('NOMBRE DE LA CIUDAD:', city);
        document.getElementById('ciudad').textContent = city;

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            },
        });
        
        const timezoneOffset = response.data.city.timezone; // Obtener el offset de la zona horaria
        updateLocalTime(timezoneOffset);

        const currentTemperature = response.data.list[0].main.temp;
        document.querySelector('.weather-temp').textContent = Math.round(currentTemperature) + 'ºC';

        const forecastData = response.data.list;
        const dailyForecast = {};

        forecastData.forEach((data) => {
            const day = new Date(data.dt * 1000).toLocaleDateString('es-ES', { weekday: 'long' });
            if (!dailyForecast[day]) {
                dailyForecast[day] = {
                    minTemp: data.main.temp_min,
                    maxTemp: data.main.temp_max,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    icon: data.weather[0].icon,
                };
            } else {
                dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, data.main.temp_min);
                dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, data.main.temp_max);
            }
        });

        document.querySelector('.date-dayname').textContent = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
        const date = new Date().toUTCString();
        const extractedDateTime = date.slice(5, 16);
        document.querySelector('.date-day').textContent = extractedDateTime.toLocaleString('es-ES');

        const currentWeatherIconCode = dailyForecast[new Date().toLocaleDateString('es-ES', { weekday: 'long' })].icon;
        const weatherIconElement = document.querySelector('.weather-icon');
        weatherIconElement.innerHTML = getWeatherIcon(currentWeatherIconCode);

        document.querySelector('.location').textContent = response.data.city.name;
        document.querySelector('.weather-desc').textContent = dailyForecast[new Date().toLocaleDateString('es-ES', { weekday: 'long' })].description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        document.querySelector('.humidity .value').textContent = dailyForecast[new Date().toLocaleDateString('es-ES', { weekday: 'long' })].humidity + ' %';
        document.querySelector('.wind .value').textContent = dailyForecast[new Date().toLocaleDateString('es-ES', { weekday: 'long' })].windSpeed + ' m/s';

        const dayElements = document.querySelectorAll('.day-name');
        const tempElements = document.querySelectorAll('.day-temp');
        const iconElements = document.querySelectorAll('.day-icon');

        dayElements.forEach((dayElement, index) => {
            const day = Object.keys(dailyForecast)[index];
            const data = dailyForecast[day];
            dayElement.textContent = day;
            tempElements[index].textContent = `${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º`;
            iconElements[index].innerHTML = getWeatherIcon(data.icon);
        });
        

        // Obtener la zona horaria y hora local de la ciudad
        const timezone = response.data.city.timezone;
        updateLocalTime(timezone); // Actualiza la hora al nuevo timezone
        const localTime = new Date((Date.now() / 1000) + timezone); // Convierte UTC a hora local
        const hours = localTime.getHours();

        // Determinar si es de día o de noche
        // Agregar efectos de clima basados en la condición actual
        const weatherDescription = dailyForecast[new Date().toLocaleDateString('es-ES', { weekday: 'long' })].description.toLowerCase();
        const weatherSide = document.querySelector('.weather-side');
        const particlesContainer = document.querySelector('.particles');

        // Eliminar cualquier efecto de clima existente
        particlesContainer.innerHTML = '';

        // Update the gradient based on weather conditions
        if (weatherDescription.includes('rain') || weatherDescription.includes('cloud')) {
            // Gray for rainy or cloudy weather
            document.documentElement.style.setProperty('--gradient', 'linear-gradient(135deg, #b0bec5 10%, #3e3e3e 100%)');
            createRainEffect(particlesContainer);
        } else if (weatherDescription.includes('snow')) {
            // Light blue for snowy weather
            document.documentElement.style.setProperty('--gradient', 'linear-gradient(135deg, #f0f8ff 10%, #92a8d1 100%)');
            createSnowEffect(particlesContainer);
        } else if (weatherDescription.includes('hurricane') || weatherDescription.includes('storm')) {
            // Dark blue/green for hurricane or storm
            document.documentElement.style.setProperty('--gradient', 'linear-gradient(135deg, #4e8e8e 10%, #1a3d3f 100%)');
            createHurricaneEffect(particlesContainer);
        } else if (new Date().getHours() >= 18 || new Date().getHours() < 6) {
            // Night Mode
            document.documentElement.style.setProperty('--gradient', 'linear-gradient(135deg, #2c3e50 10%, #34495e 100%)');
            weatherSide.classList.add('night');
        } else {
            // Day Mode
            document.documentElement.style.setProperty('--gradient', 'linear-gradient(135deg, #72EDF2 10%, #5151E5 100%)');
            weatherSide.classList.add('day');
        }

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

function getWeatherIcon(iconCode) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    const iconSize = '@2x.png';
    return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

// Funciones para crear los efectos de clima
function createRainEffect(container) {
    for (let i = 0; i < 100; i++) {
        let drop = document.createElement('div');
        drop.classList.add('rain-drop');
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
        container.appendChild(drop);
    }
}

function createSnowEffect(container) {
    for (let i = 0; i < 100; i++) {
        let snowflake = document.createElement('div');
        snowflake.classList.add('snow-flake');
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        container.appendChild(snowflake);
    }
}

function createHurricaneEffect(container) {
    let hurricane = document.createElement('div');
    hurricane.classList.add('hurricane');
    container.appendChild(hurricane);
}

function createFogEffect(container) {
    for (let i = 0; i < 50; i++) {
        let fog = document.createElement('div');
        fog.classList.add('fog');
        fog.style.left = `${Math.random() * 100}vw`;
        fog.style.animationDuration = `${Math.random() * 5 + 3}s`;
        container.appendChild(fog);
    }
}

function createCloudEffect(container) {
    for (let i = 0; i < 50; i++) {
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        cloud.style.left = `${Math.random() * 100}vw`;
        cloud.style.animationDuration = `${Math.random() * 5 + 3}s`;
        container.appendChild(cloud);
    }
}

function getLocationAndWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log('Coordenadas:', lat, lon);

            // Usamos el geocodificador de Google Maps para obtener la dirección
            const geocoder = new google.maps.Geocoder();
            const latLng = new google.maps.LatLng(lat, lon);
            geocoder.geocode({ 'location': latLng }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const city = results[0].address_components.find(component => component.types.includes('locality')).long_name;
                    getWeather(city);  // Llamar a la función de clima para la ciudad
                    document.getElementById('ciudad').textContent = city;  // Actualizar el div con la ciudad
                } else {
                    alert('No se pudo determinar la ubicación. Intenta nuevamente.');
                }
            });
        }, function () {
            alert('No se pudo obtener la ubicación. Asegúrate de que los permisos de ubicación estén habilitados.');
        });
    } else {
        alert('La geolocalización no está soportada por este navegador.');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    getWeather('Tixkokob');
});



function updateLocalTime(timezoneOffset) {
    if (window.localTimeInterval) {
        clearInterval(window.localTimeInterval);
    }

    window.localTimeInterval = setInterval(() => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utc + timezoneOffset * 1000);

        const hours = localTime.getHours().toString().padStart(2, '0');
        const minutes = localTime.getMinutes().toString().padStart(2, '0');
        const seconds = localTime.getSeconds().toString().padStart(2, '0');

        document.getElementById('hora_local').textContent = `Hora local: ${hours}:${minutes}:${seconds}`;
    }, 1000);
}


const ciudadDiv = document.getElementById('ciudad');
const observer = new MutationObserver(function(mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const city = ciudadDiv.textContent;
            getWeather(city);
        }
    }
});

observer.observe(ciudadDiv, { childList: true });

document.getElementById('city-input').addEventListener('input', function() {
    const city = this.value;
    document.getElementById('ciudad').textContent = city;
});