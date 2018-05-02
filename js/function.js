var TempApp = {
    lgWidth: 1200,
    mdWidth: 992,
    smWidth: 768,
    resized: false,
    iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
    touchDevice: function() { return navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i); }
};

function isLgWidth() { return $(window).width() >= TempApp.lgWidth; } // >= 1200
function isMdWidth() { return $(window).width() >= TempApp.mdWidth && $(window).width() < TempApp.lgWidth; } //  >= 992 && < 1200
function isSmWidth() { return $(window).width() >= TempApp.smWidth && $(window).width() < TempApp.mdWidth; } // >= 768 && < 992
function isXsWidth() { return $(window).width() < TempApp.smWidth; } // < 768
function isIOS() { return TempApp.iOS(); } // for iPhone iPad iPod
function isTouch() { return TempApp.touchDevice(); } // for touch device

$(document).ready(function() {

    // Хак для клика по ссылке на iOS
    if (isIOS()) {
        $(function(){$(document).on('touchend', 'a', $.noop)});
    }

	if ('flex' in document.documentElement.style) {
		// Хак для UCBrowser
		if (navigator.userAgent.search(/UCBrowser/) > -1) {
			document.documentElement.setAttribute('data-browser', 'not-flex');
		} else {		
		    // Flexbox-совместимый браузер.
			document.documentElement.setAttribute('data-browser', 'flexible');
		}
	} else {
	    // Браузер без поддержки Flexbox, в том числе IE 9/10.
		document.documentElement.setAttribute('data-browser', 'not-flex');
	}

	// First screen full height
	function setHeiHeight() {
	    $('.full__height').css({
	        minHeight: $(window).height() + 'px'
	    });
	}
	setHeiHeight(); // устанавливаем высоту окна при первой загрузке страницы
	$(window).resize( setHeiHeight ); // обновляем при изменении размеров окна

	// Reset link whte attribute href="#"
	$('[href*="#"]').click(function(event) {
		event.preventDefault();
	});

   	gridMatch();
   	fontResize();
   	slider3dInit();
   	if (!isXsWidth()) {
   		parallaxMove();
   	}
   	animateUp();

   	$('.saving__tab').on('click', function() {
   		$('.animateUp').removeClass('animated');
   	});

   	$('.service__tab').on('click', function() {
   		$('.animateRight').addClass('visible animated slideInRight');
   		$('.service__pane .animateUp').addClass('visible animated slideInUp');
   	});

   	$('[type=tel]').inputmask("+7(999)99-99-999",{ showMaskOnHover: false });

    $("button[type=submit]").on('click', function (e){ 
	    e.preventDefault();
    	var form = $(this).closest('.form');
    	var modalId = $(this).closest('.modal').attr('id');
    	var url = form.attr('action');
        var form_data = form.serialize();
        var field = form.find('[required]');

        var check = form.find('[type=checkbox]');

        empty = 0;

        field.each(function() {
	        if ($(this).val() == "") {
	        	$(this).addClass('invalid');
	        	// return false;
	        	empty++;
	        }  	
        });

        if (check) {
        	if (check.prop('checked') == false) {
        		return false;
        	}
        }

        if (empty > 0) {
        	return false;
        } else {    	
	        $.ajax({
	            url: url,
	            type: "POST",
	            dataType: "html",
	            data: form_data,
	            success: function (response) {
	            	$('#'+modalId).modal('hide');
	            	// $('#success').modal('show');
	            	window.location.href="success.html";
	            }
	        });
        }

    });

});

function animateUp() {
	$('.animateUp').addClass("hidden").viewportChecker({
		classToAdd: 'visible animated slideInUp',
		offset: 100
	});
	$('.animateRight').addClass("hidden").viewportChecker({
		classToAdd: 'visible animated slideInRight',
		offset: 100
	});
	$('.animateLeft').addClass("hidden").viewportChecker({
		classToAdd: 'visible animated slideInLeft',
		offset: 100
	});
}

