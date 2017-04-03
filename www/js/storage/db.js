/** All database queries.
 * @namespace Storage
 * @name Database Transactions
 */

var dbTransactions = function() {
    //this.param = param;
};

dbTransactions.prototype = {
    openDb : function() {
        if (window.sqlitePlugin !== undefined) {
            app.db = window.sqlitePlugin.openDatabase("b1");
            app.db.transaction(function(tx) {
                               tx.executeSql('CREATE TABLE IF NOT EXISTS feel(id,history,indexs,cdate,category,volume,flow,temp,energy,tshower,co2,member)', []);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS meters(serial,timestamp,volume)', []);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS household_members(id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(128),gender VARCHAR(128),age INTEGER,photo,active INTEGER )',[]);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS label_data(device, shower, member_id , timestamp)', []);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS comparison(id INTEGER PRIMARY KEY AUTOINCREMENT,reference,data,type)', []);
                               tx.executeSql('CREATE TABLE IF NOT EXISTS forecasting(id INTEGER PRIMARY KEY AUTOINCREMENT,type,timestamp,volume)', []);
                               });
        } else {
            // For debugging in simulator fallback to native SQL Lite
            app.db = window.openDatabase("b1", "1.0", "version_", 200000);
        }
    },
    getAllDataForAmphiroWithId : function(param,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT ss.volume as volume,ss.energy as energy,ss.temp as temp,ss.cdate as cdate,ss.tshower as duration,ss.id as id,ss.member as member,ss.indexs as indexs , ss.category as category,ss.history as history,dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id  where ss.id=? group by ss.category,ss.indexs order by ss.indexs desc limit '+param.limit*2+' ',[param.deviceKey], function(tx, results){
                                         callback(results);                                         
                                         });
                           });
    },
    getAllDataForDeviceWithIdAndShowerid : function(param,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from feel where id = "'+param.deviceId+'" AND indexs = '+param.showerId+' order by cdate asc ',[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getMemberById : function(id,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from household_members WHERE id=?',[id], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    updateShowerUser : function(v,d,s){
        app.db.transaction(function(tx) {
                           tx.executeSql('UPDATE feel SET member = ? WHERE id = ? AND indexs = ?',[parseInt(v),d,parseInt(s)], function(){},function(){});
                           });
    },
    updateShowerDate : function(time,category,history,session,devkey){
        app.db.transaction(function(tx) {
                           tx.executeSql('UPDATE feel SET cdate = ?,category=?,history=? WHERE id = ? AND indexs = ?',[parseInt(time),category,history,devkey,parseInt(session)],function(){},function(){});
                           });
    },
    insertLabelData : function(param){
        app.db.transaction(function(tx) {
                           tx.executeSql('INSERT INTO label_data(device,shower,member_id,timestamp) VALUES (?,?,?,?)',[param.device,param.shower,param.index,param.timestamp],function(){},function(){});
                           });
    },
    getAllMembers : function(callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from household_members ',[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getMemberExists : function(index,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from household_members WHERE id=?',[index], function(tx, results) {
                                         callback(results.rows.length);
                                         });
                           });
    },
    storeNewMember : function(param){
        app.db.transaction(function(tx) {
                           tx.executeSql('INSERT INTO household_members(id,name,gender,age,photo,active) VALUES (?,?,?,?,?,?)',[param.index,param.name,param.gender,param.age,param.photo,param.active],function(){},function(){});
                           });
    },
    updateMemberActiveState : function(member){
        app.db.transaction(function(tx) {
                           tx.executeSql('UPDATE household_members SET active = ? WHERE id = ?',[parseInt(member.active),parseInt(member.index)],function(){},function(){});
                           });
    },
    queryLabelData : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from label_data',[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    selectComparison : function(start,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * FROM comparison WHERE reference <= '+start+' order by reference desc',[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    deleteComparison : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM comparison ',[], function(){},function(){});
                           });
    },
    deleteData : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM feel ',[], function(){},function(){});
                           });
    },
    deleteLabelData : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM label_data ',[], function(){},function(){});
                           });
    },
    deleteForecastingData : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM forecasting ',[], function(){},function(){});
                           });
    },
    deletemeter : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM meters ',[], function(){},function(){});
                           });
    },
    deleteMembers : function(){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM household_members ',[], function(){},function(){});
                           });
    },
    deleteIndex : function(id){
        app.db.transaction(function(tx) {
                           tx.executeSql('DELETE FROM feel where indexs='+parseInt(id)+'',[], function(){},function(){});
                           });
    },
    getAverages : function(callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT ct, avg(volume) as volume,avg(energy) as energy,avg(temp) as temp,avg(duration) as duration from ( SELECT COUNT(indexs) as ct, temp ,volume,energy,tshower as duration from feel where cdate>'+moment().startOf('month').valueOf()+' AND cdate <'+moment().endOf('month').valueOf()+' group by indexs order by indexs ) ' ,[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getShowersFromDevice : function(deviceId,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs from feel WHERE id=? group by indexs order by indexs asc',[deviceId], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getBestShower : function(type,callback){
        
        var query = this.bestShowerQuery(type);
        
        app.db.transaction(function(tx) {
                           tx.executeSql(query,[], function(tx, results) {
                                          callback(results);
                                         });
                           });
    },
    bestShowerQuery : function(type){
        
        var query;
        
        if(type === 0) {
            query = 'SELECT ss.volume as volume,ss.energy as energy,ss.tshower as tshower,ss.cdate as cdate,ss.member as member, ss.id as id,ss.temp as temp,ss.flow as flow, dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id  where ss.tshower >= 240 group by ss.indexs,ss.id  order by ss.tshower asc limit 1';
        } else if(type === 1) {
            query = 'SELECT ss.volume as volume,ss.energy as energy,ss.tshower as tshower,ss.cdate as cdate,ss.member as member, ss.id as id,ss.temp as temp,ss.flow as flow, dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id  where volume >= 4 group by ss.indexs,ss.id order by ss.volume asc limit 1';
        } else if(type === 2) {
            query = 'SELECT ss.volume as volume,ss.energy as energy,ss.tshower as tshower,ss.cdate as cdate,ss.member as member, ss.id as id,ss.temp as temp,ss.flow as flow, dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id  where energy >= 200 group by ss.indexs,ss.id order by ss.energy asc limit 1';
        }        
    
        return query;
        
    },
    getLastFiveShowers : function(callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT max(ss.volume) as volume,max(ss.cdate)as date,max(ss.energy) as energy,max(ss.temp) as temp,max(ss.tshower) as duration,max(ss.member) as member,max(ss.id) as id,dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id where ss.volume>=4 group by ss.indexs,ss.id order by ss.cdate desc limit 5 ' ,[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getLastTenShowers : function(callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT avg(volume) as volume,avg(energy) as energy,avg(temp) as temp,avg(flow) as flow,avg(duration) as dur from ( SELECT max(temp) as temp ,max(volume) as volume,max(energy) as energy,max(temp) as temp,max(flow) as flow,max(tshower) as duration from feel group by indexs order by cdate desc limit 10) ' ,[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getMeterConsumption : function(consumption,callback){
        
        var qr = this.meterConsumptionQuery(consumption);
       
        app.db.transaction(function(tx) {
                           tx.executeSql( qr ,[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    meterConsumptionQuery : function(consumption){
    
        var start,end,query;
        
        if(consumption === 0){
            start = moment().subtract(1,'day').startOf('day').valueOf();
            end = moment().subtract(1,'day').endOf('day').valueOf();
        }else if(consumption == 1){
            start = moment().startOf('day').valueOf();
            end = moment().endOf('day').valueOf();
        }else if(consumption == 2){
            start = moment().startOf('isoweek').valueOf();
            end = moment().endOf('isoweek').valueOf();
        }else if(consumption == 3){
            start = moment().startOf('month').valueOf();
            end = moment().endOf('month').valueOf();
        }
        
        query = 'SELECT sum(volume) as volume from meters where timestamp >='+start+' AND timestamp <='+end+' ';
        
        if(consumption == 4){
            query = 'SELECT sum(volume) as volume from meters ';
        }

        return query;
    },
    getConsumption : function(con,callback){
        
        var qr = this.consumptionQuery(con);
        
        app.db.transaction(function(tx) {
                           tx.executeSql(qr ,[], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    consumptionQuery : function(con){
    
        var query,start;
        var end = moment().valueOf();
        var consumption = parseInt(con,10);
        //latest
        if(consumption === 0){
            query ='SELECT volume,energy,temp,flow,tshower as duration from feel order by cdate desc limit 1';
            //daily
        }else if(consumption === 1){
            start = moment().subtract(1,'day').valueOf();
            query = 'SELECT sum(volume) as volume,sum(energy) as energy,avg(temp) as temp,sum(duration) as duration,avg(flow) as flow from ( SELECT max(temp) as temp,max(flow) as flow ,max(volume) as volume,max(energy) as energy, max(tshower) as duration from feel where cdate>'+start+' AND cdate < '+end+' group by indexs ) ' ;
            //weekly
        }else if(consumption === 2){
            start = moment().subtract(1,'week').valueOf();
            query = 'SELECT sum(volume) as volume,sum(energy) as energy,avg(temp) as temp,sum(duration) as duration,avg(flow) as flow from ( SELECT max(temp) as temp ,max(flow) as flow ,max(volume) as volume,max(energy) as energy,max(tshower) as duration from feel where cdate>'+start+' AND cdate < '+end+' group by indexs ) ' ;
            //monthly
        }else if(consumption === 3){
            start = moment().subtract(1,'month').valueOf();
            query = 'SELECT sum(volume) as volume,sum(energy) as energy,avg(temp) as temp,sum(duration) as duration,avg(flow) as flow from ( SELECT max(temp) as temp ,max(flow) as flow ,max(volume) as volume,max(energy) as energy,max(tshower) as duration from feel where cdate>'+start+' AND cdate < '+end+' group by indexs ) ' ;
            //total
        }else if(consumption === 4){
            query = 'SELECT sum(volume) as volume,sum(energy) as energy,avg(flow) as flow,avg(temp) as temp,sum(duration) as duration from ( SELECT volume,cdate as date,energy,flow,temp,tshower as duration from feel group by indexs,id order by indexs)  ';
        }

        return query;
        
    },
    getTotalVolumePerMember : function(callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT ss.volume as volume,ss.energy as energy,ss.temp as temp,ss.cdate as cdate,ss.tshower as duration,ss.id as id,ss.member as member,ss.indexs as indexs , ss.category as category,ss.history as history,dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id group by ss.category,ss.indexs,ss.member order by ss.indexs ',[], function(tx, results){
                                         callback(results);
                                         });
                           });
    },
    getLast300ShowersPerMember : function(callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT ss.volume as volume,ss.energy as energy,ss.temp as temp,ss.cdate as cdate,ss.tshower as duration,ss.id as id,ss.member as member,ss.indexs as indexs , ss.category as category,ss.history as history,dd.name as name from feel AS ss JOIN household_members AS dd ON ss.member = dd.id group by ss.category,ss.indexs,ss.member order by ss.indexs asc limit 300 ',[], function(tx, results){
                                         callback(results);
                                         });
                           });
    },
    updatePhotoDB : function(photo){
        app.db.transaction(function(tx) {
                           tx.executeSql('UPDATE household_members SET photo = ? WHERE id = ?',[photo,0],function(){},function(){});
                           });
    },
    getForecastingForMeter : function(startDate,endDate,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT volume, timestamp from forecasting where timestamp > '+startDate+' AND timestamp <'+endDate+' ',[],function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getAllDataForMeter : function(startDate,endDate,granu,callback){
        
        var qr = this.getMeterdataQuery(startDate,endDate,granu);
        
        app.db.transaction(function(tx) {
                           tx.executeSql(qr,[],function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getMeterdataQuery : function(startDate,endDate,granu){
    
        var qr,
            searchTime;
        
        if(granu === 0) {
            searchTime = 3600;
            qr = 'SELECT sum(volume) as volume, timestamp from meters where timestamp > '+startDate+' AND timestamp <'+endDate+' group by timestamp/'+searchTime+' ';
        } else if(granu == 1) {
            searchTime = 3600*24;
            qr = 'SELECT sum(volume) as volume, timestamp from meters where timestamp > '+startDate+' AND timestamp <'+endDate+' group by timestamp/'+searchTime+'';
        } else if(granu == 2) {
            searchTime = 3600*24*31 ;
            qr = 'SELECT sum(volume) as volume, timestamp from meters where timestamp > '+moment(startDate).startOf('month').valueOf()+' AND timestamp <'+moment(endDate).endOf('month').valueOf()+' group by timestamp/'+searchTime+' ';
        } else if(granu == 3) {
            searchTime = 3600*24*31*12;
            qr = 'SELECT sum(volume) as volume, timestamp from meters where timestamp > '+moment(startDate).startOf('year').valueOf()+' AND timestamp <'+moment(endDate).endOf('year').valueOf()+'  group by timestamp/'+searchTime+' ';
        }
        
        return qr;
    
    },
    insertSmartWaterMeterData : function(data){
        app.db.transaction(function(tx) {
                           $.each(data.series[0].values,function(){
                                  tx.executeSql('INSERT INTO meters(serial,timestamp,volume) VALUES (?,?,?)',[data.series[0].deviceKey,this.timestamp,this.difference],function(){},function(){});
                                  });
                           });
    },
    storeRealPacket: function(param) {
        app.db.transaction(function(tx) {
                       tx.executeSql('INSERT INTO feel(id,history,indexs,cdate,category,volume,flow,temp,energy,tshower,co2,member) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                                     [param.id,param.history,param.showerId,param.date,param.category,param.volume,param.flow,param.temperature,param.energy,param.duration,param.co2,param.member],
                                     function(){},function(){});
                       });
    
    },
    storeHistoryPacket: function(param) {
        app.db.transaction(function(tx) {
                       tx.executeSql('SELECT * from feel where indexs = '+param.showerId+' AND id= "'+param.id+'" AND category = 18 ',[], function(tx, results) {
                                     if(results.rows.length === 0) {
                                        if(param.volume > 0){
                                            tx.executeSql('INSERT INTO feel(id,history,indexs,cdate,category,volume,flow,temp,energy,tshower,co2,member) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                                                          [param.id,param.history,param.showerId,param.date,param.category,param.volume,param.flow,param.temperature,param.energy,param.duration,param.co2,param.member],
                                                          function(){},function(){});
                                        }
                                     }
                                     });
                           });
    },
    getSessionsForDeviceKey : function(deviceKey,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT indexs,id,cdate as date,tshower as dur ,history as his,category as cat,volume as volume ,energy as energy, temp, flow from feel WHERE id=? group by history,indexs order by indexs desc',[deviceKey], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    getMeasurementsForDeviceKey : function(date,deviceKey,callback){
        app.db.transaction(function(tx) {
                           tx.executeSql('SELECT * from feel where id= ? AND  cdate > '+date+' AND category=17 order by indexs asc',[deviceKey], function(tx, results) {
                                         callback(results);
                                         });
                           });
    },
    insertForecastingData : function(dt){
        app.db.transaction(function(tx) {
                           $.each(dt.meters[0].points, function(i){
                                  tx.executeSql('SELECT * FROM forecasting WHERE timestamp = '+dt.meters[0].points[i].timestamp+' ',[], function(tx, results) {
                                                if(results.rows.length === 0){
                                                    tx.executeSql('INSERT INTO forecasting(type,timestamp,volume) VALUES (?,?,?)',
                                                                  [dt.meters[0].points[i].type,dt.meters[0].points[i].timestamp,dt.meters[0].points[i].volume.SUM],
                                                                  function(){/*alert('forecasting stored');*/},function(){/*alert('forecasting ERROR');*/});
                                                }
                                                });
                                  });
                           });
    },
    insertComparisonData : function(arrMonth,arrDay,arrIq){
        
        app.db.transaction(function(tx) {
                           
                           $.each(arrMonth, function(i){
                                  
                                  var refTime = tm.getUnixTimestamp(this.from),
                                    startTime = moment(refTime).startOf('month').valueOf();
                                  
                                  tx.executeSql('SELECT * from comparison where reference = '+startTime+' AND type=?',['m'], function(tx, results) {
                                                
                                                if(results.rows.length === 0){
                                                    tx.executeSql('INSERT INTO comparison(reference,data,type) VALUES (?,?,?)',
                                                                  [startTime,JSON.stringify(arrMonth[i]),'m'],
                                                                  function(){/*alert('comparsion stored');*/},function(){/*alert('comparisn ERROR');*/});
                                                }
                                                
                                                });
                                  });
                           
                           $.each(arrDay, function(i){
                                  
                                  var refTime = tm.getUnixTimestamp(arrDay[i].date),
                                  startTime = moment(refTime).startOf('month').valueOf();
                                  
                                  tx.executeSql('SELECT * from comparison where reference = '+startTime+' AND type=?',['d'], function(tx, results) {
                                                
                                                if(results.rows.length === 0){
                                                //$('#nikolas').append(new Date(startTime) + '_timest :'+ startTime +' - ' + JSON.stringify(data.comparison.dailyConsumtpion[i]) +'</br>');
                                                tx.executeSql('INSERT INTO comparison(reference,data,type) VALUES (?,?,?)',
                                                              [startTime,JSON.stringify(arrDay[i]),'d'],
                                                              function(){/*alert('DAILY comparsion stored');*/},function(){/*alert('comparisn ERROR');*/});
                                                
                                                }
                                                
                                                });
                                  
                                  });
                           
                           $.each(arrIq, function(i){
                                  
                                  var refTime = tm.getUnixTimestamp(this.from),
                                  startTime = moment(refTime).startOf('month').valueOf();
                                  
                                  tx.executeSql('SELECT * from comparison where reference = '+startTime+' AND type=?',['q'], function(tx, results) {
                                                
                                                if(results.rows.length === 0){
                                                
                                                tx.executeSql('INSERT INTO comparison(reference,data,type) VALUES (?,?,?)',
                                                              [startTime,JSON.stringify(arrIq[i]),'q'],
                                                              function(){/*alert('water IQ comparsion stored');*/},function(){/*alert('comparisn ERROR');*/});
                                                
                                                }
                                                
                                                });
                                  
                                  });
                           
                           });
    
    },
    insertAmphiroData : function(data){
    
        app.db.transaction(function(tx) {
                           $.each(data.devices,function(i){
                                  $.each(data.devices[i].sessions,function(j){
                                         var id = data.devices[i].sessions[j].id;
                                         var devKey = data.devices[i].deviceKey;
                                         tx.executeSql('SELECT * from feel where indexs = '+parseInt(id)+' AND id = "'+devKey+'" ',[], function(tx, results) {
                                                       var len = results.rows.length;
                                                       var category,member;
                                                       var co2  =  0.0005925 * data.devices[i].sessions[j].energy/1000;
                                                       
                                                       if(data.devices[i].sessions[j].history){
                                                       category = 18;
                                                       }else{
                                                       category = 17;
                                                       }
                                                       
                                                       if(!data.devices[i].sessions[j].member){
                                                       member = 0;
                                                       }else {
                                                       //alert(JSON.stringify(app.user.profile));
                                                       var obj = getObjects(app.user.profile.household.members, 'index',data.devices[i].sessions[j].member.index);
                                                       
                                                       if(obj.length > 0 ){
                                                       member = data.devices[i].sessions[j].member.index;
                                                       } else{
                                                       member = 0;
                                                       }
                                                       
                                                       }
                                                       
                                                       if(len === 0){
                                                       $('#nikolas').append('inserting data: ' +data.devices[i].deviceKey +' - ' + data.devices[i].sessions[j].id + '</br>');
                                                       tx.executeSql('INSERT INTO feel(id,history,indexs,cdate,category,volume,flow,temp,energy,tshower,co2,member) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                                                                     [data.devices[i].deviceKey,
                                                                      data.devices[i].sessions[j].history,
                                                                      data.devices[i].sessions[j].id,
                                                                      data.devices[i].sessions[j].timestamp,
                                                                      category,
                                                                      data.devices[i].sessions[j].volume,
                                                                      data.devices[i].sessions[j].flow,
                                                                      data.devices[i].sessions[j].temperature,
                                                                      data.devices[i].sessions[j].energy,
                                                                      data.devices[i].sessions[j].duration,
                                                                      co2,
                                                                      member
                                                                      ],function(){ /*alert('stored');*/},function(){}); //end execute
                                                       }else{
                                                       
                                                       if(member != results.rows.item(0).member){
                                                       $('#nikolas').append('changing members: '  + data.devices[i].deviceKey +' - OLD MEMBER: ' + results.rows.item(0).member + ' _ NEW MEMBER' + member + '</br>');
                                                       tx.executeSql('UPDATE feel SET member = ? WHERE id = ? AND indexs = ?',
                                                                     [member,data.devices[i].deviceKey,data.devices[i].sessions[j].id],
                                                                     function(){ /*alert('updated 1213243');*/},
                                                                     function(){/*alert('error_updated');*/});
                                                       }
                                                       
                                                       if(data.devices[i].sessions[j].timestamp != results.rows.item(0).cdate ){
                                                       $('#nikolas').append('exists changing time: '  + data.devices[i].deviceKey +' - ' + data.devices[i].sessions[j].id + ' - ' + data.devices[i].sessions[j].history + ' - '+ category +' _volume ' + data.devices[i].sessions[j].volume + '</br>');
                                                       //app.updateShowerDate(data.devices[i].sessions[j].timestamp,data.devices[i].sessions[j].id ,data.devices[i].deviceKey);
                                                       tx.executeSql('UPDATE feel SET cdate = ?,category=?,history=? WHERE id = ? AND indexs = ?',
                                                                     [data.devices[i].sessions[j].timestamp,category,data.devices[i].sessions[j].history,data.devices[i].deviceKey,data.devices[i].sessions[j].id],
                                                                     function(){ /*alert('updated 1213243');*/},
                                                                     function(){/*alert('error_updated');*/});
                                                       }
                                                       
                                                       if(category != results.rows.item(0).category){
                                                       $('#nikolas').append('exists changing flag:'  + data.devices[i].deviceKey +' - ' + data.devices[i].sessions[j].id + '</br>');
                                                       //app.updateShowerHistoryFlag(data.devices[i].sessions[j].timestamp,data.devices[i].sessions[j].id ,data.devices[i].deviceKey);
                                                       tx.executeSql('UPDATE feel SET category = ?,history=? WHERE indexs = ? AND id = ? ',
                                                                     [category,data.devices[i].sessions[j].history,data.devices[i].sessions[j].id,data.devices[i].deviceKey],
                                                                     function(){
                                                                     /*alert('updated category');*/
                                                                     },
                                                                     function(){
                                                                     /*alert('error_updated category');*/
                                                                     });
                                                       }
                                                       
                                                       
                                                       
                                                       }
                                                       });
                                         });
                                  });
                           });
        
    },

};
