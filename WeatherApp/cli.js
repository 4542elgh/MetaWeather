const
    app = require('./app'),
    yargs = require('yargs')

const flags = yargs.usage('$0: Usage <cmd> [options]')
    .command({
        command:'search',
        desc: '-- Get WOEID at a specific location \n -l -- Specify location by "city"',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                desc: '-- Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.locationWeather_woeid(argv.location)
        }
    })
    .command({
        command:'weatherLocation',
        desc: '-- Get WOEID at a specific location \n -l -- Specify location by "city"',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'location',
                desc: '-- Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.locationWeather_woeid(argv.location)
        }
    })
    .command({
        command:'weatherLattLong',
        desc: '-- Get WOEID at a specific latitude and longitude \n -l -- Specify location by "latt,long"',
        builder:(yargs)=>{
            return yargs.option('l',{
                alias : 'lattlong',
                desc: '-- Getting weather for specific location'
            })
        },
        handler: (argv) => {
            app.lattLongWeather_woeid(argv.lattlong)
        }
    })
    .help()
    .argv