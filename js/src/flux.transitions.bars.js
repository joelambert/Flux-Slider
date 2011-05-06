flux.transitions.bars = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		barWidth: 60,
		setup: function() {
			var barCount = Math.floor(this.image.width() / this.options.barWidth) + 1
			
			var delayBetweenBars = 40;
			
			for(var i=0; i<barCount; i++) {
				var bar = $('<div></div>').attr('class', 'bar bar-'+i).css({
					width: this.options.barWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0',
					left: (i*this.options.barWidth)+'px',
					
					'background-image': this.image.css('background-image'),
					'background-position': '-'+(i*this.options.barWidth)+'px 0px',
					
					'-webkit-transition-duration': '400ms',
					'-webkit-transition-timing-function': 'ease-in',
					'-webkit-transition-property': 'opacity, -webkit-transform',
					'-webkit-transition-delay': (i*delayBetweenBars)+'ms'
				});
				this.image.append(bar);
			}
		},
		execute: function() {
			var _this = this;
			
			var height = this.image.height();

			var bars = this.image.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			bars.css({
				'-webkit-transform': flux.browser.translate(0, height),
				'opacity': '0.5'
			});
		}
	}, opts));	
}