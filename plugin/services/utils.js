'use strict';

angular.module('owsWalletPlugin.services').factory('utils', function() {
	var root = {};

	root.float = function(val) {
		val = val + '';
	  return parseFloat(val.replace(/,/g,''));
	};

	return root;
});
