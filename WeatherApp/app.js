const
    weather = require('../MetaWeatherAPI/index'),
    CLI = require('./InteractiveCLI'),
    inquirer = require('inquirer'),
    test = require('./test');


const ui = ()=>{
    return inquirer.prompt([{
        type:'input',
        message:'Enter your location:',
        name:'location',
        validate:(choices)=>{
            if(choices>1 || choices<0){
                return false;
            }
            else{
                return true
            }
        }
    }])
}

const menu = ()=>{
    return inquirer.prompt([{
        type:'list',
        message:'Menu:',
        name:'option',
        choices:[new inquirer.Separator('---Search---'),'Today','Date Range','Radius',new inquirer.Separator('-----------'),'history','exit'],
        validate:(choices)=>{
            if(choices>1 || choices<0){
                return false;
            }
            else{
                return true
            }
        }
    }])
}

const menu_recur = ()=>{
        menu().then(result=>{
            switch(result.option){
                case 'history' : {
                    ui().then(result=>{
                      test.locationWeather_woeid(result.location);
                      setTimeout(()=>{
                          console.log(test.returnString());
                          return menu_recur()}
                          ,5000)
                    })
                    break;
                }
                case 'exit' : {
                    process.exit(0)
                    break;
                }
            }
    })
}
module.exports = {
    menu_recur
}