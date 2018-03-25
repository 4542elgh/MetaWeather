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
        distance: city.distance, //need the distance in order to arrange them from closest to farthest
        conditions: result.consolidated_weather[0].weather_state_name,
        temperature: utilities.CtoF(result.consolidated_weather[0].the_temp) + '°F',
        minTemp: utilities.CtoF(result.consolidated_weather[0].min_temp) + '°F' ,
        maxTemp: utilities.CtoF(result.consolidated_weather[0].max_temp) + '°F',
        humidity: result.consolidated_weather[0].humidity + '%',
        wind: result.consolidated_weather[0].wind_speed.toPrecision(2) +"mph " + result.consolidated_weather[0].wind_direction_compass,
        air_pressure:result.consolidated_weather[0].air_pressure.toPrecision(4) + ' mb'
    }
}

const checkWeather = (cities,weather)=>{
    let
        result = []
    //loop through the cities within radius and check if that
    //city has any of of the weather conditions specified by the user
    cities.forEach(city=>{
        weather.forEach((item,index)=>{
            if (city.conditions === weather[index]){
                result.push(city)
            }
        })
    })

    return result;
}

/*Here result is the surrounding cities given by the API
answers.miles is the selected weather condition by the user and 
input is the selected radius by the user */
const checkRadius = (result,answers, input)=>{
    const
        range = utilities.milesToMeters(parseInt(input.miles)),
        withinRange = []
    

    result.forEach(city => {
        //the selected range will be used to get all the forecast of the cities
        if (city.distance <= range)
            withinRange.push(city)
    })
    //both of these are now returned after getting the cities withing radius
    return {withinRange:withinRange,selectedWeather:answers.miles}
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

        head: [{hAlign:'center',content:'CITY'.cyan.bold}, {hAlign:'center',content:'DISTANCE'.cyan.bold}, {hAlign:'center',content:'CONDITION'.cyan.bold},{hAlign:'center',content:'TEMPERATURE'.cyan.bold},{hAlign:'center',content:'LOW'.cyan.bold},{hAlign:'center',content:'HIGH'.cyan.bold},{hAlign:'center',content:'HUMIDITY'.cyan.bold},{hAlign:'center',content:'WIND'.cyan.bold}, {hAlign:'center',content:'AIR PRESSURE'.cyan.bold} ],

        
    });
    result.forEach(city =>{
        table.push([{hAlign:'center', content:city.cityName.cyan}, {hAlign:'center', content:city.distance.cyan}, {hAlign:'center', content:city.conditions.cyan},{hAlign:'center', content:city.temperature.cyan},{hAlign:'center', content:city.minTemp.cyan}, {hAlign:'center', content:city.maxTemp.cyan},{hAlign:'center', content:city.humidity.cyan},{hAlign:'center', content:city.wind.cyan}, {hAlign:'center', content:city.air_pressure.cyan}])
    })
    return table;
}

module.exports = {
    sortResults, table, citiesInfo, checkWeather, checkRadius, selectRange
}