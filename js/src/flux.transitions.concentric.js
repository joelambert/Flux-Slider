flux.transitions.concentric = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		blockSize: 60,
		delay: 150,
		alternate: false,
		setup: function() {
			var largestLength = this.image.width() > this.image.height() ? this.image.width() : this.image.height();
			
			// How many blocks do we need?
			var blockCount = Math.ceil(((largestLength-this.options.blockSize)/2) / this.options.blockSize) + 2; // 2 extra to account for the round border
			
			for(var i=0; i<blockCount; i++)
			{
				var thisBlockSize = (2*i*this.options.blockSize)+this.options.blockSize;
				
				var block = $('<div></div>').attr('class', 'block block-'+i).css({
					width: thisBlockSize+'px',
					height: thisBlockSize+'px',
					position: 'absolute',
					top: ((this.image.height()-thisBlockSize)/2)+'px',
					left: ((this.image.width()-thisBlockSize)/2)+'px',
					
					'z-index': 100+(blockCount-i),
					
					'background-image': this.image.css('background-image'),
					'background-position': 'center center',
					
					'-webkit-border-radius': '100000px',
					
					'-webkit-transition-duration': '800ms',
					'-webkit-transition-timing-function': 'linear',
					'-webkit-transition-property': 'opacity, -webkit-transform',
					'-webkit-transition-delay': ((blockCount-i)*this.options.delay)+'ms'
				});
				this.image.append(block);
			}
		},
		execute: function() {
			var _this = this;

			var blocks = this.image.find('div.block');
			
			// Get notified when the last transition has completed
			$(blocks[0]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			blocks.each(function(index, block){
				setTimeout(function(){
					$(block).css({
						'-webkit-transform': flux.browser.rotateZ((!_this.options.alternate || index%2 ? '' : '-')+'90'),
						'opacity': '0'
					});
				}, 5);
			})
		}
	}, opts));
};