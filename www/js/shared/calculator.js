var calculator = function(param) {
    this.param = param;
};

calculator.prototype = {
    
    init : function(){
    
        $('#CalcHome').hide();
        
        $('#CalcMem').show();
        
        $('#calculatorButtons').show();
        
        $('.selectTabs,.selectTabsTemp').empty();
        
        app.user.personalEstimates = {};
        
        var cp = new component();
                
        $('#calculatorIncrements').html( cp.increment(1,12,'') );
        
    },
    reset : function(){
        
        $('.mycalc').hide();
        
        $('#CalcHome').show();
        
        $('#prevQuestion').attr('disabled',true);
        
        $('#nextQuestion').show();
        
        $('#calculatorButtons').hide();
        
        $('#toCalcResults').hide();
        
        $('.calQuestions p.questionActive').removeClass('questionActive').hide();
        
        $('.calQuestions p:eq(0)').addClass('questionActive').show();
        
        $('.selectTabs').empty();
        
        $('#WaterCalculator .center').hide();
        
    },
    next : function(){
    
        var activeQuestion = $('.calQuestions p.questionActive'),
            index = activeQuestion.index(),
            element= activeQuestion.attr('id'),
            obj = $('#calculatorIncrements input'),
            value = obj.val();
        
        activeQuestion.removeClass('questionActive ').hide();
        
        $('.calQuestions p:eq('+(index+1)+')').addClass('questionActive').show();
        
        $('#prevQuestion').removeAttr('disabled');
        
        if(index + 1 == ( $('.calQuestions p').length - 1 ) ) {
            $('#nextQuestion').hide();
            $('#toCalcResults').show();
        }
        
        //q1 : this.setIncrementMinMax(1,12)
        if(index + 1 == 1) this.setIncrementMinMax(1,60); //q2
        if(index + 1 == 2) this.setIncrementMinMax(1,60); //q3
        if(index + 1 == 3) this.setIncrementMinMax(0,80); //q4
        if(index + 1 == 4) this.setIncrementMinMax(4,60); //q5
        if(index + 1 == 5) this.setIncrementMinMax(0,20); //q6
        if(index + 1 == 6) this.setIncrementMinMax(0,20); //q7
        if(index + 1 == 7) this.setIncrementMinMax(0,60); //q8
        if(index + 1 == 8) this.setIncrementMinMax(0,200); //q9
        
        app.user.personalEstimates[element] = parseInt(value,10);
        
    },
    previous : function(){
    
        var activeQuestion = $('.calQuestions p.questionActive'),
            index = activeQuestion.index(),
            element= activeQuestion.attr('id'),
            obj = $('#calculatorIncrements input'),
            value = obj.val();
        
        activeQuestion.removeClass('questionActive ').hide();
        
        $('.calQuestions p:eq('+(index-1)+')').addClass('questionActive').show();
        
        $('#nextQuestion').show();
        
        $('#toCalcResults').hide();
        
        if(index - 1 == 0 ) {
            $('#prevQuestion').attr('disabled',true);
        }
        
        if(index - 1 == 1) this.setIncrementMinMax(1,60); //q2
        if(index - 1 == 2) this.setIncrementMinMax(1,60); //q3
        if(index - 1 == 3) this.setIncrementMinMax(0,80); //q4
        if(index - 1 == 4) this.setIncrementMinMax(4,60); //q5
        if(index - 1 == 5) this.setIncrementMinMax(0,20); //q6
        if(index - 1 == 6) this.setIncrementMinMax(0,20); //q7
        if(index - 1 == 7) this.setIncrementMinMax(0,60); //q8
        if(index - 1 == 8) this.setIncrementMinMax(0,200); //q9
        
        app.user.personalEstimates[element] = parseInt(value,10);
        
    },
    results : function(){
        var element, value, results, obj;
        
        $('#calculatorButtons').hide();
        $('#CalcMem').hide();
        $('#WaterCalculatorResults').show();
        $('#WaterCalculator .center').show();
        
        element= $('.calQuestions p.questionActive').attr('id'),
        obj = $('#calculatorIncrements input'),
        value = obj.val();
        
        app.user.personalEstimates[element] = parseInt(value,10);
        
        results = this.calculate(app.user.personalEstimates);
        
        results.total_month = app.metricLocalemeter({ volume : results.total_month });
        
        results.total_week = app.metricLocalemeter({ volume : results.total_week});
        
        results.total_year = app.metricLocalemeter({ volume : results.total_year});
        
        app.user.personalEstimates = results;
                
        $('#waterCalculatorValue').text(results.total_month.volume.value +''+ results.total_month.volume.label);
        
        $('#calculatorListResults li:eq(0) .item-after').text(results.shower + '%');
        $('#calculatorListResults li:eq(1) .item-after').text(results.washing + '%');
        $('#calculatorListResults li:eq(2) .item-after').text(results.toilet + '%');
        $('#calculatorListResults li:eq(3) .item-after').text(results.other + '%');
        
        app.setUserToLocalStorage(JSON.stringify(AppModel.user));
    
    },
    calculate : function(data){
        
        /*data holds results from water calculator
         data.q1 = result of question 1
         data.qn = result of question n
         numberOfcategories = 4
         */
        
        var shower = (data.q2 * 52/12 ) * ( data.q3 * 9.5 )  + data.q4 * 96,
            washing = data.q6 * 52/12 * 60,
            toilet = data.q5 * 30 * 8,
            other = data.q7 * 52/12 * 25 + data.q8 * 30 * 5 + data.q9 * 30 * 5,
            sum = shower + washing + toilet + other;
        
        var showerPercent = shower / sum * 100,
            washingpercent = washing / sum * 100,
            toiletPercent = toilet / sum * 100,
            otherPercent = other / sum * 100;
        
        return {
            shower: Math.round(showerPercent),
            washing:Math.round(washingpercent),
            toilet:Math.round(toiletPercent),
            other:Math.round(otherPercent),
            total_month : sum,
            total_week : sum / (52/12),
            total_year : sum * 12
        };
        
    },
    options : function(obj){
        var total,
            label,
            index = obj.index();
        
        $('.calculatorTabs a.evtActive').removeClass('evtActive ');
        $('.calculatorTabs span.msgActive').removeClass(' msgActive');
        
        obj.addClass('evtActive');
        obj.find('span').addClass('msgActive');
        
        if(index == 0) {
            total = app.user.personalEstimates.total_week.volume.value;
            label = app.user.personalEstimates.total_week.volume.label;
        } else if(index == 1) {
            total = app.user.personalEstimates.total_month.volume.value;
            label = app.user.personalEstimates.total_month.volume.label;
        } else {
            total = app.user.personalEstimates.total_year.volume.value;
            label = app.user.personalEstimates.total_year.volume.label;
        }
        
        $('#waterCalculatorValue').text(total.toFixed() + ' ' + label);
    
    },
    setIncrementMinMax : function(min,max){
        
        var obj = $('#calculatorIncrements input');
        
        obj.attr('min',min);
        
        obj.attr('max',max);
        
        obj.val(min);
        
    }
};

$(function(){

  //initialize calculator
  $('#CalcStart').on('click' , function(){
                     calc.init();
                     });
  
  //start calculator and set view
  $('.startCalculator').on('click',function(){
                           calc.reset();
                           });
  //on click next question
  $('#nextQuestion').on('click',function(){
                        calc.next();
                        });
  
  $('#prevQuestion').on('click',function(){
                        calc.previous();
                        });
  //results
  $('#toCalcResults').on('click',function(){
                         calc.results();
                         });
  //results by time periods
  $('.calculatorTabs a').on('click',function(){
                            calc.options($(this));
                            });
  
  
  });

