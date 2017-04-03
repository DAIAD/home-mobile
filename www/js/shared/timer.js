var showertimer = function(param) {
    this.param = param;
};

showertimer.prototype = {
    init : function(){
        
        var setIndex = this.param.active,
            tab = $('.tabTimer'),
            completed = $('#timerCompleted_2'),
            realTimeTimer = $('#realTimer'),
            realTimerResult = $('#realTimerResult'),
            typeResult =  $('#timer_type_result'),
            quickshower =  $('#quickShower'),
            element = $('#showerLastSettings'),
            lastdata = $('#lastData'),
            bestdata = $('#bestData'),
            tabTimerActive = $('.tabTimer a:eq('+setIndex+')').find('span').text();
        
        tab.find('a.evtActive').removeClass('evtActive ');
        tab.find('span.msgActive').removeClass(' msgActive');
        tab.find('a:eq(0)').addClass('evtActive').find('span').addClass('msgActive');
        
        if(this.param.used === 0) {
            
            quickshower.attr('disabled',true);
            element.find('span:eq(0)').hide(); //hide 'Active' label
            element.find('span:eq(1)').show(); // Show  'Inactive' label
            element.find('span:eq(2)').text('');
            element.find('span:eq(3)').text('');
            
        } else {
            
            quickshower.removeAttr('disabled');
            element.find('span:eq(1)').hide();
            element.find('span:eq(0)').show();
            element.find('span:eq(2)').text( tabTimerActive );
            
            if(this.param.active === 0) {
                
                element.find('span:eq(3)').text(
                                                tm.secondsToTimeShortLabels( this.param.duration )
                                                );
                
            } else if(this.param.active == 1) {
                
                element.find('span:eq(3)').text(
                                                this.param.volume + ' ' + app.appLabels.volume.short
                                                );
                
            } else {
                
                element.find('span:eq(3)').text(
                                                this.param.energy + ' ' + app.appLabels.energy.kwh
                                                );
            }
        }
        
        this.showTimerProgress(
                               {
                               volume : 0,
                               temperature : 0,
                               energy : 0
                               }
                               );
        
        realTimerResult.hide();
        
        realTimeTimer.find('p:eq(0)').show();
        realTimeTimer.find('p:eq(1)').show();
        realTimeTimer.find('p:eq(2)').hide();
        realTimeTimer.find('p:eq(3)').hide();
        
        completed.show().attr('disabled',true);
        
        typeResult.hide();
        
        bestdata.hide();
        lastdata.hide();
        
    },
    initializeCircle : function(show){
        
        new budgetWidget(
                         $('#timerCircle'),
                         'myStat2',
                         {
                         'dimension': screen.width*0.90,
                         'percent' : show.percent,
                         'text' : show.text,
                         'width' : 70,
                         'info' : show.info,
                         'fontsize' : 16,
                         'bordersize' : 12,
                         'fgcolor' : show.fgcolor,
                         'bgcolor' : '#eee',
                         'marginleft' : 5
                         }
                         );
        
    },
    showTimerProgress : function(data){
        
        AppModel.mutex = false;
        
        this.timerPageCss(data); //set any css
        
        this.circleProgress(this.param,data); //set circle with css and data
        
        this.temperatureAlarm(this.param,data.temperature); //beep for temp alarm
        
        this.showerListElementProgress(data); // list event
    },
    timerPageCss : function(param){
        
        if(param.volume === 0) return;
        
        var timer = $('#realTimer p'),
            timerresult = $('#realTimerResult'),
            timercomplete = $('#timerCompleted_2');
        
        timer.eq(0).hide();
        timer.eq(1).hide();
        timer.eq(2).show();
        timer.eq(3).show();
        
        if ( timerresult.is(":visible") ) {
            timerresult.hide();
            timer.show();
            timercomplete.show();
        }
        
        if(param.duration > 240 || param.volume > 4 || param.energy > 200){
            timercomplete.removeAttr('disabled');
        }
        
    },
    circleProgress : function(obj,param){
        
        var result = this.getCircleData(obj,param);
        
        var color = this.getCircleColor(result.rest);
        
        this.initializeCircle(
                              {
                              percent :result.rest,
                              text : result.text + ' ' + result.label,
                              info : 'Temp ' + result.info,
                              fgcolor : color,
                              }
                              );
        
        this.circleBeep(result.rest);
        
    },
    getCircleData : function(obj,data){
        
        var time,
            txt,
            label,
            res,
            ene,
            res_1,
            dt;
        
        if( obj.active == 0) { //duration
            
            time  = tm.secondsToTimeAll(data.duration);
            
            txt = time.m + '<span style="font-size:6vh;">min</span> '+ time.s + '<span style="font-size:6vh;">sec</span>'; // CHANGE IT
            label = '';
            res = (data.duration / obj.duration ) * 100;
            
        } else if(obj.active == 1) { //volume
            
            dt = app.volumeTempLocale( { volume : data.volume, temp : data.temperature } );
            
            txt = (dt.volume.value).toFixed(2).replace(".", ",");
            label = dt.volume.label;
            res = (dt.volume.value / obj.volume ) * 100;
            
        } else { //energy
            
            ene = app.getEnergyValueLabel(data.energy);
            
            txt = ene.value;
            label = ene.label;
            res = ((data.energy/1000) / obj.energy) * 100;
            
        }
        
        return {
            'text' : txt,
            'info' : dt.temp.value + '   '+ dt.temp.label,
            'label' : label,
            'rest' : res
        }
        
        
    },
    circleBeep : function(res){
        
        if( (100 - res) <= 10 ) {
            $.event.trigger(
                            {
                            type:"playBeep",
                            message:1
                            }
                            );
        }
        
        if( res >= 100){
            $.event.trigger(
                            {
                            type:"playBeep",
                            message:4
                            }
                            );
        }
        
    },
    getCircleColor : function(res){
        
        var value;
        
        if( res > 0 && res <= 50 ) {
            value =  '#00ff40';  //green
        } else if( res > 51 && res <= 80 ) {
             value =  '#2D3580' ;  //blue
        } else if( res > 80 && res < 100) {
             value =  '#ff8000' ; //orange
        } else if( res >= 100){
             value =  '#ff0000' ;  //red
        }

        return value;
        
    },
   
    showerListElementProgress : function(param){
        
        var data = app.volumeTempLocale(
                                        {
                                        volume : param.volume,
                                        temp : param.temperature
                                        }
                                        ),
            timerdata = $('#timerData'),
            timerdtlist = $('#timerData li');
                
        timerdata.find('.item-title span:eq(0)').text((data.volume.value).toFixed(2).replace(".", ","));
        timerdata.find('.item-title span:eq(1)').text(data.volume.label);
        timerdata.find('.item-title span:eq(2)').text('');
        
        timerdata.find('.item-title').next('div').text(tm.secondsToTimeShortLabels(param.duration));
        
        timerdata.find('.row span:eq(0)').text(tm.timeConverter(param.date));
        timerdata.find('.row span:eq(1)').text(app.getUserFirstName());
        timerdata.find('.row span:eq(2)').text(app.ComputeEfficiencyRatingFromEnergy(param.energy));
        
        timerdtlist.attr('id',param.id);
        timerdtlist.attr('data-name',param.showerId);
        
    },
    getShowerTimerBestShower : function(){

        var pm = this.param;
        
        var prevEnabled = $('.tabTimer a.evtActive').index();
        
        trans.getBestShower(
                         prevEnabled,
                         function(data){
                          pm.best = app.processGetBestShower(data);
                         }
                         );

        trans.getLastFiveShowers(
                              function(data){
                                 pm.lastfive = app.prcGetLastFiveShowers(data);
                              }
                              );
        
    },
    setCustomPage : function(){
       
        var comp = new component();
        
        var min = app.tempLocale({temp : 30});
        
        var max = app.tempLocale({temp : 60});
        
        var timelabels = tm.secondsToTimeShortLabels(this.param.duration);
        
        var previousShower = $('#prevShower');
        
        previousShower.find('span:eq(1)').text(timelabels);
        
        previousShower.find('span:eq(2)').text('');
        
        $('.selectTabs ').html( comp.increment(0,59,'min') );
        
        //$('.selectTabs1 ').html( comp.increment(0,59) );
        
        $('.selectTabsTemp').html( comp.increment(min.temp.value , max.temp.value ,min.temp.label) );
        
    },
    userCustomTimerOptions : function(){
        
        var alarm,
            time_1,
            time_2,
            tempswitch = $('#tempSwitcher'),
            result1 = $('.selectTabs input'),
            result2 = $('.selectTabsTemp input'),
            index = $('.tabTimer a.evtActive').index(),
            name = $('.tabTimer a.evtActive').attr('name');
        
        if( index == 0 ) {
            time_1 = parseInt( result1.val(), 10 );
            alarm = time_1 * 60; //+ time_2;
        } else {
            alarm = parseInt( result1.val(), 10);
        }
        
        if ( tempswitch.is(':checked') ) {
            var tempAlarm = parseInt(result2.val(),10);
            this.param.temp_active = true;
            this.param.temp = tempAlarm;
        } else {
            this.param.temp_active = false;
        }
        
        this.param.active = index;
        this.param[name] = alarm;
        this.param.used +=1;
        
    },
    setNewMetric : function(obj){
        var index = obj.index(),
            tab = $('.tabTimer'),
            previousShower = $('#prevShower');
        
        tab.find('a.evtActive').removeClass('evtActive ');
        tab.find('span.msgActive').removeClass(' msgActive');
        
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        var comp = new component();
                
        if(index == 0) {
            
            previousShower.find('span:eq(1)').text(
                                                   tm.secondsToTimeShortLabels(this.param.duration)
                                                   );
            
            previousShower.find('span:eq(2)').text('');
            
            $('.selectTabs div').eq(0).html( comp.increment(0,59,'min') );
            
        } else if(index == 1) {
            
            previousShower.find('span:eq(1)').text(
                                                   (this.param.volume).toFixed(2)
                                                   );
            
            previousShower.find('span:eq(2)').text(app.appLabels.volume.short);
            
            $('.selectTabs div').eq(0).html(
                                            comp.increment(4,150,app.appLabels.volume.short)
                                            );
            
        } else {
            
            previousShower.find('span:eq(1)').text(this.param.energy);
            
            previousShower.find('span:eq(2)').text(app.appLabels.energy.kwh);
            
            $('.selectTabs div').eq(0).html(
                                            comp.increment(1,10,app.appLabels.energy.kwh)
                                            );
            
        }
    },
  
    stopTimer : function(obj){
        
        obj.hide();
        
        var best = this.param.best;
        
        var last = this.param.lastfive;
        
        $('#realTimer p').hide();
        
        $('#timer_type_result').text(app.appLabels.this_shower).show();
        
        $('#realTimerResult').show();
        
        $('#lastFiveData').empty();
        
        $('#timerBestData').empty();
        
        this.createListElement(
                               {
                               selector:$('#timerBestData'),
                               data: best
                               }
                               );
        
        for(var i=0; i<last.length; i++){
            
            this.createListElement(
                                   {
                                   selector:$('#lastFiveData'),
                                   data : last[i]
                                   }
                                   );
            
        }
        
        
        var best = false, value,
            bestdata = $('#bestData'),
            lastdata = $('#lastData'),
            mystat = $('#myStat2'),
            timerresult = $('#timer_type_result'),
            percent = mystat.data('percent');
        
        if (this.param.active === 0) {
            value = (percent/100) * this.param.duration;
            if(value < this.param.best.duration){
                best = true;
            }
        } else if(this.param.active == 1) {
            value = (percent/100) * this.param.volume;
            if(value < this.param.best.volume.value) {
                best = true;
            }
        } else {
            value = (percent/100) * this.param.energy;
            if(value*1000 < this.param.best.energy){
                best = true;
            }
        }
        
        if(best){
            
            timerresult.text(app.appLabels.best);
            
            bestdata.hide();
            
            lastdata.hide();
            
            var result = this.getCircleData(obj,this.param);
            
            this.initializeCircle(
                                  {
                                  percent: 100,
                                  text : result.text + ' ' + result.label,
                                  info : 'Temp ' + result.info,
                                  fgcolor : '#00ff40'
                                  }
                                  )
        }else{
            
            lastdata.show();
            
            bestdata.show();
            
        }
        
        AppModel.mutex  = true; 

        
    },
    createListElement : function(config){
        
        var selector = config.selector,
            data = config.data,
            member = data.name,
            b1 = app.getb1NameById(data.id),
            average = AppModel.consumption,
            arrow = app.computeArrow( data.volume.value , average.volume ),
            template = app.getListTemplate(b1,data.energy),
            time = data.date,
            day = moment(time).isoWeekday(),
            datee = moment(time).date(),
            month = moment(time).month() + 1,
            volume = data.volume.value;
        
        selector.append(
                        app.showerListTemplate(
                                               {
                                               member : data.member,
                                               devicekey : data.id,
                                               data_category : null,
                                               showerId : null,
                                               volume_value : data.volume.value.toFixed(2).replace(".", ","),
                                               volume_label : data.volume.label,
                                               status_arrow : arrow,
                                               duration_value : tm.secondsToTimeShortLabels(data.duration.value),
                                               duration_label :data.duration.label,
                                               date : moment.weekdaysShort(day) +','+ datee +'/'+ month,
                                               member_name : member,
                                               template : template,
                                               list_img : 'img/SVG/shower.svg',
                                               right_arrow: ''
                                               }
                                               )
                        );
        
    },
    temperatureAlarm : function(timer,value){
        
        if( timer.temp_active ) {
            if(value > timer.temp) {
                $.event.trigger(
                                {
                                type:"playBeepTemp",
                                message:2
                                }
                                );
            }
        }
        
    },
    beepProgress : function(res){

        if( (100 - res) <= 10 ) {
            $.event.trigger(
                            {
                            type:"playBeepOne",
                            message:1
                            }
                            );
        }
        
        if( res >= 100) {
            $.event.trigger(
                            {
                            type:"playBeep",
                            message:4
                            }
                            );
        }
        
    },
    tempSwitch : function(obj){
        
        if( obj.is(":checked") ) {
            obj.closest('.list-block').next('.item-input').show();
        } else {
            obj.closest('.list-block').next('.item-input').hide();
        }
        
    },
    exitTimer : function(){},
    timerStop : null
    
};


