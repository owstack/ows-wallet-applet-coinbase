'use strict';

angular.module('owsWalletPlugin.controllers').controller('WalletCtrl', function($scope,
  /* @namespace owsWalletPluginClient.api */ Session) {

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    var wallet = Session.getInstance().getWalletById(data.stateParams.walletId);
    $scope.wallet = wallet;
  });

});
