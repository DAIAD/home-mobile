var budgetWidget = function(element,control,param) {
    
    this.param = param;
    this.dimension = param.dimension;
    this.text = param.text;
    this.width = param.width;
    this.info = param.info;
    this.fontsize = param.fontsize;
    this.percent = param.percent;
    this.fgcolor = param.fgcolor;
    this.bgcolor = param.bgcolor;
    this.marginleft = param.marginleft;
    this.bordersize = param.bordersize;
    this.control = control;
    this.element = element;
    
    this.template = '<div id="'+this.control+'" data-dimension="'+this.dimension+'" data-bordersize="'+this.bordersize+'" data-text="'+this.text+'" data-width='+this.width+' data-info="'+this.info+'" data-fontsize="'+this.fontsize+'" data-percent="'+this.percent+'" data-fgcolor='+this.fgcolor+' data-bgcolor='+this.bgcolor+' style="margin-left:'+this.marginleft+'%;"></div>';
    
    this.element.empty().html( this.template );
    
    $('#' + this.control).empty().circliful();
    
};

