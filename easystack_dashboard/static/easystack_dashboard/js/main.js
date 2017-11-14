//main.js 存储空间
var mainSpace = {};
/*
* jQuery Cookie Plugin
* https://github.com/carhartl/jquery-cookie
*/
(function($) {
$.cookie = function(key, value, options) {
        // key and at least value given, set cookie...
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);                        

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
	};
})(jQuery);

//去重
Array.prototype.unique = function(){
	var res = [];
	var json = {};
	for(var i = 0; i < this.length; i++){
		if(!json[this[i]]){
			res.push(this[i]);
			json[this[i]] = 1;
		}
	}
	return res;	
}
//最大值
Array.prototype.max = function(){   
	return Math.max.apply({},this); 
} 
//取数值最小值
Array.min = function(array){
	return Math.min.apply(Math,array);
} 

/*
** 注册虚机
** @author Xu XinWei
** @date 2014-07-11
*/
//详情
var detFn	= (function(){
	$(document).on("click", ".js-detBtn", function(){
		var _this = $(this);
		detJson.detBtnFn(_this);
	});
	
	var detJson	= {
		detBtnFn: function(_this){
			if(typeof _this.attr('ibtn') === 'undefined' ||  _this.attr('ibtn') === 'false'){
				this.w				= $('.js-detWrap').width();										//配置详情宽度
				this.windPaneWidth	= $('.windPane').width();										//弹窗宽度
				this.windowWidth		= $(window).width();										//窗口宽度
				this.meanWidth		= (this.windowWidth - this.windPaneWidth)/2 + this.w/2;
				
				_this.attr('ibtn',true);
				_this.addClass('detBtn_s');
				this.detSlide(this.w);
			}
			else{
				this.w	= 0;
				this.meanWidth		= (this.windowWidth - this.windPaneWidth)/2;
				_this.removeClass('detBtn_s');
				_this.attr('ibtn',false);
				this.detSlide(this.w);
			}					
		},
		detSlide: function(w){			
			$('.js-detWrap').stop();
			$('.js-detWrap').animate({
				left: -w	
			},400);	
			
			$('.windPane').stop();
			$('.windPane').animate({
				left: this.meanWidth	
			},400);	
		}
	};
	
	return detJson;
})(jQuery);

//滑动 1:表示下一步,0:表示上一步
var slideFn	= (function($){
	var This	= null;	
	$(document).on("click", ".js-next", function(){
		This	= $(this);
		monomer.slide($(this).attr('index'),1);
	});	
	$(document).on("click", ".js-up", function(){
		This	= $(this);
		monomer.slide($(this).attr('index'),0);
	});	
	
	var monomer	= {
		slide: function(i,n){
			//配置详情赋值--推荐主机类型
			if(i === '0' && !This.attr('bt')){
				This.attr('bt',1);
				fullHideVal.serverType($('.js-navWrap li').eq(0).html(),$('.js-custom').eq(0).find('li p').eq(0).html(),$('.js-custom').eq(1).find('li p').eq(0).html());
			}
			//配置详情赋值--network
			if(i === '1' && !This.attr('nw')){
				This.attr('nw',1);
				fullHideVal.networkFull($('#js-netWorkVal li').eq(0).attr('val'));				
			}
			//配置详情赋值---主机名称/数量
			if(i === '2'){			
				fullHideVal.instance();
				billingAdmin.virtual($('#js-setCount').val());				//虚机计费
			}
			//判断在第1步 并且是点击下一步并且详情box未出来的情况下
			if(i==0 && n && parseInt($('.js-detWrap').css('left')) >= 0){
				detFn.detBtnFn($('.js-detBtn'));							//详情方法
			}
			
			billingAdmin.virtual();											//虚机计费
			
			var w	= $('.stepMain').children().width();
			var s	= n ? parseInt(i)+1 : parseInt(i)-1;
			$('.stepMain').stop();
			$('.stepMain').animate({
				left: -w*s	
			},400);
			
			//设置step
			if(n){
				$('.js-stepList').removeClass('select');
				$('.js-stepList').eq(i).addClass('selected');
				$('.js-stepList').eq(s).addClass('select');
			}
			else{
				$('.js-stepList').removeClass('select');
				$('.js-stepList').eq(s).removeClass('selected');
				$('.js-stepList').eq(s).addClass('select');
			}
			//创建虚机基础网络/私有网络 下一步按钮显示
			if(i === '1' && n === 1){
				var aLi	= $('.js-stepSubTwo li');
				for(var k=0; k<aLi.length; k++){
					if(aLi.eq(k).attr('class') === 'select'){
						$('.js-nextSign').hide();
						$('.js-next').show();
					}
				}
			}	
		}
		
	};
})(jQuery);

//第一步隐藏域赋值/网络隐藏域赋值/推荐主机类型详情/启动源详情赋值
var fullHideVal = (function($){
	var idVal	= { 
		//第一步隐藏域赋值
		full: function(hideId,valId){
			$("#" + hideId).val($("#"+valId + " li").eq(0).attr('id'));			
		},		
		clickFull: function(hideId,val,name){
			$("#" + hideId).val(val);
			$("#js-details-launch").html(name);	//配置详情启动源赋值
		},
		//推荐主机类型详情
		serverType: function(type,cpu,mey){
			$('#js-details-server').html(type);
			//判断点击内存就不进行赋值
			if(cpu !== 'none'){
				$('#js-details-cpu').html(cpu);
			}			
			$('#js-details-mey').html(mey);
		},
		//启动源详情赋值
		detLaunchFull: function(id){
			$("#js-details-launch").html($("#"+id + " li").eq(0).attr('val'));	//配置详情启动源赋值
		},
		//配置详情--network赋值
		networkFull: function(name){
			$('#js-details-netWork').html(name);
		},		
		//配置详情主机名称/数量赋值
		instance: function(){
			$('#js-details-name').html($("#js-setName").val());
			$('#js-details-count').html($("#js-setCount").val());
		}
	};
	return idVal;	
})(jQuery);

//注册虚机在镜像/云硬盘启动，选中当前传过来id相对应选项
(function($){
	var iNow	= null;
	$(document).on("click", ".btn-launch", function(){
		var id = $(this).attr("href").split("=")[1];
		clearInterval(iNow);
		
		if(!id){
			return false;
		}		
		
		iNow = setInterval(function(){	
			var leng	= $('.js-stepSub li').length;
			$.each($('.js-stepSub li'),function(i,n){									
				if($('.js-stepSub li').eq(i).attr('id') === id){
					$('.js-stepSub li').removeClass("select");
					$('.js-stepSub li').eq(i).addClass("select");
					$('#js-stepOneVal').val(id);
					$("#js-details-launch").html($('.js-stepSub li').eq(i).attr("val"));		
					
					var pTop		= $('.js-stepSub li').eq(i).position();
					var parentUl	= $('.js-stepSub li').eq(i).parent();
					var liH			= $('.js-stepSub li').eq(i).height();
					if((pTop.top+liH) - parentUl.parent().height()+10 >= liH){
						scrollBar.selectMove($('.js-stepSub li').eq(i).parent().parent().parent().attr("index") , pTop.top+liH+12 - parentUl.parent().height());
					}					
					
					clearInterval(iNow);
				}
				//如果li都遍历完成就销毁定时器
				if(i == leng){
					clearInterval(iNow);
				}
			});
			
		},30);		
		
	});
})(jQuery);

//选择
(function($){
	$(document).on("click", ".js-stepSub li", function(){	
		$('.js-stepSub li').removeClass('select');
		$(this).addClass('select');
		
		//镜像隐藏域赋值
		fullHideVal.clickFull("js-stepOneVal",$(this).attr('id'),$(this).attr('val'));			//第一步隐藏域赋值
	});
	
	$(document).on("click", ".js-stepSubTwo li", function(){		
		$('.js-stepSubTwo li').removeClass('select');
		$(this).addClass('select');
		
		//基础网络隐藏域赋值--第三步基础网络
		fullHideVal.clickFull("js-stepFourVal",$(this).attr('id'));	
		//配置详情--基础网络/私有网络
		fullHideVal.networkFull($(this).attr('val'));
				
		//创建虚机基础网络/私有网络 下一步按钮显示
		$('.js-nextSign').hide();
		$('.js-next').show();
	});

})(jQuery);

