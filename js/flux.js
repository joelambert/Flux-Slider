/**
 * @preserve Flux Slider v1.1
 * http://www.joelambert.co.uk/flux
 *
 * Copyright 2011, Joe Lambert. All rights reserved
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Flux namespace
var flux = {};

flux.slider = function(elem, opts) {
	if(!flux.browser.webkit)
	{
		if(window.console && window.console.error)
			console.error("Flux Slider requires a Webkit browser");

		return;
	}
	
	var _this = this;
	
	this.element = $(elem);
	
	// Make a list of all available transitions
	this.transitions = [];
	for(var fx in flux.transitions)
		this.transitions.push(fx);
	
	this.options = $.extend({
		autoplay: true,
		transitions: this.transitions,
		delay: 4000,
		pagination: true,
		controls: true
	}, opts);
	
	// Get a list the images to use
	this.images = new Array();
	this.imageLoadedCount = 0;
	this.currentImageIndex = 0;
	this.nextImageIndex = 1;
	this.playing = false;
	
	this.element.find('img').each(function(index, found_img){
		_this.images.push(found_img.cloneNode());

		var image = new Image();
		image.onload = function() {
			_this.imageLoadedCount++;

			_this.width  = this.width;
			_this.height = this.height;
			
			if(_this.imageLoadedCount >= _this.images.length)
			{
				_this.finishedLoading();
				_this.setupImages();
			}
		};
		
		// Load the image to ensure its cached by the browser
		image.src = found_img.src;
		
		// Remove the images from the DOM
		$(found_img).remove();
	});
	
	this.container = $('<div class="fluxslider"></div>');
	this.element.append(this.container);
	
	this.imageContainer = $('<div class="images loading"></div>').css({
		'position': 'relative',
		'overflow': 'hidden',
		'min-height': '100px'
	});
	this.container.append(this.imageContainer);
	
	this.image1 = $('<div class="image1" style="height: 100%; width: 100%"></div>');
	this.imageContainer.append(this.image1);
	
	this.image2 = $('<div class="image2" style="height: 100%; width: 100%"></div>');
	this.imageContainer.append(this.image2);
	
	$(this.image1).css({
		'position': 'absolute',
		'top': '0px',
		'left': '0px'
	});
	
	$(this.image2).css({
		'position': 'absolute',
		'top': '0px',
		'left': '0px'
	});
	
	// Should we auto start the slider?
	if(this.options.autoplay)
		this.start();
};

flux.slider.prototype = {
	constructor: flux.slider,
	start: function() {
		var _this = this;
		this.interval = setInterval(function() {
			_this.transition();
		}, this.options.delay);
	},
	stop: function() {
		clearInterval(this.interval);
	},
	next: function() {
		this.showImage(this.currentImageIndex+1);
	},
	prev: function() {
		this.showImage(this.currentImageIndex-1);
	},
	showImage: function(index) {
		this.setNextIndex(index);
		
		this.stop();
		this.setupImages();
		this.transition();
		this.start();
	},  
	finishedLoading: function() {
		var _this = this;
		
		this.container.css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		this.imageContainer.removeClass('loading');
		
		// Should we setup a pagination view?
		if(this.options.pagination)
		{
			// TODO: Attach to touch events if appropriate
			this.pagination = $('<ul class="pagination"></ul>').css({
				margin: '0px',
				padding: '0px',
				'text-align': 'center'
			});
			
			this.pagination.bind('click', function(event){
				event.preventDefault();
				_this.showImage($(event.target).data('index'));
			});
			
			$(this.images).each(function(index, image){
				var li = $('<li data-index="'+index+'">'+(index+1)+'</li>').css({
					display: 'inline-block',
					'margin-left': '0.5em',
					'cursor': 'pointer'
				});
				
				_this.pagination.append(li);
				
				if(index == 0)
					li.css('margin-left', 0).addClass('current');
			});
			
			this.container.append(this.pagination);
		}
		
		// Resize
		$(this.imageContainer).css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		$(this.image1).css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		$(this.image2).css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		this.container.css({
			width: this.width+'px',
			height: this.height+(this.options.pagination?this.pagination.height():0)+'px'
		});
	},
	setupImages: function() {
		this.image1.css({
			'background-image': 'url("'+this.getImage(this.currentImageIndex).src+'")',
			'z-index': 101
		}).children().remove();
		
		this.image2.css({
			'background-image': 'url("'+this.getImage(this.nextImageIndex).src+'")',
			'z-index': 100
		});
		
		if(this.options.pagination)
		{
			this.pagination.find('li.current').removeClass('current');
			$(this.pagination.find('li')[this.currentImageIndex]).addClass('current');
		}
	},
	transition: function() {
		// Pick a transition at random
		var index = Math.floor(Math.random()*(this.options.transitions.length));
		
		var tran = new flux.transitions[this.options.transitions[index]](this);
		//var tran = new flux.transitions.concentric(this);
		tran.run();
		
		this.currentImageIndex = this.nextImageIndex;
		this.setNextIndex(this.currentImageIndex+1);
	},
	getImage: function(index) {
		index = index % this.images.length;
			
		return this.images[index];
	},
	setNextIndex: function(nextIndex)
	{
		if(nextIndex == undefined)
			nextIndex = this.currentImageIndex+1;
		
		this.nextImageIndex = nextIndex;
		
		if(this.nextImageIndex > this.images.length-1)
			this.nextImageIndex = 0;
			
		if(this.nextImageIndex < 0)
			this.nextImageIndex = this.images.length-1;
	},
	increment: function() {
		this.currentImageIndex++;
		if(this.currentImageIndex > this.images.length-1)
			this.currentImageIndex = 0;
	}
};

/**
 * Helper object to determine support for various CSS3 functions
 * @author Joe Lambert
 */

