const utilities = require('../utils/utilities'),
    Table = require('cli-table2'),
    colors = require('colors')

const sortResults = (cities)=> {
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
        city.distance = utilities.metersToMiles(city.distance) + ' miles'
    })
    return cities
}

const citiesInfo = (result,city)=>{
    return {
        cityName: result.title,
        distance: city.distance, //need the distance in order to order them from closest to farthest
        conditions: result.consolidated_weather[0].weather_state_name,
        temperature: utilities.CtoF(result.consolidated_weather[0].the_temp) + '°F',
        minTemp: utilities.CtoF(result.consolidated_weather[0].min_temp) + '°F' ,
        maxTemp: utilities.CtoF(result.consolidated_weather[0].max_temp) + '°F',
        humidity: result.consolidated_weather[0].humidity + '%',
        air_pressure:result.consolidated_weather[0].air_pressure.toPrecision(4) + ' mb'
    }
}

const searchWeather = (cities,weather)=>{
    let
        result = []

    cities.forEach(city=>{
        weather.forEach((item,index)=>{
            if (city.conditions === weather[index]){
                result.push(city)
            }
        })
    })

    return result;
}

const selectWeather = (result,answers, input)=>{
    const
        range = utilities.milesToMeters(parseInt(input.miles)),
        withinRange = [],
        selectedWeather =[]

    answers.miles.forEach(weather =>{
        selectedWeather.push(weather)
    })

    result.forEach(city => {
        //the selected range will be used to get all the forecast of the cities
        if (city.distance <= range)
            withinRange.push(city)
    })

    return {withinRange:withinRange,selectedWeather:selectedWeather}
}

const selectRange = (result,answers)=>{
    const
        range = utilities.milesToMeters(parseInt(answers.miles)),
        withinRange = []

    result.forEach(city => {
        //the selected range will be used to get all the forecast of the cities
        if (city.distance <= range){
            withinRange.push(city)
        }
    });

    return withinRange
}

const table = (result)=>{
    let table = new Table({
        chars: { 'top': '═'.magenta , 'top-mid': '╤'.magenta , 'top-left': '╔'.magenta , 'top-right': '╗'.magenta
            , 'bottom': '═'.magenta , 'bottom-mid': '╧'.magenta , 'bottom-left': '╚'.magenta , 'bottom-right': '╝'.magenta
            , 'left': '║'.magenta , 'left-mid': '╟'.magenta , 'mid': '─'.magenta , 'mid-mid': '┼'.magenta
            , 'right': '║'.magenta , 'right-mid': '╢'.magenta , 'middle': '│'.magenta },

        head: ['CITY'.cyan.bold, 'DISTANCE'.cyan.bold, 'CONDITIONS'.cyan.bold,'TEMPERATURE'.cyan.bold,'LOW'.cyan.bold,'HIGH'.cyan.bold,'HUMIDITY'.cyan.bold,'AIR PRESSURE'.cyan.bold ]
    });
    result.forEach(city =>{
        table.push([city.cityName.white, city.distance.white, city.conditions.white,city.temperature.white,city.minTemp.white, city.maxTemp.white, city.humidity.white, city.air_pressure.white])
    })
    return table;
}

module.exports = {
    sortResults,table,citiesInfo,searchWeather,selectWeather,selectRange
}