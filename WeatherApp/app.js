const
    weather = require('../MetaWeatherAPI/index')
// inquirer = require('inquirer')

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

const surroundingCitiesWeather = (location) => {


    let
        lattLong = [],
        withinRange = [],
        citiesWeather = []

    weather.woeid_by_query(location)
        .then(result => {
            lattLong = result[0].latt_long.split(',')
            weather.woeid_by_lattlong(lattLong[0], lattLong[1])
                .then(result => {
                    result.forEach(city => {
                        //100 miles will be the default which is equivalent to 160934 meters
                        //since the api only very limited major cities as returned values
                        if (city.distance <= 160934)
                            withinRange.push(city)
                    });
                    // console.log(withinRange)
                    //getting the weather info for each city in range using the WOEID(Where on Earth ID)
                    withinRange.forEach(city => {
                        weather.get_weather_by_woeid(city.woeid)
                            //this returns the 5 day forecast for all the cities not in the particular order given 
                            //but as soon as the API has a response for that city.
                            //Also we only want the forecasts of the day the query is made so the other days are of no cosequence
                            .then(result => {
                                //the numbers and formatting the times of some properties
                                let T = result.sun_rise.indexOf('T')
                                let sunRise = result.sun_rise.slice(T + 1 ,T + 6) + ' AM'
                                if( sunRise[0] === '0')
                                sunRise = sunRise.slice(1)

                                T = result.sun_set.indexOf('T')
                                time = result.sun_set.slice(T + 1 ,T + 6) + ' PM'
                                
                                //coverting military time to 12 hr format
                                let hour = parseInt(time.slice(0,2)) % 12
                                
                                let sunSet = hour + time.slice(2)
                                

                                citiesWeather.push({
                                    cityName: result.title,
                                    distance: city.distance,
                                    conditions: result.consolidated_weather[0].weather_state_name,
                                    temperature:result.consolidated_weather[0].the_temp.toPrecision(4),
                                    minTemp:result.consolidated_weather[0].min_temp.toPrecision(4),
                                    maxTemp:result.consolidated_weather[0].max_temp.toPrecision(4),//temperatures are in celsius
                                    windDirection: result.consolidated_weather[0].wind_direction_compass,
                                    windSpeed: result.consolidated_weather[0].wind_speed.toPrecision(3),
                                    humidity: result.consolidated_weather[0].humidity,
                                    visibility: result.consolidated_weather[0].visibility.toPrecision(4),
                                    sunRise: sunRise,
                                    sunSet: sunSet
                                })

                                //reorganize the list of cities by distance in ascending order, 
                                //since our response might shuffle them.
                                if (withinRange.length === citiesWeather.length) {
                                    let
                                        swapped = true,
                                        j = 0,
                                        temp = {}

                                    while (swapped) {
                                        swapped = false
                                        j++
                                        for (let k = 0; k < citiesWeather.length - j; k++) {

                                            if (citiesWeather[k].distance > citiesWeather[k + 1].distance) {
                                                swapped = true
                                                temp = citiesWeather[k]
                                                citiesWeather[k] = citiesWeather[k + 1]
                                                citiesWeather[k + 1] = temp
                                            }
                                        }
                                    }
                                    console.log(citiesWeather)
                                }


                            })
                            .catch(err => console.log(err))
                    })

                })
                .catch(err => console.log(err))


        })
        .catch(err => console.log(err))


}



module.exports = {
    locationWeather,
    lattLongWeather,
    surroundingCitiesWeather
}