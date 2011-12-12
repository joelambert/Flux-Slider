# Flux Slider
Flux slider is a CSS3 animation based image transition framework, inspired in part by the fantastic [Nivo Slider](nivo.dev7studios.com) jQuery plugin.

Instead of the traditional Javascript timer based animations used by jQuery, Flux utilises the newer, more powerful CSS3 animation technology. Its in a fairly early/rough state at the moment but testing on the iPhone/iPad does appear to produce much smoother animations. Desktop performance (as with Nivo) is very smooth but the use of CSS3 enables us to produce some new effects that Nivo can’t, e.g. rotations.

The aim is to use hardware acceleration where possible to improve performance on less powerful devices, such as mobiles & tablets.

## Known to work with
- Safari 
- Chrome
- iOS
- Blackberry Playbook
- Firefox 4
- Opera 11

## May/should also work for
- Android (Known to be jerky due to lack of hardware acceleration)

# Requirements
Flux requires a browser which supports CSS3 transformations and has been built to use either jQuery or [Zepto.js](http://zepto.js) as they share the same API. For mobile deployment Zepto is recommended due to its <5k deployment footprint.

# Usage
Create HTML markup with the images you wish to use. You can also wrap images in a link if you need them to be clickable. For example:

	<div id="slider">
		<img src="img/avatar.jpg" alt="" />
		<img src="img/ironman.jpg" alt="" title="Ironman Screenshot" />
		<a href=""><img src="img/imagewithlink.jpg" alt="" /></a>
		<img src="img/tron.jpg" alt="" />
	</div>
	
Next instantiate Flux Slider:

	$(function(){
		window.myFlux = new flux.slider('#slider');
	});
	
Or, if you're using the provided jQuery widget then you can also do the following:
	
	$(function(){
		window.myFlux = $('#slider').flux();
	});
	
*Note: If you plan to use the Zepto framework then the widget method won't work*

## A note on feature detection
Flux now makes use of [Modernizr](http://www.modernizr.com) when available for feature detection. Flux **does not** require Modernizr but it will use it instead of the inbuilt code if it's loaded.

Note: If you have a need to initialise Flux before the `$.ready()` event (*not recommended!*) then you will need to use Modernizr for feature detection as the inbuilt code does not play well with an uninitialised DOM.
	
## Configuration options
The <flux.slider> constructor can also take an optional second parameter which is an object of key/value configuration options.

- 	**autoplay** Boolean *(default: true)*
	
	Whether or not the slider should start to play automatically
	
- 	**pagination** Boolean *(default: false)*

	Whether or not to show a pagination control for manually selecting the image to show
	
- 	**controls** Boolean *(default: false)*

	Whether or not to show a next/prev controls
	
- 	**captions** Boolean *(default: false)*

	Whether or not to show a caption bar. Captions are read from the `title` attribute of loaded `img` elements
	
- 	**transitions** Array *(default: all available transitions)*

	An array with the names of the transitions to use, available options are:
	
	+ **2D**
		- `bars`
		- `blinds`
		- `blocks`
		- `blocks2`
		- `concentric`
		- `dissolve` *requires mask support*
		- `slide`
		- `warp`
		- `zip`
	+ **3D**
		- `bars3d`
		- `blinds3d`
		- `cube`
		- `tiles3d`
		- `turn`
	
- 	**delay** Integer *(default: 4000)*

	The number of milliseconds to wait between image transitions
	
For example, to prevent autoplay and show a pagination control you would do the following:

	$(function(){
		window.myFlux = new flux.slider('#slider', {
			autoplay: false,
			pagination: true
		});
	});
	
Or with the jQuery widget:

	$(function(){
		window.myFlux = $('#slider').flux({
			autoplay: false,
			pagination: true
		});
	});

## flux.slider API

The API functions work with both the native Javascript object and the jQuery widget. For example:

	// Show next image using the bars3d transition (native Javascript object)
	window.myFlux.next('bars3d');
	
or

	// Show next image using the bars3d transition (jQuery widget)
	window.myFlux.flux('next', 'bars3d');
	
*Note: All the jQuery widget functions are chainable except those that return something specific, such as `isPlaying()` & `getImage()`.*

For more information on using jQuery widgets see the [jQuery Doc's](http://docs.jquery.com/UI_Developer_Guide);

### Play controls
- `start()` Enable autoplay
- `stop()` Disable autoplay
- `isPlaying()` Returns a boolean as to whether autoplay is currently enabled

### Transport controls
- 	`next([transition [, options]])` 

	Show the next image. 
	
	`transition` *(optional)* The name of the transition to use, otherwise one picked at random
	
	`options` *(optional)* Transition specific options for this transition only
	
- 	`prev([transition [, options]])` 

	Show the previous image. 
	
	`transition` *(optional)* The name of the transition to use, otherwise one picked at random
	
	`options` *(optional)* Transition specific options for this transition only
	
- 	`showImage(index [, transition [, options]])` 

	Show the image at `index`. 
	
	`transition` *(optional)* The name of the transition to use, otherwise one picked at random
	
	`options` *(optional)* Transition specific options for this transition only

### Misc
- `getImage(index)` Returns the image with the provided index

### Receiving notification when a transition completes

There are occasions where you may wish to know when a transition has completed, or that the currently displayed image has changed.

Flux provides a couple of mechanisms for this:

#### `fluxTransitionEnd` Javascript Event

After each transition, Flux dispatches a `fluxTransitionEnd` event. To listen for these events you can do the following:

	$('#slider').bind('fluxTransitionEnd', function(event) {
		var img = event.data.currentImage;
		// Do something with img...
	});

#### `onTransitionEnd` callback function
	
You can alternatively pass in a callback function as part of the configuration options when you instantiate Flux, e.g.

	window.myFlux = $('#slider').flux({
		autoplay: false,
		pagination: true,
		onTransitionEnd: function(data) {
			var img = data.currentImage;
			// Do something with img...
		}
	});
	
# Writing custom transitions
Writing your own custom transitions is easy, you just need to create an instance of a `flux.transition` object and pass in some callback functions to provide the custom behaviour you're looking for.

Lets look at the built in **bars** transition as an example. The barebones definition of the transition looks like:

	flux.transitions.bars = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			barWidth: 60,
			setup: function() {
				
			},
			execute: function() {
				
			}
		}, opts));	
	}

