// Dynamically create real time graph.
$(document).one('realtime',function(){ new successReal(); });

var successReal = function() {
    
    var mapPage    =  $('<div>').attr({'id':'real','data-role':'page'}).appendTo('body');
    var mapHeader  = $('<div>').attr({'data-role':'header','id':'map-header'}).appendTo(mapPage);
    $('<h3>').html('Real Time Graph').appendTo(mapHeader);
    $('<a>').attr({'href':'#home','id':'conback','class' : 'ui-btn-left','style':'width:20%'}).html('Back').appendTo(mapHeader);
    var mapContent = $('<div>').attr({'data-role':'content'}).appendTo(mapPage);
    var inside = $('<div>').attr({'class':'demo-container'}).appendTo(mapContent);
    $('<div>').attr({'id':'choices4'}).appendTo(inside);
    $('<div>').attr({'id':'placeholder4', 'class':'demo-placeholder'}).appendTo(inside);
    var choiceContainer = $("#choices4");
    choiceContainer.append("<div data-role='navbar'><ul><li><input type='checkbox' name='litres' checked='checked' id='litres1' disabled></input><label for='litres1'>Water(L)</label></li><li><input type='checkbox' name='temp' checked='checked' id='temp1' ></input><label for='temp1'>Temperature(C)</label></li><li><input type='checkbox' name='energy' checked='checked' id='energy1' ></input><label for='energy1'>Energy(wH)</label></li></ul></div>");
    $.mobile.changePage( "#real", { transition: "slide"});
    $('#real').on('pageshow',function(){
                  
                function plotAccordingToChoices1() {
                  
                  var data1 = [];
                  
                  choiceContainer.find("input:checked").each(function () {
                                                             var key = $(this).attr("name");
                                                             if (key && json[key]) {
                                                             data1.push(json[key]);
                                                             }
                                                             });
                  
                  $.plot("#placeholder4", data1, {yaxis: {min: 0},xaxis: {mode: "time"}});
                  
                }
                  
                  internReal = setInterval(plotAccordingToChoices1,1000);
                  
                  }); // pageshow end
} //end


//Real Time via Menu
$('#realfeel').one('click',function(){ successR(); });

var successR = function() {
    $('#spinner1').show();
    function plotAccordingToChoices() {
        
        var data = [];
        var i = 0;
                
        $('#choices1').find("input:checked").each(function () {
                                                  var key = $(this).attr("name");
                                                  if (key && vlm[key]) {
                                                  data.push(vlm[key]);
                                                  
                                                  }
                                                  });
        
        $('#spinner1').hide();
        $.plot("#placeholder1", data, {
               yaxis: {min: 0},
               xaxis: {mode: "time"}
               });
        
    }
   
    intern = setInterval(plotAccordingToChoices,500);
    
} //end

$('#history').on('click',function(){ successH();});

var successH = function(){

    $('#spinner2').show();
    var historyData = {
        "litres" : {label: "Litres",data: []}
    };
    
    var dataset = [{
                   label: "Consumption",
                   data: [],
                   yaxis: 1,
                   color: "#1e90ff",
                   bars: {show: true}
                   }
                   ];
    
    var options = {
    series: {
    yaxis: {min: 0},
    xaxis: {tickDecimals: 0},
    },
    bars: {
    align: "center",
    barWidth: 1
    }

    
    };
    
    //setInterval(fetchHistoryData,20000);
    
    fetchHistoryData(function(jsn){
              plot1 = $.plot("#placeholderh",dataset,options);
              dataset[0].data = jsn.litres.data;
              plot1.setData(dataset);
              plot1.setupGrid();
              plot1.draw();
              $('#spinner2').hide();
              
              });
    
    function fetchHistoryData(callback){
        historyData.litres.data.length = 0;
        sm.db.transaction(function(tx) {
                          
                          tx.executeSql('SELECT distinct indexs,volume FROM feel WHERE his = 1 order by indexs',[], function(tx, results) {
                                        var len = results.rows.length;
                                        
                                        for (var i=0; i<len; i++){
                                            historyData.litres.data.push([results.rows.item(i).indexs,results.rows.item(i).volume]);
                                        }
                                        callback(historyData);
                                        
                                        }); //execute end
                          }); //transaction end
    }

}


//Analysis  - Dates - Consumption
$('#whole').on('click',function(){ successW();});

