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

    for (let i = 0; i < selections.length; i++) {
        switch (selections[i]) {
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

const getDateRange = (dateRange) => {
    let response = []
    if(dateRange !== null) {
        let currentDate = new Date(dateRange[0])
        let endDate = new Date(dateRange[1])
        let dayCounter = 1

        while(currentDate <= endDate) {
            response.push({
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(),
                day: currentDate.getDate()
            })
            currentDate.setDate(currentDate.getDate() + (dayCounter++))
        }
    }
    return response  
}

const forecastAtDay = (response, selections, range=0) => {
    let forecastCopy

    response.then(forecasts => {
        if(range === 0) {
            forecastCopy = forecasts.consolidated_weather[0]
        }
        else {
            forecastCopy = forecasts[0]
        }

        let filteredForecast = filterForecast(selections, forecastCopy)
        console.log(filteredForecast)
    })
}

const getFilters = () => {
    let conditions = ['forecast', 'temperature', 'air', 'wind', 'exit']

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
}

const getForecasts = (location, days, selections) => {
    weather.woeid_by_query(location)
        
        .then(result => {
            //if location not found
            if (result.length === 0) {
                console.log(`No data for ${location}`)
                return
            }

            //no date range specified
            if(days.length === 0) {
                forecastAtDay(weather.get_weather_by_woeid(result[0].woeid), selections)
            }

            days.forEach(day => {
                forecastAtDay(weather.get_weather_by_woeid_at_date(result[0].woeid, 
                    day.year, day.month + 1, day.day), selections, 1)
            })
        })
}

const filterSearch = (location, dateRange) => {
    let days = getDateRange(dateRange)

    getFilters()
        .then(filters => {
            getForecasts(location, days, filters.conditions)
        })
    
}

module.exports = {
    locationWeather,lattLongWeather, filterSearch
}