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
        command:'history',
        desc: 'displays previous search results',
        builder:(yargs)=>{
            return yargs.option('h',{
                alias : 'history',
                describe: 'displays history'
            })
        },
        handler: (argv) => {
            app.displayHistory()
        }
    })
    .help('help')
    .argv