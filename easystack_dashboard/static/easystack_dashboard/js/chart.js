/*
** 图表
** @author Xu XinWei
** @date 2014-09-12
*/
//图表
var ChartObj  = (function($){
  //构造函数
  function Structure(){
    this.timeEnd  = 'period_end';
    this.val      = 'avg';
    this.padding  = { p10: 10 , p20: 20, p30: 30, p40: 40, p50: 50 };
    this.r0       = 4;
    this.duration = 500;
    this.iNow   = null;
    this.unit   = '';
    this.ii     = 0;
    this.iii    = 0;
    this.countWidth = 0;
  }

  //init
  Structure.prototype.init  = function(config){
    var _this     = this;
    _this.config  = config;

    _this.w   = parseInt($(config.label).parent().width());
    _this.h   = parseInt($(config.label).parent().height())-44;

    //get data
    _this.getData();

    //如果timeTag、valueTag有值就替换
    if(_this.config.url.timeTag){
      this.timeEnd  = _this.config.url.timeTag;
    }

    if(_this.config.url.valueTag){
      this.val    = _this.config.url.valueTag;
    }

    if(this.svg){
      this.svg.remove();
    }
  };

  //取数据
  Structure.prototype.getData = function(){
    var _this   = this;
      //定时器时间
      _this.t   = _this.config.time == 2 ? 2000 : 900000;
      _this.datas = [];
    var ibtn    = true, iSwitch = 1, times,rid; 

    ajaxGetData();

    function ajaxGetData(){

      if(_this.config.url.rid){
        _this.urls  = _this.config.url.detail;
        rid     = _this.config.url.rid;
      }else{
        _this.urls  = _this.config.url.detail;
        rid     = _this.config.url.rid;
      }

      if(_this.config.time == 2 && iSwitch){
        times     = 2;
        iSwitch   = 0;
      }else{
        times     = _this.config.time;
      }
      _this.d   = { 'meter': _this.config.url.meter,'date_options': times,'rid': rid };

      //loading
      if(ibtn){
        var logdingLeft = (_this.w -16)/2 + 'px';
        var logdingTop  = (_this.h -16)/2 + 'px';
        $(_this.config.label).append('<span class="loadingPic"></span>');
        $('.loadingPic').css({left: logdingLeft , top: logdingTop});
        ibtn  = 0;
      }

      var sig  = _this.config.time;
      $.ajax({
          url: _this.urls,
          data: _this.d,
          type: 'GET',
          success: function(data,textStatus) {
            if(_this.config.time === '2'){
               _this.datas.push(eval(data)[0]);
            }
            else{
               _this.datas = eval(data);
            }

            //数据超出360条就删除
            if(_this.datas.length > 150){
              _this.datas.shift();
            }

            //设置数据
            _this.setData();

           clearTimeout(_this.iNow);
           _this.iNow = setTimeout(ajaxGetData , _this.t);
          },
          error: function(jqXHR, status, errorThrown) {
            //获取暂无数据文字
             var noneData = $('#noneData').html();
             $(_this.config.label).html('');
             d3.select(_this.config.label)
            .append('p')
            .style({ 'width': _this.w+'px' , 'heigth': _this.h+'px' , 'line-height': _this.h+'px' , 'text-align': 'center' })
            .html(noneData);
            return false;
          }
      });
    };

  };

  // Set max number
  Structure.prototype.maxNum = function(){
    var valList = [],
        maxNum,
        len,
        divisor = 1,
        maxVal;

    for(var k=0; k<this.dataset.length; k++){
      valList.push(this.dataset[k]['val']);
    }

    maxNum = Math.ceil(Math.max.apply(null, valList));
    len = maxNum.toString().length;

    if(maxNum>=10 && len >= 2){
      for(var i=0; i<len-1; i++){
        divisor += '0';
      }
      maxVal = Math.ceil(maxNum/divisor)*divisor;
    }else if(maxNum <= 5){
      maxVal = 5;
    }else{
      maxVal = 10;
    }
    return maxVal;
  };

  //设置数据
  Structure.prototype.setData = function(){
    var _this     = this;

    //处理过数据
    this.dataset  = [];

    //数据处理
    for(var i=0,len=_this.datas.length; i<len; i++ ){
      if(_this.datas[i]){
        var timeEnd   = _this.datas[i][this.timeEnd];
        var val     = _this.datas[i][this.val] ? _this.datas[i][this.val] : 0;
        _this.dataset.push({ 'time': timeEnd , 'val': parseFloat(val) });
        var vals    = val+'';
        if(vals.charAt(vals.length-1) === '%'){
          _this.unit    = vals.charAt(vals.length-1);
        }
      }
    }

    //判断有无数据cpuUsedCores
    if(this.dataset.length === 0){
      $(this.config.label).html('');
      var noneData  = $('#noneData').html();
      d3.select(this.config.label)
        .append('p')
        .style({ 'width': _this.w+'px' , 'heigth': _this.h+'px', 'line-height': _this.h+'px' , 'text-align': 'center' })
        .html(noneData);
      return false;
    }
    else{
      $(this.config.label).html('');
    }

    //判断最大数值
    this.maxVal = this.maxNum();
    this.maxValLength = (this.maxVal+'').length+1;

    //时间格式转换
    this.parse    = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

    this.ii++;
    if(this.w-this.padding.p10-this.ii*(this.w/150) <= this.padding.p10){
      this.countWidth = this.padding.p10*(_this.config.url.f ? 1 : this.maxValLength);
    }else{
      this.countWidth = this.w-this.padding.p10-this.ii*(this.w/150);
    }

    if(_this.config.time != '2'){
      this.x2 = d3.time.scale()
        .range([this.padding.p10*(this.maxValLength) , _this.w-this.padding.p10]);
    }else{
      this.x2 = d3.time.scale()
        .range([this.countWidth , _this.w-this.padding.p10]);
    }

    this.y2 = d3.scale.linear()
      .range([_this.h-this.padding.p20, this.padding.p10]);

    if(this.dataset.length%15==0 && this.dataset.length < 150){
      this.iii++;
    }

    if(this.dataset.length>=150){
      this.iii=5;
    }

    if(_this.config.time == '2'){
        this.xAxis = d3.svg.axis()
          .scale(this.x2)
          .orient('bottom')
          .tickSize(_this.h-12, 6)
          .ticks(this.iii)
          .tickFormat(d3.time.format('%H:%M')); 
    }else{
      this.xAxis = d3.svg.axis()
        .scale(this.x2)
        .orient('bottom')
        .tickSize(_this.h-12, 6)
        .ticks(6);
    }

    this.yAxis = d3.svg.axis()
      .scale(this.y2)
      .orient('left')
      .tickSize(-(this.w-this.padding.p10*this.maxValLength-this.padding.p10))
      .tickPadding(10)
      .ticks(3);

    this.line2 = d3.svg.line()
      .x(function(d) { return _this.x2(d.time); })
      .y(function(d) { 
        return _this.y2(d.val); 
      });

    //画图
    this.draw();
  };

  //画图
  Structure.prototype.draw  = function(){
    var _this = this;
    if(this.svg){
      this.svg.remove();
    }

    //创建svg
    this.svg    = d3.select(this.config.label)
      .append('svg')
      .attr({width: _this.w , height: _this.h});

    this.maxVal = this.maxNum();

    this.dataset.forEach(function(d) {
      d.time    = _this.parse(d.time);
    });

    this.x2.domain(d3.extent(this.dataset, function(d) { return d.time; }));
    this.y2.domain([0, this.maxVal]);

    //画x轴
    if(!_this.config.url.f){
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + 0 + ')')
      .call(this.xAxis);
    }
    else{
      this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (this.h-this.padding.p20) + ')')
        .call(this.xAxis);
    }

    //画y轴
    this.svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('+ this.padding.p10*(this.maxValLength == 1 ? 2 : this.maxValLength) + ',0)')
      .call(this.yAxis);

    //画折线
    this.path = this.svg.append('g')
      .classed('path',true)
      .append('path')
          .attr('class', 'line')
          .attr('d', this.line2(this.dataset));

    //画圆点
    var g = this.svg
        .append('g')
    .classed('g',true)
        .append('circle')
        .attr('class', 'linecircle')
        .attr('r', _this.r0)
        .attr({'fill-opacity': 0 , 'stroke-opacity': 0});

    //tips
    var tips  = d3.select(this.config.label)
      .append('div')
      .classed('chartTips',true);

    var wording1 = tips.append('p')
          .attr('class', 'tips-text');

    var wording2 = tips.append('p')
      .attr('class', 'tips-text');

    var self  = null;
    var nav = navigator.userAgent.toLowerCase(),v;
        v = nav.match(/firefox/);

    this.svg
      .on('mousemove',function(){
        self  = $(this);
        var m = d3.mouse(this),
            cx  = m[0];
        if(v){
          cx = cx + 652;
        }
        //tips显示
        showTips(cx);
        $(this).parent().find('.chartTips').css('display', 'block');
      })
      .on('mouseout', function() {
        $(this).parent().find('.chartTips').css('display', 'none');
        $(this).parent().find('.linecircle').attr({'fill-opacity': 0 , 'stroke-opacity': 0});
      });

    //tips显示
    function showTips(cx){
      var x0  = _this.x2.invert(cx);
      var i   = (d3.bisector(function(d) {
        return d.time;
      }).left)(_this.dataset, x0, 1);

      var d0  = _this.dataset[i - 1],
      d1  = _this.dataset[i] || {},
      d   = x0 - d0.time > d1.time - x0 ? d1 : d0;

      function formatWording(d) {
        return 'date：' + d3.time.format("%Y-%m-%dT%H:%M:%S")(d.time).substr(0,10) + ' ' + d3.time.format("%Y-%m-%dT%H:%M:%S")(d.time).substr(11,19);
      }

      wording1.html(formatWording(d));
      wording2.html('value：' + d.val+_this.unit);

      var x1 = _this.x2(d.time),
          y1 = _this.y2(d.val);

      //显示圆点
      self.find(".linecircle").attr({ cy: y1 , cx: x1 , 'fill-opacity': 1 , 'stroke-opacity': 1 });

      // 处理超出边界的情况
      var dx = x1 > _this.w ? x1 - _this.w + 200 : x1 + 200 > _this.w ? 200 : 0;

      var dy = y1 > _this.h ? y1 - _this.h + 50 : y1 + 50 > _this.h ? 50+8 : -6;

      x1 -= dx;
      y1 -= dy;

      self.parent().find('.chartTips').css({ top: y1 , left: x1 });
    }
  };
  return Structure;
})(jQuery);

