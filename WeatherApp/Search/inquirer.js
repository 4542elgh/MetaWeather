const inquirer = require('inquirer')

const startDate_inquirer = () => {
    return inquirer.prompt([{
        type: 'input',
        message: 'Enter the start date:',
        name: 'startDate',
        validate: (choices) => {
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
        message: 'Enter the end date:',
        name: 'endDate',
        validate: (choices) => {
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