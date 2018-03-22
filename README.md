# MetaWeather Restful API Request App  ![alt text](https://www.metaweather.com/static/img/weather/png/64/s.png "MetaWeather Shower logo")

Based on MetaWeather api: [https://www.metaweather.com/api/](https://www.metaweather.com/api/)

### Required Modules:
* superagent 
   - To make AJAX request and store the response into promise
* yargs
   - To create custom commands in CLI
* inquirer
   - To prompt users for selections
* colors
   - To color the table and some text
* cli-table2
   - To print table

### This app should be able to get weather by:
* location (if applicable by MetaWeather)
   - return today's forecast of the given location
* location and date range
   - return the forecasts of the given date range and location
* radius
   - return all locations with its forecasts within the given radius
* radius and weather condition(s)
   - return all location with its forecasts within the given radius and satify weather condition(s)

### Other Attributes
* provide a table view of the results
* provide an IO-Gui experience for users
   - users can select the searches and history
* display history
   - keep track of users' commands
   - allow users to select which commands to execute from the history
   - return the most recent five searches
* provide help menu in CLI
   - return a help menu of commands and its descriptions
