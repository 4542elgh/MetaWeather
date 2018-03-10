const
    weather = require('../MetaWeatherAPI/index')
// inquirer = require('inquirer')

const locationWeather = (location) => {
    weather.woeid_by_query(location)
        .then(result => {
            console.log(result)
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

const history = () => {
    const fs = require('fs');

    function createFile(filename) {
        fs.open(filename, 'weatherSearchHistory.json', function (err, fd) {
            if (err) {
                fs.writeFile(filename, 'weatherSearchHistory.json', function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                fs.readFile('./weatherSearchHistory.json', 'utf-8', function (err, historyData) {
                    if (err) throw err
                    var data = JSON.parse(historyData);
                });
                //console.log(data);
                fs.writeFile('./weatherSearchHistory.json', JSON.stringify(data), 'utf-8', function (err) {
                    if (err) throw err;
                })
            }
        });
    }
}


module.exports = {
    locationWeather, lattLongWeather,
    history
}