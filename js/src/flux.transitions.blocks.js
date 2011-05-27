flux.transitions.blocks = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		blockSize: 80,
		blockDelays: {},
		maxDelay: 0,
		setup: function() {
			var xCount = Math.floor(this.slider.image1.width() / this.options.blockSize)+1,
				yCount = Math.floor(this.slider.image1.height() / this.options.blockSize)+1,
				delayBetweenBars = 100,
				fragment = document.createDocumentFragment();
			
			for(var i=0; i<xCount; i++)
			{
				for(var j=0; j<yCount; j++)
				{
					var delay = Math.floor(Math.random()*10*delayBetweenBars);

					var block = $('<div></div>').attr('class', 'block block-'+i+'-'+j).data('id', i+':'+j).css({
						width: this.options.blockSize+'px',
						height: this.options.blockSize+'px',
						position: 'absolute',
						top: (j*this.options.blockSize)+'px',
						left: (i*this.options.blockSize)+'px',
						
						'background-image': this.slider.image1.css('background-image'),
						'background-position': '-'+(i*this.options.blockSize)+'px -'+(j*this.options.blockSize)+'px'
					}).css3({
						'transition-duration': '350ms',
						'transition-timing-function': 'ease-in',
						'transition-property': 'all',
						'transition-delay': delay+'ms'
					});
					
					fragment.appendChild(block.get(0));
					
					if(delay > this.options.maxDelay)
					{
						this.options.maxDelayBlock = block;
						this.options.maxDelay = delay;
					}
				}
			}
			
			//this.slider.image1.append($(fragment));
			this.slider.image1.get(0).appendChild(fragment);
		},
		execute: function() {
			var _this = this;

			var blocks = this.slider.image1.find('div.block');
			
			// Get notified when the last transition has completed
			this.options.maxDelayBlock.transitionEnd(function(){
				_this.finished();
			});
			
			blocks.each(function(index, block){				
				setTimeout(function(){
					$(block).css({
						'opacity': '0'
					}).css3({
						'transform': 'scale(0.8)'
					});
				}, 5);
			})
		}
	}, opts));
};