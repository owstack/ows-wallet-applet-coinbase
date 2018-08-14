'use strict';

angular.module('owsWalletPlugin.controllers').controller('BuySellPreviewCtrl', function($scope, $state, coinbaseService, popupService, gettextCatalog, stringUtils,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var coinbase = coinbaseService.coinbase;
  var account;

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
    $scope.accountId = data.stateParams.accountId; // crypto account
    $scope.orderId = data.stateParams.orderId;

    account = coinbase.getAccountById($scope.accountId);
    $scope.order = account.getOrderById($scope.orderId);

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
    $scope.order.commit().then(function(order) {
      $state.go('tabs.buy-sell-confirm', {
        accountId: order.account.id,
        orderId: order.id,
      });

    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Could not confirm {{action}} order', {action: $scope.action}),
        gettextCatalog.getString(error.detail)
      );

    });
  };

});
