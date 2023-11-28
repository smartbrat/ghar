$(function() {
	var mainHeader = $('.auto-hide-header'),
		secondaryNavigation = $('.secondary-nav'),
		//this applies only if secondary nav is below intro section
		belowNavHeroContent = $('.sub-nav-hero'),
		headerHeight = mainHeader.height();
	
	//set scrolling variables
	var scrolling = false,
		previousTop = 0,
		currentTop = 0,
		scrollDelta = 10,
		scrollOffset = 150;

	mainHeader.on('click', '.nav-trigger', function(event){
		// open primary navigation on mobile
		event.preventDefault();
		mainHeader.toggleClass('nav-open');
	});

	$(window).on('scroll', function(){
		if( !scrolling ) {
			scrolling = true;
			(!window.requestAnimationFrame)
				? setTimeout(autoHideHeader, 250)
				: requestAnimationFrame(autoHideHeader);
		}
	});

	$(window).on('resize', function(){
		headerHeight = mainHeader.height();
	});

	function autoHideHeader() {
		var currentTop = $(window).scrollTop();

		( belowNavHeroContent.length > 0 ) 
			? checkStickyNavigation(currentTop) // secondary navigation below intro
			: checkSimpleNavigation(currentTop);

	   	previousTop = currentTop;
		scrolling = false;
	}

	function checkSimpleNavigation(currentTop) {
		//there's no secondary nav or secondary nav is below primary nav
	    if (previousTop - currentTop > scrollDelta) {
	    	//if scrolling up...
	    	mainHeader.removeClass('is-hidden');
	    } else if( currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
	    	//if scrolling down...
	    	mainHeader.addClass('is-hidden');
	    }
	}

	function checkStickyNavigation(currentTop) {
		//secondary nav below intro section - sticky secondary nav
		var secondaryNavOffsetTop = belowNavHeroContent.offset().top - secondaryNavigation.height() - mainHeader.height();
		
		if (previousTop >= currentTop ) {
	    	//if scrolling up... 
	    	if( currentTop < secondaryNavOffsetTop ) {
	    		//secondary nav is not fixed
	    		mainHeader.removeClass('is-hidden');
	    		secondaryNavigation.removeClass('fixed slide-up');
	    		belowNavHeroContent.removeClass('secondary-nav-fixed');
	    	} else if( previousTop - currentTop > scrollDelta ) {
	    		//secondary nav is fixed
	    		mainHeader.removeClass('is-hidden');
	    		secondaryNavigation.removeClass('slide-up').addClass('fixed'); 
	    		belowNavHeroContent.addClass('secondary-nav-fixed');
	    	}
	    	
	    } else {
	    	//if scrolling down...	
	 	  	if( currentTop > secondaryNavOffsetTop + scrollOffset ) {
	 	  		//hide primary nav
	    		mainHeader.addClass('is-hidden');
	    		secondaryNavigation.addClass('fixed slide-up');
	    		belowNavHeroContent.addClass('secondary-nav-fixed');
	    	} else if( currentTop > secondaryNavOffsetTop ) {
	    		//once the secondary nav is fixed, do not hide primary nav if you haven't scrolled more than scrollOffset 
	    		mainHeader.removeClass('is-hidden');
	    		secondaryNavigation.addClass('fixed').removeClass('slide-up');
	    		belowNavHeroContent.addClass('secondary-nav-fixed');
	    	}

	    }
	}
});
/*--- Run Off Canvas Menu ---*/
/* jQuery(document).ready(function($) {
  $('#burger-nav').hcOffcanvasNav({
    maxWidth: false,
    pushContent: false,
    position: 'right',
    levelTitles: true
  });
}); */

$(function () {
  'use strict'
  $('[data-toggle="offcanvas-all"]').on('click', function () {
    $('[data-toggle="offcanvas-all"]').toggleClass("show");
    $('.offcanvas-all').toggleClass('open');
    $('body').toggleClass('offcanvas-expanded');
  })
});

$(function () {
  'use strict'
  $('[data-toggle="offcanvas-sm"]').on('click', function () {
    $('[data-toggle="offcanvas-sm"]').toggleClass("show");
    $('.offcanvas-sm').toggleClass('open');
    $('body').toggleClass('offcanvas-expanded');
  })
});


/* Listen to scroll to change positions according to scroll amount */
function checkScroll(){
var startY = $('.scroll-bg').height() * 0 + 200; //The point where the navbar changes in px

if($(window).scrollTop() > startY){
  $('.scroll-bg').addClass("scrolled");
  }else{
    $('.scroll-bg').removeClass("scrolled");
  }
}

if($('.scroll-bg').length > 0){
  $(window).on("scroll load resize", function(){
    checkScroll();
  });
}

