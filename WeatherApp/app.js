const
    weather = require('../MetaWeatherAPI/index'),
    inquirer = require('inquirer')

const locationWeather = (location) => {
    weather.woeid_by_query(location)
        .then(result => {
            console.log(result)
        })
        .catch(err => console.log(err))
}

const lattLongWeather = (latt, long) => {
    weather.woeid_by_lattlong(latt, long)
        .then(result => {
            console.log(result)
        })
        .catch(err => console.log(err))
}

const selectRange = (result) => {
    return inquirer.prompt([{
        type: 'checkbox',
        message: 'Select the range in miles to search',
        name: 'miles',
        choices: ['50', '100', '150', '200', '250', '300', '350'],
        validate: (answer) => {
            if (answer.length > 1 || answer.length === 0) {

                return 'Error: You must select 1 choice only'

            } else {
                return true
            }
        }

    }]).then((answers) => {
        const
            range = milesToMeters(parseInt(answers.miles[0])),
            withinRange = []

        result.forEach(city => {
            //the selected range will be used to get all the forecast of the cities
            if (city.distance <= range)
                withinRange.push(city)
        });

        foreCastForCitiesInRange(withinRange)
    })
}

//utility functions
function milesToMeters(miles) {
    return miles * 1609.34
}

function metersToMiles(meters) {
    return (meters / 1609.34).toPrecision(4)
}

function formattingTime(date) {
    //the numbers and formatting the times of some properties
    let T = date.indexOf('T')
    let time = date.slice(T + 1, T + 6)
    if (time[0] === '0') {
        time = time.slice(1)
        return time
    } else {
        //coverting military time to 12 hr format
        let hour = parseInt(time.slice(0, 2)) % 12
        time = hour + time.slice(2)
        return time
    }
}

function celsiusToFarenheit(celsius) {
    const farenheit = (celsius * (9 / 5) + 32).toPrecision(4)
    return farenheit
}

function sortResults(cities) {

    let
        swapped = true,
        j = 0,
        temp = {}

    while (swapped) {
        swapped = false
        j++
        for (let k = 0; k < cities.length - j; k++) {

            if (cities[k].distance > cities[k + 1].distance) {
                swapped = true
                temp = cities[k]
                cities[k] = cities[k + 1]
                cities[k + 1] = temp
            }
        }
    }
    cities.forEach(city => {
        city.distance = metersToMiles(city.distance) + ' miles'
    })

    return cities

}

function foreCastForCitiesInRange(cities) {
    const citiesInfo = []
    cities.forEach(city => {
        //getting the weather info for each city in range using the WOEID(Where on Earth ID)
        weather.get_weather_by_woeid(city.woeid)
            //this returns the 5 day forecast for all the cities not in the particular order given 
            //but as soon as the API has a response for that city.
            //Also we only want the forecasts of the day the query is made so the other days are of no cosequence
            .then(result => {

                citiesInfo.push({
                    cityName: result.title,
                    distance: city.distance,
                    conditions: result.consolidated_weather[0].weather_state_name,
                    temperature: celsiusToFarenheit(result.consolidated_weather[0].the_temp),
                    minTemp: celsiusToFarenheit(result.consolidated_weather[0].min_temp),
                    maxTemp: celsiusToFarenheit(result.consolidated_weather[0].max_temp), //temperatures are in celsius
                    windDirection: result.consolidated_weather[0].wind_direction_compass,
                    windSpeed: result.consolidated_weather[0].wind_speed.toPrecision(3),
                    humidity: result.consolidated_weather[0].humidity,
                    visibility: result.consolidated_weather[0].visibility.toPrecision(4),
                    sunRise: formattingTime(result.sun_rise) + ' AM',
                    sunSet: formattingTime(result.sun_set) + ' PM',
                })

                //reorganize the list of cities by distance in ascending order, 
                //since our response might shuffle them.
                if (cities.length === citiesInfo.length) {
                    console.log(sortResults(citiesInfo))
                }


            })
            .catch(err => console.log(err))
    })

}
const surroundingCitiesWeather = (location) => {
    let
        lattLong = []


    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0)
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)

            else {
                lattLong = result[0].latt_long.split(',')
                weather.woeid_by_lattlong(lattLong[0], lattLong[1])
                    .then(result => {

                        selectRange(result)



                    })
                    .catch(err => console.log(err))

            }
        })
        .catch(err => console.log(err))


}



module.exports = {
    locationWeather,
    lattLongWeather,
    surroundingCitiesWeather
}