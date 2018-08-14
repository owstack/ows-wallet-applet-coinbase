'use strict';

angular.module('owsWalletPlugin.controllers').controller('WalletCtrl', function($scope, coinbaseService, popupService,
  /* @namespace owsWalletPluginClient.api */ Session) {

  var coinbase = coinbaseService.coinbase;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    var wallet = Session.getInstance().getWalletById(data.stateParams.walletId).then(function(wallet) {
	    $scope.wallet = wallet;

	    return coinbase.getPendingTransactions(wallet.id);

    }).then(function(pendingTxs) {

    	// All pending transactions are formatted as Coinbase transactions.
    	$scope.pendingTxs = pendingTxs;

    }).catch(function(error) {
      popupService.showAlert(
        gettextCatalog.getString('Uh oh!'),
        gettextCatalog.getString('Could not get wallet information. Please try again.')
      );
    });
  });

});
