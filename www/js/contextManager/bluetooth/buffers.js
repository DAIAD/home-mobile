var bluetoothBuffers = (function(){
                        
                        return {
                            /*unencrypted buffer for pairing code*/
                            codePacket : function() {
                        
                                var aescode = new Uint8Array(18);
                        
                                aescode[0] = 0xFF;
                        
                                aescode[1] = 0x01;
                        
                                aescode[2] = 0x77;
                        
                                for (var i = 3; i < aescode.length; i++) {
                                    aescode[i] = 0xB1;
                                }
                        
                                return aescode.buffer;
                        
                            },
                            historyPacket : function(ids){
                        
                                var his = new Uint8Array(18);
                        
                                his[0] = 0x22;
                        
                                his[1] = 0x01;
                        
                                his[3] = '0x'+ hex16(ids.first).slice(0,2);
                        
                                his[4] = '0x'+ hex16(ids.first).slice(2,4);
                        
                                his[5] = '0x'+ hex16(ids.last).slice(0,2);
                        
                                his[6] = '0x'+ hex16(ids.last).slice(2,4);
                        
                                for (var i = 7; i < his.length; i++) {
                        
                                    his[i] = 0x00;
                        
                                }
                        
                                his[2] = '0x' + int2hex(payloadCheckSum(his));
                        
                                return his.buffer;
                        
                            },
                            realPacket : function(){
                        
                                var real = new Uint8Array(18);
                        
                                real[0] = 0x21;
                        
                                real[1] = 0x01;
                        
                                for (var i = 3; i < real.length; i++) {
                        
                                    real[i] = 0x00;
                        
                                }
                        
                                real[2] = payloadCheckSum(real);
                        
                                return real.buffer;
                        
                            },
                            requestCB1 : function() {
                      
                                var cb1 = new Uint8Array(18);
                        
                                cb1[0] = 0x23;
                        
                                cb1[1] = 0x01;
                        
                                for (var i = 3; i < cb1.length; i++) {
                        
                                    cb1[i] = 0x00;
                        
                                }
                        
                                cb1[2] = payloadCheckSum(cb1);
                        
                                return cb1.buffer;
                        
                            },
                            requestCB2 : function() {
                       
                                var cb2 = new Uint8Array(18);
                        
                                cb2[0] = 0x24;
                       
                                cb2[1] = 0x01;
                        
                                for (var i = 3; i < cb2.length; i++) {
                        
                                    cb2[i] = 0x00;
                        
                                }
                        
                                cb2[2] = '0x' + int2hex(payloadCheckSum(cb2));
                        
                                return cb2.buffer;
                        
                            },
                            requestConfig3 : function(){
                        
                                var cb3 = new Uint8Array(18);
                        
                                cb3[0] = 0x25;
                        
                                cb3[1] = 0x01;
                        
                                for (var i = 3; i < cb3.length; i++) {
                        
                                    cb3[i] = 0x00;
                        
                                }
                        
                                cb3[2] = payloadCheckSum(cb3);
                        
                                return cb3.buffer;
                        
                            },
                            requestConfig4 : function() {
                        
                                var cb4 = new Uint8Array(18);
                        
                                cb4[0] = 0x26;
                        
                                cb4[1] = 0x01;
                        
                                for (var i = 3; i < cb4.length; i++) {
                        
                                    cb4[i] = 0x00;
                        
                                }
                        
                                cb4[2] = payloadCheckSum(cb4);
                        
                                return cb4.buffer;
                        
                            },
                            setConfigBlock : function (changes,block) {
                       
                                var scb = new Uint8Array(18);
                       
                                switch(block){
                        
                                    case 1:
                                        scb[0] = 0x33;
                                        scb[1] = 0x01;
                        
                                        //DISPLAY top
                                        scb[3] = hex8(changes[1]);
                                        scb[4] = hex8(changes[2]);
                                        scb[5] = hex8(changes[3]);
                                        scb[6] = hex8(changes[4]);
                        
                                        //DISPLAY middle
                                        scb[7] = hex8(changes[5]);
                                        scb[8] = hex8(changes[6]);
                                        scb[9] = hex8(changes[7]);
                                        scb[10]= hex8(changes[8]);
                        
                                        //bottom
                                        scb[11] = hex8(changes[9]);
                                        scb[12] = hex8(changes[10]);
                                        scb[13] = hex8(changes[11]);
                                        scb[14] = hex8(changes[12]);
                        
                                        scb[15] = hex8(changes[12]); //number of frames
                                        scb[16] = hex8(changes[12]); //duration of frames
                                        scb[17] = 0x01;
                                        scb[2] = '0x' + int2hex(payloadCheckSum(scb4));
                        
                                        break;
                        
                                    case 2:
                                        scb[0] = 0x34;  //fixed value - cb2
                                        scb[1] = 0x01; //fixed value - version code
                        
                                        scb[3] = '0x' + computeHeating(changes[5],changes[8]); //heating type
                                        scb[4] = '0x' + hex8(changes[6]); //heating efficiency
                                        scb[5] = '0x' + hex8(changes[12]); //cold water temp
                                        scb[6] = '0x' + hex16(changes[3]).slice(0,2); //alarm
                                        scb[7] = '0x' + hex16(changes[3]).slice(2,4); //alarm
                        
                                        var pr = computePricing(changes[7]);
                                        scb[8] = '0x' + pr.slice(0,2); //pricing
                                        scb[9] = '0x' + pr.slice(2,4); //pricing
                        
                                        scb[10] = 0x02;//co2 - default
                                        scb[11] = 0x3B;//co2 - default
                        
                                        scb[12] = 0xB4; //maximum break duration -default
                        
                                        //if the display is configured to show a custom string
                                        scb[13] = 0x2A; // custom string display config
                                        scb[14] = 0x42; // custom string display config
                                        scb[15] = 0x31; // custom string display config
                                        scb[16] = 0x2A; // custom string display config
                                        scb[17] = 0x01; //random value
                        
                                        scb[2] = '0x' + int2hex(payloadCheckSum(pct));
                        
                                        break;
                        
                                    case 3:
                                        scb[0] = 0x35;  //fixed value - cb3
                                        scb[1] = 0x01; //fixed value - version code
                        
                                        //DISPLAY top
                                        scb[3] = '0x' + hex8(changes[1]);
                                        scb[4] = '0x' + hex8(changes[2]);
                                        scb[5] = '0x' + hex8(changes[3]);
                                        scb[6] = '0x' + hex8(changes[4]);
                        
                                        //DISPLAY middle
                                        scb[7] = '0x' + hex8(changes[5]);
                                        scb[8] = '0x' + hex8(changes[6]);
                                        scb[9] = '0x' + hex8(changes[7]);
                                        scb[10]= '0x' + hex8(changes[8]);
                        
                                        //DISPLAY bottom
                                        scb[11] = '0x' + hex8(changes[9]);
                                        scb[12] = '0x' + hex8(changes[10]);
                                        scb[13] = '0x' + hex8(changes[11]);
                                        scb[14] = '0x' + hex8(changes[12]);
                        
                                        scb[15] = '0x' + hex8(changes[13]); //number of frames
                                        scb[16] = '0x' + hex8(changes[14]); //duration of frames
                                        scb[17] = 0x01;
                                        scb[2] = '0x' + int2hex(payloadCheckSum(scb));
                                        break;
                        
                                    case 4:
                                        scb[0] = 0x36;
                                        scb[1] = 0x01;
                       
                                        //top
                                        scb[3] = '0x' + hex8(changes[1]);
                                        scb[4] = '0x' + hex8(changes[2]);
                                        scb[5] = '0x' + hex8(changes[3]);
                                        scb[6] = '0x' + hex8(changes[4]);
                        
                                        //middle
                                        scb[7] = '0x' + hex8(changes[5]);
                                        scb[8] = '0x' + hex8(changes[6]);
                                        scb[9] = '0x' + hex8(changes[7]);
                                        scb[10]= '0x' + hex8(changes[8]);
                        
                                        //bottom
                                        scb[11] = '0x' + hex8(changes[9]);
                                        scb[12] = '0x' + hex8(changes[10]);
                                        scb[13] = '0x' + hex8(changes[11]);
                                        scb[14] = '0x' + hex8(changes[12]);
                        
                                        scb[15] = '0x' + hex8(changes[13]); //number of frames
                                        scb[16] = '0x' + hex8(changes[14]); //duration of frames
                                        scb[17] = 0x01;
                                        scb[2] = '0x' + int2hex(payloadCheckSum(scb));
                                        break;
                                    }
                       
                                    return scb.buffer;
                        
                            }
                        
                        
                        };
                        
                        
                        })();

