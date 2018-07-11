'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountsCtrl', function($scope, $timeout, coinbaseService, settingsService, stringUtils,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  $scope.$on("$ionicView.beforeEnter", function(event) {
    $scope.accounts = coinbase.accounts;
    $scope.currency = 'USD';

    coinbase.updateAccountBalances($scope.currency).then(function() {
      $timeout(function() {
        $scope.$apply();
      });
    });
  });

  $scope.format = stringUtils.format;

});
