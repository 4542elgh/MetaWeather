# MetaWeather Restful API Request App  ![alt text](https://www.metaweather.com/static/img/weather/png/64/s.png "MetaWeather Shower logo")

Based on MetaWeather api: [https://www.metaweather.com/api/](https://www.metaweather.com/api/)

### Required Modules:
* superagent 
   - Making ajax request and store the response into promise
* yargs
   - Command line Gui-like utilities for building custom commands

### This app should be able to get weather by:
* pass in a city's name
   - Select from a list of possible locations
* pass in latitude and longitude
   - Select Location based on distance from such latitude and longitude
* pass in a location and a date
   - To view past, current or maximum 10 days forcast of weather
