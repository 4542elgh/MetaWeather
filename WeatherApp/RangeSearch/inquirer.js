const inquirer = require('inquirer')

const selectRange_inquirer = ()=>{
    return inquirer.prompt([{
        type: 'list',
        message: 'Select the range in miles to search',
        name: 'miles',
        choices: ['50', '100', '150', '200', '250', '300', '350'],
        validate: (answer) => {
            if (answer.length > 1 || answer.length === 0) {

                return 'Error: You must select 1 choice only'

            } else {
                return true
            }
        }

    }])
}

const selectWeather_inquirer = ()=> {
    return inquirer.prompt([{
        type: 'checkbox',
        message: 'Select weather conditions to be searched',
        name: 'miles',
        choices: ['Clear', 'Light Cloud', 'Heavy Cloud', 'Showers', 'Light Rain', 'Heavy Rain', 'Thunderstorm', 'Hail', 'Sleet', 'Snow'],
        validate: (answer) => {
            if (answer.length > 0) {

                return true

            } else {
                return 'Error: You must select at least one choice'
            }
        }
    }])
}

module.exports = {
    selectRange_inquirer,selectWeather_inquirer
}