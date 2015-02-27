// Dynamically create real time Flot page.
// Triggered onclick event ONLY!
$(document).one('realtime',function(){ new successReal(); });


var successReal = function() {
    //$(document).on('click', '#graph', function(){
    
    var mapPage    =  $('<div>').attr({'id':'real','data-role':'page'}).appendTo('body');
    var mapHeader  = $('<div>').attr({'data-role':'header','id':'map-header'}).appendTo(mapPage);
    $('<h3>').html('Real Time Graph').appendTo(mapHeader);
    $('<a>').attr({'href':'#home','id':'conback','class' : 'ui-btn-left'}).html('Back').appendTo(mapHeader);
    var mapContent = $('<div>').attr({'data-role':'content'}).appendTo(mapPage);
    var inside = $('<div>').attr({'class':'demo-container'}).appendTo(mapContent);
    $('<div>').attr({'id':'placeholder4', 'class':'demo-placeholder','style':'float:left;width:80%'}).appendTo(inside);
    $('<div>').attr({'id':'choices4', 'style':'float:right;width:20%'}).appendTo(inside);
    var choiceContainer = $("#choices4");
    choiceContainer.append("<input type='checkbox' name='litres' checked='checked' id='litres1'></input><label for='litres1'>Litres </label>");
    choiceContainer.append("<input type='checkbox' name='temp' checked='checked' id='temp1'></input><label for='temp1'>Temp</label>");
    choiceContainer.append("<input type='checkbox' name='energy' checked='checked' id='energy1'></input><label for='energy1'>Energy</label>");
    $.mobile.changePage( "#real", { transition: "slide"});
    $('#real').on('pageshow',function(){
                  
                  function plotAccordingToChoices1() {
                  
                  var data1 = [];
                  var i = 0;
                  $.each(json, function(key, val) {
                         val.color = i;
                         ++i;
                         });
                  
                  choiceContainer.find("input:checked").each(function () {
                                                             var key = $(this).attr("name");
                                                             if (key && json[key]) {
                                                             data1.push(json[key]);
                                                             }
                                                             });
                  
                  $.plot("#placeholder4", data1, {yaxis: {min: 0},xaxis: {mode: "time"}});
                  
                  }
                  
                  intern = setInterval(plotAccordingToChoices1,2000);
                  
                  }); // pageshow end
} //end


//$(document).one('realtime',function(){ new successR(); });
$('#realfeel').click(function(){ successR(); });

var successR = function() {
    $('#spinner1').show();
    function plotAccordingToChoices() {
        
        var data = [];
        var i = 0;
        $.each(json, function(key, val) {
               val.color = i;
               ++i;
               });
        
        $('#choices1').find("input:checked").each(function () {
                                                  var key = $(this).attr("name");
                                                  if (key && json[key]) {
                                                  data.push(json[key]);
                                                  }
                                                  });
        
        $('#spinner1').hide();
        $.plot("#placeholder1", data, {yaxis: {min: 0},xaxis: {mode: "time"}});
        
    }
   
    intern = setInterval(plotAccordingToChoices,2000);
    
} //end

// Show me Daily consumption.Stable Graph!!
$('#whole').click(function(){ successW();});