var successW = function(){
    
    $('#spinner').show();
    $( "#tabs-2 li a" ).removeClass( "ui-btn-active" );
    $( "#year" ).addClass( "ui-btn-active" );
    var BudgetValue = window.localStorage.getItem('budget');
    $('#budget').val(BudgetValue);

    var json1 = {
        "litres" : {label: "Litres",data: []}
    };
    
    var dataset = [{
                   label: "Consumption(Litres)",
                   data: [],
                   yaxis: 1,
                   color: "#1e90ff",
                   bars: {
                   show: true,
                   align: "center",
                   barWidth: 12*24*60*60,
                   fill: true
                   }
                   }];
    
    var options = {
                   xaxis: {
                    mode: "time",
                    minTickSize: [1, "month"],
                    min: (new Date(2015, 0, 1)).getTime(),
                    max: (new Date(2016, 0, 1)).getTime(),
                    twelveHourClock: false
                    },
                yaxis: { min: 0,ticks: 10 },
                grid: {
                    markings: [ { lineWidth: 4, yaxis: { from: BudgetValue, to: BudgetValue }, color: "#FF0000" }]
                    }
        
        };
    
      $('#submitAnalysis').click(function(){
                        
                        var d1 = $('#mode1a').val();
                        var d2 = $('#mode2a').val();
                                 if (d1 == 0 || d2 == 0){
                                 alert('Please fill Dates From/To!');
                                 
                                 }
                                 else{
                        start = d1.split("-");
                        stop = d2.split("-");
                        var months = new Date(start[0],start[1]-1,start[2]).getTime();
                        var monthf = new Date(stop[0],stop[1]-1,stop[2]).getTime();
                        plot.getOptions().xaxes[0].min = months;
                        plot.getOptions().xaxes[0].max = monthf;
                        if ( stop[2]-start[2] <= 3 ){
                                 plot.getOptions().xaxes[0].minTickSize = [2,"hour"];
                                 plot.getOptions().xaxes[0].twelveHourClock = false;
                                 plot.setupGrid();
                                 plot.draw();
                                 }
                        else if (( stop[2]-start[2] == 0 )){
                                 plot.getOptions().xaxes[0].minTickSize = [2,"hour"];
                                 plot.getOptions().xaxes[0].twelveHourClock = false;
                                 plot.setupGrid();
                                 plot.draw();
                                 }
                        else{
                                 plot.getOptions().xaxes[0].minTickSize = [1,"day"];
                                 plot.getOptions().xaxes[0].twelveHourClock = true;
                                 plot.setupGrid();
                                 plot.draw();
                                 }
                            }
                        });
    
      $('#today').click(function(){
                        
                        var start = new Date();
                        var end = new Date();
                        plot.getOptions().xaxes[0].min = start.setHours(0,0,0,0);
                        plot.getOptions().xaxes[0].max = end.setHours(23,59,59,999);
                        plot.getOptions().xaxes[0].minTickSize = [2,"hour"];
                        plot.getOptions().xaxes[0].twelveHourClock = false;
                        plot.setupGrid();
                        plot.draw();
                        
                        });
    
      $('#week').click(function(){
                       
                       var curr = new Date();
                       var first = curr.getDate() - curr.getDay();
                       var last = first + 6;
                       var firstday = new Date(curr.setDate(first));
                       var lastday = new Date(curr.setDate(last));
                       plot.getOptions().xaxes[0].min = firstday;
                       plot.getOptions().xaxes[0].max = lastday;
                       plot.getOptions().xaxes[0].minTickSize = [1,"hour"];
                       plot.setupGrid();
                       plot.draw();
                       
                       });
      
      $('#month').click(function(){
                        
                        var d = new Date();
                        var year  = d.getFullYear();
                        var month = d.getMonth();
                        var firstOfMonth = new Date(year, month, 1);
                        var lastOfMonth = new Date(year, month+1, 0);
                        plot.getOptions().xaxes[0].min = firstOfMonth;
                        plot.getOptions().xaxes[0].max = lastOfMonth;
                        plot.getOptions().xaxes[0].minTickSize = [3,"day" ];
                        plot.getOptions().xaxes[0].mode = "time";
                        plot.setupGrid();
                        plot.draw();
                        
                        });
      
      $('#year').click(function(){
                       
                       var d = new Date();
                       var year  = d.getFullYear();
                       var firstOfYear = new Date(year, 0, 1);
                       var lastOfYear = new Date(year, 11, 31);
                       
                       plot.getOptions().xaxes[0].min = firstOfYear;
                       plot.getOptions().xaxes[0].max = lastOfYear;
                       plot.getOptions().xaxes[0].minTickSize = [1, "month"];
                       plot.getOptions().xaxes[0].twelveHourClock = false;
                       plot.setupGrid();
                       plot.draw();
                       
                       });
      
      $('#budget').on('change', function () {
                      var bla = $('#budget').val();
                      window.localStorage.setItem('budget',bla);
                      plot.getOptions().grid.markings = [ { lineWidth: 4, yaxis: { from: bla, to: bla }, color: "#FF0000" }];
                      plot.setupGrid();
                      plot.draw();
                      
                      });
    
    
    
    fetchData(function(jsn){
              plot =  $.plot("#placeholder", dataset, options);
              dataset[0].data = jsn.litres.data;
              plot.setData(dataset);
              plot.setupGrid();
              plot.draw();
              $('#spinner').hide();
              
              });
    
    function fetchData(callback){
        json1.litres.data.length=0;
        sm.db.transaction(function(tx) {
                tx.executeSql('SELECT cdate,volume FROM (SELECT * from feel where his == 0 group by indexs ) order by cdate  ',[], function(tx, results) {
                                        var len = results.rows.length;
                             
                                        for (var i=0; i<len; i++){
                                            json1.litres.data.push([results.rows.item(i).cdate,results.rows.item(i).volume]);
                              
                                        }
                                        callback(json1);
                                        
                                        }); //execute end
                          }); //transaction end
        
    }
    
}

