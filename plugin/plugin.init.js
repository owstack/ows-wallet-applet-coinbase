'use strict';

angular.module('owsWalletPlugin').config(function($stateProvider) {

	$stateProvider
    .state('start', {
      url: '/start',
      controller: 'StartCtrl',
      templateUrl: 'views/start/start.html'
    })
    .state('home', {
      url: '/home',
      controller: 'HomeCtrl',
      templateUrl: 'views/home/home.html'
    })
    .state('sign-in', {
      url: '/sign-in',
      controller: 'SignInCtrl',
      templateUrl: 'views/sign-in/sign-in.html'
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

}).run(function($rootScope, $state, $log, CoinbaseServlet, coinbaseService) {

  owswallet.Plugin.openForBusiness(CoinbaseServlet.id, function() {

    // Wait for initial Coinbase service connection.
    coinbaseService.whenAvailable(function(coinbase) {
      if (coinbase.account) {
        $state.go('home');
      } else {
        $state.go('start');
      }
    });

  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $log.debug('Applet route change start from:', fromState.name || '-', ' to:', toState.name);
  });

});