$(window).resize(function(event) {
    var windowWidth = $(window).width();
    // Запрещаем выполнение скриптов при смене только высоты вьюпорта (фикс для скролла в IOS и Android >=v.5)
    if (TempApp.resized == windowWidth) { return; }
    TempApp.resized = windowWidth;

	checkOnResize()
});

function checkOnResize() {
   	gridMatch();
   	fontResize();
}

function gridMatch() {
   	$('[data-grid-match] .grid__item').matchHeight({
   		byRow: true,
   	});
}

function fontResize() {
    var windowWidth = $(window).width();
    if (windowWidth < 1920 && windowWidth >= 768) {
    	var fontSize = windowWidth/19.05;
    	var slideerWidth = windowWidth*0.2067;
    	var slideerHeight = windowWidth*0.4653;
    } else if (windowWidth < 768) {
    	var fontSize = 80;
    	var slideerWidth = windowWidth*0.3;
    // } else if (windowWidth >= 1770) {
    // 	var fontSize = 100;
    // 	var slideerWidth = 360;
    }
	$('body').css('fontSize', fontSize + '%');
}

function slider3dInit() {
	new Vue({
		el: '#firstScreen__slider',
		data: {
			slides: 10
		},
		components: {
			'carousel-3d': Carousel3d.Carousel3d,
			'slide': Carousel3d.Slide
		}
	});
}


// TweenMax.min.js
// data-animate-wrapp - обертка с плавающими блоками
// data-animate-x - блок движется по оси Х
// data-animate-xy - блок движется по обеим осям
function parallaxMove() {
	
	$('[data-animate-wrapp]').each(function() {	
		var container = $(this),
			elX = container.find('[data-animate-x]'),
			elXY = container.find('[data-animate-xy]');

			var offset = $(this).offset();

		$(this).on('mousemove', function(e) {


			var sxPos = e.pageX / container.width() * 100 - 100;
			var syPos = (e.pageY - offset.top) / container.height() * 100 - 100;

			elX.each(function() {
				TweenMax.set([elX], { transformStyle: "preserve-3d" });
				xSpeed = elX.attr('data-animate-x');
				TweenMax.to($(this), 2, {
					rotationY: xSpeed * sxPos,
					rotationX: 0 * syPos,
					transformPerspective: 500,
					transformOrigin: "center center -400",
					ease: Expo.easeOut,
					// overwrite: 'all' 
				});
			});

			elXY.each(function() {
				xySpeed = $(this).attr('data-animate-xy');
				smooth = $(this).attr('data-smooth');
				TweenMax.to($(this), smooth, {
					transformPerspective: 500,
				    css: { 
				    	transform: 
				      		'translateX('+ (e.pageX / container.width() * xySpeed - xySpeed) + 'em) translateY(' +  ((e.pageY - offset.top) / container.height() * xySpeed - xySpeed) + 'em)' 
				    }, 
				    ease:Expo.easeOut, 
				    // overwrite: 'all' 
				});
			});

		});
	});
}

// Видео для страницы how it works
$(function () {
    if ($(".youtube")) {
        $(".youtube").each(function () {
            // Зная идентификатор видео на YouTube, легко можно найти его миниатюру
            $(this).css('background-image', 'url(http://i.ytimg.com/vi/' + this.id + '/sddefault.jpg)');

            // Добавляем иконку Play поверх миниатюры, чтобы было похоже на видеоплеер
            $(this).append($('<img src="img/play.png" alt="Play" class="video__play">'));

            $(document).delegate('#' + this.id, 'click', function () {
                // создаем iframe со включенной опцией autoplay
                var iframe_url = "https://www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1";
                if ($(this).data('params')) iframe_url += '&' + $(this).data('params');

                // Высота и ширина iframe должны быть такими же, как и у родительского блока
                var iframe = $('<iframe/>', {
                    'frameborder': '0',
                    'src': iframe_url,
                    'width': $(this).width(),
                    'height': $(this).height()
                })

                // Заменяем миниатюру HTML5 плеером с YouTube
                $(this).closest('.video__wrap').append(iframe);

            });
        });
    }

    $('.reviwe__tab a').on('click', function() {
        $('.reviwe__panes iframe').remove();
    });
});

