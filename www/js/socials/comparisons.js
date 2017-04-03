var comparisons = function(param) {
    this.param = param;
};

comparisons.prototype = {
    init : function(){
     
        var numofb1 = app.countAmphiro(),
            numofmeter = app.countMeters(),
            buttons = $('.menu-tabs2'),
            calendar = $('.calendar_social'),
            tb0 = $('.socialTables:eq(0)'),
            tb1 = $('.socialTables:eq(1)'),
            tb2 = $('.socialTables:eq(2)'),
            tb3 = $('.socialTablesRank');
        
            this.setControlTime();
            this.setControlTimeLeftDays();
            this.setControlTimeArrows();
        
        if(numofb1 > 0 && numofmeter > 0) {
            buttons.show();
            tb1.hide();
            tb3.hide();
            tb2.show();
            tb0.show();
            calendar.show();
        } else if(numofb1 > 0 && numofmeter == 0) {
            buttons.hide();
            tb2.hide();
            //tb1.show();
            tb3.show();
            tb0.hide();
            calendar.hide();
        } else if(numofb1 == 0 && numofmeter > 0) {
            buttons.hide();
            tb2.hide();
            tb1.show();
            tb3.show();
            tb0.hide();
            calendar.show();
        }
        
    },
    getYearAverageBestIq : function(arr){
        var sum = 0,
            avg,
            total,
            bst = 0,
            iqclass= 'A';
        
        for(var i=0; i<arr.length; i++){

            if(arr[i].user.value == 'A') {
                sum += 1;
            } else if(arr[i].user.value == 'B') {
                sum += 2;
            } else if(arr[i].user.value == 'C') {
                sum += 3;
            } else if(arr[i].user.value == 'D') {
                sum += 4;
            } else if(arr[i].user.value == 'E') {
                sum += 5;
            } else if(arr[i].user.value == 'F') {
                sum += 6;
            } else if(arr[i].user.value == 'G') {
                sum += 7;
            }
            
            if(arr[i].user.volume < bst ) {
                bst = arr[i].user.volume;
                iqclass = arr[i].user.value;
            }
            
        }

        avg = Math.ceil(sum/arr.length);
        
        if(avg === 1) {
            total = 'A';
        } else if(avg === 2) {
            total = 'B';
        } else if(avg === 3) {
            total = 'C';
        } else if(avg === 4) {
            total = 'D';
        } else if(avg === 5) {
            total = 'E';
        } else if(avg === 6) {
            total = 'F';
        } else if(avg === 7) {
            total = 'G';
        }
        
        return {
            avg : total,
            best : iqclass
        };
    
    },
    scheduler : function(){
    
        var now = moment().valueOf();
        
        var lastSync = JSON.parse(app.getlastComparisonSync());
        
        if(!lastSync) return;
        
        if(moment().date() == 1) return;
        
        if( moment().date() >= 2  && (  moment(now).subtract(1,'month').month() !==  moment(lastSync).month() ) ) {
            //alert('sync');
            app.getComparisonData(now);
        }

    },
    setWaterIQ : function(wateriq){
        var searchtime = this.param,
            waterclass = wateriq[0].user.value,
            similar = wateriq[0].similar.value,
            neighbors = wateriq[0].nearest.value,
            city = wateriq[0].all.value,
            wateravgbest = this.getYearAverageBestIq(wateriq),
            percentage = this.getWaterIqPercent(waterclass),
            img = 'img/SVG/energy-'+waterclass+'.svg',
            iqthismonthvalue = $('.iqthismonthvalue'),
            iqlastmonth = $('#iqlastmonthvalue'),
            iqbestever = $('#iqbestevervalue'),
            iqyear = $('#iqthisyearaverage'),
            iqsimilar = $('#similar_wateriq'),
            iqneighbors = $('#neighbors_wateriq'),
            iqcity = $('#city_wateriq'),
            status = $('#water_iq_status_bar'),
            iqseries = $('#iqSeries tr');
                
        iqthismonthvalue.find('img').attr('src',img);
        
        (wateriq[1]) ? iqlastmonth.text(wateriq[1].user.value) : iqlastmonth.text('-');
        
        iqbestever.text(wateravgbest.best);
        iqyear.text(wateravgbest.avg);
        iqsimilar.text(similar);
        iqneighbors.text(neighbors);
        iqcity.text(city);
        
        status.css({'margin-left' : percentage + '%'});
        
        iqseries.each(function(){ $(this).find('td').empty(); });
        
        $.each(wateriq,function(i){
               var value = wateriq[i].user.value;
               var pos = 5 - i;
               if(value == 'A'){
                iqseries.eq(0).find('td:eq('+pos+')').text(value);
               } else if(value == 'B'){
                iqseries.eq(1).find('td:eq('+pos+')').text(value);
                } else if(value == 'C'){
                iqseries.eq(2).find('td:eq('+pos+')').text(value);
               } else if(value == 'D'){
                iqseries.eq(3).find('td:eq('+pos+')').text(value);
               } else if(value == 'E'){
                iqseries.eq(4).find('td:eq('+pos+')').text(value);
               } else if(value == 'F'){
                iqseries.eq(5).find('td:eq('+pos+')').text(value);
               }
               
               });

        iqseries.eq(6).find('td:eq(0)').text(moment.monthsShort(moment(searchtime).subtract(5,'month').month()));
        iqseries.eq(6).find('td:eq(1)').text(moment.monthsShort(moment(searchtime).subtract(4,'month').month()));
        iqseries.eq(6).find('td:eq(2)').text(moment.monthsShort(moment(searchtime).subtract(3,'month').month()));
        iqseries.eq(6).find('td:eq(3)').text(moment.monthsShort(moment(searchtime).subtract(2,'month').month()));
        iqseries.eq(6).find('td:eq(4)').text(moment.monthsShort(moment(searchtime).subtract(1,'month').month()));
        iqseries.eq(6).find('td:eq(5)').text(moment.monthsShort(moment(searchtime).month()));
    },
    getWaterIqPercent : function(value){
        
        var percent;
        
        if(value == 'A') {
            percent = 16;
        } else if(value == 'B') {
            percent = 32;
        } else if(value == 'C') {
            percent = 48;
        } else if(value == 'D') {
            percent = 64;
        } else if(value == 'E') {
            percent = 80;
        } else if(value == 'F') {
            percent = 95;
        }
        
        return percent;
        
    },
    setMeterReport : function(monthlyreport){
     
        var searchtime = this.param,
            usermeterlastmonth,
            dateformatthismonth = moment.months(moment(searchtime).month()) +' '+ moment(searchtime).year(),
            dateformatprevmonth = moment.months(moment(searchtime).subtract(1,'month').month()).substr(0, 3) + '.' + ' '+ moment(searchtime).subtract(1,'month').year(),
            searchmonth = moment(searchtime).month(),
            test = getObjects(monthlyreport, 'month', searchmonth + 1),
            test1 = getObjects(monthlyreport, 'month', searchmonth),
            usermeterthismonth = app.liters2Cubic(test[0].user);
        
        (test1.length > 0) ? usermeterlastmonth = app.liters2Cubic(test1[0].user) : usermeterlastmonth = 0;
        
        var meterarrowimg = app.computeArrow(usermeterthismonth,usermeterlastmonth),
            best = app.liters2Cubic(Math.min.apply(Math,monthlyreport.map(function(o){return o.user;}))),
            sum = 0,
            avg,
            metermonthlywateruse = $('.metermonthlywateruse'),
            meterlastmonthvalue = $('.meterlastmonthvalue'),
            meterbestevervalue = $('.meterbestevervalue'),
            meterthisyearaverage = $('.meterthisyearaverage'),
            gaugeimg = $('.gauge_img'),
            referencemonth = $('.referencemonth'),
            referencemonthprevious = $('.referencemonthprevious');
        
        if(monthlyreport.length >= 5 && monthlyreport.length <= 12){
        
            for( var iw = 0; iw < monthlyreport.length; iw++ ){
                sum += parseInt( monthlyreport[iw].user, 10 );
            }
            
            avg = app.liters2Cubic(sum/monthlyreport.length);
            
        }else{
        
            avg = parseFloat( meterthisyearaverage.find('span:eq(0)').text() ).toFixed(2);
        }
        
        gaugeimg.attr('src', this.getGaugeImg(usermeterthismonth,avg) );
        referencemonth.text(dateformatthismonth);
        referencemonthprevious.text(dateformatprevmonth);
        metermonthlywateruse.find('span:eq(0)').html(meterarrowimg);
        metermonthlywateruse.find('span:eq(1)').text(usermeterthismonth);
        meterlastmonthvalue.find('span:eq(0)').text(usermeterlastmonth);
        meterbestevervalue.find('span:eq(0)').text(best);
        meterthisyearaverage.find('span:eq(0)').empty().text(avg);
        
    },
    getGaugeImg : function(value,avg){
        
        var img;
        
        var wd = avg/2.5;
        
        if(value >=0 && value < wd) {
            img =  'img/SVG/gauge-0.svg';
        } else if(value >= wd && value < 2*wd) {
            img =  'img/SVG/gauge-25.svg';
        } else if(value > 2*wd && value <= 3*wd) {
            img =  'img/SVG/gauge-50.svg';
        } else if(value > 3*wd && value <= 4*wd) {
            img =  'img/SVG/gauge-75.svg';
        } else {
            img =  'img/SVG/gauge-100.svg';
        }
        
        return img;
        
    },
    setControlTime : function(){
        
        var time = this.param,
            year = moment(time).year(),
            dateformat = moment.months(moment(time).month()) +' '+ moment(time).year(),
            monthindiv = $('#social_month_timestamp'),
            chosenmonth = $('#social_month'),
            thisyear = $('.thisyear');
        
            thisyear.text(year);
            chosenmonth.text(dateformat);
            monthindiv.text(time); //keep in a separate span
        
    },
    setControlTimeLeftDays : function(){
        var lastsyncdate = JSON.parse(app.getlastComparisonSync()); //this holds the last sync data
        
        var current = this.param,
            day = moment().subtract(1,'month').date(),
            endofmonth = moment(moment(current).endOf('month').valueOf()).date(),
            startofthismonth = moment(lastsyncdate).startOf('month').valueOf(),
            endofthismonth = moment(lastsyncdate).endOf('month').valueOf(),
            diff = endofmonth - day,
            daysleftdiv = $('#daysleft');
        
        if(moment().date() == 1){
            diff = 1;
        }
        
        if(current >= startofthismonth && current <= endofthismonth) {
            daysleftdiv.prev('span').show();
            daysleftdiv.next('span').show();
            daysleftdiv.show();
            daysleftdiv.text(diff);
        } else if(current < startofthismonth) {
            daysleftdiv.prev('span').hide();
            daysleftdiv.next('span').hide();
            daysleftdiv.hide();
        }
        
    },
    setControlTimeArrows : function(){
        var time = this.param,
            socialforwardarrow = $('#social_goforward');

        var lastsyncdate = JSON.parse(app.getlastComparisonSync()); //this holds the last sync data
        
        if(moment(time).add(1,'month').valueOf() > moment(lastsyncdate).endOf('month').valueOf()) {
            socialforwardarrow.hide();
        }
        
    },
    setControlTimeNext : function(){
        
        var month_as_timestamp = this.param,
            chosenmonth = $('#social_month'),
            monthindiv = $('#social_month_timestamp'),
            socialbackarrow = $('#social_goback'),
            addmonth = moment(month_as_timestamp).valueOf(),
            month_as_num = moment(addmonth).month();
        
            monthindiv.text(addmonth);
            chosenmonth.text(moment.months(month_as_num) +' '+ moment( addmonth).year());
            socialbackarrow.show();
        
            this.setControlTimeLeftDays();
            this.setControlTimeArrows();
    
    },
    setControlTimeBack : function(monthlyreport){
        
        var month_as_timestamp = this.param,
            lastOfMonth = moment(month_as_timestamp).valueOf(),
            month_as_num = moment(lastOfMonth).month(),
            startofthismonth = moment().startOf('month').valueOf(),
            dateformat = moment.months(month_as_num) +' '+ moment(lastOfMonth).year(),
            daysleftdiv = $('#daysleft'),
            chosenmonth = $('#social_month'),
            monthindiv = $('#social_month_timestamp'),
            socialforwardarrow = $('#social_goforward'),
            socialbackarrow = $('#social_goback');
        
        if(lastOfMonth < startofthismonth) {
            daysleftdiv.prev('span').hide();
            daysleftdiv.next('span').hide();
            daysleftdiv.hide();
        }
        
        if(monthlyreport.length <= 2){ //dont let go back
            socialbackarrow.hide();
        }
        
        monthindiv.text(lastOfMonth);
        chosenmonth.text(dateformat);
        socialforwardarrow.show();
    
    },
    plothorizontalBarsWithLabels : function(selector,consumption){
        
        var charts = daiad.charts,
            home,best,worst,avg,
            label1 = app.appLabels.home,
            label2 = app.appLabels.average,
            label3 = app.appLabels.best,
            label4 = app.appLabels.max,
            month_as_timestamp = parseInt( $('#social_month_timestamp').text() , 10 );
        
        if(consumption.length > 0) {
            home = ( consumption[0].user / 1000 ).toFixed(2);
            best = ( Math.min.apply(Math,consumption.map(function(o){return o.user;})) / 1000 ).toFixed(2);
            worst = ( Math.max.apply(Math,consumption.map(function(o){return o.user;})) / 1000 ).toFixed(2);
            
            var sum = 0;
            
            for( var iw = 0; iw < consumption.length; iw++ ){
                sum += parseInt( consumption[iw].user, 10 );
            }
            
            var average = sum/consumption.length;
            
            avg = (average/1000).toFixed(2);
            
        } else {
            home = 0;
            best = 0;
            worst = 0;
            avg = 0;
        }
        
        
        var data = [
                    [label3, parseFloat(best)],
                    [label2, parseFloat(avg)],
                    [label1, parseFloat(home)],
                    [label4, parseFloat(worst)]
                    ];
        
        var config = {
            // Provide labels for data points
            points: new Map([
                             [label4, {
                              label: label4,
                              color: 'red',
                              labelColor: '#FFF'
                              }],
                             [label3, {
                              label: label3,
                              color: '#2D3580',
                              labelColor: '#FFF',
                              }],
                             [label2, {
                              label: label2,
                              color: '#7BD3AB',
                              labelColor: '#FFF',
                              }],
                             [label1, {
                              label: label1,
                              color: '#A4D5F5',
                              labelColor: '#FFF'
                              }]
                             ]),
            // Style labels
            labels: {
                paddingX: 4,
                marginX: 8,
                align: 'right'
            },
            precision: 2,
            // Set unit for displayed values
            unit: 'm³'
        };
        
        charts.comparison.plotBarsWithLabels(
                                             selector,
                                             data,
                                             config
                                             );
        
    },
    meterLastMonthChart : function(consumption){
        
        var dt = consumption,
            legend_options = this.getLegendOptions(),
            options = this.getFlotOptions(),
            selector = $('#placeholder_stats_1');
        
        var data = [
                    { data:[], label:legend_options.data1.text, color: legend_options.data1.color},
                    { data:[], label:legend_options.data2.text, color: legend_options.data2.color},
                    { data:[], label:legend_options.data3.text, color: legend_options.data3.color},
                    { data:[], label:legend_options.data4.text, color: legend_options.data4.color}
                    ];
        
        
        $.each(dt,function(){
               var day = this.day,
                timestamp = moment().subtract(1,'month').startOf('month').add(day,'day').valueOf();
               
               data[0].data.push([timestamp,app.liters2Cubic(this.user) ]);
               data[1].data.push([timestamp,app.liters2Cubic(this.similar)]);
               data[2].data.push([timestamp,app.liters2Cubic(this.nearest)]);
               data[3].data.push([timestamp,app.liters2Cubic(this.all)]);
               
               });
        
        $.plot(selector,data,options);
        
    },
    meterLastSixMonthChart : function(consumption){
        var legend_options = this.getLegendOptions(),
            options = this.getFlotOptionsMonth(),
            timestamp = parseInt( $('#social_month_timestamp').text(),10 );
        
        options.xaxis.min = moment(timestamp).subtract(5,'month').startOf('month').valueOf();
        options.xaxis.max = moment(timestamp).startOf('month').add(5,'days').valueOf();
        
        var data = [
                    { data:[], label:legend_options.data1.text, color: legend_options.data1.color},
                    { data:[], label:legend_options.data2.text, color: legend_options.data2.color},
                    { data:[], label:legend_options.data3.text, color: legend_options.data3.color},
                    { data:[], label:legend_options.data4.text, color: legend_options.data4.color}
                    ];
                
        $('#placeholder_stats_2').empty();
        
        if($('#stats_last_6 div.mem_legend').length === 0){
            $('.mem_legend').clone().prependTo('#stats_last_6');
        }
        
        $.each(consumption,function(){
               var totime = this.to,
               timestamp = tm.getUnixTimestamp(totime);
               
               data[0].data.push([moment(timestamp).startOf('month').add(1,'days').valueOf(),app.liters2Cubic(this.user) ]);
               data[1].data.push([moment(timestamp).startOf('month').add(1,'days').valueOf(),app.liters2Cubic(this.similar)]);
               data[2].data.push([moment(timestamp).startOf('month').add(1,'days').valueOf(),app.liters2Cubic(this.nearest)]);
               data[3].data.push([moment(timestamp).startOf('month').add(1,'days').valueOf(),app.liters2Cubic(this.all)]);
               });
        
        chart = $.plot($('#placeholder_stats_2'),data,options);
        
    },
    getFlotOptions : function(){
        return {
            legend:{position:"nw",noColumns: 4,container: $('.legend_container'),backgroundColor: null },
            grid :{
                borderWidth: {top: 0 , right:0 , bottom :0 ,left:0 },
                tickColor: "rgba(255, 255, 255, 0)",
            },
            xaxis: {
                mode: "time",
                ticks : 0,
                min: moment().subtract('month',1).startOf('month').valueOf(),
                max : moment().subtract('month',1).endOf('month').valueOf()
            
            },
            yaxis :{
                ticks : 0
            },
            lines:{show:true,lineWidth:2},
            points:{show:false},
            shadowSize: 0
        };
    },
    getFlotOptionsMonth : function(){
        
        return {
            legend:{
                position:"nw",
                noColumns: 4,
                container: $('.legend_container'),
                backgroundColor: null
            },
            grid :{
                borderWidth: {
                    top: 0,
                    right:0,
                    bottom :0,
                    left:0
                },
                tickColor: "rgba(255, 255, 255, 0)",
            },
            xaxis: {
                mode: "time",
                minTickSize: [1, "month"],
                min : moment().subtract('month',6).valueOf(),
                max : moment().valueOf(),
                font:{
                    size:14,
                    color: '#424242',
                    //style:"italic",
                    //weight:"bold",
                    family:"opensans-light",
                    //variant:"small-caps"
                }
            },
            yaxis :{
                ticks : 0
            },
            bars : {show:false},
            lines:{show:true,lineWidth:2},
            points:{show:false},
            shadowSize: 0
        };
    },
    getLegendOptions : function(){
       
        return {
            
            data1 :{
                text: $('.mem_legend div:eq(0) p:eq(0)').text(),
                color:$('.mem_legend div:eq(0) p:eq(1)').css('background-color')
            },
            data2 : {
                text : $('.mem_legend div:eq(1) p:eq(0)').text(),
                color:$('.mem_legend div:eq(1) p:eq(1)').css('background-color')
            },
            data3 :{
                text : $('.mem_legend div:eq(2) p:eq(0)').text(),
                color:$('.mem_legend div:eq(2) p:eq(1)').css('background-color')
            },
            data4 :{
                text : $('.mem_legend div:eq(3) p:eq(0)').text(),
                color:$('.mem_legend div:eq(3) p:eq(1)').css('background-color')
            }
    
        };
    }

};