//滚动条
var scrollBar = (function($){
	var disY		= 0;
	var json		= {};
	var T			= 0;
	$(document).on("mouseover", ".js-scrollWrap", function(){
		$(this).find('.js-scrollBar span').stop();
		$(this).find('.js-scrollBar span').animate({ opacity: 0.4 });		
	});
	$(document).on("mouseout", ".js-scrollWrap", function(){
		$(this).find('.js-scrollBar span').stop();
		$(this).find('.js-scrollBar span').animate({ opacity: 0.1 });
	});
	
	$(document).on("mousedown", ".js-scrollBar span", function(event){
		var _this	= $(this);
		var offset 	= _this.offset();
		disY		= event.clientY - offset.top;
		$(document).on('mousemove',function(event){
			var offset 	= _this.parent().offset();
			T			= event.clientY - offset.top - disY;
			scrollBar.moveBar(_this);
			return false;
		});
		
		$(document).on('mouseup',function(){
			$(document).unbind('mousemove');
			$(document).unbind('mouseup');
			window.identification = 1; //用于记录是否再次创建元素
			return false;
		});
		
		return false;
	});
	
	$(document).on("mousewheel DOMMouseScroll", ".js-scrollWrap", function(e){ 
	 	var H			= $(this).height();	
		var h			= $(this).find('ul').height();
		//有滚动条触发滚动
		if(H　<　h){
	    	var delta	= (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); 
			var This	= $(this).find('.js-scrollBar span');		
			if (delta > 0) {
				// 向上滚
				T	= parseInt($(this).find('.js-scrollBar span').css('top')) - 5;
			    scrollBar.moveBar(This);
			} else if (delta < 0) {
				// 向下滚
				T	= Math.abs(parseInt($(this).find('.js-scrollBar span').css('top'))) + 5;
			    scrollBar.moveBar(This);
			}				
			return false;		
		}
	});

	var scrollBar	= {
		//初始化
		init: function(){
			//滚动条HTML
			var el	= '<div class="scrollBar js-scrollBar"><span class="scrollBar-Btn"></span></div>';
			$.each($('.js-scrollWrap'),function(i,n){
				$(".js-scrollWrap").eq(i).attr("index",i);
				//插入滚动条
				if($(".js-scrollWrap").eq(i).find('.js-scrollBar').length === 0){							//如果没有滚动条HTML就插入						
					$('.js-scrollWrap').eq(i).append(el);
				}
			    
				var H			= $('.js-scrollWrap').eq(i).height();	
				var h			= $('.js-scrollWrap').eq(i).find('ul').eq(0).height();
                
				var bf			= H/h;
				var barHeight	= H*bf;
				barHeight = barHeight < 20 ? 20 : barHeight;
				//判断是否显示滚动条
				if(h <= H){
					$('.js-scrollBar span').eq(i).hide();
					//$('.js-scrollWrap ul').css({top: 0});						//无滚动条就把ul的top设置为0
				}
				else{
					$('.js-scrollBar span').eq(i).css({ height: barHeight });
					$('.js-scrollBar span').eq(i).show();
				}
				var l = $('.js-scrollWrap ul').eq(i).find('li.select').html();
				
			});
		},
		//移动
		moveBar: function(_this){
			var H	= _this.parent().parent().height();
			
			if(T <= 0){
				T = 0;
			}
			if(T >= (H - _this.height())){
				T = H - _this.height();
			}
			
			var s		= T/(H - _this.height());
			var hg		= _this.parent().parent().find('ul').eq(0).height();
			_this.css('top',T);
			window.scrollBarBtnTop = T; //记录滚动条的top
			_this.parent().parent().find('ul').eq(0).css({ top: -s*(hg-H) });
		},
		selectMove: function(index,top){
			$(".js-scrollWrap").eq(index).find('ul').eq(0).css("top",-top);
			var s	= $(".js-scrollWrap").eq(index).height()/$(".js-scrollWrap").eq(index).find('ul').eq(0).height();
			$(".js-scrollWrap").eq(index).find('.js-scrollBar span').css("top",top*s);
			document.title = -top;
		}	
	};
	
	return scrollBar;
		
})(jQuery);

//默认类型滑动
var defNav = (function($){
	$(document).on("click", ".js-navWrap li", function(){
		var _this		= $(this);
		if(_this.index() != ($('.js-navWrap li').length-2)){			//自定义不绑定事件
			nav.move(_this);
			//推荐类型
			typeSelect.defaultType(_this.index());
			billingAdmin.virtual();										//虚机计费
		}
	});
	
	var nav	= {
		move: function(_this){
			var offset	= _this.offset();
			var offsetP	= _this.parent().offset();
			var	L		= offset.left - offsetP.left;
			_this.parent().find('.js-runBtn').animate({
				left: L,	
				width: _this.width()
			},200);
		}	
	};
	
	return nav;	
	
})(jQuery);

