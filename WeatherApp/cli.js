const
    app = require('./app'),
    yargs = require('yargs'),
    colors = require('colors'),
    utilities = require('./utils/utilities')

const flags = yargs.usage('$0: Usage <cmd> [options]')
    .command({
        command:'menu',
        desc: 'enter IO Loop, the AIO weather search',
        handler: () => {
            app.menu_recur()
        }
    })
    .command({
        command:'weatherLattLong',
        desc: 'return WOEID at a specific latitude and longitude',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'lattlong',
                describe: 'getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.lattLongWeather(argv.lattlong)
        }
    })
    .command({
        command:'searchDistance <location>',
        desc: 'return surrounding cities and forecasts within the radius from the location',
        handler: (argv) => {
            app.surroundingCitiesWeather(argv.location, true)
        }
    })
    .command({
        command:'searchWeatherAndDistance <location>',
        desc: 'return surrounding cities that have the weather conditions and are within the radius from the location',
        handler: (argv) => {
            app.searchWeatherWithinRange(argv.location, true)
        }
    })
    .command({
        command:'search <location> [dateRange..]',
        desc: 'search <location> return today weather of location (major city)\n' 
             +'search <location> [startDate endDate] return a 7-day forecasts from any date between 1/1/14 to today.',
        handler: (argv) => {
            let validDates = false
            if(argv.dateRange.length === 2 && utilities.dateValid(argv.dateRange[0]) 
                && utilities.dateValid(argv.dateRange[1])) {
                    if(new Date(argv.dateRange[0]) <= new Date(argv.dateRange[1])) {
                        validDates = true
                    }
                }
            if(validDates || argv.dateRange.length === 0) { 
                app.filterSearch(argv.location, argv.dateRange, true)
            }
            else {
                console.log( colors.black.bgYellow('Error. Invalid date format. Type `help` for the help menu.') )
            }
        }
    })
    .help('help')
    .argv