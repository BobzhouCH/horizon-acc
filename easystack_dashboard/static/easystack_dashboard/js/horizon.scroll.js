/*
 *
 * Scroll bar js
 * 2015-09-06
 */

horizon.dropMenu = (function(){
  // Constructors
  var ClassMethod = function(singleListLength){
    this.aDrop      = $('.js-drop');
    this.aDropList  = $('.js-drop-list');
    this.aUl        = $('.js-drop-list ul');
    this.aLi        = $('.js-drop-list li');
    this.liHeight = this.aLi.height();
    this.liWidth  = $('.js-content').width();
    this.dragWrap = $('.js-drag-wrap');
    this.dragBtn  = $('.js-drag-btn');
    this.defTop   = 1;
    this.T        = 0;
    this.singleListLength = singleListLength ? singleListLength : 10;
    $('.js-filter').val('');
    this.dragIsShow();
    this.clickFn();
  },
  that = ClassMethod.prototype, _instance = null, getInstance, T = 0;

  // Display scroll bars
  that.dragIsShow = function(){
    for(var i=0,len=this.aDrop.length; i<len; i++){
      if(this.aUl.eq(i).find('.ele').length > this.singleListLength){
        this.dragWrap.eq(i).css({ display: 'block' });
        this.aDropList.eq(i).css({ height: this.liHeight*this.singleListLength });
      }
      else{
        this.dragWrap.eq(i).css({ display: 'none' });
        this.aDropList.eq(i).css({ height: this.liHeight*(this.aUl.eq(i).find('.ele').length === 0 ? 1 : this.aUl.eq(i).find('.ele').length) });
      }
      var height = Math.pow(parseInt(this.aDropList.eq(i).css('height')), 2)/(this.aUl.eq(i).find('.ele').length*this.liHeight);
      this.dragBtn.eq(i).css({ height: height-12, top: this.defTop });
    }
  };

  that.init = function(){
    var aFilter = $('.js-filter');
    aFilter.val('');
    this.filter(aFilter,aFilter.val());
  };

  // Event module
  that.clickFn  = function(){
    var _this = this;

    // Drag and drop
    _this.dragBtn.bind('mousedown', function(e){
      var self  = $(this);
      _this.dis = e.pageY - $(this).offset().top;

      $(document).bind('mousemove', function(e){
        var y = e.pageY - self.parent().offset().top - _this.dis;
        _this.dragFn(y, self);
      });

      $(document).bind('mouseup', function(){
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
      });

      return false;
    });

    // Wheel event
    $(document).on("mousewheel DOMMouseScroll", '.js-drop-list', function(e){
      var self = $(this);

      var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
      if (delta > 0) {
        // to up
        T = parseInt(self.find('.js-drag-btn').css('top')) - 10;
        _this.mousewheel(self);
      } else{
        // to down
        T = parseInt(self.find('.js-drag-btn').css('top')) + 10;
        _this.mousewheel(self);
      }
      return false;
    });

    // Keyboard event
    $('.js-filter').keyup(function(){
      _this.filter($(this), $.trim($(this).val()));
    });
    $('.js-drop').bind('mouseup', function(){
      $(this).closest('.dropdown').addClass('open');
    });

    // Move the mouse tip
    $('.js-content li a').bind('mouseover', function(){
      var self = $(this);
      var tips = self.closest('.js-drop').find('.js-drop-tips');
      _this.mouseoverTips(tips, self);
    });
    $('.js-content li a').bind('mouseout', function(){
      var self = $(this);
      var tips = self.closest('.js-drop').find('.js-drop-tips').hide();
    });
  };

  // Drag and drop button function
  that.dragFn   = function(y, self){
    var _this    = this;
    var parentUl = self.parent().parent().find('.js-content');
    _this.slide(y, self, parentUl);
  };

  // Wheel function call
  that.mousewheel = function(self){
    var _this    = this;
    var y        = T;
    var parentUl = self.find('.js-content');
    var self     = self.find('.js-drag-btn');
    _this.slide(y, self, parentUl);
  };

  // Sliding function
  that.slide    = function(y, btn, parentUl){
    var _this = this;
    if(y <= 0){
      y = 1;
    }
    if(y >= btn.parent().height() - _this.defTop - btn.height()){
      y = btn.parent().height() - _this.defTop - btn.height();
    }
    btn.css({ top: y });
    parentUl.css({ top: -(y/(btn.parent().height()-btn.height()) * (parentUl.height() - btn.parent().parent().height())) });
  };

  // filter function
  that.filter    = function(self, val){
    var aLi = self.closest('.js-drop').find('.js-content li');
    aLi.hide();
    aLi.removeClass('ele');
    for(var i=0,len=aLi.length; i<len; i++){
      if(aLi.eq(i).find('span').html().toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) >= 0){
        aLi.eq(i).show();
        aLi.eq(i).addClass('ele');
      }
    }
    this.dragIsShow();
  };

  // As the mouse function
  that.mouseoverTips = function(tips,self){
    tips.html(self.find('span').html());
    if(tips.width() > this.liWidth){
      tips.css({ display: 'block', left: -(tips.width()-this.liWidth)/2, top: self.offset().top - tips.parent().offset().top + this.liHeight });
    }
  };

  // Instance
  getInstance   = function(singleListLength){
    return _instance || (_instance = new ClassMethod(singleListLength));
  };

  return {
    getInstance: getInstance
  };

})();

