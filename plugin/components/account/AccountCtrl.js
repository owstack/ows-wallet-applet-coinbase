'use strict';

angular.module('owsWalletPlugin.controllers').controller('AccountCtrl', function($scope, coinbaseService, settingsService, Constants) {

  var coinbase = coinbaseService.coinbase;
  var currency;
  var language = settingsService.language;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
  	if (data.stateParams && data.stateParams.id) {
  		$scope.account = coinbase.getAccountById(data.stateParams.id);
  		currency = $scope.account.currency.code;
  	}
  });

  $scope.format = function(num) {
    var decimals = Constants.currencyMap(currency, 'decimals');
    var symbol = Constants.currencyMap(currency, 'symbol');
    return (num < 0 ? '-' : '') + symbol + Math.abs(num).toLocaleString(language, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  };

});
