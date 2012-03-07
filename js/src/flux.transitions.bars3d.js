(function($) {
	flux.transitions.bars3d = function(fluxslider, opts) {
		return new flux.transition_grid(fluxslider, $.extend({
			requires3d: true,
			columns: 7,
			rows: 1,
			delayBetweenBars: 150,
			perspective: 1000,
			renderTile: function(elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
				var bar = $('<div class="bar-'+colIndex+'"></div>').css({
					width: colWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: '0px',
					'z-index': 200,

					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+leftOffset+'px 0px',
					'background-repeat': 'no-repeat'
				}).css3({
					'backface-visibility': 'hidden'
				}),

				bar2 = $(bar.get(0).cloneNode(false)).css({
					'background-image': this.slider.image2.css('background-image')
				}).css3({
					'transform': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -rowHeight/2, rowHeight/2)
				}),

				left = $('<div class="side bar-'+colIndex+'"></div>').css({
					width: rowHeight+'px',
					height: rowHeight+'px',
					position: 'absolute',
					top: '0px',
					left: '0px',
					background: '#222',
					'z-index': 190
				}).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(rowHeight/2, 0, -rowHeight/2) + ' ' + flux.browser.rotateY(180),
					'backface-visibility': 'hidden'
				}),

				right = $(left.get(0).cloneNode(false)).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(rowHeight/2, 0, colWidth-rowHeight/2)
				});

				$(elem).css({
					width: colWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: leftOffset+'px',
					'z-index': colIndex > this.options.columns/2 ? 1000-colIndex : 1000 // Fix for Chrome to ensure that the z-index layering is correct!
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'all',
					'transition-delay': (colIndex*this.options.delayBetweenBars)+'ms',
					'transform-style': 'preserve-3d'
				}).append(bar).append(bar2).append(left).append(right);
			},
			execute: function() {
				this.slider.image1.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				}).css({
					'-moz-transform': 'perspective('+this.options.perspective+'px)',
					'-moz-perspective': 'none',
					'-moz-transform-style': 'preserve-3d'
				});
				
				var _this = this,
					height = this.slider.image1.height(),
					bars = this.slider.image1.find('div.tile');

				this.slider.image2.hide();

				// Get notified when the last transition has completed
				bars.last().transitionEnd(function(event){
					_this.slider.image1.css3({
						'transform-style': 'flat'
					});
					
					_this.slider.image2.show();

					_this.finished();
				});
				
				setTimeout(function(){
					bars.css3({
						'transform': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2)
					});
				}, 50);
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);