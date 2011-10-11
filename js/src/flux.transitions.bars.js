(function($) {
	flux.transitions.bars = function(fluxslider, opts) {
		return new flux.transition_grid(fluxslider, $.extend({
			columns: 10,
			rows: 1,
			delayBetweenBars: 40,
			renderTile: function(elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
				$(elem).css({
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+leftOffset+'px 0px'
				}).css3({
					'transition-duration': '400ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all',
					'transition-delay': (colIndex*this.options.delayBetweenBars)+'ms'
				});
			},
			execute: function() {
				var _this = this;
	
				var height = this.slider.image1.height();
	
				var bars = this.slider.image1.find('div.tile');
	
				// Get notified when the last transition has completed
				$(bars[bars.length-1]).transitionEnd(function(){
					_this.finished();
				});
				
				setTimeout(function(){
					bars.css({
						'opacity': '0.5'
					}).css3({
						'transform': flux.browser.translate(0, height)
					});
				}, 50);
				
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);