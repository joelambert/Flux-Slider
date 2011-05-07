flux.transitions.bars = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		barWidth: 60,
		setup: function() {
			var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1
			
			var delayBetweenBars = 40;
			
			for(var i=0; i<barCount; i++) {
				var bar = $('<div></div>').attr('class', 'bar bar-'+i).css({
					width: this.options.barWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0',
					left: (i*this.options.barWidth)+'px',
					
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+(i*this.options.barWidth)+'px 0px'
				}).css3({
					'transition-duration': '400ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all',
					'transition-delay': (i*delayBetweenBars)+'ms'
				});
				this.slider.image1.append(bar);
			}
		},
		execute: function() {
			var _this = this;
			
			var height = this.slider.image1.height();

			var bars = this.slider.image1.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).transitionEnd(function(){
				_this.finished();
			});
			
			bars.css({
				'opacity': '0.5'
			}).css3({
				'transform': flux.browser.translate(0, height)
			});
		}
	}, opts));	
}