// Slick Carousel with Equal Height
window.addEventListener('load', function () {
  const settings = {
    autoplay: true,
    touchThreshold: 1000,
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    rows: 0,
    responsive: [
      {
        breakpoint: 768,
        settings: "unslick"
      }
    ]
  };

  const sl =  $('.slider').slick(settings);
      
  $(window).on('resize', function() {
    if( $(window).width() > 768 &&  !sl.hasClass('slick-initialized')) {
          $('.slider').slick(settings);
      }
  });

  $('.slider-single').slick({
    autoplay: true,
    autoplaySpeed: 6000,
    touchThreshold: 1000,
    swipe: false,
    draggable: false,
    dots: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    rows: 0
  });

  $('.slider-spotlight').slick({
    autoplay: true,
    autoplaySpeed: 6000,
    touchThreshold: 1000,
    swipe: false,
    draggable: false,
    dots: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    rows: 0,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                autoplay: false
            }
        }
    ]
  });


  $('.slider').on('setPosition', function () {
    $(this).find('.slick-slide').height('auto');
    var slickTrack = $(this).find('.slick-track');
    var slickTrackHeight = $(slickTrack).height();
    $(this).find('.slick-slide').css('height', slickTrackHeight + 'px');
  });

});

//<!-- Anchor Animation -->
$("a.anchor[href^='#']").on('click', function(event) {
  
  var target = this.hash;

  event.preventDefault();

  var navOffset = $('.navbar').height();

  return $('html, body').animate({
    scrollTop: $(this.hash).offset().top - navOffset
  }, 300, function() {
    return window.history.pushState(null, null, target);
  });
});



// input mtasking
$('.mask-date').mask("00/00/0000", {
    placeholder: "__-__-____"
  });
  $('.mask-money').mask('000.000.000.000.000,00', {
    reverse: true
  });
  
  // Add the following code if you want the name of the file appear on select
  $(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});


/*--- If text-ellipsis then add title automatically ---*/
document.querySelectorAll('.text-ellipsis').forEach(function (elem) {
  if (parseFloat(window.getComputedStyle(elem).width) === parseFloat(window.getComputedStyle(elem.parentElement).width)) {
    elem.setAttribute('title', elem.textContent);
  }
});
/*
 * HC Off-canvas Nav
 * ===================
 * Version: 3.4.0
 * Author: Some Web Media
 * Author URL: http://somewebmedia.com
 * Plugin URL: https://github.com/somewebmedia/hc-offcanvas-nav
 * Description: jQuery plugin for creating off-canvas multi-level navigations
 * License: MIT
 */
