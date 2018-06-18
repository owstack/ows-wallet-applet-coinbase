'use strict';

angular.module('owsWalletPlugin').config(function($stateProvider) {

  // Routing.
	$stateProvider

    /**
     * Onboarding navigation (logged out)
     */

    .state('onboarding', {
      url: '/onboarding',
      abstract: true,
      template: '<ion-nav-view name="onboarding"></ion-nav-view>'
    })
    .state('onboarding.start', {
      url: '/start',
      views: {
        'onboarding': {
          controller: 'StartCtrl',
          templateUrl: 'views/start/start.html'
        }
      }
    })
    .state('onboarding.sign-in', {
      url: '/sign-in',
      views: {
        'onboarding': {
          controller: 'SignInCtrl',
          templateUrl: 'views/sign-in/sign-in.html'
        }
      }
    })

    /**
     * Tabs navigation (logged in)
     */

    .state('tabs', {
      url: '/tabs',
      abstract: true,
      controller: 'TabsCtrl',
      templateUrl: 'views/navigation/tabs/tabs.html'
    })
    .state('tabs.prices', {
      url: '/prices',
      views: {
        'tab-prices': {
          controller: 'PricesCtrl',
          templateUrl: 'views/prices/prices.html'
        }
      }
    })
    .state('tabs.accounts', {
      url: '/accounts',
      views: {
        'tab-accounts': {
          controller: 'AccountsCtrl',
          templateUrl: 'views/accounts/accounts.html'
        }
      }
    })
    .state('tabs.alerts', {
      url: '/alerts',
      views: {
        'tab-alerts': {
          controller: 'AlertsCtrl',
          templateUrl: 'views/alerts/alerts.html'
        }
      }
    })
    .state('tabs.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          controller: 'SettingsCtrl',
          templateUrl: 'views/settings/settings.html',
        }
      }
    })

    /**
     * Accounts tab
     */

    .state('tabs.account', {
      url: '/account/:id',
      views: {
        'tab-accounts@tabs': {
          controller: 'AccountCtrl',
          templateUrl: 'views/account/account.html'
        }
      }
    });


/*
    .state('coinbase.amount', {
      url: '/amount/:nextStep/:currency',
      controller: 'amountController',
      templateUrl: 'views/amount.html'
    })

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
*/
}).run(function($rootScope, $state, $log, CoinbaseServlet, coinbaseService, $ionicConfig) {

  // Ionic platform defaults.
  $ionicConfig.backButton.icon('icon ion-arrow-left-c').text('');

  // Wait for this plugin and its dependents to become ready.
  owswallet.Plugin.openForBusiness(CoinbaseServlet.id, function() {

    // Wait for initial Coinbase service connection.
    coinbaseService.whenAvailable(function(coinbase) {
      if (coinbase.accounts) {
        $state.go('tabs.prices');
      } else {
        $state.go('onboarding.start');
      }
    });

  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $log.debug('Applet route change start from:', fromState.name || '-', ' to:', toState.name);
  });

});
