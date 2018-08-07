'use strict';

angular.module('owsWalletPlugin.controllers').controller('PricesCtrl', function($scope, $timeout, $log, $ionicScrollDelegate, lodash, stringUtils, coinbaseService, settingsService,
  /* @namespace owsWalletPluginClient.api */ Constants) {

  var coinbase = coinbaseService.coinbase;
  var currency = 'USD';
  var language = settingsService.language;

  var DATA_UPDATE_FREQUENCY = 30000; // ms
  var dataUpdater;

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    init();
  });

  $scope.$on("$ionicView.beforeLeave", function(event) {
    // Stop retrieving Coinbase data.
    $timeout.cancel(dataUpdater);
  });

  $scope.onScroll = function() {
    var position = $ionicScrollDelegate.$getByHandle('cards').getScrollPosition().top;

    $scope.amountGroupOpacity = 1 - (position * 0.01);

    // As the scroll is pulled down the content background is revealed; this ensures the content background is not revealed.
    if (position <= 0) {
      $scope.headerHeight =  216 + Math.abs(position) + 'px';
      $scope.headerTop = '0px';
    } else {
      $scope.headerHeight = '216px';
      $scope.headerTop = -1.5 * position + 'px';
    }

    if (position < 130) {
      $scope.titleOpacity = 0;
    } else {
      $scope.titleOpacity = ((position - 130) * 0.20);
    }

    $scope.$apply();
  };

  $scope.format = stringUtils.format;

  function init() {
    $scope.currency = currency;
    $scope.period = 'day';
    $scope.amountGroupOpacity = 1;
    $scope.titleOpacity = 0;

    getAccountsTotalBalance().then(function() {
      return updateData();

    }).then(function() {
      owswallet.Plugin.hideSplash();

    });
  };

  function getAccountsTotalBalance() {
    return new Promise(function(resolve, reject) {
      // Get our total balance for all accounts.
      var decimals = Constants.currencyMap(currency, 'decimals');
      var symbol = Constants.currencyMap(currency, 'symbol');

      var count = coinbase.accounts.length;
      var totalBalance = 0;
      lodash.forEach(coinbase.accounts, function(account) {
        account.getBalance(currency).then(function(balance) {

          totalBalance += balance;
          $scope.totalBalance = $scope.format(totalBalance, currency, {decimals: decimals}).localized_u;

          count--;

          if (count == 0) {
            return resolve ();
          }

        }).catch(function(error) {
          // Do not display the balance if any error occurs.
          $totalBalance = '...';
          resolve (); // Just continue to render other data.

        });
      });
    });
  };

  function updateData() {
    getData().then(function(data) {
      $scope.currencies = data.currencies;
      $scope.$apply();

      // Continue updating until canceled.
      dataUpdater = $timeout(function() {
        updateData();
      }, DATA_UPDATE_FREQUENCY);
    });
  };

  function getData() {
    return new Promise(function(resolve, reject) {
      // Get spot prices for all currency pairs.
      coinbase.spotPrice().then(function(spotPrice) {

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
          var decimals = Constants.currencyMap(spotPrice[k].currency, 'decimals');

          spotPrice[k].pair = spotPrice[k].base + '-' + spotPrice[k].currency;
          spotPrice[k].amount = stringUtils.float(spotPrice[k].amount); // Convert to number
          spotPrice[k].symbol = Constants.currencyMap(spotPrice[k].currency, 'symbol');
          spotPrice[k].decimals = decimals;
          spotPrice[k].color = coinbase.getAccountByCurrencyCode(spotPrice[k].base).currency.color;

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

        var count = currencies.length;

        // Get some history for each currency pair.
        lodash.forEach(currencies, function(currency) {

          coinbase.historicPrice(currency.pair, $scope.period).then(function(data) {
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

            var periodPrice = stringUtils.float(data.prices[data.prices.length-1].price); // Convert to number
            currency.amountChange = currency.amount - periodPrice;
            currency.percentChange = Math.abs(100 * currency.amountChange / currency.amount);

            count--;

            if (count == 0) {
              return resolve ({
                currencies: currencies
              });
            }
          });

        });

      }).catch(function(error) {
        // Error logged

      });
    }); // Promise
  };

});
