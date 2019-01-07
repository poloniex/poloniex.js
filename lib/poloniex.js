module.exports = (function () {
  'use strict';

  // Module dependencies
  const crypto  = require('crypto');
  const request = require('request');
  const nonce   = require('nonce')();

  // Constants
  const version         = '1.0.0';
  const PUBLIC_API_URL  = 'https://poloniex.com/public';
  const PRIVATE_API_URL = 'https://poloniex.com/tradingApi';
  const TIMEOUT         = 60 * 1000;
  const USER_AGENT      = 'poloniex.js/' + version;
  // const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246';

  // Helper methods
  function joinCurrencies(currencyA, currencyB) {
    if (currencyB && typeof currencyB === 'string') {
      return currencyA + '_' + currencyB;
    }

    // If only one valid argument, then return the first
    return currencyA;
  }

  let authenticated = false;

  // Constructor
  function Poloniex(key, secret) {
    if (key && secret) {
      authenticated = true;
    }

    // Generate headers signed by this user's key and secret.
    // The secret is encapsulated and never exposed
    this._getPrivateHeaders = function (parameters) {
      if (!authenticated) {
        throw 'Poloniex: Error. API key and secret required';
      }

      // Convert to `arg1=foo&arg2=bar`
      const paramString = Object.keys(parameters).map(function (param) {
        return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
      }).join('&');

      const signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex');

      return {
        Key: key,
        Sign: signature
      };
    };
  }

  // In the past, requests failed with `Error: CERT_UNTRUSTED` unless
  // `Poloniex.STRICT_SSL` was set to `false`, but doing so should be avoided.
  Poloniex.STRICT_SSL = true;

  // Customisable timeout, in ms
  Poloniex.TIMEOUT = TIMEOUT;

  // Customisable user agent string
  Poloniex.USER_AGENT = USER_AGENT;

  // Prototype
  Poloniex.prototype = {
    constructor: Poloniex,

    // Make an API request
    _request: function (options, callback) {
      if (!('headers' in options)) {
        options.headers = {};
      }

      options.json = true;
      options.headers['User-Agent'] = Poloniex.USER_AGENT;
      options.strictSSL = Poloniex.STRICT_SSL;
      options.timeout = Poloniex.TIMEOUT;

      return new Promise(function (resolve, reject) {
        request(options, function (err, response, body) {
          // Empty response
          if (!err && (typeof body === 'undefined' || body === null)) {
            err = new Error('Empty response from remote server');
          }

          if (err) {
            reject(err);
          }

          else {
            resolve(body);
          }

          if (typeof callback === 'function') {
            callback(err, body);
          }
        });
      });
    },

    // Make a public API request
    _public: function (command, parameters, callback) {
      if (typeof parameters === 'function') {
        callback = parameters;
        parameters = {};
      }

      parameters || (parameters = {});
      parameters.command = command;
      
      const options = {
        method: 'GET',
        url: PUBLIC_API_URL,
        qs: parameters
      };

      options.qs.command = command;

      return this._request(options, callback);
    },

    // Make a private API request
    _private: function (command, parameters, callback) {
      if (typeof parameters === 'function') {
        callback = parameters;
        parameters = {};
      }

      parameters || (parameters = {});
      parameters.command = command;
      parameters.nonce = nonce();

      const options = {
        method: 'POST',
        url: PRIVATE_API_URL,
        form: parameters,
        headers: this._getPrivateHeaders(parameters)
      };

      return this._request(options, callback);
    },

    /////
    // PUBLIC METHODS

    returnTicker: function (callback) {
      return this._public('returnTicker', callback);
    },

    return24hVolume: function (callback) {
      return this._public('return24hVolume', callback);
    },

    returnOrderBook: function (currencyA, currencyB, callback) {
      if (typeof currencyB === 'function') {
        callback = currencyB;
        currencyB = null;
      }

      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._public('returnOrderBook', parameters, callback);
    },

    returnChartData: function (currencyA, currencyB, period, start, end, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        period: period,
        start: start,
        end: end
      };

      return this._public('returnChartData', parameters, callback);
    },

    returnCurrencies: function (callback) {
      return this._public('returnCurrencies', callback);
    },

    returnLoanOrders: function (currency, callback) {
      return this._public('returnLoanOrders', {currency: currency}, callback);
    },

    /////
    // PRIVATE METHODS

    returnBalances: function (callback) {
      return this._private('returnBalances', {}, callback);
    },

    returnCompleteBalances: function (account, callback) {
      const parameters = {};

      if (typeof account === 'function') {
        callback = account;
      }

      else if (account && typeof account === 'string') {
        parameters.account = account;
      }
      
      return this._private('returnCompleteBalances', parameters, callback);
    },

    returnDepositAddresses: function (callback) {
      return this._private('returnDepositAddresses', {}, callback);
    },

    generateNewAddress: function (currency, callback) {
      return this._private('generateNewAddress', {currency: currency}, callback);
    },

    returnDepositsWithdrawals: function (start, end, callback) {
      return this._private('returnDepositsWithdrawals', {start: start, end: end}, callback);
    },

    // can be called with `returnOpenOrders('all', callback)`
    returnOpenOrders: function (currencyA, currencyB, callback) {
      if (typeof currencyB === 'function') {
        callback = currencyB;
        currencyB = null;
      }

      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('returnOpenOrders', parameters, callback);
    },

    returnTradeHistory: function (currencyA, currencyB, start, end, callback) {
      let currencyPair;

      if (currencyA === 'all') { // shift all arguments by 1
        callback = end;
        end = start;
        start = currencyB;
        currencyPair = 'all';
      }

      else {
        currencyPair = joinCurrencies(currencyA, currencyB);
      }

      const parameters = {
        currencyPair: currencyPair
      };

      if (typeof start === 'function') {
        const now = Date.now();

        callback = start;
        parameters.start = now / 1000 - 60 * 60;
        parameters.end = now / 1000 + 60 * 60; // A buffer, in case client/server time out of sync
      }

      else {
        parameters.start = start;
        parameters.end = end;
      }

      if (authenticated) {
        return this._private('returnTradeHistory', parameters, callback);
      }

      else {
        return this._public('returnTradeHistory', parameters, callback);
      }
    },

    returnOrderTrades: function (orderNumber, callback) {
      const parameters = {
        orderNumber: orderNumber
      };

      return this._private('returnOrderTrades', parameters, callback);
    },

    returnOrderStatus: function (orderNumber, callback) {
      const parameters = {
        orderNumber: orderNumber
      };

      return this._private('returnOrderStatus', parameters, callback);
    },

    buy: function (currencyA, currencyB, rate, amount, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount
      };

      return this._private('buy', parameters, callback);
    },

    sell: function (currencyA, currencyB, rate, amount, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount
      };

      return this._private('sell', parameters, callback);
    },

    cancelOrder: function (currencyA, currencyB, orderNumber, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        orderNumber: orderNumber
      };

      return this._private('cancelOrder', parameters, callback);
    },

    moveOrder: function (orderNumber, rate, amount, callback) {
      const parameters = {
        orderNumber: orderNumber,
        rate: rate,
        amount: amount ? amount : null
      };

      return this._private('moveOrder', parameters, callback);
    },

    withdraw: function (currency, amount, address, callback) {
      const parameters = {
        currency: currency,
        amount: amount,
        address: address
      };

      return this._private('withdraw', parameters, callback);
    },

    returnFeeInfo: function (callback) {
      return this._private('returnFeeInfo', {}, callback);
    },

    returnAvailableAccountBalances: function (account, callback) {
      const parameters = {};

      if (typeof account === 'function') {
        callback = account;
      }

      else if (account && typeof account === 'string') {
        parameters.account = account;
      }
      
      return this._private('returnAvailableAccountBalances', parameters, callback);
    },

    returnTradableBalances: function (callback) {
      return this._private('returnTradableBalances', {}, callback);
    },

    transferBalance: function (currency, amount, fromAccount, toAccount, callback) {
      const parameters = {
        currency: currency,
        amount: amount,
        fromAccount: fromAccount,
        toAccount: toAccount
      };

      return this._private('transferBalance', parameters, callback);
    },

    returnMarginAccountSummary: function (callback) {
      return this._private('returnMarginAccountSummary', {}, callback);
    },

    marginBuy: function (currencyA, currencyB, rate, amount, lendingRate, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount,
        lendingRate: lendingRate ? lendingRate : null
      };

      return this._private('marginBuy', parameters, callback);
    },

    marginSell: function (currencyA, currencyB, rate, amount, lendingRate, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount,
        lendingRate: lendingRate ? lendingRate : null
      };

      return this._private('marginSell', parameters, callback);
    },

    getMarginPosition: function (currencyA, currencyB, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('getMarginPosition', parameters, callback);
    },

    closeMarginPosition: function (currencyA, currencyB, callback) {
      const parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('closeMarginPosition', parameters, callback);
    },

    createLoanOffer: function (currency, amount, duration, autoRenew, lendingRate, callback) {
      const parameters = {
        currency: currency,
        amount: amount,
        duration: duration,
        autoRenew: autoRenew,
        lendingRate: lendingRate
      };

      return this._private('createLoanOffer', parameters, callback);
    },

    cancelLoanOffer: function (orderNumber, callback) {
      const parameters = {
        orderNumber: orderNumber
      };

      return this._private('cancelLoanOffer', parameters, callback);
    },

    returnOpenLoanOffers: function (callback) {
      return this._private('returnOpenLoanOffers', {}, callback);
    },

    returnActiveLoans: function (callback) {
      return this._private('returnActiveLoans', {}, callback);
    },

    returnLendingHistory: function (start, end, limit, callback) {
      const parameters = {
        start: start,
        end: end,
        limit: limit
      };

      return this._private('returnLendingHistory', parameters, callback);
    },

    toggleAutoRenew: function (orderNumber, callback) {
      return this._private('toggleAutoRenew', {orderNumber: orderNumber}, callback);
    }
  };

  // Backwards Compatibility
  Poloniex.prototype.getTicker = Poloniex.prototype.returnTicker;
  Poloniex.prototype.get24hVolume = Poloniex.prototype.return24hVolume;
  Poloniex.prototype.getOrderBook = Poloniex.prototype.returnOrderBook;
  Poloniex.prototype.getTradeHistory = Poloniex.prototype.returnTradeHistory;
  Poloniex.prototype.getChartData = Poloniex.prototype.returnChartData;
  Poloniex.prototype.myBalances = Poloniex.prototype.returnBalances;
  Poloniex.prototype.myOpenOrders = Poloniex.prototype.returnOpenOrders;
  Poloniex.prototype.myTradeHistory = Poloniex.prototype.returnTradeHistory;

  return Poloniex;
})();
