//
// MMM-WeatherBackground
//

Module.register("MMM-WeatherBackground", {
  defaults: {
    source: "currentweather",
    targetDOM: ".fullscreen.below", //null or DomSelector for target. (if null, currentweather will be targeted.)
    notification: null, //if you use other weather module, modify this.
    defaultCollection: "featured", // If not assigned in collections, this will be used.
    collections: {
      "clear-day": "1877260", // assign specific collection to keyword.
    },
    sources: {
      "currentweather": {
        notification: "CURRENTWEATHER_DATA", //if you use other weather module, modify this.
        payloadConverter: (payload)=> {
          var iconMap = {
            "01d": "sunny",
      			"02d": "clouds",
      			"03d": "cloudy",
      			"04d": "windy",
      			"09d": "heavy rain",
      			"10d": "rain",
      			"11d": "thunderstorm",
      			"13d": "snow",
      			"50d": "fog",
      			"01n": "clear night",
      			"02n": "cloudy night",
      			"03n": "cloudy night",
      			"04n": "cloudy night",
      			"09n": "night rain",
      			"10n": "night rain",
      			"11n": "night thunderstorm",
      			"13n": "night snow",
      			"50n": "windy night"
          }
          return iconMap[payload.data.weather[0].icon] //return value be used for search keyword.
        },
      },
      "MMM-NOAA3": {
        notification: "WEATHER",
        payloadConverter:(payload)=>{
          var n = (moment().isAfter(moment(payload.sunset))) ? "night" : "day"
          var ret = payload.icon
          var iconMap = {
              "tstorms": "thunderstorm",
              "chancesnow": "snow"
          }
          if (ret in iconMap) {
            ret = iconMap[ret]
          }
          return ret + " " + n
        }
      },
      "MMM-DarkSkyForecast": {
        notification: "DARK_SKY_FORECAST_WEATHER_UPDATE",
        payloadConverter:(payload)=>{
          return payload.currently.icon
        }
      }
    }
  },

  start: function() {
    this.source = (typeof this.config.sources[this.config.source] !== undefined) ? this.config.sources[this.config.source] : this.config.sources["currentweather"]
    this.listenNotification = (this.config.notification) ? this.config.notification : this.source.notification
    this.payloadConverter = (this.config.payloadConverter) ? this.config.payloadConverter : this.source.payloadConverter
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "DOM_OBJECTS_CREATED" :
        break
      case this.listenNotification :
        var target = (this.config.targetDOM) ? this.config.targetDOM : "#" + sender.data.identifier
        var t = this.payloadConverter(payload)
        this.loadImage(target, t)
        break
    }
  },

  loadImage: function(target, description) {
    console.log("[WTHBGR] Image searching:", description)
    var collection = (Object.keys(this.config.collections).indexOf(description) >= 0)
      ? "collection/" + this.config.collections[description]
      : this.config.defaultCollection
    var drawImage = (dom) => {
      var timer = setTimeout(()=>{
        var seed = Date.now()
        var url = `https://source.unsplash.com/${collection}/?${description}&s=${seed}`
        console.log(url)
        dom.style.backgroundSize = "cover"
        dom.style.backgroundPosition = "center"
        dom.style.transition = "background-image 1s ease 1s"
        var url = `url('${url}')`
        dom.style.backgroundImage = url
        dom.style.backgroundPosition = "center"
      }, 1000)
    }
    var doms = document.querySelectorAll(target)
    if (doms.length <= 0) {
      console.log("[WTHBGR] DOM not found.", target)
      return;
    }
    doms.forEach((dom)=>{
      drawImage(dom)
    })
  }
})
