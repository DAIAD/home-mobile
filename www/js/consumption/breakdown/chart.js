var breakdownchart = function(param) {
    this.param = param;
};

breakdownchart.prototype = {
    show : function(){
        var config,
            data = this.compute(this.param),
            labels = applicationLabels.comparison(app.getUserCountry()),
            charts = daiad.charts,
            data2 = [
                 ['D', data.me.other],
                 ['A', data.me.shower],
                 ['C', data.me.toilet],
                 ['B', data.me.washing]
                 ],
            data1 = [
                 ['D', data.similar.other],
                 ['A', data.similar.shower],
                 ['B', data.similar.toilet],
                 ['C', data.similar.washing]
                 ],
            placeholder = $('#placeholder2');
        
        config = {
            // Define the expected range of values (or set to null to be computed)
            range: [20, 100],
            // Provide metadata for supplied data series (required!)
            meta: [
                   // data #1
                   {
                   label: labels.legend.similar,
                   color: '#FFF',
                   labelColor: '#ADAEB6',
                   },
                   // data #2
                   {
                   label: labels.legend.yours,
                   color: '#FFF',
                   labelColor: '#2D3580',
                   },
                   ],
            // Provide metadata for datapoints (domain).
            // Omit it (or set to null), if you want the X-axis to be blank.
            points: new Map([
                             ['A', {label: labels.shower}],
                             ['B', {label: labels.machine}],
                             ['C', {label: labels.toilet}],
                             ['D', {label: labels.other}]
                         ]),
            // Style legend
            legend: 'default', // choose between: 'default', 'centre'
            // Style bars
            bars: {
                widthRatio: 0.30, // < 0.50
            },
        };
        
        $('#placeholder2').empty();
        
        charts.comparison.plotBarsAsPairs(
                                          $('#placeholder2'),
                                          data1,
                                          data2,
                                          config
                                          );
    },
    compute : function(myvalues){
                
        if(!myvalues || !myvalues.shower){
            myvalues = {
                shower: ( 6000 * 0.20 / 6000 ) * 100,
                washing:( 6000 * 0.30 / 6000 ) * 100,
                toilet:( 6000 * 0.15 / 6000 ) * 100,
                other:( 6000 * 0.35 / 6000 ) * 100,
                total_month : 6000,
                total_week : 6000 / (52/12),
                total_year : 6000 * 12
            };
        }
        
        return {
            me: myvalues,
            similar : {
                shower: ( 7000 * 0.20 / 7000 ) * 100,
                washing:( 7000 * 0.30 / 7000 ) * 100,
                toilet:( 7000 * 0.15 / 7000 ) * 100,
                other:( 7000 * 0.35 / 7000 ) * 100,
                total_month : 7000,
                total_week : 7000 / (52/12),
                total_year : 7000 * 12
            }
        };
    },
 

};


