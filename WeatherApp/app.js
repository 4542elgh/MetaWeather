const
    weather = require('../MetaWeatherAPI/index'),
    inquirer = require('inquirer'),
    Table = require('cli-table2'),
    colors = require('colors')

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
    if(meters === 0){
        return 0 
    }
    else
    return (meters / 1609.34).toPrecision(4)
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
//used an empty parameter here in order to reuse this function for another feature
function foreCastForCitiesInRange(cities, weatherToSearch = []) {
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
                    distance: city.distance, //need the distance in order to order them from closest to farthest
                    conditions: result.consolidated_weather[0].weather_state_name,
                    temperature: celsiusToFarenheit(result.consolidated_weather[0].the_temp) + '°F',
                    minTemp: celsiusToFarenheit(result.consolidated_weather[0].min_temp),
                    maxTemp: celsiusToFarenheit(result.consolidated_weather[0].max_temp), 
                    humidity: result.consolidated_weather[0].humidity + '%',
                    air_pressure:result.consolidated_weather[0].air_pressure.toPrecision(4) + ' mb'
                })

                //reorganize the list of cities by distance in ascending order, 
                //since our response might shuffle them.
                if (cities.length === citiesInfo.length ) {
                   
                   if(weatherToSearch.length == 0)
                    print(sortResults(citiesInfo))

                    else{
                        searchWeather(sortResults(citiesInfo), weatherToSearch)
                    }
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
//----------------Search by Weather and Range Starts Here-----------------


const selectWeather = (result) => {
    return inquirer.prompt([{
        type: 'checkbox',
        message: 'Select weather conditions to be searched',
        name: 'miles',
        choices: ['Clear', 'Light Cloud', 'Heavy Cloud', 'Showers', 'Light Rain', 'Heavy Rain', 'Thunderstorm', 'Hail', 'Sleet', 'Snow'],
        validate: (answer) => {
            if (answer.length > 0) {

                return true

            } else {
                return 'Error: You must select at least one choice'
            }
        }

    }]).then((answers) => {
        
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

        }]).then((input) => {

            
            const
                range = milesToMeters(parseInt(input.miles[0])),
                withinRange = [],
                selectedWeather =[]

                answers.miles.forEach(weather =>{selectedWeather.push(weather)})

            result.forEach(city => {
                //the selected range will be used to get all the forecast of the cities
                if (city.distance <= range)
                    withinRange.push(city)
            })
            
                foreCastForCitiesInRange(withinRange,selectedWeather)

        })


    })

}


const searchWeatherWithinRange = (location) => {
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

                        selectWeather(result)

                    })
                    .catch(err => console.log(err))

            }
        })
        .catch(err => console.log(err))

}

function searchWeather(cities, weather){

    result = []
    cities.forEach(city=>{

        for (let index = 0; index < weather.length; index++) {
            if(city.conditions === weather[index])
            result.push(city)
            
        }
    })
    if(result.length === 0){
        console.log('Sorry there are no results for the miles and weather condition specified.')
    }
    else{
    print(result)
    }
}

function print(result){

    let table = new Table({
        chars: { 'top': '═'.magenta , 'top-mid': '╤'.magenta , 'top-left': '╔'.magenta , 'top-right': '╗'.magenta
               , 'bottom': '═'.magenta , 'bottom-mid': '╧'.magenta , 'bottom-left': '╚'.magenta , 'bottom-right': '╝'.magenta
               , 'left': '║'.magenta , 'left-mid': '╟'.magenta , 'mid': '─'.magenta , 'mid-mid': '┼'.magenta
               , 'right': '║'.magenta , 'right-mid': '╢'.magenta , 'middle': '│'.magenta },

        head: ['CITY'.cyan.bold, 'DISTANCE'.cyan.bold, 'CONDITIONS'.cyan.bold,'TEMPATURE'.cyan.bold,'LOW'.cyan.bold,'HIGH'.cyan.bold,'HUMIDITY'.cyan.bold,'AIR PRESSURE'.cyan.bold ]
      });
       
      result.forEach(city =>{
        table.push([city.cityName.white, city.distance.white, city.conditions.white,city.temperature.white,city.minTemp.white, city.maxTemp.white, city.humidity.white, city.air_pressure.white])
      })

      console.log(table.toString())

}
module.exports = {
    locationWeather,
    lattLongWeather,
    surroundingCitiesWeather,
    searchWeatherWithinRange
}