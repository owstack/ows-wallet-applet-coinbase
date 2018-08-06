'use strict';

angular.module('owsWalletPlugin.controllers').controller('BuySellConfirmCtrl', function($scope,  coinbaseService, gettextCatalog, stringUtils) {

  var coinbase = coinbaseService.coinbase;

  var actionMap = {
    buy: {
      title: gettextCatalog.getString('Your buy was successful!'),
      button: gettextCatalog.getString('Go to accounts')
    },
    sell: {
      title: gettextCatalog.getString('Your sell was successful!'),
      button: gettextCatalog.getString('Go to accounts')
    }
  };

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    var accountId = data.stateParams.accountId; // crypto account
    var orderId = data.stateParams.orderId;

    var account = coinbase.getAccountById(accountId);
    $scope.order = account.getOrderById(orderId);

    $scope.title = actionMap[$scope.order.kind].title;
    $scope.button = actionMap[$scope.order.kind].button;
  });

  $scope.format = stringUtils.format;

});