//推荐类型
var typeSelect	= (function($){
	var arr			= [];									//所有span的left差值	
	//点击cpu
	$(document).on("click", ".js-custom_rectWrap", function(event){
		var _this	= $(this);
		var cliX 	= event.clientX;
		var aSpan	= _this.parent().find('ul li span');
		arr			= [];
		
		$.each(aSpan,function(i,n){
			var spanOffset	= _this.parent().find('ul li span').eq(i).offset();
			arr.push(Math.abs(cliX - spanOffset.left));
		});
		
		for(var i=0; i<arr.length; i++){
			if(arr[i] == Array.min(arr)){
				selectFn.defaultTypeTwo(i);
			}
		}
		//自定义类型按钮
		defNav.move($('.js-navWrap li').eq(9));
		billingAdmin.virtual();										//虚机计费
	});
	//点击内存
	$(document).on("click", ".js-custom_rect", function(event){
		var _this	= $(this);
		var cliX 	= event.clientX;
		var aSpan	= _this.parent().find('ul li span');
		arr			= [];
		
		$.each(aSpan,function(i,n){
			var spanOffset	= _this.parent().find('ul li span').eq(i).offset();
			arr.push(Math.abs(cliX - spanOffset.left));
		});
		
		for(var i=0; i<arr.length; i++){
			if(arr[i] == Array.min(arr)){
				selectFn.defaultTypeThree(i);
			}
		}	
		//自定义类型按钮
		defNav.move($('.js-navWrap li').eq(9));	
		billingAdmin.virtual();										//虚机计费								   
	});
	//点击磁盘
	$(document).on("click", ".js-custom_rectDisk", function(event){
		var _this	= $(this);
		var cliX 	= event.clientX;
		var aSpan	= _this.parent().find('ul li span');
		arr			= [];
		
		$.each(aSpan,function(i,n){
			var spanOffset	= _this.parent().find('ul li span').eq(i).offset();
			arr.push(Math.abs(cliX - spanOffset.left));
		});
		
		for(var i=0; i<arr.length; i++){
			if(arr[i] == Array.min(arr)){
				selectFn.defaultTypeDisk(i);
			}
		}
		//自定义类型按钮
		//defNav.move($('.js-navWrap li').eq(9));
	});
	//拖拽cpu游标
	$(document).on("mousedown", ".js-customBtn", function(event){
		var _this		= $(this);
		var offsetBtn	= _this.offset();
		var disX		= event.clientX - offsetBtn.left;
		
		var parentOffset	= _this.parent().offset();
		var aBar			= _this.parent().find('.js-bar')
		var barOffset		= aBar.offset();
		
		$(document).on('mousemove',function(event){
			var L	= event.clientX - parentOffset.left - disX;
			
			if(L <= barOffset.left - parentOffset.left){ 
				L	= barOffset.left - parentOffset.left;
			}
			if(L >= barOffset.left - parentOffset.left + aBar.width() - _this.width()){
				L	= barOffset.left - parentOffset.left + aBar.width() - _this.width();
			}
			_this.css({ left: L });
		});
		
		$(document).on('mouseup',function(event){
			$(document).unbind('mousemove');
			$(document).unbind('mouseup');
			
			var cliX 	= event.clientX;
			if(cliX <= barOffset.left){
				cliX	= barOffset.left;
			}
			if(cliX >= barOffset.left + aBar.width()){
				cliX	= barOffset.left + aBar.width();
			}

			arr			= [];
			$.each(_this.parent().find('ul li span'),function(i,n){
				var spanOffset	= _this.parent().find('ul li span').eq(i).offset();
				arr.push(Math.abs(cliX - spanOffset.left));
			});
			 
			for(var i=0; i<arr.length; i++){
				if(arr[i] == Array.min(arr)){
					if(_this.attr('index') === '0'){
						selectFn.defaultTypeTwo(i);
						//自定义类型按钮			
						defNav.move($('.js-navWrap li').eq(9));	
					}
					else if(_this.attr('index') === '1'){
						selectFn.defaultTypeThree(i);
						//自定义类型按钮			
						defNav.move($('.js-navWrap li').eq(9));
					}
					else{
						selectFn.defaultTypeDisk(i);
					}
				}
			}
			//自定义类型按钮
			defNav.move($('.js-navWrap li').eq(9));		
			billingAdmin.virtual();										//虚机计费
		});
		
		return false;
	});
	
	var defaults = {											//主机配置
			one_0: { a:0,b:0,c:[0,1] },
			one_1: { a:0,b:1,c:[0,1] },
			one_2: { a:1,b:1,c:[0,1] },
			
			one_3: { a:1,b:2,c:[2,4] },
			one_4: { a:2,b:3,c:[2,5] },
			one_5: { a:2,b:4,c:[2,5] },
			
			one_6: { a:3,b:4,c:[4,7] },
			one_7: { a:3,b:5,c:[4,7] },
			one_8: { a:4,b:6,c:[4,7] },
			one_9: { a:0,b:0,c:[0,1] }
	}
	
	var defaultsTwo = {											//主机配置				
			one_0: { b:0,c:[0,1] },
			one_1: { b:1,c:[0,4] },
			one_2: { b:2,c:[2,5] },
			one_3: { b:3,c:[3,7] },
			one_4: { b:4,c:[4,7] }		
	}
	
	var selectFn = {
		
		defaultType: function(num){
			var cpu				= defaults['one_' + num]['a']; 
			var memory			= defaults['one_' + num]['b'];
			
			var defOffset_cpu	= $('.js-custom').eq(0).find('li').eq(0).find('span').offset();
			var defOffset_mey	= $('.js-custom').eq(1).find('li').eq(0).find('span').offset(); 
			
			var offset_cpu 		= $('.js-custom').eq(0).find('li').eq(cpu).find('span').offset();
			var offset_my		= $('.js-custom').eq(1).find('li').eq(memory).find('span').offset();
			
			$('.js-customBtn').eq(0).animate({ left: 34 + offset_cpu.left - defOffset_cpu.left },300);
			$('.js-customBtn').eq(1).animate({ left: 28 + offset_my.left - defOffset_mey.left },300);
			
			var O = defaults['one_' + num]['c'][0];
			var T = defaults['one_' + num]['c'][1];
			
			var meyOffset_start	= $('.js-custom').eq(1).find('li').eq(O).find('span').offset(); 
			var meyOffset_end	= $('.js-custom').eq(1).find('li').eq(T).find('span').offset(); 
			var parentOffset	= $('.js-custom').offset();
			
			$('.js-custom_rect').eq(0).animate({ width: meyOffset_end.left - meyOffset_start.left , left: meyOffset_start.left - parentOffset.left });
			
			//推荐类型隐藏域赋值
			var cpu_val 		= $('.js-custom').eq(0).find('li').eq(cpu).attr('val');
			var memory_val		= $('.js-custom').eq(1).find('li').eq(memory).attr('val');
			$('#js-stepCpuVal').val(cpu_val);
			$('#js-stepMemoryVal').val(memory_val);
			//配置详情赋值
			var sType	= $('.js-navWrap li').eq(num).html();
			var sCPU	= $('.js-custom').eq(0).find('li').eq(cpu).find('p').html();
			var sMey	= $('.js-custom').eq(1).find('li').eq(memory).find('p').html();
			fullHideVal.serverType(sType,sCPU,sMey);
		},
		defaultTypeTwo: function(num){
			var memory			= defaultsTwo['one_' + num]['b'];
			
			var defOffset_cpu	= $('.js-custom').eq(0).find('li span').eq(0).offset();
			var offset_cpu 		= $('.js-custom').eq(0).find('li span').eq(num).offset();
			
			var defOffset_mey	= $('.js-custom').eq(1).find('li span').eq(0).offset(); 
			var offset_my		= $('.js-custom').eq(1).find('li span').eq(memory).offset();
			
			$('.js-customBtn').eq(0).animate({ left: 34 + offset_cpu.left - defOffset_cpu.left },300);
			$('.js-customBtn').eq(1).animate({ left: 28 + offset_my.left - defOffset_mey.left },300);
			
			var O = defaultsTwo['one_' + num]['c'][0];
			var T = defaultsTwo['one_' + num]['c'][1];
			
			var meyOffset_start	= $('.js-custom').eq(1).find('li span').eq(O).offset(); 
			var meyOffset_end	= $('.js-custom').eq(1).find('li span').eq(T).offset(); 
			var parentOffset	= $('.js-custom').offset();
			
			$('.js-custom_rect').eq(0).animate({ width: meyOffset_end.left - meyOffset_start.left , left: meyOffset_start.left - parentOffset.left });
		
			//自定义类型隐藏域赋值
			var cpu_val 		= $('.js-custom').eq(0).find('li').eq(num).attr('val');
			var memory_val		= $('.js-custom').eq(1).find('li').eq(memory).attr('val');
			$('#js-stepCpuVal').val(cpu_val);
			$('#js-stepMemoryVal').val(memory_val);
			//配置详情赋值
			var sType	= $('.js-navWrap li').eq(9).html();
			var sCPU	= $('.js-custom').eq(0).find('li').eq(num).find('p').html();
			var sMey	= $('.js-custom').eq(1).find('li').eq(memory).find('p').html();
			fullHideVal.serverType(sType,sCPU,sMey);
		},
		defaultTypeThree: function(num){
			
			var defOffset_mey	= $('.js-custom').eq(1).find('li span').eq(0).offset(); 
			var offset_my		= $('.js-custom').eq(1).find('li span').eq(num).offset();
			
			$('.js-customBtn').eq(1).animate({ left: 28 + offset_my.left - defOffset_mey.left },300);
			
			//自定义类型隐藏域赋值
			var memory_val		= $('.js-custom').eq(1).find('li').eq(num).attr('val');
			$('#js-stepMemoryVal').val(memory_val);
			//配置详情赋值
			var sType	= $('.js-navWrap li').eq(9).html();
			var sCPU	= 'none';
			var sMey	= $('.js-custom').eq(1).find('li').eq(num).find('p').html();
			fullHideVal.serverType(sType,sCPU,sMey);
		},
		defaultTypeDisk: function(num){			
			var defOffset_mey	= $('.js-custom').eq(2).find('li span').eq(0).offset(); 
			var offset_my		= $('.js-custom').eq(2).find('li span').eq(num).offset();
			
			$('.js-customBtn').eq(2).animate({ left: 19 + offset_my.left - defOffset_mey.left },300);
			
			//自定义类型隐藏域赋值
			var disk_val		= $('.js-custom').eq(2).find('li').eq(num).attr('val');
			$('#js-stepDiskVal').val(disk_val);
		}		
	};
	
	return selectFn;
	
})(jQuery);

//创建主机--登录信息
(function($){
	
	$(document).on("click", ".js-radioOne", function(){
		$('.js-radioOne').removeClass('radio_one_s');
		$('.js-rad').hide();
		$(this).addClass('radio_one_s');
			
		$('.js-rad').eq($(this).attr('index')).fadeIn('show');
		if($(this).attr('index') == 0){
		    $('.js-rad').has('#js-password-yes').fadeIn('show');
		    $("#keypair").removeAttr('name');
		    $("#js-password").attr('name','password');
		}else{
		    $('.js-rad').has('#js-password-yes').fadeOut('show');
		    $("#keypair").attr('name','keypair_id');
		    $("#js-password").removeAttr('name');
		}
	});
		
})(jQuery);

/*
** 创建虚机主机名称校验
** @author Xu XinWei
** @date 2014-05-19
*/
(function($){
  var val,iNum = null;
  //$(document).on("blur", "#js-setName", isVal);
  
  $(document).on("contextmenu", ".stepInner", function(){
    return false;
  });
  document.onkeyup = saveFn;
  
  /*function isVal(){
    val = $.trim($(this).val());
    if(val.length < 1){
      $(this).parent().children('.js-isVal').css('display','inline-block');
    }
    else{
      $(this).parent().children('.js-isVal').css('display','none');
    }
    saveFn();
  }*/
  
  function saveFn(){
    var val = $.trim($('#js-setName').val());
    var iNum = $.trim($('#js-setCount').val());
    var pw 		= $("#js-password").val();			//密码 
    var rePw	= $("#js-password-yes").val();		//重复密码
    $('#js-details-name').html(val);
    
	if(parseInt(iNum) != iNum && iNum > 1){
		$('#js-setCount').val(Math.round(iNum));
		iNum	= Math.round(iNum);
	}
	else if(iNum <= 0){
		$('#js-setCount').val('');
		iNum	= '';
	}
	else if(!parseInt(iNum)){
		$('#js-setCount').val('');
		iNum	= '';
	}
	else{
		$('#js-setCount').val(parseInt(iNum));
		iNum	= parseInt(iNum);
	}
	$('#js-details-count').html(iNum);	
	billingAdmin.virtual(iNum);										//虚机计费			
	
	if(iNum > 0){
		$("#js-setCount").parent().children('.js-isVal').css('display','none');
	}
	else{
		$("#js-setCount").parent().children('.js-isVal').css('display','inline-block');
	}
	if($("#js-setName").length){
	if($("#js-setName").val().length>0){
		$("#js-setName").parent().children('.js-isVal').css('display','none');
	}
	else{
		$("#js-setName").parent().children('.js-isVal').css('display','inline-block');
	}}
	
    if(val.length >= 1 && iNum > 0 && pw === rePw){     
      $('#js-notSave').css('display','none');     
      if(!document.getElementById('js-save')){
      	$('#js-notSave').after('<input id="js-save" type="submit" class="btn_3 mr10 mt10 fr" style="display:none;" value="">');
      	$('#js-save').val($("#js-submitName").html());
      	$('#js-save').css('display','block');
      }     
    }
    else{
      $('#js-notSave').css('display','block');
      $('#js-save').remove();     
    }
          
  }
})(jQuery);

