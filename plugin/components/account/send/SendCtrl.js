'use strict';

angular.module('owsWalletPlugin.controllers').controller('SendCtrl', function($rootScope, $scope, $state, $ionicHistory, coinbaseService, gettextCatalog, popupService, settingsService, stringUtils,
  /* @namespace owsWalletPluginClient.api */ BN,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  var keypadCurrencies = ['USD'];
  var usdRates;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.account = coinbase.getAccountById(data.stateParams.accountId);

    // $scope inherited from AccountCtrl
    var currency = $scope.account.currency.code;

    // Initialize the keypad.
    keypadCurrencies.push(currency);

    coinbase.exchangeRates('USD').then(function(rates) {
      usdRates = rates;

      $scope.keypadConfig = {
        language: language,
        lengthExpressionLimit: 9,
        currencies: keypadCurrencies,
        usdRates: usdRates,
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

  $scope.goRecipient = function() {
    // Ensure amount is expressed in crypto.
    var amount = $scope.keypad.amount;
    if (!Constants.isCryptoCurrency($scope.keypad.currency)) {
      amount = amount * usdRates[$scope.account.currency.code];
    }

    if (amount > $scope.account.balance.amount) {
      return popupService.showAlert(
        gettextCatalog.getString('Uh oh!'),
        gettextCatalog.getString('You do not have enough to send this amount.')
      );
    }

    $state.go('tabs.account-send-recipient', {
      accountId: $scope.account.id,
      amount: amount,
      currency: $scope.account.currency.code
    });
  };

});
