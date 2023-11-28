

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

  $('.slider').on('setPosition', function () {
    $(this).find('.slick-slide').height('auto');
    var slickTrack = $(this).find('.slick-track');
    var slickTrackHeight = $(slickTrack).height();
    $(this).find('.slick-slide').css('height', slickTrackHeight + 'px');
  });

});

//<!-- On Scroll Animate Stuff -->
/* Listen to scroll to change positions according to scroll amount */
function checkScroll(){
var startY = $('.scroll-bg').height() * 0 + 300; //The point where the navbar changes in px

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


//<!-- Tooltip -->
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});