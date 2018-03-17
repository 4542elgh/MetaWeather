const Table = require('cli-table2'),
    inquirer = require('inquirer')

const formatForecast = (dateStr, filteredForecast) => {
    let table = new Table({ style: { head: [], boder: [] } })
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

module.exports={
    formatForecast,getWeatherFilters,filterForecast,getDateRange
}