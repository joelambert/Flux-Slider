flux.transitions.bars3d = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		requires3d: true,
		barWidth: 100,
		setup: function() {
			var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1
			
			// Adjust the barWidth so that we can fit inside the available space
			this.options.barWidth = Math.floor(this.slider.image1.width() / barCount);
			
			// Work out how much space remains with the adjusted barWidth
			var remainder = this.slider.image1.width() - (barCount * this.options.barWidth);
			var addPerLoop = Math.ceil(remainder / barCount);
			
			var delayBetweenBars = 150;
			var height = this.slider.image1.height();
			
			var totalLeft = 0;
			
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
					
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+totalLeft+'px 0px',
					'background-repeat': 'no-repeat'
				}).css3({
					'backface-visibility': 'hidden'
				});

				var bar2 = $(bar.get(0).cloneNode(false)).css({
					'background-image': this.slider.image2.css('background-image')
				}).css3({
					'transform': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -height/2, height/2)
				});
				
				var left = $('<div class="side bar bar-'+i+'"></div>').css({
					width: height+'px',
					height: height+'px',
					position: 'absolute',
					top: '0px',
					left: '0px',
					background: '#222'
				}).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, -height/2)
				});
				
				var right = $(left.get(0).cloneNode(false)).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, thisBarWidth-height/2)
				});
				
				var barContainer = $('<div class="barcontainer"></div>').css({
					width: thisBarWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: totalLeft+'px'
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'all',
					'transition-delay': (i*delayBetweenBars)+'ms',
					'transform-style': 'preserve-3d'
				}).append(bar).append(bar2).append(left).append(right);
				
				this.imageContainerOverflow = this.slider.imageContainer.css('overflow');
				
				this.slider.imageContainer.css({
					'overflow': 'visible'
				}).css3({
					'perspective': 600,
					'perspective-origin': '50% 50%'
				});
				
				this.slider.image1.append(barContainer);
				
				totalLeft += thisBarWidth;
			}
		},
		execute: function() {
			var _this = this;
			
			var height = this.slider.image1.height();

			var bars = this.slider.image1.find('div.barcontainer');
			
			this.slider.image2.hide();
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).transitionEnd(function(){
				_this.slider.image2.show();
				
				_this.finished();
			});

			this.slider.image1.find('div.barcontainer').css3({
				'transform': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2)
			});
			
			// this.slider.image1.find('div.bar.current').css3({
			// 	'transform': flux.browser.translate(0, height/2) + ' ' + flux.browser.rotateX(-90)
			// });
			// 
			// this.slider.image1.find('div.bar.next').css3({
			// 	'transform': flux.browser.translate(0, 0) + ' ' + flux.browser.rotateX(0)
			// });
		}
	}, opts));	
}