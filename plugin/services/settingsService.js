'use strict';

angular.module('owsWalletPlugin.services').factory('settingsService', function($log, lodash,
  /* @namespace owsWalletPluginClient.api */ Settings) {

  var root = {};

  owswallet.Plugin.ready(function() {
    // Get host app settings.
    Settings.get().then(function(settingsObj) {
    	lodash.assign(root, settingsObj);

    }).catch(function(error) {
      $log.error('Could not get host app information: ' + error);
    });

  });

  return root;
});
