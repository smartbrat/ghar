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