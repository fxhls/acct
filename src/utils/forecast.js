const request = require('postman-request')

const forecast = (long, lat, callback) => {
    const url = 'http://api.weatherstack.com/current?access_key=f63de01c128368340021d13e4db5d846&query='+lat+','+long
    request({url:url,json:true},(error,{body}) => {
            if(error){
                callback('error!',undefined)
                }
            else if(body.current === undefined){
                callback('error!',undefined)
            }
            else{
                const data = body.current
                callback(undefined,
                    data.weather_descriptions[0]+'\nIt is currently '+data.temperature+' degrees\nThere is '+data.precip+'% chance of rain')
            }
        }
    )
}

module.exports = forecast

