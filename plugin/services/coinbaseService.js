'use strict';

angular.module('owsWalletPlugin.services').factory('coinbaseService', function($log, $timeout, lodash, gettextCatalog, popupService,
  /* @namespace owsWalletPlugin.api.coinbase */ Coinbase) {

  var root = {};
  var isAvailable = false;
  var availableCallbacks = [];

  root.coinbase;

  root.whenAvailable = function(cb) {
    // Can't do this when service loads since Coinbase servlet may not yet be ready.
    // Coinbase object is created only once.
    if (!root.coinbase) {
      // Create our connection to the Coinbase service (via the Coinbase servlet).
      // Use the 'default' plugin configuration for setup.
      root.coinbase = new Coinbase('default', onCoinbaseConnect);
    }

    if (!isAvailable) {
      availableCallbacks.push(cb);
      return;
    }
    return cb(root.coinbase);
  };

  root.showError =function(err) {
    $log.error('Could not connect to Coinbase: ' + err.message + ', ' + err.detail);

    var title = gettextCatalog.getString('Could not connect to Coinbase');
    var message = gettextCatalog.getString('An error occurred while trying to connect to Coinbase. Please try again.');
    return popupService.showAlert(title, message);
  };

  // Called when we have at least and initial connection to Coinbase (may not have been paired or have access to an account).
  function onCoinbaseConnect(err) {
    if (err) {
      return root.showError(err);
    }
    available();
  };

  function available() {
    isAvailable = true;
    lodash.each(availableCallbacks, function(x) {
      $timeout(function() {
        return x(root.coinbase);
      }, 1);
    });
    availableCallbacks = [];
  };

  return root;
});
