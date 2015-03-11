var EventBus = {
    topics: {},
    
    subscribe: function(topic, listener) {
        // create the topic if not yet created
        if(!this.topics[topic]) this.topics[topic] = [];
    
        // add the listener
        this.topics[topic].push(listener);
    },
    
    publish: function(topic, data) {
        // return if the topic doesn't exist, or there are no listeners
        if(!this.topics[topic] || this.topics[topic].length < 1) return;
    
        // send the event to all listeners
        this.topics[topic].forEach(function(listener) {
                               listener(data || {});
                               });
    }
};


/* Check Network Connection */
function checkConnection() {
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

/*Subscriber to bluetooth connection*/
var bleConnection = function() {
    EventBus.subscribe('contextManager/ble', this.sendResponse);
};

bleConnection.prototype = {
    sendResponse: function(param) {
        
        if (param.flag == 'Connected'){
            $('#bleStatus').empty().append('Name: '+param.name+ '-Status: '+ param.flag );
        }
        
        if (param.flag == 'Disconnected'){
            $('#bleStatus').empty().append(' Status : '+ param.flag );
        }
    }
};

/*Bluetooth Manager*/
var BluetoothManager = function(param) {
    this.param = param;
};

BluetoothManager.prototype = {
    response: function() {
        EventBus.publish('contextManager/ble', this.param);
    }
};

/*Notification Manager*/
var NotificationManager = function(param) {
    this.param = param;
};

NotificationManager.prototype = {
    response: function() {
        EventBus.publish('notification/upload', this.param);
    }
};


/*Uploading data task*/
var uploadTask = function() {
    EventBus.subscribe('notification/upload', this.sendResponse);
};

uploadTask.prototype = {
    sendResponse: function(param) {
        if (param.flag == 'start'){
           
            var InternetConnection  =  checkConnection();
            
            if ( InternetConnection == 'WiFi connection' ){
                 //alert('wifi found')
               /*
                $.ajax({
                       type : "POST",
                       url : 'http://app-c1-n01.dev.daiad.eu:8080/api/v1/amphiro',
                       dataType : 'json',
                       data : JSON.stringify(packets),
                       contentType : "application/json"
                       }).done(function(data) {
                               alert('done');
                               }).fail(function() {
                                       alert('fail');
                                       }).always(function() {
                                                 alert('always');
                                                 });
           
            
           */
            }
        }
    }
};


/*
 
 Scheduler for all the asychronous tasks.
 Directly send request to web service when wifi is detected and BLE is disconnected
 
 Simple case!!
 
 Todo: implement specific intervals 
 
 */

/*Scheduler*/
var scheduler = function() {
    EventBus.subscribe('contextManager/ble', this.sendResponse);
};

scheduler.prototype = {
    sendResponse: function(param) {
       if (param.flag == 'Disconnected'){
           $('#resultDiv').append('<tr><td>Scheduler :: Bluetooth is Disconnected. Checking Wifi Connection..</td></tr>');
           resultDiv.scrollTop = resultDiv.scrollHeight;
           var InternetConnection  =  checkConnection();
           
           if ( InternetConnection == 'WiFi connection' ){
           
               EventBus.publish('upload', 'start');
           
           }
       }
    }
};


