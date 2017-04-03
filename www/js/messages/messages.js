var messages = function(param) {
    this.param = param;
};

messages.prototype = {
    init : function(){
        this.build();
        this.setMessageNotificationNumber();
        this.refreshSwiper();    
    },
    build : function(){
        var tabmenu = $('.tabs-menu'),
            main_tab = $('.tab div'),
            noalertmsg =$('.no_alert_div'),
            tab_1 = $('#tab-1 .messages'),
            tab_2 = $('#tab-2 .messages'),
            tab_3 = $('#tab-3 .messages');
        
        tabmenu.find('a[href="#tab-1"] span:eq(0)').removeClass('new_msg');
        tabmenu.find('a[href="#tab-2"] span:eq(0)').removeClass('new_msg');
        tabmenu.find('a[href="#tab-3"] span:eq(0)').removeClass('new_msg');
        
        tab_1.empty();
        tab_2.empty();
        tab_3.empty();
        
        noalertmsg.show();
        
        if(this.param.length === 0) return;
        
        var arr = this.param;
        
        arr.sort(function (a, b) {
                  if (a.time < b.time) {
                  return 1;
                  }
                  if (a.time > b.time) {
                  return -1;
                  }
                  // a must be equal to b
                  return 0;
                  });
        
        for(var msg=0; msg<arr.length; msg++) {
            
            var id = arr[msg].id,
                time = arr[msg].time,
                ack = arr[msg].ack_time,
                type = arr[msg].type,
                title = arr[msg].title,
                msg_txt = arr[msg].txt,
                totalTime = tm.timestampToHourFormat(time);
            
            (msg_txt) ? msg_txt = msg_txt : msg_txt = '';
            
            switch (type){
                    
                case 'ANNOUNCEMENT':
                    
                    noalertmsg.hide();
                    
                    if(!ack){
                        $('.tabs-menu a[href="#tab-1"] span:eq(0)').addClass('new_msg');
                        tab_1.append(
                                     this.getMessageUnreadTemplate(
                                                                   id,
                                                                   title,
                                                                   totalTime,
                                                                   msg_txt,
                                                                   type,
                                                                   0
                                                                   )
                                     );
                    }else{
                        tab_1.append(
                                     this.getMessageReadTemplate(
                                                                 id,
                                                                 title,
                                                                 totalTime,
                                                                 msg_txt,
                                                                 type,
                                                                 0
                                                                 )
                                     );
                    }
                    
                    break;
                    
                case 'RECOMMENDATION_STATIC':
                    if(!ack){
                        $('.tabs-menu a[href="#tab-2"] span:eq(0)').addClass('new_msg');
                        tab_2.append(
                                     this.getMessageUnreadTemplate(
                                                                   id,
                                                                   title,
                                                                   totalTime,
                                                                   msg_txt,
                                                                   type,
                                                                   0
                                                                   )
                                     );
                    }else{
                        tab_2.append(
                                     this.getMessageReadTemplate(
                                                                 id,
                                                                 title,
                                                                 totalTime,
                                                                 msg_txt,
                                                                 type,
                                                                 0
                                                                 )
                                     );
                    }
                    
                    break;
                    
                case 'RECOMMENDATION_DYNAMIC':
                    if(!ack){
                        $('.tabs-menu a[href="#tab-3"] span:eq(0)').addClass('new_msg');
                        tab_3.append(
                                     this.getMessageUnreadTemplate(
                                                                   id,
                                                                   title,
                                                                   totalTime,
                                                                   msg_txt,
                                                                   type,
                                                                   0
                                                                   )
                                     );
                    }else{
                        tab_3.append(
                                     this.getMessageReadTemplate(
                                                                 id,
                                                                 title,
                                                                 totalTime,
                                                                 msg_txt,
                                                                 type,
                                                                 0
                                                                 )
                                     );
                    }
                    
                    break;
                    
                case 'ALERT':
                    var typeOfAlert = arr[msg].alert_type,
                        results = app.getStringNumbers(msg_txt); //waiting 3 numbers
                    
                    noalertmsg.hide();
                    
                    if(!ack){
                        
                        $('.tabs-menu a[href="#tab-1"] span:eq(0)').addClass('new_msg');
                        if (typeOfAlert.indexOf("BUDGET") >= 0){
                            tab_1.append(this.getMessageUnreadTemplate(id,title,totalTime,msg_txt,type,results));
                        }else{
                            tab_1.append(this.getMessageUnreadTemplate(id,title,totalTime,msg_txt,type,0));
                        }
                    }else{
                        if(typeOfAlert.indexOf("BUDGET") >= 0){
                            tab_1.append(this.getMessageReadTemplate(id,title,totalTime,msg_txt,type,results));
                        }else{
                            tab_1.append(this.getMessageReadTemplate(id,title,totalTime,msg_txt,type,0));
                        }
                    }
                    
                    break;
            }//switch end
            
        }
        
        this.showButtonLoaders();
        
    },
    showButtonLoaders : function(){
        
        var tab_1 = $('#tab-1 .messages'),
            tab_2 = $('#tab-2 .messages'),
            tab_3 = $('#tab-3 .messages');
            numberOfAlerts = parseInt( tab_1.attr('data-total'), 10 ),
            numberOfTips = parseInt( tab_2.attr('data-total'), 10 ),
            numberOfReccomendations = parseInt( tab_3.attr('data-total'), 10 ),
            load_more = app.appLabels.load_more;;
        
        $('.prelolo').hide();
                
        //alerts
        tab_1.attr('data-size',numberOfAlerts);
        
        var tab1diff = numberOfAlerts - tab_1.find('li').length;
        
        if(tab1diff > 0) {
            
            tab_1.closest('.tab-content').find('.loadMoreMessages').text( load_more + ' (' + tab1diff +')').show();
            
        }
        
        if(numberOfAlerts == tab_1.find('li').length) {
            
            tab_1.closest('.tab-content').find('.loadMoreMessages').hide();
            
        }
        
        //tips
        tab_2.attr('data-size',numberOfTips);
        
        var tab2diff = numberOfTips - tab_2.find('li').length;
        
        if(tab2diff > 0) {
            
            tab_2.closest('.tab-content').find('.loadMoreMessages').text( load_more + ' (' + tab2diff +')').show();
            
        }
        
        if(numberOfTips == tab_2.find('li').length) {
            
            tab_2.closest('.tab-content').find('.loadMoreMessages').hide();
            
        }
        
        //recommendations
        tab_3.attr('data-size',numberOfReccomendations);
        
        var tab3diff = numberOfReccomendations - tab_3.find('li').length;
        
        if(tab3diff > 0) {
            
            tab_3.closest('.tab-content').find('.loadMoreMessages').text( load_more + ' (' + tab3diff +')').show();
            
        }
        
        if(numberOfReccomendations == tab_3.find('li').length) {
            
            tab_3.closest('.tab-content').find('.loadMoreMessages').hide();
            
        }

    
    },
    getMessageReadTemplate : function(a,b,c,d,e,f){
        //return the read message template
        return '<li id='+a+' val='+f+' type='+e+' class="item-link item-content enabled message_seen" ><div class="item-inner"><div class="item-title-row"><div class="item-title" >'+b+'</div><div class="item-after">'+c+'</div></div><div class="item-subtitle"></div><div class="item-text">'+d+'</div></div></li>';
    },
    getMessageUnreadTemplate : function(a,b,c,d,e,f){
        //return the unread message template
        return '<li id='+a+' val='+f+' type='+e+' class="item-link item-content" style="margin-right:10px;"><div class="item-media"><p class="new_msg_list"></p></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+b+'</div><div class="item-after">'+c+'</div></div><div class="item-subtitle"></div><div class="item-text">'+d+'</div></div></li>';
    },
    setMessageNotificationNumber : function(){
        //get the number of unread mesages
        var num = this.countMessages(),
            element = $('.mynotif');
        
        if( num > 0) {
            element.find('.notification-counter').text(num);
        }else{
            element.find('.notification-counter').text('');
        }
    },
    refreshSwiper : function(){
        var img,title,
            swip = $('#dashboard_swiper');
        
        swip.empty();
        
        if(this.param.length === 0) return;
       
        $.each(this.param, function(){
              
               if(this.type == 'ALERT' || this.type == 'budget') {
                img = '<img src="img/SVG/warning.svg" >';
               } else if(this.type == 'RECOMMENDATION_STATIC' || this.type == 'ANNOUNCEMENT') {
                img = '<img src="img/SVG/info.svg" >';
               } else if(this.type == 'RECOMMENDATION_DYNAMIC') {
                img = '<img src="img/SVG/learning-mode-gear.svg" >';
               }
               
               swip.append('<div class="swiper-slide "><div class="swiper-text" ><span>'+img+'</span><span class="messagesShortcuts" id='+this.id+' type='+this.type+' val='+this.val+' ><div class="item-title">'+this.title+'</div><div class="item-text" style="display:none;">'+this.txt+'</div></div></span></div></div>');
               
               });
    },
    choose : function(obj){
        
        var type_id = obj.attr('id'), // messages id
            type = obj.attr('type'), //0:alert /1:tip /2: insight/ 3: budget
            val = obj.attr('val'), //mostly for budget - value
            short = obj.find('.item-title').text(), // short string
            long = obj.find('.item-text').text(), // long string
            thetab = $('.tab-content li');
        
        thetab.removeClass('enabled');
        
        obj.addClass('enabled');
        obj.css({'font-family':'opensans-light'});
        obj.find('.item-media p').hide();
        
        this.create(
                    {
                    'id' : type_id,
                    'type' : type,
                    'value':val,
                    'short' : short,
                    'long':long
                    }
                    );
    
    },
    next : function(){
    
        var activeMessageTab = $('.tabs-menu a.tabActive').index(),
            activeMessageTab1 = $('#tab-'+(activeMessageTab + 1)+ ' li.enabled').index(),
            nextmsg =  $('#tab-'+(activeMessageTab + 1)+ ' li:eq('+activeMessageTab1+')').next('li'),
            thetab = $('.tab-content li');
        
        if(nextmsg.length === 0) {
            return;
        }
        
        var type_id = nextmsg.attr('id'), // messages id
            type = nextmsg.attr('type'), //0:alert /1:tip /2: insight/ 3: budget
            val = nextmsg.attr('val'), //mostly for budget - value
            short = nextmsg.find('.item-title').text(), // short string
            long = nextmsg.find('.item-text').text(); // long string
        
        nextmsg.css({'font-family':'opensans-light'});
        nextmsg.find('.item-media p').hide();
        
        thetab.removeClass('enabled');
        
        $('#tab-'+(activeMessageTab + 1)+ ' li:eq('+activeMessageTab1+')').next('li').addClass('enabled');
        
        this.create(
                    {
                    'id' : type_id,
                    'type' : type,
                    'value':val,
                    'short':short,
                    'long':long
                    }
                    );
    
    },
    previous : function(){
    
        var activeMessageTab = $('.tabs-menu a.tabActive').index(),
            activeMessageTab1 = $('#tab-'+(activeMessageTab + 1)+ ' li.enabled').index(),
            prevmsg =  $('#tab-'+(activeMessageTab + 1)+ ' li:eq('+activeMessageTab1+')').prev('li'),
            thetab = $('.tab-content li');
        
        if(prevmsg.length === 0) return;
        
        var type_id = prevmsg.attr('id'), // messages id
            type = prevmsg.attr('type'), //0:alert /1:tip /2: insight/ 3: budget
            val = prevmsg.attr('val'), //mostly for budget - value
            short = prevmsg.find('.item-title').text(), // short string
            long = prevmsg.find('.item-text').text(); // long string
        
        prevmsg.css({'font-family':'opensans-light'});
        prevmsg.find('.item-media p').hide();
        
        thetab.removeClass('enabled');
        
        $('#tab-'+(activeMessageTab + 1)+ ' li:eq('+activeMessageTab1+')').prev('li').addClass('enabled');
        
        this.create(
                    {
                    'id' : type_id,
                    'type' : type,
                    'value':val,
                    'short':short,
                    'long':long
                    }
                    );
    
    },
    create : function(parameters){
        
        var type_id = parameters.id,
            type = parameters.type,
            val = parameters.value,
            short = parameters.short,
            long = parameters.long,
            mapPage,
            mapContent,
            percentage,
            setremain,
            budget,
            remain,
            msg = getObjects(this.param, 'id', type_id ),
            shortMessage = $('#shortMessageString'),
            longMessage = $('#longMessageString'),
            tipMessage = $('#tipMessageImg'),
            msgCircleAlert = $('#myStat4'),
            messageContents = $('.msgContents'); //query with id
        
        if(msg[0].active) {
            msg[0].active = false; // message seen - change to false!
            msg[0].ack = true;
            if(msg[0].ack_time === undefined)  msg[0].ack_time = null;
            msg[0].ack_time = new Date().getTime(); // message seen - set time!
        }
        
        if(!keenAnalyticsModel.user.click.messages[type_id]){
            keenAnalyticsModel.user.click.messages[type_id] = 0;
        }
        keenAnalyticsModel.user.click.messages[type_id] +=1;
        
        shortMessage.text(short);
        
        messageContents.hide();
        
        if(type == 'RECOMMENDATION_STATIC') { // it s a tip! tips include icons!
            
            tipMessage.attr('src','data:image/png;base64,'+msg[0].image).show();
            
        } else if(type == 'RECOMMENDATION_DYNAMIC'){
            
        } else if(type == 'ALERT'){
            
            var typeOfAlert = msg[0].alert_type;
            
            if (typeOfAlert.indexOf("BUDGET") >= 0) {
               
                var values = val.split(","),
                    used = values[1],
                    remaining = values[4],
                    sss = app.appLabels.remaining;
                
                if(remaining === undefined) {
                    remain = used;
                    percentage  = parseInt(app.getStringNumbers(short),10);
                } else {
                    budget = parseInt(remaining) + parseInt(used) ;
                    remain = remaining +''+ app.appLabels.volume.short;
                    percentage  = (used / budget) * 100;
                }
                            
                msgCircleAlert.data('text','<span>' + remain +'</span>');
                msgCircleAlert.data('info',sss);
                msgCircleAlert.data('dimension',screen.width * 0.7);
                msgCircleAlert.data('percent',percentage);
                msgCircleAlert.empty().show();
                msgCircleAlert.circliful();
                
            }
        } else if(type == 'ANNOUNCEMENTS'){}
        
        longMessage.text(long);
        
        $.mobile.changePage( "#showmemessage", { transition: "slide" } );
            
    },
    countMessages : function(){
        //the functionr eturnd the number of unread messages
        var count = 0;
        
        if(this.param.length === 0) return;
        
        $.each(this.param,function(){
               if(this.ack_time === null){
                    count  = count + 1;
               }
               });
        
        return count;
        
    },
    seenMessage : function(){
        
        var mg = this.param.msgs;
        
        var sg = this.param.ackmsgs;
        
        for(var i=0; i< mg.length; i++){
            
            if( mg[i].ack ){
            
                var obj = getObjects(sg, 'id',mg[i].id);
                
                if(obj.length === 0){
                
                    sg.push({"id": mg[i].id,"timestamp": mg[i].ack_time,"type": mg[i].type});
                
                }
            
            }
        
        }
       
    },
    messageBar : function(){
        var obj = this.param,
            tab = obj.attr("href"),
            tabMenu = $('.tabs-menu');
        
        tabMenu.find('a.tabActive').removeClass(' tabActive');
        tabMenu.find('span.msgActive').removeClass(' msgActive');
        
        obj.addClass('tabActive');
        obj.find('.new_msg').hide();
        obj.find('span').addClass('msgActive');
        
        $('.tab-content').not(tab).css('display', 'none');
        $(tab).show();
        
    }
    
};


