const
    weather = require('../MetaWeatherAPI/index'),
    colors = require('colors'),
    mainLoop = require('./mainLoop'),
    rangeSearch = require('./RangeSearch/rangeSearch'),
    rangeSearch_inquirer = require('./RangeSearch/inquirer')

const menu_recur = ()=>{
        mainLoop.menu().then(result=>{
            switch(result.option){
                case 'today' : {
                    mainLoop.ui().then(result=>{
                    })
                    break;
                }
                case 'radius' :{
                    mainLoop.radius_submenu().then(result=>{
                        if (result.option === 'exit'){
                            process.exit()
                        }
                        mainLoop.ui().then(location=>{
                            if (result.option === 'location + radius'){
                                surroundingCitiesWeather(location.location);
                            }
                            else {
                                searchWeatherWithinRange(location.location)
                            }
                        })
                    })
                    break;
                }
                case 'history' : {
                    mainLoop.ui().then(result=>{
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

const selectRange = (result) => {
    rangeSearch_inquirer.selectRange_inquirer()
        .then((answers) => {
            let withinRange = rangeSearch.selectRange(result,answers)
            foreCastForCitiesInRange(withinRange)
        })
}


//used an empty parameter here in order to reuse this function for another feature
const foreCastForCitiesInRange =(cities, weatherToSearch = []) => {
    const citiesInfo = []
    cities.forEach(city => {
        //getting the weather info for each city in range using the WOEID(Where on Earth ID)
        weather.get_weather_by_woeid(city.woeid)
            //this returns the 5 day forecast for all the cities not in the particular order given 
            //but as soon as the API has a response for that city.
            //Also we only want the forecasts of the day the query is made so the other days are of no cosequence
            .then(result => {
                citiesInfo.push(
                    rangeSearch.citiesInfo(result,city)
                )
                //reorganize the list of cities by distance in ascending order, 
                //since our response might shuffle them.
                if (cities.length === citiesInfo.length ) {
                   if(weatherToSearch.length == 0) {
                        print(rangeSearch.sortResults(citiesInfo))
                    }
                    else{
                        searchWeather(rangeSearch.sortResults(citiesInfo), weatherToSearch)
                    }
                }
            })
            .catch(err => console.log(err))
    })
}
const surroundingCitiesWeather = (location) => {
    let
        lattLong = []

    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0)
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)
            else {
                lattLong = result[0].latt_long.split(',')
                weather.woeid_by_lattlong(lattLong[0], lattLong[1])
                    .then(result => {
                        selectRange(result)
                    })
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}
//----------------Search by Weather and Range Starts Here-----------------

const selectWeather = (result) => {
    rangeSearch_inquirer.selectWeather_inquirer()
        .then((answers) => {
            rangeSearch_inquirer.selectRange_inquirer()
                .then((input) => {
                    let obj = rangeSearch.selectWeather(result,answers,input)
                    foreCastForCitiesInRange(obj.withinRange,obj.selectedWeather)
            })
    })
}

const searchWeatherWithinRange = (location) => {
    let
        lattLong = []

    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0)
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)
            else {
                lattLong = result[0].latt_long.split(',')
                weather.woeid_by_lattlong(lattLong[0], lattLong[1])
                    .then(result => {
                        selectWeather(result)
                    })
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}

const searchWeather = (cities, weather)=>{
    let result = rangeSearch.searchWeather(cities,weather)

    if(result.length === 0){
        console.log('Sorry there are no results for the miles and weather condition specified.')
        return menu_recur()
    }
    else{
        print(result)
    }
}

const print =(result)=>{
    console.log( rangeSearch.table(result).toString())
    return menu_recur()
}

module.exports = {
    surroundingCitiesWeather,
    searchWeatherWithinRange,
    menu_recur
}