/*
 * selected function
 */
horizon.selecteItem = {
  eventFn: function(){
    var _this = this;
    $('.js-dropdown').bind('click', function(){
      _this.removeClass($('.js-dropdown'));

      if(!$(this).attr('iBtn')){
        _this.addClass($(this));
        $('.js-dropdown').removeAttr('iBtn');
        $(this).attr('iBtn',1);
        horizon.dropMenu.getInstance().init();
      }
      else{
        _this.removeClass($('.js-dropdown'));
        $(this).removeAttr('iBtn');
      }
      return false;
    });

    $('.js-dropdown').bind('mouseenter', function(){
      _this.tipsFn($(this));
    });

    $('.js-dropdown').bind('mouseleave', function(){
      var oTips = $(this).find('.js-toggle-tips');
      oTips.stop();
      oTips.fadeOut("slow");
    });
    $('.js-toggle-tips').bind('click', function(){
      return false;
    });

    $('.js-filter').bind('click',function(){
      return false;
    });

    $(document).bind('click', function(){
      _this.removeClass($('.js-dropdown'));
      $('.js-dropdown').removeAttr('iBtn');
    }).keyup(function(e){
      if(e.keyCode === 27){
        _this.removeClass($('.js-dropdown'));
        $('.js-dropdown').removeAttr('iBtn');
      }
    });
  },
  addClass: function(self){
    var _this = this;
    self.parent().addClass('open');
  },
  removeClass: function(self){
    self.parent().removeClass('open');
  },
  tipsFn: function(self){
    var tipsText      = self.find('.js-togle-overview').html(),
        textBoxWidth  = self.find('.js-togle-overview').width(),
        oTips         = self.find('.js-toggle-tips');
    oTips.html(tipsText);

    if(oTips.width() > textBoxWidth){
      oTips.stop();
      oTips.fadeIn("slow");
    }
  }
};

/*
 * Left navigation scroll bar
*/
horizon.leftNav = {
  setScrollBar: function(){
    var height = $(window).height() - this.logoPane.height();
    this.sidebarPane.css({ "overflow-y": "auto", "height": height });
  },

  getElment: function(){
    this.leftPane = $('#js-leftPane'),
    this.logoPane = this.leftPane.find('.js-logo'),
    this.sidebarPane = this.leftPane.find('.js-sidebar');
  },

  init: function(){
    var self = this;
    this.getElment();
    this.setScrollBar();
    $(window).resize(function(){
      self.setScrollBar();
    });
  }
};

horizon.addInitFunction(function (){
  horizon.dropMenu.getInstance();
  horizon.selecteItem.eventFn();
  horizon.leftNav.init();
});