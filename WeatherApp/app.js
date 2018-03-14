const
    weather = require('../MetaWeatherAPI/index'),
    filename = 'weatherSearchHistory.json',
    fs = require('fs');
// inquirer = require('inquirer')

const locationWeather = (location) => {
    weather.woeid_by_query(location)
        .then(result => {
            console.log(result)
            history(result)
        })
        .catch(err => console.log(err))
}

const lattLongWeather = (latt, long) => {
    weather.woeid_by_lattlong(latt, long)
        .then(result => {
            console.log(result)
        })
        .catch(err => console.log(err))
}

const history = (result) => {

    function createFile(result) {
        fs.open(filename, 'r', function (err, fd) {

            //create file if it doesn't already exist
            if (err) {
                fs.writeFile(filename, JSON.stringify(result), (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Search history file not found. Search history file has been created.");
                    console.log("Seach results saved: " + result.length + " of 5.");
                });
            }

            //add to existing file if search history file already exists
            else {
                fs.readFile(filename, (err, data) => {

                    //read existing search results from file
                    var historyDataArray = JSON.parse(data);

                    //check for duplicate searched city before adding it back to the bottom of the list
                    for (var x = 0; x < historyDataArray.length; x++) {
                        if (result[0].woeid == historyDataArray[x].woeid) {
                            historyDataArray.splice(x, 1);
                        }
                    }

                    //only saving 5 most recent searches so this deletes the oldest search history if there is already 5 results in saved history
                    if (historyDataArray.length > 4) {
                        historyDataArray.splice(0, 1);
                    }

                    //add newest search result to array
                    historyDataArray.push(result[0]);

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
    createFile(result);
}

const displayHistory = () => {
    fs.readFile(filename, (err, data) => {
        if (err) {
            console.log("You can't display search history when nothing has been searched!! ):<")
        }
        else {
            var historyDataArray = JSON.parse(data);
            for (var x = 0; x < historyDataArray.length; x++) {
                console.log(historyDataArray[x])
            }
        }
    })
}

module.exports = {
    locationWeather, lattLongWeather,
    history, displayHistory
}