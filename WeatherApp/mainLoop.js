const inquirer = require('inquirer');

const ui = ()=>{
    return inquirer.prompt([{
        type:'input',
        message:'Enter your location:',
        name:'location',
        validate:(choices)=>{
            if(choices.length==0 || choices<0){
                return false;
            }
            else{
                if (choices.replace(/ /g,'') == 0){
                    return false
                }else{
                return true
                }
            }
        }
    }])
}

const menu = ()=>{
    return inquirer.prompt([{
        type:'list',
        message:'Menu:',
        name:'option',
        choices:[new inquirer.Separator('---Search---'),'today','date range','radius',new inquirer.Separator('-----------'),'history','exit'],
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

const radius_submenu = ()=>{
    return inquirer.prompt([{
        type:'list',
        message:'Menu:',
        name:'option',
        choices:[new inquirer.Separator('---Search By Radius---'),'location + radius','location + weather condition + radius',new inquirer.Separator('-----------'),'return to menu'],
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

module.exports = {
    ui, menu, radius_submenu
}