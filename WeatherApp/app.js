const
    weather = require('../MetaWeatherAPI/index'),
    colors = require('colors'),
    mainLoop = require('./mainLoop'),
    rangeSearch = require('./RangeSearch/rangeSearch'),
    rangeSearch_inquirer = require('./RangeSearch/inquirer'),
    search = require('./Search/search'),
    search_inquirer = require('./Search/inquirer'),
    inquirer = require('inquirer'), //temp <-- remove later
    Table = require('cli-table2'),
    filename = 'weatherSearchHistory.json',
    fs = require('fs')

// creating variables to store in history feature
var
    cliFlag = false,
    mainLoopChoice = '',
    radiusChoice = '',
    globalLocation = '',
    dateWeatherStartDate = '',
    dateWeatherEndDate = '',
    dateWeatherRange = '',
    dateRangeWeatherStart = '',
    dateRangeWeatherEnd = '',

    array = [{
        mainLoopChoice: mainLoopChoice,
        radiusChoice: radiusChoice,
        globalLocation: globalLocation,
        dateWeatherStartDate: dateWeatherStartDate,
        dateWeatherEndDate: dateWeatherEndDate,
        dateWeatherRange: dateWeatherRange,
        dateRangeWeatherStart: dateRangeWeatherStart,
        dateRangeWeatherEnd: dateRangeWeatherEnd
    }];

// menu io loop
const menu_recur = () => {

    mainLoop.menu().then(result => {
        switch (result.option) {
            case 'today': {
                mainLoop.ui().then(location => {
                    dateWeather(location.location, 0)
                    //pushArray();
                })
                mainLoopChoice = 'today';

                break;
            }
            case 'date range': {
                mainLoop.ui().then(location => {
                    dateRangeWeather(location.location)
                })
                mainLoopChoice = 'date range';
                break;
            }
            case 'radius': {
                mainLoop.radius_submenu().then(result => {
                    if (result.option === 'return to menu') {
                        return (cliFlag) ? null : menu_recur()
                    }
                    mainLoop.ui().then(location => {
                        if (result.option === 'location + radius') {
                            radiusChoice = 'location + radius';
                            surroundingCitiesWeather(location.location);

                        }
                        else if (result.option === 'location + weather conditions + radius') {
                            radiusChoice = 'location + weather conditions + radius';
                            searchWeatherWithinRange(location.location)

                        }
                    })
                })
                mainLoopChoice = 'radius';
                break;
            }
            case 'history': {
                console.log(array)

                if (mainLoopChoice == 'today') {
                    console.log('History For: ' + mainLoopChoice + ' Location: ' + globalLocation);
                    dateWeather(globalLocation, 0)
                    break;
                }
                else if (mainLoopChoice == 'date range') {

                    if (array[x].mainLoopChoice == 'date range') {

                        console.log('History For: ' + mainLoopChoice + ' Location: ' + globalLocation);
                        filterSearch(globalLocation, [dateRangeWeatherStart, dateRangeWeatherEnd]);
                    }

                    // console.log('History For: ' + mainLoopChoice + ' Location: ' + globalLocation);
                    // filterSearch(globalLocation, [dateRangeWeatherStart, dateRangeWeatherEnd]);
                    break;
                }
                else if (mainLoopChoice == 'radius') {
                    console.log('History For: ' + mainLoopChoice);
                    if (radiusChoice == 'location + radius') {
                        console.log('Location: ' + globalLocation);
                        radiusChoice = 'location + radius';
                        surroundingCitiesWeather(globalLocation);
                    }
                    else if (radiusChoice == 'location + weather conditions + radius') {
                        console.log('Location: ' + globalLocation);
                        radiusChoice = 'location + weather conditions + radius';
                        searchWeatherWithinRange(globalLocation);
                    }
                    break;
                }
                return (cliFlag) ? null : menu_recur()

            }
            case 'exit': {
                process.exit(0)
                break;
            }
        }

    })
}

const selectRange = (result) => {
    rangeSearch_inquirer.selectRange_inquirer()
        .then((answers) => {
            let withinRange = rangeSearch.selectRange(result, answers)
            foreCastForCitiesInRange(withinRange)
        })
}

