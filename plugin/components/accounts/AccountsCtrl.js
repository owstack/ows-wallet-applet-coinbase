'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountsCtrl', function($scope, $state, $timeout, coinbaseService, gettextCatalog, settingsService, stringUtils,
  /* @namespace owsWalletPluginClient.api */ Constants,
  /* @namespace owsWalletPluginClient.api */ Session) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;
  var session = Session.getInstance();

  $scope.$on("$ionicView.beforeEnter", function(event) {
    // Set selected alternate currency (hardcoded at the moment).
    $scope.currency = 'USD';
    $scope.walletSectionTitle = gettextCatalog.getString('Wallets');

    getAccounts();
    getWallets();
  });

  function getAccounts() {
    $scope.accounts = coinbase.accounts;

    coinbase.updateAccountBalances($scope.currency).then(function() {
      $timeout(function() {
        $scope.$apply();
      });
    });
  };

  function getWallets() {
    session.getWallets().then(function(wallets) {
      $scope.wallets = wallets;
    });
  };

  $scope.onWallet = function(wallet) {
    $state.go('tabs.wallet', {
      walletId: wallet.id
    });
  };

  $scope.format = stringUtils.format;

});