var successW = function(){
    
    $('#spinner').show();

    $( "#tabs-2 li a" ).removeClass( "ui-btn-active" );
    $( "#year" ).addClass( "ui-btn-active" );
    var BudgetValue = window.localStorage.getItem('budget');
    
    $('#cbudget').text(BudgetValue);
    $('#budget').val(BudgetValue);
    
    $('#budget').slider('refresh');
    
    var json1 = {
        "litres" : {label: "Litres",data: [],xaxis: 1}
    };
    
    var dataset = [{
                   label: "Consumption",
                   data: [],
                   yaxis: 1,
                   color: "#1e90ff" ,
                   lines: { show: true }
                   }
                   ];
    
    
    var options = {
                xaxis: {
                    mode: "time",
                    minTickSize: [1, "month"],
                    min: (new Date(2015, 0, 1)).getTime(),
                    max: (new Date(2016, 0, 1)).getTime(),
                    twelveHourClock: false
                    },
                yaxis: { min: 0 },
                grid: {
                    markings: [ { lineWidth: 2, yaxis: { from: BudgetValue, to: BudgetValue }, color: "#FF0000" }]
                    }
        };
    
    
    var plot =  $.plot("#placeholder", dataset, options);
    
    
    $(function(){
      
      $('#submitAnalysis').click(function(){
                        
                        var d1 = $('#mode1a').val();
                        var d2 = $('#mode2a').val();
                                 
                        start = d1.split("-");
                        stop = d2.split("-");
                        var months = new Date(start[0],start[1]-1,start[2]).getTime();
                        var monthf = new Date(stop[0],stop[1]-1,stop[2]).getTime();
                                 
                        plot.getOptions().xaxes[0].min = months;
                        plot.getOptions().xaxes[0].max = monthf;
                        plot.getOptions().xaxes[0].minTickSize = [1,"day"];
                        plot.getOptions().xaxes[0].twelveHourClock = true;
                        plot.setupGrid();
                        plot.draw();
                        
                        });

      
      $('#today').click(function(){
                        
                        var start = new Date();
                        var end = new Date();
                        plot.getOptions().xaxes[0].min = start.setHours(0,0,0,0);
                        plot.getOptions().xaxes[0].max = end.setHours(23,59,59,999);
                        plot.getOptions().xaxes[0].minTickSize = [1,"hour"];
                        plot.getOptions().xaxes[0].twelveHourClock = true;
                        plot.setupGrid();
                        plot.draw();
                        
                        });
      
      
      $('#week').click(function(){
                       
                       var curr = new Date(); // get current date
                       var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
                       var last = first + 6; // last day is the first day + 6
                       var firstday = new Date(curr.setDate(first));
                       var lastday = new Date(curr.setDate(last));
                       plot.getOptions().xaxes[0].min = firstday;
                       plot.getOptions().xaxes[0].max = lastday;
                       plot.getOptions().xaxes[0].minTickSize = [1,"day"];
                       plot.setupGrid();
                       plot.draw();
                       
                       });
      
      $('#month').click(function(){
                        
                        var d = new Date();
                        var year  = d.getFullYear();
                        var month = d.getMonth();
                        var firstOfMonth = new Date(year, month, 1);
                        var lastOfMonth = new Date(year, month+1, 0);
                        //var used = firstOfMonth.getDay() + lastOfMonth.getDate();
                        //var weeks = Math.ceil( used / 7);
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
                      //$('#cbudget').text(bla);
                      window.localStorage.setItem('budget',bla);
                      plot.getOptions().grid.markings = [ { lineWidth: 2, yaxis: { from: bla, to: bla }, color: "#FF0000" }];
                      plot.setupGrid();
                      plot.draw();
                      
                      });
      
      });
    
    fetchData(function(jsn){
              dataset[0].data = jsn.litres.data;
              plot.setData(dataset);
              plot.setupGrid();
              plot.draw();
              $('#spinner').hide();
              
              });
    
    
    function fetchData(callback){
        json1.litres.data.length=0;
        sm.db.transaction(function(tx) {
                          tx.executeSql('SELECT cdate,volume FROM feel WHERE his = 0 ',[], function(tx, results) {
                                        var len = results.rows.length;
                                        //alert(len);
                                        for (var i=0; i<len; i++){
                                            json1.litres.data.push([results.rows.item(i).cdate,results.rows.item(i).volume]);
                                        }
                                        callback(json1);
                                        
                                        }); //execute end
                          }); //transaction end
        
    }
    
}
//TESTING FOR VERTICAL
//Current Consumption Page
$(document).on('last', function(){

               var values = JSON.parse(window.localStorage.getItem('jsonData'));
               $('#temp-box1').empty();$('#litres-box1').empty();$('#point-box1').empty();$('#energy-box1').empty();
               if (values != null){
                    $('#temp-box1').append(values.temp.data[values.temp.data.length - 1][1]).append('c');
                    $('#point-box1').append(EnergyClass(values));
                    $('#litres-box1').append(values.litres.data[values.litres.data.length - 1][1]).append('L');
                    $('#energy-box1').append(values.energy.data[values.energy.data.length - 1][1]).append('Wh');
               }
               else {
                    $('#temp-box1').append('0').append('c');
                    $('#point-box1').append('--');
                    $('#litres-box1').append('0').append('L');
                    $('#energy-box1').append('0').append('Wh');
               }
               
               
               function EnergyClass(a){
                    if (a.litres.data[values.litres.data.length - 1][1] < 30){ return 'A+';}
                    else if (a.litres.data[values.litres.data.length - 1][1] >= 30 && a.litres.data[values.litres.data.length - 1][1] < 45){ return 'A';}
                    else if (a.litres.data[values.litres.data.length - 1][1] >= 45 && a.litres.data[values.litres.data.length - 1][1] < 50){ return 'A-'}
                    else if (a.litres.data[values.litres.data.length - 1][1] >= 50 && a.litres.data[values.litres.data.length - 1][1] < 60){ return 'B+';}
                    else if (a.litres.data[values.litres.data.length - 1][1] >= 60 && a.litres.data[values.litres.data.length - 1][1] < 75){ return 'B';}
                    else if (a.litres.data[values.litres.data.length - 1][1] >= 75 && a.litres.data[values.litres.data.length - 1][1] < 90){ return 'B-';}
                    else
                        return 'C';
               }
               
               });

