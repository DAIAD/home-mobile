/*define(function(require) {
       
       return {
       
       checkConnection : function () {
       
        var networkState = navigator.connection.type,
            states = {};
       
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
       
        return states[networkState];
       
        }
       
       };
       
       });*/

/*var networkWatcher = function(param) {};

networkWatcher.prototype = {

    InternetWatcher : function(){
        
        var ctx = new ContextManager();
        
        if( this.checkConnection() === 'No network connection') {
            ctx.networkDisabled();
        } else {
            ctx.networkEnabled();
        }
        
    },
    checkConnection : function () {
        
        var networkState = navigator.connection.type;
        
        var states = {};
        
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
     
        return states[networkState];
    }

};*/