"use strict";function _typeof(n){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(n)}!function(_,n){var c,L=n.document,Q=_(L.getElementsByTagName("html")[0]),U=(_(L),(/iPad|iPhone|iPod/.test(navigator.userAgent)||!!navigator.platform&&/iPad|iPhone|iPod/.test(navigator.platform))&&!n.MSStream),z="ontouchstart"in n||navigator.maxTouchPoints||n.DocumentTouch&&L instanceof DocumentTouch,V=function(n){return!isNaN(parseFloat(n))&&isFinite(n)},G=function(n){return n.stopPropagation()},I=function(e){return function(n){n.preventDefault(),n.stopPropagation(),"function"==typeof e&&e()}},J=function(n,e,t){var a=t.children(),o=a.length,c=-1<e?Math.max(0,Math.min(e-1,o)):Math.max(0,Math.min(o+e+1,o));0===c?t.prepend(n):a.eq(c-1).after(n)},K=function(n){return-1!==["left","right"].indexOf(n)?"x":"y"},R=(c=function(n){var e=["Webkit","Moz","Ms","O"],t=(L.body||L.documentElement).style,a=n.charAt(0).toUpperCase()+n.slice(1);if(void 0!==t[n])return n;for(var o=0;o<e.length;o++)if(void 0!==t[e[o]+a])return e[o]+a;return!1}("transform"),function(n,e,t){if(c)if(0===e)n.css(c,"");else if("x"===K(t)){var a="left"===t?e:-e;n.css(c,a?"translate3d(".concat(a,"px,0,0)"):"")}else{var o="top"===t?e:-e;n.css(c,o?"translate3d(0,".concat(o,"px,0)"):"")}else n.css(t,e)}),e=function(n,e,t){console.warn("%cHC Off-canvas Nav:%c "+t+"%c '"+n+"'%c is now deprecated and will be removed. Use%c '"+e+"'%c instead.","color: #fa253b","color: default","color: #5595c6","color: default","color: #5595c6","color: default")},X=0;_.fn.extend({hcOffcanvasNav:function(){var n=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};if(!this.length)return this;var A=this,D=_(L.body);n.side&&(e("side","position","option"),n.position=n.side);var H=_.extend({},{maxWidth:1024,pushContent:!1,position:"left",levelOpen:"overlap",levelSpacing:40,levelTitles:!1,navTitle:null,navClass:"",disableBody:!0,closeOnClick:!0,customToggle:null,insertClose:!0,insertBack:!0,labelClose:"Close",labelBack:"Back"},n),E=[],$="nav-open",F=function(n){if(!E.length)return!1;var e=!1;"string"==typeof n&&(n=[n]);for(var t=n.length,a=0;a<t;a++)-1!==E.indexOf(n[a])&&(e=!0);return e};return this.each(function(){var e=_(this);if(e.find("ul").addBack("ul").length){var n,o,c,i,a,s,b="hc-nav-".concat(++X),l=(n="hc-offcanvas-".concat(X,"-style"),o=_('<style id="'.concat(n,'">')).appendTo(_("head")),c={},i={},a=function(n){return";"!==n.substr(-1)&&(n+=";"!==n.substr(-1)?";":""),n},{reset:function(){c={},i={}},add:function(n,e,t){n=n.trim(),e=e.trim(),t?(t=t.trim(),i[t]=i[t]||{},i[t][n]=a(e)):c[n]=a(e)},remove:function(n,e){n=n.trim(),e?(e=e.trim(),void 0!==i[e][n]&&delete i[e][n]):void 0!==c[n]&&delete c[n]},insert:function(){var n="";for(var e in i){for(var t in n+="@media screen and (".concat(e,") {\n"),i[e])n+="".concat(t," { ").concat(i[e][t]," }\n");n+="}\n"}for(var a in c)n+="".concat(a," { ").concat(c[a]," }\n");o.html(n)}});e.addClass("hc-nav ".concat(b));var t,r,p,d=_("<nav>").on("click",G),v=_('<div class="nav-container">').appendTo(d),f=null,u={},h=!1,m=0,g=0,y=0,C=null,x={},k=[];H.customToggle?s=_(H.customToggle).addClass("hc-nav-trigger ".concat(b)).on("click",q):(s=_('<a class="hc-nav-trigger '.concat(b,'"><span></span></a>')).on("click",q),e.after(s));var O=function(){v.css("transition","none"),g=v.outerWidth(),y=v.outerHeight(),l.add(".hc-offcanvas-nav.".concat(b,".nav-position-left .nav-container"),"transform: translate3d(-".concat(g,"px, 0, 0)")),l.add(".hc-offcanvas-nav.".concat(b,".nav-position-right .nav-container"),"transform: translate3d(".concat(g,"px, 0, 0)")),l.add(".hc-offcanvas-nav.".concat(b,".nav-position-top .nav-container"),"transform: translate3d(0, -".concat(y,"px, 0)")),l.add(".hc-offcanvas-nav.".concat(b,".nav-position-bottom .nav-container"),"transform: translate3d(0, ".concat(y,"px, 0)")),l.insert(),v.css("transition",""),T()},T=function(){var n;t=v.css("transition-property"),n=v.css("transition-duration"),r=parseFloat(n)*(/\ds$/.test(n)?1e3:1),p=v.css("transition-timing-function"),H.pushContent&&f&&t&&l.add(function n(e){return"string"==typeof e?e:e.attr("id")?"#"+e.attr("id"):e.attr("class")?e.prop("tagName").toLowerCase()+"."+e.attr("class").replace(/\s+/g,"."):n(e.parent())+" "+e.prop("tagName").toLowerCase()}(H.pushContent),"transition: ".concat(t," ").concat(r,"ms ").concat(p)),l.insert()},S=function(n){var e=s.css("display"),t=!!H.maxWidth&&"max-width: ".concat(H.maxWidth-1,"px");F("maxWidth")&&l.reset(),l.add(".hc-offcanvas-nav.".concat(b),"display: block",t),l.add(".hc-nav-trigger.".concat(b),"display: ".concat(e&&"none"!==e?e:"block"),t),l.add(".hc-nav.".concat(b),"display: none",t),l.add(".hc-offcanvas-nav.".concat(b,".nav-levels-overlap.nav-position-left li.level-open > .nav-wrapper"),"transform: translate3d(-".concat(H.levelSpacing,"px,0,0)"),t),l.add(".hc-offcanvas-nav.".concat(b,".nav-levels-overlap.nav-position-right li.level-open > .nav-wrapper"),"transform: translate3d(".concat(H.levelSpacing,"px,0,0)"),t),l.add(".hc-offcanvas-nav.".concat(b,".nav-levels-overlap.nav-position-top li.level-open > .nav-wrapper"),"transform: translate3d(0,-".concat(H.levelSpacing,"px,0)"),t),l.add(".hc-offcanvas-nav.".concat(b,".nav-levels-overlap.nav-position-bottom li.level-open > .nav-wrapper"),"transform: translate3d(0,".concat(H.levelSpacing,"px,0)"),t),l.insert(),(!n||n&&F("pushContent"))&&("string"==typeof H.pushContent?(f=_(H.pushContent)).length||(f=null):f=H.pushContent instanceof jQuery?H.pushContent:null),v.css("transition","none");var a=d.hasClass($),o=["hc-offcanvas-nav",H.navClass||"",b,H.navClass||"","nav-levels-"+H.levelOpen||"none","nav-position-"+H.position,H.disableBody?"disable-body":"",U?"is-ios":"",z?"touch-device":"",a?$:""].join(" ");d.off("click").attr("class","").addClass(o),H.disableBody&&d.on("click",j),n?O():setTimeout(O,1)},w=function(){var n;u=function c(n){var e=[];return n.each(function(){var n=_(this),o={classes:n.attr("class"),items:[]};n.children("li").each(function(){var n=_(this),e=n.children().filter(function(){var n=_(this);return n.is(":not(ul)")&&!n.find("ul").length}).add(n.contents().filter(function(){return 3===this.nodeType&&this.nodeValue.trim()})),t=n.find("ul"),a=t.first().add(t.first().siblings("ul"));a.length&&!n.data("hc-uniqid")&&n.data("hc-uniqid",Math.random().toString(36).substr(2)+"-"+Math.random().toString(36).substr(2)),o.items.push({uniqid:n.data("hc-uniqid"),classes:n.attr("class"),$content:e,subnav:a.length?c(a):[]})}),e.push(o)}),e}((n=e.find("ul").addBack("ul")).first().add(n.first().siblings("ul")))},B=function(n){n&&(v.empty(),x={}),function h(n,e,m,t,a){var g=_('<div class="nav-wrapper nav-wrapper-'.concat(m,'">')).appendTo(e).on("click",G),o=_('<div class="nav-content">').appendTo(g);if(t&&o.prepend("<h2>".concat(t,"</h2>")),_.each(n,function(n,e){var u=_("<ul>").addClass(e.classes).appendTo(o);_.each(e.items,function(n,e){var t=e.$content,a=t.find("a").addBack("a"),o=a.length?a.clone(!0,!0).addClass("nav-item"):_('<span class="nav-item">').append(t.clone(!0,!0)).on("click",G);a.length&&o.on("click",function(n){n.stopPropagation(),a[0].click()}),"#"===o.attr("href")&&o.on("click",function(n){n.preventDefault()}),H.closeOnClick&&(!1===H.levelOpen||"none"===H.levelOpen?o.filter("a").filter('[data-nav-close!="false"]').on("click",j):o.filter("a").filter('[data-nav-close!="false"]').filter(function(){var n=_(this);return!e.subnav.length||n.attr("href")&&"#"!==n.attr("href").charAt(0)}).on("click",j));var c=_("<li>").addClass(e.classes).append(o);if(u.append(c),H.levelSpacing&&("expand"===H.levelOpen||!1===H.levelOpen||"none"===H.levelOpen)){var i=H.levelSpacing*m;i&&u.css("text-indent","".concat(i,"px"))}if(e.subnav.length){var s=m+1,l=e.uniqid,r="";if(x[s]||(x[s]=0),c.addClass("nav-parent"),!1!==H.levelOpen&&"none"!==H.levelOpen){var p=x[s],d=_('<span class="nav-next">').appendTo(o),v=_('<label for="'.concat(b,"-").concat(s,"-").concat(p,'">')).on("click",G),f=_('<input type="checkbox" id="'.concat(b,"-").concat(s,"-").concat(p,'">')).attr("data-level",s).attr("data-index",p).val(l).on("click",G).on("change",M);-1!==k.indexOf(l)&&(g.addClass("sub-level-open").on("click",function(){return W(s,p)}),c.addClass("level-open"),f.prop("checked",!0)),c.prepend(f),r=!0===H.levelTitles?t.text().trim():"",o.attr("href")&&"#"!==o.attr("href").charAt(0)?d.append(v):o.prepend(v.on("click",function(){_(this).parent().trigger("click")}))}x[s]++,h(e.subnav,c,s,r,x[s]-1)}})}),m&&void 0!==a&&!1!==H.insertBack&&"overlap"===H.levelOpen){var c=o.children("ul"),i=_('<li class="nav-back"><a href="#">'.concat(H.labelBack||"","<span></span></a></li>"));i.children("a").on("click",I(function(){return W(m,a)})),!0===H.insertBack?c.first().prepend(i):V(H.insertBack)&&J(i,H.insertBack,c)}if(0===m&&!1!==H.insertClose){var s=o.children("ul"),l=_('<li class="nav-close"><a href="#">'.concat(H.labelClose||"","<span></span></a></li>"));l.children("a").on("click",I(j)),!0===H.insertClose?s.first().prepend(l):V(H.insertClose)&&J(l,H.insertClose,s.first().add(s.first().siblings("ul")))}}(u,v,0,H.navTitle)};S(),w(),B(),D.append(d);var P=function(n,e,t){var a=_("#".concat(b,"-").concat(n,"-").concat(e)),o=a.val(),c=a.parent("li"),i=c.closest(".nav-wrapper");if(a.prop("checked",!1),i.removeClass("sub-level-open"),c.removeClass("level-open"),-1!==k.indexOf(o)&&k.splice(k.indexOf(o),1),t&&"overlap"===H.levelOpen&&(i.off("click").on("click",G),R(v,(n-1)*H.levelSpacing,H.position),f)){var s="x"===K(H.position)?g:y;R(f,s+(n-1)*H.levelSpacing,H.position)}};A.settings=function(n){return n?H[n]:Object.assign({},H)},A.isOpen=function(){return d.hasClass($)},A.open=N,A.close=j,A.update=function(n,e){if(E=[],"object"===_typeof(n)){for(var t in n)H[t]!==n[t]&&E.push(t);H=_.extend({},H,n),S(!0),B(!0)}(!0===n||e)&&(S(!0),w(),B(!0))}}else console.error("%c! HC Offcanvas Nav:%c Menu must contain <ul> element.","color: #fa253b","color: default");function M(){var n=_(this),e=Number(n.attr("data-level")),t=Number(n.attr("data-index"));n.prop("checked")?function(n,e){var t=_("#".concat(b,"-").concat(n,"-").concat(e)),a=t.val(),o=t.parent("li"),c=o.closest(".nav-wrapper");if(c.addClass("sub-level-open"),o.addClass("level-open"),-1===k.indexOf(a)&&k.push(a),"overlap"===H.levelOpen&&(c.on("click",function(){return W(n,e)}),R(v,n*H.levelSpacing,H.position),f)){var i="x"===K(H.position)?g:y;R(f,i+n*H.levelSpacing,H.position)}}(e,t):W(e,t)}function N(){if(h=!0,d.css("visibility","visible").addClass($),s.addClass("toggle-open"),"expand"===H.levelOpen&&C&&clearTimeout(C),H.disableBody&&(m=Q.scrollTop()||D.scrollTop(),L.documentElement.scrollHeight>L.documentElement.clientHeight&&Q.addClass("hc-nav-yscroll"),D.addClass("hc-nav-open"),m&&D.css("top",-m)),f){var n="x"===K(H.position)?g:y;R(f,n,H.position)}setTimeout(function(){A.trigger("open",_.extend({},H))},r+1)}function j(){h=!1,f&&R(f,0),d.removeClass($),v.removeAttr("style"),s.removeClass("toggle-open"),"expand"===H.levelOpen&&-1!==["top","bottom"].indexOf(H.position)?W(0):!1!==H.levelOpen&&"none"!==H.levelOpen&&(C=setTimeout(function(){W(0)},"expand"===H.levelOpen?r:0)),H.disableBody&&(D.removeClass("hc-nav-open"),Q.removeClass("hc-nav-yscroll"),m&&(D.css("top","").scrollTop(m),Q.scrollTop(m),m=0)),setTimeout(function(){d.css("visibility",""),A.trigger("close.$",_.extend({},H)),A.trigger("close.once",_.extend({},H)).off("close.once")},r+1)}function q(n){n.preventDefault(),n.stopPropagation(),h?j():N()}function W(n,e){for(var t=n;t<=Object.keys(x).length;t++)if(t==n&&void 0!==e)P(n,e,!0);else for(var a=0;a<x[t];a++)P(t,a,t==n)}})}})}(jQuery,"undefined"!=typeof window?window:this);
(function (window, document, undefined) {
  'use strict';
  
  // Select nav items that have submenus
  var hasSubmenu = document.querySelectorAll('[data-id]');
  var visible = 'visible';
  var i = 0;
  
  // Show the submenu by toggling the relevant class names
  function showSubmenu (event) {
    // We lose reference of this when filtering the nav items
    var self = this;
    
    // Select the relevant submenu, by the data-id attribute
    var submenu = document.getElementById(self.dataset.id);
    
    // Probably best to prevent clicks through
    event.preventDefault();
    if(!$(submenu).hasClass(visible)){
      $('.nav-link').removeClass(visible);
      $('.submenu').removeClass(visible);
    }

    self.classList.toggle(visible);
    submenu.classList.toggle(visible);
  }
  
  // Remove the active class
  function removeChildClass(el) {
    // Check if it exists, then remove
    if ( el.classList.contains(visible) ) {
      el.classList.remove(visible);
    }
  }
  
  // On clicks show submenus
  for ( i = 0; i < hasSubmenu.length; i++ ) {
    hasSubmenu[i].addEventListener('click', showSubmenu);
  }
})(window, document);


