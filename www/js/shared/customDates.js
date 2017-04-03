// file: customDate.js
/*define(function(require) {
 
 var moment = require('moment-with-locales');
 
 return {
 
 fullDateTime : function(parameter){
 
 var check = moment(parameter),
 month1 = check.month(),
 month = moment.months(month1),
 dayOfMonth  = check.format('D'),
 year = check.format('YYYY'),
 dayOfWeek = check.day(),
 dayName = moment.weekdaysShort(dayOfWeek),
 hoursto = check.format("HH:mm:ss a");
 
 return dayName +' '+ dayOfMonth +' '+ month + ' ' +year + ', ' +hoursto;
 
 }
 
 };
 
 });*/



var customDates = function(unixtimestamp) {
    //this.parameter = unixtimestamp;
};

customDates.prototype = {
    
    getDateFormat : function(x,y){
        /*
         day : Monday 30/1/2017
         week : Mon 30/01/2017 - Sun 05/02/2017
         month : January 2017
         year  : 2017
         */
        var active = app.getGranularityFromGraph(),
            start = moment(x).valueOf(),
            end = moment(y).valueOf(),
            textFinal;
        
        if(active === 0) { //day
            
            var dayName = moment.weekdays(moment(start).day()),
                dayFormat = moment(start).format('DD/MM/YYYY');
            
            textFinal = dayName +' '+ dayFormat;
            
        } else if(active === 1) { //week
            
            var dayName1 = moment.weekdaysShort(moment(start).day()),
                dayName2 = moment.weekdaysShort(moment(end).day()),
                dayFormat1 = moment(start).format('DD/MM/YYYY'),
                dayFormat2 = moment(end).format('DD/MM/YYYY');
            
            textFinal = dayName1 +' '+ dayFormat1 +'-'+dayName2 +' '+ dayFormat2;
            
        } else if(active === 2) { //month
            
            var month = moment(start).month();
            
            textFinal = moment.months(month) +' '+ moment(start).year();
            
        } else { //year
            
            textFinal = moment(start).format('YYYY');
        }
        
        return textFinal;
        
    },
    getNewGraphDates : function(granularity){
       
        var x,y;
        
        if(granularity === 0) {
            x = moment().subtract(1,'day').startOf('day').valueOf();
            y = moment().subtract(1,'day').endOf('day').valueOf();
        } else if(granularity == 1) {
            x = moment().startOf('isoweek').valueOf();
            y = moment().endOf('isoweek').valueOf();
        } else if(granularity == 2) {
            x  = moment().startOf('month').valueOf();
            y = moment().endOf('month').valueOf();
        } else {
            x = moment().startOf('year').valueOf();
            y = moment().endOf('year').valueOf();
        }
        
        return {
            start:x,
            end:y
        };
        
    },
    getPastDates : function(granularity,start,end){
        // calculates new start - end dates after subtracting 1 time back
        var x,y;
        
        if(granularity === 0) { //day
            x = moment(start).subtract('day',1).valueOf();
            y = moment(end).subtract('day',1).valueOf();
        } else if(granularity === 1) { //week
            x = moment(start).subtract('week',1).valueOf();
            y = moment(end).subtract('week',1).valueOf();
        } else if(granularity === 2) {//month
            x = moment(start).subtract('month',1).valueOf();
            y = moment(end).subtract('month',1).valueOf();
        } else { //year
            x = moment(start).subtract('year',1).valueOf();
            y = moment(end).subtract('year',1).valueOf();
        }
        
        return {
            start:x,
            end:y
        };
        
    },
    getNextDates : function(granularity,start,end){
        // calculates new start - end dates after adding 1 time forward
        var x,y;
        
        if(granularity === 0) {
            x = moment(start).add('day',1).valueOf();
            y = moment(end).add('day',1).valueOf();
        } else if(granularity == 1) {
            x = moment(start).startOf('isoweek').add('week',1).valueOf();
            y = moment(end).endOf('isoweek').add('week',1).valueOf();
        } else if(granularity == 2) {
            x = moment(start).add('month',1).valueOf();
            y = moment(end).add('month',1).valueOf();
        } else {
            x = moment(start).add('year',1).valueOf();
            y = moment(end).add('year',1).valueOf();
        }
        
        return {
            start:x,
            end:y
        };
        
    },
    fullDateTime : function(parameter){
        
        var check = moment(parameter),
            month1 = check.month(),
            month = moment.months(month1),
            dayOfMonth  = check.format('D'),
            year = check.format('YYYY'),
            dayOfWeek = check.day(),
            dayName = moment.weekdaysShort(dayOfWeek),
            hoursto = check.format("HH:mm:ss a");
        
        return dayName +' '+ dayOfMonth +' '+ month + ' ' +year + ', ' +hoursto;
        
    },
    
    timestampToHourFormat : function(parameter){
        
        var a = new Date(parameter),
            hour = a.getHours(),
            min = a.getMinutes();
        
        if(hour < 10){ hour = '0' + hour;  }
        
        if(min < 10){ min = '0' + min;  }
        
        var time =  hour + ':' + min  ;
        
        return time;
        
    },
    
    timeConverter : function(parameter){
        
        var a = new Date(parameter),
            year = a.getFullYear(),
            month = a.getMonth()+1,
            date = a.getDate(),
            hour = a.getHours(),
            min = a.getMinutes();
        
        if(min < 10){ min = '0' + min;  }
        
        var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min  ;
        
        return time;
        
    },
    date2human : function(){
        
        var a = new Date(),
            year = a.getFullYear(),
            month = a.getMonth()+1,
            date = a.getDate(),
            time =  year + '-' + month + '-' + date  ;
        
        return time;
        
    },
    time2seconds : function(parameter){
        var hms = parameter;
        
        var a = hms.split(':'); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        
        return seconds;
    },
    secondsToMinutes : function(parameter){
        
        var secs = parameter,
            hours = Math.floor(secs / 3600),
            divisor_for_minutes = secs % (60 * 60),
            minutes = Math.round(divisor_for_minutes / 60);
        
        if(hours > 0) {
            minutes = minutes + hours*60;
        }
        
        return minutes;
    },
    secondsToTime : function(parameter){
        
        var secs = parameter,
            hours   = Math.floor(secs / 3600),
            divisor_for_minutes = secs % (60 * 60),
            minutes = Math.floor(divisor_for_minutes / 60),
            divisor_for_seconds = divisor_for_minutes % 60,
            seconds = Math.ceil(divisor_for_seconds);
        
        if (hours < 10) {hours   = "0"+hours;}
        
        if (minutes < 10) {minutes = "0"+minutes;}
        
        if (seconds < 10) {seconds = "0"+seconds;}
        
        var obj = {
            "h":hours,
            "m": minutes,
            "s": seconds
        };
        
        return obj.h +':'+ obj.m +':'+ obj.s;
        
    },
    secondsToTimeShort : function(parameter){
        
        var secs = parameter;
        
        var hours   = Math.floor(secs / 3600);
        
        var divisor_for_minutes = secs % (60 * 60);
        
        var minutes = Math.floor(divisor_for_minutes / 60);
        
        var divisor_for_seconds = divisor_for_minutes % 60;
        
        var seconds = Math.ceil(divisor_for_seconds);
        
        if (hours   < 10) {hours   = "0"+hours;}
        
        if (minutes < 10) {minutes = "0"+minutes;}
        
        if (seconds < 10) {seconds = "0"+seconds;}
        
        var obj = {
            "h":hours,
            "m": minutes,
            "s": seconds
        };
        
        return  obj.m +':'+ obj.s;
        
    },
    secondsToTimeFullLabels : function(parameter){
        
        var secs = parameter;
        
        var hours   = Math.floor(secs / 3600);
        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);
        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var obj = {
            "h":hours,
            "m": minutes,
            "s": seconds
        };
        return  obj.m +' min '+ obj.s +' sec ';
    },
    secondsToTimeShortLabels : function(parameter){
        
        var secs = parameter;
        
        var hours   = Math.floor(secs / 3600);
        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);
        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var obj = {
            "h":hours,
            "m": minutes,
            "s": seconds
        };
        return  obj.m +' min '+ obj.s +' sec ';
    },
    secondsToTimeAll : function(parameter){
        
        var secs = parameter;
        
        var hours   = Math.floor(secs / 3600);
        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);
        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var obj = {
            "h":hours,
            "m": minutes,
            "s": seconds
        };
        return  obj;
    },
    getUnixTimestamp : function(totime){
        //20160606 format
        var year = totime.slice(0,4),
            month = totime.slice(4,6),
            day = totime.slice(6,8),
            timestamp = new Date(year +'-'+month + '-' + day).getTime();
        
        return timestamp;
        
    }
    
    
};

