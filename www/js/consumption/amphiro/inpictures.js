var inPictures = function(param) {
    this.param = param;
};

inPictures.prototype = {
    
    visualize : function(total,rest,image,res_img,sel,w){
        
        var width;
        
        (w) ? width = w : width = 40;
        
        var img = '<img src="'+image+'" width="'+width+'" height="'+width+'">';
        
        var img_res = '<img src="'+res_img+'" width="'+width+'" height="'+width+'">';
        
        var max = parseInt(total);
        
        var max2 = parseInt(rest);
        
        for(var i=0;i<max;i++) {
            sel.append(img + ' ');
        }
        
        for(var o=0;o<max2;o++) {
            sel.append(img_res + ' ');
        }
        
    },
    //visulize water in bottles, buckets, pools
    volume : function(){
        var total_v,img_v,width,temp_res,res_v,res_img_v,kk,
            volume = this.param.value,
            volume_selector = this.param.selector,
            info = this.getOptions();
        
        if(volume <= 39 ){
            
            total_v = parseInt( volume / info.bottle.value );

            temp_res = volume % info.bottle.value;

            img_v = info.bottle.img;
            
            res_v = 0;
            
            res_img_v = info.bottle.img;
            
            kk = temp_res / info.bottle.value;
            
            if( kk > 0 && kk <= 0.25 ) {
                res_v=1;
                res_img_v = info.bottle.img25;
            } else if( kk > 0.25 && kk <=0.50 ) {
                res_v=1;
                res_img_v = info.bottle.img50;
            } else if( kk > 0.50 && kk<=0.90 ) {
                res_v=1;
                res_img_v = info.bottle.img75;
            } else if( kk > 0.90 ) {
                res_v=1;
                res_img_v = info.bottle.img;
            }
            
            width = null;
        }
        
        if(volume > 39 && volume < 10000){
            
            volume = parseInt(volume);
            
            total_v = parseInt(volume / info.bucket.value);
            
            temp_res = volume % info.bucket.value;
            
            img_v = info.bucket.img;
            
            kk = temp_res / info.bucket.value;
            
            res_v = 0;
            
            if(kk > 0 && kk <= 0.25) {
                res_v=1;
                res_img_v = info.bucket.img25;
            } else if(kk > 0.25 && kk <=0.50) {
                res_v=1;
                res_img_v = info.bucket.img50;
            } else if(kk > 0.50 && kk<=0.90) {
                res_v=1;
                res_img_v = info.bucket.img75;
            } else if(kk > 0.90) {
                res_v=1;
                res_img_v = info.bucket.img;
            }
            
            width = null;
        }
        
        if(volume >= 10000) {
            
            total_v = volume / info.pool.value;
            
            img_v = info.pool.img;
            
            res_v = 0;
            
            res_img_v = info.pool.img;
            
            width = null;
        }
        
        this.visualize(
                       total_v,
                       res_v,
                       img_v,
                       res_img_v,
                       volume_selector,
                       width
                       );
    
    },
    //visulize energy in bulbs, homes, cities
    energy : function(){
    
        var total_e,img_e,res_e,res_img_e,width,
            energy = this.param.value,
            energy_selector = this.param.selector,
            info = this.getOptions();
        
        if(this.param.label == 'kWh') {
            energy = energy * 1000;
        }
        
        if(energy <= 999){
            
            total_e = energy/ info.bulb.value ;
           
            img_e = info.bulb.img;
            
            res_e=0;
            
            res_img_e = info.bulb.img;
            
            if(energy < 40){
                total_e = 1;
            }
            
            width = 50;
        }
        
        if(energy > 999 && energy < 100000){
                        
            total_e = Math.round(energy / info.home.value);
            
            res_e = (energy % info.home.value)/ info.bulb.value;
            
            img_e = info.home.img;
            
            if(total_e > 500) {
                res_img_e = info.home.img;
            } else {
                res_img_e = info.bulb.img;
            }
            
            width = null;
        }
        
        if(energy >= 100000) {
            
            total_e = energy / info.city.value;
            
            img_e = info.city.img;
            
            res_e=0;
            
            res_img_e = info.city.img;
            
            width = null;
        
        }

        this.visualize(
                       total_e,
                       res_e,
                       img_e,
                       res_img_e,
                       energy_selector,
                       width
                       );

    },
    //visulize energy in bulbs, homes, cities
    co2 : function(){
    
        var info = this.getOptions(),
            total_c,img_c,res_c,res_img_c,width,
            co2 = this.param.value,
            co2_selector = this.param.selector;
        
        if(co2 < 0.01){
            total_c = 0;
            img_c = info.car.img;
            res_c=0;
            res_img_c = info.car.img;
            width = 50;
        }
        
        if(co2 >=0.01 && co2 < 100){
            total_c = co2 / info.car.value;
            img_c = info.car.img;
            res_c=0;
            res_img_c = info.car.img;
            width = 50;
        }
        
        if(co2 >= 100 && co2 < 10000){
            total_c = co2 / info.bus.value;
            res_c = Math.round( (co2 % info.bus.value ) /info.car.value );
            img_c = info.bus.img;
            width = 50;
            if(res_c > 100){
                res_img_c = info.bus.img;
            }else{
                res_img_c = info.car.img;
            }
        }
        
        if( co2 >= 10000){
            total_c = co2 / info.city_co2.value;
            img_c = info.city.img;
            res_c=0;
            res_img_c = info.city.img;
            width = null;
        }
        
        this.visualize(
                       total_c,
                       res_c,
                       img_c,
                       res_img_c,
                       co2_selector,
                       width
                       );
        
    },
    
    getOptions : function(){
    
        return {
            
            bottle : {
                img : 'img/SVG/bottle.svg',
                img25 : 'img/SVG/bottle-25.svg',
                img50 : 'img/SVG/bottle-50.svg',
                img75 : 'img/SVG/bottle-75.svg',
                value: 1.5
            },
            bucket : {
                img : 'img/SVG/bucket.svg',
                img25 : 'img/SVG/bucket-25.svg',
                img50 : 'img/SVG/bucket-50.svg',
                img75 : 'img/SVG/bucket-75.svg',
                value: 40
            },
            pool: {
                img : 'img/SVG/pool.svg',
                value: 10000
            },
            bulb: {
                img : 'img/SVG/light-bulb.svg',
                value: 30
            },
            city :{
                img : 'img/SVG/city.svg',
                value: 1000000
            },
            home :{
                img: 'img/SVG/home-energy.svg',
                value: 100000
            },
            car : {
                img : 'img/SVG/car-emissions.svg',
                value: 3600
            },
            bus : {
                img : 'img/SVG/bus-emissions.svg',
                value: 6600
            },
            city_co2 :{
                img : 'img/SVG/city.svg',
                value: 50000
            }
            
        };
    
    }
    
};