flux.browser = {
	translate: function(x, y, z) {
		x = (x != undefined) ? x : 0;
		y = (y != undefined) ? y : 0;
		z = (z != undefined) ? z : 0;
		
		return 'translate' + (flux.browser.supports3d ? '3d(' : '(') + x + 'px,' + y + (flux.browser.supports3d ? 'px,' + z + 'px)' : 'px)');
	},
	
	rotateX: function(deg) {
		return flux.browser.rotate('x', deg);
	},
	
	rotateY: function(deg) {
		return flux.browser.rotate('y', deg);
	},
	
	rotateZ: function(deg) {
		return flux.browser.rotate('z', deg);
	},
	
	rotate: function(axis, deg) {
		if(!axis in {'x':'', 'y':'', 'z':''})
			axis = 'z';
			
		deg = (deg != undefined) ? deg : 0;
			
		if(flux.browser.supports3d)
			return 'rotate3d('+(axis == 'x' ? '1' : '0')+', '+(axis == 'y' ? '1' : '0')+', '+(axis == 'z' ? '1' : '0')+', '+deg+'deg)';
		else
			return 'rotate'+axis.toUpperCase()+'('+deg+'deg)';
	}
};

(function() {
	// Work out which prefix this browser supports
	// var browserPrefixes = {
	// 	'webkit': 'Webkit',
	// 	'moz': 'Moz',
	// 	'ms': 'ms',
	// 	'o': 'O'
	// };
	// 
	// var dom = document.createElement('div');
	// 
	// for(var pre in browserPrefixes)
	// {
	// 	dom.style = '-'+pre+'-transform: translate(0,0)';
	// 	if(dom.style[browserPrefixes[pre]+'Transform']!=undefined)
	// 	{
	// 		flux.browser.prefixCSS = pre;
	// 		flux.browser.prefixDOM = browserPrefixes[pre];
	// 	}
	// }
	
	flux.browser.webkit = RegExp(" AppleWebKit/").test(navigator.userAgent);
	flux.browser.supports3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
})();;

