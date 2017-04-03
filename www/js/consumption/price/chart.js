var pricebracket = function(param) {
    this.param = param;
};
 
pricebracket.prototype = {
    setPriceBracket : function(){
        
        var charts = daiad.charts,
            Measurement = daiad.model.Measurement,
            brackets = this.getPriceBrackets(),
            values_length = parseInt(moment().endOf('month').date() + 1,10),
            bracket1 = $.map(new Array(values_length), function(_, i) {
                         return  new Measurement(i, new Date(moment().startOf('month').add('day',i).valueOf()), null);
                         }),
            bracket2 = $.map(new Array(values_length), function(_, i) {
                         return  new Measurement(i, new Date(moment().startOf('month').add('day',i).valueOf()), null);
                         }),
            bracket3 = $.map(new Array(values_length), function(_, i) {
                         return  new Measurement(i, new Date(moment().startOf('month').add('day',i).valueOf()), null);
                         }),
        
            dt = $.map(new Array(values_length), function(_, i) {
                   return  new Measurement(i, new Date(moment().startOf('month').add('day',i).valueOf()), null);
                   });
        
        bracket1[0].value = brackets.bra_1.volume;
        bracket1[bracket1.length - 1].value = brackets.bra_1.volume;
        
        bracket2[0].value = brackets.bra_2.volume;
        bracket2[bracket2.length - 1].value = brackets.bra_2.volume;
        
        bracket3[0].value = brackets.bra_3.volume;
        bracket3[bracket3.length - 1].value = brackets.bra_3.volume;
        
        $.each(this.param.results,function(){
               var volume =  this.volume.value/ 1000 ,
               time = this.timestamp,
               datee = moment(time).date();
               if(dt[datee].value == null){
               dt[datee].value = dt[datee - 1].value + volume;
               } else {
               dt[datee].value = dt[datee].value + volume;
               }
               });

        this.setPriceLegend(brackets);

        this.setPriceEvent(dt);

        charts.meter.plotForMonth(
                                  $('#placeholder2'),
                                  [
                                   {// price
                                   data: bracket1,
                                   fill: null,
                                   color: brackets.bra_1.color,
                                   line: 'dashed'
                                   },
                                   {// price
                                   data: bracket2,
                                   fill: null,
                                   color: brackets.bra_2.color,
                                   line: 'dashed'
                                   },
                                   {// price
                                   data: bracket3,
                                   fill: null,
                                   color: brackets.bra_3.color,
                                   line: 'dashed'
                                   },
                                   {// actual
                                   data: dt,
                                   fill: null,
                                   color: '#2D3580',
                                   }
                                   ]
                                  );
    },
    getPriceBrackets : function(){
        
        return {
            
            bra_1 : {
                price : 0.02,
                volume : 9,
                color:'#42f465'
            },
            bra_2 : {
                price : 0.55,
                volume : 30,
                color:'#CD4D3E'
            },
            bra_3 : {
                price : 1.85,
                volume : 60,
                color:'red'
            },
            bra_4 : {
                price : 2.49
            }
            
        };
        
    },
    setPriceLegend : function(brackets){
        
        var volume_label = 'm³',
        legend = $('.legend_lines_price');
        
        legend.find('div:eq(0) p:eq(0) span:eq(1)').text(brackets.bra_1.volume + '' + volume_label);
        legend.find('div:eq(0) p:eq(0) span:eq(2)').text(brackets.bra_1.price + '' + app.appLabels.currency.short + '/' + volume_label);
        
        legend.find('div:eq(1) p:eq(0) span:eq(1)').text(brackets.bra_2.volume + '' + volume_label);
        legend.find('div:eq(1) p:eq(0) span:eq(2)').text(brackets.bra_2.price + '' + app.appLabels.currency.short + '/' + volume_label);
        
        legend.find('div:eq(2) p:eq(0) span:eq(1)').text(brackets.bra_3.volume + '' + volume_label);
        legend.find('div:eq(2) p:eq(0) span:eq(2)').text(brackets.bra_3.price + '' + app.appLabels.currency.short + '/' + volume_label);
        
        legend.find('div:eq(0) p:eq(1)').css({'background-color':brackets.bra_1.color});
        legend.find('div:eq(1) p:eq(1)').css({'background-color':brackets.bra_2.color});
        legend.find('div:eq(2) p:eq(1)').css({'background-color':brackets.bra_3.color});
        
        return;
        
    },
    setPriceEvent : function(data){
        var sorted = app.sortDescending(data),
            calculated = this.getPriceValue(sorted[0].value),
            selector = $('#meter_events');
        
        $.each(calculated,function(key,value){
               
               if(!calculated[key].value) return true;
               
               var str = app.appLabels.price + ' ' + calculated[key].limit + 'm3';
               
               var pr = calculated[key].value.toFixed(2) +''+app.appLabels.currency.short;
               
               var final_value = sorted[0].value.toFixed(2);
               
               selector.append(
                               app.meterListTemplate(
                                                     str,
                                                     pr,
                                                     final_value ,
                                                     'm3'
                                                     )
                               );
               
               
               });
        
        return;
        
    },
    getPriceValue : function(volume){
        
        var brackets = this.getPriceBrackets(),
        total = {};
        //volume in cubic meter
        if(volume > 0 && volume <= 9) {
            total.pr1 = {};
            total.pr1.value = volume * brackets.bra_1.price;
            total.pr1.limit = 9;
            total.sum = volume * brackets.bra_1.price;
        } else if( volume > 9 && volume <=30) {
            total.pr1 = {};
            total.pr2 = {};
            total.pr1.value = 9 * brackets.bra_1.price;
            total.pr1.limit = 9;
            total.pr2.value = (volume - 9) * brackets.bra_2.price;
            total.pr2.limit = 30;
            total.sum = total.pr1.value + total.pr2.value;
        } else if( volume > 30 && volume <= 60) {
            total.pr1 = {};
            total.pr2 = {};
            total.pr3 = {};
            total.pr1.value = 9 * brackets.bra_1.price;
            total.pr1.limit = 9;
            total.pr2.value = 21 * brackets.bra_2.price;
            total.pr2.limit = 30;
            total.pr3.value = (volume - 30) * brackets.bra_3.price;
            total.pr3.limit = 60;
            total.sum = total.pr1.value + total.pr2.value + total.pr3.value;
        } else if( volume > 60){
            total.pr1 = {};
            total.pr2 = {};
            total.pr3 = {};
            total.pr4 = {};
            total.pr1.value = 9 * brackets.bra_1.price;
            total.pr1.limit = 9;
            total.pr2.value = 21 * brackets.bra_2.price;
            total.pr2.limit = 30;
            total.pr3.value = 30 * brackets.bra_3.price;
            total.pr3.limit = 60;
            total.pr4.value = (volume - 60) * brackets.bra_4.price;
            total.pr4.limit = '> 60';
            total.sum = total.pr1.value + total.pr2.value + total.pr3.value + total.pr4.value;
        }
        
        return total;
        
    }

};

