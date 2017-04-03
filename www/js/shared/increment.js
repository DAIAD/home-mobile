var component = function(){};

component.prototype = {
    
    increment : function(min,max,label){
        
        return ' <div class="list-block inputFields" style="margin-bottom:2%;"> \
                    <div class="myforms"> \
                        <p class="plusIncremenet"><img src="img/SVG/add.svg" style="width: 10%;"></p> \
                            <input type="text" id="increment" name="increment" min="'+min+'" max="'+max+'" value="'+min+' '+label+'" data-role="none" style="width: 50%;margin-left:25%;background:white;"/> \
                        <p class="minusIncremenet"><img src="img/SVG/remove.svg" style="width: 10%;"></p> \
                    </div> \
                </div>';
        
    },
    swiper : function(img,title){
    
        return ' <div class="swiper-slide "> \
                    <div class="swiper-text" ><span>'+img+'</span> \
                        <span> \
                            <div class="item-title">'+title+'</div> \
                        </span> \
                    </div> \
                </div>';
    
    },
    footer : function(){
    
        return '<div class="toolbar-inner"> \
                    <a href="#dashboard" class="tab-link" style="margin-left:-10px;"><i class="icon demo-icon-1"></i></a> \
                    <a href="#consumption"class="tab-link " ><i class="icon demo-icon-2"></i></a> \
                    <a href="#socials" class="tab-link socials" ><i class="icon demo-icon-5"></i></a> \
                    <a href="#messaging"  class="tab-link mynotif"><span class="notification-counter"></span><i class="icon demo-icon-3"></i> </a> \
                    <a href="#Account"  class="tab-link " style="margin-right:-10px;"  ><i class="icon demo-icon-4"></i></a> \
                </div>';
    
    },
    header : function(){
        
        return ' <div class="navbar-inner"> \
                    <div class="left"> \
                        <a onclick="openPanel()" > \
                            <img src="img/SVG/menu.svg"> \
                        </a> \
                    </div> \
                    <div class="center" style="margin-top: 30px;"> \
                        <img src="img/SVG/daiad-logo2.svg" > \
                    </div> \
                    <div class="right dash2dev" > \
                        <p class="NumberOfDevices"></p><img src="img/SVG/amphiro_small.svg" > \
                    </div> \
                </div> \
        ';
    
    },
    
};
