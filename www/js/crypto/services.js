/** All Cryptography methods for the communication between the peripheral(amphiro b1) and the DAIAD application.
 * @namespace Cryptography
 * @name Crypto Requests
 */
var cryptoService = function(dv) {
    this.dv = dv;
};

cryptoService.prototype = {
    /**
     * decrypt
     * @memberof Crypto Requests
     * @function
     */
    decrypt : function(){
    
        var view =  new Uint8Array(this.dv.data); //data
        
        var key = CryptoJS.enc.Hex.parse(this.dv.key); //get the key
        /*
         encryptionArray1 : temp array
         decrypt [2..18] keep first two values
         */
        var encryptionArray1 = new Uint8Array(17);
        
        for (var i = 2; i<view.length-2; i++) {
            encryptionArray1[i-2] = view[i];
        }
        
        //decrypt first array
        var input = CryptoJS.lib.WordArray.create(encryptionArray1);
        
        var data = CryptoJS.enc.Base64.stringify(input);
        
        var decrypted3 = CryptoJS.AES.decrypt(data,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
        
        var arr = base64ToArrayBuffer(decrypted3.toString(CryptoJS.enc.Base64));
        
        var view1 = new Uint8Array(arr);
        
        //pass the initial received array to a new one : first
        //view now no longer exists
        var firsttempview = new Uint8Array(view.length);
        
        for (var z = 0; z < firsttempview.length; z++) {
            firsttempview[z] = view[z];
        }
        
        //pass the first decrypted values to the INITIAL(first now) array
        for (var a = 0; a < firsttempview.length; a++) {
            firsttempview[a+2] = view1[a];
        }
        
        /*
         create new ArrayBuffer#2 with size 16 - Decryption Round#2
         encryptionArray2 : temp array
         decrypt [1..16] keep last two values
         */
        var encryptionArray2 = new Uint8Array(16);
        
        for (var j = 0; j<16; j++) {
            encryptionArray2[j] = firsttempview[j];
        }
        
        //decrypt round $2
        var input2 = CryptoJS.lib.WordArray.create(encryptionArray2);
        
        var data2 = CryptoJS.enc.Base64.stringify(input2);
        
        var decrypted4 = CryptoJS.AES.decrypt(data2,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
        
        var arr1 = base64ToArrayBuffer(decrypted4.toString(CryptoJS.enc.Base64));
        
        var finalarray = new Uint8Array(arr1);
        
        /*
         first : holds the first decrypted values from
         final : temporary array for decryption
         ready : holds the decrypted packets with length #20 (first + final)
         m_array : holds the decrypted values with length #18(USE FOR PROCESSING)
         res : variable holding the bsd computation for packet checkout!!
         */
        var ready = new Uint8Array(firsttempview.length);
        
        for (var k = 0; k<ready.length; k++) {
            ready[k] = firsttempview[k];
        }
        
        for (var l = 0; l<16; l++) {
            ready[l] = finalarray[l];
        }
        
        var m_array = new Uint8Array(18);
        
        for (var m=0; m<=m_array.length; m++) {
            m_array[m] = ready[m];
        }
        
        var res = payloadCheckSum( m_array );
        
        if(res == m_array[2]) {
            
            var obj = getObjects(app.user.profile.devices, 'aesKey',this.dv.key); //CHANGE
            //Exchange MAC addresses for different platforms
            if(obj.length > 0) {
                
                if(obj[0].macAddress != this.dv.id) {
                    
                    obj[0].macAddress = this.dv.id;
                    
                }
                
            }
            //Packet Decrypted : ready for process
            this.process(m_array);
            
        } else {
            //error
            this.process([404]);
        }
    
    },
    
    /**
     * encrypt
     * @memberof Crypto Requests
     * @function
     */
    encrypt : function(){
    
        //create buffer view : size 18
        var view = new Uint8Array(this.dv.buf);
        
        var last1 = view[17];
        
        var prelast1 = view[16];
        
        //encrypt [1..16] Encryption Round#1
        var buf2 = new ArrayBuffer(16);
       
        var encr2 = new Uint8Array(buf2);
        
        var key = CryptoJS.enc.Hex.parse(this.dv.key);
        
        for (i = 0; i<16; i++) {
            encr2[i] = view[i];
        }
        
        var input22 = CryptoJS.lib.WordArray.create(encr2);
        
        var encrypted4 = CryptoJS.AES.encrypt(input22,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
        
        var arr4 = base64ToArrayBuffer(encrypted4);
        
        var final = new Uint8Array(arr4);
        
        for (i = 0; i<final.length; i++) {
            view[i] = final[i];
        }
        
        view[16] = prelast1;
        
        view[17] = last1;
        
        var bufEncr1= new ArrayBuffer(16);
       
        var encr1 = new Uint8Array(bufEncr1);
        
        //encrypt [2..18] Encryption Round#2
        var first = view[0];
        
        var sec = view[1];
        
        for (i = 2; i<view.length; i++) {
            encr1[i-2] = view[i];
        }
        
        var input = CryptoJS.lib.WordArray.create(encr1);
        
        var encrypted3 = CryptoJS.AES.encrypt(input,key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
        
        var arr = base64ToArrayBuffer(encrypted3);
        
        var view1 = new Uint8Array(arr);
        
        for (i = 0; i<view1.length; i++) {
            view[i+2] = view1[i];
        }
       
        view[0] = first;
        
        view[1] = sec;
    
        //Encryption Completed - send buffer
        this.sendEncrypted(view.buffer);
    },
    
    sendEncrypted : function(data){

        ble.write(
                  this.dv.id,
                  app.amphiro.serviceUUID,
                  app.amphiro.txCharacteristic,
                  data,
                  function(){},
                  function(){}
                  );
        
    },
    process : function(vw){
        
        var category,history,showerID,volume,energy,temperature,duration,currentDate,minutes,flow,co2,member,packet,cold,changedDevKey;
        
        var tempObj = getObjects(app.user.profile.devices, 'aesKey',this.dv.key);

        switch (vw[0]) {
                                
            case 0:
                /* from encrypted AppModel.PingData - new amphiro device */
                var blecd_new = new CryptoManager(
                                                  {
                                                  "id" :  AppModel.selectedToPairWithID ,
                                                  "key" : this.dv.key
                                                  }
                                                  );
                blecd_new.newAmphiroDevice();
                
                break;
                
            case 17:
                changedDevKey = tempObj[0].deviceKey;
                category = 17;
                history = false;
                showerID = 256*vw[3]+vw[4];
                volume =  (256*vw[5]+256*vw[6]+256*vw[7]+vw[8])/10;
                energy = 256*vw[9]+256*vw[10]+256*vw[11]+vw[12];
                temperature = vw[13];
                duration = 256*vw[14]+256*vw[15]+vw[16];
                currentDate = moment().valueOf();
                minutes = duration / 60;
                flow = volume / minutes;
                co2 = 0.0005925 * energy/1000;
                member = 0;
                
                var cryptor = new CryptoManager(
                                                {
                                                "id": changedDevKey,
                                                "history" : history,
                                                "category": category,
                                                "temperature":temperature,
                                                "volume":volume,
                                                "flow": flow,
                                                "energy":energy,
                                                "showerId":showerID,
                                                "duration":duration,
                                                "date":currentDate,
                                                "co2" : co2,
                                                "member": member
                                                }
                                                );
                cryptor.decryptedRealPacket();
                break;
                
            case 18:
                changedDevKey = tempObj[0].deviceKey;
                category = 18;
                history = true;
                showerID = 256*vw[3]+vw[4];
                volume =  (256*vw[7]+vw[8])/10;
                temperature = vw[9];
                cold = vw[10];
                //efficiency = vw[11];
                flow = vw[12]/10;
                //breakTime = vw[13];
                duration = ( volume / flow ) * 60;
                currentDate =  moment().valueOf();
                energy = (volume*(temperature-cold)*4.182)/3.6;
                co2 = 0.0005925 * energy/1000;
                member = 0;
                
                var cryptor_h = new CryptoManager(
                                                  {
                                                  "id": changedDevKey,
                                                  "history" : history,
                                                  "category": category,
                                                  "temperature":temperature,
                                                  "volume":volume,
                                                  "flow": flow,
                                                  "energy":energy,
                                                  "showerId":showerID,
                                                  "duration":duration,
                                                  "date":currentDate,
                                                  "co2" : co2,
                                                  "member": member
                                                  }
                                                  );
                cryptor_h.decryptedHistoryPacket();
                break;
                
            case 27:
                break;
                
            case 29:
                break;
                
                //Responses cases
            case 65 :
                changedDevKey = tempObj[0].deviceKey;
                category = 17;
                history = false;
                showerID = 256*vw[3]+vw[4];
                volume =  (256*vw[5]+256*vw[6]+256*vw[7]+vw[8])/10;
                energy = 256*vw[9]+256*vw[10]+256*vw[11]+vw[12];
                temperature = vw[13];
                duration = 256*vw[14]+256*vw[15]+vw[16];
                currentDate = new Date().getTime();
                minutes = (duration / 60).toFixed(2);
                flow = volume / minutes;
                co2 = 0.0005925 * energy/1000;
                member = 0;
               
                $('#nikolas').append('REAL CONNECTED:' + JSON.stringify({
                                                                        "id": changedDevKey,
                                                                        "history" : history,
                                                                        "category": category,
                                                                        "temperature":temperature,
                                                                        "volume":volume,
                                                                        "flow": flow,
                                                                        "energy":energy,
                                                                        "showerId":showerID,
                                                                        "duration":duration,
                                                                        "date":currentDate,
                                                                        "co2" : co2,
                                                                        "member": member
                                                                        }) + '</br>');
                
                var cryptor_r = new CryptoManager({
                                                  "id": changedDevKey,
                                                  "history" : history,
                                                  "category": category,
                                                  "temperature":temperature,
                                                  "volume":volume,
                                                  "flow": flow,
                                                  "energy":energy,
                                                  "showerId":showerID,
                                                  "duration":duration,
                                                  "date":currentDate,
                                                  "co2" : co2,
                                                  "member": member
                                                  });
                cryptor_r.decryptedRealPacket();
                break;
                
            case 66:
                changedDevKey = tempObj[0].deviceKey;
                category = 18;
                history = true;
                showerID = 256*vw[3]+vw[4];
                volume =  (256*vw[7]+vw[8])/10;
                temperature = vw[9];
                cold = vw[10];
                //efficiency = vw[11];
                flow = vw[12]/10;
                //breakTime = vw[13];
                duration = ( volume / flow ) * 60;
                currentDate =  moment().valueOf();
                energy = (volume*(temperature-cold)*4.182)/3.6;
                co2 = 0.0005925 * energy/1000;
                member = 0;

                
                $('#nikolas').append('history CONNECTED:' + JSON.stringify({
                                                                 "id": changedDevKey,
                                                                 "history" : history,
                                                                 "category": category,
                                                                 "temperature":temperature,
                                                                 "volume":volume,
                                                                 "flow": flow,
                                                                 "energy":energy,
                                                                 "showerId":showerID,
                                                                 "duration":duration,
                                                                 "date":currentDate,
                                                                 "co2" : co2,
                                                                 "member": member
                                                                 }) + '</br>');
                
                var cryptor_hh = new CryptoManager({
                                                   "id": changedDevKey,
                                                   "history" : history,
                                                   "category": category,
                                                   "temperature":temperature,
                                                   "volume":volume,
                                                   "flow": flow,
                                                   "energy":energy,
                                                   "showerId":showerID,
                                                   "duration":duration,
                                                   "date":currentDate,
                                                   "co2" : co2,
                                                   "member": member
                                                   });
                cryptor_hh.decryptedHistoryPacket();
                break;
                
            case 67:
                break;
                
            case 68:
                //configuration block #2
                calheating = function(num) {
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
                
                calprice = function (n1,n2) {
                    var val1 = (n1).toString(2);
                    var val2 = (n2).toString(2);
                    var res = ("00000000" + val1).slice(-8);
                    var res1 = ("00000000" + val2).slice(-8);
                    var final = res + res1;
                    //var a = parseInt(final.slice(0,4), 2);
                    var b = parseInt(final.slice(4,16), 2);
                    return b;
                };
                
                var heats = calheating(vw[3]);
                var category_2 = vw[0];
                var type = heats.type;
                var solar = heats.solar;
                var efficiency = vw[4];
                var cold = vw[5];
                var alarm = 256*vw[6]+vw[7];
                var price = calprice(vw[8],vw[9]);
                var coo2 = 256*vw[10]+vw[11];
                var maxBreakDuration = vw[12];
                
                packet = {"category": category_2,"type":type,"solar":solar,"efficieny":efficiency,"cold":cold,"alarm":alarm,"price":price,"co2":coo2,"breaktime":maxBreakDuration,"str":vw[13]+','+vw[14]+','+vw[15]+','+vw[16]};
                
                $('#nikolas').append('cb2 result:' + JSON.stringify(packet) + '</br>');
                var RequestedFromDevice = findDeviceIndex(app.user.profile.devices, 'macAddress', dv.id);
                findAndRemove(app.user.profile.devices[RequestedFromDevice].pendingRequests, 'block', 2);
                app.setUserToLocalStorage(JSON.stringify(app.user));
                break;
                
            case 69:
                //configuration block #3 - water is flowing
                $('#nikolas').append('hi from cb3 </br>');
                var RequestedFromDevice_cb3 = findDeviceIndex(app.user.profile.devices, 'macAddress', tempObj[0].macAddress);
                findAndRemove(app.user.profile.devices[RequestedFromDevice_cb3].pendingRequests, 'block', 3);
                app.requestPendingBlock(RequestedFromDevice_cb3,4);
                app.disconnect(tempObj[0].macAddress);
                alert('2 : ' + JSON.stringify(app.user.profile.devices[RequestedFromDevice_cb3]));
                app.setUserToLocalStorage(JSON.stringify(app.user));
                
                break;
                
            case 70:
                $('#nikolas').append('hi from cb4 </br>');
                var RequestedFromDevice_cb4 = findDeviceIndex(app.user.profile.devices, 'macAddress', tempObj[0].macAddress);
                findAndRemove(app.user.profile.devices[RequestedFromDevice_cb4].pendingRequests, 'block', 4);
                app.requestPendingBlock(RequestedFromDevice_cb4,3);
                app.disconnect(tempObj[0].macAddress);
                alert(JSON.stringify(app.user.profile.devices[RequestedFromDevice_cb4]));
                app.setUserToLocalStorage(JSON.stringify(app.user));
                
                break;
                
            case 404:
                if(AppModel.PingData) {
                    var blecd = new NotificationManager();
                    blecd.PairingCode();
                }
                break;
                
            default:
                if(AppModel.PingData) {
                    var blecd = new NotificationManager();
                    blecd.PairingCode();
                }
        }
    
    }
    
    


};
