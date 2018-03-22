const
    app = require('./app'),
    yargs = require('yargs'),
    colors = require('colors')

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
        command:'searchDistance',
        desc: 'return surrounding cities and forecasts within the radius from the location',
        alias: 'sd',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                describe: 'get weather for specific location'
            })
        },
        handler: (argv) => {
            app.surroundingCitiesWeather(argv.location, true)
        }
    })
    .command({
        command:'searchWeatherAndDistance',
        desc: 'return surrounding cities that have the weather conditions and are within the radius from the location',
        alias: 'wd',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                describe: 'get weather for specific location'
            })
        },
        handler: (argv) => {
            app.searchWeatherWithinRange(argv.location, true)
        }
    })
    .command({
        command:'search <location> [dateRange..]',
        desc: 'search <location> return today weather\n' 
             +'search <location> [dateRange..] return the weather within the ranges of dates',
        handler: (argv) => {
            if(argv.dateRange.length === 2 || argv.dateRange.length === 0) { 
                app.filterSearch(argv.location, argv.dateRange, true)
            }
            else {
                console.log( colors.cyan('Unable to execute command. Date range input was invalid') )
            }
        }
    })
    .help('help')
    .argv