/*---------- DRAGGER ----------*/
$(document).ready(function() {
  $('.dragger').mousedown(function (event) {
    $(this)
      .data('down', true)
      .data('x', event.clientX)
      .data('scrollLeft', this.scrollLeft)
      .addClass("dragging");

    return false;
  }).mouseup(function (event) {
    $(this)
      .data('down', false)
      .removeClass("dragging");
  }).mousemove(function (event) {
    if ($(this).data('down') == true) {
      this.scrollLeft = $(this).data('scrollLeft') + $(this).data('x') - event.clientX;
    }
  }).mousewheel(function (event, delta) {
    this.scrollLeft -= (delta * 30);
  }).css({
    'overflow' : 'hidden',
    'cursor' : '-moz-grab'
  });
  $(window).mouseout(function (event) {
    if ($('.team-form-data').data('down')) {
      try {
        if (event.originalTarget.nodeName == 'BODY' || event.originalTarget.nodeName == 'HTML') {
          $('.team-form-data').data('down', false);
        }
      } catch (e) {}
    }
  });
});


/*---------- MOUSE SCROLL HORIZONTAL ----------
jQuery(function ($) {
    $.fn.hScroll = function (amount) {
        amount = amount || 120;
        $(this).bind("DOMMouseScroll mousewheel", function (event) {
            var oEvent = event.originalEvent, 
                direction = oEvent.detail ? oEvent.detail * -amount : oEvent.wheelDelta, 
                position = $(this).scrollLeft();
            position += direction > 0 ? -amount : amount;
            $(this).scrollLeft(position);
            event.preventDefault();
        })
    };
});

$(document).ready(function() {
    $('.scroller').hScroll(); // You can pass (optionally) scrolling amount
});
*/

