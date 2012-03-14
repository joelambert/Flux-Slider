(function($) {
	flux.transitions.tiles3d = function(fluxslider, opts) {
		return new flux.transition_grid(fluxslider, $.extend({
			requires3d: true,
			forceSquare: true,
			columns: 5,
			perspective: 600,
			delayBetweenBarsX: 200,
			delayBetweenBarsY: 150,
			renderTile: function(elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
				var tile = $('<div></div>').css({
					width: colWidth+'px',
					height: rowHeight+'px',
					position: 'absolute',
					top: '0px',
					left: '0px',
					//'z-index': 200, // Removed to make compatible with FF10 (Chrome bug seems to have been fixed)

					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+leftOffset+'px -'+topOffset+'px',
					'background-repeat': 'no-repeat',
					'-moz-transform': 'translateZ(1px)'
				}).css3({
					'backface-visibility': 'hidden'
				});

				var tile2 = $(tile.get(0).cloneNode(false)).css({
					'background-image': this.slider.image2.css('background-image')
					//'z-index': 190 // Removed to make compatible with FF10 (Chrome bug seems to have been fixed)
				}).css3({
					'transform': flux.browser.rotateY(180),
					'backface-visibility': 'hidden'
				});

				$(elem).css({
					'z-index': (colIndex > this.options.columns/2 ? 500-colIndex : 500) + (rowIndex > this.options.rows/2 ? 500-rowIndex : 500) // Fix for Chrome to ensure that the z-index layering is correct!
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'ease-out',
					'transition-property': 'all',
					'transition-delay': (colIndex*this.options.delayBetweenBarsX+rowIndex*this.options.delayBetweenBarsY)+'ms',
					'transform-style': 'preserve-3d'
				}).append(tile).append(tile2);
			},
			execute: function() {
				this.slider.image1.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				});
				
				var _this = this;

				var tiles = this.slider.image1.find('div.tile');

				this.slider.image2.hide();

				// Get notified when the last transition has completed
				tiles.last().transitionEnd(function(event){
					_this.slider.image2.show();

					_this.finished();
				});
				
				setTimeout(function(){
					tiles.css3({
						'transform': flux.browser.rotateY(180)
					});
				}, 50);
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);