const searchWeather = (cities, weather) => {
    let result = rangeSearch.searchWeather(cities, weather)
    if (result.length === 0) {
        console.log('Sorry there are no results for the miles and weather condition specified.')
        return (cliFlag) ? null : menu_recur()
    }
    else {
        print(result)
    }
}

//used an empty parameter here in order to reuse this function for another feature
const foreCastForCitiesInRange = (cities, weatherToSearch = []) => {
    const citiesInfo = []
    cities.forEach(city => {
        //getting the weather info for each city in range using the WOEID(Where on Earth ID)
        weather.get_weather_by_woeid(city.woeid)
            //this returns the 5 day forecast for all the cities not in the particular order given 
            //but as soon as the API has a response for that city.
            //Also we only want the forecasts of the day the query is made so the other days are of no cosequence
            .then(result => {
                citiesInfo.push(
                    rangeSearch.citiesInfo(result, city)
                )
                //reorganize the list of cities by distance in ascending order, 
                //since our response might shuffle them.
                if (cities.length === citiesInfo.length) {
                    if (weatherToSearch.length == 0) {
                        print(rangeSearch.sortResults(citiesInfo))
                    }
                    else {
                        searchWeather(rangeSearch.sortResults(citiesInfo), weatherToSearch)
                    }
                }
            })
            .catch(err => console.log(err))
    })
}

//today and daterange start-------------------------------------------------------------------------------

const dateWeather = (location, startDate = '', endDate = '', range = 0) => {
    globalLocation = location;
    dateWeatherStartDate = startDate;
    dateWeatherEndDate = endDate;
    dateWeatherRange = range;
    search_inquirer.getWeatherFilters()
        .then(filters => {
            if(filters.conditions.toString() === 'return to menu') {
                return (cliFlag) ? null : menu_recur()
            }
            getForecasts(location, [], filters.conditions)
        })
        .catch(err => {
            console.log(err)
        })
}

const dateRangeWeather = (location) => {
    search_inquirer.startDate_inquirer().then(start => {
        search_inquirer.endDate_inquirer().then(end => {
            let startDate = new Date(start.startDate)
            let endDate = new Date(end.endDate)
            globalLocation = location;
            dateRangeWeatherStart = start.startDate;
            dateRangeWeatherEnd = end.endDate;
            // pushArray();
            if (startDate.toString() === 'Invalid Date'
                || endDate.toString() === 'Invalid Date') {
                console.log('Invalid start or end date. Returning to main menu.')
                return (cliFlag) ? null : menu_recur()
            }

            if (new Date(start.startDate) > new Date(end.endDate)) {
                console.log('Error. Start date later than end date. Returning to main menu.')
                return (cliFlag) ? null : menu_recur()
            }
            filterSearch(location, [start.startDate, end.endDate])
        })
    })
}

//today and daterange end---------------------------------------------------------------------------------

const surroundingCitiesWeather = (location, cli = false) => {
    cliFlag = cli
    globalLocation = location;
    //pushArray();
    let
        lattLong = []
    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0) {
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)
                return (cliFlag) ? null : menu_recur()
            }
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
                    let obj = rangeSearch.selectWeather(result, answers, input)
                    foreCastForCitiesInRange(obj.withinRange, obj.selectedWeather)
                })
        })
}

const searchWeatherWithinRange = (location, cli = false) => {
    cliFlag = cli
    globalLocation = location;
    pushArray();
    let lattLong = []

    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0) {
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)
                return (cliFlag) ? null : menu_recur()
            }
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

