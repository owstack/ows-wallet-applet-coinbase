'use strict';

angular.module('owsWalletPlugin.controllers').controller('BuySellPreviewCtrl', function($rootScope, $scope, $state, coinbaseService, gettextCatalog, popupService, settingsService, stringUtils) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  var actionMap = {
    buy: {
      title: gettextCatalog.getString('Confirm Buy'),
      button: gettextCatalog.getString('Confirm Buy')
    },
    sell: {
      title: gettextCatalog.getString('Confirm Sell'),
      button: gettextCatalog.getString('Confirm Sell')
    }
  };

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    var accountId = data.stateParams.accountId; // crypto account
    var orderId = data.stateParams.orderId;

    var account = coinbase.getAccountById(accountId);
    $scope.order = account.getOrderById(orderId);

    $scope.order.getPaymentMethod().then(function(paymentMethod) {
      $scope.paymentMethod = paymentMethod;
      $scope.$apply();
    });

    $scope.title = actionMap[$scope.order.kind].title;
    $scope.button = actionMap[$scope.order.kind].button;
  });

  $scope.format = stringUtils.format;

  $scope.trim = stringUtils.trim;

  $scope.confirm = function() {
    $state.go('tabs.buy-sell-confirm', $scope.order);
  };

});