/*---- ANCHOR LINK ANIMATION WITH OFFSET ----*/

$("a.anchor[href^='#']").on('click', function(event) {
  
  var target = this.hash;

  event.preventDefault();

  var navOffset = $('.secondary-nav').height();

  return $('html, body').animate({
    scrollTop: $(this.hash).offset().top-30 - navOffset
  }, 300, function() {
    return window.history.pushState(null, null, target);
  });
});

$(".secondary-nav li").click(function() {
  centerLI(this, '.vam');
  // Dropdown Toggle
  if(!$(this).hasClass('dropdown')){
    $('.nav-link').removeClass('visible');
    $('.submenu').removeClass('visible');
  }
});

//http://stackoverflow.com/a/33296765/350421
 function centerLI(target, outer) {
   var out = $(outer);
   var tar = $(target);
   var x = out.width() - 50;
   var y = tar.outerWidth(true);
   var z = tar.index();
   var q = 0;
   var m = out.find('li');
   for (var i = 0; i < z; i++) {
     q += $(m[i]).outerWidth(true);
   }
   //out.scrollLeft(Math.max(0, q - (x - y)/2));
   out.animate({
     scrollLeft: Math.max(0, q - (x - y) / 2)
   }, 500);

 }

// Dropdown Close on Body click
$(document).mouseup(function(e) 
{
    var container = $("#secondary-nav");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        $('.nav-link').removeClass('visible');
        $('.submenu').removeClass('visible');
    }
});
var SETTINGS = {
    navBarTravelling: false,
    navBarTravelDirection: "",
    navBarTravelDistance: 150
};

