const inquirer = require('inquirer');

exports.interactiveCLI = (locations)=>{
    return inquirer.prompt([{
        type:'list',
        message:'Select a location',
        name:'location',
        choices:locations,
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