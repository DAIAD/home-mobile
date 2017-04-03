/** All server API functions for the communication between SERVER and DAIAD application.
 * @namespace API
 * @name API Requests
 */

//production : true, development : false
var callurl = app.getCallsURL(true);
//api relative paths
var apiPaths = {
    'ignore' : '/api/v2/data/session/ignore',
    'household' : '/api/v1/household',
    'reset' : '/api/v1/user/password/reset/token/create',
    'redeem' : '/api/v1/user/password/reset/token/redeem',
    'change' : '/api/v1/user/password/change',
    'save': '/api/v1/profile/save',
    'load' : '/api/v1/profile/load',
    'label' : '/api/v2/data/session/member',
    'settings' : '/api/v1/device/update',
    'login' : '/api/v1/auth/login',
    'register' : '/api/v1/user/register',
    'configuration' : '/api/v1/device/config',
    'amphiro' : '/api/v1/device/register',
    'notifyprofile' : '/api/v1/profile/notify',
    'notifydevice' : '/api/v1/device/notify',
    'history' :'/api/v1/meter/history',
    'sessions' : '/api/v2/device/session/query',
    'measurements' : '/api/v2/device/session',
    'upload' : '/api/v2/data/store',
    'loadmsg' : '/api/v1/message',
    'ackmsg' : '/api/v1/message/acknowledge',
    'forecasting' : '/api/v1/data/meter/forecast',
    'comparison' : '/api/v1/comparison'
};

//ajax call
function apicall(apidata,apiurl) {
    
    $.ajax({
           type : 'POST',
           contentType : 'application/json',
           dataType : 'json',
           data : apidata,
           url : callurl + apiurl
           })
    .done(function(data){
          $.each(apiPaths,function(key,value) {
                 if(apiurl.indexOf(value) !=-1 ) {
                    var rc = new apiResponses(
                                              {
                                              url : value + '/done',
                                              total :{
                                                data : data,
                                                calleddata : JSON.parse(apidata)
                                              }
                                              }
                                              );
                    rc.done();
                 }
                 });
          })
    .fail(function(jqXHR, textStatus, errorThrown){
          var rc = new apiResponses({
                                    url : apiurl + '/fail' ,
                                    total : {
                                        data : { 'jqxhr' : jqXHR , 'status' : textStatus , 'error' : errorThrown },
                                        calleddata : JSON.parse(apidata)
                                    }
                                    }
                                    );
          rc.fail();
          })
    .always(function(data){
            var rc = new apiResponses({
                                      url : apiurl + '/always' ,
                                      total : {
                                        data : data ,
                                        calleddata : JSON.parse(apidata)
                                      }
                                      }
                                      );
            rc.always();
            });
    
}