Here we add a new function to the `flux.transitions` namespace called **bars**. This function takes two parameters, a `flux.slider` object and an options key/value object. 

*Note: Its currently not possible to pass options into transitions from the core flux.slider code but as this is on the list of things to add its a good idea to make sure the transitions can handle this when its implemented!*

The function we create should return a new `flux.transition` object, passing in the `flux.slider` parameter along with a set of options.

All transition objects automatically have access to the following:

- 	`this.slider` 

	The `flux.slider` object passed into the constructor. From this object you can access the current image `this.slider.image1` and the next image `this.slider.image2`.
	
- 	`this.options`

	The options passed in as the 2nd parameter to the `flux.transition` constructor call.
	

## setup()
Two functions are needed for the transition to operate, first is `setup`. This function is responsible for initialising the DOM before the transition runs. In the case of the bars transition this function creates a `div` for each bar and set the background image so that adjacent bars appear as a single image.

The setup function should also initialise the CSS3 properties needed to enable a CSS transition.

	setup: function() {
		var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1
	
		var delayBetweenBars = 40;
	
		for(var i=0; i<barCount; i++) {
			var bar = $('<div></div>').attr('class', 'bar bar-'+i).css({
				width: this.options.barWidth+'px',
				height: '100%',
				position: 'absolute',
				top: '0',
				left: (i*this.options.barWidth)+'px',
			
				'background-image': this.slider.image1.css('background-image'),
				'background-position': '-'+(i*this.options.barWidth)+'px 0px'
			}).css3({
				'transition-duration': '400ms',
				'transition-timing-function': 'ease-in',
				'transition-property': 'all',
				'transition-delay': (i*delayBetweenBars)+'ms'
			});
			this.slider.image1.append(bar);
		}
	}

A helper function called `.css3()` has been created for convenience to automatically add vendor prefixes to CSS3 properties. Any properties that require prefixes should be added via this function rather than `.css()` as this ensures that transitions are cross-browser compatible.
	
## execute()
The `execute` function is where the CSS changes should be made, as transitions have already been initialised in `setup()` applying the end CSS property state should be all thats required:

	execute: function() {
		var _this = this;
	
		var height = this.slider.image1.height();

		var bars = this.slider.image1.find('div.bar');
	
		// Get notified when the last transition has completed
		$(bars[bars.length-1]).transitionEnd(function(){
			_this.finished();
		});
	
		bars.css({
			'opacity': '0.5'
		}).css3({
			'transform': flux.browser.translate(0, height)
		});
	}
	
Two further convenience functions have been used in this example. The first `.transitionEnd()` is a cross-browser event function to catch the 'transition end' event. In this example we want to be notified when the final bar as finished animating, this is how we know the transition is complete. We can then perform some custom code but its important to remember to call the transitions `finished()` function to ensure that the DOM is reset for the next transition.

## Transition writing guidelines

Here are some guidelines for writing transitions if you'd like to have them considered for inclusion into the main distribution:

- 	If the transition requires 3D transforms you must set the `requires3d` property to `true`. e.g.
	
		flux.transitions.bars3d = function(fluxslider, opts) {
			return new flux.transition(fluxslider, $.extend({
				requires3d: true,
				setup: function() {
					...
				}
			}
		};

- 	For delaying animations to specific bars/blocks/tiles use `-[webkit/moz/o]-transition-delay` rather than `setTimeout()`/`setInterval()`. This enables the GPU to handle the timing and makes for smoother transitions.

- 	When using many new bars/blocks/tiles, add them to a container element off DOM and then add the container in one go, e.g.
	
		var container = $('<div></div>');
		
		for(var i=0; i<10; i++) {
			var elem = $('<div></div');
			container.append(elem);
		}
		
		this.image.slider1.append(container);

# flux.browser

`flux.browser` is an object designed to help determine browser support for CSS3 transitions.

- 	`supportsTransitions` *Boolean* 

	Does the current browser support CSS3 transitions?
	
- 	`supports3d` *Boolean* 

	Does the current browser support 3D CSS3 transitions?
	
- 	`translate(x, y, z)`

	Returns a CSS translate string most suitable for the current browser, for example under iOS where 3D transformations are supported `flux.browser.translate(10, 20)` would return `translate3d(10, 20, 0)` so as to trigger hardware acceleration.
	
- 	`rotate(axis, deg)`
	
	Operates the same as the above translate function and returns the most suitable CSS for the current browser.
	
- 	`rotateX(deg)`

	Returns the result of calling `flux.browser.rotate('x', deg)` *Requires 3D transformation support*
	
- 	`rotateY(deg)`

	Returns the result of calling `flux.browser.rotate('y', deg)` *Requires 3D transformation support*
	
- 	`rotateZ(deg)`

	Returns the result of calling `flux.browser.rotate('z', deg)`
	
# License

Flux is Copyright &copy; 2011 [Joe Lambert](http://www.joelambert.co.uk) and is licensed under the terms of the [MIT License](http://www.opensource.org/licenses/mit-license.php).