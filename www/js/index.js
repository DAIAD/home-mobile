
String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

function payloadCheckSum(aes){
    var bsd = 0;
    for (i=3; i< aes.length; i++){
        var bsd = (bsd >> 1)  + (bsd << 7);
        var bsd = ( bsd + aes[i]) & (255);
    }
    return bsd;
}

function int2hex(num){
    return (Math.round(num)).toString(16) ;
}

function hex8(val) {
    val &= 0xFF;
    var hex = Math.round(val).toString(16);
    return ("00" + hex).slice(-2);
}

function hex16(val) {
    val &= 0xFFFF;
    var hex = Math.round(val).toString(16);
    return ("0000" + hex).slice(-4);
}

function hex32(val) {
    val &= 0xFFFFFFFF;
    var hex = Math.round(val).toString(16);
    return ("00000000" + hex).slice(-8);
}

function findDeviceIndex(obj, key, value){
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return null;
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function findAndRemove(array, property, value) {
    $.each(array, function(index, result) {
           if(result[property] == value) {
           //Remove from array
           array.splice(index, 1);
           }
           });
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++){
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

var AppModel = {
    amphiro : {
        serviceUUID : "0D27FA90-F0D4-469D-AFD3-605A6EBBDB13",
        txCharacteristic: "0D27FB90-F0D4-469D-AFD3-605A6EBBDB13", // transmit is from the phone's perspective
        rxCharacteristic: "0D27FB91-F0D4-469D-AFD3-605A6EBBDB13" // receive is from the phone's perspective
    },
    selectedDeviceForTrend : 0,
    selectedToPairWithID : null,
    selectedToPairWithKey:null,
    selectedDeviceWithID: null,
    selectedToUnpair : null,
    PingData : null,
    user :null,
    devices : [/*{
               aeskey : 1234,
               id : 123455,
               identifier : 112,
               firstTimeOfConnection : 122,
               lastTimeOfConnection : 12,
               lastTimeOfUpdate : 1213,
               lastShowerID : 0,
               pendingRequests :[],
               values : ['amphiro b1 #',"Metric","EUR","900","5","0","100","0.33","0","14","1","180","10"]
    }*/],
    NewDevices : [],
    deviceOptions : { values : ["Shower 1","Metric","EUR","900","5","0","100","0.33","0","14","1","180","10"] },
    
    trendSelected : 0,
    options : {
        grid :{
        borderWidth: {top: 0 , right:0 , bottom :1 ,left:1 },
        //tickColor: "rgba(255, 255, 255, 0)",
        },
        lines: {
        show: true
        },/*
        bars: {
            show: true,
            align: "center"
        },*/
        points :{
            show:true,
        },
        axisLabels: {
            show: true
        },
        xaxes: [{/*
            axisLabel: 'Time',
            mode: 'time',
            minTickSize: [1, "hour"],
            min:new Date().setDate(new Date().getDate() - 5),
            max:new Date().getTime(),
            twelveHourClock: true
                  */
            axisLabel: 'Shower Number',
            minTickSize: 1,
            min:1,
            max:10
            //twelveHourClock: true
            }],
        yaxes: [{
            position: 'up',
            axisLabel: null,
                min:0
        }]
    },
    trendl : {
        color:  '#f56f5c',
        data: []
    },
    trendData:[
               {
                lb : 'Liters',
                data: [],
                average: 0,
                sum: 0,
                color: "#7ca9bd"
               },
               {
                lb : 'Wh',
                data: [],
                color: "#7ca9bd",
                average: 0,
                sum: 0
               },
               {
                lb : 'L/min',
                data: [],
                color: "#7ca9bd",
                average: 0
               },
               {
                lb :'C',
                data: [],
                color: "#7ca9bd",
                average: 0
               }
               ],
    compareData :{
        averageVolume:1,
        averageEnergy:1,
        averageFlow:1,
        label:'Liters',
        ShowersPerYear:1,
    
    },
    changescb34 : null,
    changescb2 : null,
    heating : {
        1:"Electricity",
        2:"0il",
        0:"Gas"
    },
    configs : {
        unit:{
            Metric:{
                vol:1,
                temp:1
            },
            Imperial:{
                vol:2,
                temp:2
            },
        },
        energy:3,
        costs:4,
        alarm:17,
        currency:{
            EUR:4,
            GBP:5,
            USD:6,
            SFR:7,
            SKR:8,
            QR:9,
            AED:10,
            KR:11
        }
    },
    tempSettings : [],
    availability : 0,
    notify : 0,
    mode: null
};

var db = null;

//Initialize the app with components at startup
var app = {
    
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause',this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
    },
    killme : function(){
        ble.isConnected(AppModel.devices[0].id, function(){}, function(){});
    },
    onDeviceReady: function() {
        StatusBar.hide();
        app.Instatiate();
    },
    Instatiate : function(){
        var modelo = new ModelObserver();
        var bles = new BluetoothNotifications();
        EventBus.subscribe('settings', app.BluetoothSupervisor);
        EventBus.subscribe('disconnect', app.BluetoothSupervisor);
        
        setTimeout(function(){
                   app.setInitialModel(app.getUserFromLocalStorage(),app.getAmphiroFromLocalStorage());
                   app.setInitialView();
                   },10);
        
        setTimeout(function(){
                    app.openDb();
                   },80);
        
        setTimeout(function(){
                   if(AppModel.devices.length > 0){
                        app.SetDataAndGraphLabels(AppModel.selectedDeviceForTrend);
                   }
                   },150);
        setTimeout(function(){
                   app.checkBluetooth();
                   },300);
        
        setTimeout(function() {
                    //alert(JSON.stringify(AppModel.user));
                   //alert(JSON.stringify(AppModel.devices));
                   //app.CheckKeysForUploadData();
                   //app.FetchDataForUpload();
                   //app.CheckUserExistance();
                   navigator.splashscreen.hide();

                   }, 2000);
    },
    
    onPause: function(){
        AppModel.mode = 0;
        $.each(AppModel.devices,function(i){
               AppModel.devices[i].pendingRequests.push({fn:0,d:i});
               app.BluetoothSupervisor(i);
               });
    },
    onResume: function(){
        
        AppModel.mode = 1;
        
    },
    stop : function(){
        ble.stopScan();
    },
    checkBluetooth : function() {
        ble.isEnabled(function(){
                      app.refreshDeviceList();
                      //app.RequestRealFromPeripheral();
                      },function(){
                      $.event.trigger({type:'bledisable'});
                      setTimeout(function(){
                                 app.checkBluetooth();
                                 },2000)
                      });
        
    },

    /*BLUETOOTH DATA EXCHANGE COMPONENT*/
    refreshDeviceList: function() {
        if (cordova.platformId === 'android' ) { // Android filtering is broken
            ble.scan([], 1000, app.onDiscoverDevice, app.onError);
        } else {
            ble.startScan([], app.onDiscoverDevice, app.onError);
            setTimeout(function(){
                       app.stop();
                       setTimeout(function(){
                            app.refreshDeviceList();
                        },1500);
                       },10000);
        }
    },
    onDiscoverDevice: function(device) {
       
        var idpos = findDeviceIndex(AppModel.devices, 'id', device.id);
        //check if device is already paired.
        if(idpos != null){
            //Publish that device is available until ..force quit!
            
            if(AppModel.devices[idpos].aeskey == null){
                //app.RenderNewDevices(device.id,device.rssi);
                app.CheckDiscoveredDeviceForAmphiro(device);
            }else{
            
                $.event.trigger({type:"available"});
                //insert decryption key for decryption to device object
                var dataToDecrypt = {
                    data : device.advertising.kCBAdvDataManufacturerData,
                    id : device.id,
                    key : AppModel.devices[idpos].aeskey
                };
            
                app.DecryptPacket(dataToDecrypt);
            }
        }else{
            //filter Amphiro devices(2 tests)
            app.CheckDiscoveredDeviceForAmphiro(device);
        }
    },
    CheckDiscoveredDeviceForAmphiro : function(device){
        
        if(device.advertising.kCBAdvDataManufacturerData != 'undefined'){
            var isAmphiroDevice = new Uint8Array(device.advertising.kCBAdvDataManufacturerData);
            if(AppModel.NewDevices.length == 0 && isAmphiroDevice[19]==49){
                AppModel.NewDevices.push(device.id);
                //alert('len0:' + device.id);
                app.RenderNewDevices(device.id,device.rssi);
                
            }else{
                var checked = isInArray(device.id,AppModel.NewDevices);
                if (checked != true && isAmphiroDevice[19]==49){
                    AppModel.NewDevices.push(device.id);
                    //alert('inside:' + device.id);
                    app.RenderNewDevices(device.id,device.rssi);
                }
            }
        }
        
        
    },
    DecryptPacket : function (dv){
        
        round = function(dv,callback){
            //create buffer view
            var view = new Uint8Array(dv.data);
            //get the key
            var key = CryptoJS.enc.Hex.parse(dv.key);
            //decrypt [2..18] keep first two values
            var encr1 = new Uint8Array(17);
            for (var i = 2; i<view.length-2; i++){
                encr1[i-2] = view[i];
            }
            
            var input = CryptoJS.lib.WordArray.create(encr1);
            var data = CryptoJS.enc.Base64.stringify(input);
            var decrypted3 = CryptoJS.AES.decrypt(data,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
            var arr = base64ToArrayBuffer(decrypted3.toString(CryptoJS.enc.Base64));
            var view1 = new Uint8Array(arr);
            for (var i = 0; i<view1.length; i++){
                view[i+2] = view1[i];
            }
            
            //create new ArrayBuffer#2 with size 16 - Decryption Round#2
            var encr2 = new Uint8Array(17);
            //decrypt [1..16] keep last two values
            
            for (var i = 0; i<16; i++){
                encr2[i] = view[i];
            }
            
            var input2 = CryptoJS.lib.WordArray.create(encr2);
            var data2 = CryptoJS.enc.Base64.stringify(input2);
            var decrypted4 = CryptoJS.AES.decrypt(data2,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
            var arr1 = base64ToArrayBuffer(decrypted4.toString(CryptoJS.enc.Base64));
            var final = new Uint8Array(arr1);
            //Packet Decrypted : ready for process
            callback(final);
        },
        
        process = function(vw){
           
           switch (vw[0]) {
                    
                case 0:
                   
                   var deviceindex = findDeviceIndex(AppModel.devices, 'id', AppModel.selectedToPairWithID);
                   
                   if(deviceindex == null){
                       
                       var dev = {
                           
                           aeskey : dv.key,
                           id : AppModel.selectedToPairWithID,
                           identifier : AppModel.devices.length +1,
                           firstTimeOfConnection : new Date().getTime(),
                           lastTimeOfConnection : new Date().getTime(),
                           lastTimeOfUpdate : new Date().getTime(),
                           lastShowerID : 0,
                           pendingRequests :[],
                           values : ['amphiro b1 #'+AppModel.devices.length,"Metric","EUR","900","5","0","100","0.33","0","14","1","180","10"]
                           
                       };
                       
                       AppModel.PingData = null;
                       
                       
                       AppModel.devices.push(dev);
                       app.storeDevices(AppModel.user.email,JSON.stringify(dev));
                       app.setAmphiroToLocalStorage(JSON.stringify(AppModel.devices));
                       app.SetDataAndGraphLabels(AppModel.devices.length - 1);
                       app.renderCustomView(2);
                       //try to send device to server
                       //AppModel.devices.push(dev);
                       app.RegisterDeviceToServer(dev);

                   }else{
                       
                       AppModel.devices[deviceindex].aeskey = dv.key;
                       EventBus.publish('model');
                       app.renderCustomView(9);
                       
                   }

                    break;
                    
                case 17:
                   
                   var category = 17;
                   var history = false;
                   var showerID = 256*vw[3]+vw[4];
                   var vol =  (256*vw[5]+256*vw[6]+256*vw[7]+vw[8])/10;
                   var energy = 256*vw[9]+256*vw[10]+256*vw[11]+vw[12];
                   var temperature = vw[13];
                   var duration = 256*vw[14]+256*vw[15]+vw[16];
                   var currentDate = new Date().getTime();
                   var minutes = (duration / 60).toFixed(2);
                   var flow = vol / minutes;
                   
                   var packet = {
                       "id": dv.id,
                       "history" : history,
                       "category": category,
                       "temperature":temperature,
                       "volume":vol,
                       "flow": flow,
                       "energy":energy,
                       "showerId":showerID,
                       "duration":duration,
                       "date":currentDate
                   };
                   
                   app.storeData(packet);
                   
                   app.UpdateDataModel(packet);
                   
                   break;
                    
                case 18:
                   
                   var category = 18;
                   var history = true;
                   var showerID = 256*vw[3]+vw[4];
                   var volume =  (256*vw[7]+vw[8])/10;
                   var temperature = vw[9];
                   var cold = vw[10];
                   var efficiency = vw[11];
                   var flow = vw[12]/10;
                   var breakTime = vw[13];
                   var duration = ( volume / flow ) * 60;
                   var currentDate = new Date().getTime();
                   var energy = (volume*(temperature-cold)*4.182)/3.6;
                   
                   var packet = {
                       "id": dv.id,
                       "history" : history,
                       "category": category,
                       "temperature":temperature,
                       "volume":volume,
                       "flow": flow,
                       "energy":energy,
                       "showerId":showerID,
                       "duration":duration,
                       "date":currentDate
                   };
                   
                   //$('#nikolas').append('His:' + JSON.stringify(packet) + '</br>');
                   app.storeHistory(packet);
                   //app.UpdateDataModel(packet);
                   
                   break;
                    
                case 27:
                    //var category = view[0];
                    //$('#nikolas').append('case27:' + category + '</br>');
                    
                    break;
                    
            
                case 29:
                    /*
                     //summarized history - AdvData
                     var category = view[0];
                     var showerID = 256*view[3]+view[4];
                     var AvgVolume1 =  256*view[5] + view[6];
                     var AvgTemperature1 = view[7];
                     var AvgVolume2 =  256*view[8] + view[9];
                     var AvgTemperature2 = view[10];
                     var AvgVolume3 =  256*view[11] + view[12];
                     var AvgTemperature3 = view[13];
                     var duration = 256*view[14] + 256*view[15] + view[16];
                     var currentDate = new Date().getTime();
                     
                     var packet3 = {"category": category,"AvgVolumeLatest":AvgVolume1,"AvgTemperatureLatest":AvgTemperature1,"AvgVolumeMid":AvgVolume2,"AvgTemperatureMid":AvgTemperature2,"AvgVolumeRecent":AvgVolume3,"AvgTemperatureRecent":AvgTemperature3,"showerId":showerID,"duration":duration,"date":currentDate};
                     
                     // $('#nikolas').append('SumHis:' + JSON.stringify(packet3) + '</br>');
                     */
                    break;
                    
                    //Responses cases
                case 65 :
                   var category = 17;
                   var history = false;
                   var showerID = 256*vw[3]+vw[4];
                   var vol =  (256*vw[5]+256*vw[6]+256*vw[7]+vw[8])/10;
                   var energy = 256*vw[9]+256*vw[10]+256*vw[11]+vw[12];
                   var temperature = vw[13];
                   var duration = 256*vw[14]+256*vw[15]+vw[16];
                   var currentDate = new Date().getTime();
                   var minutes = (duration / 60).toFixed(2);
                   var flow = vol / minutes;
                   
                   var packet = {
                       "id": dv.id,
                       "history" : history,
                       "category": category,
                       "temperature":temperature,
                       "volume":vol,
                       "flow": flow,
                       "energy":energy,
                       "showerId":showerID,
                       "duration":duration,
                       "date":currentDate
                   };
                   
                   app.storeData(packet);
                   
                   app.UpdateDataModel(packet);
                   
                    break;
                    
                case 66:
                    //History - Response
                   var category = 18;
                   var history = true;
                   var showerID = 256*vw[3]+vw[4];
                   var volume =  (256*vw[7]+vw[8])/10;
                   var temperature = vw[9];
                   var cold = vw[10];
                   var efficiency = vw[11];
                   var flow = vw[12]/10;
                   var breakTime = vw[13];
                   var duration = ( volume / flow ) *60;
                   var currentDate = new Date().getTime();
                   var energy = (volume*(temperature-cold)*4.182)/3.6;
                   
                   var packet = {
                       "id": dv.id,
                       "history" : history,
                       "category": 18,
                       "temperature":temperature,
                       "volume":volume,
                       "flow": flow,
                       "energy":energy,
                       "showerId":showerID,
                       "duration":duration,
                       "date":currentDate
                   };
                   
                   //app.storeData(packet);
                   app.storeHistory(packet);
                   //$('#nikolas').append('his:' + JSON.stringify(packet) + '</br>');
                    break;
                    
                case 67:
                    //configuration block #1
                    /*
                     var category = view[0];
                     var operationMode1 = view[3];
                     var totalExtractions = 256*view[4]+view[5];
                     var operationMode2 = view[6];
                     var calibrationVal = 256*view[7]+view[8];
                     var debugInfo = view[9];
                     var calibrationFr = view[10];
                     var firwareVersion = 256*view[11]+view[12];
                     var rtc = view[13];
                     var scallingRF = view[14];
                     var scallingVol = view[15];
                     var offsetVol = view[16];
                     
                     var packet = {"category": category,"operationMode1":operationMode1,"totalExtractions":totalExtractions,"operationMode2":operationMode2,"calibrationVal":calibrationVal,"debugInfo":debugInfo,"calibrationFr":calibrationFr,"firwareVersion":firwareVersion,"rtc":rtc,"scallingRF":scallingRF,"scallingVol":scallingVol,"offsetVol":offsetVol};
                     */
                    break;
                    
                case 68:
                   
                   
                    //WORKING
                    //configuration block #2
                    calheating = function(num){
                        
                        var val1 = num.toString(2);
                        var res = ("00000000" + val1).slice(-8);
                        var res1 = res.slice(0,3);
                        var res2 = res.slice(3,8);
                        var a = parseInt(res1, 2);
                        var b = parseInt(res2, 2);
                        //return a;
                        return {
                            "type":a,
                            "solar":b
                        };
                    },
                    
                    calprice = function (n1,n2){
                        var val1 = (n1).toString(2);
                        var val2 = (n2).toString(2);
                        var res = ("00000000" + val1).slice(-8);
                        var res1 = ("00000000" + val2).slice(-8);
                        var final = res + res1;
                        var a = parseInt(final.slice(0,4), 2);
                        var b = parseInt(final.slice(4,16), 2);
                        
                        return b;
                    }
                    
                    var heats = calheating(vw[3]);
                    var category = vw[0];
                    var type = heats.type;
                    var solar = heats.solar;
                    var efficiency = vw[4];
                    var cold = vw[5];
                    var alarm = 256*vw[6]+vw[7];
                    var price = calprice(vw[8],vw[9]);
                    var co2 = 256*vw[10]+vw[11];
                    var maxBreakDuration = vw[12];
                    //var customStringDisplay = view[13]+256*view[14]+view[15]+view[16];
                   
                   /*
                    var packet = {"category": category,"type":type,"solar":solar,"efficieny":efficiency,"cold":cold,"alarm":alarm,"price":price,"co2":co2,"breaktime":maxBreakDuration,"str":vw[13]+','+vw[14]+','+vw[15]+','+vw[16]};
                    */
                    //$('#nikolas').append('cb2:' + JSON.stringify(packet) + '</br>');
                   
                    var RequestedFromDevice = findDeviceIndex(AppModel.devices, 'id', dv.id);
                    findAndRemove(AppModel.devices[RequestedFromDevice].pendingRequests, 'fn',2);
                   
                    AppModel.devices[RequestedFromDevice].values[3] = alarm;
                    AppModel.devices[RequestedFromDevice].values[5] = type;
                    AppModel.devices[RequestedFromDevice].values[6] = efficiency;
                    AppModel.devices[RequestedFromDevice].values[7] = price/100;
                    AppModel.devices[RequestedFromDevice].values[8] = solar*4;
                    AppModel.devices[RequestedFromDevice].values[12] = cold;
                    AppModel.devices[RequestedFromDevice].lastTimeOfConnection = new Date().getTime();
                    AppModel.devices[RequestedFromDevice].lastTimeOfUpdate = new Date().getTime();
                    EventBus.publish('model');
                    
                    break;
                    
                case 69:
                    //configuration block #3 - water is flowing
                    var RequestedFromDevice = findDeviceIndex(AppModel.devices, 'id', dv.id);
                    findAndRemove(AppModel.devices[RequestedFromDevice].pendingRequests, 'fn',3);
                   
                    /*var packet = {"category": category,"TOP":vw[3]+','+vw[4]+','+vw[5]+','+vw[6],"MID":vw[7]+','+vw[8]+','+vw[9]+','+vw[10],"BOTTOM":vw[11]+','+vw[12]+','+vw[13]+','+vw[14],"FRAMS":vw[15],"durFRAMES":vw[16]};
                    */
                    //$('#nikolas').append('cb3:' + JSON.stringify(packet) + '</br>');
                    
                    for(i=3;i<=6;i++){
                        switch(vw[i]){
                            case 0:
                                break;
                            case 1:
                                if(AppModel.devices[RequestedFromDevice].values[1] == 'Imperial'){
                                    AppModel.devices[RequestedFromDevice].values[1] = 'Metric';
                                    $.event.trigger({type:'unitChanged'});
                                }
                                break;
                            case 2:
                                if(AppModel.devices[RequestedFromDevice].values[1] == 'Metric'){
                                    AppModel.devices[RequestedFromDevice].values[1] = 'Imperial';
                                    $.event.trigger({type:'unitChanged'});

                                }
                                break;
                            case 3:
                                break;
                            case 4:
                                AppModel.devices[RequestedFromDevice].values[2] = 'EUR';
                                break;
                            case 5:
                                AppModel.devices[RequestedFromDevice].values[2] = 'GBP';
                                break;
                            case 6:
                                AppModel.devices[RequestedFromDevice].values[2] = 'USD';
                                break;
                                 /*
                            case 7:
                                AppModel.devices[RequestedFromDevice].values[2] = 'SFR';
                                break;
                            case 8:
                                AppModel.devices[RequestedFromDevice].values[2] = 'SKR';
                                break;
                            case 9:
                                AppModel.devices[RequestedFromDevice].values[2] = 'QR';
                                break;
                            case 10:
                                AppModel.devices[RequestedFromDevice].values[2] = 'AED';
                                break;
                            case 11:
                                AppModel.devices[RequestedFromDevice].values[2] = 'KR';
                                break;
                                */
                        };
                        
                    }
                    AppModel.devices[RequestedFromDevice].lastTimeOfConnection = new Date().getTime();
                    AppModel.devices[RequestedFromDevice].lastTimeOfUpdate = new Date().getTime();
                    EventBus.publish('model');
                    
                    break;
                    
                case 70:
                    //configuration block #4 - water is still
                    /*
                     var packet = {"category": category,"TOP":view[3]+','+view[4]+','+view[5]+','+view[6],"MID":view[7]+','+view[8]+','+view[9]+','+view[10],"BOTTOM":view[11]+','+view[12]+','+view[13]+','+view[14],"FRAMS":view[15],"durFRAMES":view[16]};
                     
                     $('#nikolas').append('cb4:' + JSON.stringify(packet) + '</br>');
                     */
                    //pass that 70 is update response - for time of update!
                   var RequestedFromDevice = findDeviceIndex(AppModel.devices, 'id', dv.id);
                   findAndRemove(AppModel.devices[RequestedFromDevice].pendingRequests, 'fn',4);
                    AppModel.devices[RequestedFromDevice].lastTimeOfConnection = new Date().getTime();
                    AppModel.devices[RequestedFromDevice].lastTimeOfUpdate = new Date().getTime();
                    EventBus.publish('model');
                    
                    
                    break;
                    
                default:

                   var blecd = new NotificationManager();
                   blecd.PairingCode();
            }
            
        }
        
        round(dv,process);
        
    },
    EncryptPacket : function(toSend){
        
        EncryptionRound = function(toSend){
            //create buffer view : size 18
            
            var view = new Uint8Array(toSend.buf);
            
            var last1 = view[17];
            var prelast1 = view[16];
            //encrypt [1..16] Encryption Round#1
            var buf2 = new ArrayBuffer(16);
            var encr2 = new Uint8Array(buf2);
            
            var key = CryptoJS.enc.Hex.parse(toSend.key);
            
            for (i = 0; i<16; i++){ encr2[i] = view[i]; }
            
            var input22 = CryptoJS.lib.WordArray.create(encr2);
            var encrypted4 = CryptoJS.AES.encrypt(input22,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
            var arr4 = base64ToArrayBuffer(encrypted4);
            
            var final = new Uint8Array(arr4);
            for (i = 0; i<final.length; i++){ view[i] = final[i]; }
            view[16] = prelast1;
            view[17] = last1;
            
            var bufEncr1= new ArrayBuffer(16);
            var encr1 = new Uint8Array(bufEncr1);
            //encrypt [2..18] Encryption Round#2
            var first = view[0];
            var sec = view[1];
            
            for (i = 2; i<view.length; i++){
                encr1[i-2] = view[i];
            }
            
            var input = CryptoJS.lib.WordArray.create(encr1);
            var encrypted3 = CryptoJS.AES.encrypt(input,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
            var arr = base64ToArrayBuffer(encrypted3);
            var view1 = new Uint8Array(arr);
            
            for (i = 0; i<view1.length; i++){
                view[i+2] = view1[i];
            }
            view[0] = first;
            view[1] = sec;
            //Encryption Completed - send buffer
            SendEncrypted(view.buffer);
            
        },
        
        SendEncrypted = function(data){
            var success = function(){};
            var failure = function(){};
            //write the ecrypted buffer to peripheral
            ble.write(toSend.id,AppModel.amphiro.serviceUUID,AppModel.amphiro.txCharacteristic, data, success, failure);
        }
        
        EncryptionRound(toSend,SendEncrypted);
    },
    UnecryptedPacket : function(data){
        var success = function() { return; };
        var failure = function() { return; };
        //ID is specified from 'select device to pair'!
        ble.write(AppModel.selectedToPairWithID,AppModel.amphiro.serviceUUID,AppModel.amphiro.txCharacteristic, data, success, failure);
    },
    
    UpdateDataModel :function(param){
        var deviceindex = findDeviceIndex(AppModel.devices, 'id', param.id);
        
        //realistic flow
        if (AppModel.devices[deviceindex].lastShowerID < param.showerId ){
            AppModel.devices[deviceindex].lastShowerID = param.showerId;
            EventBus.publish('model');
            /*
            if(AppModel.mode == 0){
                var diff = param.showerId - AppModel.devices[0].lastShowerID;
                var keep = AppModel.devices[0].lastShowerID;
                if( diff > 1){
                    //$('#nikolas').append('missing:' + diff);
                    
                    for(var i = keep; i<=param.showerId; i+=10){
                        if(i + 10 > param.showerId ){
                            var showersToRequest = {
                                first: i + 1 ,
                                last: param.showerId -1
                            };
                        }else{
                            var showersToRequest = {
                                first: i + 1 ,
                                last: i + 10
                            };
                        }
                        AppModel.devices[deviceindex].pendingRequests.push({fn:5,data:showersToRequest});
                    }
                }
            }*/
            
            switch(AppModel.devices[deviceindex].values[1]){
                    
                case 'Metric':
                    AppModel.trendData[0].data.unshift([param.showerId,param.volume]);
                    AppModel.trendData[0].sum = AppModel.trendData[0].sum + param.volume;
                    AppModel.trendData[1].data.unshift([param.showerId,param.energy]);
                    AppModel.trendData[1].sum = AppModel.trendData[1].sum + param.energy;
                    
                    //AppModel.trendData[2].average = AppModel.trendData[2].average * AppModel.trendData[0].data.length  + param.flow / AppModel.trendData[0].data.length;
                    AppModel.trendData[2].data.unshift([param.showerId,param.flow]);
                    
                  //AppModel.trendData[3].average = (AppModel.trendData[3].average * (AppModel.trendData[0].data.length - 1) + param.temperature) / AppModel.trendData[0].data.length;
                    AppModel.trendData[3].data.unshift([param.showerId,param.temperature]);
                    

                    break;
                case 'Imperial':
                    AppModel.trendData[0].data.unshift([param.showerId,app.litres2gal(param.volume)]);
                    AppModel.trendData[0].sum = AppModel.trendData[0].sum + app.litres2gal(param.volume);
                    AppModel.trendData[1].data.unshift([param.showerId,param.energy]);
                    AppModel.trendData[1].sum = AppModel.trendData[1].sum + param.energy;
                    
                    AppModel.trendData[2].data.unshift([param.showerId,app.litres2gal(param.flow)]);
                     AppModel.trendData[2].average = (AppModel.trendData[2].average * AppModel.trendData[0].data.length  + app.litres2gal(param.flow)) / AppModel.trendData[0].data.length;
                    
                    AppModel.trendData[3].data.unshift([param.showerId,app.cel2far(param.temperature)]);
                    AppModel.trendData[3].average = (AppModel.trendData[3].average * (AppModel.trendData[0].data.length - 1) + app.cel2far(param.temperature)) / AppModel.trendData[0].data.length;
                    
                    break;
            };
        //historical packet - same procedure
        }else if(AppModel.devices[deviceindex].lastShowerID > param.showerId){
            
            switch(AppModel.devices[deviceindex].values[1]){
                    
                case 'Metric':
                    AppModel.trendData[0].data.push([param.showerId,param.volume]);
                    AppModel.trendData[0].sum = AppModel.trendData[0].sum + param.volume;
                    AppModel.trendData[1].data.push([param.showerId,param.energy]);
                    AppModel.trendData[1].sum = AppModel.trendData[1].sum + param.energy;
                    
                    //AppModel.trendData[2].average = AppModel.trendData[2].average * AppModel.trendData[0].data.length  + param.flow / AppModel.trendData[0].data.length;
                    AppModel.trendData[2].data.push([param.showerId,param.flow]);
                    
                    //AppModel.trendData[3].average = (AppModel.trendData[3].average * (AppModel.trendData[0].data.length - 1) + param.temperature) / AppModel.trendData[0].data.length;
                    AppModel.trendData[3].data.push([param.showerId,param.temperature]);
                    
                    
                    break;
                case 'Imperial':
                    AppModel.trendData[0].data.push([param.showerId,app.litres2gal(param.volume)]);
                    AppModel.trendData[0].sum = AppModel.trendData[0].sum + app.litres2gal(param.volume);
                    AppModel.trendData[1].data.push([param.showerId,param.energy]);
                    AppModel.trendData[1].sum = AppModel.trendData[1].sum + param.energy;
                    
                    AppModel.trendData[2].data.push([param.showerId,app.litres2gal(param.flow)]);
                    AppModel.trendData[2].average = (AppModel.trendData[2].average * AppModel.trendData[0].data.length  + app.litres2gal(param.flow)) / AppModel.trendData[0].data.length;
                    
                    AppModel.trendData[3].data.push([param.showerId,app.cel2far(param.temperature)]);
                    AppModel.trendData[3].average = (AppModel.trendData[3].average * (AppModel.trendData[0].data.length - 1) + app.cel2far(param.temperature)) / AppModel.trendData[0].data.length;
                    
                    break;
            };

            
        
        }else{
            
            var datalen = AppModel.trendData[0].data.length;
            switch(AppModel.devices[deviceindex].values[1]){
                    
                    case 'Metric':
                        AppModel.trendData[0].sum = AppModel.trendData[0].sum + param.volume - AppModel.trendData[0].data[0][1];
                        AppModel.trendData[0].data[0] = [param.showerId,param.volume];
                        AppModel.trendData[0].average = AppModel.trendData[0].sum / datalen;
            
                        AppModel.trendData[1].sum = AppModel.trendData[1].sum  + param.energy - AppModel.trendData[1].data[0][1];
                        AppModel.trendData[1].data[0] = [param.showerId,param.energy];
                        AppModel.trendData[1].average = AppModel.trendData[1].sum / datalen;
                    
                        AppModel.trendData[2].data[0] = [param.showerId,param.flow];
                        //AppModel.trendData[2].average =  (datalen*AppModel.trendData[2].average + param.flow)/datalen;
            
                        AppModel.trendData[3].data[0] = [param.showerId,param.temperature];
                        //AppModel.trendData[3].average = (AppModel.trendData[3].average + param.temperature)/datalen;
                        break;
                    
                    case 'Imperial':
                        AppModel.trendData[0].sum = AppModel.trendData[0].sum + app.litres2gal(param.volume) - AppModel.trendData[0].data[0][1];
                        AppModel.trendData[0].data[0] = [param.showerId,app.litres2gal(param.volume)];
                        AppModel.trendData[0].average = AppModel.trendData[0].sum / datalen;
                    
                        AppModel.trendData[1].sum = AppModel.trendData[1].sum  + param.energy - AppModel.trendData[1].data[0][1];
                        AppModel.trendData[1].data[0] = [param.showerId,param.energy];
                        AppModel.trendData[1].average = AppModel.trendData[1].sum / datalen;
                    
                        AppModel.trendData[2].data[0] = [param.showerId,app.litres2gal(param.flow)];
                       // AppModel.trendData[2].average = (datalen*AppModel.trendData[2].average + app.litres2gal(param.flow))/datalen;
                    
                        AppModel.trendData[3].data[0] = [param.showerId,app.cel2far(param.temperature)];
                        //AppModel.trendData[3].average = (datalen*AppModel.trendData[3].average + cel2far(param.temperature))/datalen;
                        break;
            };
            
            $.event.trigger({type:'showers'});
            
        }
        
       

    },
    UpdateDeviceSettingsToDb : function(infos){
        
        app.db.transaction(function(tx) {
                           tx.executeSql('UPDATE devices SET devs = ? WHERE user_mail = ?',
                                         [infos,AppModel.user.email],
                                         function(){
                                         //alert('updated');
                                         },
                                         function(){
                                         //alert('error_updated');
                                         });
                           });
        
    },
    
    BluetoothSupervisor : function(deviceWithIndex){
        //$('#nikolas').append('executing for device  :' + deviceWithIndex);
        execute = function(){
            var option = AppModel.devices[deviceWithIndex].pendingRequests.shift();
            //$('#nikolas').append('executing function: ' + option.fn + ' - for device in pos:' + deviceWithIndex + '</br>');
            switch(option.fn){
                case 0:
                    app.RequestRealFromPeripheral(option.d);
                    break;
                case 1:
                    //app.RequestCB1FromPeripheral();
                    break;
                case 2:
                    AppModel.devices[deviceWithIndex].pendingRequests.push(option);
                    app.WriteCB2ToPeripheral(option.data,option.d);
                    
                    break;
                case 21:
                    app.RequestCB2FromPeripheral(option.d);
                    break;
                case 3:
                    AppModel.devices[deviceWithIndex].pendingRequests.push(option);
                    app.WriteCB3ToPeripheral(option.data,option.d);
                    break;
                case 31:
                    app.RequestCB3FromPeripheral(option.d);
                    break;
                case 4:
                    AppModel.devices[deviceWithIndex].pendingRequests.push(option);
                    app.WriteCB4ToPeripheral(option.data,option.d);
                    break;
                case 41:
                    app.RequestCB4FromPeripheral(option.d);
                    break;
                case 5:
                    app.RequestHistoryFromPeripheral(option.data,option.d);
                    break;
                case 6:
                    app.RequestNotification(option.d);
                    break;
                default:
                   app.BluetoothSupervisor(deviceWithIndex);
                    
            };
        }
        
        if (AppModel.devices[deviceWithIndex].pendingRequests.length > 0){
            if(AppModel.availability == 1 && AppModel.notify == 1){
                setTimeout(function(){
                           execute();
                           },5000);
            }else if(AppModel.availability == 1 && AppModel.notify == 0){
                //$('#nikolas').append('request notify');
                app.RequestNotification(deviceWithIndex);
            }else{
                //$('#nikolas').append('save_requests');
                EventBus.publish('model');
            }
        }else{
            
            //alert('empty requests');
        }
    },
    RequestNotification : function(deviceWithIndex){
        onConnect = function() {
            ble.startNotification(AppModel.devices[deviceWithIndex].id,AppModel.amphiro.serviceUUID,AppModel.amphiro.rxCharacteristic, onData, onError1);
            AppModel.notify = 1;
        },
        onData = function(data) {
           
            var dataToDecrypt = {
                data : data,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            app.DecryptPacket(dataToDecrypt);
        }
        onError1 = function(reason){
            AppModel.notify = 0;
            app.BluetoothSupervisor(deviceWithIndex);
            //EventBus.publish('disconnect');
        },
        onError = function(reason){
           app.BluetoothSupervisor(deviceWithIndex);
          //EventBus.publish('disconnect');
        }

        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    RequestHistoryFromPeripheral : function(params,deviceWithIndex){
        requestHistory = function(ids){
            
            var his = new Uint8Array(18);
            his[0] = 0x22;
            his[1] = 0x01;
            his[3] = '0x'+ hex16(ids.first).slice(0,2);
            his[4] = '0x'+ hex16(ids.first).slice(2,4);
            his[5] = '0x'+ hex16(ids.last).slice(0,2);
            his[6] = '0x'+ hex16(ids.last).slice(2,4);
            for (i = 7; i < his.length; i++) {
                his[i] = 0x00;
            }
            his[2] = '0x' + int2hex(payloadCheckSum(his));
            
            return his.buffer;
        },
        
        onConnect = function() {
            
            var bf = requestHistory(params);
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
        },
        
        onError = function(reason){
            app.stop();
            $.event.trigger({type:'unitChanged'});
            app.BluetoothSupervisor(deviceWithIndex);
            //EventBus.publish('disconnect');
        }
        
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    RequestRealFromPeripheral : function(deviceWithIndex){
        requestReal = function(){
            
            var real = new Uint8Array(18);
            real[0] = 0x21;
            real[1] = 0x01;
            
            for (i = 3; i < real.length; i++) {
                real[i] = 0x00;
            }
            real[2] = payloadCheckSum(real);
            
            return real.buffer;
            
        },

        onConnect = function() {
            
            var bf = requestReal();
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };

            app.EncryptPacket(dataToEncrypt);
        },
        
        onError = function(reason){
            if (reason == 'Disconnected')
            {
                if(AppModel.mode == 0){
                    AppModel.devices[deviceWithIndex].pendingRequests.push({fn:0,d:deviceWithIndex});
                    app.BluetoothSupervisor(deviceWithIndex);
                    //EventBus.publish('settings');
                }
                //ble.connect(AppModel.devices[0].id, onConnect, onError);
            }
        },
       
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    RequestCB1FromPeripheral : function(deviceWithIndex){
        
        requestConfig1 = function (){
            
            var cb1 = new Uint8Array(18);
            cb1[0] = 0x23;
            cb1[1] = 0x01;
            for (i = 3; i < cb1.length; i++) {
                cb1[i] = 0x00;
            }
            cb1[2] = payloadCheckSum(cb1);
            
            return cb1.buffer;
            
        },
 
        onConnect = function() {
            var bf = requestConfig1();
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        
        onError = function(reason){
            //$('#nikolas').append('cb2rErr:' + reason + '</br>');
        },
        
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    RequestCB2FromPeripheral : function(deviceWithIndex){
        
        requestConfig2 = function (){
            
            var cb2 = new Uint8Array(18);
            cb2[0] = 0x24;
            cb2[1] = 0x01;
            for (i = 3; i < cb2.length; i++) {
                cb2[i] = 0x00;
            }
            cb2[2] = '0x' + int2hex(payloadCheckSum(cb2));
            
            return cb2.buffer;
            
        },

        onConnect = function() {
            var bf = requestConfig2();
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        
        onError = function(reason){
            app.BluetoothSupervisor(deviceWithIndex);
            //EventBus.publish('disconnect');
        },
        
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    RequestCB3FromPeripheral : function(deviceWithIndex){
        
         requestConfig3 = function(){
            
            var cb3 = new Uint8Array(18);
            cb3[0] = 0x25;
            cb3[1] = 0x01;
            for (i = 3; i < cb3.length; i++) {
                cb3[i] = 0x00;
            }
            cb3[2] = payloadCheckSum(cb3);
            
            return cb3.buffer;
            
        },

        onConnect = function() {
            
            var bf = requestConfig3();
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        
        onError = function(reason){
            app.BluetoothSupervisor(deviceWithIndex);
            //EventBus.publish('disconnect');
        },
        
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    RequestCB4FromPeripheral : function(deviceWithIndex){
        requestConfig4 = function(){
            
            var cb4 = new Uint8Array(18);
            cb4[0] = 0x26;
            cb4[1] = 0x01;
            for (i = 3; i < cb4.length; i++) {
                cb4[i] = 0x00;
            }
            cb4[2] = payloadCheckSum(cb4);
            
            return cb4.buffer;
            
        },

        onConnect = function() {
            var bf = requestConfig4();
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        
        onError = function(reason){
           // EventBus.publish('disconnect');
        },
        
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    WriteCB2ToPeripheral : function(params,deviceWithIndex){
        
        heating = function(type,solar){
            
            var val1 =  type.toString(2);
            var val2 =  (solar/4).toString(2);
            var res = ("000" + val1).slice(-3);
            var res1 = (res + ("00000" + val2).slice(-5));
            var a = parseInt(res1, 2);
            var final = a.toString(16);
            return final;
        },
        
        pricing = function(num2){
            var val1 = (9).toString(2);
            var val2 = (num2*100).toString(2);
            var res1 = ("0000" + val1).slice(-4);
            var res = (res1 + ("000000000000" + val2).slice(-12));
            var a = parseInt(res, 2);
            var final = a.toString(16);
            return  final;
        },

        setConfigBlock2 = function(parameters){
            var pct = new Uint8Array(18);
            pct[0] = 0x34; //function code
            pct[1] = 0x01; //version code
            
            pct[3] = '0x' + heating(parameters[5],parameters[8]); //heating type
            pct[4] = '0x' + hex8(parameters[6]); //heating efficiency
            pct[5] = '0x' + hex8(parameters[12]); //cold water temp
            pct[6] = '0x' + hex16(parameters[3]).slice(0,2); //alarm
            pct[7] = '0x' + hex16(parameters[3]).slice(2,4); //alarm
            
            var pr = pricing(parameters[7]);
            pct[8] = '0x' + pr.slice(0,2); //pricing
            pct[9] = '0x' + pr.slice(2,4); //pricing
            pct[10] = 0x02;//co2 - default
            pct[11] = 0x3B;//co2 - default
            pct[12] = 0xB4; //maximum break duration -default
            //if the display is configured to show a custom string
            pct[13] = 0x2A; // custom string display config
            pct[14] = 0x42; // custom string display config
            pct[15] = 0x31; // custom string display config
            pct[16] = 0x2A; // custom string display config
            
            pct[17] = 0x01; //random value
            
            pct[2] = '0x' + int2hex(payloadCheckSum(pct));
            
            return pct.buffer;
        },

        onConnect = function() {
            //live = 1;
            var bf = setConfigBlock2(params);
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        
        onError = function(reason){
            app.BluetoothSupervisor(deviceWithIndex);
            //EventBus.publish('disconnect');
        }
        
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    WriteCB3ToPeripheral : function(params,deviceWithIndex){
        
        setConfigBlock3 = function(changes){
            var scb3 = new Uint8Array(18);
            scb3[0] = 0x35;
            scb3[1] = 0x01;
            
            scb3[4] = hex8(AppModel.configs.unit[changes[1]].temp);
            scb3[3] = 0x03;
            scb3[5] = 0x00;
            //scb3[5] = hex8(AppModel.configs.currency[changes[2]]);
            scb3[6] = 0x00;
            
            scb3[7] = hex8(AppModel.configs.unit[changes[1]].vol);
            scb3[8] = hex8(AppModel.configs.unit[changes[1]].vol);
            //scb3[8] = 0x03;
            scb3[9] = 0x00;
            scb3[10] = 0x00;
            
            scb3[11] = 0x02;
            scb3[12] = 0x02;
            scb3[13] = 0x00;
            scb3[14] = 0x00;
            
            scb3[15] = 0x02;
            scb3[16] = 0x03;
            
            scb3[17] = 0x01;
            
            scb3[2] = '0x' + int2hex(payloadCheckSum(scb3));
            
            return scb3.buffer;
            
        },

        onConnect = function() {
           
            var bf = setConfigBlock3(params);
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        onError = function(reason){
            app.BluetoothSupervisor(deviceWithIndex);
            //EventBus.publish('disconnect');
        }
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
    },
    WriteCB4ToPeripheral : function(params,deviceWithIndex){
        setConfigBlock4 = function (changes){
            var scb4 = new Uint8Array(18);
            scb4[0] = 0x36;
            scb4[1] = 0x01;
            
            scb4[4] = hex8(AppModel.configs.unit[changes[1]].temp);
            scb4[3] = 0x03;
            scb4[5] = 0x00;
            //scb4[5] = hex8(AppModel.configs.currency[changes[2]]);
            scb4[6] = 0x00;
            
            scb4[7] = hex8(AppModel.configs.unit[changes[1]].vol);
            scb4[8] = 0x03;
            scb4[9] = 0x00;
            scb4[10] = 0x00;
            
            scb4[11] = 0x02;
            scb4[12] = 0x02;
            scb4[13] = 0x00;
            scb4[14] = 0x00;
            
            scb4[15] = 0x02;
            scb4[16] = 0x03;
            
            scb4[17] = 0x01;
            
            scb4[2] = '0x' + int2hex(payloadCheckSum(scb4));
            
            return scb4.buffer;
            
        },

        onConnect = function() {
            
            var bf = setConfigBlock4(params);
            
            var dataToEncrypt = {
                buf : bf,
                key : AppModel.devices[deviceWithIndex].aeskey,
                id : AppModel.devices[deviceWithIndex].id
            };
            
            app.EncryptPacket(dataToEncrypt);
            
        },
        
        onError = function(reason){
            //$('#nikolas').append('wcb4Err:' + reason + '</br>');
            //EventBus.publish('disconnect');
            app.BluetoothSupervisor(deviceWithIndex);
        }
        
        //var live4 = 0;
        ble.connect(AppModel.devices[deviceWithIndex].id, onConnect, onError);
        
    },
    RequestCodeFromPeripheral : function(){
        
       packetAES = function(){
            var aescode = new Uint8Array(18);
            aescode[0] = 0xFF;
            aescode[1] = 0x01;
            aescode[2] = 0x77;
            for (i = 3; i < aescode.length; i++) {
                aescode[i] = 0xB1;
            }
            
            return aescode.buffer;
        },

        onConnect = function() {
            ble.startNotification(AppModel.selectedToPairWithID,AppModel.amphiro.serviceUUID,AppModel.amphiro.rxCharacteristic, onData, onError1);
            app.UnecryptedPacket(packetAES());
        },
        
        onData = function(data) {
           
            AppModel.PingData = ab2str(data);
           /*This data is response from AesCode - Ping Response*/
        }
        onError1 = function(reason){
            //alert(reason);
        },

        onError = function(reason){
            //alert('error:' + reason);
        }
        
        /*
        
        //recursive code checkings
        setTimeout(function(){
                   if(AppModel.PingData == null){
                        //alert('no ping yet');
                        app.RequestCodeFromPeripheral();
                   }else{
                   setTimeout(function(){
                              var checkID = findDeviceIndex(AppModel.devices,'id',AppModel.selectedToPairWithID);
                              if(checkID == null){
                                    //alert('maybe you ve missed code');
                                    app.RequestCodeFromPeripheral();
                              }else{
                                    return;
                              }
                              },30000);
                   }
                   },10000);
        */
        ble.connect(AppModel.selectedToPairWithID, onConnect, onError);
    },
    
    AesCode : function(str){
        
        c = [];
        
        for (var i = 0; i < str.length; ++i)
        {
            c.push(str.charCodeAt(i));
        }
        
        IntValue = 26 * (26 * (26 * (26 * (2 * (10 * (10 * (c[7] - 48) + (c[6] - 48)) + (c[5] - 48)) + (c[4] - 48)) + (c[3] - 65)) + (c[2] - 65)) + (c[1] - 65)) + (c[0] - 65);
        
        
        AESKey = new Uint8Array(16);
        
        AESKey[0] = IntValue >> 0 & (255);
        
        AESKey[1] = IntValue >> 8 & (255);
        
        AESKey[2] = IntValue >> 16 & (255);
        
        AESKey[3] = IntValue >> 24 & (255);
        
        for (i = 4; i<16; i++){
            
            bb = 0;
            
            for (j = 0; j < 4; j++) {
                
                bb = (bb >> 1)  + (bb << 7);
                
                bb = ( bb + AESKey[(i-4) + j]) & (255);
                
            }
            
            AESKey[i] = bb;
            
        }
        
        var dataToDecrypt = {
            data : str2ab(AppModel.PingData),
            key : app.hex(AESKey),
            id : AppModel.selectedToPairWithID
        };
        
        app.DecryptPacket(dataToDecrypt);
        
    },
    getCode : function(){
        
        AppModel.selectedToPairWithKey = ($(this).val()).trim();
        //alert($(this).val());
        
    },
    checkCode :  function() {
        
        var key = AppModel.selectedToPairWithKey;
        
        if(key.length == 4){
            var newStr = app.toUpper(key.insert(4,"0000"));
            app.AesCode(newStr);
        }else if(key.length == 5){
            var newStr = app.toUpper(key.insert(4,"000"));
            app.AesCode(newStr);
        }else if(key.length == 6){
            var newStr = app.toUpper(key.insert(4,"00"));
            app.AesCode(newStr);
        }else if(key.length == 7){
            var newStr = app.toUpper(key.insert(4,"0"));
            app.AesCode(newStr);
        }else if(key.length == 8){
            var newStr = app.toUpper(key);
            app.AesCode(newStr);
        }else{
            var blest = new NotificationManager();
            blest.PairingCode();
        }
    },
    RenderNewDevices : function(id,rssi){
        
        if(rssi > -67 ){
            $('.discovered').append('<li data-name='+id+'><div class="item-content"><div class="item-inner"><div class="item-title"> amphiro b1 (strong signal) </div><div class="item-after button button-fill codeee" id="openPrompti" style="background-color:#7ca9bd;">Connect</div></div></div></li>');
        }else if(rssi >= -82 && rssi <=-67){
            $('.discovered').append('<li data-name='+id+'><div class="item-content"><div class="item-inner"><div class="item-title"> amphiro b1 (medium signal) </div><div class="item-after button button-fill codeee" id="openPrompti" style="background-color:#7ca9bd;">Connect</div></div></div></li>');
        }else{
            $('.discovered').append('<li data-name='+id+'><div class="item-content"><div class="item-inner"><div class="item-title"> amphiro b1 (weak signal) </div><div class="item-after button button-fill codeee" id="openPrompti" style="background-color:#7ca9bd;">Connect</div></div></div></li>');
        }
        
    },
    DeviceToPair : function() {
        
        AppModel.selectedToPairWithID = $(this).attr('data-name');
        $.event.trigger({
                        type: "ping"
                        });
        
    },
    ShowMePrompt : function(){
        
        navigator.notification.prompt(
                                      'Your amphiro b1 is now showing the Connection key in the shower. Enter it here.',  // message
                                      app.onPairingDev,                  // callback to invoke
                                      'amphiro b1',            // title
                                      ['Ok','Exit']
                                      );
    
    },
    onPairingDev : function(results){
        if(results.buttonIndex == 1){
            AppModel.selectedToPairWithKey = (results.input1).trim();
            app.checkCode();
        }else if(results.buttonIndex == 2){
        }
    },
    
    openDb : function() {
        
        if (window.sqlitePlugin !== undefined) {
            app.db = window.sqlitePlugin.openDatabase("b1");
            app.db.transaction(function(tx) {
                               tx.executeSql('CREATE TABLE IF NOT EXISTS feel(id,history,indexs,cdate,category,volume,flow,temp,energy,tshower)', []);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS user(firstname,lastname,email,password,gender,country,zip,birth,appkey)', []);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS devices(user_mail,devs)', []);
                               //tx.executeSql('CREATE TABLE IF NOT EXISTS user(infos)', []);
                               });
        } else {
            // For debugging in simulator fallback to native SQL Lite
            app.db = window.openDatabase("b1", "1.0", "version_", 200000);
        }
    },
    storeHistory : function(param){
        
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from feel where indexs = ? AND id= ?  ',[param.showerId,param.id], function(tx, results) {
                                         var len = results.rows.length;
                                         //$('#nikolas').append('trying to store history : ' + len);
                                         if(len == 0){
                                            //$('#nikolas').append('storing history</br>');
                                            app.storeData(param);
                                            //app.UpdateDataModel(param);
                                         
                                            $.event.trigger({type:'unitChanged'});
                                            $.event.trigger({type:'upload'});
                                            //$.event.trigger({type:'showers'});
                                         }
                                         
                                         });
                           });

    },
    storeData : function(param){
        app.db.transaction(function(tx) {
                           tx.executeSql('INSERT INTO feel(id,history,indexs,cdate,category,volume,flow,temp,energy,tshower) VALUES (?,?,?,?,?,?,?,?,?,?)',
                                         [param.id,param.history,param.showerId,param.date,param.category,param.volume,param.flow,param.temperature,param.energy,param.duration],
                                         function(){},function(){alert('db_error');});
                           });
    },
    storeUser : function(info) {
        
        app.db.transaction(function(tx) {
                           tx.executeSql('INSERT INTO user(firstname,lastname,email,password,gender,country,zip,birth,appkey) VALUES (?,?,?,?,?,?,?,?,?)',
                                        [info.fname,info.lname,info.email,info.password,info.gender,info.country,info.zip,info.date,info.applicationKey],
                                         function(){
                                         //alert('user_stored');
                                         },function(){
                                         //alert('user_stored_failed');
                                         });
                          });
         /*
        app.db.transaction(function(tx) {
                           tx.executeSql('INSERT INTO user(infos) VALUES (?)',
                                         [info],
                                         function(){
                                         alert('user_stored');
                                         },function(){
                                         alert('user_stored_failed');
                                         });
                           });
         */
    },
    
    storeDevices : function(mail,devinfo) {
        app.db.transaction(function(tx) {
                           tx.executeSql('INSERT INTO devices(user_mail,devs) VALUES (?,?)',
                                         [mail,devinfo],
                                         function(){
                                         //alert('device_stored');
                                         },function(){
                                         //alert('device_failed');
                                         });
                           });
    },
    fetchDevicesForUser : function(mail){
    
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from devices where user_mail = ?',[mail], function(tx, results) {
                                         var len = results.rows.length;
                                         if(len > 0){
                                            for (var i=0; i<len; i++){
                                                var res = JSON.parse(results.rows.item(i).devs);
                                                //$.each(res,function(i){
                                                AppModel.devices.push(res[i]);
                                                //});
                                         
                                            }
                                         
                                            app.setAmphiroToLocalStorage(JSON.stringify(AppModel.devices));
                                            //app.setInitialView();
                                            app.SetDataAndGraphLabels(0);
                                         }
                                        
                                         
                                         app.renderCustomView(1);
                                         //alert(JSON.stringify(AppModel.devices));
                                         //alert(JSON.stringify(AppModel.user));
                                         //app.Instatiate();
                                         
                                         //alert(JSON.stringify(AppModel.devices));
                                         });
                           });

    
    },
    CheckUserExistance : function(mail,pass){
        
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from user where email = ? AND password = ?',[mail,pass], function(tx, results) {
                                         var len = results.rows.length;
                                                                                  //alert(len);
                                         if(len > 0){
                                         
                                        //alert(JSON.stringify(AppModel.user));
                                         for (var i=0; i<len; i++){
                                         
                                         var userlogged = {
                                         
                                         "email" : results.rows.item(i).email,
                                         "password" : results.rows.item(i).password,
                                         "repassword" : results.rows.item(i).password,
                                         "fname" : results.rows.item(i).firstname,
                                         "lname" : results.rows.item(i).lastname,
                                         "gender" : results.rows.item(i).gender,
                                         "birth" : results.rows.item(i).birth,
                                         "country" : results.rows.item(i).country,
                                          "zip": results.rows.item(i).zip,
                                         "applicationKey" : results.rows.item(i).appkey
                                         
                                         };

                                         
                                         }
                                         
                                         AppModel.user = userlogged;
                                         app.setUserToLocalStorage(JSON.stringify(AppModel.user));
                                         
                                         app.fetchDevicesForUser(AppModel.user.email);
                                         
                                         //e.preventDefault();
                                         
                                         }else{
                                            var logstatus = new NotificationManager();
                                            logstatus.LoginFailed();
                                            e.preventDefault();
                                         
                                         }
                                         });
                           });
        
        /*
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from user',[], function(tx, results) {
                                         var len = results.rows.length;
                                         //alert(len);
                                         if(len > 0){
                                         for (var i=0; i<len; i++){
                                            //alert(JSON.parse(results.rows.item(i)));
                                            var res = JSON.parse(results.rows.item(i).infos);
                                         
                                            //var bb = JSON.parse(res);
                                            alert(JSON.stringify(res));
                                            //alert(bb[0].email);
                                         }
                                         }
                                         //alert(JSON.stringify(AppModel.user));
                                        
                                         });
                           });
         */
    },
    
    EnterRegister : function(){
        $('#noaccountbar').hide();
        $('#registerbar').show();
        $('#dateofbirth').attr('max',app.date2human());
    },
    EnterLogin : function(){
        $('#noaccountbar').hide();
        $('#loginbar').show();
    },
    PopulateUserInfo : function(){
        $('#homebar').hide();
        $('#accountbar').show();
        /*if(AppModel.devices[0].privacy == 1){
            $('#privacy').attr('checked',true);
            $('#accountInfos').hide();
        }
        if(AppModel.devices[0].repstate == 0){
            $('#repo').attr('checked',false);
            $('#rep').hide();
        }*/
        if(AppModel.devices[0].uploadData == 1){
            $('#uploadData').attr('checked',true);
            
        }
         //$('#frequency').val(AppModel.devices[0].repfrequency);
        var inf = [];
        
        $.each(AppModel.user,function(key,val){
                inf.push(val);
                });
        
            
        $('#accountInfos div.item-after').each(function(i) {
                                                $(this).html(inf[i]);
                                                });
       
        
    },
    PopulatePairedDevices : function(){
        $('#homebar').hide();
        $('#pairedbar').show();
        $('#paired').empty();
        
        $.each(AppModel.devices,function(i){
               $("#paired").append('<li data-name='+AppModel.devices[i].id+' ><a href="#AmphiroUpdate" style="color:#7ca9bd;"><div class="item-content"><div class="item-inner"><div class="item-title">'+ AppModel.devices[i].values[0] +'</div><div class="item-after"><img src="img/images1212.png" /></div></div></div></a></li>');
               });
    },
    LeavePairedDevices : function(){
            $('#connectbar').hide();
            $('#homebar').show();
    },
    PopulateDeviceSettings : function(){
        $('#homebar').hide();
        $('#pairedbar').hide();
        $('#updatebar').show();
        
        $('#updateBtns p.active').removeClass('active');
        $('#connection').addClass('active');
        
        $('#infos').show();
        $('#updateform').hide();
        $('#lastConnection').show();
        $('#lastUpdate').hide();
        
        var results = getObjects(AppModel.devices, 'id', AppModel.selectedDeviceWithID);
        
        /*if(results[0].values[1] == 'Imperial'){
         $('#coldSlider').attr({'min':32,'max':99,'value':50});
         }*/
        
        //$('#devd').html((results[0].id).substring(0, 13));
        $('#devt').html(app.timeConverter(results[0].lastTimeOfConnection));
        $('#devu').html(app.timeConverter(results[0].lastTimeOfUpdate));
        //populate 'connection' divs with values
        $('#deviceopt div.item-after').each(function(i) {
                                            if(i == 3){
                                                $(this).html(results[0].values[i]/60);
                                            }
                                            else if(i==5){
                                                if(results[0].values[i] == 0){
                                                    $(this).html('Gas');
                                                }else if(results[0].values[i] ==1){
                                                    $(this).html('Electricity');
                                                }else{
                                                    $(this).html('Oil');
                                                }
                                            }
                                            else{
                                                $(this).html(results[0].values[i]);
                                            }
                                            });
        //populate 'edit' inputs with values
        $('#updateform input,#updateform select ').each(function(i){
                                                        $(this).val(results[0].values[i]);
                                                        });
        //populate 'edit' span with values - user friendly
        $('#updateform div.content-block-title span').each(function(i) {
                                                           
                                                           $(this).html(results[0].values[i]);
                                                           
                                                           });
    },
    EnterCustomConnect : function(){
        
        $('#customconnect').hide();
        $('#customconnectionbar').show();
        
        $('.discovered').empty();
        
        AppModel.NewDevices.length = 0;
        
    },
    LeaveCustomConnect : function(){
        
        AppModel.NewDevices.length = 0;
        $('.discovered').empty();
    
    },
    EnterInstallScreen : function(){
        
        $('#homebar').hide();
        $('#connectbar').show();
        $('.discovered').empty();
        
        AppModel.NewDevices.length = 0;
        
        $.each(AppModel.devices,function(i){
               if(AppModel.devices[i].aeskey !== null){
               $('.already').append('<li data-name='+AppModel.devices[i].id+' ><div class="item-content"><div class="item-inner"><div class="item-title">'+ AppModel.devices[i].values[0] +'</div><div class="item-after button button-fill " style="background-color:#7ca9bd;">Disconnect</div></div></div></li>');
               }
               });
    },
    LeaveInstallScreen : function(){
    
        $('.already').empty();
    
    },
    HandleConnectionTab : function(){
        
        $('#updateBtns p.active').removeClass('active');
        $(this).addClass('active');
        
        $('#infos').show();
        $('#lastConnection').show();
        $('#updateform').hide();
        $('#lastUpdate').hide();
        
    },
    HandleEditTab : function(){
        
        $('#updateBtns p.active').removeClass('active');
        $(this).addClass('active');
        
        $('#infos').hide();
        $('#lastConnection').hide();
        $('#updateform').show();
        $('#lastUpdate').show();
    },
    ApplyNewSettings : function(){
        var deviceindex = findDeviceIndex(AppModel.devices, 'id', AppModel.selectedDeviceWithID);
        //alert(deviceindex);
        //alert(JSON.stringify(AppModel.devices));
        settingsSaved = function(){
            navigator.notification.alert(
                                         'Saved',  // message
                                         function(){
                                            app.BluetoothSupervisor(deviceindex);
                                            //EventBus.publish('settings');
                                            app.renderCustomView(5);
                                         },         // callback
                                         'Device Settings',            // title
                                         'Done'                  // buttonName
                                         );
        
        },
        askToUpdate = function(){
            navigator.notification.confirm(
                                           'Are you sure you want to overwrite the current settings?', // message
                                           onUpdateMe,            // callback to invoke with index of button pressed
                                           'Device Settings',           // title
                                           ['Yes','No']     // buttonLabels
                                           );

        
        },
        askToRemoveUpdates = function(){
            navigator.notification.confirm(
                                           'There is an update request.Do you want to overwrite and continue?', // message
                                           onUpdateAgain,            // callback to invoke with index of button pressed
                                           'Device Settings',           // title
                                           ['Yes','No']     // buttonLabels
                                           );
            
            
        },
        onUpdateAgain = function(buttonIndex){
            if(buttonIndex == 1){
                
                AppModel.devices[deviceindex].pendingRequests.push({fn:2,data:temp,d:deviceindex});
                AppModel.devices[deviceindex].pendingRequests.push({fn:3,data:temp,d:deviceindex});
                AppModel.devices[deviceindex].pendingRequests.push({fn:4,data:temp,d:deviceindex});
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',21);},10);
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',31);},20);
                
            }
            app.BluetoothSupervisor(deviceindex);
            //EventBus.publish('settings');
            app.renderCustomView(5);
        },
        onUpdateMe = function(buttonIndex){
            if(buttonIndex ==2){
                //AppModel.devices[deviceindex].pendingRequests.unshift({fn:31,d:deviceindex});
                //AppModel.devices[deviceindex].pendingRequests.unshift({fn:21,d:deviceindex});
            }else if(buttonIndex == 1){
                AppModel.devices[deviceindex].pendingRequests.push({fn:2,data:temp,d:deviceindex});
                AppModel.devices[deviceindex].pendingRequests.push({fn:3,data:temp,d:deviceindex});
                AppModel.devices[deviceindex].pendingRequests.push({fn:4,data:temp,d:deviceindex});
                app.BluetoothSupervisor(deviceindex);
                app.renderCustomView(5);
            }
            //EventBus.publish('settings');
            
        }
        
        AppModel.changescb2 = 0;
        AppModel.changescb34 = 0;
        var temp = [];
        var settings = AppModel.devices[deviceindex].values;
        $('#updateform input,#updateform select ').each(function(i){
                                                        switch(i){
                                                        case 0:
                                                            //temp[i] = $(this).val();
                                                            AppModel.devices[deviceindex].values[0] = $(this).val();
                                                            EventBus.publish('model');
                                                            break;
                                                        case 1:
                                                            if (settings[i] != $(this).val()){
                                                        
                                                                AppModel.changescb34 = 1;
                                                            }
                                                            temp[i] = $(this).val();
                                                            break;
                                                        case 2:
                                                            if (settings[i] != $(this).val()){
                                                        
                                                                if(AppModel.changescb34 == 0){
                                                                    AppModel.changescb34 = 1;
                                                                }
                                                            }
                                                            temp[i] = $(this).val();
                                                            break;
                                                        default :
                                                            if (settings[i] != $(this).val()){
                                                                if(AppModel.changescb2 == 0){
                                                                    AppModel.changescb2 = 1;
                                                                }
                                                            }
                                                            temp[i] = $(this).val();
                                                        };
                                                        });
        
        //AppModel.devices[0].values = temp;
        if(AppModel.changescb2 == 1 && AppModel.changescb34 == 1){
            var checkFn2 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 2);
            var checkFn3 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 3);
            var checkFn4 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 4);
            if(checkFn2.length > 0 && checkFn3.length > 0 ){
                checkFn2[0].data = temp;
                checkFn3[0].data = temp;
                checkFn4[0].data = temp;
                settingsSaved();
                
            }else{
                var checkFn21 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 21);
                if(checkFn21.length == 0){
                    askToUpdate();
                }else{
                    askToRemoveUpdates();
                }
            }
            
        }
        else if(AppModel.changescb34 == 1 && AppModel.changescb2 == 0){
            var checkFn3 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 3);
            var checkFn4 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 4);
            if(checkFn3.length > 0){
                checkFn3[0].data = temp;
                checkFn4[0].data = temp;
                settingsSaved();
               
            }else{
                var checkFn21 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 21);
                if(checkFn21.length == 0){
                    askToUpdate();
                }else{
                    askToRemoveUpdates();
                }

            }
            
        }else if(AppModel.changescb34 == 0 && AppModel.changescb2 == 1){
            var checkFn2 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 2);
            if(checkFn2.length > 0){
                checkFn2[0].data = temp;
                settingsSaved();
                
            }else{
                var checkFn21 = getObjects(AppModel.devices[deviceindex].pendingRequests, 'fn', 21);
                if(checkFn21.length == 0){
                    askToUpdate();
                }else{
                    askToRemoveUpdates();
                }

            }
            
        }
        
    },
    ApplyDefaultSettings : function(){
        onApplyDefaults = function(buttonIndex){
            if(buttonIndex == 1){
                //AppModel.devices[0].pendingRequests.length = 0;
                var deviceindex = findDeviceIndex(AppModel.devices, 'id', AppModel.selectedDeviceWithID);
                //$('#nikolas').append('saving defaults for device  :' + deviceindex);
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',2);},10);
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',3);},20);
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',4);},30);
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',21);},40);
                setTimeout(function(){findAndRemove(AppModel.devices[deviceindex].pendingRequests, 'fn',31);},50);
                setTimeout(function(){
                           //$('#nikolas').append('pending defaults for device  :' + deviceindex);
                           AppModel.devices[deviceindex].pendingRequests.push({fn:2,data:AppModel.deviceOptions.values,d:deviceindex});
                           AppModel.devices[deviceindex].pendingRequests.push({fn:3,data:AppModel.deviceOptions.values,d:deviceindex});
                           AppModel.devices[deviceindex].pendingRequests.push({fn:4,data:AppModel.deviceOptions.values,d:deviceindex});
                          
                           app.BluetoothSupervisor(deviceindex);
                           //EventBus.publish('settings');
                           app.renderCustomView(5);
                           },100);
            }
        }
        
        navigator.notification.confirm(
                                       'Are you sure?', // message
                                       onApplyDefaults,            // callback to invoke with index of button pressed
                                       'Apply Device Defaults',           // title
                                       ['Yes','No']     // buttonLabels
                                       );
         
        
         //$.mobile.changePage('#AmphiroInstall');
        
    },
    
    UnpairDevice : function(){
        navigator.notification.confirm(
                                       'Do you want to disconnect from the device?', // message
                                       app.onUnpair,            // callback to invoke with index of button pressed
                                       'Unpair Device',           // title
                                       ['Confirm','Cancel']     // buttonLabels
                                       );
    },
    onUnpair : function(buttonIndex) {
        if( buttonIndex == 1){
            
            var idpos = findDeviceIndex(AppModel.devices, 'id', AppModel.selectedToUnpair);
            AppModel.devices[idpos].aeskey = null;
            var removingId = (AppModel.NewDevices).indexOf(AppModel.selectedToUnpair);
            if (removingId > -1) {
                (AppModel.NewDevices).splice(removingId, 1);
            }
            EventBus.publish('model');
            
            app.renderCustomView(8);
            
        }
    },
    ResetDevice : function(){
        navigator.notification.confirm(
                                       'Are you sure?', // message
                                       app.onReset1,            // callback to invoke with index of button pressed
                                       'Reset Device',           // title
                                       ['Confirm','Cancel']     // buttonLabels
                                       );
    },
    onReset1 : function(buttonIndex) {
        if(buttonIndex == 1){
        navigator.notification.confirm(
                                       'To reset the device turn on the water to power your b1', // message
                                       app.onReset2,            // callback to invoke with index of button pressed
                                       '',           // title
                                       ['Reset','Cancel']     // buttonLabels
                                       );
        }
    },
    onReset2 : function(buttonIndex) {
        if( buttonIndex == 1){
            alert('reset:' + AppModel.selectedDeviceWithID);
        }
    },
    
    DeviceToSee : function() {
        
        AppModel.selectedDeviceWithID = $(this).attr('data-name');
    },
    ChangeReports : function(){
        
        if ($(this).is(":checked")){
            AppModel.devices[0].repstate = 1;
            $("#rep").fadeIn( "swing");
        }else{
            AppModel.devices[0].repstate = 0;
            $("#rep").fadeOut( "swing");
        }
    },
    ChangePrivacy : function(){
       
        if ($(this).is(":checked")){
            //$(this).next('.checkbox').css('background-color','red');
            AppModel.devices[0].privacy = 1;
            $("#accountInfos").fadeOut( "swing");
        }else{
            //$(this).next('.checkbox').css('background-color','initial');
            AppModel.devices[0].privacy = 0;
            $("#accountInfos").fadeIn( "swing");
        }
    },
    ChangeUpload : function(){
        if ($(this).is(":checked")){
            AppModel.devices[0].uploadData = 1;
            //EventBus.publish('model');
        }else{
            AppModel.devices[0].uploadData = 0;
            //EventBus.publish('model');
        }

    },
    
    //UPLOADING FUNCTIONS
    InternetWatcher : function(){
                    
                    var CheckingInternetConnection = app.checkConnection();
                    //alert(CheckingInternetConnection);
                    if ( CheckingInternetConnection == 'WiFi connection' || CheckingInternetConnection == 'Cell generic connection'){
                    
                        return 1;
                       //EventBus.publish('InternetAvailable');
                    }else{
                    
                    
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
        
    },
    CheckKeysForUploadData : function(){
        
        $.each(AppModel.devices,function(i){
               if(AppModel.devices[i].deviceKey){
               //this device is registerd to server
               //$('#nikolas').append('device' + AppModel.devices[i].id +' is registered to server</br>');
               }else{
               //this device is not registered to server
               //so try to registerd this one
               //$('#nikolas').append('device' + AppModel.devices[i].id +' is registering to server..please wait.</br>');
                app.RegisterDeviceToServer(AppModel.devices[i]);
               }
               });
        
    },
    
    SendUserToServer : function(user){
        var InternetConnection   = app.InternetWatcher();

        if ( InternetConnection == 1 ){
            //if internet connection then create user object to send
            var CreateUser = {
                "username":user.email,
                "password":user.password,
                "firstname":user.fname,
                "lastname":user.lname,
                "gender":app.toUpper(user.gender),
                "birthdate":user.date,
                "country":user.country,
                "zip":user.zip,
                "group":null
            };
            
            //prepare ajax post request and send user data for userkey
            $.ajax({
               type : "POST",
               url : 'https://app.dev.daiad.eu/api/v1/user/register',
               dataType : 'json',
               data : JSON.stringify(CreateUser),
               contentType : "application/json"
               }).done(function(data) {
                       //respond from server..
                       //$('#nikolas').append('server respond: ' + JSON.stringify(data));
                       if(data.applicationKey != null){
                        AppModel.user.applicationKey = data.applicationKey;
                        //app.storeUser(data);
                        app.storeUser(AppModel.user);
                        app.setUserToLocalStorage(JSON.stringify(AppModel.user));
                        app.renderCustomView(0);
                       }else{
                        var reg = new NotificationManager(data);
                        reg.RegisterFailed();
                       }
                       
                       }).fail(function() {
                               
                               //alert('fail');
                               }).always(function() {
                                         //alert('always');
                                         });
        }else{
            //app.setUserToLocalStorage(JSON.stringify(AppModel.user));
            //app.renderCustomView(0);
            var regg = new NotificationManager();
            regg.ConnectionMessage();

        }
        
    },
    RegisterDeviceToServer : function(device){
        
        var InternetConnection  =  app.InternetWatcher();
        
        if ( InternetConnection == 1 ){
        
            var RegisterAmphiroDevice = {
                "deviceId":device.id,
                "name":device.values[0],
                "type":"AMPHIRO",
                "credentials": {
                    "username":AppModel.user.email,
                    "password":AppModel.user.password
                },
                "properties":[/*{
                          "key":"manufacturer",
                          "value":"amphiro"
                          }, {
                          "key":"model",
                          "value":"b1"
                          }*/
                              ]
            };
        
            $.ajax({
               type : "POST",
               url : 'https://app.dev.daiad.eu/api/v1/device/register',
               dataType : 'json',
               data : JSON.stringify(RegisterAmphiroDevice),
               contentType : "application/json"
               }).done(function(data) {
                       //$('#nikolas').append('server respond(device): ' + JSON.stringify(data));
                       if(data.deviceKey != null){
                        //find which device requesting deviceKey and store it
                        var idindex = findDeviceIndex(AppModel.devices, 'id', device.id);
                        AppModel.devices[idindex].deviceKey = data.deviceKey;
                        //save devices
                        EventBus.publish('model');
                                               }
                       }).fail(function() {
                               //alert('fail');
                               }).always(function() {
                                         //alert('always');
                                         });
        }else{
            //no internet connection..trying later
            //inform the user to enable wifi/cecullar data
            //alert('no internet connection');
            //var regg = new NotificationManager();
            //regg.ConnectionMessage();
        }
        
    },
    SendDataToServer : function(dataobj){
    
        var InternetConnection  =  app.InternetWatcher();
        
        if ( InternetConnection == 1 ){
            
            $.ajax({
               type : "POST",
               url : 'https://app.dev.daiad.eu/api/v1/data/storage',
               dataType : 'json',
               data : JSON.stringify(dataobj),
               contentType : "application/json"
               }).done(function(data) {
                    //handle errors for applicationKey and deviceKey
                    //$('#nikolas').append('server respond(device): ' + JSON.stringify(data));
                       if(data.errors[0].code == 2){
                       //$('#nikolas').append('server respond(device): USER EXISTS and DEVICE NOT EXIST..' );
                        app.CheckKeysForUploadData();
                       }
                       //alert(JSON.stringify(data));
                       }).fail(function() {
                               //alert('fail');
                               }).always(function() {
                                         //alert('always');
                                         });
        }/*else{
            alert('No internet connection');
        }*/
    },
    FetchDataForUpload : function(){
        //create data to upload with specific format
       
        $.each(AppModel.devices,function(j){
               
               app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs,history,id,max(cdate) as pctdate,max(volume) as volume,max(energy) as energy, max(flow) as flow , max(temp) as temp,max(tshower) as duration from feel where id=? group by indexs order by indexs desc ',[AppModel.devices[j].id], function(tx, results) {
                                         var len = results.rows.length;
                                         
                                         var DataObj = {
                                         
                                         "userKey":AppModel.user.applicationKey,
                                         "deviceKey":AppModel.devices[j].deviceKey,
                                         "type":"AMPHIRO",
                                         "credentials": {
                                         "username":AppModel.user.email,
                                         "password":AppModel.user.password
                                         },
                                         "sessions":[],
                                         "measurements":[]
                                         
                                         };

                                         for (var i=0; i<len; i++){
                                         
                                                    DataObj.sessions.push({
                                                               "showerId":results.rows.item(i).indexs,
                                                                "history" : results.rows.item(i).history,
                                                               "volume":results.rows.item(i).volume,
                                                               "temperature":results.rows.item(i).temp,
                                                               "energy":results.rows.item(i).energy,
                                                               "flow":results.rows.item(i).flow,
                                                               "duration":results.rows.item(i).duration,
                                                               "timestamp" : new Date(results.rows.item(i).pctdate).toJSON(),
                                                               "properties":[
                                                                             {
                                                                             "key":"settings.os",
                                                                             "value":"iOS"
                                                                             },
                                                                             {
                                                                             "key":"settings.device.name",
                                                                             "value":AppModel.devices[j].values[0]
                                                                             },
                                                                             {
                                                                             "key":"settings.device.calibrate",
                                                                             "value":AppModel.devices[j].values[10]
                                                                             },
                                                                             {
                                                                             "key":"settings.unit",
                                                                             "value":AppModel.devices[j].values[1]
                                                                             },
                                                                             {
                                                                             "key":"settings.currency",
                                                                             "value":AppModel.devices[j].values[2]
                                                                             },
                                                                             {
                                                                             "key":"settings.alarm",
                                                                             "value":AppModel.devices[j].values[3]
                                                                             },
                                                                             {
                                                                             "key":"settings.water.cost",
                                                                             "value":AppModel.devices[j].values[4]
                                                                             },
                                                                             {
                                                                             "key":"settings.water.temperature-cold",
                                                                             "value":AppModel.devices[j].values[12]
                                                                             },
                                                                             {
                                                                             "key":"settings.energy.heating",
                                                                             "value":AppModel.heating[AppModel.devices[j].values[5]]
                                                                             },
                                                                             {
                                                                             "key":"settings.energy.efficiency",
                                                                             "value":AppModel.devices[j].values[6]
                                                                             },
                                                                             {
                                                                             "key":"settings.energy.cost",
                                                                             "value":AppModel.devices[j].values[7]
                                                                             },
                                                                             {
                                                                             "key":"settings.energy.solar",
                                                                             "value":AppModel.devices[j].values[8]
                                                                             },
                                                                             {
                                                                             "key":"settings.shower.estimate-per-week",
                                                                             "value":AppModel.devices[j].values[9]
                                                                             },
                                                                             {
                                                                             "key":"settings.shower.time-between-shower",
                                                                             "value":AppModel.devices[j].values[11]
                                                                             }
                                                                             ]
                                                               });
                                         }
                                         
                                         app.SendDataToServer(DataObj);
                                         //alert(JSON.stringify(DataObj));
                                         });
                           });
               
               
               });//each
    },
    //UPLOADING FUNCTIONS
    
    //LOGIN TO SERVER
    FirstLoginToServer : function(){
        
       var LoginCredentials = {
           "username":AppModel.user.email,
           "password":AppModel.user.password
       };

        $.ajax({
               type : "POST",
               url : 'http://app-c1-n01.dev.daiad.eu:8080/api/v1/auth/login',
               dataType : 'json',
               data : JSON.stringify(LoginCredentials),
               contentType : "application/json"
               }).done(function(data) {
                       //$('#nikolas').append('server respond: ' + JSON.stringify(data));
                       //alert(JSON.stringify(data));
                       }).fail(function() {
                               alert('fail');
                               }).always(function() {
                                         alert('always');
                                         });

        
    
    },
    
    //DATA
    FetchMetricData : function(DeviceIdentifier){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs,max(volume) as volume,max(energy) as energy, max(flow) as flow , max(temp) as temp from feel where id = ?  group by indexs order by indexs desc ',[DeviceIdentifier], function(tx, results) {
                                         var len = results.rows.length;
                                         var fl = 0;
                                         var tm = 0;
                                         if(len > 0){
                                         for (var i=0; i<len; i++){
                                         
                                         AppModel.trendData[0].data.push([results.rows.item(i).indexs,results.rows.item(i).volume]);
                                         AppModel.trendData[0].sum = AppModel.trendData[0].sum + results.rows.item(i).volume;
                                         AppModel.trendData[1].data.push([results.rows.item(i).indexs,results.rows.item(i).energy]);
                                         AppModel.trendData[1].sum = AppModel.trendData[1].sum + results.rows.item(i).energy;
                                         AppModel.trendData[2].data.push([results.rows.item(i).indexs,results.rows.item(i).flow]);
                                         AppModel.trendData[3].data.push([results.rows.item(i).indexs,results.rows.item(i).temp]);
                                         
                                         fl= fl + results.rows.item(i).flow;
                                         tm = tm + results.rows.item(i).temp;
                                         }
                                         
                                         AppModel.trendData[0].average = AppModel.trendData[0].sum/len; // volume
                                         AppModel.trendData[1].average = AppModel.trendData[1].sum/len; //energy
                                         AppModel.trendData[2].average = fl/len; //flow
                                         AppModel.trendData[3].average = tm/len; //tem
                                         }
                                         });
                           
                           });
        
    },
    FetchImperialData : function(DeviceIdentifier){
        
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs,max(volume) as volume,max(energy) as energy, max(flow) as flow , max(temp) as temp from feel where id = ?  group by indexs order by indexs desc ',[DeviceIdentifier], function(tx, results) {
                                         var len = results.rows.length;
                                         var fl = 0;
                                         var tm = 0;
                                         if(len > 0){
                                         for (var i=0; i<len; i++){
                                         AppModel.trendData[0].data.push([results.rows.item(i).indexs,app.litres2gal(results.rows.item(i).volume)]);
                                         AppModel.trendData[0].sum = AppModel.trendData[0].sum + app.litres2gal(results.rows.item(i).volume);
                                         AppModel.trendData[1].data.push([results.rows.item(i).indexs,results.rows.item(i).energy]);
                                         AppModel.trendData[1].sum = AppModel.trendData[1].sum + results.rows.item(i).energy;
                                         AppModel.trendData[2].data.push([results.rows.item(i).indexs,app.litres2gal(results.rows.item(i).flow)]);
                                         AppModel.trendData[3].data.push([results.rows.item(i).indexs,app.cel2far(results.rows.item(i).temp)]);
                                         
                                         fl= fl + app.litres2gal(results.rows.item(i).flow);
                                         tm = tm + app.cel2far(results.rows.item(i).temp);
                                         }
                                         
                                         AppModel.trendData[0].average = AppModel.trendData[0].sum/len; // volume
                                         AppModel.trendData[1].average = AppModel.trendData[1].sum/len; //energy
                                         AppModel.trendData[2].average = fl/len; //flow
                                         AppModel.trendData[3].average = tm/len; //tem
                                         }
                                         
                                         });
                           
                           });
    },
    //DATA
    
    //TREND
    SetTrendDataToZero : function(){
        AppModel.trendData[0].data.length = 0;
        AppModel.trendData[0].lb = 'Liters';
        AppModel.trendData[1].data.length = 0;
        AppModel.trendData[1].lb = 'Wh';
        AppModel.trendData[2].data.length = 0;
        AppModel.trendData[2].lb = 'L/Min';
        AppModel.trendData[3].data.length = 0;
        AppModel.trendData[3].lb = 'C';

        AppModel.trendData[0].sum = 0;
        AppModel.trendData[1].sum = 0;
    },
    SetDataAndGraphLabels : function(FavDevice){
       
        ChooseUnitAndSet = function(){
            
            if (AppModel.devices[FavDevice].values[1] == 'Imperial'){
                AppModel.trendData[0].lb = 'Gal';
                AppModel.trendData[1].lb = 'Wh';
                AppModel.trendData[2].lb = 'Gal/Min';
                AppModel.trendData[3].lb = 'F';
                
                app.FetchImperialData(AppModel.devices[FavDevice].id);
                
            }else{
                AppModel.trendData[0].lb = 'Liters';
                AppModel.trendData[1].lb = 'Wh';
                AppModel.trendData[2].lb = 'L/Min';
                AppModel.trendData[3].lb = 'C';
                
                app.FetchMetricData(AppModel.devices[FavDevice].id);
            }

        }
        
        ChooseUnitAndSet();
        setTimeout(function(){
                   app.FetchYearsShowers();
                   app.FetchCompareData();
                   
                   },100);
        /*setTimeout(function(){
                   app.PlaceArrow(0);
                   app.SavingsPerYear();
                   },200);*/
       
    },
    TrendHide : function(){
        //clearInterval(realint);
        $('#ShowerStatus').html('Last Shower');
    },
    TrendInitialization : function(){
        $('#chosenID').empty();
        $.each(AppModel.devices, function(i) {
               if(i == AppModel.selectedDeviceForTrend){
                $('#chosenID').append('<option value='+AppModel.devices[i].id+' selected>'+AppModel.devices[i].values[0]+'</option>');
               }else{
                $('#chosenID').append('<option value='+AppModel.devices[i].id+' >'+AppModel.devices[i].values[0]+'</option>');
               }
               });
    },
    GraphInitialization : function(){
        
        plot = $.plot("#placeholder", [AppModel.trendData[AppModel.trendSelected],AppModel.trendl], AppModel.options);
        app.trendView(AppModel.trendData[AppModel.trendSelected]);
        
    },
    trendView : function (a) {
        
        if(a.data.length > 0){
            
            $('#ShowerMode').html((a.data[0][1]).toFixed(2) + a.lb);
            $('#average').html((a.average).toFixed(2) + a.lb);
                             
            if(AppModel.trendSelected == 2 || AppModel.trendSelected == 3){
                $('#total').html('-');
            }else{
                $('#total').html((a.sum).toFixed(2) + a.lb);
            }
            $('#number').html(a.data.length);
        
        
            var b = lineFit(a.data);
            plot.getOptions().yaxes[0].axisLabel = a.lb;
            if(AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID > 10){
                plot.getOptions().xaxes[0].min=AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID - 10;
                plot.getOptions().xaxes[0].max=AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
            }else{
                plot.getOptions().xaxes[0].min=1;
                plot.getOptions().xaxes[0].max=10;
            }
            plot.setData([a,b]);
            plot.setupGrid();
            plot.draw();
        }
        
    },
    UpdateTrendScreen : function(){
        //clearInterval(realint);
        app.trendView(AppModel.trendData[AppModel.trendSelected]);
    
    },
    UpdateNumberOfShowers : function(){
        $('#ShowerStatus').html('Ongoing Shower');
        app.trendView(AppModel.trendData[AppModel.trendSelected]);
    },
    GraphSelection : function(){
        //clearInterval(realint);
        
        $('#trendList p').removeClass('active');
        $(this).addClass('active');
        
        AppModel.trendSelected = $(this).index();
        app.trendView(AppModel.trendData[AppModel.trendSelected]);
        
    },
    GraphSwipeLeft :function(){
        if ( AppModel.options.xaxes[0].mode == null ){
            var min1 = plot.getOptions().xaxes[0].min;
            var max1 = plot.getOptions().xaxes[0].max;
            var newmin1 = min1 + 1;
            var newmax1 = max1 + 1;
            if (newmax1 <= AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID ){
                plot.getOptions().xaxes[0].min = newmin1;
                plot.getOptions().xaxes[0].max = newmax1;
                plot.setupGrid();
                plot.draw();
            }
        }else{
            var min1 = plot.getOptions().xaxes[0].min;
            var max1 = plot.getOptions().xaxes[0].max;
            var month1 = new Date(min1).getMonth();
            var month2 = new Date(max1).getMonth();
            var year1 = new Date(min1).getFullYear();
            var year1 = new Date(max1).getFullYear();
            var mn = new Date(min1).getDate() +1;
            var mx = new Date(max1).getDate() +1;
            if (max1 <= AppModel.devices[0].lastTimeOfConnection  ){
                plot.getOptions().xaxes[0].min = new Date(year1, month1, mn).getTime();
                plot.getOptions().xaxes[0].max = new Date(year1, month2, mx).getTime();
                plot.setupGrid();
                plot.draw();
            }
        }
    },
    GraphSwipeRight : function (){
        if ( AppModel.options.xaxes[0].mode == null ){
            var min = plot.getOptions().xaxes[0].min;
            var max = plot.getOptions().xaxes[0].max;
            var newmin = min - 1;
            var newmax = max - 1;
            if (newmin >=0){
                plot.getOptions().xaxes[0].min = newmin;
                plot.getOptions().xaxes[0].max = newmax;
                plot.setupGrid();
                plot.draw();
            }
        }else{
            var min1 = plot.getOptions().xaxes[0].min;
            var max1 = plot.getOptions().xaxes[0].max;
            var month1 = new Date(min1).getMonth();
            var month2 = new Date(max1).getMonth();
            var year1 = new Date(min1).getFullYear();
            var year1 = new Date(max1).getFullYear();
            var mn = new Date(min1).getDate() - 1;
            var mx = new Date(max1).getDate() - 1;
            if (min1 >= AppModel.devices[0].firstTimeOfConnection ){
                plot.getOptions().xaxes[0].min = new Date(year1, month1, mn).getTime();
                plot.getOptions().xaxes[0].max = new Date(year1, month2, mx).getTime();
                plot.setupGrid();
                plot.draw();
            }
        }
    },
    //TREND
    
    //COMPARE
    InitializeCompare : function(){
        
            app.SavingsPerYear();
            app.PlaceArrow(0);

    },
    CompareVolume : function(){
        
        $('.comp').removeClass('active');
        $(this).addClass('active');
        
        $('#efff1').attr("src","img/water_consumption.jpg");
        $('#veselected').show();
        $('#flowselected').hide();
        
        app.PlaceArrow($(this).index());
        
    },
    CompareEnergy : function(){
        
        $('.comp').removeClass('active');
        $(this).addClass('active');
        
        $('#efff1').attr("src","img/energy_efficiency.jpg");
        $('#veselected').show();
        $('#flowselected').hide();
        
        app.PlaceArrow($(this).index());
    },
    CompareFlow : function(){
        
        $('.comp').removeClass('active');
        $(this).addClass('active');
        
        $('#efff1').attr("src","img/flowrate.jpg");
        $('#veselected').hide();
        $('#flowselected').show();
        
        app.PlaceArrow($(this).index());
    },
    PlaceArrow : function(pos){
        
        switch (pos) {
                
            case 0:
                
                if (AppModel.compareData.averageVolume == 0){
                    $('#efff').attr('src','img/consumption_graphic_d.jpg');
                }else if(AppModel.compareData.averageVolume > 0 && AppModel.compareData.averageVolume <= 16.7){
                    $('#efff').attr('src','img/consumption_graphic_a.jpg');
                }else if(AppModel.compareData.averageVolume > 16.7 && AppModel.compareData.averageVolume <= 29.3){
                    $('#efff').attr('src','img/consumption_graphic_b.jpg');
                }else if(AppModel.compareData.averageVolume > 29.3 && AppModel.compareData.averageVolume <= 41.8){
                   $('#efff').attr('src','img/consumption_graphic_c.jpg');
                }else if(AppModel.compareData.averageVolume > 41.8 && AppModel.compareData.averageVolume <= 54.4){
                    $('#efff').attr('src','img/consumption_graphic_d.jpg');
                }else if(AppModel.compareData.averageVolume > 54.4 && AppModel.compareData.averageVolume <= 67){
                    $('#efff').attr('src','img/consumption_graphic_e.jpg');
                }else if(AppModel.compareData.averageVolume > 67 && AppModel.compareData.averageVolume <= 79.5){
                    $('#efff').attr('src','img/consumption_graphic_f.jpg');
                }else {
                    $('#efff').attr('src','img/consumption_graphic_g.jpg');
                }
                
                break;
                
            case 1:
                if ( AppModel.compareData.averageEnergy == 0 ){
                   $('#efff').attr('src','img/consumption_graphic_d.jpg');
                }else if(AppModel.compareData.averageEnergy > 0 && AppModel.compareData.averageEnergy <= 700){
                    $('#efff').attr('src','img/consumption_graphic_a.jpg');
                }else if(AppModel.compareData.averageEnergy > 700 && AppModel.compareData.averageEnergy <= 1225){
                    $('#efff').attr('src','img/consumption_graphic_b.jpg');
                }else if(AppModel.compareData.averageEnergy > 1225 && AppModel.compareData.averageEnergy <= 1750){
                    $('#efff').attr('src','img/consumption_graphic_c.jpg');
                }else if(AppModel.compareData.averageEnergy > 1750 && AppModel.compareData.averageEnergy <= 2275){
                    $('#efff').attr('src','img/consumption_graphic_d.jpg');
                }else if(AppModel.compareData.averageEnergy > 2275 && AppModel.compareData.averageEnergy <= 2800){
                    $('#efff').attr('src','img/consumption_graphic_e.jpg');
                }else if(AppModel.compareData.averageEnergy > 2800 && AppModel.compareData.averageEnergy <= 3325){
                    $('#efff').attr('src','img/consumption_graphic_f.jpg');
                }else {
                    $('#efff').attr('src','img/consumption_graphic_g.jpg');
                }
                
                break;
                
            case 2:
                
                if (AppModel.compareData.averageFlow == 0){
                    $('#efff').attr('src','img/consumption_graphic_d.jpg');
                }else if(AppModel.compareData.averageFlow > 0 && AppModel.compareData.averageFlow <= 6){
                    $('#efff').attr('src','img/consumption_graphic_a.jpg');
                }else if(AppModel.compareData.averageFlow > 6 && AppModel.compareData.averageFlow <= 8){
                    $('#efff').attr('src','img/consumption_graphic_b.jpg');
                }else if(AppModel.compareData.averageFlow > 8 && AppModel.compareData.averageFlow <= 10){
                    $('#efff').attr('src','img/consumption_graphic_c.jpg');
                }else if(AppModel.compareData.averageFlow > 10 && AppModel.compareData.averageFlow <= 13){
                    $('#efff').attr('src','img/consumption_graphic_d.jpg');
                }else {
                    $('#efff').attr('src','img/consumption_graphic_e.jpg');
                }
                
                break;
        };
    },
    FetchYearsShowers : function(){
        var d = new Date();
        var year  = d.getFullYear();
        var firstOfYear = new Date(year, 0, 1);
        var lastOfYear = new Date(year, 11, 31);
        var st = firstOfYear.getTime();
        var lt =lastOfYear.getTime();
        
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs as total from feel where cdate > '+st+' and cdate < '+lt+' group by indexs order by indexs desc limit 1 ',[], function(tx, results) {
                                         var len = results.rows.length;
                                         
                                         for (var i=0; i<len; i++){
                                            AppModel.compareData.ShowersPerYear = results.rows.item(i).total;
                                         }
                                         
                                         
                                         }); //execute end
                           }); //transaction end

    },
    FetchCompareData : function(){
        
        var d = new Date();
        var year  = d.getFullYear();
        var firstOfYear = new Date(year, 0, 1);
        var lastOfYear = new Date(year, 11, 31);
        var st = firstOfYear.getTime();
        var lt =lastOfYear.getTime();
        
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs,max(volume) as volume,max(energy) as energy, max(flow) as flow from (SELECT * from feel where cdate > '+st+' and cdate < '+lt+'  ) where category == 18 group by indexs order by indexs desc limit 20   ',[], function(tx, results) {
                                         var len = results.rows.length;
                                         var v = 0;
                                         var e = 0;
                                         var f =0;
                                         for (var i=0; i<len; i++){
                                            v = v + results.rows.item(i).volume;
                                            e = e + results.rows.item(i).energy;
                                            f = f + results.rows.item(i).flow;
                                        }
                                         if(len > 0){
                                         AppModel.compareData.averageVolume = (v / len).toFixed(2);
                                         AppModel.compareData.averageEnergy = (e /len).toFixed(2);
                                         AppModel.compareData.averageFlow = (f /len).toFixed(2);
                                         //AppModel.compareData.ShowersPerYear
                                         }
                                         
                                         }); //execute end
                               }); //transaction end
    },
    SavingsPerYear : function(){
       
           var savings_volume_per_year = (AppModel.compareData.averageVolume - 10) *  0.3  * AppModel.compareData.ShowersPerYear;
           var savings_energy_per_year = (AppModel.compareData.averageEnergy - 300) * 0.3  * AppModel.compareData.ShowersPerYear;
           var savings_money_per_year = savings_volume_per_year * AppModel.devices[AppModel.selectedDeviceForTrend].values[4] +
        savings_energy_per_year * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
        
            var savings_showerhead_volume_per_year = AppModel.compareData.averageVolume  * ( 1 - 6 / AppModel.compareData.averageFlow ) * AppModel.compareData.ShowersPerYear;
            var savings_showerhead_energy_per_year = AppModel.compareData.averageEnergy  * ( 1 - 6 / AppModel.compareData.averageFlow ) * AppModel.compareData.ShowersPerYear;
            var savings_showerhead_money_per_year =  savings_showerhead_volume_per_year * AppModel.devices[AppModel.selectedDeviceForTrend].values[4]; +  savings_showerhead_energy_per_year * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
        
            if(AppModel.compareData.averageEnergy > 1225 && AppModel.compareData.averageEnergy <= 1750){
                savings_volume_per_year_est = 2 *  0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_energy_per_year_est = 100 * 0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_money_per_year_est = savings_volume_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[4]; +  savings_energy_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
            }else if(AppModel.compareData.averageEnergy > 1750 && AppModel.compareData.averageEnergy <= 2275){
                savings_volume_per_year_est = 2 *  0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_energy_per_year_est = 600 * 0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_money_per_year_est = savings_volume_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[4]; +  savings_energy_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
            }else if(AppModel.compareData.averageEnergy > 2275 && AppModel.compareData.averageEnergy <= 2800){
                savings_volume_per_year_est = 1 *  0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_energy_per_year_est = 1200 * 0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_money_per_year_est = savings_volume_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[4]; +  savings_energy_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
            }else if(AppModel.compareData.averageEnergy > 2800 && AppModel.compareData.averageEnergy <= 3150){
                savings_volume_per_year_est = 1 *  0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_energy_per_year_est = 1800 * 0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_money_per_year_est = savings_volume_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[4]; +  savings_energy_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
            }else if(AppModel.compareData.averageEnergy > 3150){
                savings_volume_per_year_est = 1 *  0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_energy_per_year_est = 2200 * 0.3  * AppModel.devices[AppModel.selectedDeviceForTrend].lastShowerID;
                savings_money_per_year_est = savings_volume_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[4]; +  savings_energy_per_year_est * AppModel.devices[AppModel.selectedDeviceForTrend].values[7];
            }else{
                savings_money_per_year_est = 0;
            }
        
        if (AppModel.devices[AppModel.selectedDeviceForTrend].values[1] == 'Imperial'){
            AppModel.compareData.label = 'Gal';
            savings_volume_per_year  = app.litres2gal(savings_volume_per_year);
            savings_showerhead_money_per_year  = app.litres2gal(savings_showerhead_money_per_year);
        }else{
            AppModel.compareData.label = 'Liters';
        }

        $('#chosenIDcom').html(AppModel.devices[AppModel.selectedDeviceForTrend].values[0]);
        $('#Vsave').html(Math.abs(savings_volume_per_year.toFixed(2)) + AppModel.compareData.label);
        $('#Esave').html(Math.abs(app.watt2kwatt(savings_energy_per_year.toFixed(2))) + 'kWh');
        $('#Msave').html(Math.abs(savings_money_per_year.toFixed(2)) + AppModel.devices[AppModel.selectedDeviceForTrend].values[2]);
        $('#Oversave').html(Math.abs(savings_money_per_year_est.toFixed(2)) + AppModel.devices[AppModel.selectedDeviceForTrend].values[2]);
        $('#OVsave').html(Math.abs(savings_showerhead_volume_per_year.toFixed(2)) + AppModel.compareData.label);
        $('#OEsave').html(Math.abs(app.watt2kwatt(savings_showerhead_energy_per_year.toFixed(2))) + 'kWh');
        $('#OMsave').html(Math.abs(savings_showerhead_money_per_year.toFixed(2)) + AppModel.devices[AppModel.selectedDeviceForTrend].values[2]);
        
        /*AppModel.compareData.sv = savings_volume_per_year.toFixed(2);
        AppModel.compareData.se = savings_energy_per_year.toFixed(2);
        AppModel.compareData.sm = savings_money_per_year.toFixed(2);
        AppModel.compareData.shv = savings_showerhead_volume_per_year.toFixed(2);
        AppModel.compareData.she = savings_showerhead_energy_per_year.toFixed(2);
        AppModel.compareData.shm = savings_showerhead_money_per_year.toFixed(2);
        AppModel.compareData.wsv = savings_money_per_year_est.toFixed(2);
       */
    },
    //COMPARE
    
    RenderHomeView:function(){
        
        app.setInitialView();
    },
    renderCustomView : function(phase){
        switch(phase){
            case 0:
                $('.tabbar .active').removeClass('active').css('color', '#383838');
                $('#registerbar').hide();
                $('#customconnect').show();
                //$('#noaccountbar').show();
                $('.apptexts').html('Welcome!</br>You have successfully logged-in.</br> Now you can <u><a href ="#CustomizeAmphiroInstall">connect</a></u> your b1.</br>Note: You must have an amphiro b1 installed in your shower and turn on the water to establish a connection.');
                app.flip('down', '#welcomePage');
                break;
            case 1:
                
                if(AppModel.devices.length > 0){
                    
                    
                    $('#loginbar').hide();
                    $('#homebar').show();
                    $('.apptexts').html('Welcome back to Amphiro App</br></br>');
                    $('.tabbar .active').removeClass('active').css('color', '#383838');
                    //$('#homepage').addClass('active');
                    app.flip('down', '#welcomePage');
                }else{
                    $('#loginbar').hide();
                    $('#customconnect').show();
                    $('.apptexts').html('Welcome!</br>You have successfully logged-in.</br> Now you can <u><a href ="#CustomizeAmphiroInstall">connect</a></u> your b1.</br>Note: You must have an amphiro b1 installed in your shower and turn on the water to establish a connection.');
                    app.flip('down', '#welcomePage');
                }
                
                break;
            case 2:
                $('#connectbar').hide();
                $('#customconnectionbar').hide();
                $('.apptexts').html('Congratulations,your b1 was connected to the application.</br>You can now track your energy and water consumption.');
                $('#homebar').fadeIn('fast');
                app.flip('down', '#welcomePage');
                break;
            case 3:
                $('#accountbar').hide();
                $('#homebar').show();
                $('.apptexts').html('Your account info has been updated!</br></br>Enjoy using the amphiro b1 app.</br>');
                $('.tabbar .active').removeClass('active').css('color', '#383838');
                $('#homepage').addClass('active');
                app.flip('down', '#welcomePage');
                break;
            case 4:
                break;
            case 5:
                $('.tabbar .active').removeClass('active').css('color', '#383838');
                $('#updatebar').hide();
                $('#homebar').show();
                $('#homepage').addClass('active');
                $('.apptexts').html('Your settings has been updated!</br></br>Your changes will be applied as soon as the amphiro b1 is available.</br></br>Enjoy using the amphiro b1 app.</br>');
                app.flip('down', '#welcomePage');
                break;
            case 6:
                $('.apptexts').html('The pairing of your new amphiro b1 was succesful.</br></br>You can now start to keep track of your water and energy consumption.</br>');
                break;
            case 7:
                 $('.tabbar .active').removeClass('active').css('color', '#383838');
                $('#accountbar').hide();
                $('#noaccountbar').show();
                $('.apptexts').html('Welcome to the amphiro b1 app.</br></br>Please login or set up a new account before starting to save water and energy.');
                app.flip('down', '#welcomePage');
                break;
            case 8:
                $('.tabbar .active').removeClass('active').css('color', '#383838');
                $('#connectbar').hide();
                $('#homebar').show();
                $('#homepage').addClass('active');
                $('.apptexts').html('Your device has been disconnected!</br></br>Enjoy using the amphiro b1 app.</br>');
                app.flip('down', '#welcomePage');
                break;
                
            case 9:
                $('.tabbar .active').removeClass('active').css('color', '#383838');
                $('#connectbar').hide();
                $('#homebar').show();
                $('#homepage').addClass('active');
                $('.apptexts').html('Your device has been re-connected!</br></br>Enjoy using the amphiro b1 app.</br>');
                app.flip('down', '#welcomePage');
                break;

        };
        
    },
    setInitialModel : function(a,b){
        
        UserInit = JSON.parse(a);
        DevInit = JSON.parse(b);
        
        if (UserInit !== null){
            AppModel.user = UserInit;
        }
        if (DevInit !== null){
            $.each(DevInit,function(i){
                   AppModel.devices.push(DevInit[i]);
                   });
            //AppModel.devices.push(DevInit[0]);
        }
    },
    setInitialView : function(){
      
        if (AppModel.user == null && AppModel.devices.length == 0) {
            $('.apptexts').html('Welcome to the amphiro b1 app.</br></br>Please login or set up a new account before starting to save water and energy.');
            $('#noaccountbar').show();
        } else if (AppModel.user != null && AppModel.devices.length == 0){
            $('.apptexts').html('Welcome to the amphiro b1 app.</br></br>Please login or set up a new account before starting to save water and energy.');
            $('#noaccountbar').show();
            /*$('#customconnect').show();
            $('.apptexts').html('Please connect your amphiro b1 to the app.</br></br>If you have troubles installing amphiro b1 in your shower, please see the manual for intallation instructions</br></br>');*/
        }/*else if (AppModel.user.logoutSignal == 1){
            $('.apptexts').html('Welcome to the amphiro b1 app.</br></br>Please login or set up a new account before starting to save water and energy.');
            $('#noaccountbar').show();
        }*/else{
            $('.apptexts').html('Welcome back to amphiro b1 application.</br></br>');
            $('#homebar').show();
        }
    },
    
    getUserFromLocalStorage : function(){
        //window.localStorage.setItem('user',null);
        return window.localStorage.getItem('user');
    },
    getAmphiroFromLocalStorage : function(){
        //window.localStorage.setItem('amphiro',null);
        return window.localStorage.getItem('amphiro');
    },
    setUserToLocalStorage :function(info){
        window.localStorage.setItem('user',info);
    },
    setAmphiroToLocalStorage :function(dev){
        window.localStorage.setItem('amphiro',dev);
    },

    onLogout : function(){
        
        app.setUserToLocalStorage(null);
        app.setAmphiroToLocalStorage(null);
        app.SetTrendDataToZero();
        AppModel.devices.length = 0;
        AppModel.selectedDeviceForTrend = 0;
        AppModel.user = null;
        app.renderCustomView(7);
        
    },
    
    onSuccessDb : function(tx,r) {
        //alert("Data stored!");
    },
    onErrorDb : function(tx, e) {
        alert("SQLite Error: " + e.message);
    },
    
    toUpper : function(str){
        return str.toUpperCase();
    },
    serializeFormJSON : function (form) {
        var o = {};
        var a = form.serializeArray();
        $.each(a, function () {
               if (o[this.name]) {
               if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
               }
               o[this.name].push(this.value || '');
               } else {
               o[this.name] = this.value || '';
               }
               });
        return o;
    },
    hex : function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join("");
    },
    timeConverter : function(tt){
        var a = new Date(tt);
        var year = a.getFullYear();
        var month = a.getMonth()+1;
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        if(min < 10){ min = '0' + min;  }
        var sec = a.getSeconds();
        var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min  ;
        return time;
    },
    date2human : function(){
        var a = new Date();
        var year = a.getFullYear();
        var month = a.getMonth()+1;
        var date = a.getDate();
        var time =  year + '-' + month + '-' + date  ;

        return time;

    },
    secondsToTime : function(secs){
        
        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);
        
        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
        
        var obj = {
            
            "m": minutes,
            "s": seconds
        };
        return obj.m+":"+obj.s ;
    },
    
    checkAscii : function(str){
        
        return /^[\x00-\x7F]*$/.test(str);
        
    },
    litres2gal : function(val){
        
        return val * 0.2638;
    },
    gal2litres : function(val){
        
        return val/0.2638;
        
    },
    far2cel : function(val){
        
        return (5*val-162)/9;
        
    },
    cel2far : function(val){
        
        return (val * 9 + 162)/5;
        
    },
    watt2kwatt : function(val){
        
        return (val / 1000).toFixed(2);
        
    },
    
    slide : function(direction, href) {
        window.plugins.nativepagetransitions.slide(
                                                   {
                                                   'duration': 300,
                                                   'direction': direction,
                                                   'slowdownfactor' : 6,
                                                   'iosdelay': 250,
                                                   'href': href
                                                   });
    },
    flip : function(direction, href) {
        window.plugins.nativepagetransitions.flip(
                                                  {
                                                  'duration': 450,
                                                  'direction': direction,
                                                  'iosdelay': 150,
                                                  'androiddelay': 200,
                                                  'winphonedelay': 800,
                                                  'href': href
                                                  });
    },
    
    sliderValue : function() {
        var hey = $('input[type=range]', this).val();
        $('input[type=range]', this).closest('.list-block').find('.content-block-title span').html(hey);
    },
    timerSlider : function() {
        var hey = $('input[type=range]', this).val();
        $('input[type=range]', this).closest('.list-block').find('.content-block-title span').html(app.secondsToTime(hey));
    }

};

