var meterStats = function(param) {
    this.param = param;
};

meterStats.prototype = {
    process : function(results){
        
        var data = [];
        
        for (var i=0; i<results.rows.length; i++) {
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
    
    setMeterTotalValue : function(){
        
        var ltlabel = $('#span_liters_meter'),
            totaldiv = $('#totalVolume'),
            calendari = $('.calendar');
        
        var prs = this.process(this.param.actual);

        var total = app.getVolumeValueLabel( prs.sum('volume') );
                
        calendari.find('.type:visible').hide();
        
        ltlabel.text(total.label).show();
        
        totaldiv.text((total.value).toFixed(2).replace(".",","));
        
    },
    legendLinesStatus : function(){
        
        var forecasting_length = this.param.forecasted.rows.length;
        
        var granu = app.getGranularityFromGraph();
        
        var legendLines = $('.legend_lines');
        
        ( granu === 2 || granu === 3) ? legendLines.show() : legendLines.hide();
        
        if( ( granu === 2 || granu ===3 ) && forecasting_length === 0 ) //month
            legendLines.hide();
        
    },
    setMeterDataToGraph : function(selector,startDate){

        var act = this.process(this.param.actual);
        
        var frc = this.process(this.param.forecasted);
        
        var granu = app.getGranularityFromGraph();
        
        var charts = daiad.charts;
        
        var actual = this.getPlotMeterDataArray(
                                               act,
                                               this.getPlotArrayBasedOnGranularity(granu,startDate),
                                               granu
                                                );
        
        var forecast = this.getPlotMeterDataArray(
                                                  frc,
                                                  this.getPlotArrayBasedOnGranularity(granu,startDate),
                                                  granu
                                                  );
        
        app.checkNoDataDiv(selector,act.length,frc.length);
        
        app.emptySelector(selector);
        
        app.emptyMeterListEvents();
        
        app.emptyAmphiroListEvents();
        
        if(granu === 0) { //day
            
            charts.meter.plotForDay(
                                    selector,
                                    [
                                     {
                                     data: actual,
                                     fill: null
                                     }
                                     ]
                                    );
            
        } else if(granu == 1) { //week
            
            charts.meter.plotForWeek(
                                     selector,
                                     [
                                      {
                                      data: actual,
                                      fill: null
                                      }
                                      ]
                                     );
            
        } else if(granu == 2) { //month
            
            charts.meter.plotForMonth(
                                      selector,
                                      [
                                       {
                                       data: actual,
                                       fill: null
                                       },
                                       {
                                       data: forecast,
                                       fill: null,
                                       color: '#aaa',
                                       line: 'dashed'
                                       }
                                       ]
                                      );
            
        } else if(granu == 3) { //year
            
            charts.meter.plotForYear(
                                     selector,
                                     [
                                      {
                                      data: actual,
                                      fill: null
                                      },
                                      {
                                      data: forecast,
                                      fill: null,
                                      color: '#aaa',
                                      line: 'dashed'
                                      }
                                      ]
                                     );
            
        }
        
        this.getMeterReachEvents(actual,app.getGranularityFromGraph());
    },
    getPlotMeterDataArray : function(arr,arr2,granularity){
        
        $.each(arr,function(){
               var volume = this.volume.value,
               time = this.timestamp,
               day = moment(time).isoWeekday(),
               datee = moment(time).date(),
               month = moment(time).month(),
               hoursto = new Date(time).getHours()+1,
               hoursfrom = hoursto-1;
               
               if(granularity == 2) { //per week
               if(arr2[datee].value === null) {
               arr2[datee].value = volume;
               } else {
               arr2[datee].value = arr2[datee].value + volume;
               }
               } else if(granularity == 3) { //month
               if(!arr2[month].value) {
               arr2[month].value = volume;
               } else {
               arr2[month].value = arr2[month].value + volume;
               }
               
               } else if(granularity == 1) { //day
               if(!arr2[day -1 ].value) {
               arr2[day-1].value = volume;
               } else {
               arr2[day-1].value = arr2[day-1].value + volume;
               }
               
               } else { //hour
               if(!arr2[hoursfrom].value) {
               arr2[hoursfrom].value = volume;
               } else {
               arr2[hoursfrom].value = arr2[hoursfrom].value + volume;
               }
               }
               });
        
        return arr2;
        
    },
    getPlotArrayBasedOnGranularity : function(granularity,startDate){
        var Measurement = daiad.model.Measurement;
        var data_array;
        
        if(granularity === 0) {
            data_array = $.map(new Array(24), function(_, i) {
                               return  new Measurement(i, new Date(moment(startDate).startOf('day').add('hour',i).valueOf()), null);
                               });
        } else if(granularity == 1) {
            data_array= $.map(new Array(7), function(_, i) {
                              return  new Measurement(i, new Date(moment(startDate).startOf('day').add('day',i).valueOf()), null);
                              });
            
        } else if(granularity == 2) {
            data_array = $.map(new Array(parseInt(moment(startDate).endOf('month').date() + 1,10)), function(_, i) {
                               return  new Measurement(i, new Date(moment(startDate).startOf('month').add('day',i).valueOf()), null);
                               });
        } else if(granularity == 3) {
            data_array = $.map(new Array(12), function(_, i) {
                               return  new Measurement(i, new Date(moment(startDate).startOf('year').add('month',i).valueOf()), null);
                               });
        }
        
        return data_array;
        
    },
    getMeterPlotLevels : function(){
        
        return [
                {
                range: [0, 200],
                color: '#6976EB',
                description: 'Low',
                },
                {
                range: [201, 500],
                color: '#3843A5',
                description: 'Mid',
                },
                {
                range: [501, 1000],
                color: '#2D3580',
                description: 'High',
                },
                {
                range: [1001, 5000],
                color: '#2F3565',
                description: 'Very High',
                },
                ];
    },
    getMeterReachEvents : function(meter_data,granu){
        
        minReached = function(min){
            if(min.value){
                var label3,
                check = moment(min.timestamp),
                dayname = moment.weekdays(check.day()),
                month = moment(min.timestamp).month(),
                dayOfMonth  = check.format('D'),
                weekNum = check.week(),
                firstweekofmonth = moment(min.timestamp).startOf('month').week(),
                weekdiff = weekNum - firstweekofmonth,
                year = check.year(),
                timetemplate;
                
                if(weekdiff < 0 ) weekdiff = 0;
                
                if(granu === 0){ timetemplate = moment(min.timestamp).startOf('hour').format("HH:mm a") +  '-' + check.endOf('hour').format("HH:mm a");label3 = app.appLabels.min_hour ; }
                if(granu == 1){ timetemplate = dayname +' '+dayOfMonth+'/'+ (month+1); label3 = app.appLabels.min_day; }
                if(granu == 2){ timetemplate =  app.appLabels.week  +' '+ (weekdiff+1);label3 = app.appLabels.min_week; }
                if(granu == 3){ timetemplate =  moment.months(month) +' '+ year; label3 = app.appLabels.min_month; }
                
                var value = (min.value).toFixed();
                
                var tmp = app.meterListTemplate(label3,timetemplate,value,app.appLabels.volume.short );
                
                selector.append(tmp) ;
            }
        };
        
        maxReached = function(max){
            if(max.value){
                var label2,
                check = moment(max.timestamp),
                dayname = moment.weekdays(check.day()),
                month = moment(max.timestamp).month(),
                dayOfMonth  = check.format('D'),
                weekNum = check.week(),
                firstweekofmonth = moment(max.timestamp).startOf('month').week(),
                weekdiff = weekNum - firstweekofmonth,
                year = check.year(),
                timetemplate;
                if(weekdiff < 0 ) weekdiff = 0;
                if(granu === 0){ timetemplate = moment(max.timestamp).startOf('hour').format("HH:mm a") +  '-' + check.endOf('hour').format("HH:mm a"); label2 = app.appLabels.max_hour ; }
                if(granu == 1){ timetemplate = dayname +' '+dayOfMonth+'/'+ (month+1); label2 = app.appLabels.max_day; }
                if(granu == 2){ timetemplate =  app.appLabels.week +' '+ (weekdiff+1); label2 = app.appLabels.max_week; }
                if(granu == 3){ timetemplate =  moment.months(month) +' '+ year; label2 = app.appLabels.max_month; }
                
                var value = (max.value).toFixed();
                
                var tmp = app.meterListTemplate(label2, timetemplate,value,app.appLabels.volume.short );
                selector.append(tmp) ;
            }
        };
        
        budgetReached = function(data){
            var keepval = 0,
            minval = 10000,
            max = {},
            min = {},
            totalSum = 0;
            
            $.each(data,function(){
                   var date = this.timestamp,
                   value = this.value,
                   check = moment(date),
                   month = check.format('M'),
                   dayOfMonth  = check.format('D'),
                   dayOfWeek = check.day(),
                   dayName = moment.weekdaysShort(dayOfWeek),
                   hoursto = check.endOf('hour').format("HH:mm a"),
                   hoursfrom = check.startOf('hour').format("HH:mm a");
                   
                   if( value !== null ){
                   if( value > keepval){
                   keepval = value;
                   max.timestamp = date ;
                   max.value = value ;
                   }
                   if( value < minval){
                   minval = value;
                   min.timestamp = date ;
                   min.value = value ;
                   }
                   
                   totalSum = totalSum + value;
                   if(granu === 0 || granu == 1) {
                   if(value > app.user.settings.meter_budget) {
                   
                   var timetemplate = dayName+','+ dayOfMonth +'/' + month + ' ' + hoursfrom +  '-' + hoursto;
                   
                   var tmp = app.meterListTemplate(app.appLabels.budget_reached,timetemplate,value,app.appLabels.volume.short );
                   
                   selector.append(tmp) ;
                   }
                   }
                   }
                   
                   });
            
            app.emptyMeterListEvents();
            app.emptyAmphiroListEvents();
            minReached(min);
            maxReached(max);
        };
        
        var selector = $('#meter_events');
        
        budgetReached(meter_data);
    }

};
