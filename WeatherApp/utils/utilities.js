
const milesToMeters = (miles) => {
    return miles * 1609.34
}

const metersToMiles = (meters) => {
    if(meters === 0){
        return 0
    }
    else
        return (meters / 1609.34).toPrecision(4)
}

const CtoF = (celsius) =>{
    const farenheit = (celsius * (9 / 5) + 32).toPrecision(4)
    return farenheit
}

module.exports = {
    milesToMeters,metersToMiles,CtoF
}