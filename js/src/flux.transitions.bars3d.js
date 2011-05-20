flux.transitions.bars3d = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		requires3d: true,
		barWidth: 100,
		perspective: 600,
		setup: function() {
			var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1;
			
			// Adjust the barWidth so that we can fit inside the available space
			this.options.barWidth = Math.floor(this.slider.image1.width() / barCount);
			
			// Work out how much space remains with the adjusted barWidth
			var remainder = this.slider.image1.width() - (barCount * this.options.barWidth),
				addPerLoop = Math.ceil(remainder / barCount),
				delayBetweenBars = 150,
				height = this.slider.image1.height(),
				totalLeft = 0;
			
			for(var i=0; i<barCount; i++) {
				var thisBarWidth = this.options.barWidth;
				
				if(remainder > 0)
				{
					var add = remainder >= addPerLoop ? addPerLoop : remainder;
					thisBarWidth += add;
					remainder -= add;
				}
				
				var bar = $('<div class="bar bar-'+i+'"></div>').css({
					width: thisBarWidth+'px',
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
				}),

				bar2 = $(bar.get(0).cloneNode(false)).css({
					'background-image': this.slider.image2.css('background-image')
				}).css3({
					'transform': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -height/2, height/2)
				}),
				
				left = $('<div class="side bar bar-'+i+'"></div>').css({
					width: height+'px',
					height: height+'px',
					position: 'absolute',
					top: '0px',
					left: '0px',
					background: '#222',
					'z-index': 190
				}).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, -height/2) + ' ' + flux.browser.rotateY(180),
					'backface-visibility': 'hidden'
				}),
				
				right = $(left.get(0).cloneNode(false)).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, thisBarWidth-height/2)
				}),
				
				barContainer = $('<div class="barcontainer"></div>').css({
					width: thisBarWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: totalLeft+'px',
					'z-index': i > barCount/2 ? 1000-i : 1000 // Fix for Chrome to ensure that the z-index layering is correct!
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'all',
					'transition-delay': (i*delayBetweenBars)+'ms',
					'transform-style': 'preserve-3d'
				}).append(bar).append(bar2).append(left).append(right);
				
				this.slider.image1.append(barContainer);
				
				totalLeft += thisBarWidth;
			}
			
			this.imageContainerOverflow = this.slider.imageContainer.css('overflow');
			
			this.slider.imageContainer.css({
				'overflow': 'visible'
			}).css3({
				'perspective': this.options.perspective,
				'perspective-origin': '50% 50%'
			});
		},
		execute: function() {
			//return;
			var _this = this,
				height = this.slider.image1.height(),
				bars = this.slider.image1.find('div.barcontainer');
			
			this.slider.image2.hide();
			
			// Get notified when the last transition has completed
			bars.last().transitionEnd(function(event){
				_this.slider.image2.show();

				_this.slider.imageContainer.css({
					'overflow': _this.imageContainerOverflow
				})
				
				_this.finished();
			});

			bars.css3({
				'transform': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2)
			});
		}
	}, opts));	
}