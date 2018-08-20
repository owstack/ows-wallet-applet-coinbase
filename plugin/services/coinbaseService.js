'use strict';

angular.module('owsWalletPlugin.services').factory('coinbaseService', function($log, $state, $timeout, lodash, gettextCatalog, popupService,
  /* @namespace owsWalletPlugin.api.coinbase */ Coinbase) {

  var root = {};
  var isAvailable = false;
  var availableCallbacks = [];

  root.coinbase;

  // The Coinbase servlet may notify us that it has logged out (e.g., when token is not useful).
  owswallet.Plugin.onEvent('coinbase.logout', function(event) {
    $log.info('Logged out by Coinbase servlet');
    $state.go('onboarding.start');
  });

  root.whenAvailable = function(cb) {
    // Can't do this when service loads since Coinbase servlet may not yet be ready.
    // Coinbase object is created only once.
    if (!root.coinbase) {
      // Create our connection to the Coinbase service (via the Coinbase servlet).
      root.coinbase = new Coinbase(onCoinbaseLogin);
    }

    if (cb) {
      if (!isAvailable) {
        availableCallbacks.push(cb);
        return;
      }
      return cb(root.coinbase);
    }
  };

  root.retry = function() {
    root.coinbase = undefined;
    root.whenAvailable();
  };

  // Called when we have completed attempts to connect to Coinbase.
  // If an error occurred then the user should re-initiate a connection (errors here are fatal).
  function onCoinbaseLogin(error) {
    available(error);
  };

  function available(error) {
    isAvailable = true;
    lodash.each(availableCallbacks, function(x) {
      $timeout(function() {
        return x(error, root.coinbase);
      }, 1);
    });
    availableCallbacks = [];
  };

  return root;
});