// Marathon monitor class
var MarathonApps = (function($){
  var MarathonApp = function(){};

  MarathonApp.prototype = new ChartObj();

  MarathonApp.prototype.constructor = MarathonApps;

  MarathonApp.prototype.init = function( config ){
    var _this     = this;
    _this.config  = config;

    _this.w   = 835;
    _this.h   = 136;

    if(this.svg){
      this.svg.remove();
    }
  };

  MarathonApp.prototype.getData = function(val){
    this.datas = val;
    this.setData();
  };

  return MarathonApp;
})(jQuery);

var appsMatrix = (function($){

  var
    init,
    createObj,
    callObj,
    objQueue = [],
    data,
    isCreated = true;

  createObj = function(val){
    if ( !isCreated ) return false;

    for(var i=0; i<data.length; i++){
      var config = { 'label': '.js-svg-'+i, url: {} };

      objQueue.push( new MarathonApps() );
      objQueue[i].init( config );
    }

    isCreated = false;
  };

  callObjQueue = function(){
    for(var i=0,len=objQueue.length; i<len; i++){
      objQueue[i].getData(data[i]);
    }
  };

  init = function( val ){
    data = val;
    createObj();
    callObjQueue();
  };

  return { init: init };

})(jQuery);

//图表控制层
var chartControl = (function($){

  function control(arr){
    //countWidth();       //计算图表的宽度
    var o = [];   
    for(var i=0; i<arr.length; i++){
      o.push(new ChartObj());

      o[i].init({ time: 1 , label: '.js-svg'+i , url: arr[i] });
    }
    //最近一天 最近一周 最近一月 最近半年 控制
    $('.js-chartBtn').bind('click',function(){
      var _this = $(this);
      $('.js-chartBtn').removeClass('active');
      _this.addClass('active');

      var sign  = _this.attr('sign');
      var addr  = _this.attr('url');

      for(var i=0; i<o.length; i++){
        o[i].init({ time: sign , label: '.js-svg'+i , url: arr[i] });
      }

      //关闭实时
      $('.js-chartBtnStop').hide();
      $('.js-chartBtnStart').show();
      //切换时间
      for(var i=0; i<$('.js-interval').length; i++){
        $('.js-interval').eq(i).find('span').addClass("none");
        $('.js-interval').eq(i).find('span').eq($(this).index()).removeClass("none");
      }
    });

    //开启实时
    $('.js-chartBtnStart').bind('click',function(){
      var _this = $(this);  
      _this.hide();
      _this.parent().find('.js-chartBtnStop').show();
      var aSpan = _this.parent().parent().find('.js-interval span');

      aSpan.addClass("none");
      aSpan.eq(4).removeClass("none");

      var index = _this.attr('index'); 
      var sign  = _this.attr('sign');
      var addr  = _this.attr('url');

      o[index].init({ time: sign , label: ('.js-svg'+index) , url: arr[index] });
    });

    //关闭实时
    $('.js-chartBtnStop').bind('click',function(){
      var _this = $(this);  
      _this.hide();
      _this.parent().find('.js-chartBtnStart').show();
      var aSpan = _this.parent().parent().find('.js-interval span');

      aSpan.addClass("none");
      aSpan.eq($("#js-time .active").index()).removeClass("none");

      var index = _this.attr('index'); 
      var sign  = $('#js-time .active').eq(0).attr('sign');
      var addr  = $('#js-time .active').eq(0).attr('url');

      o[index].init({ time: sign , label: ('.js-svg'+index) , url: arr[index] });
    });

    function colsedFn(){
      var aStop = $('.js-chartBtnStop');
      var sign  = $('#js-time .active').eq(0).attr('sign');
      var addr  = $('#js-time .active').eq(0).attr('url');
      for(var i=0; i<aStop.length; i++){
        var index = aStop.eq(i).attr('index');
        o[index].init({ time: sign , label: ('.js-svg'+index) , url: arr[index] });
      }
    }

    $('.modal-colsed').bind('click', function(){
      colsedFn();
    });

    $(document).keydown(function(event){
      if(event.keyCode === 27){
        colsedFn();
      }
    });

    //计算图表的宽度
    function countWidth(){
      var windowWidth   = $(window).width();
      var chartTableWidth = windowWidth - $("#js-leftPane").width() - 20;
      var aChartTable   = $(".chartTable");
      for(var i=0,len=aChartTable.length; i<len; i++){
        aChartTable.eq(i).css({ width: chartTableWidth/2-16 });
      }
    }
    $("#instance_details li").bind("click", countWidth);
  }

  return control;
})(jQuery);