var colours = {
    0: "#6a2c79"
/*
Add Numbers And Colors if you want to make each tab's indicator in different color for eg:
1: "#FF0000",
2: "#00FF00", and so on...
*/
};

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

// Out advancer buttons
var pnAdvancerLeft = document.getElementById("pnAdvancerLeft");
var pnAdvancerRight = document.getElementById("pnAdvancerRight");

var pnAdvancerLeft2 = document.getElementById("pnAdvancerLeft2");
var pnAdvancerRight2 = document.getElementById("pnAdvancerRight2");

// the indicator
var pnIndicator = document.getElementById("pnIndicator");
var pnProductNav = document.getElementById("pnProductNav");
var pnProductNavContents = document.getElementById("pnProductNavContents");

var pnIndicator2 = document.getElementById("pnIndicator2");
var pnProductNav2 = document.getElementById("pnProductNav2");
var pnProductNavContents2 = document.getElementById("pnProductNavContents2");

pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));

pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));

// Set the indicator
moveIndicator(pnProductNav.querySelector("[aria-selected=\"true\"]"), colours[0]);

moveIndicator2(pnProductNav2.querySelector("[aria-selected=\"true\"]"), colours[0]);

// Handle the scroll of the horizontal container
var last_known_scroll_position = 0;
var ticking = false;

function doSomething(scroll_pos) {
    pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));
    pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));
}

pnProductNav.addEventListener("scroll", function() {
    last_known_scroll_position = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            doSomething(last_known_scroll_position);
            ticking = false;
        });
    }
    ticking = true;
});

pnProductNav2.addEventListener("scroll", function() {
    last_known_scroll_position = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            doSomething(last_known_scroll_position);
            ticking = false;
        });
    }
    ticking = true;
});


