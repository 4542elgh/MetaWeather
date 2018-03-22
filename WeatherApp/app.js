const
    weather = require('../MetaWeatherAPI/index'),
    colors = require('colors'),
    mainLoop = require('./mainLoop'),
    rangeSearch = require('./RangeSearch/rangeSearch'),
    rangeSearch_inquirer = require('./RangeSearch/inquirer'),
    search = require('./Search/search'),
    search_inquirer = require('./Search/inquirer'),
    history_inquirer = require('./History/inquirer')
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
        dateRangeWeatherEnd: dateRangeWeatherEnd,
    }],
    cliStrings = []


// menu io loop
const menu_recur = () => {
    
    console.log('\n') // separate main menu from outputs
    mainLoop.menu().then(result => {
        switch (result.option) {
            case 'today': {
                mainLoop.ui().then(location => {
                    dateWeather(location.location, 0)
                    pushArray();
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
                        else if (result.option === 'location + weather condition + radius') {
                            radiusChoice = 'location + weather condition + radius';
                            searchWeatherWithinRange(location.location)
                        }
                    })
                })
                mainLoopChoice = 'radius';
                break;
            }
            case 'history': {
                //console.log(array)

                if (array.length == 1){
                    console.log('Search History is empty');
                    return menu_recur()
                }

                history_inquirer.history_inquirer(array).then(result => {
                    if (result.option == 'return to menu'){
                        return menu_recur()
                    }

                    let param = result.option.split(' ==> ');
                    if (param[0] == 'today') {
                        console.log( colors.yellow(`node cli dateWeather -l ${param[1]}`) )
                        dateWeather(param[1])
                    }
                    else if (param[0] == 'radius') {
                        if (param[1] == 'location + weather condition + radius') {
                            console.log(`node cli searchWeatherAndDistance ${param[2]}`)
                            searchWeatherWithinRange(param[2]);
                        }
                        else {
                            console.log(`node cli searchDistance ${param[2]}`)
                            surroundingCitiesWeather(param[2]);
                        }
                    }
                    else if (param[0] == 'date range') {
                        console.log(`node cli filterSearch ${param[1]} [${param[2]},${param[3]}]`)
                        filterSearch(param[1], [param[2], param[3]])
                    }
                })
                break;
            }

            case 'command': {
                printCliArray();
                break;
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
        console.log(colors.black.bgYellow('There are no results for the miles and weather condition specified.'))
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
    //cli output
    //console.log('node cli search "' + globalLocation + '"');
    cliArray( colors.yellow('node cli search "' + globalLocation + '"') );
    search_inquirer.getWeatherFilters(cliFlag)
        .then(filters => {
            if (filters.conditions.toString() === 'return to menu') {
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
            //cli output
            //console.log('node cli search "' + globalLocation +'" ' + dateRangeWeatherStart + ' ' + dateRangeWeatherEnd);
            cliArray( colors.yellow('node cli search "' + globalLocation + '" ' + dateRangeWeatherStart + ' ' + dateRangeWeatherEnd) );
            pushArray();
            if (startDate.toString() === 'Invalid Date'
                || endDate.toString() === 'Invalid Date') {
                console.log(colors.black.bgYellow('Error. Invalid start or end date.'))
                return (cliFlag) ? null : menu_recur()
            }

            if (new Date(start.startDate) > new Date(end.endDate)) {
                console.log(colors.black.bgYellow('Error. Start date later than end date.'))
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
    //cli output
    //console.log('node cli searchDistance -l ' + globalLocation);
    cliArray( colors.yellow('node cli searchDistance -l ' + globalLocation) );
    pushArray();
    let
        lattLong = []
    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0) {
                console.log(colors.black.bgYellow(`There are no results for ${location}.`))
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
    //cli output
    //console.log('node cli searchWeatherAndDistance -l '+ globalLocation);
    cliArray( colors.yellow('node cli searchWeatherAndDistance -l ' + globalLocation) );
    pushArray();
    let
        lattLong = []

    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0) {
                console.log(colors.black.bgYellow(`There are no results for ${location}.`))
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
                    console.log(colors.black.bgYellow(`There are no results for ${location}.`))
                    return (cliFlag) ? null : menu_recur()
                }

                //no date range specified
                if (days.length === 0) {
                    dateStr = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
                    printForecast(weather.get_weather_by_woeid(result[0].woeid), 
                        selections, dateStr, datesWithForecasts, result[0].title)
                }

                days.forEach(day => {
                    dateStr = `${day.month + 1}-${day.day}-${day.year}`
                    printForecast(weather.get_weather_by_woeid_at_date(result[0].woeid,
                        day.year, day.month + 1, day.day), selections, dateStr, datesWithForecasts, result[0].title, true)
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
        console.log(colors.black.bgYellow('Error. Invalid location. '))
        return (cliFlag) ? null : menu_recur()
    }
}

// TODO: print all locations with searched string in Today's
const printForecast = (response, selections, dateStr, datesWithForecasts, location, range = false) => {
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

        datesWithForecasts.push({
            date: dateStr,
            location: location,
            output: filteredForecast
        })
    }).catch(err => {
        console.log(err)
    })

}

// wrapper for search
const filterSearch = (location, dateRange, cli = false) => {
    cliFlag = cli
    let days = search.getDateRange(dateRange)
    search_inquirer.getWeatherFilters(cliFlag)
        .then(filters => {
            let exitName = (cliFlag) ? 'exit' : 'return to menu'
            if(filters.conditions.toString() === exitName) {
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

    fs.open(filename, 'r', (err, fd) => {

        //create file if it doesn't already exist
        if (err) {
            fs.writeFile(filename, JSON.stringify(array), (err) => {
                if (err) {
                    console.log(err);
                }
                console.log(colors.cyan("Search history file not found. Search history file has been created."));
                console.log(colors.cyan("Seach results saved: " + array.length + " of 5."));
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
                    console.log(colors.cyan("Seach results saved: " + historyDataArray.length + " of 5."));
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
    for (z = 0; z < array.length; z++) {
        if (mainLoopChoice == array[z].mainLoopChoice && globalLocation == array[z].globalLocation){
            return
        }
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

const cliArray = (string) => {
    cliStrings.push(string);
}

const printCliArray = () => {
    if (cliStrings.length < 1) {
        console.log( colors.cyan('Search history is empty.') );
    }
    for (x = 0; x < cliStrings.length; x++) {
        console.log(cliStrings[x]);
    }
    return menu_recur();
}


module.exports = {
    dateWeather,
    menu_recur,
    searchWeatherWithinRange,
    surroundingCitiesWeather,
    filterSearch,
    history
}