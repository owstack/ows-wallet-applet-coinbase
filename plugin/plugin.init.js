'use strict';

angular.module('owsWalletPlugin').config(function($stateProvider) {

	$stateProvider
    .state('home', {
      url: '/home/:code',
      controller: 'HomeCtrl',
      controllerAs: 'coinbase',
      templateUrl: 'views/home/home.html'
    })
    .state('settings', {
      url: '/settings',
      controller: 'SettingsCtrl',
      templateUrl: 'views/settings/settings.html'
    })
/*
    .state('coinbase.amount', {
      url: '/amount/:nextStep/:currency',
      controller: 'amountController',
      templateUrl: 'views/amount.html'
    })
*/
    .state('buy', {
      url: '/buy/:amount/:currency',
      controller: 'BuyCtrl',
      templateUrl: 'views/buy/buy.html'
    })
    .state('sell', {
      url: '/sell/:amount/:currency',
      controller: 'SellCtrl',
      templateUrl: 'views/sell/sell.html'
    });

})
.run(function($rootScope, $state, $log, Coinbase) {

  owswallet.Plugin.ready(function() {

    owswallet.Plugin.openForBusiness(Coinbase.pluginId , function() {

      $state.go('home');

    });
  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $log.debug('Applet route change start from:', fromState.name || '-', ' to:', toState.name);
  });

});
