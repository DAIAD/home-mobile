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
    
    $('#resultDiv').append('<tr><td> Connection Type :: ' + states[networkState] + '</td></tr>');
    resultDiv.scrollTop = resultDiv.scrollHeight;
    return states[networkState];

}

/*Subscriber to bluetooth connection*/
var bleConnection = function() {
    EventBus.subscribe('contextManager/ble', this.sendResponse);
};

bleConnection.prototype = {
    sendResponse: function(param) {
        
        if (param.flag == 'connected'){
            
            $('#resultDiv').append('<tr><td>Device(Name-ID) :: '+ param.name + ' : ' + param.id + '  >>>  Device Status :: '+ param.flag +'</td></tr>');
            $('#deviceList').append(param.name +'</br>');
            resultDiv.scrollTop = resultDiv.scrollHeight;
        }
        
        if (param.flag == 'Disconnected'){
            $('#deviceList').empty();
            $('#resultDiv').append('<tr><td>Device(Name-ID) :: ' + param.id + ' >>>  Device Status :: ' + param.flag + '</td></tr>');
            $('#resultDiv').append('<tr><td> Transmitted packets :: ' + packets.measurements.length +  '</td></tr>');
            resultDiv.scrollTop = resultDiv.scrollHeight;
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
                
                $('#resultDiv').append('<tr><td>'+ new Date() +' :: Wifi detected!'+ param.id +' trying remote connection with server..</td></tr>');
                $('#resultDiv').append('<tr><td> Uploading  :: ' + packets.measurements.length +  ' packets .. </td></tr>');
                resultDiv.scrollTop = resultDiv.scrollHeight;
            
            
            /*Ajax request - post data*/
            /*
             
             $.ajax({
             type: "POST",
             url: "",
             // The key needs to match your method's input parameter (case-sensitive).
             data: JSON.stringify({ Packets: packets }),
             contentType: "application/json; charset=utf-8",
             dataType: "json",
             success: function(data){alert(data);},
             failure: function(errMsg) {
             alert(errMsg);
             }
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


