'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountCtrl', function($scope, $state, $timeout, $ionicPopup, lodash, coinbaseService, gettextCatalog, popupService, stringUtils) {

  var coinbase = coinbaseService.coinbase;

  $scope.isCordova = owswallet.Plugin.isCordova();

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.account = coinbase.getAccountById(data.stateParams.accountId);

    getTransactions();
  });

  $scope.format = stringUtils.format;
  $scope.trim = stringUtils.trim;

  $scope.openReceive = function() {
    $scope.account.createAddress().then(function(address) {
      $scope.address = address;
      $scope.popupState = 'warning';

      $scope.receivePopup = $ionicPopup.show({
        cssClass: 'popup-account-receive',
        scope: $scope,
        templateUrl: 'views/account/receive/receive.html'
      });
    });
  };

  $scope.openSend = function() {
    $state.go('tabs.account-send', {
      accountId: $scope.account.id
    });
  };

  function getTransactions() {
    $scope.account.getTransactions().then(function(transactions) {
      $scope.transactions = transactions;
      $scope.$apply();
    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Uh oh!'),
        gettextCatalog.getString('Could not get account transactions. Please try again.')
      );
    });
  };

});
