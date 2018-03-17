const
    weather = require('../MetaWeatherAPI/index')
inquirer = require('inquirer')
Table = require('cli-table2')

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
                let air = {
                    'humidity': response.humidity.toString() + '%',
                    'air_pressure': Math.round(response.air_pressure).toString() + ' mb'
                }
                filteredForecast['air'] = air
                break;
            case 'wind':
                let wind = {
                    'wind_speed': Math.round(response.wind_speed).toString() + ' mph',
                    'wind_dir': Math.round(response.wind_direction).toString() + '°'
                }
                filteredForecast['wind'] = wind
                break;
            case 'exit':
                return
        }
    }
    return filteredForecast
}

// creates the array of dates
const getDateRange = (dateRange) => {
    let response = []
    if (dateRange !== null) {
        let currentDate = new Date(dateRange[0])
        let endDate = new Date(dateRange[1])

        while (currentDate <= endDate) {
            response.push({
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(),
                day: currentDate.getDate()
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }
    }
    return response
}

// gets forecasts of location
const getForecasts = (location, days, selections) => {
    weather.woeid_by_query(location)

        .then(result => {
            let date = new Date()
            let dateStr = ''
            let dateArr = []

            //if location not found
            if (result.length === 0) {
                console.log(`No data for ${location}`)
                return
            }

            //no date range specified
            if (days.length === 0) {
                dateStr = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
                printForecast(weather.get_weather_by_woeid(result[0].woeid), selections, dateStr, dateArr)
            }

            days.forEach(day => {
                dateStr = `${day.month + 1}-${day.day}-${day.year}`
                printForecast(weather.get_weather_by_woeid_at_date(result[0].woeid,
                    day.year, day.month + 1, day.day), selections, dateStr, dateArr, 1)
            })

            //find a better interval
            //currently this is a hack to allow for the printing of the date range or today's date
            setTimeout(() => {
                dateArr.sort((a, b) => {
                    let A = new Date(a.date),
                        B = new Date(b.date)

                    if(A < B) return -1
                    if(A > B) return 1
                    return 0
                })
                dateArr.forEach(index => {
                    console.log(index.output)
                })
            }, 5000)
        })
}

// formats print
const formatForecast = (dateStr, filteredForecast) => {
    let table = new Table({ style: { head: [], border: [] } })
    table.push([{
        colSpan: 2, content: `${dateStr}`
    }])
    for (let key in filteredForecast) {
        if (filteredForecast.hasOwnProperty(key)) {
            if (typeof filteredForecast[key] === 'object') {
                for (let key2 in filteredForecast[key]) {
                    if (filteredForecast[key].hasOwnProperty(key2)) {
                        table.push([
                            `${key2}`, `${filteredForecast[key][key2]}`
                        ])
                    }
                }
            }
            else {
                table.push([
                    `${key}`, `${filteredForecast[key]}`
                ])
            }
        }
    }
    return table
}

const printForecast = (response, selections, dateStr, dateArr, range = 0) => {
    let forecastCopy
    let output

    response.then(forecasts => {
        if (range === 0) {
            forecastCopy = forecasts.consolidated_weather[0]
        }
        else {
            forecastCopy = forecasts[0]
        }

        let filteredForecast = filterForecast(selections, forecastCopy)
        // console.log(formatForecast(dateStr, filteredForecast).toString())

        dateArr.push({
            date: dateStr,
            output: formatForecast(dateStr, filteredForecast).toString()
        })
    }).catch(err => {
        console.log(err)
    })

}

// gives inquirer prompt with all filters
const getWeatherFilters = () => {
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

// wrapper for search
const filterSearch = (location, dateRange) => {
    let days = getDateRange(dateRange)

    getWeatherFilters()
        .then(filters => {
            getForecasts(location, days, filters.conditions)
        })

}

module.exports = {
    locationWeather, lattLongWeather, filterSearch
}