$(document).one('progress', function(){
 
				navigator.notification.beep(1);
                $("#notification").fadeIn("fast").append('Transmission in progress.. Touch me!!').delay(7000).fadeOut("fast");
                
                $("#notification").click(function(){$.event.trigger({type:'realtime'})});
             
					pump = setTimeout(function(){
                           navigator.notification.beep(1);
                           var minutes = (500000*0.001)/60;
                           $("#notification").empty().fadeIn("fast").append('You should close the pump!!Flow Duration.. 8mins').delay(5000).fadeOut("slow");
                           },500000);
});

//Current consumption.Boxes insted of graph
$(document).on('current', function(e){
              
                
               $('#temp-box').empty();$('#litres-box').empty();$('#point-box').empty();$('#energy-box').empty();$('#duration-box').empty();
               $('#progressText').empty();
                $('#temp-box').append(e.message.temp.data[e.message.temp.data.length - 1][1]).append(' C');
                $('#point-box').append('Energy Class: ').append(EnergyClass(e.message.litres.data[e.message.litres.data.length - 1][1]));
                $('#litres-box').append(e.message.litres.data[e.message.litres.data.length - 1][1]).append(' L');
                $('#energy-box').append((e.message.energy.data[e.message.energy.data.length - 1][1]/1000).toFixed(2)).append(' kWh');
                $('#duration-box').append('Duration : ').append(secondsToTime(e.message.duration.data[e.message.duration.data.length - 1][1]));
               
  
                var Bv = window.localStorage.getItem('budget');
               var bper = ((e.message.litres.data[e.message.litres.data.length - 1][1]/Bv)*100).toFixed();
               $('#progressText').append('Budget Status : ').append(bper).append(' %');
               
                if (Bv == e.message.litres.data[e.message.litres.data.length - 1][1]){
                    navigator.notification.beep(1);
                    $("#notification").empty().fadeIn("fast").append('Consumption Budget Status: Overflow!! ').delay(4000).fadeOut("slow");
                }
                            
               
               });

function EnergyClass(a){
    if (a < 30){ return 'A+';}
    else if (a >= 30 && a  < 45){ return 'A';}
    else if (a >= 45 && a  < 50){ return 'A-';}
    else if (a >= 50 && a  < 60){ return 'B+';}
    else if (a >= 60 && a  < 75){ return 'B';}
    else if (a >= 75 && a  < 90){ return 'B-';}
    else
        return 'C';
}



function secondsToTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));
    
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    
    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return  obj.h + "hrs "+obj.m+ "mins " + obj.s +"secs";
}



