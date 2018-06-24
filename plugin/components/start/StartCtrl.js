'use strict';

angular.module('owsWalletPlugin.controllers').controller('StartCtrl', function($scope, $timeout, $log, $state, lodash, gettextCatalog, popupService, externalLinkService, utils, coinbaseService, settingsService,
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
  $scope.$on("$ionicView.beforeEnter", function(event) {
    $scope.selectedCurrency = 0;  // Default to first entry.
    $scope.selectedTimeFrame = lodash.findIndex($scope.timeFrames, ['period', 'year']);

    updateFeatureCurrency();
  });

  $scope.$on("$ionicView.beforeLeave", function(event) {
    // Stop retreiving Coinbase data.
    $timeout.cancel(dataUpdater);
  });

  $scope.signIn = function() {
    $state.go('onboarding.sign-in');
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

  function format(num, currency) {
    return Math.abs(num).toLocaleString(language, {minimumFractionDigits: currency.decimals, maximumFractionDigits: currency.decimals});
  };

  function updateFeatureCurrency() {
    getData().then(function(data) {
      if (!data.currencies) {
        return;
      }

      $scope.currencies = data.currencies;
      var currency = $scope.currencies[$scope.selectedCurrency];

      $scope.featureLeft = {
        value: format(currency.amount, currency),
        symbol: currency.symbol,
        label: currency.label + ' price'
      };

      if (data.periodPrice) {
        // For all-time period we use a zero price.
        // The returned period price is Coinbase's first tracked price.
        var periodPrice = data.periodPrice;
        if ($scope.timeFrames[$scope.selectedTimeFrame].period == 'all') {
          periodPrice = 0;
        }

        var amountChange = utils.float(currency.amount) - utils.float(periodPrice);

        $scope.featureRight = {
          direction: (amountChange >= 0 ? 0 : -1),
          value: format(Math.abs(amountChange) + '', {decimals: 2}),
          symbol: currency.symbol,
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
        spotPrice[k].amount = utils.float(spotPrice[k].amount); // Convert to number
        spotPrice[k].symbol = Constants.currencyMap(spotPrice[k].currency, 'symbol');
        spotPrice[k].decimals = Constants.currencyMap(spotPrice[k].currency, 'decimals');

        // Set a sort order.
        spotPrice[k].sort = lodash.findIndex(coinbase.currencySortOrder, function(c) {
          return c.code == spotPrice[k].base;
        });
        spotPrice[k].sort = (spotPrice[k].sort < 0 ? 99 : spotPrice[k].sort); // Move items not found to end of sort.

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
      $log.error('Could not get Coinbase data: ' + error);

    });
  };

});