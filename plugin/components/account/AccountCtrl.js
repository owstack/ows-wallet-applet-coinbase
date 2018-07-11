'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountCtrl', function($scope, $timeout, $ionicPopup, $ionicModal, lodash, coinbaseService, gettextCatalog, popupService, stringUtils,
  /* @namespace owsWalletPluginClient.api */ Constants,
  /* @namespace owsWalletPluginClient.api */ Device) {

  var account;
  var coinbase = coinbaseService.coinbase;

  $scope.isCordova = owswallet.Plugin.isCordova();
  var addressPopup;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
  	if (data.stateParams && data.stateParams.id) {
      account = coinbase.getAccountById(data.stateParams.id);
      $scope.account = account;

      getTransactions();
  	}
  });

  $scope.format = stringUtils.format;
  $scope.trim = stringUtils.trim;

  $scope.openAddress = function() {
    account.createAddress().then(function(address) {
      $scope.address = address;
      $scope.popupState = 'warning';

      addressPopup = $ionicPopup.show({
        cssClass: 'popup-account-address',
        scope: $scope,
        templateUrl: 'views/account/address/address.html'
      });
    });
  };

  $scope.closeAddress = function() {
    addressPopup.close();
  };

  $scope.showAddress = function() {
    $scope.popupState = 'qrcode';
  };

  $scope.shareAddress = function() {
    Device.socialShare($scope.address.address);
  };

  $scope.copyAddress = function() {
    $scope.popupState = 'copied';
    Device.copyToClipboard($scope.address.address);

    $timeout(function() {
      addressPopup.close();
    }, 1500);
  };

  $scope.openSend = function() {
  };

  function getTransactions() {
    account.getTransactions().then(function(transactions) {
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
