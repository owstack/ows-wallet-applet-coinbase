'use strict';

angular.module('owsWalletPlugin.controllers').controller('SettingsCtrl', function($scope, $timeout, $state, $ionicHistory, gettextCatalog, popupService, externalLinkService, coinbaseService,
  /* @namespace owsWalletPluginClient.api */ Session) {

  var coinbase = coinbaseService.coinbase;
  var session = Session.getInstance();

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    coinbase.getCurrentUser().then(function(user) {
      $scope.user = user;
      $scope.$apply();
    });
  });

  $scope.externalLinks = {
    support: {
      itemName: gettextCatalog.getString('Support'),
      title: gettextCatalog.getString('Get Support'),
      message: gettextCatalog.getString('Get support from Coinbase.'),
      okText: gettextCatalog.getString('Visit Website'),
      cancelText: gettextCatalog.getString('Go Back'),
      url: coinbase.urls.supportUrl
    },
    privacy: {
      itemName: gettextCatalog.getString('Privacy'),
      title: gettextCatalog.getString('View Privacy Policy'),
      message: gettextCatalog.getString('Read the Coinbase privacy policy.'),
      okText: gettextCatalog.getString('Visit Website'),
      cancelText: gettextCatalog.getString('Go Back'),
      url: coinbase.urls.privacyUrl
    }
  };

  $scope.openExternalLink = function(link) {
    var optIn = true;
    externalLinkService.open(link.url, optIn, link.title, link.message, link.okText, link.cancelText);
  };

  $scope.logout = function() {
    var message = gettextCatalog.getString('Are you sure you would like to log out of your Coinbase account?');
    popupService.showConfirm('Coinbase', message, null, null, function(ok) {
      if (ok) {
        coinbase.logout(function() {
          $ionicHistory.clearHistory();
          $timeout(function() {
            $state.go('onboarding.start');
          }, 100);
        });
      }
    });
  };

});