$(function() {
    
  $('#messaging').on('pagebeforeshow',function(){
                     
                     var screenheight;
                     
                     (screen.height) ? screenheight = screen.height - 150 : screenheight = $(this).height();
                     
                     $(this).find('.page-content').css({'height':screenheight+'px'});
                     
                     app.keepLivePage();
                     
                     });
  
  //remove page
  $(document).on('pagehide','#showmemessage',function(){
                 
                 $.each(keenAnalyticsModel.user.click.messages,function(key,value){
                        keenAnalyticsModel.user.click.messages[key] = 0;
                        });
                 });
  
  $(document).on('pagebeforeshow','#showmemessage',function(){
                 
                 var msg = new messages({'msgs' : app.user.notifications, 'ackmsgs' : app.user.settings.ackMessages });
                 msg.seenMessage();
                 
                 app.setUserToLocalStorage(JSON.stringify(AppModel.user));
                 
                 });
  
  //count seen and non seen messages and send acked messages to server
  $(document).on('pagebeforehide','#showmemessage',function(){
                 
                 var msg = new messages($(this));
                 
                 msg.setMessageNotificationNumber();
                 
                 app.ackUserMessages();
                 
                 });
  
  //on click message type bar
  $('.tabs-menu a').tap(function(event) {
                        var msg = new messages($(this));
                        msg.messageBar();
                        });
  
  //on choose message from the message list
  $('.tab-content').on('click','li',function(){
                       var msg = new messages(app.user.notifications);
                       msg.choose( $(this) );
                       });
  
  //on click t see the next message from the current
  $(document).on('click','.nextMessage',function(){
                 var msg = new messages(app.user.notifications);
                 msg.next();
                 });
  
  //on click to see the previous message from the current
  $(document).on('click','.prevMessage',function(){
                 var msg = new messages(app.user.notifications);
                 msg.previous();
                 });
  
  $(document).on('click','.messagesShortcuts',function(){
                 var msg = new messages(app.user.notifications);
                 msg.choose($(this) );
                 });
  
  });



