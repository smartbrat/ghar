$(function() {
    $('.prog-bar').each(function() {
      const progressElement = $(this);
      const progressWrap = progressElement.closest('.progress-wrap');
      const progressPercent = progressElement.data('percent');
  
      progressElement.css('maskImage', `linear-gradient(to right, black 0%, transparent 0%)`)
        .animate(
          { percent: progressPercent },
          {
            duration: 1000,
            easing: 'linear',
            step: (now, fx) => {
              if (fx.prop === "percent") {
                progressElement.css('maskImage', `linear-gradient(to right, black ${now}%, transparent ${now}%)`);
                updateNumber(progressWrap, now);
              }
            }
          }
        );
  
      function updateNumber(progressElement, progressPercent) {
        const numberElement = progressElement.find('.percent');
        if (!numberElement.length) {
          progressElement.append('<div class="percent"></div>');
        }
        progressElement.find('.percent').text(Math.round(progressPercent) + '%');
      }
    });
  });
  