'use strict';

angular.module('owsWalletPlugin.controllers').controller('PricesCtrl', function($scope, $timeout, $log, $ionicScrollDelegate, lodash, utils, coinbaseService, settingsService, Constants) {

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

    $scope.headerTop = -1.5 * position + 'px';
    $scope.amountGroupOpacity = 1 - (position * 0.01);

    if (position < 130) {
      $scope.titleOpacity = 0;
    } else {
      $scope.titleOpacity = ((position - 130) * 0.20);
    }

    $scope.$apply();
  };

  $scope.format = function(num, currency) {
    return Math.abs(num).toLocaleString(language, {minimumFractionDigits: currency.decimals, maximumFractionDigits: currency.decimals});
  };

  function init() {
    $scope.period = 'day';
    $scope.amountGroupOpacity = 1;
    $scope.titleOpacity = 0;

    getAccountsTotalBalance();
    updateData();
  };

  function getAccountsTotalBalance() {
    // Get our total balance for all accounts.
    var decimals = Constants.currencyMap(currency, 'decimals');
    var symbol = Constants.currencyMap(currency, 'symbol');

    var totalBalance = 0;
    lodash.forEach(coinbase.accounts, function(account) {
      account.getBalance(currency).then(function(balance) {

        totalBalance += balance;
        $scope.totalBalance = symbol + $scope.format(totalBalance, {decimals: decimals});

      }).catch(function(error) {
        $log.error(error);

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
          spotPrice[k].amount = utils.float(spotPrice[k].amount); // Convert to number
          spotPrice[k].symbol = Constants.currencyMap(spotPrice[k].currency, 'symbol');
          spotPrice[k].decimals = decimals;
          spotPrice[k].color = coinbase.getAccountByCurrencyCode(spotPrice[k].base).currency.color;

          // Set a sort order.
          spotPrice[k].sort = coinbase.currencySortOrder.indexOf(spotPrice[k].base);
          spotPrice[k].sort = (spotPrice[k].sort < 0 ? 99 : spotPrice[k].sort); // Move items not found to end of sort.

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

            var periodPrice = utils.float(data.prices[data.prices.length-1].price); // Convert to number
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
        $log.error('Could not get Coinbase data: ' + error);

      });
    }); // Promise
  };

});
