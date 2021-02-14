const request = require("postman-request")

const mapboxEndpoint = 'mapbox.places'
const mapboxToken = 'pk.eyJ1IjoiZnhobHMiLCJhIjoiY2trenJoMm15MGFiMjJ2cW8xaDU3aG8yOCJ9.PPk0QEvTxMFAGe6FNRWWaQ'

// const mapboxURL = 'https://api.mapbox.com/geocoding/v5/'+mapboxEndpoint+'/'+encodeURICompnent(address)+'.json?access_token='+ mapboxToken +'&limit=1'


const geocode = (address, callback) => {
    const mapboxURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+encodeURIComponent(address)+'.json?access_token=pk.eyJ1IjoiZnhobHMiLCJhIjoiY2trenJoMm15MGFiMjJ2cW8xaDU3aG8yOCJ9.PPk0QEvTxMFAGe6FNRWWaQ&limit=1'
    request({url:mapboxURL, json:true},(error, {body})=>{
        if(error){
            callback('unable to connect to services', undefined)
        }
        else if(body.features.length === 0){
            callback('unable to find',undefined)
        }
        else{
            callback(
                undefined,{
                    latitude: body.features[0].center[0],                    
                    longitude: body.features[0].center[1],
                    placeName: body.features[0].place_name
                }
            )
        }

    }
    
    
    )
}



module.exports = geocode