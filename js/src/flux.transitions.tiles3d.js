(function($) {
	flux.transitions.tiles3d = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			requires3d: true,
			tileWidth: 180,
			perspective: 600,
			setup: function() {
				var blockCountX = Math.floor(this.slider.image1.width() / this.options.tileWidth) + 1,
					blockCountY = Math.floor(this.slider.image1.height() / this.options.tileWidth) + 1;

				// Adjust the tileWidth so that we can fit inside the available space
				this.options.tileWidth = Math.floor(this.slider.image1.width() / blockCountX);

				// Work out how much space remains with the adjusted tileWidth
				var remainderX = this.slider.image1.width() - (blockCountX * this.options.tileWidth),
					addPerLoopX = Math.ceil(remainderX / blockCountX),
					remainderY = this.slider.image1.height() - (blockCountY * this.options.tileWidth),
					addPerLoopY = Math.ceil(remainderY / blockCountY),

					delayBetweenBarsX = 200,
					delayBetweenBarsY = 150,

					height = this.slider.image1.height(),

					totalLeft = 0,
					fragment = document.createDocumentFragment();

				for(var i=0; i<blockCountX; i++) {

					var totalTop = 0;

					var thisTileWidth = this.options.tileWidth;

					if(remainderX > 0)
					{
						var addX = remainderX >= addPerLoopX ? addPerLoopX : remainderX;
						thisTileWidth += addX;
						remainderX -= addX;
					}

					for(var j=0; j<blockCountY; j++)
					{
						var thisTileHeight = this.options.tileWidth;

						var remainderY2 = remainderY;

						if(remainderY2 > 0)
						{
							var addY = remainderY2 >= addPerLoopY ? addPerLoopY : remainderY2;
							thisTileHeight += addY;
							remainderY2 -= addY;
						}

						var tile = $('<div class="tile tile-'+i+'-'+j+'"></div>').css({
							width: thisTileWidth+'px',
							height: thisTileHeight+'px',
							position: 'absolute',
							top: '0px',
							left: '0px',
							'z-index': 200,

							'background-image': this.slider.image1.css('background-image'),
							'background-position': '-'+totalLeft+'px -'+totalTop+'px',
							'background-repeat': 'no-repeat'
						}).css3({
							'backface-visibility': 'hidden'
						});

						var tile2 = $(tile.get(0).cloneNode(false)).css({
							'background-image': this.slider.image2.css('background-image'),
							'z-index': 190
						}).css3({
							'transform': flux.browser.rotateY(180)
						});

						var tileContainer = $('<div class="tilecontainer"></div>').css({
							width: thisTileWidth+'px',
							height: thisTileHeight+'px',
							position: 'absolute',
							top: totalTop+'px',
							left: totalLeft+'px',
							'z-index': (i > blockCountX/2 ? 500-i : 500) + (j > blockCountY/2 ? 500-j : 500) // Fix for Chrome to ensure that the z-index layering is correct!
						}).css3({
							'transition-duration': '800ms',
							'transition-timing-function': 'ease-out',
							'transition-property': 'all',
							'transition-delay': (i*delayBetweenBarsX+j*delayBetweenBarsY)+'ms',
							'transform-style': 'preserve-3d'
						}).append(tile).append(tile2);

						fragment.appendChild(tileContainer.get(0));
						//this.slider.image1.append(tileContainer);

						totalTop += thisTileHeight;
					}

					totalLeft += thisTileWidth;
				}

				//this.slider.image1.append($(fragment));
				this.slider.image1.get(0).appendChild(fragment);

				this.slider.imageContainer.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				});
			},
			execute: function() {
				var _this = this;

				var tiles = this.slider.image1.find('div.tilecontainer');

				this.slider.image2.hide();

				// Get notified when the last transition has completed
				tiles.last().transitionEnd(function(event){
					_this.slider.image2.show();

					_this.finished();
				});

				tiles.css3({
					'transform': flux.browser.rotateY(180)
				});
			}
		}, opts));	
	}
})(window.jQuery || window.Zepto);