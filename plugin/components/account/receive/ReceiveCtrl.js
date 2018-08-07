'use strict';

angular.module('owsWalletPlugin.controllers').controller('ReceiveCtrl', function($scope, $timeout, gettextCatalog,
  /* @namespace owsWalletPluginClient.api */ Device) {

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
  });

  $scope.closeReceive = function() {
    $scope.receivePopup.close();
  };

  $scope.showAddress = function() {
    $scope.popupState = 'qrcode';
  };

  $scope.shareAddress = function() {
    Device.socialShare({
      message: $scope.address.address,
      subject: gettextCatalog.getString('My {{currencyName}} address at Coinbase', {currencyName: account.currency.name})
    });
  };

  $scope.copyAddress = function() {
    $scope.popupState = 'copied';
    Device.copyToClipboard($scope.address.address);

    $timeout(function() {
      $scope.receivePopup.close();
    }, 1500);
  };

});
