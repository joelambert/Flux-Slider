(function($) {
	flux.transitions.blocks2 = function(fluxslider, opts) {
		return new flux.transition_grid(fluxslider, $.extend({
			cols: 12,
			forceSquare: true,
			delayBetweenDiagnols: 150,
			renderTile: function(elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
				var delay = Math.floor(Math.random()*10*this.options.delayBetweenBars);
				
				$(elem).css({
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+leftOffset+'px -'+topOffset+'px'
				}).css3({
					'transition-duration': '350ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all',
					'transition-delay': (colIndex+rowIndex)*this.options.delayBetweenDiagnols+'ms',
					'backface-visibility': 'hidden' // trigger hardware acceleration
				});
			},
			execute: function() {
				var _this = this;
	
				var blocks = this.slider.image1.find('div.tile');
	
				// Get notified when the last transition has completed
				blocks.last().transitionEnd(function(){
					_this.finished();
				});
				
				setTimeout(function(){
					blocks.each(function(index, block){				
						$(block).css({
							'opacity': '0'
						}).css3({
							'transform': 'scale(0.8)'
						});
					});
				}, 50);
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);