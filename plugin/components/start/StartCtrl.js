'use strict';

angular.module('owsWalletPlugin.controllers').controller('StartCtrl', function($scope, $ionicHistory, $log, $state, $timeout, lodash, gettextCatalog, popupService, externalLinkService, stringUtils, coinbaseService, settingsService,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var coinbase = coinbaseService.coinbase;
  var language = settingsService.language;

  var DATA_UPDATE_FREQUENCY = 30000; // ms
  var dataUpdater;
  var periodPrice;

  $scope.timeFrames = [{
    button: '1H',
    label: gettextCatalog.getString('this hour'),
    period: 'hour'
  }, {
    button: '1D',
    label: gettextCatalog.getString('today'),
    period: 'day'
  }, {
    button: '1W',
    label: gettextCatalog.getString('this week'),
    period: 'week'
  }, {
    button: '1M',
    label: gettextCatalog.getString('this month'),
    period: 'month'
  }, {
    button: '1Y',
    label: gettextCatalog.getString('this year'),
    period: 'year'
  }, {
    button: 'ALL',
    period: 'all',
    label: gettextCatalog.getString('all time')
  }];

  // If we're here then we don't have a Coinbase account yet.
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    // We may have tried to connect and failed; show the failure.
    if (data.stateParams && data.stateParams.error) {
      var title;
      var message;

      if (data.stateParams.error.includes('UNAUTHORIZED')) {
        title = gettextCatalog.getString('Logged Out');
        message = gettextCatalog.getString('Your account was logged out. Please login again.');
      } else {
        title = gettextCatalog.getString('Uh oh!');
        message = gettextCatalog.getString('Could not login to Coinbase. Please try again.');
      }

      popupService.showAlert(title, message);
    }

    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();

    $scope.selectedCurrency = 0;  // Default to first entry.
    $scope.selectedTimeFrame = lodash.findIndex($scope.timeFrames, ['period', 'year']);

    updateFeatureCurrency().then(function() {
      owswallet.Plugin.hideSplash();
    });
  });

  $scope.$on("$ionicView.beforeLeave", function(event) {
    // Stop retreiving Coinbase data.
    $timeout.cancel(dataUpdater);
  });

  $scope.login = function() {
    $state.go('onboarding.login');
  };

  $scope.openSignupWindow = function() {
    var url = coinbase.urls.signupUrl;
    var optIn = true;
    var title = 'Sign Up for Coinbase';
    var message = 'This will open Coinbase.com, where you can create an account.';
    var okText = 'Go to Coinbase';
    var cancelText = 'Back';
    externalLinkService.open(url, optIn, title, message, okText, cancelText);
  };

  $scope.selectCurrency = function(index) {
    $scope.selectedCurrency = index;
    updateFeatureCurrency();
  };

  $scope.selectTimeFrame = function(index) {
    $scope.selectedTimeFrame = index;
    updateFeatureCurrency();
  };

  function updateFeatureCurrency() {
    return getData().then(function(data) {
      if (!data.currencies) {
        return;
      }

      $scope.currencies = data.currencies;
      var currency = $scope.currencies[$scope.selectedCurrency];

      $scope.featureLeft = {
        value: stringUtils.format(currency.amount, currency.currency).localized_u,
        label: currency.label + ' price'
      };

      if (data.periodPrice) {
        // For all-time period we use a zero price.
        // The returned period price is Coinbase's first tracked price.
        var periodPrice = data.periodPrice;
        if ($scope.timeFrames[$scope.selectedTimeFrame].period == 'all') {
          periodPrice = 0;
        }

        var amountChange = stringUtils.float(currency.amount) - stringUtils.float(periodPrice);

        $scope.featureRight = {
          up: amountChange >= 0,
          value: stringUtils.format(amountChange, currency.currency).localized_u,
          label: $scope.timeFrames[$scope.selectedTimeFrame].label
        };

        $scope.$apply();

        // Continue updating until canceled.
        dataUpdater = $timeout(function() {
          updateFeatureCurrency();
        }, DATA_UPDATE_FREQUENCY);
      }
    });
  };

  function getData() {
    // Get spot prices for all currency pairs.
    return coinbase.spotPrice().then(function(spotPrice) {

      // Reject any entries that have an error.
      spotPrice = lodash.pickBy(spotPrice, function(value, key) {
        if (value.error != undefined) {
          $log.error('Could not spot price for ' + key + ': ' + value.error);
          return false;
        }
        return true;
      });

      // Convert to an array and map in some derived info.
      var currencies = lodash.map(Object.keys(spotPrice), function(k) {
        spotPrice[k].pair = spotPrice[k].base + '-' + spotPrice[k].currency;
        spotPrice[k].amount = stringUtils.float(spotPrice[k].amount); // Convert to number
        spotPrice[k].symbol = Constants.currencyMap(spotPrice[k].currency, 'symbol');
        spotPrice[k].decimals = Constants.currencyMap(spotPrice[k].currency, 'decimals');

        // Set a sort order.
        spotPrice[k].sort = lodash.find(coinbase.currencies, function(c) {
          return c.code == spotPrice[k].base;
        }).sort;

        return spotPrice[k];
      });

      return lodash.sortBy(currencies, function(c) {
        return c.sort;
      });

    }).then(function(currencies) {

      // Get some history for the selected currency pair.
      var currencyPair = currencies[$scope.selectedCurrency].pair;
      var period = $scope.timeFrames[$scope.selectedTimeFrame].period;

      return coinbase.historicPrice(currencyPair, period).then(function(data) {
        // data: {
        //   base: 'BTC',
        //   currency: 'USD',
        //   prices: [{
        //     price: '6844.29',
        //     time: '2018-06-12T00:00:00Z'
        //   }, {
        //     ...
        //   }]
        // }

        return {
          currencies: currencies,
          periodPrice: data.prices[data.prices.length-1].price
        };
      });

    }).catch(function(error) {
      // Error logged

    });
  };

});
