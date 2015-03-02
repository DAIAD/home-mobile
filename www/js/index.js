// UART service
var bluefruit = {
serviceUUID: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
txCharacteristic: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", // transmit is from the phone's perspective
rxCharacteristic: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" // receive is from the phone's perspective
};

var json = {
    "litres" : {label: "Litres",data: [],xaxis: 1},
    "temp" : {label: "Temperature",data: [],xaxis: 1},
    "energy" : {label: "Energy",data: [],xaxis: 1},
    "index" : {label: "Index",data: [],xaxis: 1}
};

/*push bluetooth packets*/
var packets = [];

//Initialize the app with components at startup
var app = {
    
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //disconnectButton.addEventListener('touchstart', this.disconnect, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
        sm.openDb();
        var bleconnection = new bleConnection();
        var uploading = new uploadTask();
        var sched = new scheduler();
        
        
    },
    
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empties the list
        if (cordova.platformId === 'android' ) { // Android filtering is broken
            ble.scan([], 10, app.onDiscoverDevice, app.onError);
        } else {
            ble.scan([bluefruit.serviceUUID], 10, app.onDiscoverDevice, app.onError);
        }
    },
        
    onDiscoverDevice: function(device) {
  
        var deviceId = device.id;
        onConnect = function() {
            var blemanager = new BluetoothManager({flag: 'connected',name: device.name, id: device.id});
            blemanager.response();
            $('#deviceList').append(device.name + '<img src="img/amphiro.png" width="40" height="40"/></br>');
            ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, onData, onError);
        },
        
        onError = function(reason){
            //alert("ERROR: " + reason); // real apps should use notification.alert
            if (reason == 'Disconnected')
            {
                var blemanager = new BluetoothManager({flag: 'Disconnected',id:deviceId});
                blemanager.response();
                deviceList.innerHTML = '';
                try {
                    ble.connect(deviceId, onConnect, onError);
                }
                catch(ERROR) {}
                
            }
        },
        
        onData = function(data) { // data received from Arduino
            $.event.trigger({type:'current'});
            
            //data packet(12bytes) = 1b temp | 2b volume | 2b shower number | 1b history | 2b shower time | 1b reserved | 1b breaktime - cycle | 1b cycle flag | 1 byte lbyte
            //data packet (9bytes) = 1b temp | 2b volume | 2b shower number(index) | 1b history | 2b shower time(relative) |  1 byte lbyte
        
            processData(data, function(a,b,c,d,e,f,g,k,l) {
                    if (c == 0) {
                    json.litres.data.push([k,b]);
                    json.temp.data.push([k,a]);
                    json.energy.data.push([k,l]);
                    json.index.data.push([k,e]);
                    }
                    if (json.litres.data.length > 5)
                         {
                              json.litres.data.shift();
                              json.temp.data.shift();
                              json.energy.data.shift();
                              json.index.data.shift();
                          }
                    
                        
                        sm.FeelData(a,b,e,c,d,f,g,k,l);
                         
                    });
        
            function processData(arg1,callback) {
                
                var vw = new Uint8Array(arg1);
            
                t = vw[0];
                v= (256*vw[1] + vw[2])/10;
                i = (256*vw[3])+vw[4];
                h = vw[5];
                st = (256*vw[6])+vw[7];
                bt = 0;
                cf = 0;
                var n = new Date();
                var d = n.getTime();
                var s = v*(t-15)*4.182;
                var ee = s/3.6;
                var e = Math.round(ee * 10) / 10;
                
                
                packets.push({
                         "Temperature":t,
                         "Volume":v,
                         "Energy":e,
                         "ShowerID":i,
                         "History":h,
                         "ShowerTime":st,
                         "Timestamp":d,
                         });
            
                callback(t,v,h,st,i,bt,cf,d,e);
            }
        }

        ble.connect(deviceId, onConnect, onError);
    },
        
    checkBluetooth : function() {
            ble.isEnabled(function(){alert("Bluetooth is enabled");},function(){alert("Bluetooth is *not* enabled");});
    },
        
    //If device is Known connect without scan with the id!!
    connectKnown : function() {
        onConnectKnown = function() {
            //clearInterval(connectionInterval);
            var blemanager = new BluetoothManager({flag: 'connected'});
            blemanager.response();
            ble.startNotification(knownDevices.id, bluefruit.serviceUUID, bluefruit.rxCharacteristic,app.onData,app.onError);
        };
        ble.connect(knownDevices.id, onConnectKnown, app.onError);
    },
        
    
    onError: function(reason) {
        //alert("ERROR: " + reason); // real apps should use notification.alert
        if (reason == 'Disconnected')
        {
            //connectionInterval= setInterval(app.connectKnown,1000);
            var blemanager = new BluetoothManager({flag: 'Disconnected'});
            blemanager.response();
            window.localStorage.setItem('jsonData',JSON.stringify(json));
            $.event.trigger({type : 'last'});
        }
    }
    
};

app.initialize();