// gets forecasts of location
const getForecasts = (location, days, selections) => {
    if ((location.trim() != '') && (location.length != 0)) {
        weather.woeid_by_query(location)

            .then(result => {
                let date = new Date()
                let dateStr = ''
                let datesWithForecasts = []

                //no data for searched location
                if (result.length === 0) {
                    console.log( colors.blue(`No data for ${location}`) )
                    // fixed bug: return to menu when no data for location is found
                    return (cliFlag) ? null : menu_recur()
                }

                //no date range specified
                if (days.length === 0) {
                    dateStr = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
                    printForecast(weather.get_weather_by_woeid(result[0].woeid), selections, dateStr, datesWithForecasts)
                }

                days.forEach(day => {
                    dateStr = `${day.month + 1}-${day.day}-${day.year}`
                    printForecast(weather.get_weather_by_woeid_at_date(result[0].woeid,
                        day.year, day.month + 1, day.day), selections, dateStr, datesWithForecasts, true)
                })

                //currently this is a hack to allow for the printing of the date range or today's date
                    setTimeout(() => {
                        // custom sort to check if dateA is earlier than dateB
                        datesWithForecasts.sort((a, b) => {
                            let A = new Date(a.date),
                                B = new Date(b.date)

                            if (A < B) return -1
                            if (A > B) return 1
                            return 0
                        })
                        console.log(search.datesTable(datesWithForecasts).toString())
                        return (cliFlag) ? null : menu_recur()
                    }, 
                    5000)
            })
    }
    else {
        console.log('Invalid location. Returning to main menu.')
        return (cliFlag) ? null : menu_recur()
    }
}

// TODO: print all locations with searched string in Today's
const printForecast = (response, selections, dateStr, datesWithForecasts, range = false) => {
    let tempForecast
    let output

    response.then(forecasts => {
        // range == true -> there is a range of dates
        if (!range) {
            tempForecast = forecasts.consolidated_weather[0]
        }
        else {
            tempForecast = forecasts[0]
        }
        let filteredForecast = search.filterForecast(selections, tempForecast)

        if (!range) {
            datesWithForecasts.push({
                date: dateStr,
                location: forecasts.title,
                output: filteredForecast
            })
        }
        else {
            datesWithForecasts.push({
                date: dateStr,
                output: filteredForecast
            })
        }
    }).catch(err => {
        console.log(err)
    })

}

// wrapper for search
const filterSearch = (location, dateRange, cli = false) => {
    cliFlag = cli
    let days = search.getDateRange(dateRange)
    search_inquirer.getWeatherFilters()
        .then(filters => {
            if(filters.conditions.toString() === 'return to menu') {
                return (cliFlag) ? null : menu_recur()
            }
            getForecasts(location, days, filters.conditions)
        })
}

const print = (result) => {
    console.log(rangeSearch.table(result).toString())
    return (cliFlag) ? null : menu_recur()
}

//----------------History Starts Here-----------------

const history = (array) => {
    console.log("test")
    fs.open(filename, 'r', (err, fd) => {

        //create file if it doesn't already exist
        if (err) {
            fs.writeFile(filename, JSON.stringify(array), (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("Search history file not found. Search history file has been created.");
                console.log("Seach results saved: " + array.length + " of 5.");
            });
        }

        //add to existing file if search history file already exists
        else {
            fs.readFile(filename, (err, data) => {

                //read existing search results from file, if file empty, avoid parsing empty json
                let historyDataArray = [];
                try {
                    historyDataArray = JSON.parse(data)
                }
                catch (SyntaxError) {
                    historyDataArray = []
                }

                //check for duplicate entry
                historyDataArray.forEach((item, index) => {
                    if (result[0].woeid == item.woeid) {
                        historyDataArray.splice(index, 1)
                    }
                })

                //only saving 5 most recent searches so this deletes the oldest search history if there is already 5 results in saved history
                if (historyDataArray.length > 4) {
                    historyDataArray.splice(0, 1);
                }

                //add newest search result to array
                historyDataArray.push(array);

                //write updated array to file
                fs.writeFile(filename, JSON.stringify(historyDataArray), (err) => {
                    console.log("Seach results saved: " + historyDataArray.length + " of 5.");
                    if (err) {
                        console.log(err);
                    }
                })
                if (err) {
                    console.log(err);
                }
            })
        }

    })
}

const pushArray = () => {
    if (array.length > 6) {
        array.splice(1, 1)

    }
    array.push({
        mainLoopChoice: mainLoopChoice,
        radiusChoice: radiusChoice,
        globalLocation: globalLocation,
        dateWeatherStartDate: dateWeatherStartDate,
        dateWeatherEndDate: dateWeatherEndDate,
        dateWeatherRange: dateWeatherRange,
        dateRangeWeatherStart: dateRangeWeatherStart,
        dateRangeWeatherEnd: dateRangeWeatherEnd
    })
}


module.exports = {
    menu_recur,
    searchWeatherWithinRange,
    surroundingCitiesWeather,
    filterSearch,
    history
}