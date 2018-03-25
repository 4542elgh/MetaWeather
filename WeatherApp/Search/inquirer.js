const inquirer = require('inquirer'),
    utilities = require('../utils/utilities')

const getWeatherFilters = (cliFlag) => {
    let conditions = ['forecast', 'temperature', 'air', 'wind']

    //if called from the cli: exit, otherwise return to menu
    let exitName = (cliFlag) ? 'exit' : 'return to menu'
    conditions.push(exitName)

    return inquirer.prompt([{
        type: 'checkbox',
        message: 'Select the conditions to display:\n',
        name: 'conditions',
        choices: conditions,
        validate: (filters) => {
            if (filters.length > 1 && filters.indexOf(exitName) > -1) {
                return 'Only select exit to return to main menu'
            }
            if (filters.length != 0) {
                return true
            }
            return 'Please make a selection.'
        }
    }])
}

    const startDate_inquirer = () => {
    return inquirer.prompt([{
        type: 'input',
        message: 'Enter the start date (between 1/1/14 and today):',
        name: 'startDate',
        validate: (choices) => {
            if(!utilities.dateValid(choices)) {
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
        message: 'Enter the end date (between 1/1/14 and today):',
        name: 'endDate',
        validate: (choices) => {
            if(!utilities.dateValid(choices)) {
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

module.exports ={
    startDate_inquirer,endDate_inquirer,getWeatherFilters
}