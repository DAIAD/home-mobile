/** All Bluetooth functions for the communication between the peripheral(amphiro b1) and the DAIAD application.
 * @namespace Bluetooth
 * @name Bluetooth Requests
 */
function unecryptedPacket(data){
    
    ble.write(
              AppModel.selectedToPairWithID,
              app.amphiro.serviceUUID,
              app.amphiro.txCharacteristic,
              data,
              function() {},
              function() {}
              );
    
}

/**
 * This is a generic bluetooth function when the DAIAD application wants to write specific configuration block #1,#2,#3,#4 to the amphiro b1. Implemented for remote management operations.
 * @memberof Bluetooth Requests
 * @function
 * @param {array} data Array of values
 * @param {integer} deviceWithIndex the device position in the array of existing devices
 * @param {integer} block number of block to write #1,#2,#3,#4
 */

function writePacket(data,obj,block){
    
    onConnect = function() {
        
        ble.startNotification(
                              obj.macAddress,
                              app.amphiro.serviceUUID,
                              app.amphiro.rxCharacteristic,
                              onData,
                              onError1
                              );
        
        
        var newencryption = new cryptoService({
                                              buf : bluetoothBuffers.setConfigBlock(data,block),
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        newencryption.encrypt();
        
    },
    
    onData = function(data) {
        
        var newdecryption = new cryptoService({
                                              data : data,
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        newdecryption.decrypt();
        
    },
    
    onError = function() {
        
        bluetoothLocker = 0;
        
        app.bluetoothRunning();
    },
    
    onError1 = function() {
        
        bluetoothLocker = 0;
        
        app.bluetoothRunning();
    };
    
    ble.connect(
                obj.macAddress,
                onConnect,
                onError
                );
}


/**
 * Shows the manufacturer code on the amphiro b1 LCD display(e.g. ABCD 1234). This code necessary for the first pairing procedure and other internal operations.
 * @memberof Bluetooth Requests
 * @function
 */
function requestCodeFromPeripheral(){
    
    onConnect = function() {
      
        ble.startNotification(
                              AppModel.selectedToPairWithID,
                              app.amphiro.serviceUUID,
                              app.amphiro.rxCharacteristic,
                              onData,
                              onError1
                              );
        
        unecryptedPacket(bluetoothBuffers.codePacket());
        
    },
    
    onData = function(data) {
        
        AppModel.PingData = ab2str(data);
        
        app.changeToPage('#install_part_6');
    
    },
    
    onError1 = function() {},
    
    onError = function() {
        
        if(!AppModel.PingData) {
            
            setTimeout(function(){
                       requestCodeFromPeripheral();
                       },1500);
            
        } else {
            
            if( app.getSystemPlatform() === 'android') {
            
                var checkID = findDeviceIndex(app.user.profile.devices,'macAddress',AppModel.selectedToPairWithID);
                
                if(!checkID && AppModel.livePage == 'install_part_6') {
                
                    setTimeout(function(){
                    
                               requestCodeFromPeripheral();
                               
                               },500);
                
                } else {
                
                    return;
                
                }
            } else {
                
                timeoutId1 = setTimeout(function() {
                                        var checkID = findDeviceIndex(app.user.profile.devices,'macAddress',AppModel.selectedToPairWithID);
                                        if(!checkID) {
                                        requestCodeFromPeripheral();
                                        } else {
                                        return;
                                        }
                                        },20000);
            }
        }
    };
    
    ble.connect(
                AppModel.selectedToPairWithID,
                onConnect,
                onError
                );
}


/**
 * The amphiro b1 asks for data updates.
 * @memberof Bluetooth Requests
 * @function
 * @param {object} options Execution options
 * @param {string} [options.context] The value of this provided for the function call.
 * @param {string} [options.success] Success {@link module:PublicaMundi.Data.Query~setGetResourcesSuccessCallback callback}.
 * @param {string} [options.failure] Failure {@link module:PublicaMundi.Data.Query~setFailureCallback callback}.
 * @param {string} [options.complete] Complete {@link module:PublicaMundi.Data.Query~setCompleteCallback callback}.
 */

function requestNotification(obj){
    
    onConnect = function() {
        
        ble.startNotification(
                              obj.macAddress,
                              app.amphiro.serviceUUID,
                              app.amphiro.rxCharacteristic,
                              onData,
                              onError1
                              );
        
        AppModel.notify = 1;
    },
    
    onData = function(data) {
        
        var newdecryption = new cryptoService({
                                              data : data,
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        newdecryption.decrypt();
        
    },
    
    onError1 = function() {
        AppModel.notify = 0;
         bluetoothLocker = 0;
        app.bluetoothRunning();
        //app.BluetoothSupervisor(deviceWithIndex);
    },
    
    onError = function() {
        bluetoothLocker = 0;
        app.bluetoothRunning();
        //app.BluetoothSupervisor(deviceWithIndex);
    };
    
    ble.connect(
                obj.macAddress,
                onConnect,
                onError
                );
}


/**
 * Returns blocks of data that contains historical data. This operation need a connection between the amphiro b1 and the application. This function is used when the app requests blocks of data avoiding the broadcast delay(e.g. every 5 real packets)
 * @memberof Bluetooth Requests
 * @function
 * @param {object} options Execution options
 * @param {string} [options.first] the first ShowerID of the block.
 * @param {string} [options.last] the last ShowerID of the block.

 */
function requestHistoryFromPeripheral(params,obj){
    
    onConnect = function() {
        
        ble.startNotification(
                              obj.macAddress,
                              app.amphiro.serviceUUID,
                              app.amphiro.rxCharacteristic,
                              onData,
                              onError1
                              );
        
        var newencryption = new cryptoService({
                                              buf : bluetoothBuffers.historyPacket(params),
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        newencryption.encrypt();
        
    },
    
    onData = function(data) {
        
        var newdecryption = new cryptoService({
                                              data : data,
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        newdecryption.decrypt();
        
        
        AppModel.lastIndex = params.last;
        
    },
    
    onError1 = function(){
        bluetoothLocker = 0;
        app.bluetoothRunning();
    },
    
    onError = function(){
        bluetoothLocker = 0;
        app.bluetoothRunning();
    };
    
    ble.connect(
                obj.macAddress,
                onConnect,
                onError
                );
}


/**
 * Returns real time data. This is another way to receive data and used when the app requests *real time* data avoiding the advertisement. It is necessary for "background" operations and when the very first communication between app
 * @memberof Bluetooth Requests
 * @function
 * @param {object} options Execution options
 * @param {int} [options.first] the first ShowerID of the block.
 * @param {int} [options.last] the last ShowerID of the block.
 
 */
function requestRealFromPeripheral(deviceWithIndex,obj){
    
    onConnect = function() {
        
        ble.startNotification(
                              obj.macAddress,
                              app.amphiro.serviceUUID,
                              app.amphiro.rxCharacteristic,
                              onData,
                              onError1
                              );
        
        var newencryption = new cryptoService({
                                              buf : bluetoothBuffers.realPacket(),
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        
        newencryption.encrypt();
    },
    
    onData = function(data) {
        var newdecryption = new cryptoService({
                                              data : data,
                                              key : obj.aesKey,
                                              id : obj.macAddress
                                              });
        newdecryption.decrypt();
    },
    
    onError1 = function(){
        bluetoothLocker = 0;
    },
    
    onError = function(){
        
        bluetoothLocker = 0;
        
        if(AppModel.background === 1){
            
            if (app.getSystemPlatform() === 'ios' ) {
                
                obj.pendingRequests.push({fn:0,d:deviceWithIndex});
                
                //app.bluetoothRunning();
                app.BluetoothSupervisor(deviceWithIndex);
            }
            
        }
    },
    
    ble.connect(
                obj.macAddress,
                onConnect,
                onError
                );
}


