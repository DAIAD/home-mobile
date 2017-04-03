var bluetoothService = function(param) {
    this.param = param;
};

bluetoothService.prototype = {
    
    serviceUUID : "0D27FA90-F0D4-469D-AFD3-605A6EBBDB13",
    txCharacteristic: "0D27FB90-F0D4-469D-AFD3-605A6EBBDB13", // transmit is from the phone's perspective
    rxCharacteristic: "0D27FB91-F0D4-469D-AFD3-605A6EBBDB13", // receive is from the phone's perspective
    startScan : function(){},
    stopScan : function(){},
    disconnect : function(){},
    connect : function(){},
    requestUnencrypted  : function(){},
    requestEncrypted : function( buf ) {
        
        onConnect = function() {

            ble.startNotification(
                                  this.param.macAddress,
                                  app.amphiro.serviceUUID,
                                  app.amphiro.txCharacteristic,
                                  onData,
                                  onErrorNotification
                                  );
            
            var newencryption = new cryptoService(
                                                  {
                                                  buf : buf,
                                                  key : this.param.aesKey,
                                                  id : this.param.macAddress
                                                  }
                                                  );
            
            newencryption.encrypt();
        },
        
        onData = function(data) {

            var newdecryption = new cryptoService(
                                                  {
                                                  data : data,
                                                  key : this.param.aesKey,
                                                  id : this.param.macAddress
                                                  }
                                                  );
            newdecryption.decrypt();
            
        },
        onErrorNotification = function(){
            $('#nikolas').append(' -- connection writeppacket HI notofication-- ');
            bluetoothLocker = 0;
            //app.BluetoothSupervisor(deviceWithIndex);
            app.bluetoothRunning();
        },
        onErrorConnection = function(){
        
            $('#nikolas').append(' -- connection writeppacket HI connections-- ');
            bluetoothLocker = 0;
            //app.BluetoothSupervisor(deviceWithIndex);
            app.bluetoothRunning();
        },
                
        ble.connect(
                    this.param.macAddress,
                    onConnect,
                    onErrorConnection
                    );
        
    }

    
};

