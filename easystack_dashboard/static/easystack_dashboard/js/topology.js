var topo = (function($){

   /*************/
	/**  拓扑图  **/
	/************/
	var Topo	= function(clas){
		var _this				= this;
		this.default_top		= 80;						//默认元素离顶部的距离
		this.title_width		= $('.network-name').width()+35;						//标题的宽度
		this.nodata			= $('.js-nodata');
		this.default_width		= 60;						//路由/虚机的默认宽度
		this.default_height		= 60;						//路由/虚机的默认高度
		this.clas				= clas;						//svg容器的className
		this.eleY				= [];						//路由虚机元素Y坐标集
		this.svgMaxWidth		= [];						//svg的最大宽度
		this.colorBg			= '#2a394f';
		this.colorBg2			= '#5ab0ee';
		this.svg				= d3.select("."+clas).append("svg").attr({ "width": "100%" , "height": 800 }).classed("svgTopo",true);			//创建svg画布
	}

	/******初始化******/
	Topo.prototype.init			= function(){
		var _this				= this;

		$(".js-topoWrap").children().before('<p class="txt-c mt50 topologyLoading">Loading...</p>');

		network_info();
		setInterval(network_info,10000);

		function network_info(){
			$.getJSON($('#networktopology').data('networktopology') + '?' + $.now(),
				function(data) {
						_this.json	= data;

			$('.topologyLoading').remove();
					if(jQuery.isEmptyObject(_this.json)){
					_this.nodata.css('display','block');
					return true;
		 			}else{
						_this.nodata.css('display','none');
		 						}

					runFn();
				}
		);
		}

		//初始化
		function runFn(){
			_this.w					= $("."+_this.clas).width();		//容器的宽度

			_this.networksExternal();
			_this.routers();
			_this.privateNetwork();
			_this.servers();
			_this.lineFn();

			_this.isSelect();
			_this.svgAuto();
		}

		//窗口变化时重绘画布
		$(window).resize(function(){
			_this.svg.selectAll("*").remove();
			_this.w				= $("."+_this.clas).width();	//容器的宽度

			if(jQuery.isEmptyObject(_this.json)){
				return true;
			}

			_this.isSelect();
		});

		//内部网络与共享网络切换
		$(document).on('click', '.js-network', function(){
			$(".js-network").removeClass("network_select");
			$(this).addClass("network_select");

			if(jQuery.isEmptyObject(_this.json)){
				return true;
		}
			_this.isSelect();
			_this.svgAuto();
		})
	}

	/*********控制*******/
	Topo.prototype.isSelect				= function(s){
		var _this	= this;
		_this.w		= s ? s : this.w;
		_this.svg.selectAll("*").remove();
		_this.networksExternal();
		_this.routers();

		if($(".network_select").index() === 0){
			_this.privateNetwork();
		}
		else{
			_this.sharedNetwork();
		}

		_this.servers();
		_this.lineFn();
	}

	/********外部网络数据********/
	Topo.prototype.networksExternal		= function(){
		var network						= [];							//存放外部网络数组
		var data_network				= this.json["networks"];		//获取网络数据

		//获取外部网络数据
		for(var i=0; i<data_network.length; i++){
			if(data_network[i]["router:external"]){
				network.push(data_network[i]);
			}
		}
		var attr						= { "className": "extRect" , "network":　network , "fillColor": this.colorBg , "top": 0 };
		this.public_networks(attr);
	}

	/**********路由数据********/
	Topo.prototype.routers				= function(){
		var data_img					= this.json["routers"];																	//路由/虚机数据
		var Y							= this.networkY[this.networkY.length-1] ? this.networkY[this.networkY.length-1] : 0;	//无外部网络
		var attr						= { "rectClassName": "router" , "imgClassName": "routerImg" , "data_img": data_img , "top": Y , "imgURL": "/static/bootstrap/img/router_icon.png" , "rectW": 60 , "rectH": 60 , "imgWidth": 50 , "imgHeight": 50 };
		this.public_createImg(attr);
	}

	/**********内部网络数据********/
	Topo.prototype.privateNetwork		= function(){

		var network						= [];							//存放外部网络数组
		var data_network				= this.json["networks"]; 		//获取网络数据

		//获取外部网络数据
		for(var i=0; i<data_network.length; i++){
			if(!data_network[i]["router:external"] && !data_network[i]["shared"]){
				network.push(data_network[i]);
			}
		}

		var top							= 0;
		if(this.networkY.length == 0 && this.eleY.length == 0){
			top		= 0;
		}
		else if(this.networkY.length > 0 && this.eleY.length == 0){
			top		= this.networkY[this.networkY.length-1];
		}
		else if(this.networkY.length == 0 && this.eleY.length > 0){
			top		= this.eleY[this.eleY.length-1];
		}
		else{
			top		= this.eleY[this.eleY.length-1];
		}

		var attr						= { "className": "privateRect" , "network":　network , "fillColor": this.colorBg2 , "top": top+50 };
		this.public_networks(attr);
	}

	/************共享网数据***********/
	Topo.prototype.sharedNetwork		= function(){
		var network						= [];							//存放外部网络数组
		var data_network				= this.json["networks"]; 		//获取网络数据

		//获取外部网络数据
		for(var i=0; i<data_network.length; i++){
			if(!data_network[i]["router:external"] && data_network[i]["shared"]){
				network.push(data_network[i]);
			}
		}

		var top		= 0;
		if(this.networkY.length == 0 && this.eleY.length == 0){
			top		= 0;
		}
		else if(this.networkY.length > 0 && this.eleY.length == 0){
			top		= this.networkY[this.networkY.length-1];
		}
		else if(this.networkY.length == 0 && this.eleY.length > 0){
			top		= this.eleY[this.eleY.length-1];
		}
		else{
			top		= this.eleY[this.eleY.length-1];
		}

		var attr						= { "className": "sharedRect" , "network":　network , "fillColor": this.colorBg2 , "top": top+50 };
		this.public_networks(attr);
	}

	/************虚机************/
	Topo.prototype.servers				= function(){
		var data_img					= this.json["servers"];										//路由/虚机数据

		var top							= 0;
		if(this.networkY.length == 0 && this.eleY.length == 0){
			top		= 210;
		}
		else if(this.networkY.length > 0 && this.eleY.length == 0){
			top		= this.networkY[this.networkY.length-1];
		}
		else if(this.networkY.length == 0 && this.eleY.length > 0){
			top		= this.eleY[this.eleY.length-1]+130;
		}
		else{
			top		= this.networkY[this.networkY.length-1];
		}

		var attr	= { "rectClassName": "serverWrap" , "rectW": 50 , "rectH": 50 , "imgClassName": "serverImg" , "data_img": data_img , "top": top+50 , "imgURL": "/static/bootstrap/img/server_icon.png" , "imgWidth": 40 , "imgHeight": 40 };
		this.public_createImg(attr);
	}

	/**************公有创建--外部网络/内部网络/共享网络方法,attrName:属性名,className:rect的className**************/
	Topo.prototype.public_networks		= function(attrJson){
		var _this						= this;
		var rectHeight					= 20;							//网络rect的高度
		var marginTop					= 10;							//网络rect之间的边距
		var ht							= rectHeight + marginTop;
		var ipLeft						= 270;							//子网ip left
		this.networkY					= [];							//网络Y坐标

 		for(var i=0; i<attrJson["network"].length; i++){
			_this.networkY.push(_this.default_top + i*ht + attrJson["top"]);
			//添加group
			var g = _this.svg.append('g')
				.attr({'ids': attrJson["network"][i]["id"] , 'name': attrJson["network"][i]["name"]})
				.classed(attrJson["className"],true);

				g.append('rect')
					.attr({ "width": this.w - this.title_width , "height": rectHeight , "rx": 8 , "ry": 8 , "x": this.title_width })
					.attr({'y': _this.default_top + i*ht + attrJson["top"] , 'id': attrJson["network"][i]["id"] , 'fill': attrJson["fillColor"]})
					.classed(attrJson["className"]+'Two',true);
			//网络name
			g.append('text')
				.text(attrJson["network"][i].name)
				.attr({'y': _this.default_top + i*ht + attrJson["top"]+14 , 'x': this.title_width+5 , 'fill': '#fff'});

			//子网段
			var len 	= 0;
			var subnetX = 0;
			for(var k=0,subLen=attrJson["network"][i].subnets.length; k<subLen; k++){
				//判断admin(is_superuser==true)/普通用户(is_superuser==false)
				if((_this.json.is_superuser === false && attrJson.className !== 'extRect') || _this.json.is_superuser === true){
					var subnet_ip = g.append('text')
						.text(attrJson["network"][i].subnets[k].cidr)
						.attr({'y': _this.default_top + i*ht + attrJson["top"]+14 , 'fill': '#fff' , 'font-size': 12})
						.classed('subnetIp',true)
						.classed('subnetIpTxt',true);

					if(k === 0){
						subnet_ip.attr({'x': this.title_width + ipLeft});
					}
					else{
						subnet_ip.attr({'x': len+subnetX + 10});
					}
					len 		= parseInt(document.getElementsByClassName('subnetIp')[0].getComputedTextLength())+10;
					subnetX		= parseInt($('.subnetIp').attr('x'));
					subnet_ip.classed('subnetIp',false);
					this.svgMaxWidth.push(subnetX+len);					//取子网的x值用于svg宽度
				}
			}
		}

		//写外部网络/内部网络/共享网络标题
		var networkTop		= parseInt($('.privateRectTwo').eq(0).attr('y')) || parseInt($('.sharedRectTwo').eq(0).attr('y'));
		var network_name	= parseInt($('.js-network.network_select').index()) ? $('.network-name').eq(2).html() : $('.network-name').eq(1).html();
		var ext_name		= $('.network-name').eq(0).html();

		if(attrJson.className === 'extRect'){
			_this.svg.append('text')
				.text(ext_name)
				.attr({'y': _this.default_top+15 , 'x': 10 , 'fill': '#777' , 'font-size': 16})
				.classed('ext-name',true);
		}
		//判断内部网络
		if($('.js-network.network_select').index() === 0 && attrJson["className"] === 'privateRect'){
			isNetwork();
		}
		//判断公有网络
		if($('.js-network.network_select').index() === 1 && attrJson["className"] === 'sharedRect'){

			isNetwork();
		}

		function isNetwork(){
			_this.svg.append('text')
				.text(network_name)
				.attr({'y': _this.default_top + attrJson["top"]+12 , 'x': 10 , 'fill': '#777' , 'font-size': 16})
				.classed('network-name',true);
		}
	}

	/*******************公有创建路由/虚机方法***********************/
	Topo.prototype.public_createImg		= function(attrJson){
		var _this			= this;
		var eleMargin		= 10;											//边距
		var topSize			= 20;											//元素再加top值
		this.eleY			= [];											//元素Y坐标集
		var ww 				= $("."+this.clas).width();						//容器的宽度
		_this.ww			= ww;
		//圆角rect
		var g = this.svg.selectAll("." + attrJson["rectClassName"])
			.data(attrJson["data_img"])
			.enter().append("g")
			.attr("ids",function(d,i){
				 return attrJson["data_img"][i]["id"];
			 })
			.attr("name",function(d,i){
				return attrJson["data_img"][i]["name"];
			})
			.classed(attrJson["rectClassName"]+"_g",true);

			//添加长方形
			g.append("rect")
			.attr({ "width": attrJson["rectW"] , "height": attrJson["rectH"] , "rx": 6 , "ry": 6 })
			.attr({ "fill": "#f9f9f9" , "stroke": "#dcdee0" })
			.attr("y",function(d,i){
				_this.eleY.push(_this.default_top + attrJson["top"] + topSize);
				return  _this.default_top + attrJson["top"] + topSize;
			 })
			.attr("x",function(d,i){
				var x = (attrJson["rectW"] + eleMargin)*i + (ww - attrJson["data_img"].length * (attrJson["rectW"] + eleMargin))/2 + _this.title_width-40;
				if(attrJson["data_img"].length * (attrJson["rectW"] + eleMargin) > ww-_this.title_width){
					x = (attrJson["rectW"] + eleMargin)*i + _this.title_width;
				}
				return x;
			 })
			.attr("id",function(d,i){
				 return attrJson["data_img"][i]["id"];
			 })
			.classed(attrJson["rectClassName"],true);

			//img
			g.append('image')
			.attr("y",function(d,i){
				return _this.default_top + attrJson["top"] + 5 + topSize;
			})
			.attr("x",function(d,i){
				var x	= 5 + (attrJson["rectW"] + eleMargin)*i + (ww - attrJson["data_img"].length * (attrJson["rectW"] + eleMargin))/2 + _this.title_width-40;
				if(attrJson["data_img"].length * (attrJson["rectW"] + eleMargin) > ww-_this.title_width){
					x = (attrJson["rectW"] + eleMargin)*i + _this.title_width + 5;
				}
				return x;
			})
			.attr({ "xlink:href": attrJson["imgURL"] , "width": attrJson["imgWidth"] , "height": attrJson["imgHeight"] })
			.classed(attrJson["imgClassName"],true)
			.attr("ids",function(d,i){
				return attrJson["data_img"][i]["id"];
			})
			.style('opacity',function(d,i){
				var opacity 	= 1;
				if(attrJson["data_img"][i]['status'] != 'ACTIVE'){
					opacity		= 0.3;
				}
				return opacity;
			});

		//写路由/虚机名称
		for(var i=0; i<attrJson['data_img'].length; i++){
			var imgLeft = parseInt($('.' + attrJson["rectClassName"]).eq(i).attr('x')) + attrJson["rectW"]/2;
			var rt = this.svg.append('text')
				.text(attrJson["data_img"][i]["name"])
				.attr({'x': imgLeft, 'y': _this.default_top + attrJson["top"] + attrJson["rectH"] + 15 + topSize , 'fill': '#777'})
				.classed(attrJson["imgClassName"]+'Name',true);

			var len = document.getElementsByClassName(attrJson["imgClassName"]+'Name')[i].getComputedTextLength();
			rt.attr({'x': imgLeft-len/2});
			var txt = len/attrJson["data_img"][i]["name"].length;

			var end = attrJson["data_img"][i]["name"].length - Math.floor(attrJson["rectW"]/txt);
			if(end > 0){
				rt.text(attrJson["data_img"][i]["name"].substring(0,attrJson["data_img"][i]["name"].length-end-2)+'...')
				var len = document.getElementsByClassName(attrJson["imgClassName"]+'Name')[i].getComputedTextLength();
				rt.attr({'x': imgLeft-len/2});
			}
		}
	}

	/****************************连线**************************/
	Topo.prototype.lineFn	= function(){
		var _this			= this;

		var line_data		= this.json["ports"]; 						//获取连线数据

		setLink({"device_owner": "compute" , "deviceWrap": "serverWrap" , "deviceImg": "serverImg" , "deviceName": "serverImgName"});
		//虚机连线
		function setLink(d){
			var arrLine			= [];									//线条数据
			var arrID			= [];									//虚机id

			for(var i=0; i<line_data.length; i++){
				if(line_data[i]["device_owner"].indexOf(d.device_owner)>=0 && $("#"+line_data[i]["network_id"]).attr('y')){
					arrLine.push(line_data[i]);							//线条数据
					arrID.push(line_data[i]["device_id"]);				//虚机id
				}
			}

			var newArrID	= d3.set(arrID).values();					//去重
			var newLine		= [];
			_this.newLine	= newLine;
			var arrL		= [];
			var newID		= [];
			var linID		= [];
			for(var i=0; i<newArrID.length; i++){
				for(var k=0; k<arrLine.length; k++){
					if(newArrID[i] === arrLine[k]["device_id"]){
						arrL.push(arrLine[k]);
						linID.push(newArrID[i]);
					}
				}
				newLine.push(arrL);
				arrL	= [];
				newID.push(linID);
				linID	= [];
			}

			var aServer			= $("." + d.deviceWrap);
			var aServerImg		= $("." + d.deviceImg);
			var aServerImgName	= $("." + d.deviceName);
			var aNames 			= document.getElementsByClassName(d.deviceName);

			for(var i=0,len=aServer.length; i<len; i++){
				for(var k=0; k<newArrID.length; k++){
					if(aServer.eq(i).attr('id') == newArrID[k]){
						if(newID[k].length > 5){
							aServer.eq(i).attr({width: 10*newID[k].length});
							var x		= parseInt(aServerImg.eq(i).attr('x'))+(10*newID[k].length-50)/2;
							aServerImg.eq(i).attr({x: x});
						}
					}
				}

				if(i != 0){
					aServer.eq(i).attr({x: parseInt(aServer.eq(i-1).attr('x')) + parseInt(aServer.eq(i-1).attr('width')) + 10});
					aServerImg.eq(i).attr({x: parseInt(aServer.eq(i).attr('x')) +(parseInt(aServer.eq(i).attr('width')) - aServerImg.attr('width'))/2});
				}

				_this.svgMaxWidth.push(parseInt(aServer.eq(i).attr('x'))+parseInt(aServer.eq(i).attr('width')));

				aServerImgName.eq(i).attr({x: parseInt(aServer.eq(i).attr('x')) + (parseInt(aServer.eq(i).attr('width')) - aNames[i].getComputedTextLength())/2});
			}
			return arrLine;
		}

		//线条链接
		for(var i=0; i<_this.newLine.length; i++){
			for(var n=0; n<_this.newLine[i].length; n++){
				if($("#"+_this.newLine[i][n]["network_id"]).attr("y")){
					var len		= _this.newLine[i].length < 2 ? 2 : _this.newLine[i].length;
					var netY	= parseInt($("#"+_this.newLine[i][n]["network_id"]).attr("y")) + 23;
					var y 		= parseInt($("#"+_this.newLine[i][n]["device_id"]).attr("y")) - 4;

					var x		= parseInt($("#"+_this.newLine[i][n]["device_id"]).attr("x")) + $("#"+_this.newLine[i][n]["device_id"]).attr("width")/len + n*10;
					var color	= $("#"+_this.newLine[i][n]["network_id"]).attr("fill");

					if(x && y){
						this.svg.insert("line",":first-child")
							.attr({ "x1": x-4 , "y1": netY , "x2": x-4 , "y2": y })
							.style({ "stroke": color , "stroke-width": 3 });

						this.svg.append("circle")
							.attr({ "cx": x-4 , "cy": netY , "r": 2 })
							.style({ "stroke": color , "stroke-width": 2 , "fill": "#fff" });

						this.svg.append("circle")
							.attr({ "cx": x-4 , "cy": y , "r": 2 })
							.style({ "stroke": color , "stroke-width": 2 , "fill": "#fff" });
					}
				}
			}
		}

		//内部网络/共享网络连线
		/*var arrNet		= [];													//线条数据
		for(var i=0; i<line_data.length; i++){
			if(line_data[i]["device_owner"] === "network:router_interface" && $("#"+line_data[i]["network_id"]).attr('y')){
				arrNet.push(line_data[i]);
			}
		}*/

		setLink({"device_owner": "network:router_interface" , "deviceWrap": "router" , "deviceImg": "routerImg" , "deviceName": "routerImgName"});

		for(var i=0; i<_this.newLine.length; i++){
			for(var n=0; n<_this.newLine[i].length; n++){
				if($("#"+_this.newLine[i][n]["network_id"]).attr("y")){
					var len		= _this.newLine[i].length < 2 ? 2 : _this.newLine[i].length;
					var netY	= parseInt($("#"+_this.newLine[i][n]["network_id"]).attr("y")) - 4;
					var y 		= parseInt($("#"+_this.newLine[i][n]["device_id"]).attr("y")) + parseInt($("#"+_this.newLine[i][n]["device_id"]).attr("height")) + 4;

					var x		= parseInt($("#"+_this.newLine[i][n]["device_id"]).attr("x")) + $("#"+_this.newLine[i][n]["device_id"]).attr("width")/len + n*10;
					var color	= $("#"+_this.newLine[i][n]["network_id"]).attr("fill");

					if(x && y){
						this.svg.insert("line",":first-child")
							.attr({ "x1": x-4 , "y1": netY , "x2": x-4 , "y2": y })
							.style({ "stroke": color , "stroke-width": 3 });

						this.svg.append("circle")
							.attr({ "cx": x-4 , "cy": netY , "r": 2 })
							.style({ "stroke": color , "stroke-width": 2 , "fill": "#fff" });

						this.svg.append("circle")
							.attr({ "cx": x-4 , "cy": y , "r": 2 })
							.style({ "stroke": color , "stroke-width": 2 , "fill": "#fff" });
					}
				}
			}
		}

		//外部网络连线路由
		var arrExt		= [];
		for(var i=0; i<line_data.length; i++){
			if(line_data[i]["device_owner"] === "network:router_gateway"){
				arrExt.push(line_data[i]);
			}
		}

		//普通用户连外部网络名称
		if(_this.json.is_superuser === false){
			for(var j=0; j<_this.json.routers.length; j++){
				if(_this.json.routers[j].external_gateway_info){
					_this.json.routers[j].external_gateway_info.device_id	= _this.json.routers[j].id;
					arrExt.push(_this.json.routers[j].external_gateway_info);
				}
			}
		}

		for(var i=0; i<arrExt.length; i++){
			if($("#"+arrExt[i]["network_id"]).attr("y")){
				//var len_s	= arrExt.length < 2 ? 2 : arrExt.length;
				var len_s	= 2;
				var net_Y	= parseInt($("#"+arrExt[i]["network_id"]).attr("y")) + 23;
				var iX		= parseInt($("#"+arrExt[i]["device_id"]).attr("x")) + $("#"+arrExt[i]["device_id"]).attr("width")/len_s;
				var routY	= parseInt($("#"+arrExt[i]["device_id"]).attr("y")) - 4;
				var color	= $("#"+arrExt[i]["network_id"]).attr("fill");

				if(iX && routY){
					this.svg.insert("line",":first-child")
						.attr({ "x1": iX , "y1": net_Y , "x2": iX , "y2": routY })
						.style({ "stroke": color , "stroke-width": 3 });

					this.svg.append("circle")
						.attr({ "cx": iX , "cy": net_Y , "r": 2 })
						.style({ "stroke": color , "stroke-width": 2 , "fill": "#fff" });

					this.svg.append("circle")
						.attr({ "cx": iX , "cy": routY , "r": 2 })
						.style({ "stroke": color , "stroke-width": 2 , "fill": "#fff" });
				}
			}
		}
		this.svgAuto();				//自适应svg宽度

		//虚机详情
		$(".serverWrap_g").bind("click",function(){
			 var ids			= $(this).attr("ids");						//虚机id
			 var ibtn			= $(".network_select").index();				//判断是内部网络还是共享网络
			 var name			= $(this).attr('name');						//虚机名称


			 $(".topoTips").stop();
			 $(".topoTips").animate({
				"top": 0
			 }, 250);

			 _this.detailFn({ "ids": ids , "ibtn": ibtn , 'name': name });	//虚机详情

			 //虚机详情显示title
			 if(!_this.json.is_superuser){
				 var titles	= $("#js-serverTips span");
				 titles.eq(3).hide();
				 titles.eq(4).hide();
			 }
			 $("#js-serverTips").show();
			 $("#js-networkTips").hide();
			 $("#js-routerTips").hide();
			 return false;
		});
		//内部网络详情
		$('.privateRect').bind('click',function(){
			var ids				= $(this).attr("ids");									//虚机id
			var ibtn			= $(".network_select").index();							//判断是内部网络还是共享网络
			var name			= $(this).attr('name');									//虚机名称

			$(".topoTips").stop();
			$(".topoTips").animate({
				"top": 0
			 }, 250);

			 _this.privateNetworkDetailFn({'ids': ids , 'ibtn': ibtn , 'name': name});	//内部网络详情

			 //虚机详情显示title
			 $("#js-serverTips").hide();
			 $("#js-networkTips").show();
			 $("#js-routerTips").hide();
			 return false;
		});

		//共享网络详情
		$('.sharedRect').bind('click',function(){
			var ids				= $(this).attr("ids");									//虚机id
			var ibtn			= $(".network_select").index();							//判断是内部网络还是共享网络
			var name			= $(this).attr('name');									//虚机名称

			$(".topoTips").stop();
			$(".topoTips").animate({
				"top": 0
			 }, 250);

			 _this.privateNetworkDetailFn({'ids': ids , 'ibtn': ibtn , 'name': name});	//内部网络详情

			 //虚机详情显示title
			 $("#js-serverTips").hide();
			 $("#js-networkTips").show();
			 $("#js-routerTips").hide();

			 return false;
		});

		//路由详情
		$(".router_g").bind("click",function(){
			var ids				= $(this).attr("ids");								//虚机id
			var ibtn			= $(".network_select").index();						//判断是内部网络还是共享网络
			var name			= $(this).attr('name');								//虚机名称

			$(".topoTips").stop();
			$(".topoTips").animate({
				"top": 0
			 }, 250);

			 _this.routerDetailFn({ "ids": ids , "ibtn": ibtn , 'name': name });		//路由详情

			 //虚机详情显示title
			 if(!_this.json.is_superuser){
				 var titles	= $("#js-routerTips span");
				 titles.eq(2).hide();
				 titles.eq(3).hide();
			 }
			 $("#js-serverTips").hide();
			 $("#js-networkTips").hide();
			 $("#js-routerTips").show();

			 return false;
		});

		//点击document tips消失
		$(document).bind("click",function(){
			$(".topoTips").stop();
			$(".topoTips").animate({
				"top": -320
			 }, 250);
		});
		//tips阻止冒泡
		$('.topoTipsContent').bind('click',function(){
			return false;
		});
	}

	/*******************虚机详情************************/
	Topo.prototype.detailFn	= function(obj){
		var _this				= this;
		var imgWidth			= 40;						//虚机图标宽度
		var imgHeight			= 40;						//虚机图标高度
		var marginLeft			= 40;						//边距
		var routerWidth			= 30;						//路由图标宽度
		var routerHeight		= 30;						//路由图标高度
		var tipsWidth			= 870;						//tips宽度
		var tipsHeight			= $(".topoTips").height()-60;
		this.tipsHeight			= tipsHeight;
		$(".topoTips").eq(0).css("overflowY",'visible');
		var nn					= 0;

		if(this.svg_tips){
			this.svg_tips.remove();
		}

		$(".topoTipsContent").html('');
		$(".topoTips").eq(0).css({'width': tipsWidth});

		this.svg_tips			= d3.select(".topoTipsContent").append("svg").attr({ "width": "100%" , "height": tipsHeight }).classed("svg_tips",true);			//创建tips svg画布

		if(obj['ibtn'] === 0){										//内部网络
			categoryFn({ 'ext': false , 'shared': false });
		}
		else if(obj['ibtn'] === 1){									//共享网络
			categoryFn({ 'ext': false , 'shared': true });
		}
		else{
			categoryFn({ 'ext': false , 'type': 1 });				//虚机详情页
		}

		//数据提取
		function categoryFn(boole){
			var network			= null;								//数据对应的网络数据
			var aSubnet			= [];								//子网集
			_this.aServerSubnet	= aSubnet;							//子网集赋给对象属性aServerSubnet

			//虚机对应的数据
			for(var i=0; i<_this.json.server_connections.length; i++){
				if(_this.json.server_connections[i]['server']['server_id'] === obj.ids){
					network		= _this.json.server_connections[i];
				}
			}

			//networks--subnet
			for(var n=0; n<network.networks.length; n++){
				if(boole.type){
					if(network.networks[n]['network']['router:external'] === boole.ext){
						aSubnet.push(network.networks[n]['network']['subnets']);
					}
				}
				else{
					if(network.networks[n]['network']['router:external'] === boole.ext && network.networks[n]['network']['shared'] === boole.shared){
						aSubnet.push(network.networks[n]['network']['subnets']);
					}
				}
			}

			//整合network与router数据
			for(var i=0; i<aSubnet.length; i++){
				for(var n=0; n<aSubnet[i].length; n++){
					for(var t=0; t<aSubnet[i][n].routers.length; t++){
						for(var k=0; k<_this.json.router_connections.length; k++){
							//普通用户连外部网络名称
							if(_this.json.is_superuser === false){
								for(var j=0; j<_this.json.routers.length; j++){
									if(_this.json.routers[j].external_gateway_info && _this.json.routers[j].id === aSubnet[i][n].routers[t].router_id){
										for(var d=0; d<_this.json.networks.length; d++){
											if(_this.json.networks[d]['router:external'] && _this.json.networks[t]['id'] === _this.json.routers[j].external_gateway_info.network_id){
												 aSubnet[i][n].routers[t].networkName = _this.json.networks[d]['name'];
											}
										}
									}
								}
							}
							//取外部网络网段
							if(_this.json.router_connections[k].router.router_id === aSubnet[i][n].routers[t].router_id){
								if(_this.json.router_connections[k]['networks'].length){
									aSubnet[i][n].routers[t].r_ip			= _this.json.router_connections[k]['networks'][0]['network']['subnets'][0]['router_ip_address'];			//路由ip
									aSubnet[i][n].routers[t].ext_ip			= _this.json.router_connections[k].networks[0].network.subnets[0].cidr;										//外部网络ip
								}
							}
						}
					}
				}
			}

			//判断虚机是否有网络
			if(aSubnet.length === 0){
				var tipsMsg	= $('.tips-msg').eq(0);
				_this.svg_tips.append('text')
					.attr({ y: (tipsHeight/2) , x: (tipsWidth-tipsMsg.width())/2 , fill: '#fff' })
					.text(tipsMsg.html());
			}
			else{
				drawFn({ 'imgURL': '/static/bootstrap/img/' });			//画虚机详情方法调用
			}
		}

		//画虚机、对应ip方法
		function drawFn(dataJson){
			var svgHeight			= $('.svg_tips').height();			//svg的高度
			var top					= (svgHeight-imgHeight)/2;			//虚机top
			var serverTextW			= 100;								//虚机名称最大长度

			//画虚机
			_this.svg_tips.append('image')
				.attr({ 'y': top , 'x': marginLeft })
				.attr({ "xlink:href": dataJson.imgURL+'server_icon_small.png' , "width": imgWidth , "height": imgHeight });

			//虚机名称
			var serverName = _this.svg_tips.append('text')
				.attr({y: top + imgHeight + 15 , x: marginLeft , fill: '#fff'})
				.text(obj.name)
				.classed('detServerName',true);

			//居中虚机名称并截取文字
			var serverNameLen	= document.getElementsByClassName("detServerName")[0];
			var nameLength		= serverNameLen.getComputedTextLength();
			var len				= $('.detServerName').text();
			if(nameLength > serverTextW){
				var letterSize		= nameLength/len.length;
				var sn				= len.substring(0,serverTextW/letterSize-2);
				serverName.text(sn+'...');
			}

			serverName.attr({"x":(imgWidth + marginLeft*2 - serverNameLen.getComputedTextLength())/2});

			//画虚机横线
			_this.svg_tips.append('line')
				.attr({ 'y1': svgHeight/2 , 'x1': imgWidth + marginLeft + 5 , 'y2': svgHeight/2 , 'x2': imgWidth + marginLeft*2 })
				.style({ "stroke": '#fff' , "stroke-width": 2 });

			//画概括子网线条
			var serverSubLine = _this.svg_tips.append('line')
				.attr({ 'y1': 10 , 'x1': imgWidth + marginLeft*2 + 5 , 'y2': svgHeight , 'x2': imgWidth + marginLeft*2 + 5 })
				.style({ "stroke": '#fff' , "stroke-width": 2 });

			//画虚机ip
			var serverIpLineY2		= 0;
			var h					= 10;
			for(var i=0; i<_this.aServerSubnet.length; i++){
				var textY	= [];

				for(var n=0; n<_this.aServerSubnet[i].length; n++){
					//虚机ip
					var serverName = _this.svg_tips.append('text')
						.text(_this.aServerSubnet[i][n].server_ip_address)
						.attr({y: 30+30*n+serverIpLineY2+h , x: imgWidth + marginLeft*2 + 10 , fill: '#fff'});
					textY.push(30+30*n);
				}

				//画概括虚机线条
				var line = _this.svg_tips.append('line')
					.attr({ 'y1': 20+serverIpLineY2+h , 'x1': imgWidth + marginLeft*2 + 140 , 'y2': 30*n+serverIpLineY2+h , 'x2': imgWidth + marginLeft*2 + 140 })
					.style({ "stroke": '#fff' , "stroke-width": 2 })
					.classed('serverIpLine',true);

				//网关
				var y	= eval(textY.join('+'));
				var serverName = _this.svg_tips.append('text')
					.text(_this.aServerSubnet[i][n-1].cidr)
					.attr({y: y/n+serverIpLineY2+h , x: imgWidth + marginLeft*2 + 150 , fill: '#fff'})
					.classed('gatewayText',true);

				//画ip竖线
				if(_this.aServerSubnet[i][n-1].routers.length == 1){
					var gatewayTextY	= parseInt($('.gatewayText').eq(i).attr('y'));			//网关Y坐标
					var line = _this.svg_tips.append('line')
						.attr({ 'y1': gatewayTextY-10 , 'x1': imgWidth + marginLeft*2 + 300 , 'y2': gatewayTextY , 'x2': imgWidth + marginLeft*2 + 300 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });
						drawRouter(_this.aServerSubnet[i][n-1].routers,gatewayTextY-10,imgWidth + marginLeft*2 + 300);						//画路由/外网
				}
				if(_this.aServerSubnet[i][n-1].routers.length > 1){
					var gatewayTextY	= parseInt($('.gatewayText').eq(i).attr('y'));			//网关Y坐标

					var pf = _this.aServerSubnet[i][n-1].routers.length*routerHeight/_this.aServerSubnet[i][n-1].routers.length;
					//路由竖线
					var line = _this.svg_tips.append('line')
						.attr({ 'y1': gatewayTextY-pf , 'x1': imgWidth + marginLeft*2 + 300 , 'y2': gatewayTextY+(routerHeight+22)*_this.aServerSubnet[i][n-1].routers.length-pf , 'x2': imgWidth + marginLeft*2 + 300 })
						.style({ "stroke": '#fff' , "stroke-width": 2 })
						.classed('routerLine',true);
					drawRouter(_this.aServerSubnet[i][n-1].routers,gatewayTextY-pf,imgWidth + marginLeft*2 + 300);							//画路由/外网
				}
				//虚机ip连线的y2坐标
				serverIpLineY2	= parseInt($('.serverIpLine').eq(i).attr('y2')) ? parseInt($('.serverIpLine').eq(i).attr('y2'))+10 : 0;
							h	= _this.aServerSubnet[i][n-1].routers.length*routerHeight+10;
				//svg重新定义高度
				if(parseInt($('.routerLine').eq($('.routerLine').length-1).attr('y2'))+10 > tipsHeight-10){
					var svgHeight	= parseInt($('.routerLine').eq($('.routerLine').length-1).attr('y2'))+40;
					_this.svg_tips.attr("height",svgHeight);
					$(".topoTips").eq(0).css("overflowY",'scroll');		//加滚动条
					serverSubLine.attr('y2',svgHeight);					//虚机概括线重新赋Y坐标值
				}

				//重新定义虚机ip line y2坐标
				serverSubLine.attr('y2',svgHeight);
			}

			//画路由/外网
			function drawRouter(aRouter,y,x){
				var routerNameW		= 220;						//路由名称最大宽度

				for(var i=0; i<aRouter.length; i++){

					//画路由ip
					_this.svg_tips.append('text')
						.text(aRouter[i].router_ip_address)
						.attr({y: y+10+60*i , x: x+10 , fill: '#fff'});

					//画路由图标
					_this.svg_tips.append('image')
						.attr({ 'y': y-10+60*i , 'x': x+130 })
						.classed('tips-routerImg',true)
						.attr({ "xlink:href": dataJson.imgURL+'router_icon_small.png' , "width": routerWidth , "height": routerHeight });

					//画路由name
					var routerName = _this.svg_tips.append('text')
						.text(aRouter[i].router_name)
						.attr({y: y+32+60*i , x: x+130 , fill: '#fff' , 'font-size': 12})
						.classed('dRouterName',true);

					var touterL		= x+130;												//路由图标到左边的距离

					//居中虚机名称并截取文字
					var routerNameLen	= document.getElementsByClassName("dRouterName");
					var nameLength		= routerNameLen[nn].getComputedTextLength();
					var len				= $('.dRouterName').eq(nn).text();
					if(nameLength > routerNameW){
						var letterSize		= nameLength/len.length;
						var sn				= len.substring(0,routerNameW/letterSize-2);
						routerName.text(sn+'...');
					}

					var L	= touterL + routerWidth/2 - routerNameLen[nn].getComputedTextLength()/2;
					$('.dRouterName').eq(nn).attr({"x": L});

					if(aRouter[i].r_ip){
						//画外网ip
						var serverName = _this.svg_tips.append('text')
							.text(aRouter[i].r_ip)
							.attr({y: y+10+60*i , x: x+165 , fill: '#fff'});

						//画外网段
						var serverName = _this.svg_tips.append('text')
							.text(aRouter[i].ext_ip)
							.attr({y: y+10+60*i , x: x+285 , fill: '#fff'});
					}

					//普通用户
					if(aRouter[i].networkName){
						//画外网name连接线
						_this.svg_tips.append('line')
							.attr({y1: y+5+60*i , x1: x+165 , y2: y+5+60*i , x2: x+200})
							.style({ "stroke": '#fff' , "stroke-width": 2 });

						//画外网name
						_this.svg_tips.append('text')
							.text(aRouter[i].networkName)
							.attr({y: y+8+60*i , x: x+205 , fill: '#fff'});
					}
					nn++;
				}
			}
			//tips svg重新分配高度
			var tipsLen		= $('.tips-routerImg');
			var tipsH		= parseInt(tipsLen.eq(tipsLen.length-1).attr('y'))+80;
			if(tipsH > _this.tipsHeight){
				_this.svg_tips.attr("height",tipsH);
				$(".topoTips").eq(0).css("overflowY",'scroll');		//加滚动条
				serverSubLine.attr('y2',tipsH);					//虚机概括线重新赋Y坐标值
			}
		}
	}


	/***********************路由详情***********************/
	Topo.prototype.routerDetailFn	= function(obj){
		var _this				= this;
		var aFixed_ips			= [];							//路由对应数据
		var aRouterData			= [];							//路由子网id
		var aSubnetsData		= [];							//路由对应子网(外部网络与内部网络子网)
		var maxTextLen			= [];							//网关文字长度数组
		var aTextY				= [];							//网关文字Y坐标
		var routerTextW			= 140;							//路由名称最大宽度
		var tipsWidth			= 650;							//tips宽度

		if(this.svg_tips){
			this.svg_tips.remove();
		}

		$(".topoTipsContent").html('');
		$(".topoTips").eq(0).css({ 'width': tipsWidth });
		var tipsHeight			= $('.topoTips').height()-20;
		this.svg_tips			= d3.select(".topoTipsContent").append("svg").attr({ "width": tipsWidth , "height": tipsHeight-10 }).classed("svg_tips",true);		//创建tips svg画布

		//提取路由数据---管理员
		for(var i=0; i<_this.json.ports.length; i++){
			if(_this.json.ports[i]['device_id'] === obj.ids && _this.json.ports[i]['fixed_ips'].length){
				aFixed_ips.push(_this.json.ports[i]['fixed_ips'][0]);
			}
		}

		//提取路由数据---普通用户
		/*if(_this.json.is_superuser === false){
			for(var i=0; i<_this.json.routers.length; i++){
				if(_this.json.routers[i]['id'] === obj.ids && _this.json.routers[i]['external_gateway_info']){
					aFixed_ips.push(_this.json.ports[i]['fixed_ips'][0]);
				}
			}
		}*/

		if(obj.ibtn === 0){					//内部网络
			getRouterDataFn({ ext: false , shared: false });
		}
		else if(obj.ibtn === 1){			//共享网络
			getRouterDataFn({ ext: false , shared: true });
		}
		else{
			//其它功能
		}

		function getRouterDataFn(json){
			//管理员数据
			for(var i=0; i<aFixed_ips.length; i++){
				for(var n=0; n<_this.json.networks.length; n++){
					for(var k=0; k<_this.json.networks[n]['subnets'].length; k++){
						if(aFixed_ips[i]['subnet_id'] === _this.json.networks[n]['subnets'][k]['id']){
							var subs	= _this.json.networks[n]['subnets'][k];
							subs['router:external'] 	= _this.json.networks[n]['router:external'];
							subs['shared'] 				= _this.json.networks[n]['shared'];
							aRouterData.push(aFixed_ips[i]);
							aSubnetsData.push(subs);
						}
					}
				}
			}

			var aNetwork	= [];				//内部网络/共享网络
			var aRouter		= [];				//路由对应的内部网络或共享网络
			var extNetwork	= [];				//外部网络
			var extRouter	= [];				//路由对应外部网络

			//提取网络与路由对应的外部网络、内部网络、共享网络数据
			for(var i=0; i<aSubnetsData.length; i++){
				if(aSubnetsData[i]['router:external'] === json.ext && aSubnetsData[i]['shared'] === json.shared){
					aNetwork.push(aSubnetsData[i]);
					aRouter.push(aRouterData[i]);
				}
				if(aSubnetsData[i]['router:external']){
					extNetwork.push(aSubnetsData[i]);
					extRouter.push(aRouterData[i]);
				}
			}

			//**********普通用户
			if(_this.json.is_superuser === false){
				for(var j=0; j<_this.json.routers.length; j++){
					if(_this.json.routers[j].external_gateway_info && _this.json.routers[j].id === obj.ids){
						for(var d=0; d<_this.json.networks.length; d++){
							if(_this.json.networks[d]['router:external'] && _this.json.networks[d]['id'] === _this.json.routers[j].external_gateway_info.network_id){
								 extNetwork.push(_this.json.networks[d]['name']);
							}
						}
					}
				}
			}

			//连线
			if(aNetwork.length === 0 && extNetwork.length === 0){
				var tipsMsg		= $(".tips-msg").eq(2);
				_this.svg_tips.append('text')
					.text(tipsMsg.html())
					.attr({ 'y': tipsHeight/2 , 'x': (tipsWidth - tipsMsg.width())/2 , 'fill': '#fff' , 'font-size': '14' })
			}
			else{
				if(aNetwork.length === 0 && extNetwork.length > 0){					//有外部网络无内部网络或共享网络
					//画路由
					_this.svg_tips.append('image')
						.attr({ 'y': 30 , 'x': 310 })
						.attr({ "xlink:href": "/static/bootstrap/img/router_icon_small.png" , "width": 30 , "height": 30 });

					//路由名称
					var t = _this.svg_tips.append('text')
						.text(obj.name)
						.attr({ 'y': 72 , 'x': 310 , 'fill': '#fff' , 'font-size': '12' })
						.classed('tipsRouterName',true);
						var routerLength	= document.getElementsByClassName('tipsRouterName')[0].getComputedTextLength();
						t.attr({'x': 35-routerLength/2 + 290});

					//路由连接外网线条
					_this.svg_tips.append('line')
						.attr({'y1': 45 , 'x1': 345 , 'y2': 45 , 'x2':380 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					//管理员用户
					if(_this.json.is_superuser === true){
						//外部网络网关
						_this.svg_tips.append('text')
							.text(extRouter[0]['ip_address'])
							.attr({ 'y': 48 , 'x': 385 , 'fill': '#fff' , 'font-size': '12' });

						//外部网络ip
						_this.svg_tips.append('text')
							.text(extNetwork[0]['cidr'])
							.attr({ 'y': 48 , 'x': 495 , 'fill': '#fff' , 'font-size': '14' });
					}
					else{																			//普通用户
						_this.svg_tips.append('text')
							.text(extNetwork[0])
							.attr({ 'y': 48 , 'x': 385 , 'fill': '#fff' , 'font-size': '12' });
					}

				}
				else if(aNetwork.length > 0 && extNetwork.length === 0){			//有内部网络或共享网络无外部网络

					for(var i=0; i<aNetwork.length; i++){
						//共享网络/内部网络网关
						_this.svg_tips.append('text')
							.text(aNetwork[i]['cidr'])
							.attr({ 'y': 30+30*i , 'x': 20 , 'fill': '#fff' , 'font-size': '14' });

						//共享网络/内部网络ip
						_this.svg_tips.append('text')
							.text(aRouter[i]['ip_address'])
							.attr({ 'y': 30+30*i , 'x': 165 , 'fill': '#fff' , 'font-size': '12' })
							.classed('det_routerLine',true);

						//网关文字长度
						var el	= document.getElementsByClassName('det_routerLine');
							maxTextLen.push(el[i].getComputedTextLength());

						aTextY.push($('.det_routerLine').eq(i).attr('y'));
					}
					//概括网络线条
					_this.svg_tips.append('line')
						.attr({'y1': $('.det_routerLine').eq(0).attr('y')-8 , 'x1': 165+d3.max(maxTextLen)+8 , 'y2': 30+(aNetwork.length-1)*30 , 'x2':165+d3.max(maxTextLen)+8 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					//网络连接路由线条
					var y	= eval(aTextY.join('+'));
					_this.svg_tips.append('line')
						.attr({'y1': y/aNetwork.length-4 , 'x1': 165+d3.max(maxTextLen)+12 , 'y2': y/aNetwork.length-4 , 'x2':165+d3.max(maxTextLen)+54 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					//画路由
					_this.svg_tips.append('image')
						.attr({ 'y': y/aNetwork.length-17 , 'x': 165+d3.max(maxTextLen)+57 })
						.attr({ "xlink:href": "/static/bootstrap/img/router_icon_small.png" , "width": 30 , "height": 30 });

					//路由名称
					var t = _this.svg_tips.append('text')
						.text(obj.name)
						.attr({ 'y': y/aNetwork.length+25 , 'x': 165+d3.max(maxTextLen)+50 , 'fill': '#fff' , 'font-size': '12' })
						.classed('tipsRouterName',true);
						var routerLength	= document.getElementsByClassName('tipsRouterName')[0].getComputedTextLength();
						t.attr({'x': 165+d3.max(maxTextLen)+72-routerLength/2});


						//居中虚机名称并截取文字
						var routerNameLen	= document.getElementsByClassName("tipsRouterName")[0];
						var nameLength		= routerNameLen.getComputedTextLength();
						var len				= $('.tipsRouterName').eq(0).text();

						if(nameLength > routerTextW){
							var letterSize		= nameLength/len.length;
							var sn				= len.substring(0,routerTextW/letterSize-2);
							t.text(sn+'...');
						}
						var L	= 165+d3.max(maxTextLen)+57 + 30/2 - routerNameLen.getComputedTextLength()/2;
						$('.tipsRouterName').eq(0).attr({"x": L});

				}
				else{																//外部内部共享网络都有的情况
					for(var i=0; i<aNetwork.length; i++){
						//共享网络/内部网络ip
						_this.svg_tips.append('text')
							.text(aNetwork[i]['cidr'])
							.attr({ 'y': 30+30*i , 'x': 20 , 'fill': '#fff' , 'font-size': '14' });

						//共享网络/内部网络网关
						_this.svg_tips.append('text')
							.text(aRouter[i]['ip_address'])
							.attr({ 'y': 30+30*i , 'x': 165 , 'fill': '#fff' , 'font-size': '12' })
							.classed('det_routerLine',true);

						//网关文字长度
						var el	= document.getElementsByClassName('det_routerLine');
							maxTextLen.push(90);

						aTextY.push($('.det_routerLine').eq(i).attr('y'));
					}

					//概括网络线条
					_this.svg_tips.append('line')
						.attr({'y1': $('.det_routerLine').eq(0).attr('y')-8 , 'x1': 165+d3.max(maxTextLen)+8 , 'y2': 30+(aNetwork.length-1)*30 , 'x2':165+d3.max(maxTextLen)+8 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					//网络连接路由线条
					var y	= eval(aTextY.join('+'));
					_this.svg_tips.append('line')
						.attr({'y1': y/aNetwork.length-4 , 'x1': 165+d3.max(maxTextLen)+12 , 'y2': y/aNetwork.length-4 , 'x2':165+d3.max(maxTextLen)+54 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					//画路由
					_this.svg_tips.append('image')
						.attr({ 'y': y/aNetwork.length-17 , 'x': 165+d3.max(maxTextLen)+57 })
						.attr({ "xlink:href": "/static/bootstrap/img/router_icon_small.png" , "width": 30 , "height": 30 });

					//路由名称
					var t = _this.svg_tips.append('text')
						.text(obj.name)
						.attr({ 'y': y/aNetwork.length+25 , 'x': 165+d3.max(maxTextLen)+50 , 'fill': '#fff' , 'font-size': '12' })
						.classed('tipsRouterName',true);
						var routerLength	= document.getElementsByClassName('tipsRouterName')[0].getComputedTextLength();
						t.attr({'x': 165+d3.max(maxTextLen)+72-routerLength/2});

					//路由连接外网线条
					_this.svg_tips.append('line')
						.attr({'y1': y/aNetwork.length-4 , 'x1': 165+d3.max(maxTextLen)+90 , 'y2': y/aNetwork.length-4 , 'x2':165+d3.max(maxTextLen)+130 })
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					//管理用户----外部网络网关
					if(_this.json.is_superuser === true){
						//外部网络网段
						_this.svg_tips.append('text')
							.text(extRouter[0]['ip_address'])
							.attr({ 'y': y/aNetwork.length , 'x': 165+d3.max(maxTextLen)+135 , 'fill': '#fff' , 'font-size': '12' });

						//外部网络ip
						_this.svg_tips.append('text')
							.text(extNetwork[0]['cidr'])
							.attr({ 'y': y/aNetwork.length , 'x': 165+d3.max(maxTextLen)+240 , 'fill': '#fff' , 'font-size': '14' });
					}
					//普通用户---不显示外网ip
					else{
						_this.svg_tips.append('text')
							.text(extNetwork[0])
							.attr({ 'y': y/aNetwork.length , 'x': 165+d3.max(maxTextLen)+135 , 'fill': '#fff' , 'font-size': '12' });
					}
				}
				//判断有无滚动条
				if(aNetwork.length >= 10){
					_this.svg_tips.attr({height: aNetwork.length*31});
					$(".topoTips").eq(0).css("overflowY",'scroll');
				}
				else{
					$(".topoTips").eq(0).css("overflowY",'visible');
				}
			}

		}

	}

	/***********************内部网络/共享网络详情***********************/
	Topo.prototype.privateNetworkDetailFn	= function(obj){
		var _this		= this;
		var aNetwork	= [];									//内部网络或共享网络
		var aCompute	= [];									//虚机数据
		var imgHeight	= 40;									//网络icon的高度
		var imgWidth	= 40;									//网络icon的宽度
		var left		= 50;
		var iServerNum	= 0;									//虚机数量
		var serverTextW	= 210;									//虚机名称最大长度
		var tipsWidth	= 650;									//tips宽度

		if(this.svg_tips){
			this.svg_tips.remove();
		}

		$(".topoTipsContent").html('');
		$(".topoTips").eq(0).css({ 'width': tipsWidth });
		$(".topoTips").eq(0).css("overflowY",'visible')
		var tipsHeight			= $('.topoTips').height()-50;
		this.svg_tips			= d3.select(".topoTipsContent").append("svg").attr({ "width": "100%" , "height": tipsHeight }).classed("svg_tips",true);		//创建tips svg画布

		//内部网络/共享网络
		if(obj.ibtn === 0){
			getData({'ext': false , 'shared': false});
		}
		else if(obj.ibtn === 1){
			getData({'ext': false , 'shared': true});
		}
		else{
			//其他功能
		}

		//提取数据
		function getData(b){
			//networks数据
			for(var i=0; i<_this.json.networks.length; i++){
				if(_this.json.networks[i]['router:external'] === b.ext && _this.json.networks[i]['shared'] === b.shared && _this.json.networks[i]['id'] === obj.ids){
					aNetwork.push(_this.json.networks[i]);
				}
			}
			//虚机数据
			for(var k=0; k<_this.json.ports.length; k++){
				if(_this.json.ports[k]['network_id'] == obj.ids && _this.json.ports[k]['device_owner'].indexOf('compute')>=0){
					aCompute.push(_this.json.ports[k]);
				}
			}
		}

		//画图
		if(aCompute.length === 0){						//网络没有链接虚机
			var tipsMsg	= $('.tips-msg').eq(1);
			_this.svg_tips.append('text')
				.text(tipsMsg.html())
				.attr({ 'y': tipsHeight/2 , 'x': (tipsWidth-tipsMsg.width())/2 , 'fill': '#fff' , 'font-size': '14' });
		}
		else{
			//画网络图标
			_this.svg_tips.append('image')
				.attr({ 'y': (tipsHeight-imgHeight)/2-3 , 'x': left })
				.attr({ "xlink:href": "/static/bootstrap/img/networkIcon.png" , "width": imgWidth , "height": imgHeight });

			//网络name
			var tt = _this.svg_tips.append('text')
				.text(obj.name)
				.attr({ 'y': (tipsHeight-imgHeight)/2 + imgHeight + 12 , 'x': 0 , 'fill': '#fff' , 'font-size': '14' })
				.classed('detNetworkName',true);
			var el			= document.getElementsByClassName('detNetworkName');
			var txtLeft		= left + imgWidth/2 - el[0].getComputedTextLength()/2;
			tt.attr({'x': txtLeft});

			//画链接网络line
			_this.svg_tips.append('line')
				.attr({'y1': (tipsHeight-imgHeight)/2 + imgHeight/2 , 'x1': left + imgWidth + 5 , 'y2': (tipsHeight-imgHeight)/2 + imgHeight/2 , 'x2': left + imgWidth + left})
				.style({ "stroke": '#fff' , "stroke-width": 2 });

			//画竖线
			var line = _this.svg_tips.append('line')
				.attr({'y1': 10 , 'x1': left + imgWidth + left + 5 , 'y2': tipsHeight - 10 , 'x2': left + imgWidth + left + 5})
				.style({ "stroke": '#fff' , "stroke-width": 2 });

			var aSubnet		= [];		//子网网段
			var aServers	= [];		//虚机
			var aServersL	= [];		//临时存储虚机
			for(var i=0; i<aNetwork.length; i++){
				for(var n=0; n<aNetwork[i]['subnets'].length; n++){
					//aSubnet.push(aNetwork[i]['subnets'][n]);

					//虚机ip
					for(var k=0; k<aCompute.length; k++){
						if(aCompute[k]['fixed_ips'][0]['subnet_id'] === aNetwork[i]['subnets'][n]['id']){
							var aSub	= aNetwork[i]['subnets'][n];
							for(var j=0; j<_this.json.servers.length; j++){
								if(_this.json.servers[j]['id'] === aCompute[k]['device_id']){
									aCompute[k]['serverName'] = _this.json.servers[j]['name'];
								}
							}
							aServersL.push(aCompute[k]);
						}
					}

					//aSub有值就push
					if(aSub){
						aSubnet.push(aSub);
						aSub	= '';
					}

					//aServersL有值push
					if(aServersL.length){
						aServers.push(aServersL);
						aServersL	= [];
					}
				}
			}

			for(var i=0; i<aSubnet.length; i++){
				var serverY		= $('.subnetServer').eq($('.subnetServer').length - 1).attr('y') ? parseInt($('.subnetServer').eq($('.subnetServer').length - 1).attr('y'))+60 : 0;
				//子网网段
				var tt = _this.svg_tips.append('text')
					.text(aSubnet[i]['cidr'])
					.attr({ 'y': 30 + 30*i , 'x': left + imgWidth + left + 10 , 'fill': '#fff' , 'font-size': '14' });

				for(var k=0; k<aServers[i].length; k++){
					tt.attr({'y': aServers[i].length*60/2+serverY});		//修改子网的y坐标

					//子网段竖线
					var line2 = _this.svg_tips.append('line')
						.attr({'y1': 60/2-10+serverY , 'x1': left + imgWidth + left + 5 + 140 + 5 , 'y2': 30 + 60*k+serverY , 'x2': left + imgWidth + left + 5 + 140 + 5})
						.style({ "stroke": '#fff' , "stroke-width": 2 });

					_this.svg_tips.append('text')
						.text(aServers[i][k]['fixed_ips'][0]['ip_address'])
						.attr({ 'y': 30 + 60*k+serverY , 'x': left + imgWidth + left + 160 , 'fill': '#fff' , 'font-size': '12' });

					//插入虚机
					_this.svg_tips.append('image')
						.attr({ 'y': 60*k+10+serverY , 'x': left + imgWidth + left + 260 })
						.attr({ "xlink:href": "/static/bootstrap/img/server_icon_small.png" , "width": imgWidth , "height": imgHeight })
						.classed('subnetServer',true);

					//插入虚机名称
					var subnetServerName = _this.svg_tips.append('text')
						.text(aServers[i][k]['serverName'])
						.attr({ 'y': 60*k+63+serverY , 'x': left + imgWidth + left + 260 , 'fill': '#fff' , 'font-size': '12' })
						.classed('subnetServerName',true);

					var serverL		= left + imgWidth + left + 260;								//虚机图标到左边的距离

					//居中虚机名称并截取文字
					var serverNameLen	= document.getElementsByClassName("subnetServerName")[iServerNum];
					var nameLength		= serverNameLen.getComputedTextLength();
					var len				= $('.subnetServerName').eq([iServerNum]).text();

					if(nameLength > serverTextW){
						var letterSize		= nameLength/len.length;
						var sn				= len.substring(0,serverTextW/letterSize-2);
						subnetServerName.text(sn+'...');
					}
					var L	= serverL + imgWidth/2 - serverNameLen.getComputedTextLength()/2;
					$('.subnetServerName').eq(iServerNum).attr({"x": L});

					iServerNum++;			//累计虚机数量
				}
			}

			//加滚动条
			if(tipsHeight < iServerNum*64){
				this.svg_tips.attr({'height': iServerNum*64});
				$(".topoTips").eq(0).css("overflowY",'scroll');
				line.attr('y2',iServerNum*64-5);
			}
		}
	}

	//svg自适应
	Topo.prototype.svgAuto		= function(){
		var maxWidth		= d3.max(this.svgMaxWidth);
		if(!maxWidth || (maxWidth < this.w)){
			maxWidth = this.w;
		}
		var servers			= $('.serverWrap');
		var arrTop			= [];
		for(var i=0; i<servers.length; i++){
			arrTop.push(servers.eq(i).attr('y'));
		}
		var maxHeight		= [];
		maxHeight.push(parseInt(d3.max(arrTop))+80);
		maxHeight.push(parseInt($('.privateRectTwo').eq($('.privateRectTwo').length-1).attr('y')));
		maxHeight.push(parseInt($(window).height() - $('.js-topo').height())-90);

		this.svg.attr({width: maxWidth});
		this.svg.attr({height: d3.max(maxHeight)});
		$('.extRectTwo').attr({width: maxWidth-this.title_width});
		$('.privateRectTwo').attr({width: maxWidth-this.title_width});
		$('.sharedRectTwo').attr({width: maxWidth-this.title_width});
	}

	return Topo;

})(jQuery);
