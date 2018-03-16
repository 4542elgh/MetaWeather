const
    weather = require('../MetaWeatherAPI/index'),
    CLI = require('./InteractiveCLI'),
    inquirer = require('inquirer'),
    search = require('./search'),
    Table = require('cli-table2')

const ui = ()=>{
    return inquirer.prompt([{
        type:'input',
        message:'Enter your location:',
        name:'location',
        validate:(choices)=>{
            if(choices>1 || choices<0){
                return false;
            }
            else{
                return true
            }
        }
    }])
}
const menu = ()=>{
    return inquirer.prompt([{
        type:'list',
        message:'Menu:',
        name:'option',
        choices:[new inquirer.Separator('---Search---'),'Today','Date Range','Radius',new inquirer.Separator('-----------'),'history','exit'],
        validate:(choices)=>{
            if(choices>1 || choices<0){
                return false;
            }
            else{
                return true
            }
        }
    }])
}

const menu_recur = ()=>{
        menu().then(result=>{
            switch(result.option){
                case 'Today' : {
                    ui().then(result=>{
                        filterSearch(result.location,3);
                    })
                    break;
                }
                case 'history' : {
                    ui().then(result=>{
                      test.locationWeather_woeid(result.location);
                      setTimeout(()=>{
                          console.log(test.returnString());
                          return menu_recur()}
                          ,5000)
                    })
                    break;
                }
                case 'exit' : {
                    process.exit(0)
                    break;
                }
            }
    })
}

const getForecasts = (location, days, selections) => {
    weather.woeid_by_query(location)
        .then(result => {
            let date = new Date()
            let dateStr = `${date.getMonth() +1}-${date.getDate()}-${date.getFullYear()}`

            //if location not found
            if (result.length === 0) {
                console.log(`No data for ${location}`)
                return
            }

            //no date range specified
            if(days.length === 0) {
                printForecast(weather.get_weather_by_woeid(result[0].woeid), selections, dateStr)
            }

            days.forEach(day => {
                printForecast(weather.get_weather_by_woeid_at_date(result[0].woeid,
                    day.year, day.month + 1, day.day), selections, dataStr, 1)
            })
        })
}

const printForecast = (response, selections, dateStr, range=0) => {
    let forecastCopy
    response.then(forecasts => {
        range === 0? forecastCopy = forecasts.consolidated_weather[0] : forecastCopy = forecasts[0]

        let filteredForecast = search.filterForecast(selections, forecastCopy)
        console.log(search.formatForecast(dateStr, filteredForecast).toString())
        return menu_recur()
    })
}
const filterSearch = (location, dateRange) => {
    let days = search.getDateRange(dateRange)

    search.getWeatherFilters()
        .then(filters => {
            getForecasts(location, days, filters.conditions)
        })
}

module.exports = {
    menu_recur
}