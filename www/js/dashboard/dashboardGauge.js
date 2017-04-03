var dashboardGauge = function(param) {
    this.param = param;
    
};

dashboardGauge.prototype = {
    
    getElements : function(){
    
        return {
            
            div1 : $('#dashEvent'),
            div2 : $('#dashboardMainTextValue'),
            div3 : $('#dashboardMainTextLabel'),
            div4 : $('#dashboardMidTextValue'),
            div5 : $('#dashboardMidTextLabel'),
            div6 : $('#dashboardLowTextValue'),
            div7 : $('#dashboardLowTextLabel')
        
        };
    
    },
    setBudget : function(){
                
        new budgetWidget(
                         $('#budgetCircle'),
                         'myStat20',
                         {
                         'dimension': screen.width*0.94,
                         'percent' : app.getBudgetPercent(this.param.high.value, this.param.high.label),
                         'text' : '',
                         'width' : 1,
                         'info' : '',
                         'fontsize' : 1,
                         'bordersize' : 1,
                         'fgcolor' : '#2D3580',
                         'bgcolor' : '#EDF7FD'
                         }
                         );        
    },
    render : function(){
        var elmt = this.getElements();
        elmt.div1.text(this.param.text);
        elmt.div2.text(this.param.high.value);
        elmt.div3.text(this.param.high.label);
        elmt.div4.text(this.param.mid.value);
        elmt.div5.text(this.param.mid.label);
        elmt.div6.text(this.param.low.value);
        elmt.div7.text(this.param.low.label);
        
    },
    refreshComplications : function(dt){
        
        var metrics = dt.active, //var metrics = [{ 'title ' : 'turi' , id : 9},{ 'title ' : 'pitsa' , id : 10},{ 'title ' : 'spanakis' , id : 11}];
            selector = dt.selector,
            data = dt.data;
        
        for( var i = 0; i<=metrics.length; i++) {
            
            var id = parseInt(metrics[i].id,10),
                value,
                link,
                tl = $('.valChecks[id="'+id+'"]').closest('label').find('.item-title').text(), //Duration
                typeOfConsumption = $('.valChecks[id="'+id+'"]').closest('li').prev('li').find('.item-title').text(), //last 10 showers
                title = tl +'<br>'+ typeOfConsumption.match(/\((.*?)\)/g); // concat title and type
            
            metrics[i].title = tl;
            
            if(id === 1) { //water flow
                
                link='consumption';
                
                value = (data.flow.value).toFixed() + '' + data.flow.label;
                
            } else if(id === 2) { //temperature
                
                if(!data.temp.value) data.temp.value = 0;
                
                value = (data.temp.value).toFixed() + '' + data.temp.label;
                
                link = 'consumption';
                
            } else if(id === 3) { //money spent
                
                var newvolume,volumecost;
                
                link='consumption';
                
                (data.volume.label == 'lt') ? value = data.volume.value / 1000 : value = data.volume.value;
                //volumecost = app.getPriceValue(newvolume);
                //volumecost = newvolume * 0.02;
                //value = newvolume;
                
            } else if(id === 4) { //efficiency
                
                link = 'consumption';
                
                value = '<img src="img/SVG/energy-'+app.ComputeEfficiencyRatingFromEnergy(data.energy.value)+'.svg" style="width:40%;height:auto;">';
                
            } else if(id === 5) { //daily budget
                
                this.setDashboardComplication(
                                              selector.eq(i),
                                              this.getComplicationTemplate(tl , '' , '')
                                              );
                new budgetWidget(
                                 selector.eq(i).find('.complicationValue'),
                                 'mydaily',
                                 {
                                 'dimension': screen.width*0.16,
                                 'percent' : ( data.volume.value / app.user.settings.amphiro_budget ) * 100,
                                 'text' : (( data.volume.value / app.user.settings.amphiro_budget ) * 100).toFixed() + '%',
                                 'width' : 1,
                                 'bordersize' : 1,
                                 'info' : '',
                                 'fontsize' : '4',
                                 'fgcolor' : '#2D3580',
                                 'bgcolor' : '#eee',
                                 'marginleft' : 13
                                 }
                                 );
                
                continue;
                
            } else if(id === 6) {  //timer
                
                link = 'CountTimer';
                
                value = '<img src="img/SVG/duration.svg" style="width:40%;height:auto;">';
                
            } else if(id === 7) { //ranking
                
                link = 'comparisons';
                
                value = '#3';
                
            }  else if(id === 8) { //duration
                
                link = 'consumption';
                
                value = tm.secondsToMinutes(data.duration.value) + 'min';
                
            } else if(id === 9) { //water efficiency
                
                var newvol,link='';
                
                (data.volume.label != 'lt') ? newvol = data.volume.value : newvol = data.volume.value/1000;
                
                value = '<img src="img/SVG/energy-'+app.ComputeEfficiencyRatingFromWater(newvol)+'.svg" style="width:60%;height:auto;">';
                
                title = tl;
                
            } else if(id === 10) {  //meter budget
                
                (app.user.profile.dailyMeterBudget) ? newBudget = app.user.profile.dailyMeterBudget : newBudget = 1000;
                
                this.setDashboardComplication(
                                              selector.eq(i),
                                              this.getComplicationTemplate(tl , '' , '')
                                              );
                
                new budgetWidget(
                                 $('.dashboard-vals').eq(i).find('.complicationValue'),
                                 'mydaily',
                                 {
                                 'dimension': screen.width*0.16,
                                 'percent' : ( parseInt(data.volume.value,10) / newBudget) * 100,
                                 'text' : (( parseInt(data.volume.value,10) / newBudget) * 100).toFixed() + '%',
                                 'width' : 1,
                                 'info' : '',
                                 'bordersize' : 1,
                                 'fontsize' : '4',
                                 'fgcolor' : '#2D3580',
                                 'bgcolor' : '#eee',
                                 'marginleft' : 12
                                 }
                                 );
                
                continue;
                
            } else if(id === 11) {   //water caluclator
                
                link = 'WaterCalculator';
                
                value = '<img src="img/SVG/water-calculator-side-on.svg" style="width:130%;">';
                
                title = tl;
                
            }
            
            this.setDashboardComplication(
                                          selector.eq(i),
                                          this.getComplicationTemplate(
                                                                       title,
                                                                       value,
                                                                       link
                                                                       )
                                          );
            
        }
        
    },
    setDashboardComplication : function(selector,complicationHtml){
        selector.empty().html( complicationHtml );
    },
    getComplicationTemplate : function(title,value,ref){
        
        return '<a href="#'+ref+'" ><p class="complicationTitle">'+title+'</p><span class="complicationValue">'+value+'</span></a>';
        
    }
    
};
 



