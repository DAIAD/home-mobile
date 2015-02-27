var sm = {};
sm.db = null;

sm.openDb = function() {
    if (window.sqlitePlugin !== undefined) {
        sm.db = window.sqlitePlugin.openDatabase("daiad");
    } else {
        // For debugging in simulator fallback to native SQL Lite
        sm.db = window.openDatabase("daiad", "1.0", "Cordova Demo", 200000);
    }
},

sm.createTableUser = function(n,p) {
    sm.db.transaction(function(tx) {
                       //tx.executeSql('DROP TABLE IF EXISTS User');
                       tx.executeSql('CREATE TABLE IF NOT EXISTS User(username, password)', []);
                       tx.executeSql('INSERT INTO User(username, password) VALUES (?,?)',
                                    [n,p],
                                    sm.onSuccess,
                                    sm.onError);

                       });
                       
},

sm.FeelData = function(t,v,i,h,r,br,cf,cd,e) {
    sm.db.transaction(function(tx) {
                      //tx.executeSql('DROP TABLE IF EXISTS feel');
                      tx.executeSql('CREATE TABLE IF NOT EXISTS feel(indexs,cdate,his,volume,temp,energy,tshower,tbreak,cflag)', []);
                      tx.executeSql('INSERT INTO feel(indexs,cdate,his,volume,temp,energy,tshower,tbreak,cflag) VALUES (?,?,?,?,?,?,?,?,?)',
                                    [i,cd,h,v,t,e,r,br,cf],
                                    
                                    sm.onSuccess,
                                    sm.onError);
                      });
},

sm.selectFeel = function() {
	sm.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM feel WHERE his=1', [], function(tx, results) {
    					var json = {
        					tableRows : []
    							};
        				var len = results.rows.length;
    
        				for (var i=0; i<len; i++){
        					var r = results.rows.item(i);			
       						json.tableRows.push(r);      
       											 }
    					var newJson = JSON.stringify(json);
    					alert(JSON.stringify(json));
    					//return newJson;

                                        }, sm.onError);
			
									});

},

sm.onSuccess = function(tx,r) {
    
},

sm.onError = function(tx, e) {
    alert("SQLite Error: " + e.message);
}