$(function() {
  
  $(document).one('available', function(){
                  AppModel.availability = 1;
                  setTimeout(function(){
                             $.each(AppModel.devices,function(i){
                                    app.BluetoothSupervisor(AppModel.devices[i].id);
                                    });
                             },2000);
                  });
  
  $(document).on('unitChanged',function(){
            
                 app.stop();
                 app.SetTrendDataToZero();
                 setTimeout(function(){
                                    app.SetDataAndGraphLabels(AppModel.selectedDeviceForTrend);
                                    },10);
                 });
  
  $(document).on('upload',function(){
                 app.FetchDataForUpload();
                 });
  
  $(document).on('showers',function(){
                 app.UpdateNumberOfShowers();
                 });
  
  $(document).on('ping', app.RequestCodeFromPeripheral);
  
  $(document).one('bledisable', function(){
                  var blest = new NotificationManager();
                  blest.BleDisabled();
                  });

  $(document).on('click','#openPrompti',function(){
                  app.ShowMePrompt();
                  });

  $('#chosenID').on('change',function () {
                    
                    var optionSelected = $(this).find("option:selected");
                    var valueSelected  = optionSelected.val();
                    AppModel.selectedDeviceForTrend  = findDeviceIndex(AppModel.devices, 'id', valueSelected);
                    setTimeout(function(){
                               app.SetTrendDataToZero();
                               app.SetDataAndGraphLabels(AppModel.selectedDeviceForTrend);
                               },30);
                    
                    setTimeout(function(){
                               app.UpdateTrendScreen();
                               },70);
                    
                    });
  
  $('.already').on('click','li',function(){
                    AppModel.selectedToUnpair =  $(this).attr('data-name');
                    app.UnpairDevice();
                     });
  
  $('#welcomePage').on('pagebeforeshow',function(){
                       $('#homepage').addClass('active').css('color', '#FF6970');
                       });
  
  $('#trend').on('pageshow',app.GraphInitialization);
  $('#trend').on('pagebeforeshow',app.TrendInitialization);
  $('#trend').on('pagebeforehide',app.TrendHide);
  $('#trendList p').on('tap',app.GraphSelection);
  $('#placeholder').on('swipeleft',app.GraphSwipeLeft);
  $('#placeholder').on('swiperight',app.GraphSwipeRight);
  
  $('#compare').on('pagebeforeshow',app.InitializeCompare);
  $('#ComVolume').on('tap',app.CompareVolume);
  $('#ComEnergy').on('tap',app.CompareEnergy);
  $('#ComFlow').on('tap',app.CompareFlow);
  
  $('#Account').on('pagebeforeshow',app.PopulateUserInfo);
  $('#SetAccount').on('pagebeforeshow',app.EnterRegister);
  $('#login').on('pagebeforeshow',app.EnterLogin);
  
  $('#PairedAmphiro').on('pagebeforeshow',app.PopulatePairedDevices);
  $('#PairedAmphiro').on('pagebeforehide',app.LeavePairedDevices);
  
  $('#AmphiroInstall').on('pagebeforeshow',app.EnterInstallScreen);
  $('#AmphiroInstall').on('pagebeforehide',app.LeaveInstallScreen);
  $('#CustomizeAmphiroInstall').on('pagebeforeshow',app.EnterCustomConnect);
  $('#CustomizeAmphiroInstall').on('pagebeforehide',app.LeaveCustomConnect);
  
  $('#AmphiroUpdate').on('pagebeforeshow',app.PopulateDeviceSettings);
  
  
  $('#paired').on('tap','li',app.DeviceToSee);
  $('.discovered').on('tap','li',app.DeviceToPair);
  $('#connection').on('tap',app.HandleConnectionTab);
  $('#edit').on('tap',app.HandleEditTab);
  $('#overwrite').on('click',app.ApplyNewSettings);
  $('#applydef').on('tap',app.ApplyDefaultSettings);
  $('#unpair').on('tap',app.UnpairDevice);
  $('#reset').on('tap',app.ResetDevice);
  
  $('#repo').on('change',app.ChangeReports);
  $('#uploadData').on('change',app.ChangeUpload);
  $('#privacy').on('change',app.ChangePrivacy);
  $('.range-slider').on('touchstart touchmove touchend',app.sliderValue);
  $('#timer').on('touchstart touchmove touchend',app.timerSlider);
  
  $('#amphiro').on('tap',function(){window.open("http://amphiro.com", "_system");});
  $('#daiad').on('tap',function(){window.open("http://daiad.eu", "_system");});

  
  $('#logout').on('tap',function(){
                  app.onLogout();
                  });
  
  //on tap 'Back' from 'Analytics Account' move to 'settings'
  $('#acc2set').on('tap', function(e){
                   $('#accountbar').hide();
                   $('#homebar').show();
                   //$('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#homeset').addClass('active');
                   app.slide('right', '#settings');
                   e.preventDefault();
                   });
  //on tap 'Back' from 'Update Amphiro' move to 'settings'
  $('#con2set').on('tap', function(e){
                   $('#connectbar').hide();
                   $('#homebar').show();
                   $('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#homeset').addClass('active').css('color', '#FF6970');
                   app.slide('right', '#settings');
                   e.preventDefault();
                   });
  //on tap 'Back' from 'device Settings' move to 'Install' page
  $('#upd2dev').on('tap', function(e){
                   //$(this).removeClass('active');
                   $('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#updatebar').hide();
                   $('#pairedbar').show();
                   app.slide('right', '#PairedAmphiro');
                   e.preventDefault();
                   });
  //on tap 'Back' from 'device Settings' move to 'Install' page
  $('#paired2set').on('tap', function(e){
                   //$(this).removeClass('active');
                   $('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#pairedbar').hide();
                   $('#homebar').show();
                    $('#homeset').addClass('active').css('color', '#FF6970');
                   app.slide('right', '#settings');
                   e.preventDefault();
                   });

  //on tap 'Submit' in Account Settings move to Welcome page
  $('#acc2sub').on('tap', function(e){
                   // $(this).addClass('active');
                   AppModel.devices[0].repfrequency = $('#frequency').val();
                   EventBus.publish('model');
                   app.renderCustomView(3);
                   e.preventDefault();
                   });
  $('#reg2wel').on('tap', function(e){
                   //$(this).removeClass('active');
                   $('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#registerbar').hide();
                   $('#noaccountbar').show();
                   app.slide('right', '#welcomePage');
                   e.preventDefault();
                   });
  $('#log2wel').on('tap', function(e){
                   //$(this).removeClass('active');
                   $('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#loginbar').hide();
                   $('#noaccountbar').show();
                   app.slide('right', '#welcomePage');
                   e.preventDefault();
                   });
  $('#cc2m').on('tap', function(e){
                   //$(this).removeClass('active');
                   $('.tabbar .active').removeClass('active').css('color', '#383838');
                   $('#customconnectionbar').hide();
                   $('#customconnect').show();
                   app.slide('right', '#welcomePage');
                   e.preventDefault();
                   });
  
  $('#submitlog').on('click',function(e){
                     $(this).removeClass('active');
                     var email = $('#logmail').val();
                     var pass = $('#logpass').val();
                     
                     app.CheckUserExistance(email,pass);
                     
                    });
  
  $('#submitregister').on('click',function(){
                    $('#form1').triggerHandler( "submit" ).triggerHandler( "focus" );
                    });

  $('#form1').validate({rules: {
                       fname: {required: true,minlength: 2},
                       lname: {required: true,minlength: 4},
                       email: {required: true,minlength: 6},
                       password: {required: true,minlength: 4},
                       repassword: {
                        required: true,
                        minlength: 4,
                        equalTo: "#password"
                       },
                       zip: {required: true}
                       },messages: {
                       //fname: {required: "Enter your first name.",minlength: "Name too short(min 4)"},
                       //lname: {required: "Enter your last name.",minlength: "lastname too short(min 4)"},
                       //email: {required: "Enter your email.",minlength: "email too short(min 6)"},
                       //password: {required: "Enter Password ",minlength: "Password too short(min 4)"},
                       //repassword :{required: "Enter Password Again ",equalTo:"Please enter the same password"},
                       //zip: {required: "Enter Zip Code "}
                       },
                       errorPlacement: function (error, element) {
                       error.appendTo(element.parent());
                       error.css('font-size',10);
                       },
                       submitHandler: function (form) {
                       var sel = $('#form1');
                       var data = app.serializeFormJSON(sel);
                       
                       AppModel.user = data;
                       app.SendUserToServer(data);
                       
                       
                       /*
                       app.setUserToLocalStorage(JSON.stringify(data));
                       //alert(JSON.stringify(data));
                       app.renderCustomView(0);
                        */
                       
                       return false;
                       }
                       });

  $('.tabbar a').click(function(){
                       $('.tabbar .active').removeClass('active').css('color', '#383838');
                       $(this).addClass('active').css('color', '#FF6970').fadeOut(100).fadeIn(100);
                       
                       });
  
  $('#toDevices').on('click',function(){app.slide('right', '#AmphiroInstall');});
  $('#toAccount').on('click',function(){app.slide('left', '#Account');});
  $('#toSettings').on('tap',function(){app.slide('right', '#settings');});
  $('#toInstall').on('click',function(){app.slide('left', '#AmphiroInstall');});
  $('#toUpdate').on('click',function(){app.slide('left', '#PairedAmphiro');});
  $('#toSettings2').on('tap',function(){app.slide('right', '#settings');});
  
  $('#kill').on('click',this.killme);
  
  app.initialize();
  
  
});