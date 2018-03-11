const
    app = require('./app'),
    yargs = require('yargs')

const flags = yargs.usage('$0: Usage <cmd> [options]')
    .command({
        command:'weatherLocation',
        desc: 'Get WOEID at a specific location',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                describe: 'Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.locationWeather(argv.location)
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
        command:'search <location> [dateRange..]',
        desc: 'Search weather by location',
        handler: (argv) => {
            if(argv.dateRange.length == 2) { //if we have a daterange, execute the search
                app.filterSearch(argv.location, argv.dateRange)
            }
            console.log('Unable to execute command. Date range input was invalid')
        }
    })
    .help('help')
    .argv