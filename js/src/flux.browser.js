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
})();