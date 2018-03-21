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


var
    mainLoopChoice = 'test',
    radiusChoice = '',
    dateWeatherLocation = '',
    dateWeatherStartDate = '',
    dateWeatherEndDate = '',
    dateWeatherRange = '',
    dateRangeWeatherLocation = '',
    dateRangeWeatherStart = '',
    dateRangeWeatherEnd = '',
    surroundingCitiesWeatherLocation = '',
    searchWeatherWithinRangeLocation = '',
    array = [{
        mainLoopChoice: mainLoopChoice,
        radiusChoice: radiusChoice,
        dateWeatherLocation: dateWeatherLocation,
        dateWeatherStartDate: dateWeatherStartDate,
        dateWeatherEndDate: dateWeatherEndDate,
        dateWeatherRange: dateWeatherRange,
        dateRangeWeatherLocation: dateRangeWeatherLocation,
        dateRangeWeatherStart: dateRangeWeatherStart,
        dateRangeWeatherEnd: dateRangeWeatherEnd,
        surroundingCitiesWeatherLocation: surroundingCitiesWeatherLocation,
        searchWeatherWithinRangeLocation: searchWeatherWithinRangeLocation
    }];

const menu_recur = () => {
    mainLoop.menu().then(result => {
        switch (result.option) {
            case 'today': {
                mainLoop.ui().then(location => {
                    dateWeather(location.location, 0)
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
                        return menu_recur()
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
                if (mainLoopChoice == 'today') {
                    console.log('History For: ' + mainLoopChoice + ' Location: ' + dateWeatherLocation);
                    dateWeather(dateWeatherLocation, 0)
                    break;
                }
                else if (mainLoopChoice == 'date range') {
                    console.log('History For: ' + mainLoopChoice + ' Location: ' + dateRangeWeatherLocation);
                    filterSearch(dateRangeWeatherLocation, [dateRangeWeatherStart, dateRangeWeatherEnd]);
                    break;
                }
                else if (mainLoopChoice == 'radius') {
                    console.log('History For: ' + mainLoopChoice);
                    if (radiusChoice == 'location + radius') {
                        console.log('Location: ' + surroundingCitiesWeatherLocation);
                        radiusChoice = 'location + radius';
                        surroundingCitiesWeather(surroundingCitiesWeatherLocation);
                    }
                    else if (radiusChoice == 'location + weather conditions + radius') {
                        console.log('Location: ' + searchWeatherWithinRangeLocation);
                        radiusChoice = 'location + weather conditions + radius';
                        searchWeatherWithinRange(searchWeatherWithinRangeLocation);
                    }
                    break;
                }
                return menu_recur()

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
        return menu_recur()
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
//note: validate start and end date
const dateWeather = (location, startDate = '', endDate = '', range = 0) => {
    dateWeatherLocation = location;
    dateWeatherStartDate = startDate;
    dateWeatherEndDate = endDate;
    dateWeatherRange = range;
    search_inquirer.getWeatherFilters()
        .then(filters => {
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
            dateRangeWeatherLocation = location;
            dateRangeWeatherStart = start.startDate;
            dateRangeWeatherEnd = end.endDate;
            if (startDate.toString() === 'Invalid Date'
                || endDate.toString() === 'Invalid Date') {
                console.log('Invalid start or end date. Returning to main menu.')
                return menu_recur()
            }

            if (new Date(start.startDate) > new Date(end.endDate)) {
                console.log('Error. Start date later than end date. Returning to main menu.')
                return menu_recur()
            }
            filterSearch(location, [start.startDate, end.endDate])
        })
    })
}

//today and daterange end---------------------------------------------------------------------------------

const surroundingCitiesWeather = (location) => {
    surroundingCitiesWeatherLocation = location;
    let
        lattLong = []
    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0) {
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)
                return menu_recur()
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

const searchWeatherWithinRange = (location) => {
    searchWeatherWithinRangeLocation = location;
    let
        lattLong = []

    weather.woeid_by_query(location)
        .then(result => {
            //Validating to make sure that the city entered exists within the MetaWeather API
            if (result.length === 0) {
                console.log(`Sorry, there are no results in the MetaWeather API for ${location}.`)
                return menu_recur()
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

// creates the array of dates

// gets forecasts of location
const getForecasts = (location, days, selections) => {
    if ((location.trim() != '') && (location.length != 0)) {
        weather.woeid_by_query(location)

            .then(result => {
                let date = new Date()
                let dateStr = ''
                let dateArr = []

                //if location not found
                if (result.length === 0) {
                    console.log(`No data for ${location}`)
                    return
                }

                //no date range specified
                if (days.length === 0) {
                    dateStr = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
                    printForecast(weather.get_weather_by_woeid(result[0].woeid), selections, dateStr, dateArr)
                }

                days.forEach(day => {
                    dateStr = `${day.month + 1}-${day.day}-${day.year}`
                    printForecast(weather.get_weather_by_woeid_at_date(result[0].woeid,
                        day.year, day.month + 1, day.day), selections, dateStr, dateArr, 1)
                })

                //find a better interval
                //currently this is a hack to allow for the printing of the date range or today's date
                setTimeout(() => {
                    dateArr.sort((a, b) => {
                        let A = new Date(a.date),
                            B = new Date(b.date)

                        if (A < B) return -1
                        if (A > B) return 1
                        return 0
                    })
                    console.log(search.datesTable(dateArr).toString())
                    return menu_recur()
                }, 5000)
            })
    }
    else {
        console.log('Invalid location. Returning to main menu.')
        return menu_recur()
    }
}

//note: write a better for key in object

// TODO: print the location's for Today's forecast with the search query
const printForecast = (response, selections, dateStr, dateArr, range = 0) => {
    let forecastCopy

    response.then(forecasts => {
        if (range === 0) {
            forecastCopy = forecasts.consolidated_weather[0]
        }
        else {
            forecastCopy = forecasts[0]
        }

        let filteredForecast = search.filterForecast(selections, forecastCopy)

        dateArr.push({
            date: dateStr,
            output: filteredForecast
        })
    }).catch(err => {
        console.log(err)
    })

}

// wrapper for search
const filterSearch = (location, dateRange) => {
    let days = search.getDateRange(dateRange)
    search_inquirer.getWeatherFilters()
        .then(filters => {
            getForecasts(location, days, filters.conditions)
        })
}

const print = (result) => {
    console.log(rangeSearch.table(result).toString())
    return menu_recur()
}

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

const inquirerDisplay = (choices) => {
    let choice = [];

    if (choices[0] == 'Back to Main Menu') {
        choice = ['Back to Main Menu']
    }
    else {
        //fetch so top is most recent
        choices.forEach((item, index) => {
            choice[choices.length - 1 - index] = item.title
        })
    }

    return inquirer.prompt({
        type: 'list',
        message: 'Select History',
        name: 'location',
        choices: choice,
        validate: (choice) => {
            if (choices > 1 || choices < 0) {
                return false;
            }
            else {
                return true
            }
        }
    })
}


module.exports = {
    menu_recur,
    searchWeatherWithinRange,
    surroundingCitiesWeather,
    filterSearch,
    history
}