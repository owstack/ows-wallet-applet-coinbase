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
    .state('onboarding.login', {
      url: '/login',
      views: {
        'onboarding': {
          controller: 'LoginCtrl',
          templateUrl: 'views/login/login.html'
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
    })
    .state('tabs.buy-sell-amount', {
      url: '/buy-sell-amount/:action/:accountId',
      views: {
        'tab-accounts@tabs': {
          controller: 'BuySellAmountCtrl',
          templateUrl: 'views/buy-sell-amount/buy-sell-amount.html'
        }
      }
    })
    .state('tabs.linked-accounts', {
      url: '/linked-accounts/:action/:accountId/:paymentMethodId',
      views: {
        'tab-accounts@tabs': {
          controller: 'LinkedAccountsCtrl',
          templateUrl: 'views/linked-accounts/linked-accounts.html'
        }
      }
    })
    .state('tabs.buy-sell-preview', {
      url: '/buy-sell-preview/:accountId/:orderId',
      views: {
        'tab-accounts@tabs': {
          controller: 'BuySellPreviewCtrl',
          templateUrl: 'views/buy-sell-preview/buy-sell-preview.html'
        }
      }
    })

    /**
     * Settings tab
     */

    .state('tabs.session-log', {
      url: '/session-log',
      views: {
        'tab-settings@tabs': {
          templateUrl: 'views/settings/session-log/session-log.html'
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
}).run(function($rootScope, $state, $log, coinbaseService, $ionicConfig,
  /* @namespace owsWalletPlugin.api.coinbase */ CoinbaseServlet) {

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