flux.transition = function(fluxslider, opts) {
	this.options = $.extend({
		// Default callback for once the transition has completed
		after: function() {
			fluxslider.setupImages();
		}
	}, opts);
	
	this.image = fluxslider.image1;
};

flux.transition.prototype = {
	constructor: flux.transition,
	run: function() {
		// do something
		if(this.options.setup)
			this.options.setup.call(this);
		
		// Remove the background image from the top image
		this.image.css({
			'background-image': 'none'
		});
		
		if(this.options.execute)
			this.options.execute.call(this);
	},
	finished: function() {
		if(this.options.after)
			this.options.after.call(this);
	}
};

flux.transitions = {};;

flux.transitions.bars = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		barWidth: 60,
		setup: function() {
			var barCount = Math.floor(this.image.width() / this.options.barWidth) + 1
			
			var delayBetweenBars = 40;
			
			for(var i=0; i<barCount; i++) {
				var bar = $('<div></div>').attr('class', 'bar bar-'+i).css({
					width: this.options.barWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0',
					left: (i*this.options.barWidth)+'px',
					
					'background-image': this.image.css('background-image'),
					'background-position': '-'+(i*this.options.barWidth)+'px 0px',
					
					'-webkit-transition-duration': '400ms',
					'-webkit-transition-timing-function': 'ease-in',
					'-webkit-transition-property': 'opacity, -webkit-transform',
					'-webkit-transition-delay': (i*delayBetweenBars)+'ms'
				});
				this.image.append(bar);
			}
		},
		execute: function() {
			var _this = this;
			
			var height = this.image.height();

			var bars = this.image.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			bars.css({
				'-webkit-transform': flux.browser.translate(0, height),
				'opacity': '0.5'
			});
		}
	}, opts));	
};

flux.transitions.blinds = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, {
		barWidth: 70,
		execute: function() {
			var _this = this;
			
			var height = this.image.height();

			var bars = this.image.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			bars.css({
				'-webkit-transform': 'scalex(0.0001)',
				'opacity': '0.5'
			});
		}
	});
};

flux.transitions.zip = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, {
		execute: function() {
			var _this = this;
			
			var height = this.image.height();

			var bars = this.image.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			bars.each(function(index, bar){	
				setTimeout(function(){
					$(bar).css({
						'-webkit-transform': flux.browser.translate(0, (index%2 ? '-'+(2*height) : height)),
						'opacity': '0.3'
					});
				}, 5);		
			})
		}
	});
};

flux.transitions.blocks = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		blockSize: 80,
		blockDelays: {},
		maxDelay: 0,
		setup: function() {
			var xCount = Math.floor(this.image.width() / this.options.blockSize)+1;
			var yCount = Math.floor(this.image.height() / this.options.blockSize)+1;
			
			var delayBetweenBars = 100;
			
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
						
						'background-image': this.image.css('background-image'),
						'background-position': '-'+(i*this.options.blockSize)+'px -'+(j*this.options.blockSize)+'px',
						
						'-webkit-transition-duration': '350ms',
						'-webkit-transition-timing-function': 'ease-in',
						'-webkit-transition-property': 'opacity, -webkit-transform',
						'-webkit-transition-delay': delay+'ms'
					});
					this.image.append(block);
					
					if(delay > this.options.maxDelay)
					{
						this.options.maxDelayBlock = block;
						this.options.maxDelay = delay;
					}
				}
			}
		},
		execute: function() {
			var _this = this;

			var blocks = this.image.find('div.block');
			
			// Get notified when the last transition has completed
			this.options.maxDelayBlock.bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			blocks.each(function(index, block){				
				setTimeout(function(){
					$(block).css({
						'-webkit-transform': 'scale(0.8)',
						'opacity': '0'
					});
				}, 5);
			})
		}
	}, opts));
};;

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
};;

flux.transitions.warp = function(fluxslider, opts) {
	return new flux.transitions.concentric(fluxslider, $.extend({
		delay: 30,
		alternate: true
	}, opts));
};;

