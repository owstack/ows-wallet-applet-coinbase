'use strict';

angular.module('owsWalletPlugin.controllers').controller('LoginCtrl', function($scope, $log, $timeout, $state, $ionicModal, $ionicHistory, gettextCatalog, popupService, externalLinkService, coinbaseService) {
  
  var isNodeWebKit = owswallet.Plugin.isNodeWebKit();
  var coinbase = coinbaseService.coinbase;

  $scope.formData = {
    oauthCode: ''
  };

  $scope.$on("$ionicView.enter", function(event, data) {
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
          // Get the oauth code from the window location. If we get the code then close the window and authenticate.
          var oauthCode = code(authenticateWindow.window.location.search);
          if (oauthCode) {
            authenticateWindow.window.close();

            // Authenticate with Coinbase using the oauth code.
            coinbase.login(oauthCode, function(err) {
              if (err) {
                return showError(err);
              }

              closeModal();
              $timeout(function() {
                $state.go('tabs.prices');
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
    $ionicModal.fromTemplateUrl('views/login/form/form.html', {
      scope: $scope,
    }).then(function(modal) {
      // Initialize with no code.
      $scope.formData.oauthCode = '';

      $scope.loginModal = modal;
      $scope.loginModal.show();
    });

    $scope.cancel = function() {
      $scope.loginModal.remove();
      $timeout(function() {
        $state.go('onboarding.start');
      }, 200);
    };

    $scope.submit = function() {
      coinbase.login($scope.formData.oauthCode, function(err) {
        if (err) {
          return showError(err);
        }

        $scope.loginModal.remove();
        $timeout(function() {
          $state.go('tabs.prices');
        }, 200);
      });
    };    
  };

  function closeModal() {
    $scope.loginModal.remove();
  };

  function showError(err) {
    $log.error('Could not authenticate with Coinbase: ' + err.message);
    return popupService.showAlert(
      gettextCatalog.getString('Could not login to Coinbase'),
      gettextCatalog.getString('An error occurred while trying to authenticate with Coinbase. Please try again.'),
      function() {
        $scope.formData.oauthCode = '';
      }
    );
  };

});
