var locationManager = function(param) {
    this.param = param;
};

locationManager.prototype = {

    requestLocation : function(){
        
        successFunction = function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            getCoordinates(lat,lng);
        };
        
        errorFunction = function(){
            app.user.location.address = null;
            app.user.location.city = null;
            app.user.location.country = null;
        };
        
        getCoordinates = function(lat,long){
            $.ajax({
                   dataType:"json",
                   url  :' http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&sensor=true',
                   timeout:8000 //8 second timeout
                   })
            .done(function(data){
                  
                  if (data.results.length > 0) {
                        //REMOVE
                        app.user.location.address = data.results[0].formatted_address;
                  
                        for (var j=0; j<data.results[0].address_components.length; j++) {
                  
                            if (data.results[0].address_components[j].types[0] == "locality") {
                  
                                app.user.location.city = data.results[0].address_components[j].long_name;
                  
                            }
                  
                            if (data.results[0].address_components[j].types[0] == "country") {
                  
                                app.user.location.country = data.results[0].address_components[j].long_name; //REMOVE
                  
                                app.user.location.country_short = data.results[0].address_components[j].short_name; //REMOVE
                  
                            }
                  
                        }
                           
                  } else {
                  
                        app.user.location.address = null; //REMOVE
                  
                        app.user.location.city = null; //REMOVE
                  
                        app.user.location.country = null; //REMOVE
                  
                  }
                  
                  })
            .fail(function(){});
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }
    },
    getLocale : function(){
        navigator.globalization.getLocaleName(
                                              function (locale) { //success
                                              alert(JSON.stringify( locale ) );
                                              },function(){ //fail
                                              
                                              }
                                              );
    },

};
