const superagent = require('superagent'),
    config = require('./config');

const fetch_data = (command)=>{
    return superagent
        .get(`${config.url}${command}`)
        .then(response=>{
            return response.body
        })
        .catch(err=>{
            return err.response.body
        })
}

exports.woeid_by_query = (query)=>{
    return fetch_data(`location/search/?query=${query}`)
}

exports.woeid_by_lattlong = (latt,long)=>{
    return fetch_data(`location/search/?lattlong=${latt},${long}`);
}

exports.get_weather_by_woeid = (woeid)=>{
    return fetch_data(`location/${woeid}/`);
}

exports.get_weather_by_woeid_at_date = (woeid,year,month,day)=>{
    return fetch_data(`location/${woeid}/${year}/${month}/${day}`);
}
