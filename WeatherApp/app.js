const
    weather = require('../MetaWeatherAPI/index')
    inquirer = require('inquirer')
    Table = require('cli-table2')
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

const celsiusToFahrenheit = (degree) => {
    return Math.round(degree * 1.8 + 32)
}

const filterForecast = (selections, response) => {
    let filteredForecast = {}

    for (let i = 0; i < selections.length; i++) {
        switch (selections[i]) {
            case 'forecast':
                filteredForecast['condition'] = response.weather_state_name
                break;
            case 'temperature':
                filteredForecast['temperature'] = celsiusToFahrenheit(response.the_temp) + '°F'
                filteredForecast['low'] = celsiusToFahrenheit(response.min_temp) + '°F'
                filteredForecast['high'] = celsiusToFahrenheit(response.max_temp) + '°F'
                break;
            case 'air':
                filteredForecast['humidity'] = response.humidity.toString() + '%'
                filteredForecast['air pressure'] = Math.round(response.air_pressure).toString() + ' mb'
                break;
            case 'wind':
                filteredForecast['wind'] = Math.round(response.wind_speed).toString() + ' mph ' + response.wind_direction_compass
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
                console.log(datesTable(dateArr).toString())
            }, 5000)
        })
}

//note: write a better for key in object
const datesTable = (info) => {
    let headers = [{content: 'DATE'.cyan.bold, hAlign:'center'}]
    let temp = info[0].output
    let row = []
    let data

    for(let key in temp) {
        if(temp.hasOwnProperty(key)) {
            headers.push({content: key.toUpperCase().cyan.bold, hAlign:'center'})
        }
    }

    let table = new Table({
        chars: { 'top': '═'.magenta , 'top-mid': '╤'.magenta , 'top-left': '╔'.magenta , 'top-right': '╗'.magenta
            , 'bottom': '═'.magenta , 'bottom-mid': '╧'.magenta , 'bottom-left': '╚'.magenta , 'bottom-right': '╝'.magenta
            , 'left': '║'.magenta , 'left-mid': '╟'.magenta , 'mid': '─'.magenta , 'mid-mid': '┼'.magenta
            , 'right': '║'.magenta , 'right-mid': '╢'.magenta , 'middle': '│'.magenta },

        head: headers
    });

    info.forEach(element => {
        row = []
        row.push({content: element.date, hAlign:'center'})
        temp = element.output
        for(let key in temp) {
            if(temp.hasOwnProperty(key)) {
                if (typeof temp[key] === 'object') {
                    for (let key2 in temp[key]) {
                        if (temp[key].hasOwnProperty(key2)) {
                            data = temp[key][key2]
                        }
                    }
                }
                else {
                    data = temp[key]
                    // row.push(temp[key])
                }
            }
            row.push({content: data, hAlign:'center'})
        }    
        table.push(row)
    })
    return table;
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
            output: filteredForecast
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