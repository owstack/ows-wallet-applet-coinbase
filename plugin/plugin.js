'use strict';

angular.module('owsWalletPlugin', [
	'angularMoment',
	'gettext',
	'ionic',
	'ngLodash',
	'owsWalletPluginClient',
  'owsWalletPlugin.api',
  'owsWalletPlugin.controllers',
  'owsWalletPlugin.directives',
  'owsWalletPlugin.services'
]);

angular.module('owsWalletPlugin.api', []);
angular.module('owsWalletPlugin.controllers', []);
angular.module('owsWalletPlugin.directives', []);
angular.module('owsWalletPlugin.services', []);
