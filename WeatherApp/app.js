const
    weather = require('../MetaWeatherAPI/index'),
    CLI = require('./InteractiveCLI');

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
                                   print(result.consolidated_weather)
                                })
                        })
                })
        })
        .catch(err => console.log(err))
}

const lattLongWeather_woeid = (latt,long) => {
    weather.woeid_by_lattlong(latt,long)
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
                                   console.log(result)
                               })
                       })
                })
            // console.log(result);
        })
        .catch(err => console.log(err))
}

const print = (result)=>{
    result.forEach(item=>{
        console.log(`Date: ${item.applicable_date} \n   Weather state: ${item.weather_state_name}\n   Min: ${Math.round(FtoC(item.min_temp))}°F \n   Max: ${Math.round(FtoC(item.max_temp))}°F\n`)
    })
}

const FtoC=(F)=>{
    return (F*(9/5)+32);
}

module.exports = {
    locationWeather_woeid,lattLongWeather_woeid
}