/*password*/
(function($){
	var arrMsg = [];
	var tmpValPassValue;
	$(document).on("input", "#js-password", function(){
	    tmpValPassValue = $(this).val();
		//定义对应的消息提示
		if(!arrMsg.length)
		{
			var aMessage = $('#js-passmessage').children();
			for(var i=0; i<aMessage.length; i++){
				arrMsg.push(aMessage[i].innerHTML);
			}
		}
		
		chkpwd($('#js-password'));
		checkPass($(this).val(), $('#js-password-yes').val());
	});
	
	function chkpwd(obj){
		var t = obj.val();
		var index = getResult(t);
		if(!t){$('#js-chkResult').find('em').html('');}
		//定义颜色值
		var aColor = ['blue','green','red'];
		$('#js-chkResult').css("color",aColor[index]);
		$('#js-chkResult').find('em').html(arrMsg[index&&index-1]);
		$('#js-chkResult').find('span').css('backgroundPosition',-(index&&index-1)*80);
	}

	//定义检测函数,返回0/1/2/3分别代表无效/差/一般/强
	function getResult(s){
		if(!s.length){
			return false;
		}
		var count = 0;
		if (s.match(/[0-9]/g)){
			count++;
		}
		if (s.match(/[a-z]/ig)){
			count++;
		}
	 	if (s.match(/(.[^a-z0-9])/ig)){
			count++;
		}
		if (!s.length && count > 0){
			count--;
		}
		return count
	}
	
	$(document).on("input click", "#js-password-yes", function(){
	    checkPass(tmpValPassValue, $(this).val());
	    return false;
	});
	//防止用户不填写确定密码
	$(document).click(function(){
        if($('#js-password').val() && !$('#js-password-yes').val()){
            $('#js-chkResult-yes').css('backgroundPosition','left -16px');
        }
    });
    //监听密码是否一致
	function checkPass(){
	    if(arguments[0] && arguments[1]){
	        if(arguments[0] == arguments[1]){
                $("#js-chkResult-yes").css('backgroundPosition','left 10px');
            }else{
                $("#js-chkResult-yes").css('backgroundPosition','left -16px');
            }
	    }else{
	        $("#js-chkResult-yes").css('backgroundPosition','left -100px');
	    }
	}
	
})(jQuery);


/*
** 全局管理/项目管理--首页右边元素宽度自适应/详情素宽度自适应
** @author Xu XinWei
** @date 2014-3-10
*/
var windowResize = (function($){
  //全局管理首页--右边元素宽度自适应
  var getWidth = (function getWidth(){	
    var iWidth		= $(window).width() - $("#js-leftPane").width()-20;		//右侧宽度
    var aVir		= $('.js-virtual');
    var aLen		= [];
    for(var i=0,len=aVir.length; i<len; i++ ){
    	aLen.push($('.js-virtual').eq(i).find('li').length);
    } 
    var iLen		= iWidth/aLen.max();  
    iLen			= iLen<=140 ? 140 : iLen;  
	$('.js-virtual li').css({ width: iLen });
	return getWidth;
  })();
  
  //项目管理首页--右边元素宽度自适应
  var itemWidth = (function itemWidth(){
  	var iWidth		= $(window).width() - $("#js-leftPane").width()-22 - $('#js-quick').width();		//右侧宽度
  	$('#resourceUl').css({width: iWidth});
  	var aLi			= $("#resourceUl li");
  	for(var i=0,len=aLi.length; i<len; i++ ){
  		aLi.eq(i).css({ width: "20%" });
  		if(aLi.eq(i).width() <= 140){
  			aLi.eq(i).css({ width: 140 });
  		}
  	}
  	return itemWidth;
  })();
  
  //首页图表/log自适应
  var logWidth = (function logWidth(){
		var iWidth		= $(window).width() - $('#js-leftPane').width() - 10;
		var s			= iWidth - 480;
		var w			= 0;								//图表父级宽度
		var defWidth	= 276;								//图表默认宽度
		$('.useRateWarp').css({ width: iWidth });
		if(s < defWidth*3 && s > defWidth*2){
			w = defWidth*2;
		}
		else if(s < defWidth*2){
			w = defWidth;
		}
		else{
			w = defWidth*3;	
		}
		$('.indexChartWrap').css({width: w});
		$('.indexLog').css({width: iWidth - w - 20});
		
		scrollBar.init();									//滚动条函数
		$('.indexChart_list').css({ top: 0 });				//首页图表top=0
		$('.indexChartWrap .scrollBar-Btn').css({ top: 0 });//首页图表滚动条btn top=0
		
		return logWidth;
  })();
  
  //overview背景高度
  var documentHeight = document.body.scrollHeight;
  var clientHeight	 = $(window).height();
  var H				 = documentHeight > clientHeight ? documentHeight : clientHeight;
  $(".overviewWarp").css({height: H-$(".topPane").height()});
  
  $(window).bind("resize", function(){						//浏览器大小改变触发
    getWidth();												//全局管理首页
    itemWidth();											//项目管理首页	
    logWidth();												//首页图表log自适应
  });

  //详情自适应
  (function(){
  	var h	= $('.detailTable').height();
  	$('.detailTable-content').css({ height: h });
  })();
  
  //全局管理---硬件资源/虚拟化资源 字体大小
  function setFontSize(){
	$.each($(".js-fontSize li i") , function(i,n){
		if($(".js-fontSize li i").eq(i).width() >= parseInt($(".js-fontSize li span").width())){
			var iSize = parseInt($(".js-fontSize li i").eq(i).css('fontSize'));
			$(".js-fontSize li i").eq(i).css('fontSize',iSize-2);
			setFontSize();
		}			
	});	
  };
	
  return { itemWidth: itemWidth , logWidth: logWidth , setFontSize: setFontSize };
})(jQuery);

/*
** 首页转盘
** @author Xu XinWei
** @date 2014-3-20
*/
function PaperRate(id){
  this.percent 	= 0;
  this.paper 	= Raphael(id, 114, 114);
  this.id		= id;
}
PaperRate.prototype = {
  i: 0,
  timer: null,
  //初始化Raphael画布
  init: function(){   
		//需要注意，下面的算法不支持画100%，要按99.99%来画	   
	    this.percent < this.i ? this.percent += 0.01 : clearInterval(this.timer);    
	    var drawPercent = this.percent >= 1 ? 0.9999 : this.percent;
	    
	    //r1是内圆半径，r2是外圆半径
	    var r1 = 47, r2 = 55, PI = Math.PI,
	        p1 = { x: 56, y: 112 },
	        p4 = { x: p1.x, y: p1.y - r2 + r1 },
	        p2 = {
	            x: p1.x + r2 * Math.sin(2 * PI * (1 - drawPercent)),
	            y: p1.y - r2 + r2 * Math.cos(2 * PI * (1 - drawPercent))
	        },
	        p3 = {
	            x: p4.x + r1 * Math.sin(2 * PI * (1 - drawPercent)),
	            y: p4.y - r1 + r1 * Math.cos(2 * PI * (1 - drawPercent))
	        },
	        path = [
	            'M', p1.x, ' ', p1.y,
	            'A', r2, ' ', r2, ' 0 ', this.percent > 0.5 ? 1 : 0, ' 1 ', p2.x, ' ', p2.y,
	            'L', p3.x, ' ', p3.y,
	            'A', r1, ' ', r1, ' 0 ', this.percent > 0.5 ? 1 : 0, ' 0 ', p4.x, ' ', p4.y,
	            'Z'
	        ].join('');
	
	       	this.paper.clear();										//清空画布

	    //用path方法画图形，由两段圆弧和两条直线组成，画弧线的算法见后
	    if(this.percent>=0.8){
	          this.paper.path(path).attr({"stroke-width":0, "fill":"90-#db5012-#db5012"});  	//填充渐变色，从#3f0b3f到#ff66ff
	      	  $('#'+this.id+'_img'+' img').attr('src',$('#'+this.id+'_img'+' img').attr('_src')+'/three.png');
	    }
	    else{
	      	  this.paper.path(path).attr({"stroke-width":0,"fill":"90-#73ba37-#73ba37"});  	//填充渐变色，从#3f0b3f到#ff66ff
	    }
		/*var arrs	= (this.setVal+'').split(".");
		var num		= arrs.length > 1 ? this.i*this.n : this.setVal;			

		var arrNum	= (num+'').split("."); 
    
	    if(arrNum.length > 1){
	    	num = num.toFixed(1);
	    }	   
	    $('#'+this.id+'_s').html(num);
	    */
    },
    
    set: function(i,n){
    	this.n 		= n;
    	this.setVal = i;
    	var _this 	= this;
    	this.i 		= i/this.n; 
	    if ( n == 'Unlimited' ){
	    	this.n = i == 0 ? 10 : i*10;	      
	    }
    	     	
    	this.timer 	= setInterval(function(){
	      	_this.init();
	    }, 20);
	}
};

