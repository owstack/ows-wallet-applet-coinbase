"use strict";angular.module("owsWalletPlugin",["angularMoment","gettext","ionic","monospaced.qrcode","ngFitText","ngLodash","owsWalletPluginClient","owsWalletPlugin.api.coinbase","owsWalletPlugin.controllers","owsWalletPlugin.directives","owsWalletPlugin.services"]),angular.module("owsWalletPlugin.controllers",[]),angular.module("owsWalletPlugin.directives",[]),angular.module("owsWalletPlugin.services",[]),angular.module("owsWalletPlugin").config(["$stateProvider",function($stateProvider){$stateProvider.state("onboarding",{url:"/onboarding",abstract:!0,template:'<ion-nav-view name="onboarding"></ion-nav-view>'}).state("onboarding.start",{url:"/start/:error",views:{onboarding:{controller:"StartCtrl",templateUrl:"views/start/start.html"}}}).state("onboarding.login",{url:"/login",views:{onboarding:{controller:"LoginCtrl",templateUrl:"views/login/login.html"}}}).state("tabs",{url:"/tabs",abstract:!0,controller:"TabsCtrl",templateUrl:"views/navigation/tabs/tabs.html"}).state("tabs.prices",{url:"/prices",views:{"tab-prices":{controller:"PricesCtrl",templateUrl:"views/prices/prices.html"}}}).state("tabs.accounts",{url:"/accounts",views:{"tab-accounts":{controller:"AccountsCtrl",templateUrl:"views/accounts/accounts.html"}}}).state("tabs.alerts",{url:"/alerts",views:{"tab-alerts":{controller:"AlertsCtrl",templateUrl:"views/alerts/alerts.html"}}}).state("tabs.settings",{url:"/settings",views:{"tab-settings":{controller:"SettingsCtrl",templateUrl:"views/settings/settings.html"}}}).state("tabs.account",{url:"/account/:accountId",views:{"tab-accounts@tabs":{controller:"AccountCtrl",templateUrl:"views/account/account.html"}}}).state("tabs.wallet",{url:"/wallet/:walletId",views:{"tab-accounts@tabs":{controller:"WalletCtrl",templateUrl:"views/wallet/wallet.html"}}}).state("tabs.account-send",{url:"/account-send/:accountId",views:{"tab-accounts@tabs":{controller:"SendCtrl",templateUrl:"views/account/send/send.html"}}}).state("tabs.account-send-recipient",{url:"/account-send-recipient/:accountId/:amount/:currency",views:{"tab-accounts@tabs":{controller:"RecipientCtrl",templateUrl:"views/account/send/recipient/recipient.html"}}}).state("tabs.buy-sell-amount",{url:"/buy-sell-amount/:action/:accountId/:walletId/:currency",views:{"tab-accounts@tabs":{controller:"BuySellAmountCtrl",templateUrl:"views/buy-sell-amount/buy-sell-amount.html"}}}).state("tabs.linked-accounts",{url:"/linked-accounts/:action/:accountId/:paymentMethodId",views:{"tab-accounts@tabs":{controller:"LinkedAccountsCtrl",templateUrl:"views/linked-accounts/linked-accounts.html"}}}).state("tabs.buy-sell-preview",{url:"/buy-sell-preview/:accountId/:orderId",views:{"tab-accounts@tabs":{controller:"BuySellPreviewCtrl",templateUrl:"views/buy-sell-preview/buy-sell-preview.html"}}}).state("tabs.buy-sell-confirm",{url:"/buy-sell-confirm/:accountId/:orderId",views:{"tab-accounts@tabs":{controller:"BuySellConfirmCtrl",templateUrl:"views/buy-sell-confirm/buy-sell-confirm.html"}}}).state("tabs.session-log",{url:"/session-log",views:{"tab-settings@tabs":{templateUrl:"views/settings/session-log/session-log.html"}}})}]).run(["$rootScope","$state","$log","$ionicConfig","coinbaseService","lodash","gettextCatalog","popupService","owsWalletPlugin.api.coinbase.CoinbaseServlet",function($rootScope,$state,$log,$ionicConfig,coinbaseService,lodash,gettextCatalog,popupService,CoinbaseServlet){$ionicConfig.backButton.icon("icon ion-arrow-left-c").text(""),owswallet.Plugin.openForBusiness([CoinbaseServlet.id],function(){coinbaseService.whenAvailable(function(error,coinbase){if(error)if("REQUEST_TIMED_OUT"==error.message){var title=gettextCatalog.getString("Request Timeout"),message=gettextCatalog.getString("Coinbase did not respond in time. You can retry or close the applet."),okText=gettextCatalog.getString("Retry"),cancelText=gettextCatalog.getString("Close");popupService.showConfirm(title,message,okText,cancelText,function(retry){retry?coinbaseService.retry():owswallet.Plugin.close({confirm:!1})})}else $state.go("onboarding.start",{error:error.message});else lodash.isEmpty(coinbase.accounts)?$state.go("onboarding.start"):$state.go("tabs.prices")})}),$rootScope.$on("$stateChangeStart",function(event,toState,toParams,fromState,fromParams){$log.debug("Applet route change start from:",fromState.name||"-"," to:",toState.name)})}]),angular.module("owsWalletPlugin").run(["gettextCatalog",function(gettextCatalog){}]),angular.module("owsWalletPlugin.services").factory("coinbaseService",["$log","$state","$timeout","lodash","gettextCatalog","popupService","owsWalletPlugin.api.coinbase.Coinbase",function($log,$state,$timeout,lodash,gettextCatalog,popupService,Coinbase){function onCoinbaseLogin(error){available(error)}function available(error){isAvailable=!0,lodash.each(availableCallbacks,function(x){$timeout(function(){return x(error,root.coinbase)},1)}),availableCallbacks=[]}var root={},isAvailable=!1,availableCallbacks=[];return root.coinbase,owswallet.Plugin.onEvent("coinbase.logout",function(event){$log.info("Logged out by Coinbase servlet")}),root.whenAvailable=function(cb){if(root.coinbase||(root.coinbase=new Coinbase(onCoinbaseLogin)),cb)return isAvailable?cb(root.coinbase):void availableCallbacks.push(cb)},root.retry=function(){root.coinbase=void 0,root.whenAvailable()},root}]),angular.module("owsWalletPlugin.services").factory("settingsService",["lodash","owsWalletPluginClient.api.Settings",function(lodash,Settings){var root={};return owswallet.Plugin.ready(function(){Settings.get().then(function(settingsObj){lodash.assign(root,settingsObj)}).catch(function(error){})}),root}]),angular.module("owsWalletPlugin.controllers").controller("AccountCtrl",["$scope","$state","$timeout","$ionicPopup","lodash","coinbaseService","gettextCatalog","popupService","stringUtils",function($scope,$state,$timeout,$ionicPopup,lodash,coinbaseService,gettextCatalog,popupService,stringUtils){function getTransactions(){$scope.account.getTransactions().then(function(transactions){$scope.transactions=transactions,$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get account transactions. Please try again."))})}var coinbase=coinbaseService.coinbase;$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.account=coinbase.getAccountById(data.stateParams.accountId),getTransactions()}),$scope.format=stringUtils.format,$scope.trim=stringUtils.trim,$scope.openReceive=function(){$scope.account.createAddress().then(function(address){$scope.address=address,$scope.popupState="warning",$scope.receivePopup=$ionicPopup.show({cssClass:"popup-account-receive",scope:$scope,templateUrl:"views/account/receive/receive.html"})})},$scope.openSend=function(){$state.go("tabs.account-send",{accountId:$scope.account.id})}}]),angular.module("owsWalletPlugin.controllers").controller("ReceiveCtrl",["$scope","$timeout","gettextCatalog","owsWalletPluginClient.api.Device",function($scope,$timeout,gettextCatalog,Device){$scope.$on("$ionicView.beforeEnter",function(event,data){}),$scope.closeReceive=function(){$scope.receivePopup.close()},$scope.showAddress=function(){$scope.popupState="qrcode"},$scope.shareAddress=function(){Device.socialShare({message:$scope.address.address,subject:gettextCatalog.getString("My {{currencyName}} address at Coinbase",{currencyName:account.currency.name})})},$scope.copyAddress=function(){$scope.popupState="copied",Device.copyToClipboard($scope.address.address),$timeout(function(){$scope.receivePopup.close()},1500)}}]),angular.module("owsWalletPlugin.controllers").controller("RecipientCtrl",["$scope","$log","$state","lodash","coinbaseService","popupService","stringUtils","gettextCatalog","owsWalletPluginClient.api.Session",function($scope,$log,$state,lodash,coinbaseService,popupService,stringUtils,gettextCatalog,Session){var coinbase=coinbaseService.coinbase;$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.formData={},$scope.account=coinbase.getAccountById(data.stateParams.accountId),$scope.amount=parseFloat($scope.format(data.stateParams.amount,data.stateParams.currency).entered),$scope.currency=data.stateParams.currency}),$scope.format=stringUtils.format,$scope.scan=function(){Session.getInstance().scanQrCode().then(function(result){var address=lodash.get(result,"parsed.address"),currency=lodash.get(result,"parsed.currency");"payment-data"==result.type&&address&&currency==$scope.currency||"email"==result.type?($scope.formData.address=address||result.rawData,$scope.$apply()):popupService.showAlert(gettextCatalog.getString("Invalid Address"),gettextCatalog.getString("The scanned data does not resolve to an email or {{currency}} address.",{currency:$scope.currency}))})},$scope.send=function(){var data={to:$scope.formData.address,amount:$scope.amount,currency:$scope.currency,description:$scope.formData.notes};$scope.account.send(data).then(function(){popupService.showAlert(gettextCatalog.getString("Funds Sent"),gettextCatalog.getString("You sent {{amount}}{{currency}} to {{address}}.",{amount:$scope.amount,currency:$scope.currency,address:$scope.formData.address}))}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Send Failed"),error.detail)})}}]),angular.module("owsWalletPlugin.controllers").controller("SendCtrl",["$rootScope","$scope","$state","$ionicHistory","coinbaseService","gettextCatalog","popupService","settingsService","stringUtils","owsWalletPluginClient.api.BN","owsWalletPluginClient.api.Constants",function($rootScope,$scope,$state,$ionicHistory,coinbaseService,gettextCatalog,popupService,settingsService,stringUtils,BN,Constants){var usdRates,coinbase=coinbaseService.coinbase,language=settingsService.language,keypadCurrencies=["USD"];$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.account=coinbase.getAccountById(data.stateParams.accountId);var currency=$scope.account.currency.code;keypadCurrencies.push(currency),coinbase.exchangeRates("USD").then(function(rates){usdRates=rates,$scope.keypadConfig={language:language,lengthExpressionLimit:9,currencies:keypadCurrencies,usdRates:usdRates,value:{amount:0,currency:$scope.account.balance.currency}},$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get exchange rates. Please try again."))})}),$rootScope.$on("Local/KeypadState",function(e,keypadState){$scope.keypad=keypadState}),$scope.format=stringUtils.format,$scope.close=function(){$ionicHistory.goBack()},$scope.toggleCurrency=function(){$scope.keypadConfig={currencyIndex:$scope.keypad.nextCurrencyIndex}},$scope.setAmountOfAvailable=function(percentage){$scope.keypadConfig={value:{amount:BN.multiply($scope.account.balance.amount,percentage),currency:$scope.account.balance.currency}}},$scope.goRecipient=function(){var amount=$scope.keypad.amount;if(Constants.isCryptoCurrency($scope.keypad.currency)||(amount*=usdRates[$scope.account.currency.code]),amount>$scope.account.balance.amount)return popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("You do not have enough to send this amount."));$state.go("tabs.account-send-recipient",{accountId:$scope.account.id,amount:amount,currency:$scope.account.currency.code})}}]),angular.module("owsWalletPlugin.controllers").controller("AccountsCtrl",["$scope","$state","$timeout","coinbaseService","gettextCatalog","settingsService","stringUtils","owsWalletPluginClient.api.Constants","owsWalletPluginClient.api.Session",function($scope,$state,$timeout,coinbaseService,gettextCatalog,settingsService,stringUtils,Constants,Session){function getAccounts(){$scope.accounts=coinbase.accounts,coinbase.updateAccountBalances($scope.currency).then(function(){$timeout(function(){$scope.$apply()})})}function getWallets(){session.getWallets().then(function(wallets){$scope.wallets=wallets})}var coinbase=coinbaseService.coinbase,session=(settingsService.language,Session.getInstance());$scope.$on("$ionicView.beforeEnter",function(event){$scope.currency="USD",$scope.walletSectionTitle=gettextCatalog.getString("Wallets"),getAccounts(),getWallets()}),$scope.onWallet=function(wallet){$state.go("tabs.wallet",{walletId:wallet.id})},$scope.format=stringUtils.format}]),angular.module("owsWalletPlugin.controllers").controller("AlertsCtrl",function(){}),angular.module("owsWalletPlugin.controllers").controller("BuySellAmountCtrl",["$rootScope","$scope","$ionicHistory","$state","lodash","coinbaseService","gettextCatalog","popupService","settingsService","stringUtils","owsWalletPluginClient.api.BN","owsWalletPluginClient.api.Session","owsWalletPluginClient.api.Constants",function($rootScope,$scope,$ionicHistory,$state,lodash,coinbaseService,gettextCatalog,popupService,settingsService,stringUtils,BN,Session,Constants){var walletId,coinbase=coinbaseService.coinbase,language=settingsService.language,keypadCurrencies=["USD"],actionMap={buy:{title:gettextCatalog.getString("Buy"),button:gettextCatalog.getString("Preview Buy"),defaultPayMethodType:"bank"},sell:{title:gettextCatalog.getString("Sell"),button:gettextCatalog.getString("Preview Sell"),defaultPayMethodType:"account"}};$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.action=$ionicHistory.currentView().stateParams.action,walletId=$ionicHistory.currentView().stateParams.walletId;var currency;walletId?(currency=$ionicHistory.currentView().stateParams.currency,$scope.account=coinbase.getAccountByCurrencyCode(currency),$scope.accountId=$scope.account.id):($scope.accountId=$ionicHistory.currentView().stateParams.accountId,$scope.account=coinbase.getAccountById($scope.accountId),currency=$scope.account.currency.code);var selectedPaymentMethodId=$ionicHistory.currentView().stateParams.paymentMethodId;$scope.title=actionMap[$scope.action].title+" "+coinbase.getCurrencyByCode(currency).name,$scope.button=actionMap[$scope.action].button,coinbase.getPaymentMethods().then(function(paymentMethods){var paymentMethod;(paymentMethod=selectedPaymentMethodId?lodash.find(paymentMethods,function(m){return m.id==selectedPaymentMethodId}):lodash.find(paymentMethods,function(m){return m.type==actionMap[$scope.action].defaultPayMethodType}))||(paymentMethod=paymentMethods[0]);var limit;if("buy"==$scope.action){limit="Max: "+stringUtils.format(paymentMethod.limits.buy.amount,paymentMethod.limits.buy.currency,{language:language}).localized_u}$scope.paymentMethod={id:paymentMethod.id,name:paymentMethod.name,limit:limit,type:paymentMethod.type+"-"+paymentMethod.currency},$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get payment methods. Please try again."))}),keypadCurrencies.push(currency),coinbase.exchangeRates("USD").then(function(rates){$scope.keypadConfig={language:language,lengthExpressionLimit:9,currencies:keypadCurrencies,usdRates:rates,value:{amount:0,currency:$scope.account.balance.currency}},$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get exchange rates. Please try again."))})}),$rootScope.$on("Local/KeypadState",function(e,keypadState){$scope.keypad=keypadState}),$scope.format=stringUtils.format,$scope.isCryptoCurrency=function(currency){return Constants.isCryptoCurrency(currency)},$scope.close=function(){$ionicHistory.goBack()},$scope.toggleCurrency=function(){$scope.keypadConfig={currencyIndex:$scope.keypad.nextCurrencyIndex}},$scope.setAmountOfAvailable=function(percentage){$scope.keypadConfig={value:{amount:BN.multiply($scope.account.balance.amount,percentage),currency:$scope.account.balance.currency}}},$scope.goPreview=function(){var createOrder;switch($scope.action){case"buy":createOrder=$scope.account.createBuyOrder;break;case"sell":createOrder=$scope.account.createSellOrder}createOrder({amount:$scope.keypad.amount,currency:$scope.keypad.currency,paymentMethodId:$scope.paymentMethod.id,walletId:walletId}).then(function(order){$state.go("tabs.buy-sell-preview",{accountId:$scope.accountId,orderId:order.id})}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Could not create "+$scope.action+" order"),gettextCatalog.getString(error.detail))})}}]),angular.module("owsWalletPlugin.controllers").controller("BuySellConfirmCtrl",["$scope","coinbaseService","gettextCatalog","stringUtils",function($scope,coinbaseService,gettextCatalog,stringUtils){var coinbase=coinbaseService.coinbase,actionMap={buy:{title:gettextCatalog.getString("Your buy was successful!"),button:gettextCatalog.getString("Go to accounts")},sell:{title:gettextCatalog.getString("Your sell was successful!"),button:gettextCatalog.getString("Go to accounts")}};$scope.$on("$ionicView.beforeEnter",function(event,data){var accountId=data.stateParams.accountId,orderId=data.stateParams.orderId,account=coinbase.getAccountById(accountId);$scope.order=account.getOrderById(orderId),$scope.title=actionMap[$scope.order.kind].title,$scope.button=actionMap[$scope.order.kind].button}),$scope.format=stringUtils.format}]),angular.module("owsWalletPlugin.controllers").controller("BuySellPreviewCtrl",["$scope","$state","coinbaseService","popupService","gettextCatalog","stringUtils","owsWalletPluginClient.api.Constants",function($scope,$state,coinbaseService,popupService,gettextCatalog,stringUtils,Constants){var account,coinbase=coinbaseService.coinbase,actionMap={buy:{title:gettextCatalog.getString("Confirm Buy"),button:gettextCatalog.getString("Confirm Buy")},sell:{title:gettextCatalog.getString("Confirm Sell"),button:gettextCatalog.getString("Confirm Sell")}};$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.accountId=data.stateParams.accountId,$scope.orderId=data.stateParams.orderId,account=coinbase.getAccountById($scope.accountId),$scope.order=account.getOrderById($scope.orderId),$scope.order.getPaymentMethod().then(function(paymentMethod){$scope.paymentMethod=paymentMethod,$scope.$apply()}),$scope.title=actionMap[$scope.order.kind].title,$scope.button=actionMap[$scope.order.kind].button}),$scope.format=stringUtils.format,$scope.trim=stringUtils.trim,$scope.confirm=function(){$scope.order.commit().then(function(order){$state.go("tabs.buy-sell-confirm",{accountId:order.account.id,orderId:order.id})}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Could not confirm {{action}} order",{action:$scope.action}),gettextCatalog.getString(error.detail))})}}]),angular.module("owsWalletPlugin.controllers").controller("LinkedAccountsCtrl",["$scope","$ionicHistory","coinbaseService","gettextCatalog","lodash","popupService","settingsService","stringUtils",function($scope,$ionicHistory,coinbaseService,gettextCatalog,lodash,popupService,settingsService,stringUtils){var accountId,currency,coinbase=coinbaseService.coinbase,language=settingsService.language;$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.action=data.stateParams.action,$scope.selectedId=data.stateParams.paymentMethodId,accountId=data.stateParams.accountId,currency=coinbase.getAccountById(accountId).currency.code,coinbase.getPaymentMethods().then(function(methods){"buy"==$scope.action?$scope.methods=lodash.filter(methods,function(m){return"account"!=m.type&&"card"!=m.type}):$scope.methods=methods,$scope.methods=lodash.map($scope.methods,function(m){if(m.limits.buy.amount){var amount=stringUtils.format(m.limits.buy.amount,m.limits.buy.currency,{language:language});"account"!=m.type&&(m.limit="Max: "+amount.localized_u)}return m}),$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get payment methods. Please try again."))})}),$scope.select=function(method){$ionicHistory.backView().stateParams={action:$scope.action,accountId:accountId,paymentMethodId:method.id},$ionicHistory.goBack()}}]),angular.module("owsWalletPlugin.controllers").controller("LoginCtrl",["$scope","$log","$timeout","$state","$ionicModal","$ionicHistory","gettextCatalog","popupService","externalLinkService","coinbaseService","owsWalletPluginClient.api.Utils",function($scope,$log,$timeout,$state,$ionicModal,$ionicHistory,gettextCatalog,popupService,externalLinkService,coinbaseService,Utils){function openAuthenticateWindow(){function code(str){var code=null,idxCode=str.indexOf("code=");return idxCode>=0&&(code=str.substring(idxCode+5),code.indexOf("&")>=0&&(code=code.substring(0,code.indexOf("&")))),code}if(isNodeWebKit){require("nw.gui").Window.open(coinbase.urls.oauthCodeUrl,{focus:!0,position:"center"},function(authenticateWindow){authenticateWindow.on("loaded",function(){var oauthCode=code(authenticateWindow.window.location.search);oauthCode&&(authenticateWindow.window.close(),login(oauthCode))})})}else externalLinkService.open(coinbase.urls.oauthCodeUrl)}function openModal(){$ionicModal.fromTemplateUrl("views/login/form/form.html",{scope:$scope}).then(function(modal){$scope.formData.oauthCode="",$scope.loginModal=modal,$scope.loginModal.show()}),$scope.cancel=function(){$scope.loginModal.remove(),$timeout(function(){$state.go("onboarding.start")},200)},$scope.submit=function(){coinbase.login($scope.formData.oauthCode,function(err){if(err)return showError(err);$scope.loginModal.remove(),$timeout(function(){$state.go("tabs.prices")},200)})}}function closeModal(){$scope.loginModal.remove()}function login(oauthCode){coinbase.login(oauthCode,function(err){if(err)return showError(err);closeModal(),$timeout(function(){$state.go("tabs.prices")},200)})}function showError(err){return $log.error("Could not authenticate with Coinbase: "+err.message),popupService.showAlert(gettextCatalog.getString("Could not login to Coinbase"),gettextCatalog.getString("An error occurred while trying to authenticate with Coinbase. Please try again."),function(){$scope.formData.oauthCode=""})}var isCordova=owswallet.Plugin.isCordova(),isNodeWebKit=owswallet.Plugin.isNodeWebKit(),coinbase=coinbaseService.coinbase;$scope.allowCodeEntry=!isCordova,$scope.formData={oauthCode:""},$scope.$on("$ionicView.enter",function(event,data){openModal(),openAuthenticateWindow()}),owswallet.Plugin.onEvent("incoming-data",function(event){if(!(event.data&&event.data.indexOf("://coinbase")<0)){var oauthCode=Utils.getUrlParameterByName(event.data,"code");oauthCode&&oauthCode.length>0&&login(oauthCode)}})}]),angular.module("owsWalletPlugin.directives").directive("hideTabs",["$rootScope","$timeout",function($rootScope,$timeout){return{link:function(scope,elem,attrs,ctrl){scope.$on("$ionicView.beforeEnter",function(event,data){attrs.hideTabs&&"true"!=attrs.hideTabs?$rootScope.hideTabs="":$rootScope.hideTabs="tabs-item-hide"})}}}]),angular.module("owsWalletPlugin.directives").directive("showTabs",["$rootScope","$timeout",function($rootScope,$timeout){return{link:function(scope,elem,attrs,ctrl){scope.$on("$ionicView.enter",function(event,data){attrs.showTabs&&"true"!=attrs.showTabs?$rootScope.hideTabs="tabs-item-hide":$rootScope.hideTabs=""})}}}]),angular.module("owsWalletPlugin.controllers").controller("TabsCtrl",["$scope",function($scope){}]),angular.module("owsWalletPlugin.controllers").controller("PricesCtrl",["$scope","$timeout","$log","$ionicScrollDelegate","lodash","stringUtils","coinbaseService","settingsService","owsWalletPluginClient.api.Constants",function($scope,$timeout,$log,$ionicScrollDelegate,lodash,stringUtils,coinbaseService,settingsService,Constants){function init(){$scope.currency=currency,$scope.period="day",$scope.amountGroupOpacity=1,$scope.titleOpacity=0,getAccountsTotalBalance().then(function(){return updateData()}).then(function(){owswallet.Plugin.hideSplash()})}function getAccountsTotalBalance(){return new Promise(function(resolve,reject){var decimals=Constants.currencyMap(currency,"decimals"),count=(Constants.currencyMap(currency,"symbol"),coinbase.accounts.length),totalBalance=0;lodash.forEach(coinbase.accounts,function(account){account.getBalance(currency).then(function(balance){if(totalBalance+=balance,$scope.totalBalance=$scope.format(totalBalance,currency,{decimals:decimals}).localized_u,0==--count)return resolve()}).catch(function(error){$totalBalance="...",resolve()})})})}function updateData(){getData().then(function(data){$scope.currencies=data.currencies,$scope.$apply(),dataUpdater=$timeout(function(){updateData()},DATA_UPDATE_FREQUENCY)})}function getData(){return new Promise(function(resolve,reject){coinbase.spotPrice().then(function(spotPrice){spotPrice=lodash.pickBy(spotPrice,function(value,key){return void 0==value.error||($log.error("Could not spot price for "+key+": "+value.error),!1)});var currencies=lodash.map(Object.keys(spotPrice),function(k){var decimals=Constants.currencyMap(spotPrice[k].currency,"decimals");return spotPrice[k].pair=spotPrice[k].base+"-"+spotPrice[k].currency,spotPrice[k].amount=stringUtils.float(spotPrice[k].amount),spotPrice[k].symbol=Constants.currencyMap(spotPrice[k].currency,"symbol"),spotPrice[k].decimals=decimals,spotPrice[k].color=coinbase.getAccountByCurrencyCode(spotPrice[k].base).currency.color,spotPrice[k].sort=lodash.find(coinbase.currencies,function(c){return c.code==spotPrice[k].base}).sort,spotPrice[k]});return lodash.sortBy(currencies,function(c){return c.sort})}).then(function(currencies){var count=currencies.length;lodash.forEach(currencies,function(currency){coinbase.historicPrice(currency.pair,$scope.period).then(function(data){var periodPrice=stringUtils.float(data.prices[data.prices.length-1].price);if(currency.amountChange=currency.amount-periodPrice,currency.percentChange=Math.abs(100*currency.amountChange/currency.amount),0==--count)return resolve({currencies:currencies})})})}).catch(function(error){})})}var dataUpdater,coinbase=coinbaseService.coinbase,currency="USD",DATA_UPDATE_FREQUENCY=(settingsService.language,3e4);$scope.$on("$ionicView.beforeEnter",function(event,data){init()}),$scope.$on("$ionicView.beforeLeave",function(event){$timeout.cancel(dataUpdater)}),$scope.onScroll=function(){var position=$ionicScrollDelegate.$getByHandle("cards").getScrollPosition().top;$scope.amountGroupOpacity=1-.01*position,position<=0?($scope.headerHeight=216+Math.abs(position)+"px",$scope.headerTop="0px"):($scope.headerHeight="216px",$scope.headerTop=-1.5*position+"px"),$scope.titleOpacity=position<130?0:.2*(position-130),$scope.$apply()},$scope.format=stringUtils.format}]),angular.module("owsWalletPlugin.controllers").controller("SettingsCtrl",["$scope","$timeout","$state","$ionicHistory","gettextCatalog","popupService","externalLinkService","coinbaseService","owsWalletPluginClient.api.Session",function($scope,$timeout,$state,$ionicHistory,gettextCatalog,popupService,externalLinkService,coinbaseService,Session){var coinbase=coinbaseService.coinbase;Session.getInstance();$scope.$on("$ionicView.beforeEnter",function(event,data){coinbase.getCurrentUser().then(function(user){$scope.user=user,$scope.$apply()})}),$scope.externalLinks={support:{itemName:gettextCatalog.getString("Support"),title:gettextCatalog.getString("Get Support"),message:gettextCatalog.getString("Get support from Coinbase."),okText:gettextCatalog.getString("Visit Website"),cancelText:gettextCatalog.getString("Go Back"),url:coinbase.urls.supportUrl},privacy:{itemName:gettextCatalog.getString("Privacy"),title:gettextCatalog.getString("View Privacy Policy"),message:gettextCatalog.getString("Read the Coinbase privacy policy."),okText:gettextCatalog.getString("Visit Website"),cancelText:gettextCatalog.getString("Go Back"),url:coinbase.urls.privacyUrl}},$scope.openExternalLink=function(link){externalLinkService.open(link.url,!0,link.title,link.message,link.okText,link.cancelText)},$scope.logout=function(){var message=gettextCatalog.getString("Are you sure you would like to log out of your Coinbase account?");popupService.showConfirm("Coinbase",message,null,null,function(ok){ok&&coinbase.logout(function(){$ionicHistory.clearHistory(),$timeout(function(){$state.go("onboarding.start")},100)})})}}]),angular.module("owsWalletPlugin.controllers").controller("StartCtrl",["$scope","$ionicHistory","$log","$state","$timeout","lodash","gettextCatalog","popupService","externalLinkService","stringUtils","coinbaseService","settingsService","owsWalletPluginClient.api.Constants",function($scope,$ionicHistory,$log,$state,$timeout,lodash,gettextCatalog,popupService,externalLinkService,stringUtils,coinbaseService,settingsService,Constants){function updateFeatureCurrency(){return getData().then(function(data){if(data.currencies){$scope.currencies=data.currencies;var currency=$scope.currencies[$scope.selectedCurrency];if($scope.featureLeft={value:stringUtils.format(currency.amount,currency.currency).localized_u,label:currency.label+" price"},data.periodPrice){var periodPrice=data.periodPrice;"all"==$scope.timeFrames[$scope.selectedTimeFrame].period&&(periodPrice=0);var amountChange=stringUtils.float(currency.amount)-stringUtils.float(periodPrice);$scope.featureRight={up:amountChange>=0,value:stringUtils.format(amountChange,currency.currency).localized_u,label:$scope.timeFrames[$scope.selectedTimeFrame].label},$scope.$apply(),dataUpdater=$timeout(function(){updateFeatureCurrency()},DATA_UPDATE_FREQUENCY)}}})}function getData(){return coinbase.spotPrice().then(function(spotPrice){spotPrice=lodash.pickBy(spotPrice,function(value,key){return void 0==value.error||($log.error("Could not spot price for "+key+": "+value.error),!1)});var currencies=lodash.map(Object.keys(spotPrice),function(k){return spotPrice[k].pair=spotPrice[k].base+"-"+spotPrice[k].currency,spotPrice[k].amount=stringUtils.float(spotPrice[k].amount),spotPrice[k].symbol=Constants.currencyMap(spotPrice[k].currency,"symbol"),spotPrice[k].decimals=Constants.currencyMap(spotPrice[k].currency,"decimals"),spotPrice[k].sort=lodash.find(coinbase.currencies,function(c){return c.code==spotPrice[k].base}).sort,spotPrice[k]});return lodash.sortBy(currencies,function(c){return c.sort})}).then(function(currencies){var currencyPair=currencies[$scope.selectedCurrency].pair,period=$scope.timeFrames[$scope.selectedTimeFrame].period;return coinbase.historicPrice(currencyPair,period).then(function(data){return{currencies:currencies,periodPrice:data.prices[data.prices.length-1].price}})}).catch(function(error){})}var dataUpdater,coinbase=coinbaseService.coinbase,DATA_UPDATE_FREQUENCY=(settingsService.language,3e4);$scope.timeFrames=[{button:"1H",label:gettextCatalog.getString("this hour"),period:"hour"},{button:"1D",label:gettextCatalog.getString("today"),period:"day"},{button:"1W",label:gettextCatalog.getString("this week"),period:"week"},{button:"1M",label:gettextCatalog.getString("this month"),period:"month"},{button:"1Y",label:gettextCatalog.getString("this year"),period:"year"},{button:"ALL",period:"all",label:gettextCatalog.getString("all time")}],$scope.$on("$ionicView.beforeEnter",function(event,data){if(data.stateParams&&data.stateParams.error){var title,message;data.stateParams.error.includes("UNAUTHORIZED")?(title=gettextCatalog.getString("Logged Out"),message=gettextCatalog.getString("Your account was logged out. Please login again.")):(title=gettextCatalog.getString("Uh oh!"),message=gettextCatalog.getString("Could not login to Coinbase. Please try again.")),popupService.showAlert(title,message)}$ionicHistory.clearHistory(),$ionicHistory.clearCache(),$scope.selectedCurrency=0,$scope.selectedTimeFrame=lodash.findIndex($scope.timeFrames,["period","year"]),updateFeatureCurrency().then(function(){owswallet.Plugin.hideSplash()})}),$scope.$on("$ionicView.beforeLeave",function(event){$timeout.cancel(dataUpdater)}),$scope.login=function(){$state.go("onboarding.login")},$scope.openSignupWindow=function(){var url=coinbase.urls.signupUrl;externalLinkService.open(url,!0,"Sign Up for Coinbase","This will open Coinbase.com, where you can create an account.","Go to Coinbase","Back")},$scope.selectCurrency=function(index){$scope.selectedCurrency=index,updateFeatureCurrency()},
$scope.selectTimeFrame=function(index){$scope.selectedTimeFrame=index,updateFeatureCurrency()}}]),angular.module("owsWalletPlugin.controllers").controller("WalletCtrl",["$scope","owsWalletPluginClient.api.Session",function($scope,Session){$scope.$on("$ionicView.beforeEnter",function(event,data){Session.getInstance().getWalletById(data.stateParams.walletId).then(function(wallet){$scope.wallet=wallet})})}]);