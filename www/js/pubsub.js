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


var apiResponses = function(param){
    this.param = param;
};

apiResponses.prototype = {
    done : function(){
        EventBus.publish(this.param.url,this.param.total);
    },
    fail : function(){
        EventBus.publish(this.param.url,this.param.total);
    },
    always : function(){
        EventBus.publish(this.param.url,this.param.total);
    }
};

var refreshApplicationManager = function(){};

refreshApplicationManager.prototype = {
    resume : function(){
        EventBus.publish('application/resume');
    },
    pause : function(){
        EventBus.publish('application/pause');
    },
    req_profile : function(){
        EventBus.publish('refresh/profile');
    },
    profileCompleted : function(){
        EventBus.publish('refresh/profile/completed');
    },
    loginCompleted : function(){
        EventBus.publish('login/profile/completed');
    },
    callsCompleted : function(){
        EventBus.publish('refresh/profile/set');
    },
    ready : function(){
        EventBus.publish('refresh/profile/ready');
    }
};


var profileManager = function(param){
    this.param = param;
};

profileManager.prototype = {
    new_member : function(){
        EventBus.publish('member/new',this.param);
    },
    member_saved : function(){
        EventBus.publish('member/new/saved',this.param);
    },
    delete_member : function(){
        EventBus.publish('member/delete',this.param);
    },
    newProfilePhoto : function(){
        EventBus.publish('profile/photo',this.param);
    },
};

var analyticsManager = function(param){
    this.param = param;
};

analyticsManager.prototype = {
    refresh : function(){
        EventBus.publish('analytics/refresh');
    }
};

var meterManager = function(param){
    this.param = param;
};

meterManager.prototype = {
    store : function(){
        EventBus.publish('meter/data',this.param);
    }
};


var CryptoManager = function(param) {
    this.param = param;
};

CryptoManager.prototype = {
    
    decryptedRealPacket : function(){
        EventBus.publish('crypto/decrypt/real',this.param);
    },
    decryptedHistoryPacket : function(){
        EventBus.publish('crypto/decrypt/history',this.param);
    },
    newAmphiroDevice : function(){
        EventBus.publish('crypto/decrypt/newdevice',this.param);
    }
};


var ContextManager = function(param) {
    this.param = param;
};

ContextManager.prototype = {
    
    networkStatusChangedEnabled : function(){
        EventBus.publish('context/network/changed/enabled');
    },
    networkEnabled : function(){
        EventBus.publish('context/network/enabled',this.param);
    },
    networkDisabled: function(){
        EventBus.publish('context/network/disabled',this.param);
    },
    bluetoothEnabled : function(){
        EventBus.publish('context/bluetooth/enabled',this.param);
    },
    bluetoothDisabled : function(){
        EventBus.publish('context/bluetooth/disabled',this.param);
    }
};


var deviceProperty = function(param) {
    this.param = param;
};

deviceProperty.prototype = {
    name : function(){
        EventBus.publish('device/property/name',this.param);
    },
    settings : function(){
        EventBus.publish('device/property/settings',this.param);
    }
};


var NotificationManager = function(param) {
    this.param = param;
};

NotificationManager.prototype = {
    changed : function() {
        EventBus.publish('api/server/pass/changed');
    },
    invalidPIN : function() {
        EventBus.publish('api/server/pin/wrong');
    },
    pinUsed : function(){
        EventBus.publish('api/server/pin/used');
    },
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
        EventBus.publish('login/failed',this.param);
    },
    RegisterFailed : function(){
        EventBus.publish('register/failed',this.param);
    },
    ConnectionMessage : function(){
        EventBus.publish('connection/failed');
    },
    serverMessage : function(){
        EventBus.publish('connection/server/error');
    },
    newAlert : function(){
        EventBus.publish('app/notifications/alert');
    },
    newTip: function(){
        EventBus.publish('app/notifications/tip');
    },
    newInsight : function(){
        EventBus.publish('app/notifications/insight');
    },
    amphiroConfiguration : function(){
        EventBus.publish('app/configuration',this.param);
    },
    deviceExists : function(){
        EventBus.publish('device/exists',this.param);
    }
    
};