/*
** 返回上一级
** @author Xu XinWei
** @date 2014-6-17
*/
(function($){
	$('.js-bkBtn').bind('mouseover',function(){
		$(this).siblings('.js-bkBtn').stop();
		$(this).siblings('.js-bkTips').stop();
		
		$(this).animate({
			opacity: '1'
		}, 200);
		
		$(this).siblings('.js-bkTips').css("display","block");
		
		$(this).siblings('.js-bkTips').animate({
			opacity: '1'
		}, 200);
	});
	$('.js-bkBtn').bind('mouseout',function(){
		var _this	= $(this);
		$(this).siblings('.js-bkBtn').stop();
		$(this).siblings('.js-bkTips').stop();
		
		$(this).animate({
			opacity: '0.5'
		}, 200);
		
		$(this).siblings('.js-bkTips').animate({
			opacity: '0'
		}, 200,function(){_this.siblings('.js-bkTips').css("display","none");});
	});
})(jQuery);

/*
** 左侧导航
** @author Xu XinWei
** @date 2014-6-17
*/
(function($){
	
	 $.each($('#js-leftPane .js-NavTitle'),function(i,n){
		$(this).attr('index',i);
		
		if($.cookie('es_navTitle_'+i)){
			var es_nav	= $.cookie('es_navTitle_'+i).split(',');			
		}

	 });
	
	$('#js-leftPane .js-NavTitle').bind('click',function(){
		$(this).next('.js-list_warp').animate({
	   		height: 'toggle', 
	   		opacity: 'toggle'
		}, 300);		
		
		if($.cookie('es_navTitle_' + $(this).attr('index'))){
			var es	= $.cookie('es_navTitle_' + $(this).attr('index')).split(',');
			if(es[1] == 1){				
				$.cookie('es_navTitle_' + $(this).attr('index') , $(this).attr('index')+ ',2' , { expires: 70000, path: '/' } );
			}
			if(es[1] == 2){				
				$.cookie('es_navTitle_' + $(this).attr('index') , $(this).attr('index')+ ',1', { expires: 70000, path: '/'} );
			}
		}
		else{
			$.cookie('es_navTitle_' + $(this).attr('index') , $(this).attr('index')+ ',2', { expires: 70000, path: '/' } );	
		}		
		
	});	
			
})(jQuery);

/*
** 左侧导航项目列表伸缩
** @author Xu XinWei
** @date 2014-6-21
*/
(function($){
	var let		 = 200;
	var ibtn	 = 1;
	var dfHeight = 350;
	$('#js-proj').bind('click',function(event){
		var projWrap 	= $('#js-proj_wrap');
		var h 			= projWrap.find('ul').height();
		h > dfHeight ? projWrap.css({ height: dfHeight }) : projWrap.css({ height: h });
		scrollBar.init();								//滚动条
		
		$('#js-proj_wrap').stop();
		ibtn = ibtn == 1 ? 2 : 1;
		let = ibtn == 2 ? 200 : -20; //let = ibtn == 2 ? 200 : 40;
		$('#js-proj_wrap').animate({ left: let }, 120);
		event.stopPropagation();
	});	
	
	$(document).bind('click',function(){
		$('#js-proj_wrap').stop();
		$('#js-proj_wrap').animate({ left: -20 }, 120);//animate({ left: 40 }, 120);
		ibtn	= 1;
	});
})(jQuery);

/*
** 首页快捷方式
** @author Xu XinWei
** @date 2014-6-26
*/
(function($){
	
	$('#js-quick li').bind('mouseover',function(){
		var _this	= $(this).children('a');				
		_this.stop();
		_this.animate({
			
			opacity: 1
			
		},300);
	});
	
	$('#js-quick li').bind('mouseout',function(){
		var _this	= $(this).children('a');
		_this.stop();
		_this.animate({
			
			opacity: 0.4
			
		},300);
	});
	
})(jQuery);

