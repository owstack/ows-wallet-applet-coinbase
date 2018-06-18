'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountsCtrl', function($scope, coinbaseService, settingsService, Constants) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  $scope.$on("$ionicView.beforeEnter", function(event) {
    $scope.accounts = coinbase.accounts;
    $scope.currency = 'USD';

    coinbase.updateAccountBalances($scope.currency);
  });

  $scope.format = function(num, currency, opts) {
    opts = opts || {};
    var decimals = Constants.currencyMap(currency, 'decimals');
    var symbol = (opts.symbol == false ? '' : Constants.currencyMap(currency, 'symbol'));

    return symbol + num.toLocaleString(language, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  };

});
