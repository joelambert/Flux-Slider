/**
 * @preserve Flux Slider v@VERSION
 * http://www.joelambert.co.uk/flux
 *
 * Copyright 2011, Joe Lambert. All rights reserved
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Flux namespace
var flux = {
	version: '@VERSION'
};

flux.slider = function(elem, opts) {
	if(!flux.browser.supportsTransitions)
	{
		if(window.console && window.console.error)
			console.error("Flux Slider requires a browser that supports CSS3 transitions");
	
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
		_this.images.push(found_img.cloneNode(false));

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
		
		if(this.options.autoplay)
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
}