/*
** 模拟下拉菜单
** @author Xu XinWei
** @date 2014-6-30
*/
var selectFn = (function($){
	var iNow	= null;
	var _this	= null;
	var self	= null;
	var zIndex	= 30;
	var bBack   = true;
	
	//初始化赋值
	var init = {
		setVal: function(){
			var selet	= $('.js-selectWrap');			
			for(var i=0; i<selet.length; i++){				
				var v	= $('.js-selectWrap').eq(i).find("select option:selected").text();			
				$('.js-selectWrap').eq(i).find('.js-selt_val').html(v);
				rowFn(selet.eq(i));											//input显示隐藏
				$('.js-pos').eq(i).addClass('js-scrollWrap');				//添加滚动条classNames
			}		
		}
	}
	
	//点击下拉菜单
	$(document).on("click", ".js-selectWrap", function(){
	    if(bBack){
	       var This    = $(this);
            self        = This;
            $('.js-selectWrap').children('.js-pos').hide();                                   
            clearInterval(iNow);                                      
            $(this).children('.js-pos').stop();
            getVal(This);                                       //取数据
            $(this).children('.js-pos').show();
            //设置下拉菜单的高度与滚动条相关
            $('.js-selectWrap').children('.js-pos').css("height","");   
            var iH      = This.find('.js-pos').height();
            var ih      = This.find('ul').height();
            if(ih <= iH){
                This.find('.js-pos').css("height",ih);
            }
            else{
                This.find('.js-pos').css("height",iH);
            }
            
            $('.js-selectWrap').css('zIndex',zIndex);
            This.css('zIndex',zIndex+10);
            scrollBar.init();                                   //滚动条函数
	    }else{
	        _this  = $(this);
	        clearInterval(iNow);
            iNow    = setInterval(setHide,200);
	    }
	    bBack = !bBack;
		return false;
	});
	//阻止冒泡
	$(document).on("click", "label", function(){
		return false;
	});
	
	//点击下拉菜单列表
	$(document).on("click", ".js-selectWrap li a", function(){
		setVal($(this));
		rowFn(self);			//显示隐藏input	
		fullVal(self);			//创建云硬盘input赋值		
		bBack = true;			  
		return false;									  
	});
	//移入滚动文字visibility:hidden;
	var timer = null;
    $(document).on("mouseover", ".js-selectWrap li a", function(){
        if($('.js-selectWrap-tmp').length){
            $('.js-selectWrap-tmp').remove();
        }
        var seft      = $(this);
        var tmpHtml   = '<span class="js-selectWrap-tmp" style="display: none;">'+seft.text()+'</span>'; 
        $('body').append(tmpHtml);
        var iAwidth   = seft.outerWidth() - parseInt(seft.css('paddingLeft'));
        var iTmpWidth = $('.js-selectWrap-tmp').outerWidth();
        var diffValue = iTmpWidth - iAwidth + 5;
        
        var iNum      = 0;
        clearInterval(timer);
        seft.parent().siblings().find('a').css({
            'textIndent'  : '0',
            'paddingLeft' : '14px'
        });
        //判断是否需要滚动
        if(iTmpWidth > iAwidth){
            timer = setInterval(function(){
               iNum++;
               if(iNum == diffValue){
                   clearInterval(timer);
               } 
               seft.css({'textIndent' : -iNum});
            }, 30);
        } 
    });
    //移除还原元素
    $(document).on("mouseout", ".js-selectWrap li a", function(){
        $(this).css({
            'textIndent'  : '0',
            'paddingLeft' : '14px' 
        });
        clearInterval(timer);
    });
	//鼠标离开下拉菜单列表
	/*$(document).on("mouseleave", ".js-selectWrap", function(){
		_this	= $(this);										 
		clearInterval(iNow);
		iNow	= setInterval(setHide,600);
		return false;									 								 
	});*/
	//鼠标移入下拉选项
	$(document).on("mouseover", ".js-pos", function(){
		clearInterval(iNow);	
		return false;					  
	});
	
	$(document).bind('click',function(){
		$('.js-pos').hide();
		bBack = true;
	});
	
	$(document).on("mouseenter", ".js-selectWrap", function(){
        if($(this).children('.js-pos').css("display") == "block"){
            clearInterval(iNow);
            $(this).children('.js-pos').show();
        }
         return false;
    });
	
	//获取select的值赋值到模拟下拉菜单
	function getVal(This){
		var aOptions	= This.find('option');	
		var aUl			= This.find('ul').eq(0);
		var tmpInput    = '<input type="text" value="" class="searchRegexp js-searchreg" placeholder="Search" autofocus="autofocus" />';
		var tmpLabel    = '<li><a href="javascript:;" ></a></li>';
		var listArr = [];
		var iOltTop = 0;
		var vSham   = false;
		var searchVal;
		
		for(var i=0; i<aOptions.length; i++){
		    var opt = aOptions.eq(i);
            listArr.push(opt.text());
		}
		//判断属性是否存在 no 就创建
		if(!This.attr('data-isInputAttr')){
    		createEleSearch();
        }
        //用于记录是否再次创建元素
        if(!window.identification){
            aUl.html('');
            aUl.append(tmpLabel);
            for(var i=0; i<aOptions.length; i++){
                var opt = aOptions.eq(i);
                var list = '<li><a href="javascript:;" index="'+ i +'">'+opt.text()+'</a></li>';
                aUl.append(list);
            }
        }
        //阻止搜索框的默认事件，防止事件冒泡
        $(document).on("click", ".js-searchreg", function(){return false;});
		//搜索改变显示区的值
		$(document).on("input", ".js-searchreg", function(){
		    var seft = $(this);
		    setTimeout(function(){
		        aUl.html('');
		        //记录滚动条的top
		        if(window.scrollBarBtnTop){
		            iOltTop = parseInt(aUl.css('top')) || iOltTop;
		        }else{
		            iOltTop = 0;
		        }
		        searchVal = seft.val(); 
                if(searchVal){
                    var listResult = horizon.commons.searchRex(seft.val(), listArr);
                    if(listResult.length){
                        aUl.append(tmpLabel);
                        for(var i=0; i<listResult.length; i++){
                            var list = '<li><a href="javascript:;" index="'+ i +'">'+listResult[i]+'</a></li>';
                            aUl.append(list);
                        }
                    }
                    
                    aUl.css('top','0');
                    $('.js-scrollBar span').css('top','0');
                    vSham = true;
                    var iNow = 0;
                    $(document).on("keyup",function(event){
                        seft.focus();
                        if(vSham){
                            if(event.which === 9){
                                
                                iNow%=aUl.children().length-1;
                                iNow++;
                                if(aUl.children().eq(iNow).find("a").html()){
                                    seft.val(aUl.children().eq(iNow).find("a").html());
                                    $.each(aUl.children(), function(i, ele){
                                        $(ele).find("a").removeClass("active");
                                    });
                                    aUl.children().eq(iNow).find("a").addClass('active');
                                }
                            }
                        }
                        return false;
                    });
                    
                }else{
                    aUl.append(tmpLabel);
                    for(var i=0; i<aOptions.length; i++){
                        var opt = aOptions.eq(i);
                        var list = '<li><a href="javascript:;" index="'+ i +'">'+opt.text()+'</a></li>';
                        aUl.append(list);
                    }
                    aUl.css('top',iOltTop);
                    $('.js-scrollBar span').css('top',window.scrollBarBtnTop);
                    vSham = false;
                }
                scrollBar.init();   //
		    }, 300);
		    return false;
		});
		
		//创建搜索元素
		function createEleSearch(){
		    if(!This.find('.js-searchreg').length){
    		    aUl.before(tmpInput);
                var parentTop  = This.offset().top+40;
                var parentleft = This.offset().left+1;
                
                var iWidth     = This.width()-16;
                $('.js-searchreg').css({
                    'width'    : iWidth+'px'
                });                               
            }
            
            setTimeout(function(){
               $('.js-searchreg').focus(); 
            },100);
		}
		
	}
	
	//设置下拉菜单值
	function setVal(This){
		var index	= This.attr('index');
		var s		= self.find('option');						
		
		//s.attr('selected',false);
				
		s.eq(index).attr('selected',true);
				
		self.find('.js-selt_val').html(This.html());
		self.find('.js-pos').hide();
	}
	//鼠标移开下拉菜单定时隐藏下拉列表
	function setHide(){
		_this.children('.js-pos').hide();
		_this.find('.js-searchreg').val('');
		clearInterval(iNow);
		_this.find('ul').eq(0).css('top',0);
		$('.js-scrollBar span').css('top',0);
		window.identification  = 0;
		window.scrollBarBtnTop = 0;
		$('.js-selectWrap-tmp').remove();
	}
	
	//input显示隐藏
	function rowFn(_s){
		var select		= _s.find('select').val();		
		var aOptions	= _s.find('option');
		
		for(var i=0; i<aOptions.length; i++){
			$('.js-' + aOptions.eq(i).val()).hide();
		}
		
		$('.js-' + select).show();
		$('.js-none-' + select).hide();
	}
	//创建云硬盘input赋值
	function fullVal(s){
		var aOptions	= s.find('option');
		for(var i=0; i<aOptions.length; i++){
			if(aOptions.eq(i).attr('selected') == 'selected' && s.attr('at') === 'none'){
				
				$('.js-volumeName').val(aOptions.eq(i).attr('data-name'));
				
				if(aOptions.eq(i).attr('data-display_name')){
					$('#id_name').val(aOptions.eq(i).attr('data-display_name'));
				}				
			}
		}
	}		
	//初始化调用
	return init;
})(jQuery);

/*
** input样式
** @author Xu XinWei
** @date 2014-07-01
*/
(function($){
	
	$(document).on("focus", ".js-inputStyle", function(){
		$(this).addClass('txt_s');
		return false;
	});
	
	$(document).on("blur", ".js-inputStyle", function(){
		$(this).removeClass('txt_s');
		return false;
	});
	
	//编辑input
	$(document).on("focus", ".js-input_init input", function(){
		$(this).addClass('txt_s');
		return false;
	});
	
	$(document).on("blur", ".js-input_init input", function(){
		$(this).removeClass('txt_s');
		return false;
	});
	//编辑textarea
	$(document).on("focus", ".js-input_init textarea", function(){
		$(this).addClass('txt_s');
		return false;
	});	
	$(document).on("blur", ".js-input_init textarea", function(){
		$(this).removeClass('txt_s');
		return false;
	});
	
})(jQuery);

/*
** 复选框
** @author Xu XinWei
** @date 2014-07-07
*/
(function($){

	$(document).on("click", ".js-lab", function(){		
		if(!$(this).parent().find('input').attr('checked')){
			$(this).parent().find('input').attr('checked',true);		
		}		
		else{
			$(this).parent().find('input').attr('checked',false);
		}
		return false;			
	});
			
})(jQuery);

/*
** 创建网络/创建子网显示隐藏
** @author Xu XinWei
** @date 2014-6-30
*/
(function($){

	$(document).on("click", ".js-subnet", function(){
		if($(this).parent().find('input').attr('checked')){
			$('.js-'+$(this).parent().find('input').attr('s_name')).show('show');		
		}
		else{
			$('.js-'+$(this).parent().find('input').attr('s_name')).hide('show');
			$('.js-create_sub').hide('show');
			$('.js-subnet').parent().find('input').eq(1).attr('checked',false);
			//判断在高级选项里不触发
			if($(this).parent().find('input').attr('s_name') != 'create_sub'){
				$('.js-nip').parent().find('input').eq(0).attr('checked',false);
			}						
		}
		return false;
	});
	
	//网关显示隐藏
	$(document).on("click", ".js-nip", function(){
		ipFn($(this).parent().find('input'));
		return false;
	});
	function ipFn(_this){
		if(_this.attr('checked')){
			$('.js-'+_this.attr('s_name')).hide('show');			
		}
		else{
			$('.js-'+_this.attr('s_name')).show('show');
		}
	}

})(jQuery);

/*
** 计费管理
** @author Xu XinWei
** @date 2014-9-25
*/
var billingAdmin = (function($){
	var billing		= {
		//获取数据
		getData:	function(){
			var data	= $('#js-billing').val();
			
			if(!data){
				return false;
			}
			var len		= (data.split("u'")).length-1;
			
			var dd	= [data];
			for(var i=0; i<len; i++){
				var d = dd[0].replace("u'","'");
				dd = [];
				dd.push(d);				
			}
			var lens	= (dd[0].split("'cp'")).length-1;			 
			for(var i=0; i<lens; i++){
				var dt = dd[0].replace("'cp'","'cpu'");
				dd = [];
				dd.push(dt);	
			}
					
			return dd;
		},
		//虚机计费
		virtual:	function(num){			
			var fee		= 0;
			var num		= num ? num : 1;						
			var arr		= eval(this.getData()[0]);	
			
			//判断没有计费
			if(!arr){			
				$('#js-nextV').hide();
				$('#js-nextV2').show();
				return false;
			}
			
			var cpuVal		= $("#js-stepCpuVal").val();
			var memoryVal	= $("#js-stepMemoryVal").val() == 512 ? 512 : $("#js-stepMemoryVal").val()*1024;
							
			for(var i=0; i<arr.length; i++){
			
				if(arr[i].rule.cpu == cpuVal && arr[i].rule.mem == memoryVal){
					fee	= arr[i].fee;
					break;
				}
				else{
					fee = $('#js-fee').attr('tips');
				}
			}
			//判断是否有定价
			if(!isNaN(fee)){				
				$("#js-fee").html(fee + ' x ' + num + ' = ' + fee*num);
				$('#js-nextV').hide();
				$('#js-nextV2').show();
			}
			else{
				$("#js-fee").html(fee);
				$('#js-nextV').show();
				$('#js-nextV2').hide();
			}			
		}
	};
	return billing;
})(jQuery);

