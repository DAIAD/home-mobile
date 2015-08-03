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

var ModelObserver = function() {
    EventBus.subscribe('model',this.changed);
};

ModelObserver.prototype = {
    changed: function() {
        //alert(JSON.stringify(AppModel.devices));
        app.UpdateDeviceSettingsToDb(JSON.stringify(AppModel.devices));
        window.localStorage.setItem('amphiro',JSON.stringify(AppModel.devices));
    }
};


/***********************/
/*Notification Manager*/
var NotificationManager = function(param) {
    this.param = param;
};

NotificationManager.prototype = {
    PairingCode : function(){
        EventBus.publish('ble/code/wrong');
    },
    PairingCodeCorrect : function(){
        EventBus.publish('ble/code/correct');
    },
    BleDisabled : function(){
        EventBus.publish('ble/disabled');
    },
    LoginFailed : function(){
        EventBus.publish('login/failed');
    },
    RegisterFailed : function(){
        EventBus.publish('register/failed',this.param);
    },
    ConnectionMessage : function(){
        EventBus.publish('connection/failed');
    }
};

var BluetoothNotifications = function() {
    EventBus.subscribe('ble/code/wrong', this.AmphiroInstallationFailed);
    EventBus.subscribe('ble/code/correct', this.AmphiroInstallationSuccess);
    EventBus.subscribe('ble/code/unpair', this.AmphiroUnpaired);
    EventBus.subscribe('ble/disabled', this.BleStatus);
    EventBus.subscribe('login/failed', this.LoginFail);
    EventBus.subscribe('register/failed',this.RegisterFailed);
    EventBus.subscribe('connection/failed',this.ConnectionFailed);
};

BluetoothNotifications.prototype = {
    AmphiroInstallationFailed: function() {
        navigator.notification.alert(
                                     'Pairing failed!Insert display code again..',  // message
                                     function(){},         // callback
                                     'amphiro b1',            // title
                                     'Done'                  // buttonName
                                     );
    },
    AmphiroInstallationSuccess: function() {
        navigator.notification.alert(
                                     'Amphiro has been paired!!',  // message
                                     function(){},         // callback
                                     'amphiro b1',            // title
                                     'Done'                  // buttonName
                                     );
    },
    AmphiroUnpaired: function() {
        navigator.notification.alert(
                                 'Amphiro has been unpaired!!',  // message
                                 function(){},         // callback
                                 'amphiro b1',            // title
                                 'Done'                  // buttonName
                                 );
    },

    BleStatus : function(){
        navigator.notification.alert(
                                     'Bluetooth is disabled!',  // message
                                     function(){},         // callback
                                     'amphiro b1',            // title
                                     'Done'                  // buttonName
                                     );
    },
    LoginFail : function(){
        navigator.notification.alert(
                                     'Login Failed!Please try again..',  // message
                                     function(){},         // callback
                                     'amphiro b1',            // title
                                     'Done'                  // buttonName
                                     );

    
    },
    RegisterFailed : function(param){
        navigator.notification.alert(
                                     'Register Failed!Email is unavailable.',  // message
                                     function(){},         // callback
                                     'amphiro b1',            // title
                                     'Done'                  // buttonName
                                     );

    
    },
    ConnectionFailed : function(){
        navigator.notification.alert(
                                     'Please enable Wi-Fi Connection or Cellular Data.',  // message
                                     function(){},         // callback
                                     'amphiro b1',            // title
                                     'Done'                  // buttonName
                                     );
        
        
    }

};


