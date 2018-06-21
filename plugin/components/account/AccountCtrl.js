'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountCtrl', function($scope, $timeout, $ionicPopup, lodash, coinbaseService, settingsService, Constants, Device) {

  var account;
  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  $scope.isCordova = owswallet.Plugin.isCordova();
  var receivePopup;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
  	if (data.stateParams && data.stateParams.id) {
      account = coinbase.getAccountById(data.stateParams.id);
      $scope.account = account;

      getTransactions();
  	}
  });

  $scope.trim = function(str) {
    if (str.length > 25) {
      str = str.slice(0, 10) + '...' + str.slice(-11);
    }
    return str;
  };

  $scope.format = function(num, currency, opts) {
    var decimals = Constants.currencyMap(currency, 'decimals');
    var symbol = Constants.currencyMap(currency, 'symbol');
    var isCrypto = coinbase.isCryptoCurrency(currency);

    opts = opts || {};
    opts.symbol = opts.symbol || !isCrypto;

    var value;
    if (isCrypto) {
      value = Math.abs(num).toString();
    } else {
      value = Math.abs(num).toLocaleString(language, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
    }

    return (num < 0 ? '-' : '') + (opts.symbol ? symbol : '') + value + (isCrypto && !opts.symbol ? ' ' + currency : '');
  };

  $scope.openReceive = function() {
    account.createAddress().then(function(address) {
      $scope.address = address;
      $scope.addressVisible = false;

      receivePopup = $ionicPopup.show({
        cssClass: 'popup-account-receive',
        scope: $scope,
        templateUrl: 'views/account/receive/receive.html'
      });
    });
  };

  $scope.closeReceive = function() {
    receivePopup.close();
  };

  $scope.showAddress = function() {
    $scope.addressVisible = true;
  };

  $scope.shareAddress = function() {
    Device.socialShare($scope.address.address);
  };

  $scope.copyAddress = function() {
    Device.copyToClipboard($scope.address.address);
  };

  $scope.openSend = function() {
  };

  function getTransactions() {
    account.getTransactions().then(function(transactions) {
      $scope.transactions = transactions;

      $scope.$apply();
    });
  };

});
