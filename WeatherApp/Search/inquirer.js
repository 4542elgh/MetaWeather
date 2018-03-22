const inquirer = require('inquirer')

const dateValid = (choice) => {
    let tempDate = new Date(choice)

    if(tempDate.toString() === 'Invalid Date'){
        return false;
    }

    let lowerBound = new Date('2/28/13')
    let upperBound = new Date() //today
    if(tempDate > lowerBound && tempDate <= upperBound) {
        return true;
    }
    return false;
}

const startDate_inquirer = () => {
    return inquirer.prompt([{
        type: 'input',
        message: 'Enter the start date (between 3/1/13 and today):',
        name: 'startDate',
        validate: (choices) => {
            if(!dateValid(choices)) {
                return 'Invalid date. Please try entering a valid date.'
            }
            if (choices > 1 || choices < 0) {
                return false;
            }
            else {
                return true
            }
        }
    }])
}

const endDate_inquirer = () => {
    return inquirer.prompt([{
        type: 'input',
        message: 'Enter the end date (between 3/1/13 and today):',
        name: 'endDate',
        validate: (choices) => {
            if(!dateValid(choices)) {
                return 'Invalid date. Please try entering a valid date.'
            }
            if (choices > 1 || choices < 0) {
                return false;
            }
            else {
                return true
            }
        }
    }])
}

const getWeatherFilters = () => {
    let conditions = ['forecast', 'temperature', 'air', 'wind', 'return to menu']

    return inquirer.prompt([{
        type: 'checkbox',
        message: 'Select the conditions to display:\n',
        name: 'conditions',
        choices: conditions,
        validate: (filters) => {
            if (filters.length > 1 && filters.indexOf('exit') > -1) {
                return 'Only select exit to return to main menu'
            }
            if (filters.length != 0) {
                return true
            }
            return 'Please make a selection.'
        }
    }])
}

module.exports ={
    startDate_inquirer,endDate_inquirer,getWeatherFilters
}