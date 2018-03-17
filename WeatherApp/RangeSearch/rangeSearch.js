const utilities = require('../utils/utilities'),
    Table = require('cli-table2')

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
    sortResults,table
}