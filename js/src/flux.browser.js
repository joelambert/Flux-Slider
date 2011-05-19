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
		{
			if(axis == 'z')
				return 'rotate('+deg+'deg)';
			else
				return '';
		}
	}
};

$(function() {
	var div = document.createElement('div');
	
	flux.browser.supportsTransitions = false;
	var prefixes = ['Webkit', 'Moz', 'O', 'Ms'];
	for(var i=0; i<prefixes.length; i++)
	{
		if(prefixes[i]+'Transition' in div.style)
			flux.browser.supportsTransitions = flux.browser.supportsTransitions || true;
	}

	flux.browser.supports3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
	
	// Chrome has a 3D matrix but doesn't support 3d transforms
	if(flux.browser.supports3d && 'webkitPerspective' in div.style)
	{
		// Double check with a media query (similar to how Modernizr does this)
		var div3D = $('<div id="csstransform3d"></div>');
		var mq = $('<style media="(transform-3d), (-webkit-transform-3d)">div#csstransform3d { position: absolute; left: 9px }</style>');
		
		$('body').append(div3D);
		$('head').append(mq);
		
		flux.browser.supports3d = div3D.get(0).offsetLeft == 9;
		
		div3D.remove();
		mq.remove();
	}
});