$(document).on('last', function(){
               
               
               var values = JSON.parse(window.localStorage.getItem('jsonData'));
               $('#temp-last').empty();$('#litres-last').empty();$('#point-last').empty();$('#energy-last').empty();$('#duration-last').empty();
               if (values != null){
               $('#temp-last').append(values.temp.data[values.temp.data.length - 1][1]).append(' C');
               
               $('#litres-last').append(values.litres.data[values.litres.data.length - 1][1]).append(' L');
               $('#point-last').append('Energy Class: ').append(EnergyClass(values.litres.data[values.litres.data.length - 1][1]));
               $('#energy-last').append((values.energy.data[values.energy.data.length - 1][1]/1000).toFixed(2)).append(' kWh');
               $('#duration-last').append('Duration : ').append(secondsToTime(values.duration.data[values.duration.data.length - 1][1]));
               }
               else {
               $('#temp-last').append('0').append('c');
               $('#point-last').append('--');
               $('#litres-last').append('0').append('L');
               $('#energy-last').append('0').append('Wh');
               $('#date-last').append(' 0');
               $('#duration-last').append(' 0 ');
               }
 
               piechart(values.litres.data[values.litres.data.length - 1][1]);
               
               function piechart(a){
               var Bv = window.localStorage.getItem('budget');
               //alert(Bv);
               var bper = ((a/Bv)*100).toFixed();
               avl = 100-bper;
               //alert(bper);
               var dataPie = [
                              { label: "Consumed",
                                data: bper
                              },
                              { label: "Available",
                                data: avl
                              }
                              ];
               
               $.plot('#placeholderp', dataPie, {
                      series: {
                      pie: {
                        show: true,
                        radius: 1,
                            label: {
                                show: true,
                                radius: 3/4,
                                background: {
                                    opacity: 0.5,
                                    color: '#1e90ff'
                                }
                            }
                        }
                      
                      },
                      legend: {
                        show: false
                      }
                    });
                  
				$("#pie").fadeIn(1500);
                    
               }
               
               
               
               
           });

//Simple Households compare(average consumption)
$('#compare').click(function(){
                             
                  $('#submitAvg').click(function(){
                                        
                                        var d1 = $('#mode1').val();
                                        var d2 = $('#mode2').val();
                                        start = d1.split("-");
                                        stop = d2.split("-");
                                        days = stop[2] - start[2];
                                        var months = new Date(start[0],start[1]-1,start[2]).getTime();
                                        var monthf = new Date(stop[0],stop[1]-1,stop[2]).getTime();
                                        fetchDateData(months,monthf,days,function(avg){
                                                      $('#average').empty();$('#households').empty();$('#status').empty();
                                                      $('#average').append(avg);
                                                      $('#households').append(Math.floor(Math.random() * 10));
                                                      var sml = $('#households').text();
                                                      if( avg > sml ){
                                                      $('#status').append('Bad');
                                                      }
                                                      else {
                                                        $('#status').append('Good');
                                                      }
                                                });
                                  });

               function fetchDateData(d1,d2,days,AvgRes){
                  sm.db.transaction(function(tx) {
                        tx.executeSql('SELECT volume FROM feel WHERE cdate >= '+d1+' and cdate <= '+d2+' ',[], function(tx, results) {
                                      var len = results.rows.length;
                                      
                                      var sum = 0;
                                      for (var i=1; i<len; i++){
                                            
                              				dv = results.rows.item(i).volume - results.rows.item(i-1).volume;
                              				sum = sum + dv;
                                      
                                        }
                        
                                      AvgRes((sum/days).toFixed());
                                      }); //execute end
                                    }); //transaction end
                  }
                
                });

//Sharing functions
$('#shareViaMail').click(function(){
                         
                         window.plugins.socialsharing.shareViaEmail (
                                        '<b>My Last Consumption</b> : </br> Water(L): '+ json.litres.data[json.litres.data.length - 1][1] +
                                        '</br>  Energy(wH): ' + json.energy.data[json.energy.data.length - 1][1] +
                                        '</br>  Temperature(C): ' +json.temp.data[json.temp.data.length - 1][1] +
                                        '</br>  Duration(seconds): ' +json.duration.data[json.duration.data.length - 1][1],
                                        'Total packets',
                                        null, // TO: must be null or an array
                                        null, // CC: must be null or an array
                                        null, // BCC: must be null or an array
                                        null,
                                        function(msg) {
                                        alert('SocialSharing success: ' + msg);
                                        },
                                        function(msg) {
                                        alert('SocialSharing error: ' + msg);
                                        }
                                                                     
                                        );
                         
                         });


$('#shareViaFb').click(function(){
                       
                       window.plugins.socialsharing.shareViaFacebook(
                                                                     'The message',
                                                                     ['www/styles/images/logo.png',
                                                                      'http://www.telerik.com/sfimages/default-source/productsimages/mobilecraft/telerik-platform.png'],
                                                                     null,
                                                                     function(msg) {
                                                                     alert('SocialSharing success: ' + msg);
                                                                     },
                                                                     function(msg) {
                                                                     alert('SocialSharing error: ' + msg);
                                                                     }
                                                                     );
                       });



//Remove dynamically created page for real time
$(document).on('pagehide', '#real', function(){
               $(this).remove();
               clearInterval(internReal);
               });
