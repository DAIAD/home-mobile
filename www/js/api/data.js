/** All server API DATA functions for the calls
 * @namespace API
 * @name API data requests
 */
function genericCredentialsObj(){
    return {
            "credentials": {
                "username" : app.getUserEmail(),
                "password" : app.getUserPassword()
            }
            };
}
//generic credentials
function genericCredentialsApiData(){
    return JSON.stringify({
                          "username" : app.getUserEmail(),
                          "password" : app.getUserPassword()
                          });
}
//load profile data api request
function loadProfileApiData() {
    return JSON.stringify({
                          "username" : app.getUserEmail(),
                          "password" : app.getUserPassword(),
                          "version": app.version
                          });
}
//login profile data api request
function loginProfileApiData(credentials) {
    return JSON.stringify(
                          {
                          "username":credentials.username,
                          "password":credentials.pass_word,
                          "version": app.version
                          }
                          );
}
//save profile data api request
function saveProfileApiData(property) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , property);
    
    return JSON.stringify(result);
    
}
//load configuration data api request
function loadConfigurationApiData() {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , { "deviceKey": app.getAmphiroDeviceKeys() });
    
    return JSON.stringify(result);
    
}

function setMessagePaginations(msgType,msgSize) {
    
   return {
        type: msgType,
        pagination: {
            ascending: false,
            size:msgSize
        }
   };
    
}

//load messages data api request
function loadMessagesApiData(msgObj) {
    
    var msgArray = [];
    
    $.each(msgObj, function(){
           
           msgArray.push( setMessagePaginations( this.type , this.size ) );
           
           });
        
    var credentials = genericCredentialsObj(),
        result = $.extend(
                          {},
                          credentials,
                          {
                          messages: msgArray
                          }
                          );
    
    return JSON.stringify(result);
    
}
//acknoledge messages data api request
function ackMessagesApiData(msg) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , { "messages": msg });
    
    return JSON.stringify(result);
    
}
//label showers data api request
function labelShowersApiData(asg) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , { "assignments":asg });
    
    return JSON.stringify(result);
    
}
//ignore-delete showers data api request
function ignoreShowersApiData(showers) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , { "sessions":showers });
    
    return JSON.stringify(result);
   
}
//upload household members data api request
function uploadHouseholdApiData(mbs) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , { "members": mbs });
    
    return JSON.stringify(result);
    
}
//update amphiro settings
function updateAmphiroSettingsApiData(settings){
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , settings);
    
    return JSON.stringify(result);
   
}

//notify profile data api request
function notifyProfileDataApi(version) {
   
    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "application":"MOBILE",
                          "version":version,
                          "updatedOn":new Date().getTime()
                          }
                          );
    
    return JSON.stringify(result);
    
}

//notify device data api request
function notifyDeviceDataApi(key,version) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "deviceKey":key,
                          "version":version,
                          "updatedOn":new Date().getTime()
                          }
                          );
    
    alert(JSON.stringify(result));
    
    return JSON.stringify(result);
    
}

//load configuration data api request
function meterStatusDataApi(key) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend( {} , credentials , { "deviceKey": [key] });
    
    return JSON.stringify(result);
    
}
//get meter stastus data api request
function meterHistoryDataApi(gran,startDate,endDate,keys) {

    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "deviceKey": keys,
                          "granularity": gran,
                          "startDate":startDate,
                          "endDate":endDate
                          }
                          );
    
    return JSON.stringify(result);
    
}
//get shower sessions data api request
function showerSessionsDataApi(keys, from, to) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "deviceKey": keys,
                          "type": "ABSOLUTE",
                          "startIndex":from,
                          "endIndex":to,
                          }
                          );
    
    return JSON.stringify(result);
    
}
//get shower sessions data api request
function showerMeasurementsDataApi(key,showerid) {
    
    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "deviceKey": key,
                          "sessionId": showerid
                          }
                          );
    
    return JSON.stringify(result);
    
}

function forecastingDataApi(users) {

    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "query" : {
                            "timezone":app.getUserTimezone(),
                            "time": {
                                "type" : "SLIDING",
                                "start": moment().startOf('month').valueOf(),
                                "duration": moment().endOf('month').date(),
                                "durationTimeUnit": "DAY",
                                "granularity": "DAY"
                          },
                          "population": [{
                                         "type" :"USER",
                                        "label": "User 1",
                                         "users": users
                                         }]
                          }
                          }
                      );
    
    return JSON.stringify(result);

}

function changePasswordDataApi(password) {

    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          {
                          "password": password,
                          }
                          );
    
    return JSON.stringify(result);
    
}

function resetPasswordDataApi(username) {
    
    return JSON.stringify(
                          {
                          "username":username,
                          "application":"MOBILE"
                          }
                          );
}

function redeemPasswordDataApi(data) {
    
    return JSON.stringify(
                          {
                          "token": app.getAuthenticationToken(),
                          "pin": data.pin_reset,
                          "password": data.pass_reset
                          }
                          );
}

function dataUploadRequest(data) {

    var credentials = genericCredentialsObj(),
        result = $.extend({},
                          credentials,
                          data
                          );
    
    return JSON.stringify(result);
    
}

function registerDeviceRequest(parameters) {
    var devices = app.getUserDevicesPath();
    var credentials = genericCredentialsObj(),
        result = $.extend(
                          {},
                          credentials,
                          {
                          "macAddress":parameters.id,
                          "name" : ' Shower #' + devices.length ,
                          "type":"AMPHIRO",
                          "aesKey" :parameters.key,
                          "properties":[{
                                        "key" :"manufacturer",
                                        "value":"amphiro"
                                        },{
                                        "key" :"model",
                                        "value":"b1"
                                        }
                                        ]
                          }
                          );
    
    return JSON.stringify(result);
    
} 



