const
    weather = require('../MetaWeatherAPI/index')
    inquirer = require('inquirer')

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

const celsiusToFahrenheit = (degree) => {
    return Math.round(degree * 1.8 + 32)
}

const filterForecast = (selections, response) => {
    let filteredForecast = {}

    for (let i = 0; i < selections.conditions.length; i++) {
        switch (selections.conditions[i]) {
            case 'forecast':
            filteredForecast['forecast'] = response.weather_state_name
                break;
            case 'temperature':
                let temperature = {
                    'high': celsiusToFahrenheit(response.min_temp),
                    'low': celsiusToFahrenheit(response.max_temp),
                }
                filteredForecast['temperature'] = temperature
                break;
            case 'air':
                let air_cond = {
                    'humidity': response.humidity.toString() + '%',
                    'air_pressure': Math.round(response.air_pressure).toString() + ' mb'
                }
                filteredForecast['air_cond'] = air_cond
                break;
            case 'wind':
                let wind_cond = {
                    'wind_speed': Math.round(response.wind_speed).toString() + ' mph',
                    'wind_dir': Math.round(response.wind_direction).toString() + '°'
                }
                filteredForecast['wind_cond'] = wind_cond
                break;
            case 'exit':
                return
        }
    }
    return filteredForecast
}

const filterSearch = (location) => {

    let conditions = ['forecast', 'temperature', 'air', 'wind', 'exit']
    let response

    weather.woeid_by_query(location)
        
        .then(result => {
            if (result.length === 0) {
                console.log(`No data for ${location}`)
                return
            }
            return weather.get_weather_by_woeid(result[0].woeid)
        })

        .then(forecasts => {
            response = forecasts.consolidated_weather[0]
            return inquirer.prompt([{
                type: 'checkbox',
                message: 'Select the conditions to display:\n',
                name: 'conditions',
                choices: conditions,
                validate: (filters) => {
                    if (filters.length > 1 && filters.indexOf('exit') > -1) {
                        return 'Only select exit to return to main menu'
                    }
                    if (filters.length != 0) {
                        return true
                    } 
                    return 'Not a valid selection'
                }
            }])
        })

        .then(selections => {
            let filteredForecast = filterForecast(selections, response)
            console.log(filteredForecast)
        })
}

module.exports = {
    locationWeather,lattLongWeather, filterSearch
}