/*
** 硬盘/网络拖拽
** @author Xu XinWei
** @date 2014-3-14
** maxNum:最大值 defNum:初始化值 minNum:最小值
*/
var dargBtn = (function(){
	var dargFn	= {		
		init: function(){
			this.maxNum				= 0;											//最大值
			this.minNum				= 0;											//最小值
			this.defNum				= 0												//初始化值
			this.diX				= 0;
			this.diY				= 0;
			this.data				= [];											//数据
			this.R					= 0;											//除数
			this.average			= [];											//平均值
			
			this.parents			= $(".js-siliderTrack");
			this.parentElement		= $(".js-siliderTrack .js-slider-track");		//父元素
			this.childElement		= $(".js-siliderTrack .js-sliderBtn");			//按钮
			this.stripElement		= $('.js-siliderTrack .js-slider-selection');	//条元素
			this.parentWidth		= this.parentElement.width();					//父级元素宽度
			this.input				= $(".js-siliderTrack .js-diskVal");			//输入框						
			
			this.move();
		},
		
		move: function(initNum){
			var _this	= this;
									
			for(var i=0; i<_this.childElement.length; i++){
				_this.childElement.eq(i).attr('index', i);
				
				this.data.push(eval("("+this.parents.eq(i).attr('data')+")")); 
				
				this.maxNum				= this.data[i].maxNum;								//最大值
				this.minNum				= this.data[i].minNum;								//最小值
				this.defNum				= this.data[i].defNum;								//初始化值												
							
				this.average.push(this.maxNum / this.parentWidth);							//平均值
		
				if(this.average[i] <= 1 || (this.average[i]+'').indexOf('.', 0) != -1){
					this.R = 1;
				}
				else{
					this.R = 10;	
				}				
									
				if(this.defNum > this.maxNum){
					this.defNum = this.maxNum;
				}
				
				this.valFn(i,this.defNum/this.maxNum*this.parentWidth);
				this.input.eq(i).val(this.defNum);				
				
				//鼠标按下
				_this.childElement.eq(i).bind('mousedown',function(ev){
					var indx				= $(this).attr('index');
					var client_x			= ev.clientX;										//光标坐标
					this.diX				= client_x - _this.childElement.offset().left;		//当前光标到按钮的距离
					this.btnLeft			= _this.parentElement.eq(indx).offset().left - _this.parentElement.eq(indx).offset().left;
	
					//移动
					$(document).bind('mousemove',function(ev){
						var left 	 =  Math.floor(ev.clientX - _this.parentElement.eq(indx).offset().left - _this.diX);						
						if(left <= 0){
							left = _this.data[indx].minNum/_this.data[indx].maxNum*_this.parentWidth;
							_this.valFn(indx,left);
							_this.input.eq(indx).val(_this.data[indx].minNum);
						}
						else if(left >= _this.parentWidth){
							left 	 = _this.parentWidth;
							_this.valFn(indx,left);										
							_this.fillValue(indx,left);
						}
						else{
							_this.valFn(indx,left);										
							_this.fillValue(indx,left);
						}
					});
					
					//鼠标up
					$(document).bind('mouseup',function(){
						$(document).unbind('mousemove');
						$(document).unbind('mouseup');

						var val	= parseInt(_this.input.eq(indx).val()) ? parseInt(_this.input.eq(indx).val()) : _this.data[indx].minNum;
						
						if(val <= _this.data[indx].minNum){
							val	= _this.data[indx].minNum;
						}
						else if(val >= _this.data[indx].maxNum){
							val = _this.data[indx].maxNum;
						}
						_this.input.eq(indx).val(val);
						_this.valFn(indx,val/_this.data[indx].maxNum*_this.parentWidth);
						return false;
					});
					return false;
				});
							
				//input输入
				_this.input.eq(i).attr('index',i);
				
		    }   			
			//input输入
			$('.js-diskVal').bind('input',function(){
			    
			    var index = $(this).attr('index');
			    $(this).val($(this).val().replace(/[^\d]/g,''));
			    var val = parseInt($(this).val());
			    if(val){
			        if(val >= _this.maxNum){
                        val = _this.maxNum;
                    }          
                    $(this).val(val);
                    _this.valFn(index, val/_this.maxNum*_this.parentWidth);
                    
			    }else{
                    _this.valFn(index, _this.minNum/_this.maxNum*_this.parentWidth);
			    }
			    
			});	
			$('.js-diskVal').bind('blur',function(){
                
                var index = $(this).attr('index');
                var val = parseInt($(this).val()) ? parseInt($(this).val()) : _this.minNum;
                    
                if(val <= _this.minNum){
                    val = _this.minNum;
                }
                else if(val >= _this.maxNum){
                    val = _this.maxNum;
                }                   
                $(this).val(val);
                _this.valFn(index,val/_this.maxNum*_this.parentWidth);
                
            });
                					
		},
		
		valFn: function(i,left){
			this.childElement.eq(i).css({ left: left });
			this.stripElement.eq(i).css({ width: left });
			mainSpace.iopsDarg().drag(left, 0);	
		},
		
		fillValue: function(i,index){
			var index = Math.floor(index);
			var allNum = 0;
			if(this.data[i].maxNum == 1000){
				allNum = this.average[i]*index;
			}
			else{
				allNum = Math.ceil((this.average[i]*index).toFixed(2));
			}
			if(allNum%this.R == 0){				
				this.input.eq(i).val(allNum);
				this.total(allNum);
			}		
		},
		//显示价钱
		total: function(val){
			var diskFee = parseInt($("#js-diskFee").val());	
			$("#js-diskPrice").html(val +' x ' + diskFee + ' = ' + (val*diskFee));			
		}
	};
	
	return dargFn;
})();

//IOPS show and hidden
(function(){
	$(document).on("click", ".js-volumeType .js-scrollWrap li a", function(){
		var val = $('#id_type').val();
		if(val === 'performance'){
			$('.js-flag').show();
			$('.js-readWrite').hide();
		}
		else if(val === 'capacity'){
			$('.js-flag').hide();
			$('.js-readWrite').show();
		}
		else{
			$('.js-flag').hide();
			$('.js-readWrite').hide();
		}
		return false;
	});
})();

/*
** 硬盘--IOPS
** @author Xu XinWei
** @date 2015-1-28
*/
mainSpace.iopsDarg = function(){
		
	var ps_maxVal	= 4500,			
		ps_minVal	= 1500, 
		io_maxVal	= 90, 
		io_minVal	= 80,
		barWidth	= 200,
		dfWidth		= 20,
		newWidth	= barWidth - dfWidth,
		ps_bar		= $('.js-selection_s'),
		ps_ele		= $('.ps_val'),
		io_ele		= $('.io_val');
						
	function drag(x, tag){
		var val = x;
		
		var x = val-dfWidth < 0 ? 0 : val-dfWidth > newWidth ? newWidth : val-dfWidth;
						
		if(Math.floor(x/newWidth * ps_maxVal) % 50 === 0){
			var ps_val = Math.floor(x/newWidth * ps_maxVal) + ps_minVal;
			ps_ele.html(ps_val);			
		}
		
		if(Math.floor(x/newWidth * io_maxVal) % 1 === 0){
			var io_val = Math.floor(x/newWidth * io_maxVal) + io_minVal;
			io_ele.html(io_val);
		}

		ps_bar.css({ width:  barWidth/(barWidth - dfWidth) * x });
	}
	return { drag: drag };
}

