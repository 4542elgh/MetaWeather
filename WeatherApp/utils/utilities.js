const inquirer = require('inquirer')


const locationFinder = (response) => {
    let availableCities = []

    for (let i = 0; i < response.length; i++) {
        availableCities.push(response[i].title)
        if (availableCities.length > 5) {
            break;
        }
    }
    return inquirer.prompt([{
        type: 'list',
        message: 'Select a location to search',
        name: 'location',
        choices: availableCities,
        validate: (result) => {
            if (result.length > 1 || result.lenght <= 0) {
                return 'Error: You must select one choice only'
            }
            else {
                return true
            }
        }
    }])
}

const milesToMeters = (miles) => {
    return miles * 1609.34
}

const metersToMiles = (meters) => {
    if(meters === 0){
        return 0
    }
    else
        return (meters / 1609.34).toPrecision(4)
}

const CtoF = (celsius) =>{
    const farenheit = (celsius * (9 / 5) + 32).toPrecision(4)
    return farenheit
}

const dateValid = (choice) => {
    let tempDate = new Date(choice)

    if(tempDate.toString() === 'Invalid Date'){
        return false;
    }

    let lowerBound = new Date('12/31/13')
    let upperBound = new Date() //today
    if(tempDate > lowerBound && tempDate <= upperBound) {
        return true;
    }
    return false;
}

module.exports = {
    locationFinder, milesToMeters, metersToMiles, CtoF, dateValid
}