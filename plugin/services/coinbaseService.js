'use strict';

angular.module('owsWalletPlugin.services').service('coinbaseService', function ($rootScope, $log, lodash, Account, Coinbase) {

  var root = {};

  var coinbase = new Coinbase('service');
  var account;
  var priceInfo;
  var urls;

  //
  coinbase.init().then(function(accountId) {

    if (accountId != undefined) {
      account = new Account(accountId);
    }

    return coinbase.getPriceInfo();

  }).then(function(pi) {

    priceInfo = pi;

    return coinbase.getUrls();

  }).then(function(u) {

    urls = u;
    return;

  }).catch(function(error) {
    $log.error('Could not initialize Coinbase service: ' + error);

  });

  root.accessApi = function() {
    coinbase.accessApi(oauthCode);
  };

  root.getStoredToken = function() {};
//  root.setCredentials = function() {};
  root.init = function() {};
//  coinbase.accessAccount();

//  account.getTransactions();


  root.logout = function() {
    coinbase.logout();
  };

  root.getAvailableCurrencies = function() {
    return coinbase.getAvailableCurrencies();
  };

  root.buyPrice = function() {
    return coinbase.buyPrice(currency);
  };

  root.sellPrice = function() {
    return coinbase.sellPrice(currency);
  };

  root.getPendingTransactions = function() {
    return coinbase.getPendingTransactions();
  };

  root.getSignupUrl = function() {
    return urls.signupUrl;
  };

  root.getSupportUrl = function() {
    return urls.supportUrl;
  };

  root.getOauthCodeUrl = function() {
    return urls.oauthCodeUrl;
  };

  root.savePendingTransaction = function() {
    return coinbase.savePendingTransaction(tx, options);    
  };

  root.getPaymentMethods = function() {
    return coinbase.getPaymentMethods();
  };

  root.getNetwork = function() {};

  root.buyRequest = function() {
    return account.buyRequest(data);
  };

  root.getTransaction = function() {
    return account.getTransaction(txId);
  };

  root.getBuyOrder = function() {
    return account.getBuyOrder(buyId);
  };

  root.checkEnoughFundsForFee = function() {};
  root.getErrorsAsString = function() {};

  root.priceSensitivity = function() {
    return priceInfo.priceSensitivity.values;
  };
  root.selectedPriceSensitivity = function() {
    return priceInfo.priceSensitivity.selected;
  };

  root.sellRequest = function() {
    return account.sellRequest(data);
  };

  root.createAddress = function() {
    return account.createAddress(data);
  };

  root.getAccount = function() {
    return coinbase.getAccount(accountId);
  };

  root.getCurrentUser = function() {
    return coinbase.getCurrentUser();
  };


  return root;
});
