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

const radius_submenu = ()=>{
    return inquirer.prompt([{
        type:'list',
        message:'Menu:',
        name:'option',
        choices:[new inquirer.Separator('---Search By Radius---'),'Location + Radius','Location + Weather Condition + Radius',new inquirer.Separator('-----------'),'exit'],
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
    ui,menu,radius_submenu
}