var EventSubscribers = function() {
    //meter related events
    EventBus.subscribe('meter/data',app.storeMeterData);
    //AMPHIRO EVENTS
    EventBus.subscribe('crypto/decrypt/newdevice',app.deviceregister);
    EventBus.subscribe('crypto/decrypt/real',app.storeRealPacket);
    EventBus.subscribe('crypto/decrypt/real',app.viewRealPacket);
    EventBus.subscribe('crypto/decrypt/real',app.showDataToTimer);
    EventBus.subscribe('crypto/decrypt/real',app.handShake);
    EventBus.subscribe('crypto/decrypt/real',app.requestFromDevice);
    EventBus.subscribe('crypto/decrypt/real',app.runBluetoothQ);
    EventBus.subscribe('crypto/decrypt/real',app.checkPendingRequests);
    EventBus.subscribe('crypto/decrypt/history',app.storeHistoryPacket);
    EventBus.subscribe('crypto/decrypt/history',app.forceDisconnect);
    
    //CONTEXT EVENTS
    EventBus.subscribe('context/network/changed/enabled',app.requestProfile);
    //EventBus.subscribe('context/network/changed/enabled',app.uploadData);
    EventBus.subscribe('context/network/enabled',app.enableViewContents);
    EventBus.subscribe('context/network/disabled',app.disableViewContents);
    //EventBus.subscribe('context/network/disabled', app.saveApplication);
    EventBus.subscribe('context/bluetooth/enabled',app.enableBluetoothView);
    EventBus.subscribe('context/bluetooth/disabled',app.disableBluetoothView);
    
    //NOTIFICATION EVENTS
    EventBus.subscribe('api/server/pass/changed', app.passwordChangedMessage);
    EventBus.subscribe('api/server/pin/wrong', app.pinMismatch);
    EventBus.subscribe('api/server/pin/used', app.pinAlreadyUsed);
    EventBus.subscribe('ble/code/wrong', app.amphiroInstallationFailed);
    EventBus.subscribe('device/exists',app.amphiroPairingFailed);
    EventBus.subscribe('login/failed', app.loginFail);
    EventBus.subscribe('register/failed',app.registerFailed);
    EventBus.subscribe('connection/failed',app.connectionFailed);
    EventBus.subscribe('connection/server/error',app.serverNotResponding);
    EventBus.subscribe('settings', app.BluetoothSupervisor);
    EventBus.subscribe('disconnect', app.BluetoothSupervisor);
    //DEVICE EVENTS
    EventBus.subscribe('device/property/name', app.updateViews);
    EventBus.subscribe('device/property/name', app.updateDeviceToServer);
    EventBus.subscribe('device/property/settings', app.updateDeviceToServer);
    EventBus.subscribe('device/property/settings', app.saveApplication);
    //MEMBER EVENTS
    EventBus.subscribe('member/new', app.uploadData);
    EventBus.subscribe('member/new', app.storeNewMember);
    EventBus.subscribe('member/new', app.uploadHousehold);
    EventBus.subscribe('member/new', app.refreshHouseholdlist);
    EventBus.subscribe('member/new', app.computeProfileComplete);
    EventBus.subscribe('member/new', app.memberAddedProfile);
    EventBus.subscribe('member/delete', app.updateMemberActiveState);
    EventBus.subscribe('member/delete', app.refreshHouseholdlist);
    EventBus.subscribe('member/delete', app.uploadHousehold);
    
    EventBus.subscribe('profile/photo', app.updatePhotoDB);
    EventBus.subscribe('profile/photo', app.setUserPhotoProfile);
    EventBus.subscribe('profile/photo', app.savePhotoProfile);
    EventBus.subscribe('profile/photo', app.saveApplication);
    
    //LOAD PROFILE EVENTS
    EventBus.subscribe('refresh/profile',app.requestProfile);  //this triggers refresh/profile/completed
    EventBus.subscribe('refresh/profile',app.uploadData);
    EventBus.subscribe('refresh/profile/completed',app.requestConfiguration);
    EventBus.subscribe('refresh/profile/completed',app.ackUserMessages);
    EventBus.subscribe('refresh/profile/completed',app.getUserMessages);
    EventBus.subscribe('refresh/profile/completed',app.uploadLabeledData);
    EventBus.subscribe('refresh/profile/completed',app.goToProfileSet); //this triggers refresh/profile/set
    EventBus.subscribe('refresh/profile/set',app.updateMeterData);
    EventBus.subscribe('refresh/profile/set',app.updateAmphiroData); //this triggers refresh/profile/ready
    EventBus.subscribe('refresh/profile/set',app.requestForecasting);
    EventBus.subscribe('refresh/profile/set',app.goToProfileReady);
    EventBus.subscribe('refresh/profile/ready',app.clearDeviceConnection);
    EventBus.subscribe('refresh/profile/ready',app.startApplication);
    EventBus.subscribe('refresh/profile/ready',app.bluetoothRunning);
    //CONSUMPTION EVENTS
    EventBus.subscribe('analytics/refresh', app.refreshAnalytics);
    
    //APPLICATION STATE EVENTS
    EventBus.subscribe('application/resume',app.requestProfile);
    EventBus.subscribe('application/pause',app.sendTimeAnalytics);
    EventBus.subscribe('application/pause',app.waitDeviceConnection);
    
    
    /*API EVENTS*/
    EventBus.subscribe('/api/v1/profile/load/done',app.reqProfileResponse);
    EventBus.subscribe('/api/v1/profile/load/always',app.alwaysRequestProfile);
    EventBus.subscribe('/api/v1/auth/login/done',app.loginDone);
    EventBus.subscribe('/api/v1/auth/login/fail',app.loginFail);
    EventBus.subscribe('/api/v1/auth/login/always',app.loginAlways);
    EventBus.subscribe('/api/v1/user/register/done',app.registerUserDone);
    EventBus.subscribe('/api/v1/user/register/fail',app.registerUserFail);
    EventBus.subscribe('/api/v1/user/register/always',app.registerUserComplete);
    EventBus.subscribe('/api/v1/device/register/done',app.registerDeviceSuccess);
    EventBus.subscribe('/api/v1/device/register/fail',app.registerDeviceFail);
    EventBus.subscribe('/api/v1/device/register/always',app.registerDeviceComplete);
    EventBus.subscribe('/api/v1/user/password/reset/token/create/done',app.resetPassResponseSuccess);
    EventBus.subscribe('/api/v1/user/password/reset/token/create/fail',app.resetPassResponseFail);
    EventBus.subscribe('/api/v1/user/password/reset/token/create/always',app.resetPassResponseAlways);
    EventBus.subscribe('/api/v1/user/password/reset/token/redeem/done',app.redeemPassResponse);
    EventBus.subscribe('/api/v1/user/password/reset/token/redeem/fail',app.redeemPassResponseFail);
    EventBus.subscribe('/api/v1/user/password/reset/token/redeem/always',app.redeemPassResponseAlways);
    EventBus.subscribe('/api/v1/user/password/change/done',app.changePassResponse);
    EventBus.subscribe('/api/v1/user/password/change/fail',app.changePassResponseFail);
    EventBus.subscribe('/api/v1/user/password/change/always',app.changePassResponseAlways);
    EventBus.subscribe('/api/v2/data/store/done', app.dtUploadSuccess);
    EventBus.subscribe('/api/v1/device/config/done',app.deviceConfigurationDone);
    EventBus.subscribe('/api/v1/message/done',app.messagesLoadDone);
    EventBus.subscribe('/api/v1/message/acknowledge/done',app.ackMsgDone);
    EventBus.subscribe('/api/v2/data/session/member/done',app.labelDataDone);
    EventBus.subscribe('/api/v1/meter/history/done', app.meterHistoryDone);
    EventBus.subscribe('/api/v2/device/session/query/done',app.amphiroSessionsDone);
    EventBus.subscribe('/api/v1/data/meter/forecast/done',app.forecastingDataDone);
    EventBus.subscribe('/api/v2/data/session/ignore/fail', app.ignoreShowerFail);
    EventBus.subscribe('/api/v1/comparison/done',app.socialDataDone);
    EventBus.subscribe('/api/v1/comparison/fail',app.socialDataFail);
    EventBus.subscribe('/api/v2/device/session/done', app.amphiroMeasurementsDone);
    EventBus.subscribe('/api/v2/device/session/fail', app.amphiroMeasurementsFail);
    EventBus.subscribe('/api/v2/device/session/always', app.amphiroMeasurementsAlways);
    //EventBus.subscribe('/api/v1/profile/save',);
    //EventBus.subscribe('/api/v1/profile/notify',);
    //EventBus.subscribe('/api/v1/device/update',);
    //EventBus.subscribe('/api/v1/device/notify',);
    //EventBus.subscribe('/api/v1/household',);
    
};


