const
    utilities = require('../utils/utilities'),
    Table = require('cli-table2')

const filterForecast = (selections, response) => {
    let filteredForecast = {}

    for (let i = 0; i < selections.length; i++) {
        switch (selections[i]) {
            case 'forecast':
                filteredForecast['condition'] = response.weather_state_name
                break;
            case 'temperature':
                filteredForecast['temperature'] = utilities.CtoF(response.the_temp) + '°F'
                filteredForecast['low'] = utilities.CtoF(response.min_temp) + '°F'
                filteredForecast['high'] = utilities.CtoF(response.max_temp) + '°F'
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

const datesTable = (info) => {
    let headers = [{ content: 'DATE'.cyan.bold, hAlign: 'center' }]
    let temp = info[0].output
    let row = []
    let data

    for (let key in temp) {
        if (temp.hasOwnProperty(key)) {
            headers.push({ content: key.toUpperCase().cyan.bold, hAlign: 'center' })
        }
    }

    let table = new Table({
        chars: {
            'top': '═'.magenta, 'top-mid': '╤'.magenta, 'top-left': '╔'.magenta, 'top-right': '╗'.magenta
            , 'bottom': '═'.magenta, 'bottom-mid': '╧'.magenta, 'bottom-left': '╚'.magenta, 'bottom-right': '╝'.magenta
            , 'left': '║'.magenta, 'left-mid': '╟'.magenta, 'mid': '─'.magenta, 'mid-mid': '┼'.magenta
            , 'right': '║'.magenta, 'right-mid': '╢'.magenta, 'middle': '│'.magenta
        },

        head: headers
    });

    info.forEach(element => {
        row = []
        row.push({ content: element.date, hAlign: 'center' })
        temp = element.output
        for (let key in temp) {
            if (temp.hasOwnProperty(key)) {
                data = temp[key]
            }
            row.push({ content: data, hAlign: 'center' })
        }
        table.push(row)
    })
    return table;
}

const getDateRange = (dateRange) => {
    let response = []
    let currentDate = new Date()
    let startDate = new Date(dateRange[0])
    let endDate = new Date(dateRange[1])

    if ((dateRange !== null) && (startDate <= currentDate) && (endDate <= currentDate)) {

        while (startDate <= endDate) {
            response.push({
                year: startDate.getFullYear(),
                month: startDate.getMonth(),
                day: startDate.getDate()
            })
            startDate.setDate(startDate.getDate() + 1)
        }
    }
    return response
}


module.exports = {
    filterForecast,datesTable,getDateRange
}