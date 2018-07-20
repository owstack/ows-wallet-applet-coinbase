"use strict";angular.module("owsWalletPlugin",["angularMoment","gettext","ionic","monospaced.qrcode","ngFitText","ngLodash","owsWalletPluginClient","owsWalletPlugin.api.coinbase","owsWalletPlugin.controllers","owsWalletPlugin.directives","owsWalletPlugin.services"]),angular.module("owsWalletPlugin.controllers",[]),angular.module("owsWalletPlugin.directives",[]),angular.module("owsWalletPlugin.services",[]),angular.module("owsWalletPlugin").config(["$stateProvider",function($stateProvider){$stateProvider.state("onboarding",{url:"/onboarding",abstract:!0,template:'<ion-nav-view name="onboarding"></ion-nav-view>'}).state("onboarding.start",{url:"/start",views:{onboarding:{controller:"StartCtrl",templateUrl:"views/start/start.html"}}}).state("onboarding.login",{url:"/login",views:{onboarding:{controller:"LoginCtrl",templateUrl:"views/login/login.html"}}}).state("tabs",{url:"/tabs",abstract:!0,controller:"TabsCtrl",templateUrl:"views/navigation/tabs/tabs.html"}).state("tabs.prices",{url:"/prices",views:{"tab-prices":{controller:"PricesCtrl",templateUrl:"views/prices/prices.html"}}}).state("tabs.accounts",{url:"/accounts",views:{"tab-accounts":{controller:"AccountsCtrl",templateUrl:"views/accounts/accounts.html"}}}).state("tabs.alerts",{url:"/alerts",views:{"tab-alerts":{controller:"AlertsCtrl",templateUrl:"views/alerts/alerts.html"}}}).state("tabs.settings",{url:"/settings",views:{"tab-settings":{controller:"SettingsCtrl",templateUrl:"views/settings/settings.html"}}}).state("tabs.account",{url:"/account/:id",views:{"tab-accounts@tabs":{controller:"AccountCtrl",templateUrl:"views/account/account.html"}}}).state("tabs.buy-sell-amount",{url:"/buy-sell-amount/:action/:accountId",views:{"tab-accounts@tabs":{controller:"BuySellAmountCtrl",templateUrl:"views/buy-sell-amount/buy-sell-amount.html"}}}).state("tabs.linked-accounts",{url:"/linked-accounts/:action/:accountId/:paymentMethodId",views:{"tab-accounts@tabs":{controller:"LinkedAccountsCtrl",templateUrl:"views/linked-accounts/linked-accounts.html"}}}).state("tabs.buy-sell-preview",{url:"/buy-sell-preview/:accountId/:orderId",views:{"tab-accounts@tabs":{controller:"BuySellPreviewCtrl",templateUrl:"views/buy-sell-preview/buy-sell-preview.html"}}}).state("tabs.session-log",{url:"/session-log",views:{"tab-settings@tabs":{templateUrl:"views/settings/session-log/session-log.html"}}})}]).run(["$rootScope","$state","$log","coinbaseService","$ionicConfig","owsWalletPlugin.api.coinbase.CoinbaseServlet",function($rootScope,$state,$log,coinbaseService,$ionicConfig,CoinbaseServlet){$ionicConfig.backButton.icon("icon ion-arrow-left-c").text(""),owswallet.Plugin.openForBusiness(CoinbaseServlet.id,function(){coinbaseService.whenAvailable(function(coinbase){coinbase.accounts?$state.go("tabs.prices"):$state.go("onboarding.start")})}),$rootScope.$on("$stateChangeStart",function(event,toState,toParams,fromState,fromParams){$log.debug("Applet route change start from:",fromState.name||"-"," to:",toState.name)})}]),angular.module("owsWalletPlugin").run(["gettextCatalog",function(gettextCatalog){}]),angular.module("owsWalletPlugin.services").factory("coinbaseService",["$log","$state","$timeout","lodash","gettextCatalog","popupService","owsWalletPlugin.api.coinbase.Coinbase",function($log,$state,$timeout,lodash,gettextCatalog,popupService,Coinbase){function onCoinbaseLogin(err){err||available()}function available(){isAvailable=!0,lodash.each(availableCallbacks,function(x){$timeout(function(){return x(root.coinbase)},1)}),availableCallbacks=[]}var root={},isAvailable=!1,availableCallbacks=[];return root.coinbase,owswallet.Plugin.onEvent("coinbase.logout",function(event){$state.go("onboarding.start"),"USER_REQUESTED"!=event.data.reason&&"UNAUTHORIZED_INVALID"!=event.data.reason&&$timeout(function(){popupService.showAlert(gettextCatalog.getString("Logged Out"),gettextCatalog.getString("Your account was logged out. Please login again."))})}),root.whenAvailable=function(cb){return root.coinbase||(root.coinbase=new Coinbase(onCoinbaseLogin)),isAvailable?cb(root.coinbase):void availableCallbacks.push(cb)},root}]),angular.module("owsWalletPlugin.services").factory("settingsService",["$log","lodash","owsWalletPluginClient.api.Settings",function($log,lodash,Settings){var root={};return owswallet.Plugin.ready(function(){Settings.get().then(function(settingsObj){lodash.assign(root,settingsObj)}).catch(function(error){$log.error("Could not get host app information: "+error)})}),root}]),angular.module("owsWalletPlugin.controllers").controller("AccountCtrl",["$scope","$timeout","$ionicPopup","$ionicModal","lodash","coinbaseService","gettextCatalog","popupService","stringUtils","owsWalletPluginClient.api.Constants","owsWalletPluginClient.api.Device",function($scope,$timeout,$ionicPopup,$ionicModal,lodash,coinbaseService,gettextCatalog,popupService,stringUtils,Constants,Device){function getTransactions(){account.getTransactions().then(function(transactions){$scope.transactions=transactions,$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get account transactions. Please try again."))})}var account,coinbase=coinbaseService.coinbase;$scope.isCordova=owswallet.Plugin.isCordova();var addressPopup;$scope.$on("$ionicView.beforeEnter",function(event,data){data.stateParams&&data.stateParams.id&&(account=coinbase.getAccountById(data.stateParams.id),$scope.account=account,getTransactions())}),$scope.format=stringUtils.format,$scope.trim=stringUtils.trim,$scope.openAddress=function(){account.createAddress().then(function(address){$scope.address=address,$scope.popupState="warning",addressPopup=$ionicPopup.show({cssClass:"popup-account-address",scope:$scope,templateUrl:"views/account/address/address.html"})})},$scope.closeAddress=function(){addressPopup.close()},$scope.showAddress=function(){$scope.popupState="qrcode"},$scope.shareAddress=function(){Device.socialShare($scope.address.address)},$scope.copyAddress=function(){$scope.popupState="copied",Device.copyToClipboard($scope.address.address),$timeout(function(){addressPopup.close()},1500)},$scope.openSend=function(){}}]),angular.module("owsWalletPlugin.controllers").controller("AccountsCtrl",["$scope","$timeout","coinbaseService","settingsService","stringUtils","owsWalletPluginClient.api.Constants",function($scope,$timeout,coinbaseService,settingsService,stringUtils,Constants){var coinbase=coinbaseService.coinbase;settingsService.language;$scope.$on("$ionicView.beforeEnter",function(event){$scope.accounts=coinbase.accounts,$scope.currency="USD",coinbase.updateAccountBalances($scope.currency).then(function(){$timeout(function(){$scope.$apply()})})}),$scope.format=stringUtils.format}]),angular.module("owsWalletPlugin.controllers").controller("AlertsCtrl",function(){}),angular.module("owsWalletPlugin.controllers").controller("BuySellAmountCtrl",["$rootScope","$scope","$ionicHistory","$state","lodash","coinbaseService","gettextCatalog","popupService","settingsService","stringUtils","owsWalletPluginClient.api.BN","owsWalletPluginClient.api.Constants",function($rootScope,$scope,$ionicHistory,$state,lodash,coinbaseService,gettextCatalog,popupService,settingsService,stringUtils,BN,Constants){var coinbase=coinbaseService.coinbase,language=settingsService.language,keypadCurrencies=["USD"],actionMap={buy:{title:gettextCatalog.getString("Buy"),button:gettextCatalog.getString("Preview Buy"),defaultPayMethodType:"bank"},sell:{title:gettextCatalog.getString("Sell"),button:gettextCatalog.getString("Preview Sell"),defaultPayMethodType:"account"}};$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.action=$ionicHistory.currentView().stateParams.action,$scope.accountId=$ionicHistory.currentView().stateParams.accountId;var selectedId=$ionicHistory.currentView().stateParams.paymentMethodId;$scope.account=coinbase.getAccountById($scope.accountId);var currency=$scope.account.currency.code;$scope.title=actionMap[$scope.action].title+" "+coinbase.getCurrencyByCode(currency).name,$scope.button=actionMap[$scope.action].button,coinbase.getPaymentMethods().then(function(paymentMethods){var paymentMethod;(paymentMethod=selectedId?lodash.find(paymentMethods,function(m){return m.id==selectedId}):lodash.find(paymentMethods,function(m){return m.type==actionMap[$scope.action].defaultPayMethodType}))||(paymentMethod=paymentMethods[0]);var limit;if("buy"==$scope.action){limit="Max: "+stringUtils.format(paymentMethod.limits.buy.amount,paymentMethod.limits.buy.currency,{language:language}).localized_u}$scope.paymentMethod={id:paymentMethod.id,name:paymentMethod.name,limit:limit,type:paymentMethod.type+"-"+paymentMethod.currency},$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get payment methods. Please try again."))}),keypadCurrencies.push(currency),coinbase.exchangeRates("USD").then(function(rates){$scope.keypadConfig={language:language,lengthExpressionLimit:9,currencies:keypadCurrencies,usdRates:rates,value:{amount:0,currency:$scope.account.balance.currency}},$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get exchange rates. Please try again."))})}),$rootScope.$on("Local/KeypadState",function(e,keypadState){$scope.keypad=keypadState}),$scope.format=stringUtils.format,$scope.isCryptoCurrency=function(currency){return Constants.isCryptoCurrency(currency)},$scope.close=function(){$ionicHistory.goBack()},$scope.toggleCurrency=function(){$scope.keypadConfig={currencyIndex:$scope.keypad.nextCurrencyIndex}},$scope.setAmountOfAvailable=function(percentage){$scope.keypadConfig={value:{amount:BN.multiply($scope.account.balance.amount,percentage),currency:$scope.account.balance.currency}}},$scope.goPreview=function(){$scope.account.buyRequest({amount:$scope.keypad.amount,currency:$scope.keypad.currency,paymentMethodId:$scope.paymentMethod.id,commit:!1}).then(function(order){$state.go("tabs.buy-sell-preview",{accountId:$scope.accountId,orderId:order.id})}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Could not create "+$scope.action+" order"),gettextCatalog.getString(error.message))})}}]),angular.module("owsWalletPlugin.controllers").controller("BuySellPreviewCtrl",["$rootScope","$scope","$state","coinbaseService","gettextCatalog","popupService","settingsService","stringUtils",function($rootScope,$scope,$state,coinbaseService,gettextCatalog,popupService,settingsService,stringUtils){var coinbase=coinbaseService.coinbase,actionMap=(settingsService.language,{buy:{title:gettextCatalog.getString("Confirm Buy"),button:gettextCatalog.getString("Confirm Buy")},sell:{title:gettextCatalog.getString("Confirm Sell"),button:gettextCatalog.getString("Confirm Sell")}});$scope.$on("$ionicView.beforeEnter",function(event,data){var accountId=data.stateParams.accountId,orderId=data.stateParams.orderId,account=coinbase.getAccountById(accountId);$scope.order=account.getOrderById(orderId),$scope.order.getPaymentMethod().then(function(paymentMethod){$scope.paymentMethod=paymentMethod,$scope.$apply()}),$scope.title=actionMap[$scope.order.kind].title,$scope.button=actionMap[$scope.order.kind].button}),$scope.format=stringUtils.format,$scope.trim=stringUtils.trim,$scope.confirm=function(){$state.go("tabs.buy-sell-confirm",$scope.order)}}]),angular.module("owsWalletPlugin.controllers").controller("BuyCtrl",["$scope","$log","$state","$timeout","$ionicModal","lodash","coinbaseService","popupService","externalLinkService",function($scope,$log,$state,$timeout,$ionicModal,lodash,coinbaseService,popupService,externalLinkService){var amount,currency,showErrorAndBack=function(err){$scope.sendStatus="",$log.error(err),err=err.errors?err.errors[0].message:err,popupService.showAlert("Error",err,function(){})},showError=function(err){$scope.sendStatus="",$log.error(err),err=err.errors?err.errors[0].message:err,popupService.showAlert("Error",err)},statusChangeHandler=function(processName,showName,isOn){$log.debug("statusChangeHandler: ",processName,showName,isOn),"buyingBitcoin"!=processName||isOn?showName&&($scope.sendStatus=showName):($scope.sendStatus="success",$timeout(function(){$scope.$digest()},100))},processPaymentInfo=function(){coinbaseService.init(function(err,res){if(err)return void showErrorAndBack(err);coinbaseService.buyPrice(coinbaseService.getAvailableCurrency(),function(err,b){$scope.buyPrice=b.data||null}),$scope.paymentMethods=[],$scope.selectedPaymentMethodId={value:null},coinbaseService.getPaymentMethods(function(err,p){if(err)return void showErrorAndBack(err);for(var hasPrimary,pm,i=0;i<p.data.length;i++)pm=p.data[i],pm.allow_buy&&$scope.paymentMethods.push(pm),pm.allow_buy&&pm.primary_buy&&(hasPrimary=!0,$scope.selectedPaymentMethodId.value=pm.id);if(lodash.isEmpty($scope.paymentMethods)){return void externalLinkService.open("https://support.coinbase.com/customer/portal/articles/1148716-payment-methods-for-us-customers",!0,null,"No payment method available to buy","More info","Go Back",function(){})}hasPrimary||($scope.selectedPaymentMethodId.value=$scope.paymentMethods[0].id),$scope.buyRequest()})})};$scope.$on("$ionicView.beforeLeave",function(event,data){}),$scope.$on("$ionicView.enter",function(event,data){}),$scope.$on("$ionicView.beforeEnter",function(event,data){if($scope.isFiat="BTC"!=data.stateParams.currency,amount=data.stateParams.amount,currency=data.stateParams.currency,$scope.network=coinbaseService.getNetwork(),lodash.isEmpty($scope.wallets))return void showErrorAndBack("No wallets available");$scope.onWalletSelect($scope.wallets[0])}),$scope.buyRequest=function(){coinbaseService.init(function(err,res){if(err)return void showErrorAndBack(err);var accountId=res.accountId,dataSrc={amount:amount,currency:currency,payment_method:$scope.selectedPaymentMethodId.value,quote:!0};coinbaseService.buyRequest(accountId,dataSrc,function(err,data){if(err)return void showErrorAndBack(err);$scope.buyRequestInfo=data.data,$timeout(function(){$scope.$apply()},100)})})},$scope.buyConfirm=function(){var message="Buy bitcoin for "+$scope.amountUnitStr;popupService.showConfirm(null,message,"Confirm","Cancel",function(ok){ok&&(ongoingProcess.set("buyingBitcoin",!0,statusChangeHandler),coinbaseService.init(function(err,res){if(err)return void showError(err);var accountId=res.accountId,dataSrc={amount:amount,currency:currency,payment_method:$scope.selectedPaymentMethodId.value,commit:!0};coinbaseService.buyRequest(accountId,dataSrc,function(err,b){if(err)return void showError(err);var processBuyTx=function(tx){if(!tx)return void showError("Transaction not found");coinbaseService.getTransaction(accountId,tx.id,function(err,updatedTx){if(err)return void showError(err)})},_processBuyOrder=function(){coinbaseService.getBuyOrder(accountId,b.data.id,function(err,buyResp){if(err)return void showError(err);var tx=buyResp.data?buyResp.data.transaction:null;tx&&tx.id?processBuyTx(tx):$timeout(function(){_processBuyOrder()},5e3)})};$timeout(function(){var tx=b.data?b.data.transaction:null;tx&&tx.id?processBuyTx(tx):_processBuyOrder()},8e3)})}))})},$scope.showWalletSelector=function(){$scope.walletSelectorTitle="Receive in",$scope.showWallets=!0},$scope.onWalletSelect=function(wallet){$scope.wallet=wallet,amount=(parsedAmount.amountSat/1e8).toFixed(8),currency="BTC",$scope.amountUnitStr=parsedAmount.amountUnitStr,coinbaseService.checkEnoughFundsForFee(amount,function(err){if(err)return void showErrorAndBack(err);processPaymentInfo()})},$scope.goBackHome=function(){$scope.sendStatus="",$state.go("tabs.home").then(function(){$state.transitionTo("tabs.buyandsell.coinbase")})}}]),angular.module("owsWalletPlugin.controllers").controller("LinkedAccountsCtrl",["$scope","$ionicHistory","coinbaseService","gettextCatalog","lodash","popupService","settingsService","stringUtils",function($scope,$ionicHistory,coinbaseService,gettextCatalog,lodash,popupService,settingsService,stringUtils){var accountId,currency,coinbase=coinbaseService.coinbase,language=settingsService.language;$scope.$on("$ionicView.beforeEnter",function(event,data){$scope.action=data.stateParams.action,$scope.selectedId=data.stateParams.paymentMethodId,accountId=data.stateParams.accountId,currency=coinbase.getAccountById(accountId).currency.code,coinbase.getPaymentMethods().then(function(methods){"buy"==$scope.action?$scope.methods=lodash.filter(methods,function(m){return"account"!=m.type&&"card"!=m.type}):$scope.methods=methods,$scope.methods=lodash.map($scope.methods,function(m){if(m.limits.buy.amount){var amount=stringUtils.format(m.limits.buy.amount,m.limits.buy.currency,{language:language});"account"!=m.type&&(m.limit="Max: "+amount.localized_u)}return m}),$scope.$apply()}).catch(function(error){popupService.showAlert(gettextCatalog.getString("Uh oh!"),gettextCatalog.getString("Could not get payment methods. Please try again."))})}),$scope.select=function(method){$ionicHistory.backView().stateParams={action:$scope.action,accountId:accountId,paymentMethodId:method.id},$ionicHistory.goBack()}}]),angular.module("owsWalletPlugin.controllers").controller("LoginCtrl",["$scope","$log","$timeout","$state","$ionicModal","$ionicHistory","gettextCatalog","popupService","externalLinkService","coinbaseService","owsWalletPluginClient.api.Utils",function($scope,$log,$timeout,$state,$ionicModal,$ionicHistory,gettextCatalog,popupService,externalLinkService,coinbaseService,Utils){function openAuthenticateWindow(){function code(str){var code=null,idxCode=str.indexOf("code=");return idxCode>=0&&(code=str.substring(idxCode+5),code.indexOf("&")>=0&&(code=code.substring(0,code.indexOf("&")))),code}if(isNodeWebKit){require("nw.gui").Window.open(coinbase.urls.oauthCodeUrl,{focus:!0,position:"center"},function(authenticateWindow){authenticateWindow.on("loaded",function(){var oauthCode=code(authenticateWindow.window.location.search);oauthCode&&(authenticateWindow.window.close(),login(oauthCode))})})}else externalLinkService.open(coinbase.urls.oauthCodeUrl)}function openModal(){$ionicModal.fromTemplateUrl("views/login/form/form.html",{scope:$scope}).then(function(modal){$scope.formData.oauthCode="",$scope.loginModal=modal,$scope.loginModal.show()}),$scope.cancel=function(){$scope.loginModal.remove(),$timeout(function(){$state.go("onboarding.start")},200)},$scope.submit=function(){coinbase.login($scope.formData.oauthCode,function(err){if(err)return showError(err);$scope.loginModal.remove(),$timeout(function(){$state.go("tabs.prices")},200)})}}function closeModal(){$scope.loginModal.remove()}function login(oauthCode){coinbase.login(oauthCode,function(err){if(err)return showError(err);closeModal(),$timeout(function(){$state.go("tabs.prices")},200)})}function showError(err){return $log.error("Could not authenticate with Coinbase: "+err.message),popupService.showAlert(gettextCatalog.getString("Could not login to Coinbase"),gettextCatalog.getString("An error occurred while trying to authenticate with Coinbase. Please try again."),function(){$scope.formData.oauthCode=""})}var isCordova=owswallet.Plugin.isCordova(),isNodeWebKit=owswallet.Plugin.isNodeWebKit(),coinbase=coinbaseService.coinbase;$scope.allowCodeEntry=!isCordova,$scope.formData={oauthCode:""},$scope.$on("$ionicView.enter",function(event,data){openModal(),openAuthenticateWindow()}),owswallet.Plugin.onEvent("incoming-data",function(event){if(!(event.data&&event.data.indexOf("://coinbase")<0)){var oauthCode=Utils.getUrlParameterByName(event.data,"code");oauthCode&&oauthCode.length>0&&login(oauthCode)}})}]),angular.module("owsWalletPlugin.directives").directive("hideTabs",["$rootScope","$timeout",function($rootScope,$timeout){return{link:function(scope,elem,attrs,ctrl){scope.$on("$ionicView.beforeEnter",function(event,data){attrs.hideTabs&&"true"!=attrs.hideTabs?$rootScope.hideTabs="":$rootScope.hideTabs="tabs-item-hide"})}}}]),angular.module("owsWalletPlugin.directives").directive("showTabs",["$rootScope","$timeout",function($rootScope,$timeout){return{link:function(scope,elem,attrs,ctrl){scope.$on("$ionicView.enter",function(event,data){attrs.showTabs&&"true"!=attrs.showTabs?$rootScope.hideTabs="tabs-item-hide":$rootScope.hideTabs=""})}}}]),angular.module("owsWalletPlugin.controllers").controller("TabsCtrl",["$scope",function($scope){}]),angular.module("owsWalletPlugin.controllers").controller("PricesCtrl",["$scope","$timeout","$log","$ionicScrollDelegate","lodash","stringUtils","coinbaseService","settingsService","owsWalletPluginClient.api.Constants",function($scope,$timeout,$log,$ionicScrollDelegate,lodash,stringUtils,coinbaseService,settingsService,Constants){function init(){$scope.currency=currency,$scope.period="day",$scope.amountGroupOpacity=1,$scope.titleOpacity=0,getAccountsTotalBalance(),updateData()}function getAccountsTotalBalance(){var decimals=Constants.currencyMap(currency,"decimals"),totalBalance=(Constants.currencyMap(currency,"symbol"),0);lodash.forEach(coinbase.accounts,function(account){account.getBalance(currency).then(function(balance){totalBalance+=balance,$scope.totalBalance=$scope.format(totalBalance,currency,{decimals:decimals}).localized_u}).catch(function(error){$log.error(error)})})}function updateData(){getData().then(function(data){$scope.currencies=data.currencies,$scope.$apply(),dataUpdater=$timeout(function(){updateData()},DATA_UPDATE_FREQUENCY)})}function getData(){return new Promise(function(resolve,reject){coinbase.spotPrice().then(function(spotPrice){spotPrice=lodash.pickBy(spotPrice,function(value,key){return void 0==value.error||($log.error("Could not spot price for "+key+": "+value.error),!1)});var currencies=lodash.map(Object.keys(spotPrice),function(k){var decimals=Constants.currencyMap(spotPrice[k].currency,"decimals");return spotPrice[k].pair=spotPrice[k].base+"-"+spotPrice[k].currency,spotPrice[k].amount=stringUtils.float(spotPrice[k].amount),spotPrice[k].symbol=Constants.currencyMap(spotPrice[k].currency,"symbol"),spotPrice[k].decimals=decimals,spotPrice[k].color=coinbase.getAccountByCurrencyCode(spotPrice[k].base).currency.color,spotPrice[k].sort=lodash.find(coinbase.currencies,function(c){return c.code==spotPrice[k].base}).sort,spotPrice[k]});return lodash.sortBy(currencies,function(c){return c.sort})}).then(function(currencies){var count=currencies.length;lodash.forEach(currencies,function(currency){coinbase.historicPrice(currency.pair,$scope.period).then(function(data){var periodPrice=stringUtils.float(data.prices[data.prices.length-1].price);if(currency.amountChange=currency.amount-periodPrice,currency.percentChange=Math.abs(100*currency.amountChange/currency.amount),0==--count)return resolve({currencies:currencies})})})}).catch(function(error){$log.error("Could not get Coinbase data: "+error)})})}var dataUpdater,coinbase=coinbaseService.coinbase,currency="USD",DATA_UPDATE_FREQUENCY=(settingsService.language,3e4);$scope.$on("$ionicView.beforeEnter",function(event,data){init()}),$scope.$on("$ionicView.beforeLeave",function(event){$timeout.cancel(dataUpdater)}),$scope.onScroll=function(){var position=$ionicScrollDelegate.$getByHandle("cards").getScrollPosition().top;$scope.amountGroupOpacity=1-.01*position,position<=0?($scope.headerHeight=216+Math.abs(position)+"px",$scope.headerTop="0px"):($scope.headerHeight="216px",$scope.headerTop=-1.5*position+"px"),$scope.titleOpacity=position<130?0:.2*(position-130),$scope.$apply()},$scope.format=stringUtils.format}]),angular.module("owsWalletPlugin.controllers").controller("SellCtrl",["$scope","$log","$state","$timeout","$ionicHistory","$ionicScrollDelegate","$ionicConfig","lodash","coinbaseService","popupService","profileService","ongoingProcess","walletService","appConfigService","configService","txFormatService","externalLinkService",function($scope,$log,$state,$timeout,$ionicHistory,$ionicScrollDelegate,$ionicConfig,lodash,coinbaseService,popupService,profileService,ongoingProcess,walletService,appConfigService,configService,txFormatService,externalLinkService){var amount,currency,showErrorAndBack=function(err){$scope.sendStatus="",$log.error(err),err=err.errors?err.errors[0].message:err,popupService.showAlert("Error",err,function(){$ionicHistory.goBack()})},showError=function(err){$scope.sendStatus="",$log.error(err),err=err.errors?err.errors[0].message:err,popupService.showAlert("Error",err)},publishAndSign=function(wallet,txp,onSendStatusChange,cb){if(!wallet.canSign()&&!wallet.isPrivKeyExternal()){var err="No signing proposal: No private key";return $log.info(err),cb(err)}walletService.publishAndSign(wallet,txp,function(err,txp){return err?cb(err):cb(null,txp)},onSendStatusChange)},processPaymentInfo=function(){ongoingProcess.set("connectingCoinbase",!0),coinbaseService.init(function(err,res){if(err)return ongoingProcess.set("connectingCoinbase",!1),void showErrorAndBack(coinbaseService.getErrorsAsString(err.errors));coinbaseService.sellPrice(coinbaseService.getAvailableCurrency(),function(err,s){$scope.sellPrice=s.data||null}),$scope.paymentMethods=[],$scope.selectedPaymentMethodId={value:null},coinbaseService.getPaymentMethods(function(err,p){if(err)return ongoingProcess.set("connectingCoinbase",!1),void showErrorAndBack(coinbaseService.getErrorsAsString(err.errors));for(var hasPrimary,pm,i=0;i<p.data.length;i++)pm=p.data[i],pm.allow_sell&&$scope.paymentMethods.push(pm),pm.allow_sell&&pm.primary_sell&&(hasPrimary=!0,$scope.selectedPaymentMethodId.value=pm.id);if(lodash.isEmpty($scope.paymentMethods)){ongoingProcess.set("connectingCoinbase",!1);return void externalLinkService.open("https://support.coinbase.com/customer/portal/articles/1148716-payment-methods-for-us-customers",!0,null,"No payment method available to sell","More info","Go Back",function(){$ionicHistory.goBack(-2)})}hasPrimary||($scope.selectedPaymentMethodId.value=$scope.paymentMethods[0].id),$scope.sellRequest()})})},checkTransaction=lodash.throttle(function(count,txp){$log.warn("Check if transaction has been received by Coinbase. Try "+count+"/5");var amountBTC=(1e-8*txp.amount).toFixed(8);coinbaseService.init(function(err,res){if(err)return $log.error(err),void checkTransaction(count,txp);var accountId=res.accountId,sellPrice=null;coinbaseService.sellPrice(coinbaseService.getAvailableCurrency(),function(err,sell){if(err)return $log.debug(coinbaseService.getErrorsAsString(err.errors)),void checkTransaction(count,txp);sellPrice=sell.data,coinbaseService.getTransactions(accountId,function(err,ctxs){if(err)return $log.debug(coinbaseService.getErrorsAsString(err.errors)),void checkTransaction(count,txp);for(var ctx,coinbaseTransactions=ctxs.data,txFound=!1,i=0;i<coinbaseTransactions.length;i++)if(ctx=coinbaseTransactions[i],"send"==ctx.type&&ctx.from&&ctx.amount.amount==amountBTC)return $log.warn("Transaction found!",ctx),txFound=!0,$log.debug("Saving transaction to process later..."),ctx.payment_method=$scope.selectedPaymentMethodId.value,ctx.status="pending",ctx.price_sensitivity=$scope.selectedPriceSensitivity.data,ctx.sell_price_amount=sellPrice?sellPrice.amount:"",ctx.sell_price_currency=sellPrice?sellPrice.currency:"USD",ctx.description=appConfigService.nameCase+" Wallet: "+$scope.wallet.name,void coinbaseService.savePendingTransaction(ctx,null,function(err){ongoingProcess.set("sellingBitcoin",!1,statusChangeHandler),err&&$log.debug(coinbaseService.getErrorsAsString(err.errors))});if(!txFound){if($log.warn("Transaction not found in Coinbase. Will try 5 times..."),!(count<5))return ongoingProcess.set("sellingBitcoin",!1,statusChangeHandler),void showError("No transaction found");checkTransaction(count+1,txp)}})})})},8e3,{leading:!0}),statusChangeHandler=function(processName,showName,isOn){$log.debug("statusChangeHandler: ",processName,showName,isOn),"sellingBitcoin"!=processName||isOn?showName&&($scope.sendStatus=showName):($scope.sendStatus="success",$timeout(function(){$scope.$digest()},100))};$scope.$on("$ionicView.beforeLeave",function(event,data){$ionicConfig.views.swipeBackEnabled(!0)}),$scope.$on("$ionicView.enter",function(event,data){$ionicConfig.views.swipeBackEnabled(!1)}),$scope.$on("$ionicView.beforeEnter",function(event,data){if($scope.isFiat="BTC"!=data.stateParams.currency,amount=data.stateParams.amount,currency=data.stateParams.currency,$scope.priceSensitivity=coinbaseService.priceSensitivity,$scope.selectedPriceSensitivity={data:coinbaseService.selectedPriceSensitivity},$scope.network=coinbaseService.getNetwork(),$scope.wallets=profileService.getWallets({m:1,onlyComplete:!0,network:$scope.network,hasFunds:!0,coin:"btc"}),lodash.isEmpty($scope.wallets))return void showErrorAndBack("No wallet available to operate with Coinbase");$scope.onWalletSelect($scope.wallets[0])}),$scope.sellRequest=function(){ongoingProcess.set("connectingCoinbase",!0),coinbaseService.init(function(err,res){if(err)return ongoingProcess.set("connectingCoinbase",!1),void showErrorAndBack(coinbaseService.getErrorsAsString(err.errors));var accountId=res.accountId,dataSrc={amount:amount,currency:currency,payment_method:$scope.selectedPaymentMethodId.value,quote:!0};coinbaseService.sellRequest(accountId,dataSrc,function(err,data){if(ongoingProcess.set("connectingCoinbase",!1),err)return void showErrorAndBack(coinbaseService.getErrorsAsString(err.errors));$scope.sellRequestInfo=data.data,$timeout(function(){$scope.$apply()},100)})})},$scope.sellConfirm=function(){var config=configService.getSync(),configWallet=config.wallet,walletSettings=configWallet.settings,message="Selling bitcoin for "+amount+" "+currency;popupService.showConfirm(null,message,"Confirm","Cancel",function(ok){ok&&(ongoingProcess.set("sellingBitcoin",!0,statusChangeHandler),coinbaseService.init(function(err,res){if(err)return ongoingProcess.set("sellingBitcoin",!1,statusChangeHandler),void showError(coinbaseService.getErrorsAsString(err.errors));var accountId=res.accountId,dataSrc={name:"Received from "+appConfigService.nameCase};coinbaseService.createAddress(accountId,dataSrc,function(err,data){if(err)return ongoingProcess.set("sellingBitcoin",!1,statusChangeHandler),void showError(coinbaseService.getErrorsAsString(err.errors));var outputs=[],toAddress=data.data.address,amountSat=parseInt((1e8*$scope.sellRequestInfo.amount.amount).toFixed(0)),comment="Sell bitcoin (Coinbase)";outputs.push({toAddress:toAddress,amount:amountSat,message:comment});var txp={toAddress:toAddress,amount:amountSat,outputs:outputs,message:comment,payProUrl:null,excludeUnconfirmedUtxos:!configWallet.spendUnconfirmed,feeLevel:walletSettings.feeLevel||"normal"};walletService.createTx($scope.wallet,txp,function(err,ctxp){if(err)return ongoingProcess.set("sellingBitcoin",!1,statusChangeHandler),void showError(err);$log.debug("Transaction created."),publishAndSign($scope.wallet,ctxp,function(){},function(err,txSent){if(err)return ongoingProcess.set("sellingBitcoin",!1,statusChangeHandler),void showError(err);$log.debug("Transaction broadcasted. Wait for Coinbase confirmation..."),checkTransaction(1,txSent)})})})}))})},$scope.showWalletSelector=function(){$scope.walletSelectorTitle="Sell From",$scope.showWallets=!0},$scope.onWalletSelect=function(wallet){$scope.wallet=wallet;var parsedAmount=txFormatService.parseAmount("btc",amount,currency);amount=parsedAmount.amount,currency=parsedAmount.currency,$scope.amountUnitStr=parsedAmount.amountUnitStr,processPaymentInfo()},$scope.goBackHome=function(){$scope.sendStatus="",$ionicHistory.nextViewOptions({disableAnimate:!0,historyRoot:!0}),$ionicHistory.clearHistory(),$state.go("tabs.home").then(function(){$state.transitionTo("tabs.buyandsell.coinbase")})}}]),angular.module("owsWalletPlugin.controllers").controller("SettingsCtrl",["$scope","$timeout","$state","$ionicHistory","gettextCatalog","popupService","externalLinkService","coinbaseService","owsWalletPluginClient.api.Session",function($scope,$timeout,$state,$ionicHistory,gettextCatalog,popupService,externalLinkService,coinbaseService,Session){
var coinbase=coinbaseService.coinbase;Session.getInstance();$scope.$on("$ionicView.beforeEnter",function(event,data){coinbase.getCurrentUser().then(function(user){$scope.user=user,$scope.$apply()})}),$scope.externalLinks={support:{itemName:gettextCatalog.getString("Support"),title:gettextCatalog.getString("Get Support"),message:gettextCatalog.getString("Get support from Coinbase."),okText:gettextCatalog.getString("Visit Website"),cancelText:gettextCatalog.getString("Go Back"),url:coinbase.urls.supportUrl},privacy:{itemName:gettextCatalog.getString("Privacy"),title:gettextCatalog.getString("View Privacy Policy"),message:gettextCatalog.getString("Read the Coinbase privacy policy."),okText:gettextCatalog.getString("Visit Website"),cancelText:gettextCatalog.getString("Go Back"),url:coinbase.urls.privacyUrl}},$scope.openExternalLink=function(link){externalLinkService.open(link.url,!0,link.title,link.message,link.okText,link.cancelText)},$scope.logout=function(){var message=gettextCatalog.getString("Are you sure you would like to log out of your Coinbase account?");popupService.showConfirm("Coinbase",message,null,null,function(ok){ok&&coinbase.logout(function(){$ionicHistory.clearHistory(),$timeout(function(){$state.go("onboarding.start")},100)})})}}]),angular.module("owsWalletPlugin.controllers").controller("StartCtrl",["$scope","$ionicHistory","$log","$state","$timeout","lodash","gettextCatalog","popupService","externalLinkService","stringUtils","coinbaseService","settingsService","owsWalletPluginClient.api.Constants",function($scope,$ionicHistory,$log,$state,$timeout,lodash,gettextCatalog,popupService,externalLinkService,stringUtils,coinbaseService,settingsService,Constants){function updateFeatureCurrency(){getData().then(function(data){if(data.currencies){$scope.currencies=data.currencies;var currency=$scope.currencies[$scope.selectedCurrency];if($scope.featureLeft={value:stringUtils.format(currency.amount,currency.currency).localized_u,label:currency.label+" price"},data.periodPrice){var periodPrice=data.periodPrice;"all"==$scope.timeFrames[$scope.selectedTimeFrame].period&&(periodPrice=0);var amountChange=stringUtils.float(currency.amount)-stringUtils.float(periodPrice);$scope.featureRight={up:amountChange>=0,value:stringUtils.format(amountChange,currency.currency).localized_u,label:$scope.timeFrames[$scope.selectedTimeFrame].label},$scope.$apply(),dataUpdater=$timeout(function(){updateFeatureCurrency()},DATA_UPDATE_FREQUENCY)}}})}function getData(){return coinbase.spotPrice().then(function(spotPrice){spotPrice=lodash.pickBy(spotPrice,function(value,key){return void 0==value.error||($log.error("Could not spot price for "+key+": "+value.error),!1)});var currencies=lodash.map(Object.keys(spotPrice),function(k){return spotPrice[k].pair=spotPrice[k].base+"-"+spotPrice[k].currency,spotPrice[k].amount=stringUtils.float(spotPrice[k].amount),spotPrice[k].symbol=Constants.currencyMap(spotPrice[k].currency,"symbol"),spotPrice[k].decimals=Constants.currencyMap(spotPrice[k].currency,"decimals"),spotPrice[k].sort=lodash.find(coinbase.currencies,function(c){return c.code==spotPrice[k].base}).sort,spotPrice[k]});return lodash.sortBy(currencies,function(c){return c.sort})}).then(function(currencies){var currencyPair=currencies[$scope.selectedCurrency].pair,period=$scope.timeFrames[$scope.selectedTimeFrame].period;return coinbase.historicPrice(currencyPair,period).then(function(data){return{currencies:currencies,periodPrice:data.prices[data.prices.length-1].price}})}).catch(function(error){$log.error("Could not get Coinbase data: "+error)})}var dataUpdater,coinbase=coinbaseService.coinbase,DATA_UPDATE_FREQUENCY=(settingsService.language,3e4);$scope.timeFrames=[{button:"1H",label:gettextCatalog.getString("this hour"),period:"hour"},{button:"1D",label:gettextCatalog.getString("today"),period:"day"},{button:"1W",label:gettextCatalog.getString("this week"),period:"week"},{button:"1M",label:gettextCatalog.getString("this month"),period:"month"},{button:"1Y",label:gettextCatalog.getString("this year"),period:"year"},{button:"ALL",period:"all",label:gettextCatalog.getString("all time")}],$scope.$on("$ionicView.beforeEnter",function(event){$ionicHistory.clearHistory(),$ionicHistory.clearCache(),$scope.selectedCurrency=0,$scope.selectedTimeFrame=lodash.findIndex($scope.timeFrames,["period","year"]),updateFeatureCurrency()}),$scope.$on("$ionicView.beforeLeave",function(event){$timeout.cancel(dataUpdater)}),$scope.login=function(){$state.go("onboarding.login")},$scope.openSignupWindow=function(){var url=coinbase.urls.signupUrl;externalLinkService.open(url,!0,"Sign Up for Coinbase","This will open Coinbase.com, where you can create an account.","Go to Coinbase","Back")},$scope.selectCurrency=function(index){$scope.selectedCurrency=index,updateFeatureCurrency()},$scope.selectTimeFrame=function(index){$scope.selectedTimeFrame=index,updateFeatureCurrency()}}]);