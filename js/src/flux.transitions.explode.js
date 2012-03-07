(function($) {
	flux.transitions.explode = function(fluxslider, opts) {
		return new flux.transition_grid(fluxslider, $.extend({
			columns: 6,
			forceSquare: true,
			delayBetweenBars: 30,
			perspective: 800,
			requires3d: true,
			renderTile: function(elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
				var delay = Math.floor(Math.random()*10*this.options.delayBetweenBars);
				
				$(elem).css({
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+leftOffset+'px -'+topOffset+'px'
				}).css3({
					'transition-duration': '500ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all',
					'transition-delay': delay+'ms'
				});
				
				// Keep track of the last elem to fire
				if(this.maxDelay === undefined)
					this.maxDelay = 0;
					
				if(delay > this.maxDelay)
				{
					this.maxDelay = delay;
					this.maxDelayTile = elem;
				}
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
				
				var _this = this;
	
				var blocks = this.slider.image1.find('div.tile');
	
				// Get notified when the last transition has completed
				this.maxDelayTile.transitionEnd(function(){
					_this.slider.image1.css3({
						'transform-style': 'flat'
					});
					_this.finished();
				});
	
				setTimeout(function(){
					blocks.each(function(index, block){				
						$(block).css({
							'opacity': '0'
						}).css3({
							'transform': flux.browser.translate(0, 0, 700) + " rotate3d("+(Math.round(Math.random()*2)-1)+", "+(Math.round(Math.random()*2)-1)+", "+(Math.round(Math.random()*2)-1)+", 90deg) "
						});
					});
				}, 50);
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);