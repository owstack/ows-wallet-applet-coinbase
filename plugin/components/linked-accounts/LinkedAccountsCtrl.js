'use strict';

angular.module('owsWalletPlugin.controllers').controller('LinkedAccountsCtrl', function($scope, $ionicHistory, coinbaseService, gettextCatalog, lodash, popupService, settingsService, stringUtils) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  var accountId;
  var currency;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.action = data.stateParams.action; //buy|sell
    $scope.selectedId = data.stateParams.paymentMethodId;
    accountId = data.stateParams.accountId;
    currency = coinbase.getAccountById(accountId).currency.code; // crypto

    coinbase.getPaymentMethods().then(function(methods) {

      if ($scope.action == 'buy') {
        // Exclude Coinbase accounts and cards for buy action.
        $scope.methods = lodash.filter(methods, function(m) {
          return m.type != 'account' && m.type != 'card';
        });

      } else {
        $scope.methods = methods;
      }

      // Create a limit string to display.
      $scope.methods = lodash.map($scope.methods, function(m) {
        if (m.limits.buy.amount) {
          var amount = stringUtils.format(m.limits.buy.amount, m.limits.buy.currency, {language: language});
          if (m.type != 'account') {
            m.limit = 'Max: ' + amount.localized_u;
          }
        }
        return m;
      });

      $scope.$apply();

    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Uh oh!'),
        gettextCatalog.getString('Could not get payment methods. Please try again.')
      );
    });
  });

  $scope.select = function(method) {
    // Cannot use $state.go() since it will create a circular hiatory reference.
    // Instead, set back view data (overwrite stateParams) and execute a goBack().
    $ionicHistory.backView().stateParams = {
      action: $scope.action,
      accountId: accountId,
      paymentMethodId: method.id
    };

    $ionicHistory.goBack();
  };

});
