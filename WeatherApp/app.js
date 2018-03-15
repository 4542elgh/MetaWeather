const
    weather = require('../MetaWeatherAPI/index'),
    filename = 'weatherSearchHistory.json',
    fs = require('fs'),
    inquirer = require('inquirer')

const locationWeather = (location) => {
    weather.woeid_by_query(location)
        .then(result => {
            // console.log(result)
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
    createFile(result);
}

const createFile = (result)=>{
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

                //read existing search results from file, if file empty, avoid parsing empty json
                let historyDataArray = [];
                try{
                    historyDataArray = JSON.parse(data)
                }catch(SyntaxError) {
                    historyDataArray =[]
                }

                //check for duplicate entry
                historyDataArray.forEach((item,index)=>{
                    if (result[0].woeid == item.woeid){
                        historyDataArray.splice(index,1)
                    }
                })

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

const displayHistory = () => {
    fs.readFile(filename, (err, data) => {
        if (err) {
            console.log("You can't display search history when nothing has been searched!! ):<")
        }
        else {
            let historyDataArray = JSON.parse(data);
            inquirerDisplay(historyDataArray).then(result=>{
                //deal with inquirer selected option
            })
        }
    })
}

const inquirerDisplay = (choices) =>{
    let choice = [];

    //fetch so top is most recent
    choices.forEach((item,index)=>{
        choice[choices.length-1-index]=item.title
    })

    return inquirer.prompt({
        type:'list',
        message:'Select History',
        name:'location',
        choices:choice,
        validate:(choice)=>{
            if(choices>1 || choices<0){
                return false;
            }
            else{
                return true
            }
        }
    })
}

module.exports = {
    locationWeather, lattLongWeather,
    history, displayHistory
}