/*
** billing--创建定价规则
** @author Xu XinWei
** @date 2014-10-15
*/
var createBilling	= (function($){
	var fn	= {
		init: function(){
			var _this				= this;
			this.nameList			= [];							//计费项名称
			this.billing			= $("#js-createBillingWrap");	//弹窗最外层父
			var defOption			= $("#id_price_id option");
			var aName				= $('#js-nameList p');			//计费名称列表
			this.oSelect			= $("#id_ptype");				//类型selecte
			this.aTypeOption		= this.oSelect.find('option');
			for(var i=0,len=aName.length; i<len; i++){
				this.nameList.push(aName.eq(i).html());
			}
			
			this.arr				= [];			
			for(var i=0; i<this.aTypeOption.length; i++){
				this.arr.push(this.aTypeOption[i]);
			}
			
			this.set(defOption.eq(0).html());						
			var aLink = this.billing.find('.js-billingType .selectListWrap a');						
			$(document).on('click', aLink, function(){
				_this.set($(this).html());
			});
		},
		set: function(txt){
			for(var k=0; k<this.nameList.length; k++){
				if(txt == this.nameList[k]){
					if(k == 0){
						this.oSelect.html(this.arr[0]);
						this.billing.find('.js-billingTag').show();
					}
					else if(k == 1){
						this.oSelect.html(this.arr[2]);	
						this.billing.find('.js-billingTag').show();	
						this.billing.find('.js-billingTag').eq(3).hide();
						this.billing.find('.js-billingTag').eq(4).hide();
					}
					else{
						this.oSelect.html(this.arr[1]);	
						this.billing.find('.js-billingTag').show();	
						this.billing.find('.js-billingTag').eq(3).hide();
						this.billing.find('.js-billingTag').eq(4).hide();
					}
				}
			}			
		    selectFn.setVal();	
		}
	};
	return fn;
})(jQuery);

/*
** 创建网络--弹窗重新垂直居中
** @author Xu XinWei
** @date 2014-10-28
*/
(function($){
	$(document).on("click", ".js-subnet", function(){
		var val 	= $(this).parent().find('input').attr('checked');
		var pane	= $(".windPane");
		var height	= $(window).height();

		setTimeout(function(){
			var paneHeight	= pane.height();
			var top			= (height - paneHeight)/2;	
				top = top <= 0 ? 0 : top;
			pane.animate({
				top: top
			},240);
		},800);					
	})
})(jQuery);
//创建云硬盘判断是否可以提交
/*controlSubmit传参实列{
    "id" : "id",
    "arr": ["a", "b"]
}*/
var CreateDrive = (function($){
    var init = {
        controlSubmit : function(json){
            var timer = null;
            var _this = this;
            if(!$("#"+json.id).length){return;}
            var defNum = $("#"+json.id).find('.js-diskVal').val();
            timer = setInterval(function(){
                
                if($("#"+json.id).css("display") == "block"){
                    
                    if(json.id == "extend_volume_modal"){
                        if(parseInt(defNum) < parseInt($("#"+json.id).find('.js-diskVal').val())){
                            $(".btn_3").removeAttr("disabled");
                            $(".btn_3").css("background", "#5ab0ee");
                        }else{
                            $(".btn_3").attr("disabled","disabled");
                            $(".btn_3").css("background", "#ccc");
                        }
                    }else{
                        if(_this.testingVla(json.arr) && $("#"+json.id).find('.js-diskVal').val() != 0){
                            $(".btn_3").removeAttr("disabled");
                            $(".btn_3").css("background", "#5ab0ee");
                        }else{
                            $(".btn_3").attr("disabled","disabled");
                            $(".btn_3").css("background", "#ccc");
                        }
                    }
                    
                }else{
                    clearInterval(timer);
                }
                
            }, 30);
        }, 
        testingVla : function(arr){
            var iNow = 0;
            for(var i = 0; i < arr.length; i++){
                if($("."+arr[i]).val()){
                    iNow++;
                }else{
                    iNow--;
                }
            }
            if(iNow == arr.length){
                return true;
            }else{
                return false;
            }
        }
    };
    return init;    
})(jQuery);
//更改配置云主机
var configuration = (function($){
    
    var init = {
        ChangeCloud : function(){
            var oldVcpus = $(".old-configuration input[name='vcpus']").val();
            var oldRam   = $(".old-configuration input[name='ram']").val();
            
            var fnScrollBoxBar = {
                
                init : function(){
                   var This = this;
                   $.each($(".js-auto-customWrap"), function(i, ele){
                       $(ele).attr("data-index", i);
                       This.scrollBar({
                           "box" : $(ele),
                           "init": parseInt($("#resize_instance__flavor_choice input").eq(i).val())
                       });
                   });
                },
                scrollBar : function(json){
                    if(!json.box){return false;}
                    var oBox = json.box; //$('.'+json.box);
                    var oBar = oBox.find('span');
                    var oUl = oBox.find('ul');
                    var aLi = oBox.find('ul li');
                    var oInput = $("#resize_instance__flavor_choice input");
                    var oSbmit = $(".private_submitbtn");
                    var iMinVlaue = 0;
                    var arr = [], arrFor = [], arrLiVal = [];
                    
                    if(json.init){
                         for(var i=0; i<aLi.length; i++){
                             arrLiVal.push(aLi[i].getAttribute('val'));
                         }
                    }
                    
                    setTimeout(function(){
                         $.each($(oBox).find('ul li span'),function(i,n){
                            var spanEle  = $(oBox).find('ul li span').eq(i);
                            arr.push(parseInt(spanEle.position().left) - parseInt($(oBar).width()/2)+1);
                         });
                         
                         for(var i=0; i<arrLiVal.length; i++){
                             if(json.init == arrLiVal[i]){
                                 iMinVlaue = arr[i];
                             }
                         }
                         $(oBar).stop().animate({
                            left : iMinVlaue
                         }, 300);
                     }, 100);
        
                    $(oBox).on("click", function(ev){
                        arrFor = [];
                        var when = ev.clientX - oBox.offset().left;
                        
                        for(var i=0; i<arr.length; i++){
                            arrFor.push(Math.abs(arr[i] - when));
                        }
                        
                        scrollLeft(arr[horizon.commons.indexOfMin(arrFor)]);
                        
                        var resultMin = arr[horizon.commons.indexOfMin(arrFor)];
                        oInput.eq($(this).attr("data-index")).val(arrLiVal[horizon.commons.indexOfMin(arrFor)]);
                        
                        if(iMinVlaue != resultMin && iMinVlaue < resultMin){
                            if(!$(this).attr("statusSubmit")){
                                $(this).attr("statusSubmit", "true");
                            }
                        }else{
                            $(this).removeAttr("statusSubmit");
                        }
                        var acustomwrap = $(".js-auto-customWrap");
                        for(var i=0; i<acustomwrap.length; i++){
                            if(acustomwrap[i].getAttribute("statusSubmit")){
                                oSbmit.removeAttr("disabled");
                                oSbmit.css("background", "#5ab0ee");
                                return;
                            }else{
                                oSbmit.attr("disabled","disabled");
                                oSbmit.css("background", "#ccc");
                            }
                        }
                        return false;
                    });
                    
                    oBar.on("mousedown", function(ev){
                        var disX = ev.clientX - oBar.position().left;
                        var seft = $(this);
                        $(document).on("mousemove", function(ev){
                            var left = ev.clientX - disX;
                            scrollLeft(left, true);
                        });
                        $(document).on("mouseup", function(){
                            $(document).unbind('mousemove');
                            $(document).unbind('mouseup');
                            arrFor = [];
                            var when = oBar.position().left;
                        
                            for(var i=0; i<arr.length; i++){
                                arrFor.push(Math.abs(arr[i] - when));
                            }
                            scrollLeft(arr[horizon.commons.indexOfMin(arrFor)]);
                            
                            var resultMin = arr[horizon.commons.indexOfMin(arrFor)];
                            oInput.eq(seft.parent().attr("data-index")).val(arrLiVal[horizon.commons.indexOfMin(arrFor)]);
                            
                            if(iMinVlaue != resultMin && iMinVlaue < resultMin){
                                if(!seft.parent().attr("statusSubmit")){
                                    seft.parent().attr("statusSubmit", "true");
                                }
                            }else{
                                seft.parent().removeAttr("statusSubmit");
                            }
                            var acustomwrap = $(".js-auto-customWrap");
                            for(var i=0; i<acustomwrap.length; i++){
                                if(acustomwrap[i].getAttribute("statusSubmit")){
                                    oSbmit.removeAttr("disabled");
                                    oSbmit.css("background", "#5ab0ee");
                                    return;
                                }else{
                                    oSbmit.attr("disabled","disabled");
                                    oSbmit.css("background", "#ccc");
                                }
                            }
                        }); 
                        return false;
                    });
                    function scrollLeft(left,adj){
                        if(left <= iMinVlaue)
                        {
                            left = iMinVlaue;
                        }
                        if(left >= oBox.width() - oBar.width()){
                            left = oBox.width() - oBar.width();
                        }
                        if(adj){
                            oBar.css("left",left);
                        }else{
                            oBar.stop().animate({
                                left : left
                            }, 300);
                        }
                        
                    };
                }
            };
            
            fnScrollBoxBar.init();
        }
    };
    
    return init;
    
})(jQuery);