pnAdvancerLeft.addEventListener("click", function() {
// If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the left
    if (determineOverflow(pnProductNavContents, pnProductNav) === "left" || determineOverflow(pnProductNavContents, pnProductNav) === "both") {
        // Find how far this panel has been scrolled
        var availableScrollLeft = pnProductNav.scrollLeft;
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollLeft < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents.style.transform = "translateX(" + availableScrollLeft + "px)";
        } else {
            pnProductNavContents.style.transform = "translateX(" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "left";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));
});
pnAdvancerLeft2.addEventListener("click", function() {
// If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the left
    if (determineOverflow(pnProductNavContents2, pnProductNav2) === "left" || determineOverflow(pnProductNavContents2, pnProductNav2) === "both") {
        // Find how far this panel has been scrolled
        var availableScrollLeft = pnProductNav2.scrollLeft;
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollLeft < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents2.style.transform = "translateX(" + availableScrollLeft + "px)";
        } else {
            pnProductNavContents2.style.transform = "translateX(" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents2.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "left";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));
});

pnAdvancerRight.addEventListener("click", function() {
    // If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the right
    if (determineOverflow(pnProductNavContents, pnProductNav) === "right" || determineOverflow(pnProductNavContents, pnProductNav) === "both") {
        // Get the right edge of the container and content
        var navBarRightEdge = pnProductNavContents.getBoundingClientRect().right;
        var navBarScrollerRightEdge = pnProductNav.getBoundingClientRect().right;
        // Now we know how much space we have available to scroll
        var availableScrollRight = Math.floor(navBarRightEdge - navBarScrollerRightEdge);
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollRight < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents.style.transform = "translateX(-" + availableScrollRight + "px)";
        } else {
            pnProductNavContents.style.transform = "translateX(-" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "right";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav.setAttribute("data-overflowing", determineOverflow(pnProductNavContents, pnProductNav));
});
pnAdvancerRight2.addEventListener("click", function() {
    // If in the middle of a move return
    if (SETTINGS.navBarTravelling === true) {
        return;
    }
    // If we have content overflowing both sides or on the right
    if (determineOverflow(pnProductNavContents2, pnProductNav2) === "right" || determineOverflow(pnProductNavContents2, pnProductNav2) === "both") {
        // Get the right edge of the container and content
        var navBarRightEdge = pnProductNavContents2.getBoundingClientRect().right;
        var navBarScrollerRightEdge = pnProductNav2.getBoundingClientRect().right;
        // Now we know how much space we have available to scroll
        var availableScrollRight = Math.floor(navBarRightEdge - navBarScrollerRightEdge);
        // If the space available is less than two lots of our desired distance, just move the whole amount
        // otherwise, move by the amount in the settings
        if (availableScrollRight < SETTINGS.navBarTravelDistance * 2) {
            pnProductNavContents2.style.transform = "translateX(-" + availableScrollRight + "px)";
        } else {
            pnProductNavContents2.style.transform = "translateX(-" + SETTINGS.navBarTravelDistance + "px)";
        }
        // We do want a transition (this is set in CSS) when moving so remove the class that would prevent that
        pnProductNavContents2.classList.remove("pn-ProductNav_Contents-no-transition");
        // Update our settings
        SETTINGS.navBarTravelDirection = "right";
        SETTINGS.navBarTravelling = true;
    }
    // Now update the attribute in the DOM
    pnProductNav2.setAttribute("data-overflowing", determineOverflow(pnProductNavContents2, pnProductNav2));
});

pnProductNavContents.addEventListener(
    "transitionend",
    function() {
        // get the value of the transform, apply that to the current scroll position (so get the scroll pos first) and then remove the transform
        var styleOfTransform = window.getComputedStyle(pnProductNavContents, null);
        var tr = styleOfTransform.getPropertyValue("-webkit-transform") || styleOfTransform.getPropertyValue("transform");
        // If there is no transition we want to default to 0 and not null
        var amount = Math.abs(parseInt(tr.split(",")[4]) || 0);
        pnProductNavContents.style.transform = "none";
        pnProductNavContents.classList.add("pn-ProductNav_Contents-no-transition");
        // Now lets set the scroll position
        if (SETTINGS.navBarTravelDirection === "left") {
            pnProductNav.scrollLeft = pnProductNav.scrollLeft - amount;
        } else {
            pnProductNav.scrollLeft = pnProductNav.scrollLeft + amount;
        }
        SETTINGS.navBarTravelling = false;
    },
    false
);
pnProductNavContents2.addEventListener(
    "transitionend",
    function() {
        // get the value of the transform, apply that to the current scroll position (so get the scroll pos first) and then remove the transform
        var styleOfTransform = window.getComputedStyle(pnProductNavContents2, null);
        var tr = styleOfTransform.getPropertyValue("-webkit-transform") || styleOfTransform.getPropertyValue("transform");
        // If there is no transition we want to default to 0 and not null
        var amount = Math.abs(parseInt(tr.split(",")[4]) || 0);
        pnProductNavContents2.style.transform = "none";
        pnProductNavContents2.classList.add("pn-ProductNav_Contents-no-transition");
        // Now lets set the scroll position
        if (SETTINGS.navBarTravelDirection === "left") {
            pnProductNav2.scrollLeft = pnProductNav2.scrollLeft - amount;
        } else {
            pnProductNav2.scrollLeft = pnProductNav2.scrollLeft + amount;
        }
        SETTINGS.navBarTravelling = false;
    },
    false
);

// Handle setting the currently active link
pnProductNavContents.addEventListener("click", function(e) {
var links = [].slice.call(document.querySelectorAll("#pnProductNavContents .pn-ProductNav_Link"));
links.forEach(function(item) {
item.setAttribute("aria-selected", "false");
});
e.target.setAttribute("aria-selected", "true");
// Pass the clicked item and it's colour to the move indicator function
moveIndicator(e.target, colours[links.indexOf(e.target)]);
});
pnProductNavContents2.addEventListener("click", function(e) {
var links = [].slice.call(document.querySelectorAll("#pnProductNavContents2 .pn-ProductNav_Link"));
links.forEach(function(item) {
item.setAttribute("aria-selected", "false");
});
e.target.setAttribute("aria-selected", "true");
// Pass the clicked item and it's colour to the move indicator function
moveIndicator2(e.target, colours[links.indexOf(e.target)]);
});

// var count = 0;
function moveIndicator(item, color) {
    var textPosition = item.getBoundingClientRect();
    var container = pnProductNavContents.getBoundingClientRect().left;
    var distance = textPosition.left - container;
 var scroll = pnProductNavContents.scrollLeft;
    pnIndicator.style.transform = "translateX(" + (distance + scroll) + "px) scaleX(" + textPosition.width * 0.01 + ")";
// count = count += 100;
// pnIndicator.style.transform = "translateX(" + count + "px)";

    if (color) {
        pnIndicator.style.backgroundColor = color;
    }
}

// var count = 0;
function moveIndicator2(item, color) {
    var textPosition = item.getBoundingClientRect();
    var container = pnProductNavContents2.getBoundingClientRect().left;
    var distance = textPosition.left - container;
 var scroll = pnProductNavContents2.scrollLeft;
    pnIndicator2.style.transform = "translateX(" + (distance + scroll) + "px) scaleX(" + textPosition.width * 0.01 + ")";
// count = count += 100;
// pnIndicator.style.transform = "translateX(" + count + "px)";

    if (color) {
        pnIndicator2.style.backgroundColor = color;
    }
}

function determineOverflow(content, container) {
    var containerMetrics = container.getBoundingClientRect();
    var containerMetricsRight = Math.floor(containerMetrics.right);
    var containerMetricsLeft = Math.floor(containerMetrics.left);
    var contentMetrics = content.getBoundingClientRect();
    var contentMetricsRight = Math.floor(contentMetrics.right);
    var contentMetricsLeft = Math.floor(contentMetrics.left);
 if (containerMetricsLeft > contentMetricsLeft && containerMetricsRight < contentMetricsRight) {
        return "both";
    } else if (contentMetricsLeft < containerMetricsLeft) {
        return "left";
    } else if (contentMetricsRight > containerMetricsRight) {
        return "right";
    } else {
        return "none";
    }
}

/*------------------- ACTIVE LINK POSITION ------------------------*/
$("#pnProductNav .pn-ProductNav_Link").click(function() {
   
   centerLI2(this, '#pnProductNav');

 });

$("#pnProductNav2 .pn-ProductNav_Link").click(function() {
   
   centerLI2(this, '#pnProductNav2');

 });

 //http://stackoverflow.com/a/33296765/350421
 function centerLI2(target, outer) {
   var out = $(outer);
   var tar = $(target);
   var x = out.width() - 50;
   var y = tar.outerWidth(true);
   var z = tar.index();
   var q = 0;
   var m = out.find('.pn-ProductNav_Link');
   for (var i = 0; i < z; i++) {
     q += $(m[i]).outerWidth(true);
   }
   
 //out.scrollLeft(Math.max(0, q - (x - y)/2));
 var xy = x - y;
 if(q > xy){
out.animate({
  scrollLeft: Math.max(0, q - (x - y) + 100)
}, 500);
 } else {
 out.animate({
  scrollLeft: Math.max(0, q/2 - 50)
}, 500);	  
 }

 }


$(document).ready(function() {
$('.mouse-scroll').mousewheel(function(e, delta) {
this.scrollLeft -= (delta * 50);
e.preventDefault();
});
});