$(document).ready(function(){
	loginSet();
	$(window).bind('resize',function(){
		loginSet();
	});
});

function loginSet(){
	var w 			= $(window).width();
	var h 			= $(window).height();
	var loginWrapH 	= $('.loginWrap').height();
	var loginWrapW 	= $('.loginWrap').width();
	var offset	   	= $('.loginWrap').offset();
	$('.loginWrap').css({ position: 'absolute', top: (h-loginWrapH)/2, left: (w-loginWrapW)/2 });
	$('#loginBg').css({'height': h });
}

$(document).ready(function(){
	$.getScript('https://pv.sohu.com/cityjson?ie=utf-8',function(){
	    $("#browser_ip p").html(returnCitySN.cip);
		addCookie("ip", returnCitySN.cip, 1);
	});
    //begin:<wujx9>:<new feature(license)>:<action (a)>:<date(2016-11-16)>
    localStorage.removeItem('hasAlert');
    //end:<wujx9>:<new feature(license)>:<action (a)>:<date(2016-11-16)>
    var isShow  = true,
    	reg     = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
    	aInput  = $('.js-login_txt');
    
	$('.js-login_txt').on('focus', function(){
        $(this).addClass('es-hover-bor-succ');
    });

    $('.js-login_txt').on('blur', function(){
    	if($(this).val() !== ''){
    		$(this).removeClass('es-hover-bor-err');
    	}
        else{
        	$(this).removeClass('es-hover-bor-succ');
        	$(this).addClass('es-hover-bor-err');
        }

        if(!reg.test(aInput.eq(0).val())){
			aInput.eq(0).removeClass('es-hover-bor-succ');
    		aInput.eq(0).addClass('es-hover-bor-err');
    	}
    	else{
    		aInput.eq(0).addClass('es-hover-bor-succ');
        	aInput.eq(0).removeClass('es-hover-bor-err');
    	}
    });

    $('.js-loginBtn').on('click', function(){
        $.each($('.js-login_txt'), function(i, ele){
            if($(ele).val() == ""){
                $(ele).addClass('es-hover-bor-err');
            }
        });
    });

    setTimeout(function(){
    	aInput.eq(0).val('');
    	aInput.eq(1).val('');
    },400);

    setInterval(function(){
    	setBtn();
    },40);

    $(document).on('keydown',function(event){
    	if(event.keyCode === 13 && $('.js-loginBtn').eq(0).css('display') !== 'block'){
    		return false;
    	}
    });

    setBtn();
    $(document).on('keyup', setBtn);

    function setBtn(){
    	var aInput  = $('.js-login_txt');

		if(aInput.eq(0).val() !== '' && aInput.eq(1).val() !== '' && reg.test(aInput.eq(0).val())){
    		isShow = true;
    	}
    	else{
    		isShow = false;
    	}

	    if(isShow){
	    	$('.js-loginBtn').eq(0).show();
	    	$('.js-loginBtn').eq(1).hide();
        	aInput.eq(1).removeClass('es-hover-bor-err');
        	aInput.eq(1).addClass('es-hover-bor-succ');
	    	$('.es-errorWrap').html('');
	    }
	    else{
	    	$('.js-loginBtn').eq(0).hide();
	    	$('.js-loginBtn').eq(1).show();
	    }
    }
});

function addCookie(cName, cValue, cDays) {
	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + cDays);
	document.cookie = escape(cName) + "=" + escape(cValue) + ";expires=" + expireDate.toUTCString();
}