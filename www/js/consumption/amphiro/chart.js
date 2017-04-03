var amphiroStats = function(param) {
    
    this.param = param;
    
    var results = this.param.data;
    
    var len = results.rows.length, data = [], current =[];
    
    current.push(results.rows.item(0));
    
    for (var i=1; i<len; i++){
        
        current.push(results.rows.item(i));
        
        if( current[i-1].indexs == current[i].indexs) {
            
            var x = i-1;
            
            current[x]=null;
            
            current[i]={
                volume:results.rows.item(i).volume,
                indexs :results.rows.item(i).indexs,
                energy:results.rows.item(i).energy,
                temp:results.rows.item(i).temp,
                duration:results.rows.item(i).duration,
                cdate: results.rows.item(i-1).cdate,
                member:results.rows.item(i-1).member,
                id:results.rows.item(i).id,
                category:results.rows.item(i-1).category,
                history:results.rows.item(i-1).history,
                name : results.rows.item(i-1).name
            };
            
        }
        
    } //for end
    
    for (var j=0; j<current.length; j++) {
        if(current[j] && current[j].volume > 0) {
            data.push(
                      app.metricLocale(current[j])
                      );
        }
    }
    
    this.newdata = data.slice(0,this.param.limit);
};

amphiroStats.prototype = {

    setTotalNumberShowerTab : function(){
        //data
        var data = this.newdata;
        var tlt,lb,
            sum=0,
            type = app.getActiveMetric(),
            data_ex = data.slice().reverse();
        
        $.each(data_ex,function(){
               if(type===0){
               sum += this.volume.value;
               } else if(type==1) {
               sum += this.duration.value;
               } else if(type==2) {
               sum += this.energy.value;
               } else {
               sum += this.temp.value;
               }
               });
        
        if(type === 0) {
            tlt = sum.toFixed(2).replace(".",",");
            lb = app.appLabels.volume.short;
        } else if(type === 1) {
            tlt = tm.secondsToMinutes(sum);
            lb = 'min';
        } else if(type === 2) {
            var ene = app.getEnergyValueLabel(sum);
            tlt = (ene.value).toFixed(2).replace(".",",");
            lb = ene.label;
        }else if(type === 3) {
            tlt =  parseInt( sum / data.length , 10 );
            lb = app.appLabels.temperature.short;
        }
        
        this.setShowerTotalValue(
                                {
                                'value' : tlt,
                                'label' : lb
                                }
                                );
        
    },
    setShowerTotalValue : function(total){
        
        var totaldiv = $('#totalValues'),
            helper = $('#span_liters');
        
        totaldiv.text( total.value );
        
        helper.text(total.label);
        
    },
    setDataToGraph : function(selector){
        //selector, data
        var data = this.newdata;
         
        app.emptySelector(selector);
        
        app.checkNoDataDiv(selector,data.length);
        
        if(!data.length) {
            return false;
        }
        
        var ticks,
            showersID = [],
            type = app.getActiveMetric(),
            charts = daiad.charts,
            Measurement = daiad.model.Measurement,
            data_ex = data.slice().reverse();
        
        $.each(data_ex,function(i){
               
               if(type===0) {
                    showersID.push(
                                   new Measurement(i+1, new Date(this.date), this.volume.value)
                                   );
               } else if(type==1) {
                    showersID.push(
                                   new Measurement(i+1, new Date(this.date), tm.secondsToMinutes(this.duration.value))
                                   );
               } else if(type==2) {
                    showersID.push(
                                   new Measurement(i+1, new Date(this.date), this.energy.value)
                                   );
               } else {
                    showersID.push(
                                   new Measurement(i+1, new Date(this.date), this.temp.value)
                                   );
               }
               });
        
        (showersID.length < 5) ? ticks = showersID.length : ticks = 5;
        
        if(showersID.length == 1) {
            
            ticks = 1;
            
            showersID.push(
                           new Measurement(0, new Date(), null)
                           );
            showersID.push(
                           new Measurement(2, new Date(), null)
                           );
        
        }
        
        charts.b1.plotForEvent(
                               selector,
                               showersID,
                               {
                               color:'#fff',
                               bars: true,
                               xaxis: {
                                    ticks:ticks , // number of X-axis ticks (approx)
                               },
                               }
                               );
    },
    fillMembersFilter : function(){
        
        var data = this.newdata,
            filterdiv =  $('#member_filter');
        
        if(!data.length) {
            filterdiv.hide().empty();
            return false;
        }
        
        var total = [], all = 0, nm;
        
        filterdiv.show().empty().css({'height' : '50px'});
        //push the first member
        total.push(
                   {
                   member: data[0].member,
                   name : data[0].name,
                   start : 1
                   }
                   );
        
        for(var x=1; x<data.length; x++) {
            //different member id
            if(data[x-1].member != data[x].member) {
                
                var test = getObjects(total, 'member', data[x].member);
                //push new member
                if(test.length === 0) {
                    
                    total.push(
                               {
                               member: data[x].member,
                               name : data[x].name,
                               start : 1
                               }
                               );
                    
                } else {
                    //count up existing member
                    var test2 = getObjects(total, 'member', data[x].member);
                    test2[0].start++;
                
                }
                
            } else { //same member id - count up showers
                var test1 = getObjects(total, 'member', data[x].member);
                test1[0].start++;
            }
        }
        //total includes all the assigned showers for each member
        for(var xx=0; xx<total.length; xx++) {
            //all tab (e.g. All (50) )
            all += total[xx].start;
            
            (total[xx].name.length > 4) ? nm = total[xx].name.substr(0,4) + '..' : nm = total[xx].name;
            
            filterdiv.append('<span id="'+total[xx].member+'">' + nm + '('+ total[xx].start + ')</span>');
            
            filterdiv.find('span').eq(xx).css({'width':  100/(total.length + 1) + '%','font-size':'6vw'});
            
        }
        
        if(total.length == 1) {
            
            filterdiv.find('span').eq(0).css({'width':  '100%'});
            
            filterdiv.hide();
            
        }
        
        if(total.length > 1 && total.length <=3) {
            
            filterdiv.prepend('<span id="all" class="meterActive memberSpanActive">All ('+ all + ') </span>');
            
            filterdiv.find('span').eq(0).css({'width':  100/(total.length + 1) + '%'});
            
        }
        
        if(total.length == 4 ) {
            
            filterdiv.find('span').css({'width':  '25%','font-size':'5vw'});
            
        }
        
        if(total.length >= 5 ) {
            
            filterdiv.css({'height':  '100px'});
            
            filterdiv.find('span').css({'width':  '33%','font-size':'6vw'});
            
        }
        
    },
    appendEventsToList : function(selector){
        
        var data = this.newdata,
            average = AppModel.consumption;
        
        app.emptyAmphiroListEvents();
        
        app.emptyMeterListEvents();
        
        for(var j=0; j<data.length; j++) {

            selector.append(
                            this.showerListTemplate(
                                                    {
                                                    member : data[j].member,
                                                    devicekey : data[j].id,
                                                    data_category : data[j].category,
                                                    showerId : data[j].indexs,
                                                    volume_value : (data[j].volume.value).toFixed(2).replace(".", ","),
                                                    volume_label : data[j].volume.label,
                                                    status_arrow : app.computeArrow( data[j].volume.value , average.volume ),
                                                    duration_value : tm.secondsToTime(data[j].duration.value),
                                                    duration_label : '',
                                                    date : app.leftSideTemplate( data[j].category, data[j].cdate ),
                                                    member_name : data[j].name,
                                                    template : app.getListTemplate( app.getb1NameById(data[j].id),data[j].energy.value ),
                                                    list_img : 'img/SVG/shower.svg',
                                                    right_arrow : 'img/SVG/arrow-list-right.svg'
                                                    }
                                                    )
                                );
        }
        
    },
    showerListTemplate : function(args){
        
        return '<li class="item-content" memid='+args.member+' id='+args.devicekey+' category='+args.data_category+' data-name='+args.showerId+'> \
                    <div class="item-media"><img src='+args.list_img+'></div> \
                    <div class="item-inner"> \
                        <div class="item-title-row"> \
                            <div class="item-title">'+args.volume_value+' <span style="font-size:2.2vh;font-family:"opensans-light";">'+args.volume_label+'</span> '+args.status_arrow +'</div> \
                            <div >'+ args.duration_value+ ''+args.duration_label+'</div> \
                        </div> \
                        <div class="item-subtitle"> \
                            <div class="row"><span>'+args.date+'</span><span style="text-align:center;">'+args.member_name+'</span> '+args.template+'</div> \
                        </div> \
                    </div> \
                    <img id="eventsrightarrow" src="'+args.right_arrow+'"> \
                    <p class="prelolo" style="text-align:center;display:none;margin-left: 15px;margin-right: 15px;"><span style="width:22px; height:22px" class="preloader "></span></p> \
                </li>';
        
    }
 

};
