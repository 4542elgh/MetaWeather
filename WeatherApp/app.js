const
    weather = require('../MetaWeatherAPI/index'),
    inquirer = require('inquirer'),
    colors = require('colors'),
    CLI = require('./InteractiveCLI'),
    utilities = require('./utils/utilities'),
    rangeSearch = require('./RangeSearch/rangeSearch')
    rangeSearch_inquirer = require('./RangeSearch/inquirer')

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
                        // filterSearch(result.location,3);
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
const selectRange = (result) => {
    rangeSearch_inquirer.selectRange_inquirer()
        .then((answers) => {
            const
                range = utilities.milesToMeters(parseInt(answers.miles)),
                withinRange = []

            result.forEach(city => {
                //the selected range will be used to get all the forecast of the cities
                if (city.distance <= range)
                    withinRange.push(city)
        });
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
                
                citiesInfo.push({
                    cityName: result.title,
                    distance: city.distance, //need the distance in order to order them from closest to farthest
                    conditions: result.consolidated_weather[0].weather_state_name,
                    temperature: utilities.CtoF(result.consolidated_weather[0].the_temp) + '°F',
                    minTemp: utilities.CtoF(result.consolidated_weather[0].min_temp) + '°F' ,
                    maxTemp: utilities.CtoF(result.consolidated_weather[0].max_temp) + '°F',
                    humidity: result.consolidated_weather[0].humidity + '%',
                    air_pressure:result.consolidated_weather[0].air_pressure.toPrecision(4) + ' mb'
                })

                //reorganize the list of cities by distance in ascending order, 
                //since our response might shuffle them.
                if (cities.length === citiesInfo.length ) {
                   
                   if(weatherToSearch.length == 0)
                    print(rangeSearch.sortResults(citiesInfo))

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
                    const
                        range = utilities.milesToMeters(parseInt(input.miles)),
                        withinRange = [],
                        selectedWeather =[]

                        answers.miles.forEach(weather =>{
                            selectedWeather.push(weather)
                        })

                    result.forEach(city => {
                        //the selected range will be used to get all the forecast of the cities
                        if (city.distance <= range)
                            withinRange.push(city)
                    })
                        foreCastForCitiesInRange(withinRange,selectedWeather)
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

    let result = []
    cities.forEach(city=>{

        for (let index = 0; index < weather.length; index++) {
            if(city.conditions === weather[index])
            result.push(city)
        }
    })
    if(result.length === 0){
        console.log('Sorry there are no results for the miles and weather condition specified.')
    }
    else{
        print(result)
    }
}

const print =(result)=>{
    console.log( rangeSearch.table(result).toString())
}

module.exports = {
    surroundingCitiesWeather,
    searchWeatherWithinRange,
    menu_recur
}