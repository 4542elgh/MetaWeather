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

const history = () => {
    //add method here
}

module.exports = {
    locationWeather,lattLongWeather,
    history
}