/**
 * Helper object to determine support for various CSS3 functions
 * @author Joe Lambert
 */

(function($) {
	flux.browser = {
		init: function() {
			// Have we already been initialised?
			if(flux.browser.supportsTransitions !== undefined)
				return;

			var div = document.createElement('div'),
				prefixes = ['-webkit', '-moz', '-o', '-ms'],
				domPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];

			// Does the current browser support CSS Transitions?
			if(window.Modernizr && Modernizr.csstransitions !== undefined)
				flux.browser.supportsTransitions = Modernizr.csstransitions;
			else
			{
				flux.browser.supportsTransitions = this.supportsCSSProperty('Transition');
			}

			// Does the current browser support 3D CSS Transforms?
			if(window.Modernizr && Modernizr.csstransforms3d !== undefined)
				flux.browser.supports3d = Modernizr.csstransforms3d;
			else
			{
				// Custom detection when Modernizr isn't available
				flux.browser.supports3d = this.supportsCSSProperty("Perspective");
				
				if ( flux.browser.supports3d && 'webkitPerspective' in $('body').get(0).style ) {
					// Double check with a media query (similar to how Modernizr does this)
					var div3D = $('<div id="csstransform3d"></div>');
					var mq = $('<style media="(transform-3d), ('+prefixes.join('-transform-3d),(')+'-transform-3d)">div#csstransform3d { position: absolute; left: 9px }</style>');

					$('body').append(div3D);
					$('head').append(mq);

					flux.browser.supports3d = div3D.get(0).offsetLeft == 9;

					div3D.remove();
					mq.remove();	
				}
			}

		},
		supportsCSSProperty: function(prop) {
			var div = document.createElement('div'),
				prefixes = ['-webkit', '-moz', '-o', '-ms'],
				domPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];
				
			var support = false;
			for(var i=0; i<domPrefixes.length; i++)
			{
				if(domPrefixes[i]+prop in div.style)
					support = support || true;
			}
			
			return support;
		},
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
			{
				if(axis == 'z')
					return 'rotate('+deg+'deg)';
				else
					return '';
			}
		}
	};

	$(function(){
		// To continue to work with legacy code, ensure that flux.browser is initialised on document ready at the latest
		flux.browser.init();
	});
})(window.jQuery || window.Zepto);