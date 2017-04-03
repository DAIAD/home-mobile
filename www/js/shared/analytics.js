
!function(name,path,ctx){
    var latest,prev=name!=='Keen'&&window.Keen?window.Keen:false;ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;latest=w.Keen;if(prev){w.Keen=prev}else{try{delete w.Keen}catch(e){w.Keen=void 0}}ctx[name]=latest;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.insertBefore(s,h)}}
}('KeenAsync','https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.0.3.min.js',this);

KeenAsync.ready(function(){
                // Configure a client instance
                keenClient = new KeenAsync({
                                           projectId: '58087dab8db53dfda8a74e3c',
                                           writeKey: '4F75E44512659DAFF4B0B18081CEB24D525F16C21288301AF0925865FD00EEB14C5C64220178C2617FF22BF9479A17B2A78BAEDE56F143BA734C9B8A0D8CD2DAFBF31C1228774508792018B23D631EA5B59B457C8C76508C092652DE42B7FF2F'
                                           });
                                
                             
                              
                
                });
