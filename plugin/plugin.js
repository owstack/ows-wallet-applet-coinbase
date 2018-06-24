'use strict';

angular.module('owsWalletPlugin', [
	'angularMoment',
	'gettext',
	'ionic',
  'monospaced.qrcode',
	'ngLodash',
	'owsWalletPluginClient',
  'owsWalletPlugin.api.coinbase',
  'owsWalletPlugin.controllers',
  'owsWalletPlugin.directives',
  'owsWalletPlugin.services'
]);

angular.module('owsWalletPlugin.controllers', []);
angular.module('owsWalletPlugin.directives', []);
angular.module('owsWalletPlugin.services', []);
