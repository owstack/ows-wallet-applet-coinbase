'use strict';

angular.module('owsWalletPlugin.controllers').controller('SignInCtrl', function($scope, $log, $timeout, $state, $ionicModal, $ionicHistory, gettextCatalog, popupService, externalLinkService, coinbaseService) {

  var isNodeWebKit = owswallet.Plugin.isNodeWebKit();
  var coinbase;

  $scope.formData = {
    oauthCode: ''
  };

  $scope.$on("$ionicView.enter", function(event, data) {
    coinbase = coinbaseService.coinbase;
    openModal();
    openAuthenticateWindow();
  });

  function openAuthenticateWindow() {
    if (!isNodeWebKit) {
      // Open Coinbase authenticate URL. When user accepts Coinbase will call back with a custom URL
      // handled by the host app and then processed by the Coinbase servlet.
      externalLinkService.open(coinbase.urls.oauthCodeUrl);

    } else {
      // NodeWebKit doesn't receive the deep link callback URL from Coinbase.
      // Open the Coinbase authenticate window and monitor it to retrieve the oauth code.
      // Listen for window loads on the authenticate window.
      var gui = require('nw.gui');
      gui.Window.open(coinbase.urls.oauthCodeUrl, {
        focus: true,
        position: 'center'
      }, function(authenticateWindow) {
        authenticateWindow.on('loaded', function() {
          // Get the oauth code from the window location. If we get the code then close the window and connect.
          var oauthCode = code(authenticateWindow.window.location.search);
          if (oauthCode) {
            authenticateWindow.window.close();

            // Connect to Coinbase using the oauth code.
            coinbase.connect(oauthCode, function(err) {
              if (err) {
                coinbaseService.showError(err);
              }

              closeModal();
              $timeout(function() {
                $state.go('home');
              }, 200);
            });
          }
        });
      });
    }

    // Read the 'code' URL param from the specified URL search string.
    function code(str) {
      var code = null;
      var idxCode = str.indexOf('code=');

      if (idxCode >= 0) {
        code = str.substring(idxCode + 5);
        if (code.indexOf('&') >= 0) {
          code = code.substring(0, code.indexOf('&'));
        }
      }
      return code;
    };
  };

  function openModal() {
    $ionicModal.fromTemplateUrl('views/sign-in/form/form.html', {
      scope: $scope,
    }).then(function(modal) {
      $scope.signInModal = modal;
      $scope.signInModal.show();
    });

    $scope.cancel = function() {
      $scope.signInModal.remove();
      $timeout(function() {
        $ionicHistory.goBack();
      }, 200);
    };

    $scope.submit = function() {
      coinbase.connect($scope.formData.oauthCode, function(err) {
        if (err) {
          $log.error('Could not connect to Coinbase: ' + err.message + ', ' + err.detail);
          return showError();
        }

        $scope.signInModal.remove();
        $timeout(function() {
          $state.go('home');
        }, 200);
      });
    };    
  };

  function closeModal() {
    $scope.signInModal.remove();
  };

  function showError() {
    var title = gettextCatalog.getString('Could not connect to Coinbase');
    var message = gettextCatalog.getString('Please try again.');
    popupService.showAlert(title, message, function() {
      $timeout(function() {
        $ionicHistory.goBack();
      }, 200);
    });
  };

});
