// UART service
var bluefruit = {
serviceUUID: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
txCharacteristic: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", // transmit is from the phone's perspective
rxCharacteristic: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" // receive is from the phone's perspective
};


var diffv = [];
var diffe = [];
var flag = 0;
var json = {
    "litres" : {label: "Litres",data: [],xaxis: 1},
    "temp" : {label: "Temperature",data: [],xaxis: 1},
    "energy" : {label: "Energy",data: [],xaxis: 1},
    "duration" : {label:"Duration",data: []}
};

/*push bluetooth packets*/
var packets = {
    "applicationKey":"c11f91c3-579b-48e8-afbd-988bf517ebdc",
    "deviceId":"ddc847df-c0c5-4cff-ba12-11ede01356c5",
    "measurements":[]
};


//Initialize the app with components at startup
var app = {
    
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
        sm.openDb();
        var bleconnection = new bleConnection();
        var uploading = new uploadTask();
        //var sched = new scheduler();
    },
    
    refreshDeviceList: function() {
        $('#deviceList').empty(); // empties the list
        if (cordova.platformId === 'android' ) { // Android filtering is broken
            ble.scan([bluefruit.serviceUUID], 10, app.onDiscoverDevice, app.onError);
        } else {
            ble.scan([bluefruit.serviceUUID], 10, app.onDiscoverDevice, app.onError);
        }
    },
        
    onDiscoverDevice: function(device) {
        //var deviceId = device.id;
        onConnect = function() {
            var blemanager = new BluetoothManager({flag: 'Connected',name: device.name, id: device.id});
            blemanager.response();
            $('#deviceList').empty().append(device.name);
            ble.startNotification(device.id, bluefruit.serviceUUID, bluefruit.rxCharacteristic, onData, onError);
        },
                
        onError = function(reason){
            //alert("ERROR: " + reason); // real apps should use notification.alert
            if (reason == 'Disconnected')
            {
                var blemanager = new BluetoothManager({flag: 'Disconnected',id:device.id});
                blemanager.response();
                
                try {
                        ble.connect(device.id, onConnect, onError);
                    if (flag == 1) {
                        window.localStorage.setItem('jsonData',JSON.stringify(json));
                        $.event.trigger({type : 'last'});
                        
                        var ntfmanager = new NotificationManager({flag: 'start'});
                        ntfmanager.response();

                    }
                }
                catch(ERROR) {}
            }
        },
        
        onData = function(data) { // data received from Arduino
            flag = 1;
            
            $.event.trigger({type:'progress'});
            
            //data packet(12bytes) = 1b temp | 2b volume | 2b shower number | 1b history | 2b shower time | 1b reserved | 1b breaktime - cycle | 1b cycle flag | 1 byte lbyte
            //data packet (9bytes) = 1b temp | 2b volume | 2b shower number(index) | 1b history | 2b shower time(relative) |  1 byte lbyte
        
            processData(data, function(a,b,c,d,e,f,g,k,l) {
                        
                        sm.FeelData(a,b,e,c,d,f,g,k,l);
                    
                    });
        
            function processData(arg1,callback) {
                var vw = new Uint8Array(arg1);
                t = vw[0];
                v= (256*vw[1] + vw[2])/10;
                i = (256*vw[3])+vw[4];
                h = vw[5];
                st = (256*vw[6])+vw[7];
                bt = 0;cf = 0; /*keep for analysis firmware*/
                var d = new Date().getTime();
                var e = Math.round((v*(t-6)*4.182)/3.6 * 10) / 10;

                if (h == 0){
                    
                    json.litres.data.push([d,v]);
                    json.temp.data.push([d,t]);
                    json.energy.data.push([d,e]);
                    json.duration.data.push([d,st]);
                    
                    diffv.push(v);
                    diffe.push(e);
                    
                    if (diffv.length == 2 ) {
                        
                        dv = diffv[1] - diffv[0];
                        de = diffe[1] - diffe[0];
                        
                        packets.measurements.push({
                                                      "temperature":t,
                                                      "volume":dv,
                                                      "energy":de,
                                                      "showerId":i,
                                                      "history":h,
                                                      "showerTime":st,
                                                      "timestamp":d,
                                                      });
                        
                        diffv.length = 0;
                        diffe.length = 0;
                    }

                }

                if (json.litres.data.length > 4)
                {
                    json.litres.data.shift();
                    json.temp.data.shift();
                    json.energy.data.shift();
                    json.duration.data.shift();
                }

                $.event.trigger({type:'current',message: json});
                callback(t,v,h,st,i,bt,cf,d,e);
            }
        }

        ble.connect(device.id, onConnect, onError);
    },
        
    checkBluetooth : function() {
            ble.isEnabled(function(){alert("Bluetooth is enabled");},function(){alert("Bluetooth is *not* enabled");});
    }
    
    
    
};

app.initialize();