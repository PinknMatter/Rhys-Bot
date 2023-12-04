const axios = require('axios');

async function weather(message){
    const args = message.content.split(' ').slice(1); // Get the arguments from the message
    const city = args[0]; // The city name is the first argument
    let day = args[1] ? args[1].toLowerCase() : null; // The day is the second argument (if provided)

    // Map the days of the week to array indices
    const dayToIndex = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
    }

    // If no day provided, set it as today
    if (!day) {
        const today = new Date();
        day = Object.keys(dayToIndex)[today.getDay()];
    }

    const index = dayToIndex[day];

   try {
        const responseForecast = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=7&key=${process.env.WEATHERBIT_API_KEY}`);
        if(responseForecast.status !== 200){
            throw new Error("Invalid city name");
        }
        const forecastData = responseForecast.data.data;

        const weatherInfo = `Weather for ${city} on ${day.charAt(0).toUpperCase() + day.slice(1)}: ${forecastData[index].weather.description}. Temperature: ${forecastData[index].temp}°C. Snow depth: ${forecastData[index].snow_depth} cm. (Not counting blowed snow)`;

        message.channel.send(weatherInfo);
    } 
    catch (error) {
        // This will catch any errors, such as the city not being found
        message.channel.send(`Sorry, I couldn't find weather information for "${city}" on "${day}".`);
    }
}

module.exports = weather;