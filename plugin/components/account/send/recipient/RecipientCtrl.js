'use strict';

angular.module('owsWalletPlugin.controllers').controller('RecipientCtrl', function($scope, $log, $state, lodash, coinbaseService, popupService, stringUtils, gettextCatalog,
  /* @namespace owsWalletPluginClient.api */ Session) {

  var coinbase = coinbaseService.coinbase;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.formData = {};
    $scope.account = coinbase.getAccountById(data.stateParams.accountId);
    $scope.amount = parseFloat($scope.format(data.stateParams.amount, data.stateParams.currency).entered);
    $scope.currency = data.stateParams.currency;
  });

  $scope.format = stringUtils.format;

  $scope.scan = function() {
    Session.getInstance().scanQrCode().then(function(result) {
      var address = lodash.get(result, 'parsed.address');
      var currency = lodash.get(result, 'parsed.currency');

      if ((result.type == 'payment-data' && address && currency == $scope.currency) || (result.type == 'email')) {
        $scope.formData.address = address || result.rawData;
        $scope.$apply();

      } else {
        popupService.showAlert(
          gettextCatalog.getString('Invalid Address'),
          gettextCatalog.getString('The scanned data does not resolve to an email or {{currency}} address.', {
            currency: $scope.currency
          })
        );
      }
    });
  };

  $scope.send = function() {
    var data = {
      to: $scope.formData.address,
      amount: $scope.amount,
      currency: $scope.currency,
      description: $scope.formData.notes
    };

    $scope.account.send(data).then(function() {
      popupService.showAlert(
        gettextCatalog.getString('Funds Sent'),
        gettextCatalog.getString('You sent {{amount}}{{currency}} to {{address}}.', {
          amount: $scope.amount,
          currency: $scope.currency,
          address: $scope.formData.address
        })
      );

    }).catch(function(error) {
      popupService.showAlert(gettextCatalog.getString('Send Failed'), error.detail);
    });
  };

});
