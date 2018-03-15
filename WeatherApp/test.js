const
    weather = require('../MetaWeatherAPI/index'),
    CLI = require('./InteractiveCLI'),
    inquirer = require('inquirer')

let string = "";

const locationWeather_woeid = (location) => {
    weather.woeid_by_query(location)
        .then(result=>{
            let array = [];
            result.forEach(item=>{
                array.push(item.title);
            })

            CLI.interactiveCLI(array)
                .then(result=>{
                    weather.woeid_by_query(result.location)
                        .then(result=>{
                            // console.log(result[0].woeid)
                            weather.get_weather_by_woeid(result[0].woeid)
                                .then(result=>{
                                    string=print(result.consolidated_weather)
                                })
                        })
                })
        })
        .catch(err => console.log(err))
}

const print = (result)=>{
    // result.forEach(item=>{
    //     return (`Date: ${item.applicable_date} \n   Weather state: ${item.weather_state_name}\n   Min: ${Math.round(FtoC(item.min_temp))}°F \n   Max: ${Math.round(FtoC(item.max_temp))}°F\n`)
    // })

    return (`Date: ${result[0].applicable_date} \n   Weather state: ${result[0].weather_state_name}\n   Min: ${Math.round(FtoC(result[0].min_temp))}°F \n   Max: ${Math.round(FtoC(result[0].max_temp))}°F\n`)
}

const FtoC=(F)=>{
    return (F*(9/5)+32);
}

const returnString = ()=>{
    return string;
}

module.exports={
    locationWeather_woeid,returnString
}