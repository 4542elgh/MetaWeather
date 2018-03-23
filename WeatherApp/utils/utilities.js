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

const dateValid = (choice) => {
    let tempDate = new Date(choice)

    if(tempDate.toString() === 'Invalid Date'){
        return false;
    }

    let lowerBound = new Date('2/28/13')
    let upperBound = new Date() //today
    if(tempDate > lowerBound && tempDate <= upperBound) {
        return true;
    }
    return false;
}

module.exports = {
    milesToMeters, metersToMiles, CtoF, dateValid
}