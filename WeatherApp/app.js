const
    weather = require('../MetaWeatherAPI/index')
    // inquirer = require('inquirer')

const locationWeather = (location) => {
    weather.woeid_by_query(location)
        .then(result=>{
            console.log(result)
        })
        .catch(err => console.log(err))
}

const lattLongWeather = (latt,long) => {
    weather.woeid_by_lattlong(latt,long)
        .then(result=>{
            console.log(result)
        })
        .catch(err => console.log(err))
}

const surroundingCitiesWeather = (location)=>{
    let lattLong = []
    let withinRange = []
    weather.woeid_by_query(location)
    .then(result=>{
        lattLong= result[0].latt_long.split(',')
        weather.woeid_by_lattlong(lattLong[0],lattLong[1])
        .then(result=>{
            result.forEach(city => {
                withinRange.push(city.distance)
            });
            //here is where we save the major cities within 50 miles
            console.log(withinRange)
        })
        .catch(err => console.log(err))


    })
    .catch(err => console.log(err))
    
    // lattLong = cityInfo[0].latt_long,
    // lattAndlong = lattLong.split(',')
    // console.log(lattAndlong)
}

module.exports = {
    locationWeather,lattLongWeather,surroundingCitiesWeather
}