/*
$('#deviceList').on('click', 'li', function() {
                    //alert("Works"); // id of clicked li by directly accessing DOMElement property
                    id = $(this).attr('data-name');
                    //name = $(this).text();
                    //alert(name);
                    //var dev = {"id":id,"name":name};
                    bleTransfer.connection(id);
                    });

*/

$(document).one('current', function(){
               function plotBoxes() {
                $('#temp-box').empty();$('#litres-box').empty();$('#point-box').empty();$('#energy-box').empty();
                $('#temp-box').append('Temperature</br>').append(json.temp.data[json.temp.data.length - 1][1]).append('c');
                $('#point-box').append('Energy Class</br>').append(EnergyClass(json.litres.data[json.litres.data.length - 1][1]));
                $('#litres-box').append('Litres</br>').append(json.litres.data[json.litres.data.length - 1][1]).append('L');
                $('#energy-box').append('Energy</br>').append((json.energy.data[json.energy.data.length - 1][1]/1000).toFixed(2)).append('kWh');
                
                            
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

                }
                intern = setInterval(plotBoxes,2000);
            
                
               if (confirm("Trasmission started!See??") == true) {
                    $.event.trigger({type:'realtime'});
                } else {
                
                }
               
               });

$('#compare').click(function(){
                             
                $(function(){
                  $('#submitAvg').click(function(){
                                        // Get all the forms elements and their values in one step
                                        var d1 = $('#mode1').val();
                                        var d2 = $('#mode2').val();
                                        start = d1.split("-");
                                        stop = d2.split("-");
                                        var months = new Date(start[0],start[1]-1,start[2]).getTime();
                                        var monthf = new Date(stop[0],stop[1]-1,stop[2]).getTime();
                                        fetchDateData(months,monthf,function(avg){
                                                      $('#average').empty();$('#compStatus').empty();
                                                      $('#average').append(avg);
                                                      var hholds = $('#households').text();
                                                      
                                                      $('#compStatus').append(compareSimilar);
                                                      function compareSimilar(){
                                                        if (avg >= hholds) { return 'BAD'; }
                                                        else
                                                            return 'GOOD';
                                                      }
                                                      
                                                      });
                                  });

               function fetchDateData(d1,d2,AvgRes){
                  sm.db.transaction(function(tx) {
                        tx.executeSql('SELECT avg(volume) as average FROM feel WHERE cdate >= '+d1+' and cdate <= '+d2+' ',[], function(tx, results) {
                                      res = Math.round(results.rows.item(0).average);
                                      AvgRes(res);
                                      }); //execute end
                                    }); //transaction end
                  }
                  });
                });


$('#shareViaMail').click(function(){
                         
                         window.plugins.socialsharing.shareViaEmail (
                                                                     'Your total consumption today is : ' +packets.length + '!Well done' ,
                                                                     'Total Consumption',
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




$(document).on('pagehide', '#real', function(){
               $(this).remove();
               });
