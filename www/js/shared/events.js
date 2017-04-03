$(function() {
  
  $(document).on('tap taphold','.plusIncremenet',function(){
                 
                 var obj = $(this).closest('.inputFields').find('input[name="increment"]');
                 
                 var oldval = obj.val().split(' ')[0];
                 
                 var label = obj.val().split(' ')[1]
                 
                 var newval = parseInt(oldval,10)+1;
                          
                 var min = parseInt(obj.attr('min') ,10);
                          
                 var max = parseInt( obj.attr('max') ,10 );
                                                    
                 if(newval >= min && newval <=max) {
                          
                    obj.val(newval +' '+label);
                          
                 }
                 
                 });
  
  $(document).on('tap','.minusIncremenet',function(){
                          
                 var obj = $(this).closest('.inputFields').find('input[name="increment"]');
                           
                 var oldval = obj.val().split(' ')[0];
                 
                 var label = obj.val().split(' ')[1]
                 
                 var newval = parseInt(oldval) - 1;
                           
                 var min = parseInt(obj.attr('min') ,10);
                           
                 var max = parseInt( obj.attr('max') ,10 );
                           
                 if(newval >= min && newval <=max) {
                           
                    obj.val(newval +' '+label);
                           
                 }
                 
                 });
  
  $('.loadMoreMessages').click(function(){
                               
                               $(this).hide();
                               
                               $(this).next().show();
                               
                               var msgs = $(this).closest('.tab-content').find('.messages');
                               
                               loadMessages(
                                            [
                                             {
                                             'type' : msgs.attr('data-type'),
                                             'size' : parseInt(msgs.attr('data-size') , 10 )
                                             }
                                             ]
                                            );
                               
                               });
  
  $('div[data-role="page"]').on('pagebeforeshow',function(){
                                
                                app.keepLivePage($.mobile.activePage.attr("id"));
                                
                                var title = $(this).attr('data-title');
                                
                                if(!title) return;
                                
                                keenAnalyticsModel.user.click.pageview.title = title;
                                
                                keenAnalyticsModel.user.click.pageview.show = moment().valueOf();
                                
                                keenAnalyticsModel.user.email = app.getUserEmail();
                                
                                });
  
  $('div[data-role="page"]').on('pagebeforehide',function(){
                                
                                var title = $(this).attr('data-title');
                                
                                if(!title) return;
                                
                                keenAnalyticsModel.user.click.pageview.hide = moment().valueOf();
                                
                                keenAnalyticsModel.user.click.pageview.duration = parseInt((keenAnalyticsModel.user.click.pageview.hide - keenAnalyticsModel.user.click.pageview.show) / 1000);
                                                                
                                if(typeof keenClient != "undefined"){
                                    keenClient.recordEvent(keenAnalyticsModel.user.email, keenAnalyticsModel.user.click );
                                }
                                
                                });
  
  //play beep one time
  $(document).one('playBeep', function(e){ app.playSound(e.message); });
  
  //play beep for temp one time
  $(document).one('playBeepTemp', function(e){ app.playSound(e.message); });
  
  //general beep sound
  $(document).one('playBeepOne', function(e){ app.playSound(e.message); });
  
  //new configuration has been detected for device in index X
  $(document).on('new_config', function(e){
                 //keep device index's from profile.devices e.g. app.user.profile.devices[deviceindex].id
                 //var deviceindex = e.message;
                 //check for platform - special behavior in android system
                 if (app.getSystemPlatform() === 'android' ) {
                    //clear scan interval
                    clearInterval(bleTime);
                    setTimeout(function(){
                               //stop bluetooth
                               app.stop();
                               //run bluetooth again after n seconds
                               //we do this because we follow the original scan  - execute process. We want to refresh the ble
                               setTimeout(function(){
                                          app.refreshDeviceList();
                                          },3500);
                            
                               },1000);
                 }
                 });
  //event for platform sync in Android
  //we execute this only one time
  $(document).one('checkKeyAndroid', function(e){
                  //get the packet
                  var uint8 = new Uint8Array(e.message.advertising);
                  //create the subarray
                  var data2decry = uint8.subarray(5, 25);
                  //for each devices check if the key decrypt at least one packet
                  $.each(app.user.profile.devices,function(){
                         if(this.type == 'AMPHIRO'){
                         
                         var newdecryption = new cryptoService({
                                                               data : data2decry,
                                                               id :  e.message.id,
                                                               key : this.aesKey
                                                               });
                            newdecryption.decrypt();
                         
                         }
                        });
                 });
  //event for platform sync in iOS
  //we execute this only one time
  $(document).one('checkKeyios', function(e){
                 for(var i=0;i<=app.user.profile.devices.length;i++){
                        if(app.user.profile.devices[i].type == 'AMPHIRO'){
                  
                            var newdecryption = new cryptoService({
                                                                  data : e.message.advertising.kCBAdvDataManufacturerData,
                                                                  id : e.message.id,
                                                                  key : app.user.profile.devices[i].aesKey
                                                                  });
                            newdecryption.decrypt();
                  
                        }
                  }
                  });
  //bluetooth availability event - if availability = 1 then we are ready for any task with the b1
  $(document).on('available', function(e){
                 var deviceindex = e.message;
                 //set for the detected device the value 1
                 app.user.profile.devices[deviceindex].availability = 1;
                 if(app.user.profile.devices[deviceindex].pendingRequests === undefined) return;
                 //it s available -> execute
                 app.BluetoothSupervisor(deviceindex);
                 });
  
  //first time device scanning(pairing process) - display pairing code
  $(document).on('ping',function(){ requestCodeFromPeripheral(); });
  
  //ble is disable inform other components
  $(document).one('bledisable', function(){
                  var blest = new NotificationManager();
                  blest.BleDisabled();
                  });
  
  $('.devSettings').tap(function(e){ app.openDeviceSettingsList($(this),e); });

  $('.doneSettings').tap(function(e){ app.doneDeviceSettings(e); });

  $('#editAmphiroName').tap(function(){ app.showEditDeviceNameField($(this)); });

  $('#decivename').on('blur',function(){ app.hideDeviceNameField($(this)); });

  $('#decivename').change(function(){ app.onChangeDeviceName( $(this), $('#devName').attr('data-key') ); });

  $('#dataUnit').change(function (e) { app.onChangeSystemUnit($(this),e); });

  $('input[name=my_data_unit]').change(function(){ app.onChangeAmphiroDisplay($(this)); });

  $('.DevicesList').on('click','li',function(){ app.onChooseDeviceFromList($(this)); });
  
  $('#config').on('click', function(){app.RefreshDashboardConfigs();app.changeToPage('#configure');});

  $('.ConfigElements a').tap(function(){ app.onClickListOfShortcuts($(this)); }); // list of active 'Assigned elements'

  $('input[name="my-checkbox1"]:radio').change(function(){ app.onChangeShortcuts($(this)); }); //list of all shower shortcuts

  $('input[name="my-checkbox"]:radio').change(function(){ app.onChangeCentralGaugeWaterView($(this)); }); //change granularity

  $('#configureSwitcher').change(function(){ app.onChangeMeterSwitcher($(this)); }); //change the switcher

  $('.dashboard-vals').on('click',function(e){ app.onClickComplications($(this),e); });
  
  $('#logout1,#logout_home').on('tap',function(e){ app.onLogout(); e.preventDefault(); });
  
  $('#changePass').on('pagebeforeshow',app.clearChangePassFormFields);
  
 
  /*TRIGGER FORM SUBMIT*/
  $('#changePass_button').on('click',function(){ $('#form_change_pass').submit(); });
  
  $('#reset_pin_Pass').on('click',function(){ $('#form_reset_pin').submit(); });
  
  $('#resetPwd').on('click',function(){ $('#form_reset').submit(); });
  
  $('#submitregister').on('click',function(){ $('#form1').submit(); });
  
  $('#submitlog1').on('click',function(){ $('#loginForm').submit(); });
  
  $('#addme').on('click',function(){ $('#memberForm').submit(); });
  
  $('#startPairing').click(function(){ $('#pairForm').submit(); });
  
  //on click an event from the events list
  $('#amphiro_events,#timerData').on('click','li',function(){
                                     
                                     app.tempSelectorDetailed = $(this).find('img[id="eventsrightarrow"]');
                                     
                                     app.loadMeasurements( $(this).attr('id'), $(this).attr('data-name'), $(this).attr('category') );
                                     
                                     });
  
  $('#real2').on('pagebeforeshow',function () { app.keepLivePage($.mobile.activePage.attr("id"));  });
  
  $('#real2').on('pageshow',function () { app.plotTimeEvent($('#placeholder3'),app.events.flow); });
  
  $('#real2').on('pagehide',app.clearDetailedEventsView);
  
  //on click tab bar in 'Detailed Shower Event' page
  $('.mymetrics a').on('tap',function(){ app.onChooseOptionInDetailedEvent($(this)); });
  // on click this shower - city - year in 'Detailed Shower Event' page
  $('.eventChoices a').on('tap',function(){ app.onChooseDetailedStatistics($(this)); });
  //on change shower Date
  $(document).on('change','#showerDate',function(e){ app.onChangeShowerDate($(this),e);});
  
  //on focus on Date field
  $(document).on('focus','#showerDate',function(){ app.onFocusShowerDateField($(this)); });
  
  //on change Shower Member
  $('#showername').on('change',function (e) { app.onChangeShowerMemberName($(this),e); });
  
  //on leave Date field
  $(document).on('blur','#showerDate',function(){
                 
                 $(this).prop('type','text');
                 
                 $(this).css({'color':'white'});
                 
                 app.uploadData();
                 
                 });
  /*DETAILED EVENT*/
  
  $('#consumption').on('pagehide', function(){
                       $.each(keenAnalyticsModel.user.click.device,function(key,value){ keenAnalyticsModel.user.click.device[key] = 0; });
                       $.each(keenAnalyticsModel.user.click.meter,function(key,value){ keenAnalyticsModel.user.click.meter[key] = 0; });
                       });
  
  $(document).on('change','.devtab .chosenID' , app.refreshAnalytics);
  
  $('#consumption').on('pagebeforeshow',function(){ app.keepLivePage($.mobile.activePage.attr("id")); });
  
  $('#consumption').on('pageshow',app.refreshAnalytics);
  
  $('#member_filter').on('tap','span',function(){ app.onClickMemberFilter( $(this) ); });

  $('#addmember').on('pagebeforeshow',app.setMembersFormImg);
  
  $('#addmember').on('pagehide',app.clearMemberFormFields);
  
  $('#Householdlist').on('click','.removeMember',function(e){ app.removeUserMember($(this),e); });
  
  $('.placeholder_land').on('click',function(){app.changeToPage( "#fullChart"); app.orientation('landscape');});

  $('#exit_fullScreen_chart').on('click',function(){app.orientation('portrait');});

  $('#the_chart').on('touchstart touchmove touchend',function(event){ app.touchFullScreenChart(event); });

  $('#fullChart').on('pagebeforeshow',function(){ app.setFullScreenChartTextsLabels(); });

  $('#fullChart').on('pageshow',function(){ app.setFullScreenChartValues(); });

  $('.fullScreenShowerTab a').on('tap',function(e){ app.fullScreenShowerTab($(this),e); });

  $('.fullScreenTimeTab a').on('tap',function(e){ app.fullScreenTimeTab($(this),e); });
  
  $('.MeterTypeTab a').tap(function(){ app.meterTypeChanged($(this)); });

  $('.ShowerTab a').on('tap',function(e){ app.numberOfShowersChanged($(this),e); });

  $('.TypeTab').on('tap','a',function(e){ app.showerTypeChanged($(this),e); });

  $('.TimeTab a').on('tap',function(e){ app.meterTimeTabChanged($(this),e); });

  $('#goback').tap(function(e){ app.previousMeterTime();e.preventDefault();});

  $('#goforward').tap(function(e){ app.nextMeterTime(); e.preventDefault(); });
  
  $('#Account').on('pageshow',function(){app.keepLivePage($.mobile.activePage.attr("id"));});
  
  $('#AmphiroUpdate').on('pagebeforeshow',function(){ });
  
  $('#AmphiroUpdate').on('pagehide',app.clearSettingsPage );
  
  $('#developer').on('pagebeforeshow',function(){});
  
  $('#pinForm').on('pagehide', app.clearResetPinFormFields);
  
  $('#resetForm').on('pagehide', app.clearResetFormFields);
  
  $('#resetForm').on('pagebeforeshow', app.checkForActivePin);
  
  $('#login').on('pagehide', app.clearLoginFields);
  
  $('.socials').on('click',function(){
                   
                   if( app.countMeters() > 0 ){
               
                        var lastsyncdate = JSON.parse(app.getlastComparisonSync()); //this holds the last sync data
                   
                        if(lastsyncdate){
                            //alert('clicking for : ' + new Date(lastsyncdate));
                            app.getWholeComparisonData(moment(lastsyncdate).startOf('month').valueOf());
                        } else{
                            app.getWholeComparisonData(moment().subtract(2,'month').startOf('month').valueOf());
                        }
                   
                   }
                   
                   
                   if(app.countAmphiro() > 0) {
                    trans.getTotalVolumePerMember(function(data){
                                                 var rk = new ranking();
                                                 rk.setRanking(app.processTotalVolumePerMember(data));
                                                 });
                   }

                  
                   });
  
  $('#socials').one('pageshow',function(){});
  
  $('#social_goback').on('click',function(e) { app.onClickSocialBackTimeControl(e); });
  
  $('#social_goforward').on('click',function(e) {  app.onClickSocialForwardTimeControl(e); });
  
  $('#social_stats').on('pagebeforeshow',function(){ });
  
  $('#water_iq').on('pagebeforeshow',function(){});
  
  $('#social_stats').on('pageshow',function(){
                        
                        var plots = new comparisons();
                        plots.plothorizontalBarsWithLabels($('#placeholder_bars_0'),app.user.profile.comparison.dailyConsumtpion);
                        plots.meterLastMonthChart( app.user.profile.comparison.dailyConsumtpion );                        
                        plots.meterLastSixMonthChart( app.user.profile.comparison.monthlyConsumtpion );
                        
                        });
  
  $('#social_stats').on('pagehide',function(){ $('.stats_charts').empty(); });
    
  $('#social_rank').on('pagehide',function(){ $('#membersLegend').empty(); });
  
  $('#social_rank').on('pageshow',function(){
                       
                       trans.getLast300ShowersPerMember(
                                                        function(results){
                                                            var rank = new ranking();
                                                            rank.socialRanking(app.processLast300ShowersPerMember(results));
                                                        }
                                                        );
                       });
 
  $('.menu-tabs2 a').tap(function(){ $('.menu-tabs2 a.active').removeClass('active'); $(this).addClass('active'); });
  
  $('#social_choices a').on('tap',function(e){ app.socialMeterChanged($(this),e); });
  
  $('#dashEvent').tap(function(){
                      
                      AppModel.debug = AppModel.debug + 1;
                     
                      if(AppModel.debug === 10){
                        app.changeToPage("#developer");
                        AppModel.debug = 0;
                      }
                      
                      });
  
  $('#loginForm input').on('keypress', function(event){
                           if (event.keyCode === 13) {
                           $('#loginForm').submit();
                           }
                           });
  
  $('#form1 input').on('keypress', function(event){
                       if (event.keyCode === 13) {
                       $('#form1').submit();
                       }
                       });
  
  $('#pairform input').on('keypress', function(event){
                          if (event.keyCode === 13) {
                          $('#pairform').triggerHandler( "submit" );
                          }
                          });
  
  /*PHOTOS*/
  //set new profile photo - camera
  $('.NewProfilePhoto').click(function(e){
                              
                              $('#popupBasic2').attr('data-key',0);
                              
                              app.takeNewPhoto();
                              
                              e.preventDefault();
                              
                              });
  //set new member photo  - camera
  $('#NewMemberPhoto').click(function(e){
                             
                             $('#popupBasic2').attr('data-key',1);
                             
                             app.takeNewPhoto();
                             
                             e.preventDefault();
                             
                             });
  //choose new profile photo - library
  $('.PhotoFromLibrary').click(function(e){
                               
                               $('#popupBasic2').attr('data-key',0);
                               
                               app.photoFromLibrary();
                               
                               e.preventDefault();
                               
                               });
  //choose new member photo - library
  $('#LibraryPhotoMember').click(function(e){
                                 
                                 $('#popupBasic2').attr('data-key',1);
                                 
                                 app.photoFromLibrary();
                                 
                                 e.preventDefault();
                                 
                                 });
  /*PHOTOS*/
  
  //DASHBOARD
  $('#dashboard').on('pageshow',function(){
                     
                     app.keepLivePage($.mobile.activePage.attr("id"));
                                          
                     $('#dash_swiper').swiper({
                                              nextButton: '.swiper-button-next',
                                              prevButton: '.swiper-button-prev',
                                              spaceBetween: 30,
                                              mode:'horizontal',
                                              //autoplay: 3000,
                                              loop: false
                                              });
                     });
  
  $('#dashboard').on('pagehide',function(){
                     
                     var txt = $('input[name="my-checkbox"]:checked').closest('label').find('.item-title').text();
                     
                     $('#dashEvent').text(txt);
                     
                     app.refreshMainDashboard();
                     
                     });
  
  
  $('#initialize').one('pageshow',function(){
                       
                       $('#dash_swiper1').swiper({
                                                 pagination: '.swiper-pagination',
                                                 paginationClickable: true,
                                                 //paginationType : 'bullets',
                                                 nextButton: '.swiper-button-next',
                                                 prevButton: '.swiper-button-prev',
                                                 mode:'horizontal',
                                                 autoplay: 3000,
                                                 loop: false
                                                 });
                       
                       });
  
  $('#Myprofile').on('pagebeforeshow',function(){ $('input[name="member_gender"]:radio:eq(0)').attr( 'checked', true ); });
  
  /*installation wizard - on pair set amphiro name*/
  $('#setAmphiroName').click(function(e){
                             
                             var results = getObjects(app.user.profile.devices, 'macAddress', AppModel.selectedToPairWithID);
                             
                             if(results.length > 0){
                                app.onChangeDeviceName($('#amphiro_name'),results[0].deviceKey);
                             }
                             
                             app.changeToPage("#InstallMoreB1");
                                                          
                             });
  
  $('.otherLocation').click(function(){ app.user.location.city = $(this).find('.item-title').text(); });
  
  $('.mylocation').click(function(){
                         
                         var location = $(this).find('.item-title').text();
                         
                         app.user.location.city = location;
                         
                         if(location == 'Alicante'){
                         
                         app.user.location.country = 'Spain';
                         
                         document.l10n.requestLocales('es');
                         
                         $('#changeLang').attr('id',1);
                         
                         }else{
                         
                         if( app.user.location.country = 'Spain' ){
                         document.l10n.requestLocales('en-US');
                         }
                         
                         app.user.location.country = 'United Kingdom';
                         
                         }
                         
                         $('.cityflag').text(location);
                         
                         });
  
  
  
  /*INSTALLATION PHASES*/
  $('#ble_msg_android').click(function(){ ble.showBluetoothSettings(); });
  
  $('#install_part_1').on('pagebeforeshow',function(){$('#user_name').text(app.user.profile.firstname);});
  
  $('#install_part_2,#install_part_3').on('pagebeforeshow',function(){ app.setCancelRef(); });
  
  $('#install_part_3').on('pageshow',function(){ chkBle = setInterval(function(){ app.checkBluetooth(); },1000); });
  
  $('#install_part_3').on('pagebeforehide',function(){clearInterval(chkBle);});
  
  
  $('#install_part_4').on('pageshow',function(){
                          AppModel.NewDevices.length = 0;
                          
                          app.keepLivePage($.mobile.activePage.attr("id"));
                          
                          //clearTimeout(bleTime);
                          
                          if( app.getSystemPlatform() === 'android' ) {
                          
                          clearInterval(bleTime);
                          
                          setTimeout(function(){
                                     
                                     app.stop();
                                     
                                     setTimeout(function(){
                                                
                                                app.refreshDeviceList();
                                                
                                                },2500);
                                     
                                     },500);
                          
                          }
                          
                          intervalId = setInterval(function(){
                                                   
                                                   if( AppModel.NewDevices.length > 0 && AppModel.temporary === null){
                                                   
                                                   AppModel.temporary = 1;
                                                   
                                                   AppModel.selectedToPairWithID = AppModel.NewDevices[0];
                                                   
                                                   $.event.trigger({type: "ping"});
                                                   
                                                   }
                                                   
                                                   },3200);
                          });
  
  $('#install_part_4').on('pagebeforehide',function(){
                          
                          clearInterval(intervalId);
                          
                          AppModel.NewDevices.length = 0;
                          
                          AppModel.temporary = null;
                          
                          });
  
  $('#install_part_6').on('pagebeforeshow',function(){
                          
                          app.keepLivePage($.mobile.activePage.attr("id"));
                          
                          app.clearPairFormFields();
                          
                          });
  
  $('#install_part_6').on('pagehide',function(){
                          
                          AppModel.PingData = null;
                          
                          if (app.getSystemPlatform() === 'ios' ) {
                          
                          clearTimeout(timeoutId1);
                          
                          app.disconnect(AppModel.selectedToPairWithID);
                          
                          }else{
                          
                          app.disconnect(AppModel.selectedToPairWithID);
                          
                          }
                          
                          });
  
  
  $('#install_part_7').on('pagebeforeshow',function(){
                          
                          app.keepLivePage($.mobile.activePage.attr("id"));
                          
                          if (app.getSystemPlatform() === 'android' ) {
                          
                          app.stop();
                          
                          setTimeout(function(){
                                     
                                     app.refreshDeviceList();
                                     
                                     },1000);
                          
                          }
                          
                          });
  
  $('#install_part_7').on('pagebeforehide',function(){
                          
                          $('#water_wait').show();
                          
                          $('#water_off').hide();
                          
                          $('#NameButton').attr('disabled',true);
                          
                          });
  
  $('#InstallMoreB1').on('pagebeforeshow',function(){ app.keepLivePage($.mobile.activePage.attr("id")); });
  
  $('#AmphiroSetName').on('pagebeforeshow',function(){ app.keepLivePage($.mobile.activePage.attr("id")); });
  
  $('#loadingDevice').click(function(){ app.disconnect(AppModel.selectedToPairWithID); });
  
  $('#install_more').click(function(){ clearInterval(bleTime); app.stop(); app.refreshDeviceList(); });
  
  $('#no_more_install').click(function(){
                              
                              app.setModeToLocalStorage(app.user.profile.mode);
                              
                              app.startApplication();
                              
                              app.refreshDeviceListHard();
                              
                              });
  
  $('#SignUpWithlocation').on('pagehide',function(){
                              
                              $('.cityflag').text('');
                              
                              $('#sign_details').empty();
                              
                              $('#form1 input').each(function(){
                                                     $(this).css({'border-color':'#2D3580','border-width':'1px'}).empty();
                                                     });
                              
                              $('#form1 .error').each(function(){
                                                     $(this).empty();
                                                     });
                              
                              $('#submitregister').next('.prelolo').hide();
                              
                              $('#submitregister').show();
                              
                              });
  
  
  $('#SignUpWithlocation').on('pagebeforeshow',function(){
                              
                              if(app.user.location.city === null || app.user.profile.country === null) {
                                $('.cityflag').text('');
                              } else {
                                $('.cityflag').text(app.user.location.city);
                              }
                              
                              if(app.user.profile.country == 'Spain' || app.user.location.country == 'Spain'){
                                                            
                                if( app.checkForLoadedScript(app.scripts.spanish.spt) === 0 ) {
                                    app.loadScript(app.scripts.spanish.spt);
                                }
                              
                              }else{
                              
                                if( app.checkForLoadedScript(app.scripts.english.spt) === 0 ) {
                                    app.loadScript(app.scripts.english.spt);
                                }
                              
                              }
                              
                              });
 
  
  $('#install').on('pagebeforeshow',function(){
                   
                   $('.discovered').empty();
                   
                   AppModel.NewDevices.length = 0;
                   
                   });
  
  $('input[name="delete_shower"]').click(function(){ app.deleteShowers($(this)); });
  
  $(document).on('openBle', function(e){
                 
                 setTimeout(function(){
                            app.stop();
                            setTimeout(function(){
                                       app.refreshDeviceList();
                                       },2000);
                            },5000);
                 
                 });
  
  //mode changed!on click "OK" set mode to 0
  $('.changeLang').click(function(){ app.changeAppLanguage($(this)); });
  
  $('.mobileOn').click(function(){ app.setModeToLocalStorage(0); });
    
  $('#changeSWMpage').click(function(){ app.changeToPage( '#install_part_3' ); });
  
  $('#loginbutton').click(function(){ app.changeToPage('#login'); });
  
  $('.socialTableMeter').click(function(){ app.changeToPage('#social_stats'); });
  
  $('.socialTablesWaterIq').click(function(){ app.changeToPage('#water_iq'); });
  
  $('.socialTablesRank').click(function(){ app.changeToPage('#social_rank'); });
  
  $('#startSignUp').click(function(){ app.changeToPage('#SignUpWithoutlocation'); });
  
  $('#ble2pair').click(function(){ app.changeToPage('#install_part_4'); });
  
  $('#startSignUp').click(function(){ app.changeToPage('#SignUpWithoutlocation'); });
  
  $('#ble2pair').click(function(){ app.changeToPage('#install_part_4'); });
  
  $('.backpages').click(function(){ app.changeToPage('#'+ app.getActivePage()); });
  
  $('.backpages_2').click(function(){ app.changeToPage('#'+ AppModel.livePage_2); });
  
  $('#dev2dash').click(function(){ app.changeToPage('#'+ app.getPrevPage() ); });
  
  $('#exitShowerTimer').click(function(){ app.changeToPage('#dashboard'); });
  
  $('#Cancelsettings,#Donesettings').click(function(){ app.changeToPage('#devices'); });
  
  $('#CancelConfig,#DoneConfig').click(function(){ app.changeToPage('#dashboard'); });
  
  $('#acc2log').click(function(){ app.changeToPage('#login'); });
  
  $('#NameButton').click(function(){ app.changeToPage('#AmphiroSetName'); });
  
  $('#goDashboard').click(function(){ app.flip('down', '#dashboard'); });
  
  $('.dash2dev,#panel2dev').click(function(){ app.keepPrevPage( app.getActivePage() ); app.changeToPage('#devices'); });

  $(document).on('click','.forpages',function(){
                 
                 app.keepLivePage($.mobile.activePage.attr("id"));
                 
                 var nextpage =  $(this).attr('href');
                 
                 app.changeToPage('#'+ nextpage);
                 
                 });
  
  $(document).on('click','.forpages_double',function(){
                 
                 AppModel.livePage_2 = $.mobile.activePage.attr("id");
                 
                 var nextpage =  $(this).attr('href');
                 
                 app.changeToPage('#'+ nextpage);
                 
                 });
  
  $('.amphiro').on('tap',function(){window.open("http://amphiro.com", "_system");});
  
  $('.daiad').on('tap',function(){window.open("http://daiad.eu", "_system");});
  
  $('.daiad_3179').on('tap',function(){window.open("http://daiad.eu/?page_id=3179", "_system");});
  
  $('.daiad_utility').on('tap',function(){window.open("http://daiad.eu/utility/", "_system");});
  
  
  //PANEL
  $( "#mypanel" ).panel({
                        close: function() {
                        $('#mypanel .list-block a b').each(function(){ $(this).css('color','#A4D5F5'); });
                        },
                        beforeopen: function() {
                        
                        var t = app.getActivePage();
                        
                        $('#mypanel .list-block').find('a[href="#'+t+'"]').find('b').css('color','white');
                        
                        var title = $(this).attr('data-title');
                        
                        if(!title) return;
                        
                        keenAnalyticsModel.user.click.pageview.title = title;
                        
                        keenAnalyticsModel.user.click.pageview.show = moment().valueOf();
                        
                        keenAnalyticsModel.user.email = app.getUserEmail();
                        
                        $('#panel-spinner').show();
                        
                        $('.HomeToolbar').hide();
                        
                        //$('.connectivity_status').hide();
                        },
                        beforeclose: function() {
                        
                        var title = $(this).attr('data-title');
                        
                        if(!title) return;
                        
                        keenAnalyticsModel.user.click.pageview.hide = moment().valueOf();
                        
                        keenAnalyticsModel.user.click.pageview.duration = parseInt((keenAnalyticsModel.user.click.pageview.hide - keenAnalyticsModel.user.click.pageview.show) / 1000);
                        
                        if(typeof keenClient != "undefined"){
                        keenClient.recordEvent(keenAnalyticsModel.user.email, keenAnalyticsModel.user.click );
                        }
                        
                        $('#panel-spinner').hide();
                        
                        $('.HomeToolbar').show();
                        
                        //$('.connectivity_status').show();
                        }
                        });
  
 
  
  $('#Billing').on('pageshow',function(){app.keepLivePage($.mobile.activePage.attr("id"));});
  
  $('#Billing').on('pagebeforeshow',function(){
                   
                   if( app.countMeters() > 0 ){
                   
                   var lastsyncdate = JSON.parse(app.getlastComparisonSync()); //this holds the last sync data
                   
                   if(lastsyncdate){
                   app.getWholeComparisonData(moment(lastsyncdate).startOf('month').valueOf());
                   } else{
                   app.getWholeComparisonData(moment().subtract(2,'month').startOf('month').valueOf());
                   }
                   
                   }
                   
                   });
  
  });
