flux.transitions.blinds3d = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		requires3d: true,
		barWidth: 150,
		perspective: 600,
		setup: function() {
			var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1;
			var blockCountY = Math.floor(this.slider.image1.height() / this.options.barWidth) + 1;
			
			// Adjust the barWidth so that we can fit inside the available space
			this.options.barWidth = Math.floor(this.slider.image1.width() / barCount);
			
			// Work out how much space remains with the adjusted barWidth
			var remainder = this.slider.image1.width() - (barCount * this.options.barWidth),
				addPerLoop = Math.ceil(remainder / barCount);
			
			var delayBetweenBars = 150,
				height = this.slider.image1.height();
			
			var totalLeft = 0;
			
			for(var i=0; i<barCount; i++) {
				
				var totalTop = 0,
					addX,
					thisbarWidth,
					bar,
					bar2,
					barContainer;
				
				if(remainder > 0)
				{
					addX = remainder >= addPerLoop ? addPerLoop : remainderY;
					thisbarWidth += addX;
					remainder -= addX;
				}
				
				thisbarWidth = this.options.barWidth;

				bar = $('<div class="bar bar-'+i+'"></div>').css({
					width: thisbarWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: '0px',
					'z-index': 200,

					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+totalLeft+'px 0px',
					'background-repeat': 'no-repeat'
				}).css3({
					'backface-visibility': 'hidden'
				});

				bar2 = $(bar.get(0).cloneNode(false)).css({
					'background-image': this.slider.image2.css('background-image'),
					'z-index': 190
				}).css3({
					'transform': flux.browser.rotateY(180)
				});

				barContainer = $('<div class="barcontainer"></div>').css({
					width: thisbarWidth+'px',
					height: height+'px',
					position: 'absolute',
					top: totalTop+'px',
					left: totalLeft+'px',
					'z-index': i > barCount/2 ? 1000-i : 1000 // Fix for Chrome to ensure that the z-index layering is correct!
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'ease-out',
					'transition-property': 'all',
					'transition-delay': (i*delayBetweenBars)+'ms',
					'transform-style': 'preserve-3d'
				}).append(bar).append(bar2);

				this.slider.image1.append(barContainer);
				
				totalLeft += thisbarWidth;
			}
			
			this.slider.imageContainer.css3({
				'perspective': this.options.perspective,
				'perspective-origin': '50% 50%'
			});
		},
		execute: function() {
			var _this = this;

			var bars = this.slider.image1.find('div.barcontainer');

			this.slider.image2.hide();
								
			// Get notified when the last transition has completed
			bars.last().transitionEnd(function(event){
				_this.slider.image2.show();
				
				_this.finished();
			});

			bars.css3({
				'transform': flux.browser.rotateY(180)
			});
		}
	}, opts));	
}