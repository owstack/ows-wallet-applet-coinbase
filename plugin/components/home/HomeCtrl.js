'use strict';

angular.module('owsWalletPlugin.controllers').controller('HomeCtrl', function($scope, $timeout, $ionicModal, $ionicHistory, $log, coinbaseService, lodash, popupService, externalLinkService) {

  var isNodeWebKit = owswallet.Plugin.isNodeWebKit();
  var isCordova = owswallet.Plugin.isCordova();

  var self = this;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.showOauthForm = false;

    init();

  });

  function init() {
/*
    coinbaseService.getAvailableCurrencies().then(function(currencies) {

      // Currently only one currency.
      $scope.currency = currencies[0];

      // Get buy and sell prices.
      return coinbaseService.buyPrice($scope.currency);

    }).then(function(buyPrice) {

      $scope.buyPrice = buyPrice;
      return coinbaseService.sellPrice($scope.currency);

    }).then(function(sellPrice) {

      $scope.sellPrice = buyPrice;

    }).catch(function(error) {
      $log.error('Initialization failed: ' + error);

    });
*/
/*

    // Updating accessToken and accountId
    $timeout(function() {
      $scope.accessToken = data.accessToken;
      $scope.accountId = data.accountId;
      $scope.updateTransactions();
      $scope.$apply();
    }, 100);
*/
  };

  $scope.updateTransactions = function() {
    $log.debug('Getting transactions...');
    $scope.pendingTransactions = { data: {} };
    coinbaseService.getPendingTransactions($scope.pendingTransactions);
  };

  this.openAuthenticateWindow = function() {
    var oauthUrl = this.getAuthenticateUrl();
    if (!isNodeWebKit) {
      externalLinkService.open(oauthUrl);
    } else {
      var self = this;
      var gui = require('nw.gui');
      gui.Window.open(oauthUrl, {
        focus: true,
        position: 'center'
      }, function(new_win) {
        new_win.on('loaded', function() {
          var title = new_win.window.document.title;
          $timeout(function() {
            if (title.indexOf('Coinbase') == -1) {
              $scope.code = title;
              self.submitOauthCode($scope.code);
              new_win.close();
            }
          }, 100);
        });
      });
    }
  }

  this.openSignupWindow = function() {
    var url = coinbaseService.getSignupUrl();
    var optIn = true;
    var title = 'Sign Up for Coinbase';
    var message = 'This will open Coinbase.com, where you can create an account.';
    var okText = 'Go to Coinbase';
    var cancelText = 'Back';
    externalLinkService.open(url, optIn, title, message, okText, cancelText);
  }

  this.openSupportWindow = function() {
    var url = coinbaseService.getSupportUrl();
    var optIn = true;
    var title = 'Coinbase Support';
    var message = 'You can email support@coinbase.com for direct support, or you can view their help center.';
    var okText = 'Open Help Center';
    var cancelText = 'Go Back';
    externalLinkService.open(url, optIn, title, message, okText, cancelText);
  }

  this.getAuthenticateUrl = function() {
    $scope.showOauthForm = isCordova || isNodeWebKit ? false : true;
    return coinbaseService.getOauthCodeUrl();
  };

  this.toggleOauthForm = function() {
    $scope.showOauthForm = !$scope.showOauthForm;
  }

  this.openTxModal = function(tx) {
    $scope.tx = tx;

    $ionicModal.fromTemplateUrl('views/modals/coinbase-tx-details.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

});
