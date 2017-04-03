var db = null;
var pictureSource;   // picture source
var destinationType;
var bluetoothLocker = 0;
var devPath = null;
var bleTime;
var trans,tm,calc,shtmr;

var app = {
    version : '1.6.0',
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause',this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        window.addEventListener('online', this.networkOnline);
        window.addEventListener('offline', this.networkOffline);
        //window.addEventListener('orientationchange', function(){ /*alert(screen.orientation); // e.g. portrait */});
    },
    user : {
        session: null,
        profile : { devices :[], mode : 222 },
        notifications : [],
        authentication : {},
        photo: 'img/SVG/daiad-consumer.png',
        personalEstimates : null, //gather estimations from user ex. water calculator
        location : {},
        settings : {
            consumptionChoice : 4,
            budget: 200,
            similar_home:100,
            city:100,
            amphiro_budget:100,
            meter_budget:250,
            showerTimer : null,
            timer: {
                duration:0,
                volume: 0,
                energy: 0,
                temp : 0,
                active : 0,
                best: null,
                settings:null,
                used:0
            },
            mydashenabled :[
                            {
                            id:8,
                            title:"Duration"
                            },{
                            id:2,
                            title:"Temperature"
                            },{
                            id:6,
                            title:"Timer"
                            }
                            ],
            notifications : [],
            ackMessages :[]
        }
    },
    getCallsURL : function(state){
    
        var url;
        
        (state) ? url = 'https://app.dev.daiad.eu' : url =  'http://192.168.10.113:8888';
        
        return url;
        
    },
    getSystemPlatform : function() {
        return cordova.platformId;
    },
    getUserProfilePath : function() {
        return app.user.profile;
    },
    getUserDevicesPath: function() {
        return app.user.profile.devices;
    },
    getSessionState : function() {
        return app.user.session;
    },
    hideStatusBar : function() {
        
        //StatusBar.overlaysWebView(false);
        
        //StatusBar.backgroundColorByHexString("#A4D5F5");
        
        StatusBar.styleDefault();
        //#A4D5F5
        //#2D3580
        
        //StatusBar.hide();
    },
    orientation : function(position) {
        screen.lockOrientation(position);
    },
    onPause: function(){ //APP STATE MANAGER
        if( app.getSessionState() ) {
            var state = new refreshApplicationManager();
            state.pause();
        }
    },
    onResume: function(){
        if( app.getSessionState() ) {
            var state = new refreshApplicationManager();
            state.resume();
        }
    },
    networkOnline : function(){ // CONTEXT MANAGER
        var ctx = new ContextManager();
        ctx.networkEnabled();
        if( app.getSessionState() ) {
            ctx.networkStatusChangedEnabled();
        }
    },
    networkOffline : function() {
        var ctx = new ContextManager();
        ctx.networkDisabled();
    },
    InternetWatcher : function() {
        if( this.checkConnection() === 'No network connection') {
         var ctx = new ContextManager();
         ctx.networkDisabled();
        } else {
         var ctm = new ContextManager();
         ctm.networkEnabled();
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
    checkBluetooth : function() { //CONTEXT MANAGER 
        ble.isEnabled(
                      function(){
                       var ctx = new ContextManager();
                       ctx.bluetoothEnabled();
                      },
                      function(){
                       var ctx = new ContextManager();
                       ctx.bluetoothDisabled();
                      }
                      );
    },
    refreshApplication : function() {
        //if password or username does not  exists then redirect to 'initialize' page.
        if( !this.getUserPassword() || !this.getUserEmail() ) {
            app.changeToPage('#initialize');
            return false;
        }
        
        //else.. request profile
        
        var request = new refreshApplicationManager();
        request.req_profile();
    },
    startApplication : function() {
        
        app.appLabels = applicationLabels.getConsumptionLabels(app.getUserCountry());

        app.checkForUndefined();
        app.setAppLanguage();
        app.setAppUnit();

        app.computeAverages();
        app.setUserProfile();
        app.setMultileMeterControls();
        
        app.hideSocialComparisons();
        
        app.buildMessage();
        
        setTimeout(function(){
                   
                   var lastsyncdate = JSON.parse(app.getlastComparisonSync()); //this holds the last sync data
                   
                   if(lastsyncdate){
                        app.setComparisoData(moment(lastsyncdate).startOf('month').valueOf());
                   } else {
                        app.setComparisoData(moment().subtract(2,'month').startOf('month').valueOf());
                   }
                   
                   },100);
        
        setTimeout(function(){
                   app.refreshMainDashboard();
                   },700);
        
        setTimeout(function(){
                   
                   app.InternetWatcher();
                   
                   app.renderMobileHome();
                   
                   app.hideSplashscreen();
                   
                   },1500);
        
    },
    alwaysRequestProfile : function(){
        var rc = new refreshApplicationManager();
        rc.profileCompleted();
    },
    requestProfile : function(){
        apicall(
                loadProfileApiData(),
                apiPaths.load
                );
    },
    saveProfile : function(property){
        apicall(
                saveProfileApiData(property),
                apiPaths.save
                );
    },
    login : function(credentials){
        apicall(
                loginProfileApiData(credentials),
                apiPaths.login
                );
    },
    registeruser : function(account){
        apicall(
                JSON.stringify({'account' : account}),
                apiPaths.register
                );
    },
    notifyprofile : function(version){
        apicall(
                notifyProfileDataApi(version),
                apiPaths.notifyprofile
                );
    },
    resetpass : function(username){
        apicall(
                resetPasswordDataApi(username),
                apiPaths.reset
                );
    },
    redeempass : function(data){
        apicall(
                redeemPasswordDataApi(data),
                apiPaths.redeem
                );
    },
    changepass : function(data_change){
        
        apicall(
                changePasswordDataApi(data_change.pass_change),
                apiPaths.change
                );
    },
    labeleddata : function(assignments){
        apicall(
                labelShowersApiData(assignments),
                apiPaths.label
                );
    },
    ignoreshower : function(showers){
        apicall(
                ignoreShowersApiData(showers),
                apiPaths.ignore
                );
    },
    uploaddata : function(tosend){
        apicall(
                dataUploadRequest(tosend),
                apiPaths.upload
                );
    },
    forecasting : function(users){
        apicall(
                forecastingDataApi(users),
                apiPaths.forecasting
                );
    },
    devicesettings : function(settings){
        apicall(
                updateAmphiroSettingsApiData(settings),
                apiPaths.settings
                );
    },
    requestConfiguration : function(){
        apicall(
                loadConfigurationApiData(),
                apiPaths.configuration
                );
    },
    deviceregister : function(param){
        apicall(
                registerDeviceRequest(param),
                apiPaths.amphiro
                );
    },
    notifydevice : function(key,version){
        apicall(
                notifyDeviceDataApi(key,version),
                apiPaths.notifydevice
                );
    },
    meterhistory : function(keys,startDate,endDate,gran){
        apicall(
                meterHistoryDataApi(gran,startDate,endDate,keys),
                apiPaths.history
                );
    },
    amphirosessions : function(keys, start, end){
        apicall(
                showerSessionsDataApi(keys, start, end),
                apiPaths.sessions
                );
    },
    measurements : function(deviceKey,sessionId){
        apicall(
                showerMeasurementsDataApi(deviceKey,sessionId),
                apiPaths.measurements
                );
    },
    loadmsg : function(msgsToGet){
        apicall(
                loadMessagesApiData(msgsToGet),
                apiPaths.loadmsg
                );
    },
    ackmsg : function(msgs){
        apicall(
                ackMessagesApiData(msgs),
                apiPaths.ackmsg
                );
    },
    comparison : function(cmp){
        
        apicall(
                genericCredentialsApiData(),
                apiPaths.comparison + '/' + cmp.year+'/'+cmp.month
                );
    },
    household : function(members){
        apicall(
                uploadHouseholdApiData(members),
                apiPaths.household
                );
    },
    
    buildMessage: function () {
        var msg = new messages(app.user.notifications);
        msg.init();
    },
    ackUserMessages : function() {
        app.ackmsg(app.user.settings.ackMessages);
    },
    getUserMessages : function() {
        //initialize the number of each message category
        app.loadmsg(
                     [
                      {
                      'type' : 'ALERT',
                      'size' : 5
                      },
                      {
                      'type' : 'TIP',
                      'size' : 5
                      },
                      {
                      'type' : 'RECOMMENDATION',
                      'size' : 5
                      },
                      {
                      'type' : 'ANNOUNCEMENT',
                      'size' : 5
                      }
                      ]
                     );
        
    },
    deleteShowers : function(obj) {
        
        if(obj.is(':checked')){
            
            var showers = [],
                value = obj.val(),
                id = obj.attr('id');
            
            showers.push(
                         {
                         deviceKey:id,
                         sessionId:value,
                         timestamp:new Date().getTime()
                         }
                         );
            
            app.ignoreshower(showers);
            
        }
        
    },
    requestForecasting : function() {
        
        if(app.countMeters() == 0) {
            return false;
        }

        trans.getForecastingForMeter(
                                     moment().startOf('month').valueOf(),
                                     moment().endOf('month').valueOf(),
                                     function(ds){
                                     var data = app.processMeterData(ds);
                                  
                                     if(!data.length) {
                                        var users = [],
                                            userkey = app.getUserKey();
                                   
                                            users.push(userkey);
                                   
                                        app.forecasting(users);
                                   
                                     }
                                   
                                     }
                                     );
        
    },
    updateDeviceToServer : function(data) {
        
        app.devicesettings(
                              {
                              updates: [
                                        {
                                        type:"AMPHIRO",
                                        key:data.deviceKey,
                                        name:data.name,
                                        properties: data.properties
                                        }
                                        ]
                              }
                              );
        
    },
    uploadHousehold : function() {
        
        createMembersObj = function(results){
            
            var members = [], state, gender;
            
            for (var i=0; i<results.rows.length; i++) {
                
                (results.rows.item(i).active === 1 ) ? state = true : state = false;
                
                (results.rows.item(i).gender === "") ? gender = 'MALE' : gender = results.rows.item(i).gender;
                
                members.push(
                             {
                             index:results.rows.item(i).id,
                             name:results.rows.item(i).name,
                             age:results.rows.item(i).age,
                             gender:gender,
                             photo:results.rows.item(i).photo,
                             active: state
                             }
                             );
            }
            
            app.household(members);
            
        };
        
        trans.getAllMembers(
                            function(results){
                                createMembersObj(results);
                            }
                            );
    },
    uploadLabeledData : function(){
        trans.queryLabelData(
                             function(data){
                             app.labeleddata(
                                             app.processLabelData(data)
                                             );
                             }
                             );
    },
    getComparisonData : function(timestamp){
    
        app.comparison(
                       {
                       timestamp : timestamp,
                       year : moment(timestamp).year(),
                       month : moment(timestamp).month()
                       }
                       );
    
    },
    setComparisoData : function(timestamp){
        
        var cmp = new comparisons(timestamp);
        cmp.init();
        
        if(app.countAmphiro() > 0) {
            
            trans.getTotalVolumePerMember(
                                          function(data){
                                            var rk = new ranking();
                                            rk.setRanking(app.processTotalVolumePerMember(data));
                                          }
                                          );
            
        }
        
        if(app.countMeters() > 0) {
            cmp.scheduler();
            if(app.user.profile.comparison.waterIq.length === 0) return;
            cmp.setWaterIQ( app.user.profile.comparison.waterIq );
            cmp.setMeterReport( app.user.profile.comparison.monthlyConsumtpion );
        }
        
    },
    onClickSocialForwardTimeControl : function(e){
        
        e.preventDefault();
        
        var month_as_timestamp = parseInt( $('#social_month_timestamp').text(),10 );
        
        var gg = new comparisons( moment(month_as_timestamp).add(1,'month').valueOf() );
        gg.setControlTimeNext();
        
        app.getWholeComparisonData(moment(month_as_timestamp).add(1,'month').startOf('month').valueOf());
        
    },
    onClickSocialBackTimeControl : function(e){
        
        e.preventDefault();
        
        var month_as_timestamp = parseInt( $('#social_month_timestamp').text(),10 );
        
        var gg = new comparisons( moment(month_as_timestamp).subtract(1,'month').valueOf() );
        gg.setControlTimeBack(app.user.profile.comparison.monthlyConsumtpion);
        
        app.getWholeComparisonData(moment(month_as_timestamp).subtract(1,'month').startOf('month').valueOf());
        
    },
    setUserProfile : function(){
        this.setUserBasicInfo();
        this.refreshHouseholdlist($('#Householdlist'));
        this.setNumberOfDevices();
        this.setUserDevices($('.DevicesList'));
        this.setUserDevicesSettings();
        this.setUserUnit();
        this.computeProfileComplete();
        this.getMetrics();
    },
    refreshMainDashboard : function(){
        var numberOfAmphiros = this.countAmphiro(),
            numberOfMeters =  this.countMeters(),
            consumption = parseInt(app.user.settings.consumptionChoice,10),
            switchaki = $('#configureSwitcher'),
            showdata;
        
        if(numberOfAmphiros > 0 && numberOfMeters > 0) {
            
            if(switchaki.is(':checked')) {
                
                trans.getMeterConsumption(
                                          consumption,
                                          function(res){
                                          
                                            var data = app.prsMeterConsumption(res,consumption);
                                          
                                          
                                            showdata = {
                                                text : app.getActiveDashboardChoiceText(),
                                                high : {
                                                    value : (data.volume.value).toFixed(2).replace(".", ","),
                                                    label : data.volume.label
                                                },
                                                mid : {
                                                    value : '',
                                                    label : ''
                                                },
                                                low : {
                                                    value : '',
                                                    label : ''
                                                }
                                            };
                                          
                                          var hi = new dashboardGauge(showdata);
                                          hi.render();
                                          hi.setBudget();
                                          hi.refreshComplications({
                                                     active : app.user.settings.mydashenabled,
                                                     data : data,
                                                     selector : $('.dashboard-vals')
                                                     });
                                          
                                          
                                         
                                          }
                                          );
            } else {
                //get the consumption and refresh dashboard
                trans.getConsumption(
                                    consumption,
                                    function(res){
                                  
                                     var data = app.prsGetConsumption(res);
                                     showdata ={
                                        text : app.getActiveDashboardChoiceText(),
                                        high : {
                                            value : (data.volume.value).toFixed(2).replace(".", ","),
                                            label : data.volume.label
                                        },
                                        mid : {
                                            value : (data.energy.value).toFixed(2).replace(".", ","),
                                            label : data.energy.label
                                        },
                                        low : {
                                            value : tm.secondsToMinutes(data.duration.value),
                                            label : 'min'
                                        }
                                     };
                                     
                                     trans.getLastTenShowers(function(data){
                                                             
                                                             var hi = new dashboardGauge(showdata);
                                                             hi.render();
                                                             hi.setBudget();
                                                             hi.refreshComplications({
                                                                        active : app.user.settings.mydashenabled,
                                                                        data : app.prcGetLastTenShowers( data ),
                                                                        selector : $('.dashboard-vals')
                                                                        });
                                                             
                                                             });
                                     
                                    });

            }
            
        } else if(numberOfAmphiros > 0 && numberOfMeters === 0) {
            //get the consumption and refresh dashboard
            trans.getConsumption(
                                consumption, //type of consumption
                                function(res){
                                 
                                 var data = app.prsGetConsumption(res);
                                 showdata = {
                                    text : app.getActiveDashboardChoiceText(),
                                    high : {
                                        value : (data.volume.value).toFixed(2).replace(".", ","),
                                        label : data.volume.label
                                    },
                                    mid : {
                                        value : (data.energy.value).toFixed(2).replace(".", ","),
                                        label : data.energy.label
                                    },
                                    low : {
                                        value : tm.secondsToMinutes(data.duration.value),
                                        label : 'min'
                                    }
                                 };
                                 
                                 trans.getLastTenShowers(
                                                         function(data){
                                                         
                                                         var hi = new dashboardGauge(showdata);
                                                         hi.render();
                                                         hi.setBudget();
                                                         hi.refreshComplications({
                                                                    active : app.user.settings.mydashenabled,
                                                                    data : app.prcGetLastTenShowers( data ),
                                                                    selector : $('.dashboard-vals')
                                                                    });
                                                         
                                                         }
                                                         );
                                }
                                );
            
        } else if(numberOfAmphiros === 0 && numberOfMeters > 0) {
            //only meter - get meter consumption
            trans.getMeterConsumption(
                                      consumption,
                                      function(res){
                                      var data = app.prsMeterConsumption(res,consumption);
                                      showdata = {
                                      text : app.getActiveDashboardChoiceText(),
                                      high : {
                                      value : data.volume.value,
                                      label : data.volume.label
                                      },
                                      mid : {
                                      value : '',
                                      label : ''
                                      },
                                      low : {
                                      value : '',
                                      label : ''
                                      }
                                      };
                                  
                                      
                                      var hi = new dashboardGauge(showdata);
                                      hi.render();
                                      hi.setBudget();
                                      hi.refreshComplications({
                                                 active : app.user.settings.mydashenabled,
                                                 data : data,
                                                 selector : $('.dashboard-vals')
                                                 });
                                      
                                      }
                                      );
        }
    
    },
    refreshAnalytics : function(){
        
        if(app.getMeterTypeCheckbox() == 1) {  //if type of device is amphiro
           
            app.showAmphiroOptions();
            
            trans.getAllDataForAmphiroWithId(
                                             {
                                             'limit': app.getLimitForShowers(),
                                             'deviceKey' : app.getcheckedDeviceid()
                                             },
                                             function(res){
                                                var newb1chart = new amphiroStats(
                                                                                  {
                                                                                  'data':res,
                                                                                  'limit' :app.getLimitForShowers()
                                                                                  }
                                                                                  );
                                                newb1chart.setTotalNumberShowerTab();
                                                newb1chart.setDataToGraph($('#placeholder2'));
                                                newb1chart.fillMembersFilter();
                                                newb1chart.appendEventsToList($('#amphiro_events'));
                                             });
            
        }else{ //type is meter
            
            app.showSmartMeterOptions();

            if(app.getMeterTabEnabled() === 0) {
                
                app.checkHiddenMeterOptions();

                trans.getAllDataForMeter(
                                       app.chosenStart,
                                       app.chosenEnd,
                                       app.getGranularityFromGraph(),
                                       function(dsa){
                                            trans.getForecastingForMeter(
                                                                       app.chosenStart,
                                                                       app.chosenEnd,
                                                                       function(ds){
                                                                         var mtstats = new meterStats(
                                                                                                      {
                                                                                                      'actual':dsa,
                                                                                                      'forecasted' : ds
                                                                                                      }
                                                                                                      );
                                                                         mtstats.setMeterTotalValue();
                                                                         mtstats.legendLinesStatus();
                                                                         mtstats.setMeterDataToGraph($('#placeholder2'),app.chosenStart);
                                                                         });
                                       });
                
            } else if(app.getMeterTabEnabled() === 2) {  //if breakdown is selected
               
                app.hideMeterTabCalendar();
                
                var prbr = new breakdownchart(app.user.personalEstimates);
                prbr.show();
                
            } else {
                
                if ($('.legend_lines_price').is(":hidden")) {
                    $('.legend_lines_price').show();
                }

                app.hideMeterTabCalendar();
                
                //app.setMeterDataToGraph($('#placeholder2'),moment().startOf('month').valueOf(),2,[],[]);

                trans.getAllDataForMeter(
                                       moment().startOf('month').valueOf(),
                                       moment().endOf('month').valueOf(),
                                       2,
                                      function(ds){
                                         
                                         var prbr = new pricebracket(
                                                                     {
                                                                     'placehodler' : $('#placeholder2'),
                                                                     'results' : app.processMeterData(ds)
                                                                     }
                                                                     );
                                         
                                         prbr.setPriceBracket();
                                       });
            }
        }
    },
    numberOfShowersChanged : function(obj,e){ //shower limits tab bar
        var last_n = obj.attr('id'),
            $showerLimit = $('.ShowerTab');
        
        keenAnalyticsModel.user.click.device[last_n] += 1;
        
        if( obj.index() == 3) return;
       
        $showerLimit.find('a.evtActive').removeClass('evtActive ');
        $showerLimit.find('a span.msgActive').removeClass(' msgActive');
        
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        e.preventDefault();
        
        trans.getAllDataForAmphiroWithId({
                                      'limit': app.getLimitForShowers(),
                                      'deviceKey' : app.getcheckedDeviceid()
                                      },
                                      function(res){
                                         var newb1chart = new amphiroStats(
                                                                           {
                                                                           'data':res,
                                                                           'limit' :app.getLimitForShowers()
                                                                           }
                                                                           );
                                         newb1chart.setTotalNumberShowerTab();
                                         newb1chart.setDataToGraph($('#placeholder2'));
                                         newb1chart.fillMembersFilter();
                                         newb1chart.appendEventsToList($('#amphiro_events'));
                                      });
    },
    showerTypeChanged : function(obj,e){ // shower type tab bar
        var type = obj.attr('id'),
            $showerType = $('.TypeTab');
        
        keenAnalyticsModel.user.click.device[type] += 1;
        
        $showerType.find('a.typeActive').removeClass('typeActive');
        
        obj.addClass('typeActive');
        
        e.preventDefault();
        
        trans.getAllDataForAmphiroWithId(
                                         {
                                         'limit': app.getLimitForShowers(),
                                         'deviceKey' : app.getcheckedDeviceid()
                                         },
                                         function(res){
                                            var newb1chart = new amphiroStats(
                                                                              {
                                                                              'data':res,
                                                                              'limit' :app.getLimitForShowers()
                                                                              }
                                                                              );
                                            newb1chart.setTotalNumberShowerTab();
                                            newb1chart.setDataToGraph($('#placeholder2'));
                                         });
    },
    meterTypeChanged : function(obj){
        var active = obj.index(),
            legendlines = $('.legend_lines'),
            legendlinesprice = $('.legend_lines_price'),
            nodata = $('.no_data'),
            timetab = $('.TimeTab'),
            calendar = $('.calendar'),
            metertypeactive = $('.MeterTypeTab a.meterActive'),
            placeholder2 = $('#placeholder2');
        
        metertypeactive.removeClass('meterActive');
        obj.addClass('meterActive');
        
        legendlines.hide();
        legendlinesprice.hide();
        
        if(active === 0) {
            
            app.checkHiddenMeterOptions();
            
            //app.setMeterDataToGraph(placeholder2,app.chosenStart,app.getGranularityFromGraph(),[],[]);
            
            trans.getAllDataForMeter(
                                   app.chosenStart,
                                   app.chosenEnd,
                                   app.getGranularityFromGraph(),
                                   function(dsa){
                                    trans.getForecastingForMeter(
                                                              app.chosenStart,
                                                              app.chosenEnd,
                                                              function(ds){
                                                                 var mtstats = new meterStats(
                                                                                              {
                                                                                              'actual':dsa,
                                                                                              'forecasted' : ds
                                                                                              }
                                                                                              );
                                                                 mtstats.setMeterTotalValue();
                                                                 mtstats.legendLinesStatus();
                                                                 mtstats.setMeterDataToGraph(placeholder2,app.chosenStart);
                                                              });
                                   });
        } else if(active == 1) {
            
            if (nodata.is(":visible")){
                nodata.hide();
                placeholder2.show();
            }
            
            timetab.hide();
            calendar.hide();
            
            legendlines.hide();
            legendlinesprice.show();
            
            //app.setMeterDataToGraph(placeholder2,moment().startOf('month').valueOf(),2,[],[]);
            
            trans.getAllDataForMeter(
                                   moment().startOf('month').valueOf(),
                                   moment().endOf('month').valueOf(),
                                   2,
                                   function(ds){
                                     
                                        var prbr = new pricebracket(
                                                                    {
                                                                    'placehodler' : $('#placeholder2'),
                                                                    'results' : app.processMeterData(ds)
                                                                    }
                                                                    );
                                  
                                        prbr.setPriceBracket();
                                  
                                   });
        } else if(active == 2) {
            
            if (nodata.is(":visible")){
                nodata.hide();
                placeholder2.show();
            }
            
            timetab.hide();
            calendar.hide();
            
            legendlines.hide();
            legendlinesprice.hide();
            
            app.emptyMeterListEvents();
            
            var prbr = new breakdownchart(app.user.personalEstimates);
            prbr.show();
            
        }
    },
    meterTimeTabChanged : function(obj,e){ // meter tab bar
        var tp = obj.attr('id'),
            active = obj.index();
        
        keenAnalyticsModel.user.click.meter[tp] += 1;
        
        if(active == 4) return false;
        
        var $timeTabBar = $('.TimeTab');
        
        $timeTabBar.find('a.evtActive').removeClass('evtActive');
        $timeTabBar.find('span.msgActive').removeClass(' msgActive');
        
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        var dates = tm.getNewGraphDates(active),
            newformat = tm.getDateFormat(dates.start,dates.end);
        
        app.chosenStart = dates.start;
        app.chosenEnd = dates.end;
        
        e.preventDefault();
        
        trans.getAllDataForMeter(
                                dates.start,
                                dates.end,
                                active,
                                function(dsa){
                                trans.getForecastingForMeter(
                                                           app.chosenStart,
                                                           app.chosenEnd,
                                                           function(ds){
                                                             var mtstats = new meterStats(
                                                                                          {
                                                                                          'actual':dsa,
                                                                                          'forecasted' : ds
                                                                                          }
                                                                                          );
                                                             mtstats.setMeterTotalValue();
                                                             mtstats.legendLinesStatus();
                                                             mtstats.setMeterDataToGraph($('#placeholder2'),app.chosenStart);
                                                             
                                                             app.calendarNextArrowsStatus(active,dates.start);
                                                             app.setDayFormatTo($('#ThisDay'),newformat);
                                                             
                                                           });
                                });
    },
    swipeRight : function(e){
        var active = $('.fullScreenTimeTab a.evtActive').index(),
            typeSelected = app.getMeterTypeCheckbox();
        if (typeSelected == 1) return;
        
        var dates = tm.getPastDates(active,app.temp_1,app.temp_2),
            newformat = tm.getDateFormat(dates.start,dates.end);
        
        app.temp_1 = dates.start;
        app.temp_2 = dates.end;
        e.preventDefault();
        
        trans.getAllDataForMeter(
                                dates.start,
                                dates.end,
                                active,
                                function(dsa){
                                trans.getForecastingForMeter(
                                                           app.temp_1,
                                                           app.temp_2,
                                                           function(ds){
                                                             var mtstats = new meterStats(
                                                                                          {
                                                                                          'actual':dsa,
                                                                                          'forecasted' : ds
                                                                                          }
                                                                                          );
                                                             mtstats.setMeterTotalValue();
                                                             mtstats.legendLinesStatus();
                                                             mtstats.setMeterDataToGraph($('#fullScreen_chart'),app.temp_1);
                                                             
                                                             app.setDayFormatTo($('#devicesFullChart'),newformat);

                                                           });
                                });
    },
    swipeLeft : function(e){
        var active = $('.fullScreenTimeTab a.evtActive').index(),
            typeSelected = this.getMeterTypeCheckbox();
        if(typeSelected == 1) return;
        
        var dates = tm.getNextDates(active,app.temp_1,app.temp_2),
            newformat = tm.getDateFormat(dates.start,dates.end);
        
        app.temp_1 = dates.start;
        app.temp_2 = dates.end;
        
        e.preventDefault();
        
        trans.getAllDataForMeter(dates.start,
                                dates.end,
                                active,
                                function(dsa){
                                trans.getForecastingForMeter(
                                                           app.temp_1,
                                                           app.temp_2,
                                                           function(ds){
                                                             var mtstats = new meterStats(
                                                                                          {
                                                                                          'actual':dsa,
                                                                                          'forecasted' : ds
                                                                                          }
                                                                                          );
                                                             mtstats.setMeterTotalValue();
                                                             mtstats.legendLinesStatus();
                                                             mtstats.setMeterDataToGraph($('#fullScreen_chart'),app.temp_1);
                                                             
                                                             app.setDayFormatTo($('#devicesFullChart'),newformat);
                                                          
                                                           });
                                });
    },
    nextMeterTime : function(){
        var active = $('.TimeTab a.evtActive').index(),
            dates = tm.getNextDates(active,app.chosenStart,app.chosenEnd),
            newformat = tm.getDateFormat(dates.start,dates.end);
        
        app.chosenStart = dates.start;
        app.chosenEnd = dates.end;
        
        trans.getAllDataForMeter(
                                dates.start,
                                dates.end,
                                app.getGranularityFromGraph(),
                                function(dsa){
                                trans.getForecastingForMeter(
                                                           app.chosenStart,
                                                           app.chosenEnd,
                                                           function(ds){
                                                             var mtstats = new meterStats(
                                                                                          {'actual':dsa ,'forecasted' : ds}
                                                                                          );
                                                             mtstats.setMeterTotalValue();
                                                             mtstats.legendLinesStatus();
                                                             mtstats.setMeterDataToGraph($('#placeholder2'),app.chosenStart);
                                                             
                                                             app.calendarNextArrowsStatus(active,dates.start);
                                                             app.setDayFormatTo($('#ThisDay'),newformat);
                                                             
                                                           });
                                });
    },
    previousMeterTime : function(){
        var active = $('.TimeTab a.evtActive').index(),
            forwardArrow = $('#goforward'),
            dates = tm.getPastDates(active,app.chosenStart,app.chosenEnd),
            newformat = tm.getDateFormat(dates.start,dates.end);
        
        forwardArrow.removeAttr('disabled');
        
        app.chosenStart = dates.start;
        app.chosenEnd = dates.end;
        
        trans.getAllDataForMeter(
                                dates.start,
                                dates.end,
                                active,
                                function(dsa){
                                trans.getForecastingForMeter(
                                                           app.chosenStart,
                                                           app.chosenEnd,
                                                           function(ds){
                                                             var mtstats = new meterStats(
                                                                                          {'actual':dsa ,'forecasted' : ds}
                                                                                          );
                                                             mtstats.setMeterTotalValue();
                                                             mtstats.legendLinesStatus();
                                                             mtstats.setMeterDataToGraph($('#placeholder2'),app.chosenStart);
                                                             
                                                             app.setDayFormatTo( $('#ThisDay'),newformat);
                                                            
                                                           });
                                });
    },
    setFullScreenChartValues : function(){
        if( app.getMeterTypeCheckbox() == 1) {
                        
            trans.getAllDataForAmphiroWithId(
                                             {
                                             'limit': 10000,
                                             'deviceKey' : app.getcheckedDeviceid()
                                             },
                                             function(res){
                                                var newb1chart = new amphiroStats(
                                                                                  {
                                                                                  'data':res,
                                                                                  'limit' :10000
                                                                                  }
                                                                                  );
                                                newb1chart.setDataToGraph($('#fullScreen_chart'));
                                             });
        } else {
            app.temp_1 = app.chosenStart;
            app.temp_2 = app.chosenEnd;
            trans.getAllDataForMeter(
                                     app.temp_1,
                                     app.temp_2 ,
                                     app.getGranularityFromGraph(),
                                     function(dsa){
                                     trans.getForecastingForMeter(
                                                                  app.temp_1,
                                                                  app.temp_2,
                                                                  function(ds){
                                                                  var mtstats = new meterStats(
                                                                                               {'actual':dsa ,'forecasted' : ds}
                                                                                               );
                                                                  mtstats.setMeterTotalValue();
                                                                  mtstats.legendLinesStatus();
                                                                  mtstats.setMeterDataToGraph($('#fullScreen_chart'),app.temp_1);
                                                                  });
                                     });
        }
    },
    fullScreenShowerTab : function(obj,e){
        var limit,
            index = obj.index(),
            $screenTabLimit = $('.fullScreenShowerTab');
        
        $screenTabLimit.find('a.evtActive').removeClass('evtActive ');
        $screenTabLimit.find('span.msgActive').removeClass(' msgActive');
        
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        if(index == 0) {
            limit = 10;
        } else if(index == 1) {
            limit = 20;
        } else if(index == 2) {
            limit = 50;
        } else {
            limit = 10000;
        }
        
        e.preventDefault();
        
        trans.getAllDataForAmphiroWithId(
                                         {
                                         'limit': limit,
                                         'deviceKey' : app.getcheckedDeviceid()
                                         },
                                         function(res){
                                            var newb1chart = new amphiroStats(
                                                                              {
                                                                              'data':res,
                                                                              'limit' :limit
                                                                              }
                                                                              );
                                            newb1chart.setDataToGraph($('#fullScreen_chart'));
                                         });
    },
    fullScreenTimeTab : function(obj,e){
        e.preventDefault();
        var granu = obj.index(),
            $screenTimeLimit = $('.fullScreenTimeTab');
        
        $screenTimeLimit.find('a.evtActive').removeClass('evtActive ');
        $screenTimeLimit.find('span.msgActive').removeClass(' msgActive');
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        if(granu == 0) {
            app.temp_1 = moment().startOf('day').valueOf();
            app.temp_2 = moment().endOf('day').valueOf();
        } else if(granu == 1) {
            app.temp_1 = moment().startOf('isoweek').valueOf();
            app.temp_2 = moment().endOf('isoweek').valueOf();
        } else if(granu == 2) {
            app.temp_1 = moment().startOf('month').valueOf();
            app.temp_2 = moment().endOf('month').valueOf();
        } else {
            app.temp_1 = moment().startOf('year').valueOf();
            app.temp_2 = moment().endOf('year').valueOf();
        }
        
        var newformat = tm.getDateFormat( app.temp_1, app.temp_2 );
        
        trans.getAllDataForMeter(
                                 app.temp_1,
                                 app.temp_2,
                                 granu,
                                 function(dsa){
                                 trans.getForecastingForMeter(
                                                              app.temp_1,
                                                              app.temp_2,
                                                              function(ds){
                                                              var mtstats = new meterStats(
                                                                                           {'actual':dsa ,'forecasted' : ds}
                                                                                           );
                                                              mtstats.setMeterTotalValue();
                                                              mtstats.legendLinesStatus();
                                                              mtstats.setMeterDataToGraph($('#fullScreen_chart'),app.temp_1);
                                                              
                                                              app.setDayFormatTo( $('#devicesFullChart') , newformat);
                                                              });
                                 });
    },
    touches : {
        "touchstart": {"x":-1, "y":-1},
        "touchmove" : {"x":-1, "y":-1},
        "touchend"  : false,
        "direction" : "undetermined"
    },
    touchFullScreenChart : function(event){
        var touch;
        touch = event.originalEvent.touches[0];
        switch (event.type) {
            case 'touchstart':
                app.touches.touchstart.x = touch.pageX;
                app.touches.touchstart.y = touch.pageY;
                break;
            case 'touchmove':
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                app.touches.touchmove.x = touch.pageX;
                app.touches.touchmove.y = touch.pageY;
                break;
            case 'touchend':
                touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                app.touches[event.type] = true;
                if (app.touches.touchstart.x > -1 && app.touches.touchmove.x > -1) {
                    app.touches.direction = app.touches.touchstart.x < app.touches.touchmove.x ? "right" : "left";
                    if(app.touches.direction == 'right'){
                        app.swipeRight(event);
                    }else{
                        app.swipeLeft(event);
                    }
                }
                break;
            default:
                break;
        }
    },
    onClickComplications : function(obj,e){
        if(!obj.find('a').hasClass('moveToConsumption')) return;
        app.changeToPage('#consumption');
        var pos = obj.find('a').attr('id');
        var $showerLimit = $('.ShowerTab');
        var $showerType = $('.TypeTab');
        $showerLimit.find('a.evtActive').removeClass('evtActive ');
        $showerLimit.find('span.msgActive').removeClass(' msgActive');
        $showerLimit.find('a:eq(0)').addClass('evtActive');
        $showerLimit.find('a:eq(0)').find('span').addClass('msgActive');
        $showerType.find('a.typeActive').removeClass('typeActive');
        $showerType.find('a:eq('+pos+')').addClass('typeActive');
        
        trans.getAllDataForAmphiroWithId({'limit': 10,'deviceKey' : app.getcheckedDeviceid()},
                                         function(res){
                                         var newb1chart = new amphiroStats(
                                                                           {
                                                                           'data':res,
                                                                           'limit' :app.getLimitForShowers()
                                                                           }
                                                                           );
                                         newb1chart.setDataToGraph($('#placeholder2'));
                                         newb1chart.fillMembersFilter();
                                         newb1chart.appendEventsToList($('#amphiro_events'));
                                         });
        e.preventDefault();
    },
    
    checkNoDataDiv : function(selector,length1){
        
        var $nodata = $('.no_data');
        
        if ( $nodata.is(':visible') ) {
            $nodata.hide();
            selector.show();
        }
        
        if( length1 === 0 ) {
            selector.hide();
            $nodata.show();
        }
        
    },
    metricLocalemeter : function(data){
        var mt = this.getAppDataUnit(),
            new_data = $.extend( {} , data ),
            newVolumeData;
        
        if( parseInt(mt) === 1 ) {
            newVolumeData = app.getVolumeValueLabel(data.volume);
            new_data.volume = {
                value: app.litres2gal(newVolumeData.value),
                label: newVolumeData.label
            };
        } else {
            newVolumeData = app.getVolumeValueLabel(data.volume);
            new_data.volume = {
                value: parseInt( newVolumeData.value ,10),
                label: newVolumeData.label
            };
        }
        
        return new_data;
        
    },
    tempLocale : function(tp){
        var mt = this.getAppDataUnit();
        if(parseInt(mt) === 1){
            tp.temp = {
                value: app.cel2far(tp.temp),
                label: 'F'
            };
        }else{
            tp.temp = {
                value: tp.temp,
                label: '°C'
            };
        }
        
        return tp;
        
    },
    volumeTempLocale : function(data){
        var mt = this.getAppDataUnit();
        if(parseInt(mt) === 1){
            
            data.volume = {
            value: app.litres2gal(data.volume),
            label: 'gl'
            };
            
            data.temp = {
            value: app.cel2far(data.temp),
            label: 'F'
            };
            
        } else {
            
            data.volume = {
            value: data.volume,
            label: 'lt'
            };
            
            data.temp = {
            value: data.temp,
            label: '°C'
            };
            
        }
        
        if(data.energy){
            var ene = app.getEnergyValueLabel(data.energy);
            data.energy = {};
            data.energy.value = ene.value;
            data.energy.label = ene.label;
        }
        
        return data;
    },
    metricLocale : function(data){
        var mt = this.getAppDataUnit(),
        newEnergyData,
        newVolumeData,
        new_data = $.extend( {} , data );
        
        if(parseInt(mt) === 1){
            new_data.duration = {
                value : data.duration ,
                label : 'sec'
            };
            new_data.volume = {
            value: app.litres2gal(data.volume),
            label: 'gl'
            };
            new_data.avg_vol = {
            value: app.litres2gal(data.avg_vol),
            label: 'gl'
            };
            new_data.temp = {
            value: app.cel2far(data.temp),
            label: 'F'
            };
            new_data.flow = {
            value: app.litres2gal(data.flow),
            label: 'gl/m'
            };
            new_data.cost = {
            value: 0.21,
            label: '£'
            };
            
            new_data.energy ={};
            
            newEnergyData = app.getEnergyValueLabel(data.energy);
            
            newVolumeData = app.getVolumeValueLabel(new_data.volume.value);
            
            new_data.volume.value = newVolumeData.value;
            
            new_data.volume.label = newVolumeData.label;
            
            new_data.energy.value = newEnergyData.value;
            
            new_data.energy.label = newEnergyData.label;
            
        } else {
            
            new_data.volume = {
            value: data.volume,
            label: 'lt'
            };
            new_data.avg_vol = {
            value: data.avg_vol,
            label: 'lt'
            };
            new_data.temp = {
            value: data.temp,
            label: '°C'
            };
            new_data.flow = {
            value: parseFloat(data.flow).toFixed(2)/1,
            label: 'l/m'
            };
            new_data.cost = {
            value: 0.16,
            label: '€'
            };
            new_data.duration = {
                value :  data.duration ,
                label : 'sec'
            };
            
            new_data.energy ={};
            
            newEnergyData = app.getEnergyValueLabel(data.energy);
            
            newVolumeData = app.getVolumeValueLabel( new_data.volume.value );
            
            new_data.volume.value = parseFloat(newVolumeData.value).toFixed(2)/1;
            
            new_data.volume.label = newVolumeData.label;
            
            new_data.energy.value = parseFloat(newEnergyData.value).toFixed(2)/1;
            
            new_data.energy.label = newEnergyData.label;
            
        }
        
        return new_data;
    },
    uploadData : function(){
        
        prepareSessions = function(options,callback){
            
            trans.getSessionsForDeviceKey(
                                          options.devkey,
                                          function(results){
                                          
                                          var DataObj = {
                                            deviceKey:options.devkey,
                                            sessions:[],
                                            measurements:[],
                                            type:"AMPHIRO"
                                          };
                                          
                                          for (var i=0; i<results.rows.length; i++){
                                          
                                          DataObj.sessions.push(
                                                                {
                                                                id:results.rows.item(i).indexs,
                                                                timestamp:results.rows.item(i).date,
                                                                duration:results.rows.item(i).dur,
                                                                history:results.rows.item(i).his,
                                                                temperature:results.rows.item(i).temp,
                                                                volume:results.rows.item(i).volume,
                                                                energy:results.rows.item(i).energy,
                                                                flow:results.rows.item(i).flow,
                                                                properties:[
                                                                            {
                                                                            "key":"settings.os",
                                                                            "value":app.getSystemPlatform()
                                                                            }
                                                                            ]
                                                                }
                                                                );
                                          } //FOR
                                          callback(DataObj);
                                          
                                          }
                                          );
        };
        
        prepareMeasurements = function(DataObj,callback){
            
            trans.getMeasurementsForDeviceKey(
                                              devupdate,
                                              DataObj.deviceKey,
                                              function(results){
                                               
                                               for (var i=0; i<results.rows.length; i++){
                                               
                                                DataObj.measurements.push(
                                                                          {
                                                                          sessionId:results.rows.item(i).indexs,
                                                                          index:i,
                                                                          history:false,
                                                                          timestamp:results.rows.item(i).cdate,
                                                                          temperature:results.rows.item(i).temp,
                                                                          volume:results.rows.item(i).volume,
                                                                          energy:results.rows.item(i).energy
                                                                          }
                                                                          );
                                               }
                                               
                                               callback(DataObj);
                                               
                                              }
                                              );
            
        };
        
        var devupdate;
        
        $.each(app.user.profile.devices, function(){
               
               if(!JSON.parse(app.getAmphiroUpdateDate()) ) {
                devupdate = new Date(2016,0,1).getTime();
               } else {
                devupdate = JSON.parse( app.getAmphiroUpdateDate() );
               }
               
               if(this.type == 'AMPHIRO') {
               
               prepareSessions(
                               {
                               mac:this.macAddress,
                               devkey:this.deviceKey
                               },
                               function(DataObj){
                                prepareMeasurements(
                                                    DataObj,
                                                    function(input){
                                                        app.uploaddata(input);
                                                    }
                                                    );
                               }
                               );
               } // end if
               }); //ecah end
        
    },
    requestSpecificMeterData : function(from,to){
        
        var keys = app.getDevKeys();
        
        if(keys.meter.length>0) {
            app.meterhistory(keys.meter,from,to,0);
        }
        
    },
    updateMeterData : function(){
        //fuction from event pub/sub
        var updateTime = JSON.parse(app.getMeterUpdateTime()),
            maxDefault = moment().valueOf(),
            keys = app.getDevKeys(),
            minDefault;
        
        if (updateTime) {
            minDefault = updateTime;
        } else {
            minDefault = moment().subtract(1,'month').valueOf();
           
            if(app.countMeters() > 0 ) app.requestMoreMeterData();
        }
        
        if(keys.meter.length>0) {
            app.meterhistory(keys.meter,minDefault,maxDefault,0);
        }
    },
    updateAmphiroData : function(){
        
        var keys = app.getDevKeys();
        
        if(keys.amphiro.length > 0) {
            app.amphirosessions(keys.amphiro,0,10000);
        } else {
            var set = new refreshApplicationManager();
            set.ready();
        }
        
    },
    requestMoreMeterData : function(){
        
        var request = function(min,max) {
            
            app.meterhistory(keys.meter,min,max,0);
            
            setTimeout(function() {
                       if (counter <= diff) {
                       counter++;
                       var newmax = min;
                       var newmin = moment().subtract(counter+1,'month').valueOf();
                       request(newmin,newmax);
                       }
                       },6000);
        };
        
        var importDate = app.getMeterImportDate(),
            keys = app.getDevKeys(),
            maxDefault = moment().subtract(1,'month').valueOf(),
            minDefault = moment().subtract(2,'month').valueOf(),
            diff = app.getMonthDiff( importDate , maxDefault),
            counter = 1;
        
        request(minDefault,maxDefault);
    },
    getMeterImportDate : function(){
        
        var type_meter = getObjects(app.user.profile.devices, 'type', 'METER'),
            import_date = type_meter[0].registeredOn;
        
        return import_date;
        
    },
    getDevKeys : function(){
        
        var meter_keys = [],
            amphiro_keys = [];
        
        $.each(app.user.profile.devices,function(){
               if(this.type == 'METER') {
                meter_keys.push(this.deviceKey);
               } else {
                amphiro_keys.push(this.deviceKey);
               }
               });
        
        return {
            meter : meter_keys,
            amphiro : amphiro_keys
        };
        
    },
    getMonthDiff : function(min,max){
        return Math.round(moment(max).diff(moment(min), 'months', true));
    },
    getMobileMode : function(){

        alert('mode : '  + app.user.profile.mode);
        
        var mode = app.getModeFromLocalStorage(),
            server_mode = app.user.profile.mode;
        
        if(!server_mode) server_mode = 222; //logout
        if(!mode) mode = server_mode; //set server mode
        if(mode === 0) mode = 1; //0 mode = 1 mode
        if( server_mode != mode && app.user.session && mode != 222 ) { //different mobile and server modes. keep mobile's mode and wait handshake
            return mode;
        }
        
        mode = app.user.profile.mode;
                
        if( mode == 3 && ( app.countAmphiro() === 0 && app.countMeters() === 0 ) ){ mode = 10;
        } else if(mode == 3 && ( app.countAmphiro() === 0 && app.countMeters() > 0 ) ){ mode = 0;
        } else if(mode == 1 &&  (app.countAmphiro() === 0 && app.countMeters() === 0) ){ mode = 10;
        } else if(mode == 3 && ( app.countAmphiro() > 0  ||  app.countMeters() > 0 ) ){ mode = 3;
        } else if(mode == 1 && ( app.countAmphiro() > 0  ||  app.countMeters() === 0 ) ){ mode = 1;
        } else if(mode == 1 && ( app.countAmphiro() > 0  ||  app.countMeters() > 0 ) ){ mode = 1;
        } else if(mode == 1 && ( app.countAmphiro() === 0  ||  app.countMeters() > 0 ) ){ mode = 1;
        }
        
        //user logout
        if(!app.user.session){ mode = 222; }
        
        app.setModeToLocalStorage(mode);
        
        return mode;
        
    },
    renderMobileHome : function(){
        //var mode = this.getModeFromLocalStorage();
        var mode = app.getMobileMode();
        
        if(mode == 0 || mode == 1) {
         this.changeToPage('#' + app.getActivePage() );
        } else if(mode == 2) {
         this.changeToPage('#MobileOff_b1On');
        } else if(mode == 3) {
         this.changeToPage('#LearningMode');
        } else if(mode == 4) {
         this.changeToPage('#killSwitch');
        } else if(mode == 5) {
         this.changeToPage('#AllOn');
        } else if(mode == 10) {
         this.changeToPage('#install_part_1');
        } else {
         this.changeToPage('#initialize');
        }
    },
    
    setDayFormatTo : function(selector,date){
        selector.text(date);
    },
    setMultileMeterControls : function(){
        
        var numberOfAmphiros = this.countAmphiro(),
            numberOfMeters =  this.countMeters();
        
        if(numberOfAmphiros > 0 && numberOfMeters > 0) { //both b1  + meter
            
            this.setAnalyticsControlsBothMeters();
            
            this.setDevicesToMainControl($('.devtab'),numberOfAmphiros,numberOfMeters);
            
            this.setCssForAmphiroControl(numberOfAmphiros + numberOfMeters);
            
            this.setConfigureViewOptions();
        
        } else if(numberOfAmphiros > 0 && numberOfMeters === 0) {  //only amphiro
        
            this.setAnalyticsControlsOnlyAmphiro();
            //this.setAmphiroDevicesToMainControl(numberOfAmphiros);
            this.setDevicesToMainControl($('.devtab'),numberOfAmphiros,numberOfMeters);
            this.setCssForAmphiroControl(numberOfAmphiros);
            this.setConfigureAmphiroViewOptions();
        } else if(numberOfAmphiros === 0 && numberOfMeters > 0) {   //only meter
        
            this.setAnalyticsControlsOnlyMeter();
            //this.setMeterDeviceTomainControl();
            this.setDevicesToMainControl($('.devtab'),numberOfAmphiros,numberOfMeters);
            this.setConfigureMeterViewOptions();
        
        }
        
        $('input[name="mydevs"]:radio:eq(0)').attr( 'checked', true ); //remove from here
        
    },
    getLimitForShowers : function(){
        
        var limit,
            index = $('.ShowerTab a.evtActive').index();
        
        if(index === 0) {
         limit = 10;
        } else if(index === 1) {
         limit = 20;
        } else {
         limit = 50;
        }
        
        return limit;
        
    },
    getActiveDashboardChoiceText : function(){
        return $('input[name="my-checkbox"]:checked').closest('label').find('.item-title').text();
    },
    getMeterTypeCheckbox : function(){
        return $('input[name=mydevs]:checked', '.devtab').attr('id');
    },
    getMeterTabEnabled : function(){
        return $('.MeterTypeTab a.meterActive').index();
    },
    getcheckedDeviceid : function(){
        return $('input[name=mydevs]:checked', '.devtab').val();
    },
    getcheckedDeviceName : function(){
        return $('.devtab input[name=mydevs]:checked').closest('label').find('p').text();
    },
    getActiveMetric : function(){
        return $('.TypeTab a.typeActive').index();
    },
    checkHiddenMeterOptions : function() {
        
        var timetab = $('.TimeTab'),
            calendari = $('.calendar');
        
        if(timetab.is(':hidden')) {
            timetab.show();
        }
        if(calendari.is(':hidden')) {
            calendari.show();
        }
        
    },
    hideMeterTabCalendar : function(){
        
        var timetab = $('.TimeTab'),
            calendari = $('.calendar');
        
        timetab.hide();
        calendari.hide();
        
    },
    enableViewContents : function(){
        AppModel.mode = 1;
        $('.connectivity').hide();
        $('.connectivity_status').hide();
        $('.loadMoreMessages').removeAttr('disabled');
        $('#loginbutton').removeAttr('disabled');
        $('#startSignUp').removeAttr('disabled');
    },
    disableViewContents : function(){
        AppModel.mode = 0;
        
        $('.connectivity').show();
        
        $('.connectivity_status').show();
        
       /* var cm = new component();
        
        $('#dashboard_swiper').empty().html(
                                    cm.swiper(
                                              '<img src="img/SVG/warning.svg" >',
                                              $('#dashboard').find('.connectivity_status p').text()
                                              )
                                    ); */
        
        $('.loadMoreMessages').attr('disabled',true);
        
        $('#loginbutton').attr('disabled',true);
        
        $('#startSignUp').attr('disabled',true);
        
    },
    enableBluetoothView : function(){
        $('.ble_next_button').removeAttr('disabled');
        $('#ble_on').show();
        $('#ble_off').hide();
        if( app.getSystemPlatform() === 'ios') {
            $('#ble_msg').hide();
        } else {
            $('#ble_msg_android').hide();
        }
    },
    disableBluetoothView : function(){
        $('.ble_next_button').attr('disabled',true);
        $('#ble_off').show();
        $('#ble_on').hide();
        if( app.getSystemPlatform() === 'ios') {
            $('#ble_msg').show();
        } else {
            $('#ble_msg_android').show();
        }
    },
    appLabels : null,
    getImperialUnits : function(){
        this.appLabels.volume.long = 'Gallons';
        this.appLabels.volume.short = 'gl';
        this.appLabels.flow.long = 'Gallons/Minutes';
        this.appLabels.flow.short = 'gl/mins';
        this.appLabels.temperature.name = 'Temperature';
        this.appLabels.temperature.long = 'Fahrenheit';
        this.appLabels.temperature.short = 'F';
    },
    getMetricsUnits : function(){
        this.appLabels.volume.long = 'Liters';
        this.appLabels.volume.short = 'lt';
        this.appLabels.flow.long = 'Liters/Minutes';
        this.appLabels.flow.short = 'lt/min';
        this.appLabels.temperature.name = 'Temperature';
        this.appLabels.temperature.long = 'Celsius';
        this.appLabels.temperature.short = 'ºC';
    },
    setAppUnit : function(){
        //get application unit from storage
        var sytem_unit = this.getAppDataUnit();
    
        //if different then apply the newest
        if(app.user.settings.unit != JSON.parse(sytem_unit)) {
            //set the unit
            app.setAppDataUnit(app.user.settings.unit);
            //assign back the unit
            sytem_unit = app.user.settings.unit;
        }
        
        //if unit does not exist - set unit based the country
        if(!JSON.parse(sytem_unit)) {
            if( app.getUserCountry() == 'United Kingdom' ) {
                app.setAppDataUnit(1);
                if(app.user.settings.unit != JSON.parse(sytem_unit)) {
                    app.setAppDataUnit(app.user.settings.unit);
                }
            } else {
                app.setAppDataUnit(0);
            }
        }
    },
    getMetrics : function(){
        
        var mt = this.getAppDataUnit();
        
        if(parseInt(mt) === 1) {
            
            
            app.getImperialUnits();
        
        } else if(parseInt(mt) === 0) {
        
            app.getMetricsUnits();
       
        }
        
    },
    checkErrorStatus : function(status){
                
        var regg = new NotificationManager();

        if(status === 'timeout') {
            regg.serverMessage();
        } else {
            regg.ConnectionMessage();
        }
        
    },
    getNotifyCountry : function(){
        
        var lect;
        
        if( app.getUserCountry() == 'Spain' ) {
            lect = 'spanish';
        } else {
            lect = 'english';
        }
        
        return lect;
        
    },
    passwordChangedMessage : function(){
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].pass_changed);
        
    },
    pinMismatch: function() {
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].invalid_pin);
        
    },
    pinAlreadyUsed: function() {
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].pin_used);
        
    },
    amphiroInstallationFailed: function() {
        
        app.hideLoadingSpinner($('#startPairing'));
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].pair);
        
    },
    amphiroPairingFailed: function() {
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].device_exists);
        
    },
    loginFail : function(){
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].login_error);
        
    },
    registerFailed : function(){
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].error_registration);
        
    },
    connectionFailed : function(){
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].network_error);
        
    },
    serverNotResponding : function(){
        
        app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].server_not_responding);
        
    },
    showNativeAlert : function(msg){
        navigator.notification.alert(
                                     msg,  // message
                                     function(){},         // callback
                                     'DAIAD',            // title
                                     'OK'                  // buttonName
                                     );
    },
    keepResumeTimeAnalytics : function(){
        //get the start time
        keenAnalyticsModel.user.app.application.start = moment().valueOf();
    },
    sendTimeAnalytics : function(){
        //for "pause" event. Send application start/stop time events to keen io.
        keenAnalyticsModel.user.app.application.stop = moment().valueOf();
        
        keenAnalyticsModel.user.app.application.app_version = "1.6.0(1.2)";
        
        keenAnalyticsModel.user.app.application.deviceInfo = JSON.stringify(device);
        
        if(typeof keenClient != "undefined") {
            keenAnalyticsModel.user.app.application.duration = parseInt(( keenAnalyticsModel.user.app.application.stop -  keenAnalyticsModel.user.app.application.start) / 1000);
            keenClient.recordEvent(keenAnalyticsModel.user.email, keenAnalyticsModel.user.app);
        }
    },
    forecastingDataDone : function(total){
    
        if(total.data.success) {
            
            trans.insertForecastingData(total.data);
            
        }
        
    },
    amphiroSessionsDone : function(total){
    
        var data = total.data;
        
        if(data.success) {
            if(data.devices.length === 0){
                return;
            }
            
            trans.insertAmphiroData(data);
        }
        
    },
    meterHistoryDone : function(total){
        
        var data = total.data;
        
        if(data.success)  {
            
            if(data.series.length === 0) { return; }
            
            if(data.series[0]) {
                if ( data.series[0].values.length === 0 ) { return; }
            }
            
            trans.insertSmartWaterMeterData(data);
            
            app.setMeterUpdateTime(new Date().getTime());
            
        }
        
    },
    measargs : null,
    amphiroMeasurementsDone : function(total){
    
        var fetched = total.data;
        
        var args = app.measargs;
        
        if(app.tempSelectorDetailed)
            app.hideLoadingSpinner(app.tempSelectorDetailed);
                
        if(fetched.success){
            if(!fetched.session){
                return;
            }
            
            if(fetched.session.measurements.length <= 1){
                
                app.showHistoryDiv();
                
                var thaday  = moment(fetched.session.timestamp).format('YYYY-MM-DD');
                
                $('#showerDate').val(thaday);
                
                $('.history p:eq(2)').hide();
                
                $('.history p:eq(3)').show();
                
            }else{
                
                app.showRealDiv();
                
                var piece = [],
                Measurement = daiad.model.Measurement;
                
                app.events.flow = [];
                app.events.temp = [];
                
                if(fetched.session.measurements.length === 0) {
                    piece.push(fetched.session);
                } else {
                    piece = fetched.session.measurements;
                }
                
                for(var i=0; i<piece.length; i++){
                    var tempvol = app.volumeTempLocale(
                                                       {
                                                       'volume' : piece[i].volume ,
                                                       'temp' : piece[i].temperature
                                                       }
                                                       );
                    
                    app.events.flow.push(new Measurement(i, new Date(piece[i].timestamp), tempvol.volume.value));
                    
                    app.events.temp.push(new Measurement(i, new Date(piece[i].timestamp),tempvol.temp.value));
                    
                }
                
            }
            
            var transformed = app.volumeTempLocale(
                                                   {
                                                   'volume':fetched.session.volume,
                                                   'temp':fetched.session.temperature,
                                                   'energy' : fetched.session.energy
                                                   }
                                                   );
            
            $('#eventDate').text( tm.fullDateTime(fetched.session.timestamp) );
            
            app.updateDetailedEventPhoto( $('#DataMemberPhoto') , args.memberInfo.photo );
            
            app.updateDetailedEventName( $('#DataMemberName') , args.memberInfo.name);
            
            app.setMembersNameCss(args.memberInfo.name , $('#DataMemberName') );
            
            app.setEfficiencyImg($('#showerEfficiency'),fetched.session.energy);
            
            app.setMembersSelect(args.showerId,args.deviceId,args.memberId);
            
            $('#thisYearCity').attr('data-keys',JSON.stringify(transformed));
            
            app.setShowerProjections(transformed);
            
            app.setProjections(1,transformed);
            
            app.setNavigationBackButton();
            app.changeToPage('#real2');
            
        } else {
            app.hideSpinner();
        }
        
    },
    amphiroMeasurementsFail : function(total){
        app.hideLoadingSpinner(app.tempSelectorDetailed);
        app.checkErrorStatus(total.data.status);
    },
    amphiroMeasurementsAlways : function(){
        app.hideLoadingSpinner(app.tempSelectorDetailed);
    },
    socialDataDone : function(total){
        
        var data = total.data;
        
        var called = total.calleddata;
        
        if(data.success) {
            
            if(data.comparison){
                
                var arrDay = data.comparison.dailyConsumtpion,
                    arrMonth = data.comparison.monthlyConsumtpion,
                    arrIq = data.comparison.waterIq,
                    tmp;
                
                app.user.profile.comparison = {};
                
                app.user.profile.comparison.monthlyConsumtpion = arrMonth;
                
                app.user.profile.comparison.waterIq = arrIq;
                
                app.user.profile.comparison.dailyConsumtpion = arrDay.slice(  arrDay.length - 30 , arrDay.length );
                
                (moment().date() >=1 && moment().date() < 2) ? tmp = moment(called.timestamp).subtract(2,'month').valueOf() : tmp = moment(called.timestamp).subtract(1,'month').valueOf();
                
                app.setlastComparisonSync(tmp);
                
                app.setComparisoData(tmp);
                
                trans.insertComparisonData(arrMonth,arrDay,arrIq);
                
            } //first if
        
        }
        
    },
    socialDataFail : function(total){
        app.checkErrorStatus(total.data.status);
    },
    dtUploadSuccess : function(total){
        
        var data = total.data;
    
        if(data.success) {
            
            app.setAmphiroUpdateDate(new Date().getTime());
       
        }
        
    },
    reqProfileResponse : function(total){
        
        var data = total.data;
        
        var password_send = app.user.profile.password;
        
        if(data.success) {
                        
            var keepRequests = app.getPreviousBluetoothRequests();
            
            app.user.session = true;
            
            app.user.profile = data.profile;
            
            app.user.profile.password = password_send;
            
            app.user.profile.devices = app.setPreviousBluetoothRequests(keepRequests);
  
            app.processLoadMembers(data.profile.household.members);
            
            app.processApplicationLayout(data.profile.configuration);
            
            app.saveApplication();

        } else {
            
            app.setModeToLocalStorage(200);
            
            return false;
       
        }
        
    },
    resetPassResponseSuccess : function(total){
        
        var dt = total.data;
    
        if(dt.success) {
            
            if(!app.user.authentication) app.user.authentication = {};
            
            app.user.authentication.token = dt.token;
            
            app.user.authentication.time = moment().valueOf();
            
            app.setUserToLocalStorage(JSON.stringify(app.user));
            
            app.hideLoadingSpinner($('#resetPwd'));
            
            app.changeToPage('#pinForm');
        
        } else {
        
            app.hideLoadingSpinner($('#resetPwd'));
            
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].server_not_responding);
            
        }
        
    },
    resetPassResponseFail : function(total){
        
        var dt = total.data;
        
        app.hideLoadingSpinner($('#resetPwd'));
        
        app.checkErrorStatus(dt.status);
        
    },
    resetPassResponseAlways : function(dt){
        
        app.hideLoadingSpinner($('#resetPwd'));
        
    },
    redeemPassResponse : function(total){
        
        var dt = total.data;
    
        if(dt.success) {
            
            app.user.authentication = null;
            
            app.setUserToLocalStorage(JSON.stringify(app.user));
            
            app.changeToPage('#login');
            
            app.hideLoadingSpinner($('#reset_pin_Pass'));
            
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].reset);
        
        } else {
        
            app.hideLoadingSpinner($('#reset_pin_Pass'));
            
            var pin = new NotificationManager();
            
            if( dt.errors[0].code === "UserErrorCode.PASSWORD_RESET_PIN_MISMATCH") {
                pin.invalidPIN();
            } else if( dt.errors[0].code === "UserErrorCode.PASSWORD_RESET_TOKEN_ALREADY_REEDEMED") {
                pin.pinUsed();
            } else {
                err.serverMessage();
            }
        }
        
    },
    redeemPassResponseFail : function(dt){
        
        var dt = total.data;
        
        app.hideLoadingSpinner($('#reset_pin_Pass'));
        
        app.checkErrorStatus(dt.status);
        
    },
    redeemPassResponseAlways : function(dt){
        
        app.hideLoadingSpinner($('#reset_pin_Pass'));
        
    },
    changePassResponse : function(total){
    
        var data = total.data;
        
        var called = total.calleddata;
        
        if(data.success) {
            
            app.user.profile.password = called.pass_change;
            
            app.setUserToLocalStorage(JSON.stringify(app.user));
            
            app.clearChangePassFormFields();
            
            app.hideLoadingSpinner($('#changePass_button'));
        
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].pass_changed);
            
        } else {
            
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].server_not_responding);
        
        }
        
    },
    changePassResponseFail : function(data){
    
        var data = total.data;
        
        app.hideLoadingSpinner($('#changePass_button'));
        
        app.checkErrorStatus(data.status);
        
    },
    changePassResponseAlways : function(){
        
        app.hideLoadingSpinner($('#changePass_button'));
    
    },
    ackMsgResponse : function(data){
        
        if(data.success) {
            app.user.settings.ackMessages.length = 0;
        }
        
    },
    loginDone : function(total){
        
        var data = total.data;
        
        var called = total.calleddata;
        
        if(data.success) {
            
            alert(JSON.stringify(called));
            
            app.loginSuccess(
                             {
                             username:called.username,
                             password:called.password
                             },
                             data
                             );
            
        } else {
                        
            app.hideLoadingSpinner($('#submitlog1'));
            
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].login_error);
           // var regg = new NotificationManager();
           // regg.LoginFailed();
            
        }
    },
    loginSuccess : function(credentials,data){
        
        trans.deleteMembers();
        
        app.user.session = true;
        
        app.user.profile = data.profile;
        
        app.user.profile.password = credentials.password;
        
        app.user.profile.username = credentials.username;
        
        app.keepResumeTimeAnalytics();
        
        app.keepLivePage('dashboard');
        
        app.processLoadMembers(data.profile.household.members);
        
        app.processApplicationLayout(data.profile.configuration);
        
        app.setModeToLocalStorage(data.profile.mode);
        
        app.setPendingRequests();
        
        app.saveApplication();
        
        var user = app.getPreviousUser();
        //if different user logged in then clear app and wait for new data..
        if(user != credentials.username){
            //delete existing device data
            app.setPreviousUser(app.user.profile.username);
            
            trans.deleteComparison();
            trans.deleteData();
            trans.deleteLabelData();
            trans.deleteForecastingData();
            trans.deletemeter();
            
            //set update meter time to null
            app.setMeterUpdateTime(null);
            //set update device time to null
            app.setAmphiroUpdateDate(null);
        }

        //profile completed, request device and meter data, device configurations, ack and load messages
        var rc = new refreshApplicationManager();
        rc.profileCompleted();
    },
    loginFail : function(total){
        
        var data = total.data;
        
        //alert('login fails: ' + JSON.stringify(data));
        app.hideLoadingSpinner($('#submitlog1'));
        
        if( data.status) {
            app.checkErrorStatus(data.status);
        }
        
       /*
        var regg = new NotificationManager();
        regg.LoginFailed(); */
        
    },
    loginAlways : function(){
        app.hideLoadingSpinner($('#submitlog1'));
    },
    tempregister : {
        username : null,
        password : null
    },
    registerUserDone : function(total){
    
        var data = total.data;
        
        var called = total.calleddata;
        
        var inputRegister = {
            account : called
        };
        
        if(data.success){
            inputRegister.account.key = data.userKey;
            inputRegister.account.enabled = true;
            inputRegister.account.configuratuon = null;
            inputRegister.account.devices = [];
            app.user.profile = inputRegister.account;
            app.user.session = true;
            app.requestProfile();
        } else {
            var regg = new NotificationManager(data.errors[0].description);
            regg.RegisterFailed();
        }
        
        app.hideLoadingSpinner($('#submitregister'));
        
    },
    registerUserFail : function(total){
    
        var data = total.data;
        
        app.hideLoadingSpinner($('#submitregister'));
        
        if(data.status === 'timeout') {
            var regge = new NotificationManager();
            regge.RegisterFailed();
        } else {
            var regg = new NotificationManager();
            regg.ConnectionMessage();
        }

    },
    registerUserComplete : function(){
        
        app.hideLoadingSpinner($('#submitregister'));
        
    },
    registerDeviceSuccess : function(total){
        
        var data = total.data;
        
        var param = total.calleddata;
    
        alert('param : ' + JSON.stringify(param));
        
        alert('response ' + JSON.stringify(data));
        
        if(data.deviceKey){
            
            var dev = {
                "deviceKey" : data.deviceKey,
                "pendingRequests" :[],
                "aesKey" : param.key,
                "macAddress" :param.id,
                "name" : ' Shower #' + devices.length ,
                "type" : "AMPHIRO",
                "properties":[
                              {
                              "key" :"manufacturer",
                              "value":"amphiro"
                              },{
                              "key" :"model",
                              "value":"b1"
                              }
                              ]
            };
            
            app.user.profile.devices.push(dev);
            
            app.setUserToLocalStorage(JSON.stringify(app.user));
            
            var fromDev = findDeviceIndex(app.user.profile.devices, 'deviceKey', data.deviceKey);
            
            app.user.profile.devices[fromDev].version = null;
            
            if(app.user.profile.mode == 0 || app.user.profile.mode == 1){
                
                app.changeToPage("#AmphiroSetName");
                
                return;
                
            } else{
                
                $.each(data.configurations,function(){
                       //app.setLastConfigDate(this.createdOn);
                       this.properties.unshift(0);
                       this.properties.push(this.numberOfFrames);
                       this.properties.push(this.frameDuration);
                       
                       app.user.profile.devices[fromDev].version = this.version;
                       app.user.profile.devices[fromDev].pendingRequests.unshift(
                                                                                 {fn:11,data:this.properties,id:fromDev,block:3},
                                                                                 {fn:11,data:this.properties,id:fromDev,block:4}
                                                                                 );
                       
                       });
                
                app.changeToPage('#install_part_7');
                
            }
            
        }else{
            var regg = new NotificationManager(data);
            regg.deviceExists();
        }
        
        app.hideLoadingSpinner($('#startPairing'));
        
    },
    registerDeviceFail : function(total){
        var data = total.data;
        app.hideLoadingSpinner($('#startPairing'));
        app.checkErrorStatus(data.status);
    },
    registerDeviceComplete : function(){
        app.hideLoadingSpinner($('#startPairing'));
    },
    deviceConfigurationDone : function(total){
        
        var data = total.data;
        
        if(data.success) {
            
            app.user.profile.devices = app.deviceConfigSuccess(data,app.getUserDevicesPath());
        
        }
    
    },
    deviceConfigSuccess : function(data,devs){
        
        var tempdevs = devs;
        
        $.each(data.devices,function(){
               //get the device index in the device object
               var devConfig = findDeviceIndex(app.user.profile.devices, 'deviceKey', this.key);
               //for each device configuration response
               $.each(this.configurations,function(){

                      this.properties.unshift(0);
                      this.properties.push(this.numberOfFrames);
                      this.properties.push(this.frameDuration);

                      if(!tempdevs[devConfig].pendingRequests || tempdevs[devConfig].pendingRequests === undefined) tempdevs[devConfig].pendingRequests = [];
                      tempdevs[devConfig].pendingRequests = [];
                      tempdevs[devConfig].pendingRequests.unshift(
                                                                  {fn:11,data:this.properties,id:devConfig,block:3},
                                                                  {fn:11,data:this.properties,id:devConfig,block:4}
                                                                  );
                      
                      if(!tempdevs[devConfig].version || tempdevs[devConfig].version === undefined) tempdevs[devConfig].version = null;
                      tempdevs[devConfig].version = this.version;
                      
                      app.saveApplication();
                      
                      /*if(this.properties[1] > 0 || this.properties[2] > 0){
                            var mode = app.getModeFromLocalStorage();
                            if(mode == 1) app.setModeToLocalStorage(5);
                      }*/
                     
                      }); //each configurations
               }); //each devices
        
        return tempdevs;

    },
    labelDataDone : function(total){
        
        if(!total.data.success) {
        
            app.deleteLabelData();
        
        }
    
    },
    ackMsgDone : function(total){
        
        if(total.data.success) {
            
            app.user.settings.ackMessages.length = 0;
        
        }
    
    },
    messagesLoadDone : function(total){
        
        var data = total.data;
    
        if(data.success){
            //request messages api call success!
            
            $('#tab-1 .messages').attr('data-total',data.totalAlerts + data.totalAnnouncements);
            $('#tab-2 .messages').attr('data-total',data.totalTips);
            $('#tab-3 .messages').attr('data-total',data.totalRecommendations);
            
            //data response should contain 1.alerts,2.tips,3.announcements,4.reccomendations
            $.each(data.alerts,function(){
                   //check if the message exists
                   var obj = getObjects(app.user.notifications, 'id',this.id);
                   if(obj.length === 0){
                   //message does not exists. push it!
                   app.user.notifications.unshift({
                                                  id:this.id,
                                                  alert_type:this.alertType,
                                                  priority:this.priority,
                                                  active : true,
                                                  time:this.createdOn,
                                                  title:this.title,
                                                  txt: this.description,
                                                  value:null,
                                                  type:'ALERT',
                                                  ack:false,
                                                  ack_time:this.acknowledgedOn
                                                  });
                   }
                   });
            
            //for each tip in response object
            $.each(data.tips,function(){
                   //check if the message exists
                   var obj = getObjects(app.user.notifications, 'id',this.id);
                   if(obj.length === 0){
                   //creste tip object and unshift it to general notifications array
                   app.user.notifications.unshift({
                                                  id:this.id,
                                                  active :true,
                                                  time:this.createdOn,
                                                  title:this.title,
                                                  txt: this.description,
                                                  type: 'RECOMMENDATION_STATIC',
                                                  ack:false,
                                                  image:this.imageEncoded,
                                                  ack_time:this.acknowledgedOn
                                                  });
                   }
                   });
            //for each announcements in response object
            $.each(data.announcements,function(){
                   var obj = getObjects(app.user.notifications, 'id',this.id);
                   if(obj.length === 0){
                   app.user.notifications.unshift({
                                                  id: this.id,
                                                  active:true,
                                                  time:this.createdOn,
                                                  title:this.title,
                                                  txt:this.content,
                                                  type:'ANNOUNCEMENT',
                                                  ack:false,
                                                  ack_time:this.acknowledgedOn
                                                  });
                   }
                   });
            
            
            $.each(data.recommendations,function(){
                   var obj = getObjects(app.user.notifications, 'id',this.id);
                   if(obj.length === 0){
                   
                   app.user.notifications.unshift({
                                                  id:this.id,
                                                  //rec_type:this.recommendation,
                                                  active:true,
                                                  time:this.createdOn,
                                                  title:this.title,
                                                  txt:this.body,
                                                  type : 'RECOMMENDATION_DYNAMIC',
                                                  ack:false,
                                                  ack_time:this.acknowledgedOn
                                                  });
                   }
                   });
            
            app.buildMessage();
        }
        
    },
   
    setPendingRequests : function(){
        
        $.each(app.user.profile.devices,function(){
               this.pendingRequests = [];
               });
        
    },
    updateViews : function(data){
        $('#decivename').closest('.item-content').hide();
        $('#decivename').closest('.item-content').prev('.item-content').show();
        $('#devName').text(data.name);
        $('.chosenID[value="'+data.deviceKey+'"]').closest('label').find('p').text(data.name);
        $('.DevicesList li[data-name="'+data.deviceKey+'"]').find('.item-title').text(data.name);
    },
    showSmartMeterOptions : function(){
        $('.TypeTab').hide();
        $('.ShowerTab').hide();
        $('.TimeTab').show();
        $('.calendar').show();
        $('.MeterTypeTab').show();
    },
    showAmphiroOptions : function(){
        $('.MeterTypeTab').hide();
        $('.TypeTab').show();
        $('.calendar').hide();
        $('.TimeTab').hide();
        $('.ShowerTab').show();
        $('.legend_lines').hide();
        $('.legend_lines_price').hide();
    },
    typeTab : {
        water : {
            elements : [
                        {
                        'name' : 'Volume',
                        'attribute': 'water',
                        'asset': 'img/SVG/volume.svg',
                        'active':false
                        },{
                        'name' : 'Energy',
                        'attribute': 'energy',
                        'asset': 'img/SVG/energy.svg',
                        'active':true
                        },{
                        'name' : 'Duration',
                        'attribute': 'duration',
                        'asset': 'img/SVG/duration.svg',
                        'active':true
                        },{
                        'name' : 'Temp',
                        'attribute': 'temp',
                        'asset': 'img/SVG/temperature.svg',
                        'active':true
                        }
                        ]
        },
        energy : {}
        
    },
    reCalculateTypeTab : function(){
    
        var tab = $('.TypeTab');
        
        tab.empty();
        
        $.each(app.typeTab.water.elements,function(){
               
               if( !this.active ) return true;
               
               tab.append( app.typeTabTemplate( this.attribute, this.asset ) );
               
               });
        
        app.typeTabStyles();
    
    },
    typeTabStyles : function(){
    
        var taba = $('.TypeTab a');
        var tabimg = $('.TypeTab a img');
        
        taba.css({'width': 100 / taba.length +'%'});
        tabimg.css({'margin-top': '14.5%'});
        
    },
    typeTabTemplate : function(ctrl,asset){
    
        return '<a id="'+ctrl+'" class="tab-link " ><img src="'+asset+'" width="25" height="25"></a>';
        
    },
    setAnalyticsControlsBothMeters : function(){
        var timetab = $('.TimeTab'),
            typetab = $('.TypeTab'),
            metertimetab = $('.MeterTypeTab'),
            calendar = $('.calendar'),
            showertab = $('.ShowerTab'),
            bothmeters = $('.both_meters');
        
        $('.devtab').remove();
        
        $('.dash2dev p,.dash2dev img').show();
        //show both meters div
        bothmeters.show();
        
        //set time tab e.g. Day,Month,Year
        timetab.find('a.evtActive').removeClass('evtActive ');
        timetab.find('span.msgActive').removeClass(' msgActive');
        timetab.find('a:eq(0)').addClass('evtActive');
        timetab.find('a:eq(0)').find('span').addClass('msgActive');
        
        //hide meter options
        timetab.hide();
        calendar.hide();
        metertimetab.hide();
        
        //show device/shower options and controls
        showertab.show();
        showertab.find('a.evtActive').removeClass('evtActive ');
        showertab.find('span.msgActive').removeClass(' msgActive');
        showertab.find('a:eq(0)').addClass('evtActive');
        showertab.find('a:eq(0)').find('span').addClass('msgActive');
        
        //show device type e.g. water,energy,duration, temperature
        typetab.show();
        typetab.find('a.typeActive').removeClass('typeActive');
        typetab.find('a:eq(0)').addClass('typeActive');
        
        $('<div class="devtab" ></div>').insertAfter( $( ".meterChoices" ) );
    },
    setDevicesToMainControl : function(selector,numAmphiro,numMeters){
        var nm;
       
        $.each(app.user.profile.devices, function(){
               
               if(this.type == 'AMPHIRO') {
               
                (numAmphiro === 1) ? nm = app.appLabels.shower : nm = this.name;
               
                selector.append(
                                app.getDevicesControlTemplate(
                                                              numAmphiro, //number of amphiro b1
                                                              numMeters, //number of meters
                                                              1, // type : amphiro  == 1, type : meter == 0
                                                              this.deviceKey, //devicekey
                                                              nm //name
                                                              )
                              );
               } else if(this.type == 'METER'){
                //(numMeters === 1) ? nm = app.appLabels.meter : nm = this.name;
                selector.append(
                                app.getDevicesControlTemplate(
                                                              numAmphiro,
                                                              numMeters,
                                                              0, // type: meter == 0 (id to separate types)
                                                              this.serial,
                                                              app.appLabels.meter // a general name for meter
                                                              )
                              );
               } else {
               
                selector.append(
                                app.getDevicesControlTemplate(
                                                              numAmphiro,
                                                              numMeters,
                                                              0, // type: meter == 0 (id to separate types)
                                                              123456, //id - serial -mac
                                                              'A NAME' // a general name for DEVICE
                                                              )
                                );
               
               }
               
               });
    },
   
    setCssForDevicesControl: function(numAmphiro,numMeters){
        var devtab = $('.devtab'),
            devtablabel = $('.devtab label');

        if(numAmphiro > 3) {
            devtab.css({'height':'100px'});
        }
        
        devtablabel.each(function(){
                         var width = 100/(numAmphiro + numMeters);
                         $(this).css({'width':width+'%'});
                         });
    },
    setConfigureViewOptions : function(){
        var active = parseInt(app.user.settings.meter_active,10);

        if (active === 0) {
            this.setConfigureAmphiroViewOptions();
        } else {
            this.setConfigureMeterViewOptions();
        }
    },
    setAnalyticsControlsOnlyAmphiro : function(){
        /*only amphiro device - no meter */
        
        var timetab = $('.TimeTab'),
            typetab = $('.TypeTab'),
            metertimetab = $('.MeterTypeTab'),
            calendar = $('.calendar'),
            showertab = $('.ShowerTab'),
            bothmeters = $('.both_meters');
        
        $('.dash2dev p,.dash2dev img').show();
        
        bothmeters.hide();
        //hide meter options
        timetab.hide();
        metertimetab.hide();
        calendar.hide();
        
        //show amphiro device options and styles
        showertab.show();
        showertab.find('a.evtActive').removeClass('evtActive ');
        showertab.find('span.msgActive').removeClass(' msgActive');
        showertab.find('a:eq(0)').addClass('evtActive');
        showertab.find('a:eq(0)').find('span').addClass('msgActive');
        
        //show amphiro device type options e.g. water,energy,duration etc.
        typetab.show();
        typetab.find('a.typeActive').removeClass('typeActive');
        typetab.find('a:eq(0)').addClass('typeActive');
        
        $('.devtab').remove();
        $('<div class="devtab"></div>').insertAfter( $( '.meterChoices' ) );

    },
    setAmphiroDevicesToMainControl : function(numAmphiro){
        var devtab = $('.devtab');

        //one amphiro device
        if(numAmphiro == 1){
            
            devtab.append(
                          app.getDevicesControlTemplate(
                                                        numAmphiro,
                                                        0,
                                                        1,
                                                        app.user.profile.devices[0].deviceKey,
                                                        app.user.profile.devices[0].name
                                                        )
                          );
            
        }
        //more than one amphiro devices
        if(numAmphiro > 1){
            
            $.each(app.user.profile.devices , function(){
                   if(this.type == 'AMPHIRO'){
                   
                        devtab.append(
                                      app.getDevicesControlTemplate(
                                                                    numAmphiro,
                                                                    0,
                                                                    1,
                                                                    this.deviceKey,
                                                                    this.name
                                                                    )
                                      );
                   
                   }
                   });
        }
    },
    setCssForAmphiroControl : function(numberOfDevices){
        var devtab = $('.devtab'),
            devtablabel = $('.devtab label');
        
        //css is different per number of amphiro devices
        if(numberOfDevices == 1) {
            devtab.css({'height':'0px'});
            devtab.css({'margin-bottom':'-13.5px'});
        }
        
        if(numberOfDevices > 1 && numberOfDevices <=4) {
            devtab.css({'height':'60px'});
            devtablabel.each(function(){
                                    var width = 100/numberOfDevices ;
                                    $(this).css({'width':width+'%'});
                                    });
        }
        
        if(numberOfDevices > 4){
            if(screen.width < 500 ){
                devtab.css({'height':'120px'});
                devtablabel.each(function(){
                                 $(this).css({'width':'33%'});
                                 });
            }else{
                devtab.css({'height':'200px'});
                devtablabel.each(function(){
                                 $(this).css({'width':'33%'});
                                 });
            }
        }
    },
    setConfigureAmphiroViewOptions : function(){
        var consumption = parseInt(app.user.settings.consumptionChoice,10),
            consevent = $('.consumptionEvent'),
            configchoices = $('.ConfigChs'),
            configelements = $('.ConfigElements'),
            switcher = $('#configureSwitcher');
        
        consevent.find('label:eq(1)').hide();
        consevent.find('label:eq(0)').show();
        consevent.find('label:eq(2)').show();
        
        if(consumption === 0) {
            consevent.find('label:eq(0) input[id="'+consumption+'"]:radio').attr( 'checked', true );
        } else {
            consevent.find('input[id="'+consumption+'"]:radio').attr( 'checked', true );
        }
        
        configchoices.eq(1).hide();
        configchoices.eq(0).show();
        
        switcher.removeAttr('checked');
        
        $.each(app.user.settings.mydashenabled, function(i){
               configelements.find('a').eq(i).find('.item-title').text(this.title);
               configelements.find('a').eq(i).attr('id',this.id);
               });
    },
    setAnalyticsControlsOnlyMeter :function(){
        var timetab = $('.TimeTab'),
            typetab = $('.TypeTab'),
            metertimetab = $('.MeterTypeTab'),
            calendar = $('.calendar'),
            showertab = $('.ShowerTab'),
            bothmeters = $('.both_meters'),
            devtab = $('.devtab');
        
        devtab.remove();
        
        $('.dash2dev p,.dash2dev img').hide();
        
        bothmeters.hide();
        //hide amphiro device realted options
        showertab.hide();
        typetab.hide();
        //show time tab and set styles
        timetab.show();
        timetab.find('a.evtActive').removeClass('evtActive ');
        timetab.find('span.msgActive').removeClass(' msgActive');
        timetab.find('a:eq(0)').addClass('evtActive');
        timetab.find('a:eq(0)').find('span').addClass('msgActive');
        
        //show after graph tab bar options and styles
        metertimetab.show();
        metertimetab.find('a.meterActive').removeClass('meterActive');
        metertimetab.find('a:eq(0)').addClass('meterActive');
        
        //show calendar control
        calendar.show();
        
        $('<div class="devtab"></div>').insertAfter( $( '.meterChoices' ) );
        $('.devtab').css({'height':'0px'});

    },
    setMeterDeviceTomainControl : function(){
        var devtab = $('.devtab');
        
        devtab.append(
                      app.getDevicesControlTemplate(
                                                    0,
                                                    1,
                                                    0,
                                                    app.user.profile.devices[0].deviceKey,
                                                    app.user.profile.devices[0].name
                                                    )
                      );
    },
    setConfigureMeterViewOptions : function(){
        var consumption = parseInt(app.user.settings.consumptionChoice,10),
            consevent = $('.consumptionEvent'),
            configchoices = $('.ConfigChs'),
            configelements = $('.ConfigElements'),
            switcher = $('#configureSwitcher');
        
        consevent.find('label:eq(0)').hide();
        consevent.find('label:eq(1)').show();
        consevent.find('label:eq(2)').hide();
        
        if(consumption === 0) {
            consevent.find('label:eq(1) input[id="'+consumption+'"]:radio').attr( 'checked', true );
        } else {
            consevent.find('input[id="'+consumption+'"]:radio').attr( 'checked', true );
        }
        
        configchoices.eq(0).hide();
        configchoices.eq(1).show();
        
        switcher.attr('checked',true);
        
        $.each(app.user.settings.mydashenabled , function(i){
               configelements.find('a').eq(i).find('.item-title').text(this.title);
               configelements.find('a').eq(i).attr('id',this.id);
               });
    },
    setUserDevicesSettings : function(){
        var dev;
        
        if(this.countAmphiro() === 0) return false;
        
        if(app.user.profile.devices[0].type == 'METER') {
            dev = app.user.profile.devices[1];
        } else {
            dev = app.user.profile.devices[0];
        }
        
        $.each(dev.properties,function(){
               if(this.key == 'heating-system' ) {
                    var title = $('input[id='+this.key+'][value='+this.value+']').closest('label').find('.item-title').text();
                    $('input[name="my-heating"]:checked').removeAttr('checked');
                    $('input[id="'+this.key+'"][value="'+this.value+'"]:radio').attr( 'checked', true );
                    $('input[id='+this.key+'][value='+this.value+']').closest('li').find('span:eq(0)').text(title);
               } else if(this.key != 'manufacturer' && this.key != 'model') {
                    $('input[name="amphiro_setings"][id="'+this.key+'"]').val(this.value);
                    $('input[id='+this.key+']').closest('li').find('span:eq(0)').text(this.value);
               }
               });
    },
    setUserDevices : function(selector){
       
        selector.empty();
        
        $.each(app.user.profile.devices, function(){
               
               if(this.type == 'AMPHIRO') {
               
                    selector.append('<a href="#AmphiroUpdate" class="forpages_double"><li data-name='+this.deviceKey+' class="item-content "><div class="item-media" ><img src="img/SVG/amphiro_small.svg"></div> <div class="item-inner"> <div class="item-title-row"><div class="item-title" >'+this.name+'</div></div><div class="item-subtitle">'+tm.timeConverter(this.registeredOn)+'</div></div><div class="item-media" ><img src="img/SVG/arrow-list-right.svg"></div></li></a>');
               
               }else{
               
                    selector.append('<li data-name='+this.serial+' class="item-content "><div class="item-media" ><img src="img/SVG/water-meter.svg"></div> <div class="item-inner"> <div class="item-title-row"><div class="item-title" >'+this.type+'</div><div class="item-after"></div></div><div class="item-subtitle">'+tm.timeConverter(this.registeredOn)+'</div></div></li>');
               
                    //selector.append('<a href="#Billing" class="forpages_double"><li data-name='+this.serial+' class="item-content "><div class="item-media" ><img src="img/SVG/water-meter.svg"></div> <div class="item-inner"> <div class="item-title-row"><div class="item-title" >'+this.type+'</div><div class="item-after"></div></div><div class="item-subtitle">'+app.timeConverter(this.registeredOn)+'</div></div><div class="item-media" ><img src="img/SVG/arrow-list-right.svg"></div></li></a>');
               }
               });
    },
    setUserUnit : function(){
        var unit = $('#dataUnit');
        
        if(this.getAppDataUnit() == 1 ) {
            
            unit.attr('checked',true);
        
        } else {
            
            unit.removeAttr('checked');
        
        }
        
    },
    setUserBasicInfo : function(){
        
        $('.myusername').text(this.getUserFirstName());
        
        $('.mylastname').text(this.getUserLastName());
        
        $('.userlocation').text(this.getUserCountry());
        
        $('.useraddress').text(this.getUserAddress());
        
        if(app.user.profile.photo){
            $('.myphoto').attr('src','data:image/png;base64,'+app.user.profile.photo);
        }
        
    },
    setNumberOfDevices : function(){
        $('.NumberOfDevices').text(this.countAmphiro());
    },
    savePhotoProfile : function(data_url){
        app.saveProfile({'photo' : data_url});
    },
    setUserPhotoProfile : function(data_url){
        app.user.profile.photo = data_url;
    },
    getUserAppPreferences : function(){
        return JSON.stringify(app.user.settings);
    },
    getUserGender : function(){
        return app.user.profile.gender;
    },
    getUserKey : function(){
        return app.user.profile.key;
    },
    getUserEmail : function(){
        return app.user.profile.username;
    },
    getUserPassword : function(){
        return app.user.profile.password;
    },
    getUserFirstName : function(){
        return app.user.profile.firstname;
    },
    getUserLastName : function(){
        return app.user.profile.lastname;
    },
    getUserPhotoProfile : function(){
        if(app.user.profile.photo){
         return app.user.profile.photo;
        }
    },
    getUserSystemUnit : function(){
        return app.user.profile.unit;
    },
    getUserCountry : function(){
        if(app.user.profile.country) {
         return app.user.profile.country;
        } else {
         return '';
        }
    },
    getUserAddress : function(){
        if(app.user.profile.address) {
            return app.user.profile.address;
        } else {
            return '';
        }
    },
    getUserBirthdate : function(){
        return app.user.profile.birthdate;
    },
    getUserProfileLocale : function(){
        return app.user.profile.locale;
    },
    getNumberOfDevices : function(){
        return app.user.profile.devices.length;
    },
    getUserMemberProfile : function(){
       
        return {
            index:0,
            name: app.getUserFirstName(),
            photo : app.getUserPhotoProfile(),
            gender : app.getUserGender()
        };
        
    },
    processApplicationLayout : function(layout){
        if(layout){
            app.user.settings = JSON.parse(layout);
        }
    },
    getUserTimezone : function(){
        return app.user.profile.timezone;
    },
    getAckMessages : function(){
        return app.user.settings.ackMessages;
    },
    getDeviceName : function(){
        return 'Shower #' + this.getNumberOfDevices();
    },
    getAuthenticationToken : function(){
        return app.user.authentication.token;
    },
    goToProfileReady : function(){
        var set = new refreshApplicationManager();
        set.ready();
    },
    goToProfileSet : function(){
        var set = new refreshApplicationManager();
        set.callsCompleted();        
    },
    processMeterData : function(results){
        var data = [];
        
        for (var i=0; i<results.rows.length; i++){
            data.push(
                      app.metricLocalemeter(
                                            {
                                            volume:results.rows.item(i).volume,
                                            timestamp:results.rows.item(i).timestamp
                                            }
                                            )
                      );
        }
        
        return data;
        
    },
    processForecastingData : function(dt){
        
        
    },
    processLabelData : function(results){
        var labels = [];
        for (var i=0; i<results.rows.length; i++){
            labels.push(
                        {
                        deviceKey: results.rows.item(i).device,
                        sessionId: results.rows.item(i).shower,
                        memberIndex: results.rows.item(i).member_id,
                        timestamp : results.rows.item(i).timestamp
                        }
                        );
        }
        return labels;
    },
   
    getPreviousBluetoothRequests : function(){
        
        var keepRequests = [], z = app.user.profile.devices;

        for(var i=0; i<z.length; i++) {
        
            if(!z[i].pendingRequests || z[i].pendingRequests === undefined) {
                
                keepRequests.push([]);
            
            } else {
            
                keepRequests.push(z[i].pendingRequests);
           
            }
        
        }
        
        return keepRequests;
        
    },
    setPreviousBluetoothRequests : function(keepRequests){
        
        var z = app.user.profile.devices;
        
        for(var i=0; i<z.length; i++) {
        
            if(z[i].type == 'AMPHIRO') {
                
                if(!z[i].version || z[i].version === undefined) z[i].version = null;
                
                if(keepRequests[i]) {
                    
                    z[i].pendingRequests = keepRequests[i];
                
                } else {
                
                    z[i].pendingRequests = [];
                
                }
            }
        
        }
        
        return z;
        
    },
    setEfficiencyImg : function(selector,energy){
        selector.html('<p><img src="img/SVG/energy-'+this.ComputeEfficiencyRatingFromEnergy(energy)+'.svg" style="width:100%;height:80%;"></p>');
    },
    updateDetailedEventPhoto : function(selector,photo){
        if(photo){
            selector.attr('src',app.getBase64Type(photo));
        }
    },
    updateDetailedEventName : function(selector,name){
        selector.text(name);
    },
    getBase64Type : function(photo){
        return 'data:image/png;base64,' + photo;
    },
    photoFromLibrary : function(){
        navigator.camera.getPicture(
                                    app.onPhotoURISuccess,
                                    app.onPhotoFail,
                                    {
                                    quality: 1,
                                    destinationType: Camera.DestinationType.DATA_URL,
                                    sourceType: pictureSource.PHOTOLIBRARY,
                                    targetWidth : 400 ,
                                    targetHeight : 800,
                                    encodingType : 1
                                    }
                                    );
    },
    takeNewPhoto : function(){
        navigator.camera.getPicture(
                                    app.onPhotoURISuccess,
                                    app.onPhotoFail,
                                    {
                                    quality: 1,
                                    destinationType: Camera.DestinationType.DATA_URL
                                    }
                                    );
    },
    onPhotoURISuccess : function(imageURI){
        
        var largeImage,
             photofor = $('#popupBasic2').attr('data-key');
        
        if(photofor === 0){
          
            largeImage = document.getElementsByClassName('myphoto');
            
            $('.myphoto').attr('src',app.getBase64Type(imageURI));
            
            var profile = new profileManager(imageURI);
            profile.newProfilePhoto();
            
        } else {
            
            largeImage = document.getElementById('memberPhoto');
            largeImage.style.display = 'block';
            largeImage.src = app.getBase64Type(imageURI);
        
        }
    },
    onPhotoFail : function(){
        //alert('Failed because: ' + message);
    },
    ComputeEfficiencyRatingFromEnergy : function(e){
        //Compute efficiency rating from energy(wh)
        var scale;
        if(e < 700) {
            scale = "A";
        } else if(e >= 700 && e< 1225) {
             scale = "B";
        } else if(e >= 1225 &&  e< 1750) {
             scale = "C";
        } else if(e >= 1750 &&  e< 2275) {
             scale = "D";
        } else if(e >= 2275 &&  e< 2800) {
             scale = 'E';
        } else {
             scale = "F";
        }
        return scale;
    },
    ComputeEfficiencyRatingFromWater : function(e){
        var scale;
        if(e < 1) {
            scale = "A";
        } else if(e >= 1 && e< 3) {
            scale = "B";
        } else if(e >= 3 &&  e< 6) {
            scale = "C";
        } else if(e >= 6 &&  e< 9) {
            scale = "D";
        } else if(e >= 9 &&  e< 12) {
            scale = "E";
        } else if(e >= 12) {
            scale = "F";
        }
        
        return scale;
    },
    
    RefreshDashboardConfigs : function(){
        
        $('.ConfigElements').each(function(){
                                  $(this).find('.item-title').text('Assign Element');
                                  });
        
        $.each( app.user.settings.mydashenabled , function(i){
               $('.ConfigElements').find('a').eq(i).find('.item-title').text(this.title);
               $('.ConfigElements').find('a').eq(i).attr('id',this.id);
               });
        
    },
    requestPendingBlock : function(devIndex,numberOfBlock){
        
        var blockStatus = getObjects(app.user.profile.devices[devIndex].pendingRequests, 'block',numberOfBlock);

        bluetoothLocker = 0;

        if(blockStatus.length === 0){

            if( app.getActivePage() == 'install_part_7' ) {
                $('#water_wait').hide();
                $('#water_off').show();
                $('#NameButton').removeAttr('disabled');
            } else {
                
                if(app.getSystemPlatform() === 'android' ) {
                    app.stop();
                    app.refreshDeviceListHard();
                }
                
            }
            
            alert(JSON.stringify(app.user.profile.devices[devIndex]));
            
            if( app.user.profile.devices[devIndex].version ) {
                
                app.notifydevice(
                                 app.user.profile.devices[devIndex].deviceKey,
                                 app.user.profile.devices[devIndex].version
                                 );
            }
        }
    },
    timesExecuted : 0,
    runBluetoothQ : function(param){
        
        var RequestedF4 = findDeviceIndex(app.user.profile.devices, 'deviceKey', param.id);
        
        app.user.profile.devices[RequestedF4].availability = 1;
        
        if(app.user.profile.devices[RequestedF4].pendingRequests === undefined) return;
        
        app.BluetoothSupervisor(RequestedF4);
        
    },
    checkBluetoothStatus : function(){
    
        if(app.getSystemPlatform() === 'android' ) {
        
            setInterval(function(){

                        if( typeof bleTime === "undefined" ){ //bluetooth in android STOP
                    
                            setTimeout(function(){
                                       app.refreshDeviceList(); //THEN START
                                       },2200);
                        }
                        
                        },60000);
        }
    
    },
    BluetoothSupervisor : function(deviceWithIndex){
        
        execute = function(){
            
            bluetoothLocker = 1;
            
            var option = app.user.profile.devices[deviceWithIndex].pendingRequests.shift();
         
            switch(option.fn){
                case 0:
                    requestRealFromPeripheral(deviceWithIndex,app.user.profile.devices[deviceWithIndex]);
                    break;
                case 1:
                    //requestCB1FromPeripheral();
                    break;
                case 2:
                    app.user.profile.devices[deviceWithIndex].pendingRequests.push(option);
                    writeCB2ToPeripheral(option.data,option.d);
                    break;
                case 21:
                    requestCB2FromPeripheral(option.d);
                    break;
                case 3:
                    app.user.profile.devices[deviceWithIndex].pendingRequests.push(option);
                    writeCB3ToPeripheral(option.data,option.d);
                    break;
                case 31:
                    requestCB3FromPeripheral(option.d);
                    break;
                case 4:
                    app.user.profile.devices[deviceWithIndex].pendingRequests.push(option);
                    writeCB4ToPeripheral(option.data,option.d);
                    break;
                case 41:
                    requestCB4FromPeripheral(option.d);
                    break;
                case 5:
                    requestHistoryFromPeripheral(option.data,app.user.profile.devices[deviceWithIndex]);
                    break;
                case 6:
                    requestNotification(app.user.profile.devices[deviceWithIndex]);
                    break;
                case 11:
                    //*writePacket* is a generic autmated function for requestConfiguration api call response.
                    app.user.profile.devices[deviceWithIndex].pendingRequests.push(option);
                    
                    writePacket(option.data,app.user.profile.devices[deviceWithIndex],option.block);
                    
                    break;
                
                default:
                    //app.BluetoothSupervisor(deviceWithIndex);
            }
        };
        
        if (app.user.profile.devices[deviceWithIndex].pendingRequests.length > 0){

            if(app.user.profile.devices[deviceWithIndex].availability == 1){
                
                if(bluetoothLocker === 0){
                    
                    if( app.getSystemPlatform() === 'android' ) {
                        
                        if(bleTime){
                            
                            if(app.user.profile.devices[deviceWithIndex].availability == 1){
                                
                                app.stop();
                                
                                clearInterval(bleTime);
                                
                                bleTime = undefined;
                                
                            }
                            
                        }
                        
                    }
                    
                    setTimeout(function(){
                               execute();
                               },3000);
                    
                }
            }
        }else{
            //no requests found - for *iOS* continues - for *android* stop scan and start scan. Just in case!
            if ( app.getSystemPlatform() === 'android' ) {
                if(app.user.profile.devices[deviceWithIndex].pendingRequests.length === 0) {
                    app.bluetoothRunning();
                }
            }
        }
    },
    stop : function(){
        ble.stopScan();
    },
    disconnect : function(macAddress){
        //disconnect from peripheral. Peripheral's MAC (id) is required
        ble.disconnect(
                       macAddress,
                       function(){
                       
                        bluetoothLocker = 0;
                       
                        setTimeout(function(){

                                   var devindex = findDeviceIndex( app.user.profile.devices, 'macAddress', macAddress);
                                  
                                   app.BluetoothSupervisor(devindex);
                                  
                                   },500);
                       
                        },function(){
                       
                        bluetoothLocker = 0;
                       
                        }
                       );
    },
    forceDisconnect : function(param){
        //alert(AppModel.lastIndex + ' and '+ param.showerId);
        if(AppModel.lastIndex === param.showerId){
            
            var Requested = findDeviceIndex(app.user.profile.devices, 'deviceKey', param.id);
            
            app.disconnect(app.user.profile.devices[Requested].macAddress);
            
        }
    },
    bluetoothRunning : function(){
    
        if( app.getSystemPlatform() === 'android' ) {

            if( typeof bleTime === "undefined"){ //bluetooth in android STOP

                app.refreshDeviceListHard(); //THEN START
                
            } else {
                
                $('#nikolas').append('</br> ANDROID BLUETOOTH RUNNING </br>');
            }
            
        }else {
            
            if( typeof bleTime1 === "undefined"){ //bluetooth in iOS STOP

                app.refreshDeviceListHard(); //THEN START
                
            } else {
                //alert('bluetooth running : ' + bleTime1);
            }
        }
        
    },
    refreshDeviceListHard: function() {
        
        if( app.getSystemPlatform() === 'android' ) { // Android filtering is broken
            bleTime = setInterval(function(){
                                  if( app.getActivePage() == 'install_part_3') return;
                                  ble.scan([],1,app.onDiscoverAndroidDevice, app.onError);
                                  },1300);
        }else {
            ble.startScan([], app.onDiscoveriOSDevice, app.onError);
            setTimeout(function(){
                       app.stop();
                       bleTime1 = setTimeout(function(){
                                             app.refreshDeviceListHard();
                                             },500);
                       },2500);
        }
    },
    refreshDeviceList: function() {
        if( app.getSystemPlatform() === 'android' ) { // Android filtering is broken
            ble.startScan([], app.onDiscoverAndroidDevice, app.onError);
        } else {
            ble.startScan([], app.onDiscoveriOSDevice, app.onError);
            setTimeout(function(){
                       app.stop();
                       bleTime1 = setTimeout(function(){
                                  app.refreshDeviceList();
                                  },500);
             },2500);
        }
    },
    onDiscoveriOSDevice: function(device) {
        
        var idpos = findDeviceIndex(app.user.profile.devices, 'macAddress', device.id);
        
        //check if device is already paired.
        if(idpos !== null) {
            //Publish that device is available until ..force quit!
            //inform that the device with device index @idpos is availbale for bluetooth connections.
            $.event.trigger({type:"available",message:idpos});
            //insert decryption key for decryption to device object
            
            var newdecryption = new cryptoService({
                                                  data : device.advertising.kCBAdvDataManufacturerData,
                                                  id : device.id,
                                                  key : app.user.profile.devices[idpos].aesKey
                                                  });
            newdecryption.decrypt();
            
        } else {
            app.CheckDiscoveredDeviceForAmphiro(device);
        }
    },
    onDiscoverAndroidDevice: function(device) {
        var idpos = findDeviceIndex(app.user.profile.devices, 'macAddress', device.id);
        //check if device is already paired.
        if(idpos !== null) {
            //inform that the device with device index @idpos is availbale for bluetooth connections.
            $.event.trigger({type:"available",message:idpos});
            //insert decryption key for decryption to device object
            var uint8 = new Uint8Array(device.advertising);
            var data2decry = uint8.subarray(5, 25);
            
            var newdecryption = new cryptoService({
                                                  data : data2decry,
                                                  id : device.id,
                                                  key : app.user.profile.devices[idpos].aesKey
                                                  });
            newdecryption.decrypt();
            
        } else {
            app.CheckDiscoveredDeviceForAmphiro(device);
        }
    },
    CheckDiscoveredDeviceForAmphiro : function(device){
        var isAmphiroDevice,
            checked;
        
        if( app.getSystemPlatform() === 'android') {
            if(device.advertising != 'undefined'){
                isAmphiroDevice = new Uint8Array(device.advertising);
                if(isAmphiroDevice[24]==49){
                    
                    $.event.trigger({type:"checkKeyAndroid",message:device});

                    if(AppModel.NewDevices.length === 0) {
                        AppModel.NewDevices.push(device.id);
                    } else {
                        checked = isInArray(device.id,AppModel.NewDevices);
                        if(checked !== true && isAmphiroDevice[24]==49){
                            AppModel.NewDevices.push(device.id);
                        }
                    }
                }
            }
        } else {
            
            if(device.advertising.kCBAdvDataManufacturerData != 'undefined') {
                
                if(!device.advertising.kCBAdvDataManufacturerData) return;
                
                isAmphiroDevice = new Uint8Array(device.advertising.kCBAdvDataManufacturerData);
                
                if(isAmphiroDevice[19]==49) {
                    
                    $.event.trigger({type:"checkKeyios",message:device});

                    if(AppModel.NewDevices.length === 0) {
                        AppModel.NewDevices.push(device.id);
                    } else {
                        checked = isInArray(device.id,AppModel.NewDevices);
                        if(checked !== true && isAmphiroDevice[19]==49) {
                            AppModel.NewDevices.push(device.id);
                            
                        }
                    }
                }
            }
        }
    },
    AesCode : function(str){
        var c = [],
            IntValue,
            aesKey,
            bb;
        
        for (var i = 0; i < str.length; ++i){
            c.push(str.charCodeAt(i));
        }
        
        IntValue = 26 * (26 * (26 * (26 * (2 * (10 * (10 * (c[7] - 48) + (c[6] - 48)) + (c[5] - 48)) + (c[4] - 48)) + (c[3] - 65)) + (c[2] - 65)) + (c[1] - 65)) + (c[0] - 65);
        
        aesKey = new Uint8Array(16);
        aesKey[0] = IntValue >> 0 & (255);
        aesKey[1] = IntValue >> 8 & (255);
        aesKey[2] = IntValue >> 16 & (255);
        aesKey[3] = IntValue >> 24 & (255);

        for (i = 4; i<16; i++){
            bb = 0;
            for (j = 0; j < 4; j++) {
                bb = (bb >> 1)  + (bb << 7);
                bb = ( bb + aesKey[(i-4) + j]) & (255);
            }
            aesKey[i] = bb;
        }
        
        var newdecryption = new cryptoService({
                                              data : str2ab(AppModel.PingData),
                                              key : app.hex(aesKey),
                                              id : AppModel.selectedToPairWithID
                                              });
        newdecryption.decrypt();
        
    },
    checkCode :  function(key) {
        var newStr;
        if(key.length == 4) {
         newStr = app.toUpper(key.insert(4,"0000"));
         app.AesCode(newStr);
        } else if(key.length == 5) {
         newStr = app.toUpper(key.insert(4,"000"));
         app.AesCode(newStr);
        } else if(key.length == 6) {
         newStr = app.toUpper(key.insert(4,"00"));
         app.AesCode(newStr);
        } else if(key.length == 7) {
         newStr = app.toUpper(key.insert(4,"0"));
         app.AesCode(newStr);
        } else if(key.length == 8) {
         newStr = app.toUpper(key);
         app.AesCode(newStr);
        } else{
         var blest = new NotificationManager();
         blest.PairingCode();
        }
    },
    updateMemberActiveState : function(member){
        
        trans.updateMemberActiveState(member);
        
    },
    updatePhotoDB : function(photo){
        
        trans.updatePhotoDB(photo);
        
    },
    storeNewMember : function(param){
        
        trans.storeNewMember(param);
        
    },
    storeRealPacket: function(param) {
        
        trans.storeRealPacket(param);
        
    },
    storeHistoryPacket: function(param) {
        
        trans.storeHistoryPacket(param);
        
    },
    processGetBestShower : function(results){
        var len = results.rows.length,
            send;

        if( len === 0 ) {
            send = {
                "volume":0,
                "energy":0,
                "duration":0,
                "date":null,
                "member":0,
                "id":null,
                "temp":0,
                "flow":0,
                "name" : app.getUserFirstName()
            };
            
        } else {
            send = app.metricLocale(
                                    {
                                    "volume":results.rows.item(0).volume,
                                    "energy":results.rows.item(0).energy,
                                    "duration":results.rows.item(0).tshower,
                                    "date":results.rows.item(0).cdate,
                                    "member":results.rows.item(0).member,
                                    "id":results.rows.item(0).id,
                                    "temp":results.rows.item(0).temp,
                                    "flow":results.rows.item(0).flow,
                                    "name":results.rows.item(0).name
                                    }
                                    );
        
        }
        
        return send;
        
    },
    showPlotTimeEventChart : function(){
        if($('#showerEfficiency').is(":visible")){
            $('#showerEfficiency').hide();
            $('#placeholder3').show();
        }
    },
    hidePlotTimeEventChart : function(){
        $('#placeholder3').empty().hide();
        $('#showerEfficiency').show();
    },
    plotTimeEvent : function(selector,data){
        this.emptySelector(selector);
        var charts = daiad.charts;
        
        charts.b1.plotForEvent(
                               selector,
                               data,
                               {
                               color:'#fff',
                               bars: false,
                               xaxis: {
                                ticks:1 , // number of X-axis ticks (approx)
                               },
                               }
                               );
        
        /*charts.b1.plotForTimedEvent(
                                    selector,
                                    data,
                                    {
                                    resolution: 60, // seconds
                                    xaxis: {
                                        ticks: 5, // number of X-axis ticks (approx)
                                    },
                                    }
                                    );*/
    },
    getFlowTempforDetailedEventCharts : function(data){
                
        var piece = [],
            Measurement = daiad.model.Measurement,
            length = data.session.measurements.length;
        
        app.events.flow = [];
        app.events.temp = [];
        
        if(length === 0) {
            piece.push(data.session);
        } else {
            piece = data.session.measurements;
        }
        
        for(var i=0; i<piece.length; i++){
            
            var measurement = app.metricLocale({ 'volume' :piece[i].flow, 'temp':piece[i].temperature });

            app.events.flow.push(new Measurement(i, new Date(piece[i].timestamp), measurement.flow.value));
            
            app.events.temp.push(new Measurement(i, new Date(piece[i].timestamp),measurement.temp.value));
            
        }
    },
    setNavigationBackButton : function(){
        if($.mobile.activePage.attr("id") == 'StartCount') {
            $('#real2 .navbar').find('a').attr('href','#CountTimer');
        } else {
            $('#real2 .navbar').find('a').attr('href','#consumption');
        }
    },
    showRealDiv : function(){
        $('.history').hide();
        $('.real').show();
    },
    showHistoryDiv : function(){
        $('.real').hide();
        $('.history').show();
    },
    changeToPage : function(page){
        $.mobile.changePage(page);
    },
    setHistoryDateSelectionAttributes : function(attributes){
        var showerDate = $('#showerDate');
        
        showerDate.attr('sh',attributes.showerId);
        showerDate.attr('dev',attributes.deviceId);
        showerDate.attr('prev',attributes.date);
    },
    historicalDataInDetail : function(args){
        /*{
         'memberId' :results[0].member,
         'memberInfo': memberInfo,
         'showerId' : showerid,
         'deviceId' : deviceid,
         'results' : resuslts
         }*/
        //HISTORICAL DATA
        
        app.showHistoryDiv();
        
        app.setHistoryDateSelectionAttributes(
                                              {
                                              'showerId' : args.showerId,
                                              'deviceId' : args.deviceId,
                                              'date' : args.results.cdate
                                              }
                                              );
       
        app.setEfficiencyImg(
                             $('#showerEfficiency'),
                             args.results.energy
                             );
        
        app.updateDetailedEventPhoto(
                                     $('#DataMemberPhoto'),
                                     args.memberInfo.photo
                                     );
        
        app.updateDetailedEventName(
                                    $('#DataMemberName'),
                                    args.memberInfo.name
                                    );
        
        app.setMembersNameCss(
                              args.memberInfo.name,
                              $('#DataMemberName')
                              );
        
        app.setMembersSelect(
                             args.showerId,
                             args.deviceId,
                             args.memberId
                             );
        
        $('#thisYearCity').attr('data-keys',JSON.stringify(args.results));
        
        app.setShowerProjections(args.results);
        
        app.setProjections(1,args.results);
        
        app.setNavigationBackButton();
        app.changeToPage('#real2');
        
        app.uploadData();
        
    },
    realDataWithMeasurementsInDb : function(args){
        /*{
         'memberId' :results[0].member,
         'memberInfo': memberInfo,
         'showerId' : showerid,
         'deviceId' : deviceid,
         'results' : resuslts
         }*/
        
        var Measurement = daiad.model.Measurement;
        
        for (var i=0; i<args.results.length; i++){
            app.events.flow.push(new Measurement(i, new Date(args.results[i].cdate), args.results[i].flow.value));
            app.events.temp.push(new Measurement(i, new Date(args.results[i].cdate), args.results[i].temp.value));
        } //end for loop
        
        var arr1 = app.events.flow;
        
        var arr2 = app.events.temp;
        
        arr1.sort(function (a, b) {
                  if (a.timestamp > b.timestamp) {
                  return 1;
                  }
                  if (a.timestamp < b.timestamp) {
                  return -1;
                  }
                  // a must be equal to b
                  return 0;
                  });
        
        arr2.sort(function (a, b) {
                  if (a.timestamp > b.timestamp) {
                  return 1;
                  }
                  if (a.timestamp < b.timestamp) {
                  return -1;
                  }
                  // a must be equal to b
                  return 0;
                  });
        
        app.events.flow = arr1;
        app.events.temp = arr2;

        app.showRealDiv();
        
        app.setFullDateTimetoSelector(
                                      args.results[args.results.length - 1].cdate ,
                                      $('#eventDate')
                                      );
        
        app.setEfficiencyImg(
                             $('#showerEfficiency'),
                             args.results[args.results.length - 1].energy.value
                             );

        app.updateDetailedEventPhoto(
                                     $('#DataMemberPhoto'),
                                     args.memberInfo.photo
                                     );
        
        app.updateDetailedEventName(
                                    $('#DataMemberName'),
                                    args.memberInfo.name
                                    );
        
        app.setMembersNameCss(
                              args.memberInfo.name,
                              $('#DataMemberName')
                              );

        app.setMembersSelect(
                             args.showerId,
                             args.deviceId,
                             args.memberId
                             );
       
        $('#thisYearCity').attr('data-keys',JSON.stringify(args.results[args.results.length - 1]));
        
        app.setShowerProjections(args.results[args.results.length - 1]);
        
        app.setProjections(1,args.results[args.results.length - 1]);

        app.setNavigationBackButton();
        
        app.changeToPage('#real2');
        
        app.uploadData();
    
    },
    tempSelectorDetailed : null,
    realDataWithoutMeasurementsInDb : function(args){
        /*{
         'memberId' :results[0].member,
         'memberInfo': memberInfo,
         'showerId' : showerid,
         'deviceId' : deviceid,
         'results' : resuslts
         }*/
        
        app.showLoadingSpinner(app.tempSelectorDetailed);
        
        app.measurements(args.deviceId,parseInt(args.showerId));
        
                         
    },
    processMemberById : function(results){
    
        var back;
        var len = results.rows.length;
        
        if( len === 0 && results.rows.item(0).id===0){
            back = app.getUserMemberProfile();
        }else{
            back = {
                "index":results.rows.item(0).id,
                "name":results.rows.item(0).name,
                "gender" : results.rows.item(0).gender,
                "age":results.rows.item(0).age,
                "photo" : results.rows.item(0).photo,
                "active" : results.rows.item(0).active
            };
        }
        
        return back;
        
    },
    processShowerMeasurements : function(results){
    
        var changed = [];
        
        for (var i=0; i< results.rows.length; i++){
            changed.push(
                         app.metricLocale(
                                          {
                                          volume : results.rows.item(i).volume,
                                          energy : results.rows.item(i).energy,
                                          temp : results.rows.item(i).temp,
                                          category :results.rows.item(i).category,
                                          history:results.rows.item(i).history,
                                          cdate :results.rows.item(i).cdate,
                                          member :results.rows.item(i).member,
                                          duration:results.rows.item(i).tshower,
                                          flow : results.rows.item(i).flow
                                          }
                                          )
                         );
        }
        
        return changed;

    },
    loadMeasurements : function(deviceid,showerid,category){
        
        trans.getAllDataForDeviceWithIdAndShowerid(
                                                   {
                                                   'deviceId' : deviceid,
                                                   'showerId' : showerid
                                                   },
                                                   function(results){
                                                    var data = app.processShowerMeasurements(results);
                                                
                                                    var showerdelete = $('input[name="delete_shower"]');
                                                
                                                    showerdelete.val(showerid);
                                                
                                                    showerdelete.attr('id',deviceid);

                                                   trans.getMemberById(
                                                                       data[0].member,
                                                                
                                                                       function(memberIdDetails){
                                                                 
                                                                        var memberInfo = app.processMemberById(memberIdDetails);
                                                                 
                                                                        if( data.length == 1 && data[0].category == 17 || data.length == 2 && data[0].category == 17 ) {
                                                                            //READ DATA WITHOUT MEASUREMENTS
                                                                       
                                                                            app.measargs = {
                                                                                    'memberId' :data[0].member,
                                                                                    'memberInfo': memberInfo,
                                                                                    'showerId' : showerid,
                                                                                    'deviceId' : deviceid,
                                                                                    'results' : data
                                                                            };
                                                                       
                                                                            app.realDataWithoutMeasurementsInDb({
                                                                                                                'memberId' :data[0].member,
                                                                                                                'memberInfo': memberInfo,
                                                                                                                'showerId' : showerid,
                                                                                                                'deviceId' : deviceid,
                                                                                                                'results' : data
                                                                                                                });
                                                                  
                                                                        } else if(data.length == 1 && data[0].category == 18 ) {
                                                                            //HISTORICAL DATA
                                                                            app.historicalDataInDetail({
                                                                                                   'memberId' :data[0].member,
                                                                                                   'memberInfo': memberInfo,
                                                                                                   'showerId' : showerid,
                                                                                                   'deviceId' : deviceid,
                                                                                                   'results' : data[0]
                                                                                                   });
                                                                  
                                                                        } else if(data.length > 1 && data[0].category == 17 ) {
                                                                            //REAL TIME DATA IN DB
                                                                            app.realDataWithMeasurementsInDb({
                                                                                                             'memberId' :data[0].member,
                                                                                                             'memberInfo': memberInfo,
                                                                                                             'showerId' : showerid,
                                                                                                             'deviceId' : deviceid,
                                                                                                             'results' : data
                                                                                                             });
                                                                  
                                                                        } // end if
                                                                  
                                                                       }// end callback member function
                                                                  
                                                                       ); //end member function
                                                
                                                   }
                                                   );
    },
    setMembersNameCss : function(name,selector){
        if(name.length > 10){
            selector.css({'font-size':'4vw'});
        }
    },
    processLoadMembers : function(data){
        
        $.each(data,function(i){
               var index = this.index;
               var name = this.name;
               var photo = this.photo;
               var age = this.age;
               var gender = this.gender;
               var active = this.active;
               
               app.user.profile.household.members[i].photo = null;
               
               trans.getMemberExists(
                                     index,
                                     function(length){
                                   
                                      var state;
                                   
                                      if(active == true ) {
                                        state = 1;
                                      } else {
                                        state = 0;
                                      }
                                   
                                      if(length === 0){
                                   
                                        if(index === 0 ){
                                     
                                            var info = app.getUserMemberProfile();
                                                photo = info.photo;
                                                gender = info.gender;
                                                name = info.name;
                                        }
                                   
                                        $('#nikolas').append('storing member : ' + JSON.stringify({"index" : index,"name" : name,"age" : age,"gender": gender,"photo" : photo,"active" : state}) + '<br>');
                                   
                                        trans.storeNewMember({"index" : index,"name" : name,"age" : age,"gender": gender,"photo" : photo,"active" : state});
                                   
                                      }else {
                                      
                                        $('#nikolas').append('changing members state');
                                      
                                        trans.updateMemberActiveState({"active" : state,"index" : index});
                                   
                                      }
                                      
                                      }
                                      );
               });
        
    },
    setMembersSelect : function(showerid,deviceid,value){
        
        trans.getAllMembers(
                           function(results){
                           
                           var len = results.rows.length;
                          
                           var members = [];
                          
                           var state;
                          
                           for (var i=0; i<len; i++){
                          
                            if(results.rows.item(i).active === 1 ){state = true;}else{ state = false ;}
                          
                            members.push({
                                       "index":results.rows.item(i).id,
                                       "name" :results.rows.item(i).name,
                                       "age":results.rows.item(i).age,
                                       "gender":results.rows.item(i).gender,
                                       "photo":results.rows.item(i).photo,
                                       "active": state,
                                       });
                            } //for end
                          
                           setMembers(members);
                          
                           });
        
       
        var setMembers = function(data){
            
            $('#showername').empty();
            
            $('#showername').append('<option selected>'+app.appLabels.change+'</option>');
            
            if(parseInt(value) !== 0 && parseInt(value) != 987654321){
                $('#showername').append('<option value="0" sh='+showerid+' dev='+deviceid+'>'+app.getUserFirstName()+'</option>');
            }
            
            $.each(data,function(){
                   
                   if(parseInt(value) != this.index && this.active === true && this.index !== 0){
                   
                        $('#showername').append('<option value='+this.index+' sh='+showerid+' dev='+deviceid+'>'+this.name+'</option>');
                   
                   }
                   
                   });
            
            $('#showername').append('<option value="987654321">'+app.appLabels.other+'</option>');
        
        };
        
        
    },
   
    computeArrow : function(vol,vol2){
        
        if(vol > vol2) {
            return '<img src="img/SVG/ascending.svg" width="15" height="20">';
        } else {
            return '<img src="img/SVG/descending.svg" width="15" height="20">';
        }
        
    },
    countAmphiro : function(){
        
        var count = 0;
        
        $.each(app.user.profile.devices, function(){
               if( this.type == 'AMPHIRO' ) {
                count = count + 1;
               }
               });
        
        return count;
        
    },
    countMeters : function(){
        
        var count = 0;
        
        $.each(app.user.profile.devices, function(){
               if(this.type == 'METER') {
                count = count + 1;
               }
               });
        
        return count;
        
    },
    getAmphiroDeviceKeys : function(){
        //return the amphiro deviceKeys
        var keys = [];
        
        //for each device if type is amphiro push it
        $.each(app.user.profile.devices, function(){
               if(this.type == 'AMPHIRO'){
               keys.push(this.deviceKey);
               }
               });
        return keys;
        
    },
    getGranularityFromGraph : function(){
        
        var index;
        
        if( app.getActivePage() == 'consumption' ) {
            index = $('.TimeTab a.evtActive').index();
        } else {
            index = $('.fullScreenTimeTab a.evtActive').index();
        }
        
        return index;
        
    },
    processTotalVolumePerMember : function(results){
        
        var data = [],current =[],x;
        
        current.push(results.rows.item(0));
        
        for (var i=1; i<results.rows.length; i++){
            
            current.push(results.rows.item(i));
            
            if( current[i-1].indexs == current[i].indexs){
                x = i-1;
                current[x]=null;
                current[i]={
                volume:results.rows.item(i).volume,
                indexs:results.rows.item(i).indexs,
                energy:results.rows.item(i).energy,
                temp:results.rows.item(i).temp,
                duration:results.rows.item(i).duration,
                cdate: results.rows.item(i-1).cdate,
                    member :results.rows.item(i).member,
                id:results.rows.item(i).id,
                category:results.rows.item(i-1).category,
                history:results.rows.item(i-1).history,
                    name : results.rows.item(i).name
                };
                
            }
        } //for end
        
        for (var j=0; j<current.length; j++){
            if(current[j]) data.push(
                                     app.metricLocale(current[j])
                                     );
        }
        
        return data;
        
    },
    processLast300ShowersPerMember : function(results){
        var data = [],current =[],x;
        
        current.push(results.rows.item(0));
        
        for (var i=1; i<results.rows.length; i++){
            
            current.push(results.rows.item(i));
            
            if( current[i-1].indexs == current[i].indexs) {
                x = i-1;
                current[x]=null;
                current[i]={
                volume:results.rows.item(i).volume,
                indexs:results.rows.item(i).indexs,
                energy:results.rows.item(i).energy,
                temp:results.rows.item(i).temp,
                duration:results.rows.item(i).duration,
                cdate: results.rows.item(i-1).cdate,
                member:results.rows.item(i).member,
                id:results.rows.item(i).id,
                category:results.rows.item(i-1).category,
                history:results.rows.item(i-1).history,
                    name : results.rows.item(i).name
                };
                
            }
        } //for end
        
        for (var j=0; j<current.length; j++) {
            if(current[j]) data.push(
                                     app.metricLocale(current[j])
                                     );
        }
        
        return data;
        
    },
    prsMeterConsumption : function(results,consumption){
    
        var dt;
        
        if(!results.rows.item(0).volume) results.rows.item(0).volume = 0;
        
        dt = app.metricLocalemeter(
                                   {
                                   volume:results.rows.item(0).volume,
                                   type:consumption
                                   }
                                   );
        
        return dt;
    },
    prsGetConsumption : function(results){
    
        var dt;
        
        if( results.rows.length === 0 || !results.rows.item(0).volume ) {
            dt = app.metricLocale(
                                  {
                                  volume :0,
                                  energy :0,
                                  flow : 0,
                                  duration:0,
                                  temp :0,
                                  type:consumption
                                  }
                                  );
        } else {
             dt = app.metricLocale(
                                   {
                                    volume : results.rows.item(0).volume ,
                                    energy : results.rows.item(0).energy,
                                    flow : results.rows.item(0).flow,
                                    duration : results.rows.item(0).duration,
                                    temp : results.rows.item(0).temp,
                                    type:consumption
                                   }
                                   );
        }
        
        return dt;
        
    },
    computeAverages : function(){
        trans.getAverages(
                          function(res){
                            app.processGetAverages( app.metricLocale(res) );
                          }
                          );
    },
    processGetAverages : function(data){
        
        if( !data.volume.value ) {
            
            AppModel.consumption = {
                volume:0,
                energy:0,
                temp:0,
                duration :0,
                showers : 0
            };
            
        } else {
            
            AppModel.consumption = {
                volume:data.volume.value,
                energy:data.energy.value,
                temp:data.temp.value,
                duration :data.duration.value,
                showers : data.ct
            };
            
        }
        
    },
    prcGetLastFiveShowers : function(results){
        
        var arr2 = [];
        
        for (var i=0; i<results.rows.length; i++){
            
            arr2.push(
                      app.metricLocale(
                                       {
                                       volume:results.rows.item(i).volume,
                                       energy:results.rows.item(i).energy,
                                       temp:results.rows.item(i).temp,
                                       duration:results.rows.item(i).duration,
                                       date: results.rows.item(i).date,
                                       member :results.rows.item(i).member,
                                       id:results.rows.item(i).id,
                                       name: results.rows.item(i).name
                                       }
                                       )
                      );
        }
        
        return arr2;
        
    },
    prcGetLastTenShowers : function(results){
        
        return app.metricLocale(
                                {
                                volume:results.rows.item(0).volume,
                                energy:results.rows.item(0).energy,
                                temp:results.rows.item(0).temp,
                                flow:results.rows.item(0).flow,
                                duration:results.rows.item(0).dur
                                }
                                );
        
    },
    checkForLoadedScript : function(scr){
    
        return $('script[src="'+scr+'"]').length;
        
    },
    loadScript : function(scrt){
        
        $.getScript(scrt);
        
    },
    changeAppLanguage : function(obj){
       
        if(obj.attr('id') == 0){
           
            obj.attr('id',1);
            
            document.l10n.requestLocales('es');
            
            app.user.location.country == 'Spain';

            app.loadScript(app.scripts.spanish.spt);
            
        }else if(obj.attr('id') == 1){
          
            obj.attr('id',0);
            
            document.l10n.requestLocales('en-US');
            
            app.loadScript(app.scripts.english.spt);
            
        }
    },
    setAppLanguage : function(){
        
        if( app.getUserCountry() == 'Spain'){
            
            moment.locale('es');
            
            document.l10n.requestLocales('es');
            
            app.loadScript(app.scripts.spanish.spt);
            
        }else{
           
            moment.locale('en');
            
            document.l10n.requestLocales('en-US');
            
            app.loadScript(app.scripts.english.spt);
            
        }
    },
    getLocale : function(){
        navigator.globalization.getLocaleName(function (locale) {
                                              
                                              AppModel.user.locale = locale.value;
                                              if(AppModel.user.locale == 'es'){
                                                document.l10n.requestLocales('es');
                                                $('#changeLang').attr('id',1);
                                              }
                                              },function(){
                                                AppModel.user.locale = null;
                                              });
    },
    refreshHouseholdlist: function(){
        
        $('#Householdlist').empty();
        
        var member_gender,member_photo;
        
        trans.getAllMembers(
                            function(results){
                            
                            for (var i=0; i<results.rows.length; i++){
                            
                                if( results.rows.item(i).id != 0 && results.rows.item(i).active == 1 ) {
                            
                                (results.rows.item(i).gender == "MALE") ? member_gender = app.appLabels.male : member_gender = app.appLabels.female;
                            
                                $('#Householdlist').append(
                                                           app.memberTemplate(
                                                                              {
                                                                              id:results.rows.item(i).id,
                                                                              name:results.rows.item(i).name,
                                                                              age:results.rows.item(i).age,
                                                                              gender:member_gender,
                                                                              photo:'data:image/png;base64,'+results.rows.item(i).photo,
                                                                              active: results.rows.item(i).active,
                                                                              }
                                                                              )
                                                           );
                                }

                          
                            } //for end
                            
                            
                            }
                            );

    },
    
    memberAddedProfile : function(){
        app.changeToPage('#Myprofile');
    },
    computeProfileComplete : function(){
        
        var completed = 0;
        
        if(app.countAmphiro() > 0 || app.countMeters() > 0) completed = completed + 25;
        
        if(app.user.profile.photo) completed = completed + 25;
        
        if(app.user.profile.household.totalMembers > 0) completed = completed + 25;
        
        if(app.user.personalEstimates) completed = completed + 25;
        
        $('.profile_bar').css({'width':completed+'%'});
        
    },
    
    getb1NameById : function(id){
        var b1_nm;
        
        var b1_name = getObjects(app.user.profile.devices, 'deviceKey',id);
        
        if(b1_name.length > 0) {
            b1_nm = b1_name[0].name;
        } else {
            b1_nm = 'amphiro b1';
        }
        
        return b1_nm;
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
    onClickMemberFilter : function( obj ) {
    
        var search = obj.attr('id'),
            filter = $('#member_filter'),
            amphiroevents = $('#amphiro_events li');
        
        filter.find('span.meterActive').removeClass('meterActive');
        
        filter.find('span.memberSpanActive').removeClass(' memberSpanActive');
        
        obj.addClass('meterActive');
        
        obj.addClass('memberSpanActive');
        
        amphiroevents.each(function(){
                           
                           if(search == 'all'){
                            $(this).show();
                            return;
                           }
                           
                           if( search == $(this).attr('memid') ){
                            $(this).show();
                           } else {
                            $(this).hide();
                           }
                           
                           });

    },
    appendEventsToList : function(selector,data){
       
        var average = AppModel.consumption;
        
        this.emptyAmphiroListEvents();
        
        this.emptyMeterListEvents();
        
        $.each(data, function(){
               var time = this.cdate,
                memberID = this.member,
                volume = this.volume.value,
                id = this.id,
                index = this.indexs,
                duration = this.duration.value,
                energy = this.energy.value,
                name = this.name,
                category = this.category,
                label = this.volume.label,
                b1 = app.getb1NameById(id),
                template = app.getListTemplate(b1,energy),
                arrow = app.computeArrow( volume , average.volume ),
                day = moment(time).isoWeekday(),
                datee = moment(time).date(),
                month = moment(time).month(),
                completeDate;
               
               (category == 17) ? completeDate = moment.weekdaysShort(day) +','+ datee +'/'+ (month +1) : completeDate = '??';
               
               var tmp = app.showerListTemplate({
                                                member : memberID,
                                                devicekey : id,
                                                data_category : category,
                                                showerId : index,
                                                volume_value : volume.toFixed(2).replace(".", ","),
                                                volume_label : label,
                                                status_arrow : arrow,
                                                duration_value : tm.secondsToTime(duration),
                                                duration_label : '',
                                                date : completeDate,
                                                member_name : name,
                                                template : template,
                                                list_img : 'img/SVG/shower.svg',
                                                right_arrow : 'img/SVG/arrow-list-right.svg'
                                                });
               
                selector.append($(tmp));
               
               });
        
      
    },
    memberTemplate : function(args){
        
        return '<li data-name='+args.id+' class="item-content link"><div class="item-media"><img src='+args.photo+' width="100" height="100" style="background-size:cover;"></div> <div class="item-inner"> <div class="item-title-row"><div class="item-title">'+args.name+'</div><div class="item-after"></div></div><div class="item-subtitle"></div><div class="item-text">'+args.gender+', '+ args.age +'</div></div><div class="item-media removeMember"><img src="img/SVG/remove.svg"></div></li>';
        
    },
    swiperTemplate : function(img,title){
        
        return '<div class="swiper-slide "><div class="swiper-text" ><span>'+img+'</span><a href="#messaging"><span >'+title+'</span></a></div></div>';
        
    },
    getListTemplate : function(nameOfb1,energy){
        
        var template;
        
        if(app.countAmphiro() > 1) {
            
            template = '<span style="text-align:right;">'+nameOfb1+'</span>';
            
        } else {
            
            template = '<span style="text-align:right;">'+app.ComputeEfficiencyRatingFromEnergy(energy)+'</span>' ;
            
        }
        
        return template;
    },
    leftSideTemplate : function(category,time){
        
        var day = moment(time).isoWeekday(),
            datee = moment(time).date(),
            month = moment(time).month(),
            completeDate;
        
        (category == 17) ? completeDate = moment.weekdaysShort(day) +','+ datee +'/'+ (month +1) : completeDate = '??';
        
        return completeDate;
        
    },
    showerListTemplate : function(args){

        return '<li class="item-content" memid='+args.member+' id='+args.devicekey+' category='+args.data_category+' data-name='+args.showerId+'><div class="item-media"><img src='+args.list_img+'></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+args.volume_value+' <span style="font-size:2.2vh;font-family:"opensans-light";">'+args.volume_label+'</span> '+args.status_arrow +'</div><div >'+ args.duration_value+ ''+args.duration_label+'</div></div><div class="item-subtitle"><div class="row"><span>'+args.date+'</span><span style="text-align:center;">'+args.member_name+'</span> '+args.template+'</div></div></div><img src="'+args.right_arrow+'"></li>';
    
    },
    getDevicesControlTemplate : function(numOfDevices,numMeters, idval, uuid, name){
        var tmp;
        
        if( (numOfDevices === 1 && numMeters === 0) || (numOfDevices === 0 && numMeters === 1) ) {
            
            tmp = '<label class="label-checkbox item-content" style="display:none;"><input class="chosenID" id='+idval+' type="radio" name="mydevs" value='+uuid+' data-role="none" ><div class="item-media" ><i class="icon icon-form-checkbox"></i><span style="display: inline;font-family:opensans-light;margin-left:3px;">'+name+'</span></div></label>';
            
        }
        
        if( (numOfDevices >= 1 && numMeters >= 1) || (numOfDevices > 1 && numMeters === 0)) {
            
            tmp = '<label class="label-checkbox item-content" style="display:block;float:left;text-align:center;margin-top:4%;font-size:2.4vh;"><input class="chosenID" id='+idval+' type="radio" name="mydevs" value='+uuid+' data-role="none" ><div class="item-media" ><i class="icon icon-form-checkbox"></i><p class="instr" style="font-family:opensans-light;margin:0;">'+name+'</p></div></label>';
            
        }
        
        return tmp;
        
    },
    meterListTemplate : function(label,timetemplate,volumevalue,volumelabel){
        
        return '<li class="item-content"><div class="item-media" ><img src="img/min_hour.svg"></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+label+'</div><div class="item-after" ></div></div><div class="item-subtitle"><span>' + timetemplate + '         </span><span>   </span><span style="text-align:right;"></span><span style="text-align:right;padding-right: 10px;">'+volumevalue+' ' + volumelabel +'</span></div></div></li>';
        
    },
    getEnergyValueLabel : function(num){
        
        var label,energy;
        
        if(num > 1000) {
            energy = app.watt2kwatt(num);
            label = 'kWh';
            if(energy > 1000) {
                energy = app.watt2kwatt(energy);
                label = 'mWh';
            }
        } else {
            energy = num;
            label = 'Wh';
        }
        return {
            "value" : parseFloat(energy).toFixed(2)/1,
            "label" : label
        };
    },
    getVolumeValueLabel : function(num){
        
        var label,volume;
        
        if(num > 1000) {
            volume = app.liters2Cubic(num);
            label = 'm³';
        } else {
            volume = num;
            label = app.appLabels.volume.short;
        }
        
        return {
            "value" : parseFloat(volume).toFixed(2)/1,
            "label" : label
        };
    },
    getWaterCost : function(){
        
        var amphiro = getObjects(app.user.profile.devices,'type','AMPHIRO'),
            water_cost = getObjects(app.user.profile.devices[0].properties,'key','cost-water'),
            result = water_cost[0].value;
        
        return result;
    },
    getEnergyCost : function(){
        
        var amphiro = getObjects(app.user.profile.devices,'type','AMPHIRO'),
            energy_cost = getObjects(app.user.profile.devices[0].properties,'key','cost-energy'),
            result = energy_cost[0].value;
        
        return result;
        
    },
    computeShowerCostFromEnergy : function(energy){
        return this.watt2kwatt(energy) * this.getEnergyCost();
    },
    computeShowerCostFromWater : function(water){
        return this.liters2Cubic(water) * this.getWaterCost();
    },
    computeCO2 : function(energy){
        return 0.0005925 * energy/1000;
    },
    setShowerProjections : function(data){
        
        var co2 = app.computeCO2( parseInt( data.energy.value ,10 ) ),
            waterdata = $('#waterData'),
            tempdata = $('#tempData'),
            energydata = $('#energyData'),
            effdata = $('#efficiencyData'),
            co2data = $('#co2Data');
      
        waterdata.text(data.volume.value); //volume
        waterdata.next('span').text(data.volume.label); // label
        
        energydata.text(data.energy.value);
        energydata.next('span').text(data.energy.label);
        
        tempdata.text(data.temp.value);
        tempdata.next('span').text(data.temp.label);
        
        effdata.text(app.ComputeEfficiencyRatingFromEnergy(data.energy.value));
        co2data.text(co2.toFixed(2));
      
        var volumpic = new inPictures({
                                      value:data.volume.value,
                                      label:data.volume.label,
                                      selector:$('#vis_volume')
                                      });
        volumpic.volume();
     
        var enepic = new inPictures({
                                    value:data.energy.value,
                                    label:data.energy.label,
                                    selector:$('#vis_energy')
                                    });
        enepic.energy();
        
        var copic = new inPictures({
                                    value:co2,
                                    selector:$('#vis_co2')
                                    });
        copic.co2();
        
        
    },
    setProjections : function(estim,data){
        
        var co2 = this.computeCO2(parseInt( data.energy.value ,10 ) * estim ),
            vl = this.getVolumeValueLabel( data.volume.value * estim ),
            ene = this.getEnergyValueLabel(data.energy.value * estim),
            waterdata = $('#waterData'),
            energydata = $('#energyData'),
            co2data = $('#co2Data');
        
        waterdata.text(vl.value);
        waterdata.next('span').text(vl.label);
        
        energydata.text(ene.value);
        energydata.next('span').text(ene.label);
        
        co2data.text(co2.toFixed(2));
        
    },
    setFullDateTimetoSelector : function(date,selector){
        var evtDate = date,
            check = moment(evtDate),
            month1 = check.month(),
            month = moment.months(month1),
            dayOfMonth  = check.format('D'),
            year = check.format('YYYY'),
            dayOfWeek = check.day(),
            dayName = moment.weekdaysShort(dayOfWeek),
            hoursto = check.format("HH:mm:ss a");
        
        selector.text(dayName +' '+ dayOfMonth +' '+ month + ' ' +year + ',' +hoursto);
    },
    viewRealPacket : function(param){
        
        var data = app.metricLocale(
                                    {
                                    volume : param.volume,
                                    energy : param.energy,
                                    duration : param.duration
                                    }
                                    );
        
        var hi = new dashboardGauge({
                                    text : app.appLabels.current,
                                    high : {
                                    value : (data.volume.value).toFixed(2).replace(".", ","),
                                    label : data.volume.label
                                    },
                                    mid : {
                                    value : data.energy.value,
                                    label : data.energy.label
                                    },
                                    low : {
                                    value : tm.secondsToMinutes( data.duration.value ),
                                    label : 'min'
                                    }
                                    });
        
        hi.render();
        hi.setBudget();
        
    },
    showDataToTimer : function(param){
        
        if( app.getActivePage() !== "StartCount" || AppModel.mutex ) {
          return;
        }
        
        var sh = new showertimer(app.user.settings.timer);
        sh.showTimerProgress(param);
        
    },
    handShake : function(){
        
        if(AppModel.mode === 0 || app.getActivePage() == 'install_part_7' || app.getActivePage() == 'AmphiroSetName' || app.getActivePage() == 'InstallMoreB1') return;
      
        var mode = app.getModeFromLocalStorage();
      
        if(mode == 0 ) mode = 1;

        if( app.user.profile.mode != mode && app.user.session){
            
            if(app.user.profile.mode == 1){
                //mobile on
                app.setModeToLocalStorage(1);
                
                app.keepLivePage('dashboard');
                
            }else if(app.user.profile.mode == 2){
                //mobile off
                app.setModeToLocalStorage(2);
                
            }else if(app.user.profile.mode == 3){
                //mobile learning
                app.setModeToLocalStorage(3);
            }else{
                //mobile kill
                app.setModeToLocalStorage(4);
            }
            
            app.notifyprofile(app.user.profile.version);
            
            app.renderMobileHome();
        }
        
        if(app.user.profile.social != app.user.settings.social ){
            var hrefs = $('.HomeToolbar .toolbar-inner a:nth-child(3)'),
                panelrefs = $('#mypanel li:eq(4)');
        
            if(app.user.profile.social){
                hrefs.show();
                panelrefs.show();
            } else {
                hrefs.hide();
                panelrefs.hide();
            }
            
            app.user.settings.social = app.user.profile.social;
            
            app.setSocialToLocalStorage(app.user.profile.social);
            
            app.notifyprofile(app.user.profile.version);
            
            app.saveProfile({'configuration' : app.getUserAppPreferences()});
            
            app.renderMobileHome();
            
        }
        
    },
    checkForActivePin : function(){
        var activetoken = $('#active_token');

        if( app.user.authentication ){
            
            if( moment().valueOf() < moment(app.user.authentication.time + 9000 * 1000 ).valueOf() ){
                activetoken.show();
            }else{
                if( activetoken.is(":visible") ) {
                    activetoken.hide();
                }
            }
        } else {
            if( activetoken.is(":visible") ) {
                activetoken.hide();
            }
        }
    },
    showChangePassSuccessMessage : function(){
         $('#passwordChangedSuccess').show().delay(5000).hide(0);
    },
    showChangePassErrorMessage : function(){
        //$('#passwordChangedError').show().delay(5000).hide(0);
    },
    clearResetPinFormFields : function(){
        
        $('#pin_reset_details').empty();
        
        $('#form_reset_pin input').each(function(){
                                          $(this).val('');
                                          $(this).css({'border-color':'#2D3580','border-width':'1px'});
                                          });
        
        $('#form_reset_pin .error').each(function(){
                                           $(this).empty();
                                           });
    },
    clearChangePassFormFields : function(){
        
        $('#change_pass_details').empty();
        
        $('#form_change_pass input').each(function(){
                                          $(this).val('');
                                          $(this).css({'border-color':'#2D3580','border-width':'1px'});
                                          });
        
        $('#form_change_pass .error').each(function(){
                                     $(this).empty();
                                     });
        
    },
    setMembersFormImg : function(){
        
        $('#memberPhoto').attr('src','img/SVG/daiad-consumer.png');
        
        $('#memberUri').attr('name','img/SVG/daiad-consumer.png');
    
    },
    clearMemberFormFields: function(){
        
        $('#memberValidate').empty();
        
        $('#memberForm input').each(function(){
                                    $(this).val('');
                                    $(this).css({'border-color':'#2D3580','border-width':'1px'});
                                    });
        
        $('#memberForm .error').each(function(){
                                    $(this).empty();
                                    });
    },
    clearLoginFields : function(){
        
        $('#login_details').empty();
        
        $('#loginform input').each(function(){
                                   $(this).css({'border-color':'#2D3580','border-width':'1px'}).val('');
                                   });
        
        $('#loginform .error').each(function(){
                                   $(this).empty();
                                   });
        
        if ($('#submitlog1').is(":hidden")) {
            
            $('#submitlog1').next('.prelolo').hide();
            
            $('#submitlog1').show();
            
        }

    },
    clearResetFormFields : function(){
        
        $('#details_form_reset').empty();
        
        $('#form_reset input').each(function(){
                                    $(this).css({'border-color':'#2D3580','border-width':'1px'}).val('');
                                    });
        
        $('#form_reset .error').each(function(){
                                    $(this).empty();
                                    });
    },
    clearPairFormFields : function(){
        
        $('#pair_details').empty();
        
        $('#pairForm input').each(function(){
                                  $(this).css({'border-color':'#2D3580','border-width':'1px'}).val('');
                                  });
        
        $('#pairForm .error').each(function(){
                                     $(this).empty();
                                     });
    },
    hideSocialComparisons : function(){
        var hrefs = $('.HomeToolbar .toolbar-inner a:nth-child(3)'),
            panelrefs = $('#mypanel li:eq(4)');
        
        if( app.user.settings.social != app.user.profile.social ) {
            if(!app.user.settings.social){
                hrefs.hide();
                panelrefs.hide();
            }
            return;
        }
        
        if( app.user.settings.social && app.user.profile.social ) {
            hrefs.show();
            panelrefs.show();
        } else {
            hrefs.hide();
            panelrefs.hide();
        }
        
    },
    showSocialComparisons : function(){
        var hrefs = $('.HomeToolbar .toolbar-inner a:nth-child(3)'),
            panelrefs = $('#mypanel li:eq(4)');
        
        hrefs.show();
        panelrefs.show();
    },
    getWholeComparisonData : function(time){
        
        trans.selectComparison(time,function(results){
                               
                               var len = results.rows.length;
                               
                               if(len === 0){
                             
                                    app.getComparisonData(moment().valueOf());
                             
                               } else{
                             
                                app.user.profile.comparison = {};
                             
                                app.user.profile.comparison.monthlyConsumtpion =  [];
                             
                                app.user.profile.comparison.waterIq =  [];
                             
                                app.user.profile.comparison.dailyConsumtpion = [];
                             
                                for (var i=0; i<len; i++){
                                    if(results.rows.item(i).type == 'm'){
                                        app.user.profile.comparison.monthlyConsumtpion.push(JSON.parse(results.rows.item(i).data));
                                    } else if(results.rows.item(i).type == 'q') {
                                        app.user.profile.comparison.waterIq.push(JSON.parse(results.rows.item(i).data));
                                    } else if(results.rows.item(i).type == 'd'){
                                        if(moment(time).startOf('month').valueOf() == results.rows.item(i).reference){
                                            app.user.profile.comparison.dailyConsumtpion.push(JSON.parse(results.rows.item(i).data));
                                        }
                                    }
                                } //for end
                             
                                                            
                                app.setComparisoData(time);
                             
                             
                             } //else end
                             
                             });
    },
    socialMeterChanged : function(obj,e){
        e.preventDefault();
        var index = obj.index(),
            tb0 = $('.socialTables:eq(0)'),
            tb1 = $('.socialTables:eq(1)'),
            tb2 = $('.socialTables:eq(2)'),
            tb3 = $('.socialTablesRank'),
            tb4 = $('.calendar_social');
        
        if(index === 0) {
            tb1.hide();
            tb3.hide();
            tb2.show();
            tb0.show();
            tb4.show();
        } else {
            tb2.hide();
            //tb1.show();
            tb3.show();
            tb0.hide();
            tb4.hide();
        }
    },
   
    clearDetailedEventsView : function(){
        $('.mymetrics a.evtActive').removeClass('evtActive');
        $('.mymetrics span.msgActive').removeClass(' msgActive');
        $('.mymetrics a:eq(0)').addClass('evtActive');
        $('.mymetrics a:eq(0)').find('span').addClass('msgActive');
        $('.eventChoices a.evtActive').removeClass('evtActive');
        $('.eventChoices span.msgActive').removeClass(' msgActive');
        $('.eventChoices a:eq(0)').addClass('evtActive');
        $('.eventChoices a:eq(0)').find('span').addClass('msgActive');
        $('.pic-choices a.active').removeClass('active');
        $('.pic-choices a:eq(0)').addClass('active');
        $('.choicesStats').hide();
        $('.choicesStats:eq(0)').show();
        $('#placeholder3').empty().show();
        $('#showerDate').val('');
        $('.history p:eq(2)').show();
        $('.history p:eq(3)').hide();
        $('#showerEfficiency').hide();
        $('#thisYearCity ul').hide();
        $('#thisYearCity ul:eq(0)').show();
        $('.inpictures p').empty();
        app.events.flow.length = 0;
        app.events.temp.length = 0;
    },
    clearSettingsPage : function(){
        $('#decivename').closest('.item-content').hide();
        $('#decivename').closest('.item-content').prev('.item-content').show();
        $('.doneSettings').hide();
        $('.undoSettings').hide();
        $('.devSettings').show();
        $('#device_set li').each(function(){
                                 $(this).find('.resliders').hide();
                                 $(this).find('.resliders_labels').hide();
                                 });
    },
    doneDeviceSettings : function(event){
        //get object from devices array
        var devKey = $('#devName').attr('data-key');
        
        var amphiro = getObjects(app.user.profile.devices, 'deviceKey',devKey);
        
        var device = amphiro[0];
        //hide heating efficiency radio inputs
        $('.resliders_labels').hide();
        //for each field input
        $('.resliders .item-input input,.resliders_labels input:checked').each(function(){
                                                                              
                                                                               var properties;
                                                                               
                                                                               var value =  $(this).val();
                                                                              
                                                                               var key = $(this).attr('id');
                                                                              
                                                                               //value must be numeric
                                                                               
                                                                               if ( $.isNumeric( value ) ) {
                                                                               
                                                                                //heating system does not have input value - > its a radio box
                                                                                if($(this).attr('id') == 'heating-system'){
                                                                                    var value_t =  $(this).closest('label').find('.item-title').text();
                                                                                    $(this).closest('li').find('span:eq(0)').text(value_t);
                                                                                    properties = getObjects(device.properties, 'key', key);
                                                                                    //update new settings
                                                                                    properties[0].value = value;
                                                                                    //heating efficiency range from 0 - 100. its a percentage.
                                                                                }else if($(this).attr('id') == 'heating-efficiency'){
                                                                                    if(value > 100){
                                                                                        $(this).closest('li').find('.resliders .item-input').css({'border-color':'red','border-width':'1px'});
                                                                                        var text =  $(this).closest('li').find('.item-title').text();
                                                                                        var placeholder =  text + ' <= 100%';
                                                                                        $(this).closest('li').find('.resliders .item-input input').val('').attr('placeholder',placeholder);
                                                                                    }else{
                                                                                        $(this).closest('li').find('span:eq(0)').text(value);
                                                                                        $(this).closest('.resliders').hide();
                                                                                        $(this).closest('li').find('.resliders .item-input').css({'border':'1px solid #ddd'});
                                                                                        //get the properties of the chosen device
                                                                                        properties = getObjects(device.properties, 'key', key);
                                                                                        //update new settings
                                                                                        properties[0].value = value;
                                                                                    }
                                                                                }else{
                                                                                    $(this).closest('li').find('span:eq(0)').text(value);
                                                                                    $(this).closest('.resliders').hide();
                                                                                    $(this).closest('li').find('.resliders .item-input').css({'border':'1px solid #ddd'});
                                                                                    //get the properties of the chosen device
                                                                                    properties = getObjects(device.properties, 'key', key);
                                                                                    //update new settings
                                                                                    properties[0].value = value;
                                                                                }
                                                                               //if its not numeric set error css
                                                                               }else{
                                                                                $(this).closest('li').find('.resliders .item-input').css({'border-color':'red','border-width':'1px'});
                                                                               }
                                                                               });
        //if every resliders is closed then change done -> settings
        if($('.resliders > :hidden').length === $('.resliders').length){
            
            $('.doneSettings').hide();
            
            $('.undoSettings').hide();
            
            $('.devSettings').show();
            
            var prop = new deviceProperty(device);
            prop.settings();
            
        }
        
        event.preventDefault();
    },
    openDeviceSettingsList : function(obj,e){
        obj.hide();
        //show 'OK' image
        obj.next('img').show();
        //open all fields
        $('.resliders').toggle();
        $('.resliders_labels').toggle();
        e.preventDefault();
    },
    showEditDeviceNameField : function(obj){
        obj.closest('.item-content').hide();
        obj.closest('.item-content').next('.item-content').show();
        obj.closest('.item-content').next('.item-content').find('#decivename').val('');
    },
    hideDeviceNameField : function(obj){
        obj.closest('.item-content').hide();
        obj.closest('.item-content').prev('.item-content').show();
    },
    onChangeDeviceName : function(obj,devicekey){
        
        var results = getObjects(app.user.profile.devices, 'deviceKey', devicekey);
        
        results[0].name = obj.val();
        
        var prop = new deviceProperty(results[0]);
        prop.name();
        
        app.setUserToLocalStorage(JSON.stringify(app.user));
    },
    onChangeSystemUnit : function(obj,e){
        
        var valueSelected,
            metricSelected;
        
        if(obj.is(':checked')) {
            
            valueSelected = 1;
            
            metricSelected = 'IMPERIAL';
        
        } else {
        
            valueSelected = 0;
            
            metricSelected = 'METRIC';
        
        
        }
        
        app.user.settings.unit = valueSelected;
        
        app.user.profile.unit = metricSelected;
        
        app.setAppDataUnit(valueSelected);
        
        app.getMetrics();
        
        app.refreshMainDashboard();
        
        app.checkBluetoothUnitOption(valueSelected);
        
        app.saveProfile({'unit' : metricSelected,'configuration' : app.getUserAppPreferences() });
        
        e.preventDefault();
        
    },
    checkBluetoothUnitOption : function(valueSelected){
    
        var obj = $('input[name=my_data_unit]');
        
        if ( obj.is(':checked') ) {
            
            if( valueSelected === 1 ) {
                
                app.createB1Request(
                                    app.getImperialDisplayValues()
                                    );
            
            } else {
            
                app.createB1Request(
                                    app.getMetricDisplayValues()
                                    );
            
            }
        
        } else {
           
            app.clearB1PendingRequests();
       
        }
        
    },
    onChooseDeviceFromList : function(obj){
        
        var deviceId = obj.attr('data-name');
                
        var dev = getObjects(app.user.profile.devices, 'deviceKey', deviceId);
        
        $('#devName').attr('data-key',deviceId);
                
        $('#devName').text(dev[0].name);
        
        $('#devu').text(tm.timeConverter(dev[0].registeredOn));
        
        $('#devt').text(tm.timeConverter(JSON.parse(app.getAmphiroUpdateDate())));
    
    },
    onClickListOfShortcuts : function(obj){
        
        $('.ConfigElements a').each(function(){ //remove attribute name from each shortcut - whether exists or not
                                    $(this).removeAttr('name');
                                    });
        
        $('#configurelist label').each(function(){ //show everything in shortcut page
                                       $(this).show();
                                       $(this).find('input').removeAttr('checked');
                                       });
        
        var id = obj.attr('id'); //hide active shortcuts from the menu
        
        $('.valChecks[id="'+id+'"]').attr( 'checked', true );
        
        $.each(app.user.settings.mydashenabled,function(){
               $('.valChecks[id="'+this.id+'"]').closest('.item-content').attr('disabled',true);
               });
        
        obj.attr('name','clicked'); //add attribute name as clicked to this element!
        
    },
    onChangeShortcuts : function(obj){
        var id_clicked;
        
        id_clicked = $('.ConfigElements').find('a[name="clicked"]').attr('id'); //find the already clicked ID
        
        var id_index= $('.ConfigElements').find('a[name="clicked"]').index(); //and the position
        
        var id = obj.attr('id'); //keep the new - changed id
        
        var title1 = obj.closest('label').find(' .item-title').text(); //keep the new - changed title
        
        $('.ConfigElements ').find('a').eq(id_index).find('.item-title').text(title1); //set the new title
        
        $('.valChecks[id="'+id_clicked+'"]').closest('.item-content').removeAttr('disabled'); //find the active object
        
        var results = getObjects(app.user.settings.mydashenabled, 'id', id_clicked);
       
        results[0].id = id;  //and replace with new  id/title
        
        results[0].title = title1;
        
        id_clicked = $('.ConfigElements').find('a[name="clicked"]').attr('id',id); //set new id to the new clicked element - for radio changes without changing the page
        
        app.setUserToLocalStorage(JSON.stringify(app.user)); //save - done!
        
        app.saveProfile({'configuration' : app.getUserAppPreferences()});
        
        app.refreshMainDashboard();
       
    },
    onChangeCentralGaugeWaterView : function(obj){
        
        app.user.settings.consumptionChoice = obj.attr('id');
        
        app.refreshMainDashboard();
        
        app.setUserToLocalStorage(JSON.stringify(app.user));
        
        app.saveProfile({'configuration' : app.getUserAppPreferences()});
        
    },
    onChooseOptionInDetailedEvent : function(obj){
        $('.mymetrics a.evtActive').removeClass('evtActive');
        $('.mymetrics span.msgActive').removeClass(' msgActive');
        obj.addClass(' evtActive');
        obj.find('span').addClass('msgActive');
        var metrics = obj.index();
        if(metrics == 0){
            app.showPlotTimeEventChart();
            app.plotTimeEvent($('#placeholder3'),app.events.flow);
        }else if(metrics == 1){
            app.showPlotTimeEventChart();
            app.plotTimeEvent($('#placeholder3'),app.events.temp);
        }else{
            app.hidePlotTimeEventChart();
        }
    },
    onChooseDetailedStatistics : function(obj){
        var estimation;

        var index = obj.index();

        var tempdata = $('#tempData').closest('li'),
            effdata = $('#efficiencyData').closest('li'),
            inpictures = $('.inpictures');
        
        var data = $('#thisYearCity').attr('data-keys');
        
        
        $('.eventChoices a.evtActive').removeClass('evtActive');
        $('.eventChoices span.msgActive').removeClass(' msgActive');
        
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        
        $('.choicesStats:visible').hide();
        $('.choicesStats:eq('+obj.index()+')').show();
    
        
        if( index === 0) {
            estimation = 1;
            tempdata.show();
            effdata.show();
            inpictures.show();
        } else if( index === 1) {
            estimation = 365;
            tempdata.hide();
            effdata.hide();
            inpictures.hide();
        } else {
            estimation = 40000;
            tempdata.hide();
            effdata.hide();
            inpictures.hide();
        }
        
        app.setProjections(estimation,JSON.parse(data));
        
    },
    onChangeMeterSwitcher : function(obj){
        
        var consumption = parseInt(app.user.settings.consumptionChoice , 10),
            consumptionEvent =  $('.consumptionEvent label');
        
        if (obj.is(":checked")){ //meter
        
            app.user.settings.meter_active = 1;
            //hide 'latest event'
            consumptionEvent.eq(0).hide();
            //hide dailys consumption
            consumptionEvent.eq(2).hide();
            //show yesterday's consumption
            consumptionEvent.eq(1).show();
            //meter is active and if shower consumption is 0 or 1 then set meter consumption to 0(yesterday consumption)
            if(consumption == 0 || consumption == 1){
                //change to 0 because daily consumption doesn't exist on meters
                app.user.settings.consumptionChoice = 0;
                //change the attribute to checked
                consumptionEvent.eq(0).find('input').prop( 'checked', true );
            }else{
                // if other consumption type then set appropriate choice
                $('.consumptionEvent label input[id="'+consumption+'"]:radio').prop( 'checked', true );
            }
            
            //show and hide the list of complications
            $('.ConfigChs:eq(0)').hide();
            
            $('.ConfigChs:eq(1)').show();
            
            app.user.settings.mydashenabled.length = 0;

            $('.configuremeterlist label').each(function(){

                                                app.user.settings.mydashenabled.push(
                                                                                     {
                                                                                     'title' : $(this).find('.item-title').text(),
                                                                                     'id' : $(this).find('input').attr('id')
                                                                                     }
                                                                                     );
                                                });
            
        } else { //amphiro
            
            app.user.settings.meter_active = 0;
            
            consumptionEvent.eq(0).show();
            
            consumptionEvent.eq(1).hide();
            
            consumptionEvent.eq(2).show();
            
            if(consumption === 0) {
                
                consumptionEvent.eq(0).find('input').prop( 'checked', true );
            
            } else {
            
                $('.consumptionEvent label input[id="'+consumption+'"]:radio').prop( 'checked', true );
           
            }
            
            $('.ConfigChs:eq(1)').hide();
            
            $('.ConfigChs:eq(0)').show();
            
            app.user.settings.mydashenabled = [{id:8,title:'Duration'},{id:2,title:'Temperature'},{id:6,title:'Timer'}];
            
        }
        
        $.each( app.user.settings.mydashenabled , function(i){
               $('.ConfigElements ').find('a').eq(i).find('.item-title').text(this.title);
               $('.ConfigElements ').find('a').eq(i).attr('id',this.id);
               });
        
        app.refreshMainDashboard();
        
        app.saveProfile({'configuration' : app.getUserAppPreferences()});
        
        app.setUserToLocalStorage(JSON.stringify(app.user));
        
    },
    onChangeShowerDate : function(obj,e){
        
        var valueSelected  = obj.val(),
            shower = obj.attr('sh'),
            device = obj.attr('dev'),
            eventdate = new Date(valueSelected).getTime();
        
        if(isNaN(eventdate) === false) {
            
            trans.updateShowerDate(eventdate,17,false,shower,device);
            
        }
        
        e.preventDefault();
        
    },
    onFocusShowerDateField : function(obj){
        
        var thaday = moment().format('YYYY-MM-DD');
        
        obj.prop('type','date');
        
        obj.val(thaday);
    
    },
    removeUserMember : function(obj,e){
        
        var rm = new profileManager(
                                    {
                                    "active" : 0,
                                    "index" : obj.closest('li').attr('data-name')
                                    }
                                    );
        rm.delete_member();
        
        e.preventDefault();
    },
    onChangeShowerMemberName : function(obj,e){
        
        var optionSelected = obj.find("option:selected"),
            valueSelected  = optionSelected.val(),
            shower = optionSelected.attr('sh'),
            device = optionSelected.attr('dev');
        
        if(parseInt(valueSelected) == 987654321){
            app.changeToPage('#addmember');
            return;
        }
        
        trans.getMemberById(
                            valueSelected,
                            function(res){
                         
                                var memberInfo = app.processMemberById(res);
                         
                                app.updateDetailedEventPhoto($('#DataMemberPhoto'),memberInfo.photo);
                         
                                app.updateDetailedEventName($('#DataMemberName'),memberInfo.name);
                         
                                app.setMembersSelect(shower,device,valueSelected);
                         
                                trans.updateShowerUser(valueSelected,device,shower);
                         
                                trans.insertLabelData(
                                                      {
                                                      device : device,
                                                      shower: shower,
                                                      index : valueSelected,
                                                      timestamp : new Date().getTime()
                                                      }
                                                      );
                          
                                app.uploadLabeledData();
                          
                                trans.getTotalVolumePerMember(
                                                              function(data){
                                                                var rk = new ranking();
                                                                rk.setRanking(app.processTotalVolumePerMember(data));
                                                              }
                                                              );
                          
                         
                            }
                            );
        
        e.preventDefault();
    },
    calendarNextArrowsStatus : function(gran,nextDate){
        
        if( gran == 0 ) {
            if( moment(nextDate).add(1,'day').valueOf() >  moment().subtract(1,'day').valueOf() ) $('#goforward').attr('disabled',true);
        } else if(gran == 1) {
            if( moment(nextDate).add(1,'week').valueOf() >  moment().valueOf() ) $('#goforward').attr('disabled',true);
        } else if(gran == 2) {
            if( moment(nextDate).add(1,'month').valueOf() >  moment().valueOf() ) $('#goforward').attr('disabled',true);
        } else {
            if( moment(nextDate).add(1,'month').valueOf() >  moment().valueOf() ) $('#goforward').attr('disabled',true);
        }
    },
    
    sortDescending : function(arr){
       
        arr.sort(function (a, b) {
                if (a.value < b.value) {
                return 1;
                }
                if (a.value > b.value) {
                return -1;
                }
                // a must be equal to b
                return 0;
                });
        
        return arr;
        
    },
    sortAscending : function(arr){
    
        arr.sort(function (a, b) {
                  if (a.value > b.value) {
                  return 1;
                  }
                  if (a.value < b.value) {
                  return -1;
                  }
                  // a must be equal to b
                  return 0;
                  });
    
        return arr;
        
    },
    setCancelRef : function(){
        
        var search = findDeviceIndex(app.user.profile.devices, 'type', 'AMPHIRO'),
            mode = app.getModeFromLocalStorage(),
            cancel = $('a.cancel_instructions');
        
        if(search !== null && (mode == 1 || mode == 0)) {
            cancel.attr('href','#Account');
        } else {
            cancel.attr('href','#install_part_1');
        }
        
    },
    setFullScreenChartTextsLabels : function(){
        var metric,label,txt,active,
            deviceType = this.getMeterTypeCheckbox(),
            $screenTimeLimit = $('.fullScreenTimeTab'),
            $screenTabLimit = $('.fullScreenShowerTab'),
            $metricType =  $('#metricFullChart'),
            $textField = $('#devicesFullChart');
     
        if(deviceType == 1){   //its amphiro
            var deviceName =  this.getcheckedDeviceName(),
                type = $('.TypeTab a.typeActive').index();
            
            active = $('.ShowerTab a.evtActive').index();
            
            $screenTabLimit.find('a.evtActive').removeClass('evtActive ');
            $screenTabLimit.find('span.msgActive').removeClass(' msgActive');
            $screenTabLimit.find('a:eq(3)').addClass('evtActive');
            $screenTabLimit.find('a:eq(3)').find('span').addClass('msgActive');
           
            if(type == 0) {
                metric = $('.tabTimer a[name="volume"]').find('span').text();
                label = app.appLabels.volume.short;
            } else if(type == 1) {
                metric = $('.tabTimer a[name="duration"]').find('span').text();
                label = app.appLabels.duration.short;
            } else if(type == 2) {
                metric = $('.tabTimer a[name="energy"]').find('span').text();
                label = app.appLabels.energy.short;
            } else {
                metric = app.appLabels.temperature.name;
                label = app.appLabels.temperature.short;
            }
            
            if ($screenTabLimit.is(":hidden")) {
                $screenTimeLimit.hide();
                $screenTabLimit.show();
            }
            
            txt = metric +' ('+ label +') ';
            
            $metricType.text(txt);
            $textField.empty().text(deviceName);

        }else{
            //its SWM
            var mainChartText = $('#ThisDay').text();
            
            active = $('.TimeTab a.evtActive').index();
          
            $screenTimeLimit.find('a.evtActive').removeClass('evtActive ');
            $screenTimeLimit.find('span.msgActive').removeClass(' msgActive');
            $screenTimeLimit.find('a:eq('+active+')').addClass('evtActive');
            $screenTimeLimit.find('a:eq('+active+')').find('span').addClass('msgActive');
           
            metric = $('.tabTimer a[name="volume"]').find('span').text();
            label = app.appLabels.volume.short;
            txt = metric +' ('+ label +') ';
          
            if ($screenTimeLimit.is(":hidden")) {
                $screenTabLimit.hide();
                $screenTimeLimit.show();
            }
          
            $metricType.text(txt);
            $textField.empty().text(mainChartText);
        }
        
        this.keepLivePage($.mobile.activePage.attr("id"));
    },
    getBudgetPercent : function(value,label){
        
        var budgetPercent,
            bdt = app.user.profile.dailyAmphiroBudget,
            consumption = parseInt(app.user.settings.consumptionChoice,10);
        
        if(!consumption) consumption = 1;
        if(!bdt) bdt = 200;
        if(label != 'lt') value = value * 1000;
        
        if(consumption === 2) {
            budgetPercent = ( value / (bdt * 7) ) * 100; //week
        } else if(consumption === 3) {
            budgetPercent = ( value / (bdt * 30) ) * 100; //month
        } else if(consumption === 4) {
            budgetPercent = ( value / (bdt * 365) ) * 100; //year
        } else {
            budgetPercent = ( value / bdt ) * 100; //latest - daily
        }
        
        return parseInt(budgetPercent,10);
        
    },
    onChangeAmphiroDisplay : function(obj){
        
        if (obj.is(":checked")) {
            
            if( parseInt( app.getAppDataUnit() ) === 1 ) {
                app.createB1Request( app.getImperialDisplayValues() );
            }else{
                app.createB1Request( app.getMetricDisplayValues() );
            }
            
        } else {
            
            app.clearB1PendingRequests();
            
        }
    },
    createB1Request : function(toWrite){
        
        $.each(app.user.profile.devices,function(i){
               
               if ( this.type == 'AMPHIRO' ) {
                this.version = null;
                this.pendingRequests = [];
                this.pendingRequests.unshift(
                                            {
                                            fn:11,
                                            data:toWrite,
                                            id:i,
                                            block:3
                                            },
                                            {
                                            fn:11,
                                            data:toWrite,
                                            id:i,
                                            block:4
                                            }
                                            );
               }
               
               });
        
        app.setUserToLocalStorage(JSON.stringify(app.user));
        
    },
    clearB1PendingRequests : function(){
        
        $.each(app.user.profile.devices,function(i){
               
               if(this.type == 'AMPHIRO'){
               
                    findAndRemove(app.user.profile.devices[i].pendingRequests,'block',3);
               
                    findAndRemove(app.user.profile.devices[i].pendingRequests,'block',4);
               
               }
               
               });
    },
    waitDeviceConnection : function(){
        
        if ( app.getSystemPlatform() === 'ios' ) {
           
            AppModel.background = 1;
            
            for(var dev=0; dev<app.user.profile.devices.length; dev++){
                
                if(app.user.profile.devices[dev].type == 'AMPHIRO'){
                
                    if(app.user.profile.devices[dev].pendingRequests === undefined ) app.user.profile.devices[dev].pendingRequests =[];
                    app.user.profile.devices[dev].pendingRequests.push({fn:0,d:dev});
                    
                    app.BluetoothSupervisor(dev);
                
                }
            
            }
         
        }
        
    },
    clearDeviceConnection : function(){

        if ( app.getSystemPlatform() === 'ios' ) {
            
            AppModel.background = 0;
            
            for(var dev=0; dev<app.user.profile.devices.length; dev++){
            
                if(app.user.profile.devices[dev].type == 'AMPHIRO' ){

                    if(app.user.profile.devices[dev].pendingRequests === undefined ) app.user.profile.devices[dev].pendingRequests =[];
                    findAndRemove(app.user.profile.devices[dev].pendingRequests,'fn',0);
                
                }
            
            }
        
        }
        
    },
    checkingTimes : 0,
    checkPendingRequests : function(){
        
        if(app.checkingTimes === 1) return false;
        
        app.checkingTimes = 1;
        
        setTimeout(function(){
                   
                   if(app.getSystemPlatform() === 'android' ) {
                   
                   setInterval(function(){
                    
                               $.each(app.user.profile.devices, function(i){

                                      if( app.user.profile.devices[i].pendingRequests.length > 0 && app.user.profile.devices[i].availability) {
                                      
                                        app.user.profile.devices[i].pendingRequests.length = 0;
                           
                                      }
                           
                                      });
                    
                               },60000);
                   
                   }
                   
                   },30000);
    
    },
    times : 0,
    loadHistoricalData : function(param){
        
        if(this.times >= 1) return false;
        
        var showersToRequest;

        var deviceindex = findDeviceIndex(app.user.profile.devices, 'deviceKey', param.id);
        
        var diff = param.showerId - 1;
        
        if( diff > 1){
            
            for(var i = 1; i<=param.showerId; i+=10){
                
                if(i + 10 > param.showerId ){
                    
                    showersToRequest = {
                    first: i + 1 ,
                    last: param.showerId -1
                    };
                    
                }else{
                    showersToRequest = {
                    first: i + 1 ,
                    last: i + 10
                    };
                }
                
                app.user.profile.devices[deviceindex].pendingRequests.push({fn:5,data:showersToRequest});
                
                this.times = 1;
            }
            
        }
        
    },
    requestFromDevice : function(param){
        
        if(this.times >= 1) return false;
    
        this.times = 1;
        
        var currentShower = param.showerId;
        
        var activeDevice = param.id;
        
        trans.getShowersFromDevice(
                                   activeDevice,
                                   function(results){
                                
                                   var len = results.rows.length, initial, missing = [];
                                   
                                   if(currentShower - len <= 1) return;
                                 
                                   if( currentShower - results.rows.item(len - 1).indexs <= 0){
                                        initial = 1;
                                   } else {
                                        initial = currentShower  - 240;
                                   }
                                   
                                   if(results.rows.item(0).indexs > 1 ){
                                        missing.push(
                                                     {
                                                     "first" : initial,
                                                     "last" : results.rows.item(0).indexs - 1,
                                                     "id" : activeDevice
                                                     }
                                                     );
                                   }
                                   
                                   for(var j = initial; j<len; j++) {
                                        var index_end = results.rows.item(j).indexs,
                                            index_start = results.rows.item(j-1).indexs,
                                            diff = index_end - index_start;
                                   
                                        if(diff > 1 ) {
                                            missing.push(
                                                         {
                                                         "first" : index_start + 1,
                                                         "last" : index_end - 1,
                                                         "id" : activeDevice
                                                         }
                                                         );
                                        }
                                   }
                                                                  
                                   var test = [], k = 0 , showersToRequest;
                                   
                                   if(missing.length === 0) {
                                        test = [];
                                   } else {
                                        test.push(missing[0]);
                                   }
                                   
                                   for(var i = 0; i<missing.length; i++){
                                 
                                        var deviceindex = findDeviceIndex(app.user.profile.devices, 'deviceKey', missing[i].id);
                                 
                                        if(missing[i].last - test[k].first <= 10) {
                                            test[k].last = missing[i].last;
                                            showersToRequest = {
                                                first: test[k].first,
                                                last: test[k].last
                                            };
                                 
                                            app.user.profile.devices[deviceindex].pendingRequests.push(
                                                                                   {
                                                                                   fn:5,
                                                                                   data:showersToRequest
                                                                                   }
                                                                                   );
                                 
                                        } else {
                                 
                                            if( missing[i].last  - missing[i].first > 10) {
                                   
                                                for(var x = missing[i].first; x<=missing[i].last; x+=10){
                                                    if(x + 10 > missing[i].last ) {
                                                        showersToRequest = {
                                                            first: x + 1,
                                                            last: missing[i].last -1
                                                        };
                                                    } else {
                                                        showersToRequest = {
                                                            first: x +1,
                                                            last: x +10
                                                        };
                                                    }
                                 
                                                    app.user.profile.devices[deviceindex].pendingRequests.push({fn:5,data:showersToRequest});
                                                }
                                   
                                            } else {
                                   
                                                showersToRequest = {
                                                    first: missing[i].first,
                                                    last: missing[i].last
                                                };
                                 
                                                k++;
                                                app.user.profile.devices[deviceindex].pendingRequests.push(
                                                                                       {
                                                                                       fn:5,
                                                                                       data:showersToRequest
                                                                                       }
                                                                                       );
                                            }
                                        }
                                   }
                                   
                                   });
    
    },
    getPhotoUrl : function(uri){
    
        try {
            window.atob(uri.replace(/^data:image\/(png|jpg);base64,/, ""));
            photo_uri = uri.replace(/^data:image\/(png|jpg);base64,/, "");
        }catch(e) {
            if(e.code === 5) {
                photo_uri = getBase64Image(document.getElementById("memberPhoto"));
            }
        }
        
        return photo_uri;
        
    },
    saveApplication : function(){
        app.setUserToLocalStorage(JSON.stringify(app.user));
    },
    showLoadingSpinner : function(obj){
        
        obj.hide();
        obj.next('.prelolo').show();
        
    },
    hideLoadingSpinner : function(obj){
        
        obj.next('.prelolo').hide();
        obj.show();
        
    },
    showSpinner : function(){
        $('#spinner1').show();
    },
    hideSpinner : function(){
        $('#spinner1').hide();
    },
    emptySelector : function(selector){
        selector.empty();
    },
    emptyAmphiroListEvents : function(){
        $('#amphiro_events').empty();
    },
    emptyMeterListEvents : function(){
        $('#meter_events').empty();
    },
    emptyPlaceholder2 : function(){
        $('#placeholder2').empty();
    },
    getImperialDisplayValues : function(){
        return [0,3,2,0,0,2,2,0,0,2,2,0,0,2,3];
    },
    getMetricDisplayValues : function(){
        return [0,3,1,0,0,1,1,0,0,2,2,0,0,2,3];
    },
    getActivePage : function(){
        return window.localStorage.getItem('page');
    },
    keepLivePage : function(pg){
        window.localStorage.setItem('page',pg);
    },
    keepPrevPage : function(pg){
        window.localStorage.setItem('pagePrev',pg);
    },
    getPrevPage : function(){
        return window.localStorage.getItem('pagePrev');
    },
    replaceInString : function(value,x,y){
        return value.replace(x, y);
    },
    getStringNumbers : function(str){
        var results = str.match(/\d+/g);
        //results is an array of numbers e.g. [110,233,456]
        return results;
    },
    hex : function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join("");
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
        return Math.floor((val * 9 + 162)/5);
    },
    watt2kwatt : function(val){
        return (val / 1000).toFixed(2);
    },
    liters2Cubic : function(val){
        return (val / 1000).toFixed(2);
    },
    onSuccessDb : function() {
        //alert("Data stored!");
    },
    onErrorDb : function() {
        //alert("SQLite Error: " + e.message);
    },
    toUpper : function(str){
        return str.toUpperCase();
    },
    slide : function(direction, href) {
        window.plugins.nativepagetransitions.slide({
                                                   'duration': 200,
                                                   'direction': direction,
                                                   'slowdownfactor' : 6,
                                                   'iosdelay': 250,
                                                   'href': href
                                                   });
    },
    flip : function(direction, href) {
        window.plugins.nativepagetransitions.flip({
                                                  'duration': 450,
                                                  'direction': direction,
                                                  'iosdelay': 150,
                                                  'androiddelay': 200,
                                                  'winphonedelay': 800,
                                                  'href': href
                                                  });
    },
    playSound:function(times){
        navigator.notification.beep(times);
    },
    hideSplashscreen : function(){
        navigator.splashscreen.hide();
    },
    showSplashscreen : function(){
        navigator.splashscreen.show();
    },
    checkForUndefined : function(){
        if(app.user.settings.social === undefined)  app.user.settings.social = false; //false
        if(app.user.settings.ackMessages === undefined) app.user.settings.ackMessages = [];
        if(app.user.notifications === undefined) app.user.notifications = [];
        if(app.user.settings.unit === undefined) app.user.settings.unit = 0;
        if(app.user.settings.amphiro_budget === undefined) app.user.settings.amphiro_budget = 100;
        if(app.user.settings.meter_budget === undefined) app.user.settings.meter_budget = 250;
        if(app.user.settings.similar === undefined) app.user.settings.similar = 100;
        if(app.user.settings.city === undefined) app.user.settings.city = 100;
        if(app.user.settings.meter_active === undefined) app.user.settings.meter_active = 0;
        //if(app.user.settings.meterdashenabled === undefined) app.user.settings.meterdashenabled = [{"id":9,"title":"Water efficiency"},{"id":10,"title":"Daily budget"},{
                                                                                                           //  "id":11,"title":"Water calculator"}];
        
        if(app.user.settings.mydashenabled === undefined) app.user.settings.mydashenabled = [{"id":8,"title":"Duration"},{"id":2,"title":"Temperature"},{"id":6,"title":"Timer"}];
        
        if(app.user.settings.timer === undefined){
            app.user.settings.timer = {"duration":0,"volume": 0,"energy": 0,"temp" :0,"temp_active" : false,"active" : 0,"best": null,"settings":null,"used":0};
        }
        if(app.user.settings.timer.used === undefined)  app.user.settings.timer.used = 0;
        if(app.user.settings.timer.temp_active === undefined) app.user.settings.timer.temp_active = false;
        if(app.user.authentication === undefined) app.user.authentication = {};
        if(app.user.profile.comparison === undefined) app.user.profile.comparison = {};
        if(app.user.profile.comparison.monthlyConsumtpion === undefined) app.user.profile.comparison.monthlyConsumtpion = [];
        if(app.user.profile.comparison.waterIq === undefined) app.user.profile.comparison.waterIq = [];
        if(app.user.profile.comparison.dailyConsumtpion === undefined) app.user.profile.comparison.dailyConsumtpion = [];
    },
    loadUserFromLocalStorage : function(callback){
        
        var a = window.localStorage.getItem('user');
        
        if( JSON.parse(a) ) {
            app.user = JSON.parse(a);
        }
        
        callback();
        
    },
    setAppDataUnit : function(unit){
        window.localStorage.setItem('unit',unit);
    },
    getAppDataUnit : function(){
        return window.localStorage.getItem('unit');
    },
    setPreviousUser : function(username){
        window.localStorage.setItem('lastLoggedIn',username);
    },
    getPreviousUser : function(){
        return window.localStorage.getItem('lastLoggedIn');
    },
    getUserFromLocalStorage : function(){
        return window.localStorage.getItem('user');
    },
    getAmphiroFromLocalStorage : function(){
        return window.localStorage.getItem('amphiro');
    },
    setUserToLocalStorage :function(info){
        window.localStorage.setItem('user',info);
    },
    setAmphiroToLocalStorage :function(dev){
        window.localStorage.setItem('amphiro',dev);
    },
    getSocialFromLocalStorage : function(){
        return window.localStorage.getItem('social');
    },
    setSocialToLocalStorage : function(soc){
        window.localStorage.setItem('social',soc);
    },
    setModeToLocalStorage :function(mode){
        window.localStorage.setItem('mode',mode);
    },
    getModeFromLocalStorage : function(){
        return window.localStorage.getItem('mode');
    },
    setAmphiroModeToLocalStorage :function(mode){
        window.localStorage.setItem('mode_b1',mode);
    },
    getAmphiroModeFromLocalStorage : function(){
        return window.localStorage.getItem('mode_b1');
    },
    setAmphiroUpdateDate : function(date){
        window.localStorage.setItem('b1_sync',date);
    },
    getAmphiroUpdateDate : function(){
        return window.localStorage.getItem('b1_sync');
    },
    setMeterUpdateTime : function(timestamp){
        window.localStorage.setItem('meter',timestamp);
    },
    getMeterUpdateTime : function(){
        return window.localStorage.getItem('meter');
    },
    setLastConfigDate : function(date){
        window.localStorage.setItem('config',date);
    },
    getlastConfigDate : function(){
        return window.localStorage.getItem('config');
    },
    setHistoryChanges : function(data){
        window.localStorage.setItem('history',data);
    },
    getHistoryChanges : function(){
        return window.localStorage.getItem('history');
    },
    setLastAckTime : function(data){
        window.localStorage.setItem('time',data);
    },
    getLastAckTime : function(){
        return window.localStorage.getItem('time');
    },
    getlastComparisonSync : function(){
        return window.localStorage.getItem('comparison');
    },
    setlastComparisonSync : function(data){
        window.localStorage.setItem('comparison',data);
    },
    onLogout : function(){
        app.user.session = false;
        app.user.settings.showerTimer = null;
        app.user.settings.timer = {
            "duration":0,
            "volume": 0,
            "energy": 0,
            "temp" :0,
            "temp_active" : false,
            "active" : 0,
            "best": null,
            "settings":null,
            "used":0
        };
        app.user.settings.personalEstimates = null;
        app.user.profile.household.members.length = 0;
        app.user.notifications.length = 0;
        
        app.user.profile.mode = 222;
        app.setModeToLocalStorage(222);
        app.setSocialToLocalStorage(null);
        app.keepLivePage('dashboard');
        app.saveApplication();
        app.uploadData();
        app.changeToPage('#initialize');
        //app.flip('down', '#initialize');
        
        $('.myphoto').attr('src','img/SVG/daiad-consumer.png');
    },
    appScheduler : function(){
        setInterval(function(){
                    app.checkBluetooth();
                    },10000);
    },
    chosenStart :moment().subtract(1,'day').startOf('day').valueOf(),
    chosenEnd :moment().subtract(1,'day').endOf('day').valueOf(),
    temp_1 : null,
    temp_2:null,
    setAppStyles : function(){
        
        var btWidth,btHeight,btMargin,
        scrWidth = screen.width,
        elements0 = $('.plot-real'),
        elementsA = $('.custom_bt,.custom_input'),
        elementsB = $('.inputFields input'),
        elementsC = $('.inputFields'),
        elementsD = $('.par18px,.par16px,.par14px,.par18pxQuestions'),
        HomeToolbar = $('.HomeToolbar'),
        Navbar = $('.mainpages'),
        cmp = new component();
        
        HomeToolbar.each(function(i){
                         
                         $(this)
                         .html( cmp.footer() )
                         .find('a')
                         .eq(i)
                         .addClass('active barActive');
                         
                         });
        
        Navbar.each(function(i){
                    
                    $(this)
                    .html( cmp.header() );
                    
                    });
        
        elements0.css(
                      {
                      'width':scrWidth+'px',
                      'margin-right':scrWidth * 0.02+'px'
                      }
                      );
        
        elementsA.each(function(){
                       
                       (scrWidth > 500 ) ? btWidth = 440 : btWidth = 220;
                       
                       (scrWidth > 500 ) ? btHeight = 100 : btHeight = 50;
                       
                       btMargin = ( scrWidth - btWidth ) / 2 ;
                       
                       $(this).css(
                                   {
                                   'height':btHeight+'px',
                                   'line-height':btHeight +'px',
                                   'margin-left':btMargin+'px',
                                   'margin-right':btMargin+'px'
                                   }
                                   );
                       
                       });
        
        elementsB.each(function(){
                       
                       (scrWidth > 500 ) ? btWidth = 440 : btWidth = 220;
                       (scrWidth > 500 ) ? btHeight = 100 : btHeight = 50;
                       
                       btMargin = ( scrWidth - btWidth ) / 2 ;
                       
                       $(this).css(
                                   {
                                   'height':btHeight+'px',
                                   'line-height':btHeight +'px'
                                   }
                                   );
                       
                       });
        
        elementsC.each(function(){
                       
                       (scrWidth > 500 ) ? btWidth = 440 : btWidth = 220;
                       
                       btMargin = ( scrWidth - btWidth ) / 2 ;
                       
                       $(this).css(
                                   {
                                   'margin-left':btMargin+'px',
                                   'margin-right':btMargin+'px'
                                   }
                                   );
                       
                       });
        
        elementsD.each(function(){
                       
                       (scrWidth > 400 ) ? ( btMargin = scrWidth - 0.80*scrWidth ) / 2 : ( btMargin = scrWidth - 0.90*scrWidth ) / 2;
                       
                       $(this).css(
                                   {
                                   'margin-left':btMargin+'px',
                                   'margin-right':btMargin+'px'
                                   }
                                   );
                       
                       });
        
        
    },
    onDeviceReady: function() {
        
        new EventSubscribers();
    
        trans = new dbTransactions();
    
        trans.openDb();
    
        tm = new customDates();
        
        calc = new calculator();
        
        shtmr = new showertimer(app.user.settings.timer);
    
        user_profile = app.getUserProfilePath();
        
        pictureSource = navigator.camera.PictureSourceType;
    
        destinationType = navigator.camera.DestinationType;
    
        if( app.getSystemPlatform() == 'android') { app.showSplashscreen(); }
        
        app.keepResumeTimeAnalytics();
        
        app.hideStatusBar();
    
        app.keepLivePage('dashboard');
        
        app.InternetWatcher();
        
        app.loadUserFromLocalStorage(
                                     function(){
                                     
                                     if( app.getSessionState() ) {
                                 
                                        app.refreshApplication();
                                 
                                     } else { //NO USER
                                 
                                       // var loc = new locationManager();
                                       // loc.requestLocation();
                                 
                                        app.renderMobileHome();
                                 
                                        app.hideSplashscreen();
                                     }
                                     });
    },
    amphiro : {
        serviceUUID : "0D27FA90-F0D4-469D-AFD3-605A6EBBDB13",
        txCharacteristic: "0D27FB90-F0D4-469D-AFD3-605A6EBBDB13", // transmit is from the phone's perspective
        rxCharacteristic: "0D27FB91-F0D4-469D-AFD3-605A6EBBDB13" // receive is from the phone's perspective
    },
    scripts : {
        spanish :  {
            spt : 'locales/messages_es.js'
        },
        english : {
            spt : 'locales/messages_en.js'
        }
    },
    events : {
        flow : [],
        temp:[]
    },
    ignoreShowerFail : function(total){
    
        var showerdelete = $('input[name="delete_shower"]');
    
        showerdelete.removeAttr('checked');

        var regge = new NotificationManager();
       
        if(total.data.status === 'timeout') {
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].server_not_responding);

        } else {
            app.showNativeAlert(applicationLabels.notificationsAlerts[app.getNotifyCountry()].network_error);

        }
        
    },
};

var AppModel = {
    user : {},
    consumption:{},
    livePage : 'dashboard',
    token:null,
    selectedToPairWithID : null,
    temporary : null,
    PingData : null,
    NewDevices : [],
    notify : 0,
    mode: null,
    background : null,
    amphiroUpdate : null,
    debug : 0,
    mutex : false,
    lastIndex : 0
};



var keenAnalyticsModel = {
    user : {
        email : null,
        app : {
            application : {
                start : null,
                stop : null,
                duration : null,
                app_version : null,
                deviceInfo : null
            }
        },
        click : {
            meter : {
                day : 0,
                week : 0,
            month: 0,
            year: 0
            },
            device : {
                last_10 : 0,
                last_20 : 0,
                last_50 : 0,
                all : 0,
                water : 0,
                temp : 0,
                energy : 0,
                duration :0
            },
            pageview : {
                title : null,
                show : null,
                hide : null,
                duration : null,
            },
            messages : {}
        }
        
    }
    
};


$(function() {
  
  app.setAppStyles();

  setTimeout(function(){
             app.initialize();
             },1000);
  
});
