const
    app = require('./app'),
    yargs = require('yargs')

const flags = yargs.usage('$0: Usage <cmd> [options]')
    .command({
        command:'menu',
        desc: '-- MetaWeather Main Menu"',
        handler: () => {
            app.menu_recur()
        }
    })
    .command({
        command:'weatherLattLong',
        desc: 'Get WOEID at a specific latitude and longitude',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'lattlong',
                describe: 'Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.lattLongWeather(argv.lattlong)
        }
    })
    .command({
        command:'searchDistance',
        desc: 'Returns the forecast of the surrounding cities within the user specified range.',
        alias: 'sd',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                describe: 'Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.surroundingCitiesWeather(argv.location, true)
        }
    })
    .command({
        command:'searchWeatherAndDistance',
        desc: 'Searches the surrounding cities with the user specified weather condition, and range.',
        alias: 'wd',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                describe: 'Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.searchWeatherWithinRange(argv.location, true)
        }
    })
    .command({
        command:'search <location> [dateRange..]',
        desc: 'Search weather by location',
        handler: (argv) => {
            if(argv.dateRange.length === 2 || argv.dateRange.length === 0) { //if we have a daterange, execute the search
                app.filterSearch(argv.location, argv.dateRange, true)
            }
            else {
                console.log('Unable to execute command. Date range input was invalid')
            }
        }
    })
    .help('help')
    .argv
