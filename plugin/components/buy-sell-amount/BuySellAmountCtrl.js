'use strict';

angular.module('owsWalletPlugin.controllers').controller('BuySellAmountCtrl', function($rootScope, $scope, $ionicHistory, $state, lodash, coinbaseService, gettextCatalog, popupService, settingsService, stringUtils,
  /* @namespace owsWalletPluginClient.api */ BN,
  /* @namespace owsWalletPluginClient.api */ Session,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  var keypadCurrencies = ['USD'];
  var actionMap = {
    buy: {
      title: gettextCatalog.getString('Buy'),
      button: gettextCatalog.getString('Preview Buy'),
      defaultPayMethodType: 'bank'
    },
    sell: {
      title: gettextCatalog.getString('Sell'),
      button: gettextCatalog.getString('Preview Sell'),
      defaultPayMethodType: 'account'
    }
  };

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    // Read state params from the currentView object instead of data param.
    // Allows us to get the selected id on goBack() from the linked-accounts view.

    $scope.action = $ionicHistory.currentView().stateParams.action; //buy|sell

    // If a wallet is specfied then it is the destination or source for buy/sell.
    // The coinbase account is selected using the wallet currency type.
    var walletId = $ionicHistory.currentView().stateParams.walletId;

    if (walletId) {
      var wallet = Session.getInstance().getWalletById(walletId);
      $scope.account = coinbase.getAccountByCurrencyCode(wallet.currency);
      $scope.accountId = $scope.account.id;
    } else {
      $scope.accountId = $ionicHistory.currentView().stateParams.accountId; // crypto account
      $scope.account = coinbase.getAccountById($scope.accountId);
    }

    var selectedPaymentMethodId = $ionicHistory.currentView().stateParams.paymentMethodId; // User selected, if undefined choose default
    var currency = $scope.account.currency.code;
    $scope.title = actionMap[$scope.action].title + ' ' + coinbase.getCurrencyByCode(currency).name;
    $scope.button = actionMap[$scope.action].button;

    // Set default payment method.
    coinbase.getPaymentMethods().then(function(paymentMethods) {

      var paymentMethod;
      if (!selectedPaymentMethodId) {
        // Choose first payment method that matches the default type, or index 0.
        paymentMethod = lodash.find(paymentMethods, function(m) {
          return m.type == actionMap[$scope.action].defaultPayMethodType;
        });

      } else {
        // Choose the user selected payment method.
        paymentMethod = lodash.find(paymentMethods, function(m) {
          return m.id == selectedPaymentMethodId;
        });
      }

      if (!paymentMethod) {
        paymentMethod = paymentMethods[0];
      }

      var limit;
      if ($scope.action == 'buy') {
        var amount = stringUtils.format(paymentMethod.limits.buy.amount, paymentMethod.limits.buy.currency, {language: language});
        limit = 'Max: ' + amount.localized_u;
      }

      $scope.paymentMethod = {
        id: paymentMethod.id,
        name: paymentMethod.name,
        limit: limit,
        type: paymentMethod.type + '-' + paymentMethod.currency
      };
      $scope.$apply();

    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Uh oh!'),
        gettextCatalog.getString('Could not get payment methods. Please try again.')
      );
    });

    // Initialize the keypad.
    keypadCurrencies.push(currency);

    coinbase.exchangeRates('USD').then(function(rates) {
      $scope.keypadConfig = {
        language: language,
        lengthExpressionLimit: 9,
        currencies: keypadCurrencies,
        usdRates: rates,
        value: {
          amount: 0,
          currency: $scope.account.balance.currency
        }
      };
      $scope.$apply();

    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Uh oh!'),
        gettextCatalog.getString('Could not get exchange rates. Please try again.')
      );
    });
  });

  $rootScope.$on('Local/KeypadState', function(e, keypadState) {
    $scope.keypad = keypadState;
  });

  $scope.format = stringUtils.format;

  $scope.isCryptoCurrency = function(currency) {
    return Constants.isCryptoCurrency(currency);
  };

  $scope.close = function() {
    $ionicHistory.goBack();
  };

  $scope.toggleCurrency = function() {
    $scope.keypadConfig = {
      currencyIndex: $scope.keypad.nextCurrencyIndex
    };
  };

  $scope.setAmountOfAvailable = function(percentage) {
    $scope.keypadConfig = {
      value: {
        amount: BN.multiply($scope.account.balance.amount, percentage),
        currency: $scope.account.balance.currency
      }
    };
  };

  $scope.goPreview = function() {
    var createOrder;
    switch ($scope.action) {
      case 'buy':
        createOrder = $scope.account.createBuyOrder;
        break;

      case 'sell':
        createOrder = $scope.account.createSellOrder;
        break;
    };

    createOrder({
      amount: $scope.keypad.amount,
      currency: $scope.keypad.currency,
      paymentMethodId: $scope.paymentMethod.id
    }).then(function(order) {
      $state.go('tabs.buy-sell-preview', {
        accountId: $scope.accountId,
        orderId: order.id,
      });

    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Could not create ' + $scope.action + ' order'),
        gettextCatalog.getString(error.detail)
      );

    });
  };

});