$(function(){
  
  $('#CountTimer').on('pagebeforeshow',function(){
                      
                      shtmr.init();
                     
                      });
  
  //initialize shower timer views
  $('#ShowerTimer,.exitTimer').click(function(){
                                     
                                     shtmr.init();
                          
                                     });

  //use previous timer options and wait for data
  $('#quickShower').click(function(){

                          shtmr.showTimerProgress({volume : 0,temperature : 0,energy : 0});
                          
                          shtmr.getShowerTimerBestShower();
                          
                          });
  
  //start timer and wait for data
  $('#startmycounter').click(function(){

                             shtmr.userCustomTimerOptions();
                            
                             shtmr.showTimerProgress({volume : 0,temperature : 0,energy : 0});
                             
                             shtmr.getShowerTimerBestShower();
                             
                             });
  
  //set custom timer values
  $('#singleShower').click(function(){
                           
                           shtmr.setCustomPage();
                          
                           });

  //choose between volume,energy,duration
  $('.tabTimer a').tap(function(){
                       
                       shtmr.setNewMetric($(this));
                       
                       });
  
  //enable temperature limiter for the shower
  $('#tempSwitcher').on('change',function(){
                        
                        shtmr.tempSwitch($(this));
                       
                        });
  
  //stop shower timer and see rsults
  $('#timerCompleted_2').click(function(){
                              
                               shtmr.stopTimer($(this));
                              
                               });
  
  });
