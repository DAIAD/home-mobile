var ranking = function(param) {
    this.param = param;
};

ranking.prototype = {

    setRanking : function(dt){
        var nm,data = [],
            tb = $('#rankingTables .user_rank'),
            rank = $('.socialTablesRank .user_rank'),
            elements = $('#rankingTables .user_rank,.mem_tb .user_rank');
        
        $('.mem_tb').empty();
        
        $('tr',rank).each(function(){
                          $(this).find('td:eq(1)').empty();
                          $(this).find('td:eq(2)').empty();
                          });
        
        //dt contains all data per member
        for(var x=0; x<dt.length;x++){
            
            var test = getObjects(data, 'member', dt[x].member);
            
            if(!test.length) {
                
                dt[x].showers = 1;
                
                dt[x].avg_vol = dt[x].volume.value / dt[x].showers;
                
                data.push(dt[x]);
                
            } else {
                
                test[0].volume.value += dt[x].volume.value;
                
                test[0].showers +=1;
                
                test[0].avg_vol = test[0].volume.value / test[0].showers;
                
            }
        }
        
        var data = data.sort(function (a, b) {
                             if (a.avg_vol > b.avg_vol) {
                             return 1;
                             }
                             if (a.avg_vol < b.avg_vol) {
                             return -1;
                             }
                             return 0;
                             });
        
        for(var xxx=0; xxx<data.length-1;xxx++) {
            tb.clone().appendTo('.mem_tb');
        }
        
        $('#rankingTables .user_rank,.mem_tb .user_rank').each(function(i){
                      
                      //TODO : create trunc function for long strings
                      (data[i].name.length >= 7) ? nm = data[i].name.substr(0, 5) + '..' : nm = data[i].name;
                                                               
                      $(this).find('tr:eq(0) td:eq(0) span').text(nm);
                      
                      $(this).find('tr:eq(0) td:eq(0) img').attr('src','img/SVG/rank-'+(i+1)+'.svg').attr('width',40-(i*5)).attr('height',40-(i*5));
                                                               
                      $(this).find('tr:eq(0) td:eq(2)').text(data[i].showers);
                      
                      $(this).find('tr:eq(1) td:eq(2)').text(data[i].volume.value.toFixed(2));
                      
                      $(this).find('tr:eq(1) td:eq(3)').text(data[i].volume.label);
                      
                      $(this).find('tr:eq(2) td:eq(0) span:eq(1)').text(data[i].avg_vol.toFixed(2));
                      
                      $(this).find('tr:eq(2) td:eq(0) span:eq(2)').text(data[i].volume.label);
                      
                      $(this).find('tr:eq(2) td:eq(2)').text(tm.secondsToTimeShort(data[i].duration.value));
                      
                      $(this).find('tr:eq(3) td:eq(2)').text(data[i].temp.value.toFixed());
                      
                      $(this).find('tr:eq(3) td:eq(3)').text(data[i].temp.label);
                      
                      });
        
        if(data.length == 1) {
           
            rank.find('td').eq(0).css({'width':'92%','text-align':'center'});
            
            rank.find('td').eq(1).css({'width':'0%','text-align':'center'});
            
            rank.find('td').eq(2).css({'width':'0%','text-align':'center'});
        
        } else {
        
            rank.find('td').eq(0).css({'width':'45%','text-align':'center'});
            
            rank.find('td').eq(1).css({'width':'10%','text-align':'center'});
            
            rank.find('td').eq(2).css({'width':'37%','text-align':'left'});
       
        }
        
        rank.find('tr:eq(0) td:eq(0) span').text(data[0].name);
        
        rank.find('tr:eq(1) td:eq(0) span:eq(1)').text(data[0].avg_vol.toFixed(2));
        
        rank.find('tr:eq(1) td:eq(0) span:eq(2)').text(data[0].volume.label);
        
        data.splice(0,1);
        
        $('tr',rank).each(function(i){
                         
                          $(this).find('td:eq(1)').text('');
                          
                          $(this).find('td:eq(2)').text('');
                          
                          if(!data[i].name) return false;
                          
                          $(this).find('td:eq(1)').text('#'+(i+2));
                          
                          $(this).find('td:eq(2)').text(data[i].name);
                          
                          });
    },

    socialRanking : function(data){
        
        if(!data.length) { return false; }
        
        var colors = this.getColors(),
            options = this.getFlotOptionsMonthNotime(),
            counter, total = [],
            width = '20%',
            legend = $('#membersLegend');
        
        legend.append( this.getMemberLegendTemplate(width,data[0].name,colors[0]) );
        
        total.push(
                   {
                   data: [[0,0]],
                   color:colors[0],
                   member: data[0].member ,
                   start : 1
                   }
                   );
        
        for(var x=1; x<data.length; x++){
            
            if(data[x-1].member != data[x].member){
                
                var test = getObjects(total, 'member', data[x].member);
                
                if(!test.length){
                    
                    legend.append( this.getMemberLegendTemplate(width,data[x].name,colors[total.length]) );
                    
                    total.push(
                               {
                               data: [[0,0]],
                               color:colors[total.length],
                               member: data[x].member,
                               start : 1
                               }
                               );
                    
                }
                
            }
            
        }
        
        for(var y=1; y<data.length; y++){
            
            var obj = getObjects(total, 'member',data[y].member);
            
            counter = obj[0].start;
            
            if( data[y-1].member != data[y].member ){
                
                counter = obj[0].start;
                
            }
            
            obj[0].data.push([counter,data[y].volume.value]);
            
            obj[0].start++;
            
        }
        
        chart = $.plot($('#placeholder_rank_2'),total,options);
        
    },
    getMemberLegendTemplate : function(width,name,color){
    
        return '<div style="width:'+width+';"> \
                    <p class="mem_legend_p1" style="font-size:4vw;">'+name+'</p> \
                    <p class="mem_legend_p2" style="background-color:'+color+';"></p> \
                </div>';
        
    },
    getColors : function(){
        
        return ['#42f465','red','blue','#2D3580','#CD4D3E','yellow','green'];
    
    },
    getFlotOptionsMonthNotime : function(){
        
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
                    bottom :0 ,
                    left:0
                },
                tickColor: "rgba(255, 255, 255, 0)",
            },
            xaxis: {
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
            lines:{show:true,lineWidth:2},
            points:{show:false},
            shadowSize: 0
        };
        
    }
    
};
