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
            app.surroundingCitiesWeather(argv.location)
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
            app.searchWeatherWithinRange(argv.location)
        }
    })
    .help('help')
    .argv
