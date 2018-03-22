const history_inquirer = (array) => {
    let choice = [];
    array.forEach((item, index) => {
        if (index == 0) { }
        else {
            if (item.mainLoopChoice == 'today') {
                choice.push(`${item.mainLoopChoice} ==> ${item.globalLocation}`)
            }
            else if (item.mainLoopChoice == 'date range') {
                choice.push(`${item.mainLoopChoice} ==> ${item.globalLocation} ==> ${item.dateRangeWeatherStart} ==> ${item.dateRangeWeatherEnd}`)
            }
            else if (item.mainLoopChoice == 'radius') {
                choice.push(`${item.mainLoopChoice} ==> ${item.radiusChoice} ==> ${item.globalLocation}`)
            }

        }
    })

    choice.push('return to menu')
    return inquirer.prompt([{
        type: 'list',
        message: 'Select the range in miles to search',
        name: 'option',
        choices: choice,
        validate: (answer) => {
            if (answer.length > 1 || answer.length === 0) {
                return 'Error: You must select 1 choice only'
            } else {
                return true
            }
        }
    }])
}

module.exports = {
    history_inquirer
}