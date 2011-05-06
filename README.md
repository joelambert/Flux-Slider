# Flux Slider
Flux slider is a CSS3 animation based image transition framework, inspired in part by the fantastic [Nivo Slider](nivo.dev7studios.com) jQuery plugin.

Instead of the traditional Javascript timer based animations used by jQuery, Flux utilises the newer, more powerful CSS3 animation technology. Its in a fairly early/rough state at the moment but testing on the iPhone/iPad does appear to produce much smoother animations. Desktop performance (as with Nivo) is very smooth but the use of CSS3 enables us to produce some new effects that Nivo can’t, e.g. rotations.

The aim is to use hardware acceleration where possible to improve performace on less powerful devices, such as mobiles & tablets.

## Tested Under
- Safari
- Chrome
- iOS

## May/should also work for
- Android

# Requirements
Flux requires a Webkit browser and has been built to use either jQuery or [Zepto.js](http://zepto.js) as they share the same API. For mobile deployment Zepto is recommended due to its <5k deployment footprint.

# Usage
Create HTML markup with the images you wish to use. For example:

	<div id="slider">
		<img src="img/avatar.jpg" alt="" />
		<img src="img/ironman.jpg" alt="" />
		<img src="img/tron.jpg" alt="" />
		<img src="img/greenhornet.jpg" alt="" />
	</div>
	
Next instantiate Flux Slider:

	$(function(){
		window.myFlux = new flux.slider('#slider');
	});
	
## Configuration options
The <flux.slider> constructor can also take an optional second parameter which is an object of key/value configuration options.

- 	**autoplay** Boolean *(default: true)*
	
	Whether or not the slider should start to play automatically
	
- 	**pagination** Boolean *(default: false)*

	Whether or not to show a pagination control for manually selecting the image to show
	
- 	**transitions** Array *(default: all available transitions)*

	An array with the names of the transitions to use, available options are:
	
	+ **bars**
	+ **blinds**
	+ **blocks**
	+ **concentric**
	+ **warp**
	+ **zip**
	
- 	**delay** Integer *(default: 4000)*

	The number of milliseconds to wait between image transitions