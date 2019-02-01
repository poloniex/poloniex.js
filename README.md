# poloniex.js

Node.js API client for the [Poloniex][poloniex] cryptocurrency exchange.

The client supports both public (unauthenticated) and private (authenticated) calls to the [Poloniex API][poloniex-api].

For private calls, the user secret is never exposed to other parts of the program or over the Web. The user key is sent as a header to the API, along with a signed request.

Repo home: [github.com/poloniex/poloniex.js][repo]


## License

MIT, open source. See LICENSE file.


## Install via NPM

    npm install poloniex.js


## Or clone from GitHub


    git clone https://github.com/poloniex/poloniex.js.git
    cd poloniex
    npm install


## Or download the latest zip

* [zip download][repo-zip]


## Import the module

    import Poloniex from 'poloniex.js';


Or `require` it:

    const Poloniex = require('poloniex.js');


Or, if not installed via NPM, then provide the path to lib/poloniex.js


## Create an instance of the client

If only public API calls are needed, then no API key or secret is required:

    const poloniex = new Poloniex();


Or, to use Poloniex's trading API, [your API key and secret][poloniex-keys] must be provided:

    const poloniex = new Poloniex('API_KEY', 'API_SECRET');


## Make API calls

All [Poloniex API][poloniex-api] methods are supported, with some name changes to avoid naming collisions.

Methods return a [`Promise`][promise] object that will resolve when the API response is received, or reject when an error is encountered:

    poloniex.method(arg1, arg2)
    .then(function (data) { console.log(data) })
    .catch(function (err) { console.error(err) });

For backwards-compatibility, methods also accept a callback function as their last argument, which can be used instead of the returned promise. The callback is passed two arguments, 1) An error object if there was an error, or otherwise `null`, and 2) A data object, which is the response from the API:

    poloniex.method(arg1, arg2, function (err, data) { ... });

For the most up-to-date Poloniex API documentation, see [poloniex.com/api][poloniex-api].


## Public API methods

These methods do not require a user key or secret.


### returnTicker()

Returns the ticker for all markets.

    poloniex.returnTicker()
    .then(console.log)
    .catch(console.error);


Example response:

    {
      "BTC_LTC": "0.026",
      "BTC_NXT": "0.00007600",
      ...
    }


### return24hVolume()

Returns the 24-hour volume for all markets, plus totals for primary currencies.

    poloniex.return24hVolume()
    .then(console.log)
    .catch(console.error);


Example response:

    {
      "BTC_LTC": {
        "BTC": "2.23248854",
        "LTC": "87.10381314"
      },
      
      "BTC_NXT": {
        "BTC": "0.981616",
        "NXT": "14145"
      },
      
      ...,
      
      "totalBTC": "81.89657704",
      "totalLTC": "78.52083806"
    }


### returnOrderBook(currencyA, [currencyB])

Returns the order book for a given market. If currency A is specified as `"all"` and currency B is not specified, then order books for all markets will be returned.

    poloniex.returnOrderBook('NXT', 'BTC')
    .then(console.log)
    .catch(console.error);


Example response:

    {
      "asks": [
        [0.00007600, 1164],
        [0.00007620, 1300],
        ...
      ],
      
      "bids": [
        [0.00006901, 200],
        [0.00006900, 408],
        ...
      ]
    }


### returnTradeHistory(currencyA, currencyB, [start], [end])

Returns the past 200 trades for a given market, or up to 50000 trades between a range specified in UNIX timestamps by the `start` and `end` parameters.

    poloniex.returnTradeHistory('BTC', 'ETH')
    .then(console.log)
    .catch(console.error);


Example response:

    [
      {
        globalTradeID: 394411584,
        tradeID: 45193152,
        date: '2018-10-19 18:31:21',
        type: 'sell',
        rate: '0.03136000',
        amount: '4.14926279',
        total: '0.13012088'
      },
      
      {
        globalTradeID: 394411489,
        tradeID: 45193150,
        date: '2018-10-19 18:30:58',
        type: 'sell',
        rate: '0.03135505',
        amount: '0.05757062',
        total: '0.00180512'
      },
      
      ...
    ]


### returnChartData(currencyA, currencyB, period, start, end)

Returns candlestick chart data. Candlestick `period` is one of `300`, `900`, `1800`, `7200`, `14400`, or `86400` seconds. The `start` and `end` are given in UNIX timestamp format and used to specify the date range for the data returned.

Example response:

    [
      {
        "date": 1405699200,
        "high": 0.0045388,
        "low": 0.00403001,
        "open": 0.00404545,
        "close": 0.00427592,
        "volume": 44.11655644,
        "quoteVolume": 10259.29079097,
        "weightedAverage": 0.00430015
      },
      
      ...
    ]


### returnCurrencies()

Returns information about all currencies supported on the platform.

Example response:

    {
      "1CR": {
        "maxDailyWithdrawal": 10000,
        "txFee": 0.01,
        "minConf": 3,
        "disabled": 0},
        "ABY": {
        "maxDailyWithdrawal": 10000000,
        "txFee": 0.01,
        "minConf": 8,
        "disabled": 0
      },
      ...
    }


### returnLoanOrders(currency)

Returns the list of loan offers and demands for a given currency.

Example response:

    {
      "offers": [
        {
          "rate": "0.00200000",
          "amount": "64.663057372",
          "rangeMin": 2,
          "rangeMax": 8
        },
        ...
      ],
      
      "demands": [
        {
          "rate": "0.00170000",
          "amount": "26.54848841",
          "rangeMin": 2,
          "rangeMax": 2
        },
        ...
      ]
    }



## Private, trading API methods

These methods require the user key and secret.

### returnBalances()

Returns all of your balances.

Example response:

    {
      "BTC": "0.59098578",
      "LTC": "3.31117268",
      ...
    }


### returnCompleteBalances(account)

If `account` is `null` or omitted, returns the complete balances for just your exchange account. If `account` is `"all"`, then it will include your margin and lending accounts.

Returns all of your balances, including available balance, balance on orders, and the estimated BTC value of your balance.

Example response:

    {
      "LTC": {
        "available": "5.015",
        "onOrders": "1.0025",
        "btcValue": "0.078"
      },
      "NXT": {
        "available": "17.21",
        "onOrders": "1.102",
        "btcValue": "0.018"
      },
      ...
    }


### returnDepositAddresses()

Returns all of your deposit addresses.

Example response:

    {
      "BTC": "19YqztHmspv3egyD6jQM3yn81x5t5krVdJ",
      "LTC": "LPgf9kjh1H1Vuh4XSaKhzBe8JHdou1WgUB",
      ...
    }


### generateNewAddress(currency)

Generates a new deposit address for the currency specified.

Example response:

    {
      "success": 1,
      "response": "CKXbbs1FAVbtEa396gJHSutmrdrBrhUMxe"
    }


### returnDepositsWithdrawals(start, end)

Returns your deposit and withdrawal history within a range, specified by `start` and `end`, both of which should be given as UNIX timestamps.

Example response:

    {
      "deposits": [
        {
          "currency": "BTC",
          "address": "...",
          "amount": "0.01006132",
          "confirmations": 10,
          "txid": "17f819a91369a9ff6c4a34216d434597cfc1b4a3d0489b46bd6f924137a47701",
          "timestamp": 1399305798,
          "status": "COMPLETE"
        },
        {
          "currency": "BTC",
          "address": "...",
          "amount": "0.00404104",
          "confirmations": 10,
          "txid": "7acb90965b252e55a894b535ef0b0b65f45821f2899e4a379d3e43799604695c",
          "timestamp": 1399245916,
          "status": "COMPLETE"
        }
      ],
      
      "withdrawals": [
        {
          "withdrawalNumber": 134933,
          "currency": "BTC",
          "address": "1N2i5n8DwTGzUq2Vmn9TUL8J1vdr1XBDFg",
          "amount": "5.00010000",
          "timestamp": 1399267904,
          "status": "COMPLETE: 36e483efa6aff9fd53a235177579d98451c4eb237c210e66cd2b9a2d4a988f8e",
          "ipAddress": "..."
        }
      ]
    }


### returnOpenOrders(currencyA, [currencyB])

Returns your open orders for a given market. If currency A is specified as `"all"` and currency B is not specified, then your open orders for all markets will be returned.

    poloniex.returnOpenOrders('NXT', 'BTC')
    .then(console.log)
    .catch(console.error)


Example response:

    [
      {
        "orderNumber": "120466",
        "type": "sell",
        "rate": "0.025",
        "amount": "100",
        "total": "2.5"
      },
      {
        "orderNumber": "120467",
        "type": "sell",
        "rate": "0.04",
        "amount": "100",
        "total": "4"
      },
      ...
    ]


### returnTradeHistory(currencyA, currencyB, start, end)

Returns your trades in a given market within a range, specified by `start` and `end`, both of which should be given as UNIX timestamps.
If no start and end are provided, returns the past 1 hour worth of trades.

    poloniex.returnTradeHistory('NXT', 'BTC', Date.now() / 1000 - 60 * 60, Date.now() / 1000)
    .then(console.log)
    .catch(console.error)


Example response:

    [
      {
        "date": "2014-02-10 04:23:23",
        "type": "buy",
        "rate": "0.00007600",
        "amount": "140",
        "total": "0.01064"
      },
      {
        "date": "2014-02-10 01:19:37",
        "type": "buy",
        "rate": "0.00007600",
        "amount": "655",
        "total": "0.04978"
      },
      ...
    ]


### returnOrderTrades(orderNumber)

Returns all trades involving the given order number.

Example response:

    [
      {
        "globalTradeID": 20825863,
        "tradeID": 147142,
        "currencyPair": "BTC_XVC",
        "type": "buy",
        "rate": "0.00018500",
        "amount": "455.34206390",
        "total": "0.08423828",
        "fee": "0.00200000",
        "date": "2016-03-14 01:04:36"
      },
      ...
    ]


### buy(currencyA, currencyB, rate, amount)

Places a limit buy order in a given market.

Example response:

    {
      "orderNumber": 31226040,
      "resultingTrades": [
        {
          "amount": "338.8732",
          "date": "2014-10-18 23:03:21",
          "rate": "0.00000173",
          "total": "0.00058625",
          "tradeID": "16164",
          "type": "buy"
        }
      ]
    }


### sell(currencyA, currencyB, rate, amount)

Places a limit sell order in a given market.

    poloniex.sell('NXT', 'BTC', 0.1, 100)
    .then(console.log)
    .catch(console.error);


Example response:

    {
      "orderNumber": 31226040,
      "resultingTrades": [
        {
          "amount": "338.8732",
          "date": "2014-10-18 23:03:21",
          "rate": "0.00000173",
          "total": "0.00058625",
          "tradeID": "16167",
          "type": "sell"
        }
      ]
    }


### cancelOrder(currencyA, currencyB, orderNumber)

Cancels an order you have placed in a given market.

    poloniex.cancelOrder('NXT', 'BTC', 170675)
    .then(console.log)
    .catch(console.error)


Example response:

    {
      "success": 1
    }


### moveOrder(orderNumber, rate, amount)

Cancels an order and places a new one of the same type in a single atomic transaction, meaning either both operations will succeed or both will fail.

Example response:

    {
      "success": 1,
      "orderNumber": "193592293",
      "resultingTrades": {
        "BTC_LTC": []
      }
    }


### withdraw(currency, amount, address)

Immediately places a withdrawal for a given currency, with no email confirmation. In order to use this method, the withdrawal privilege must be enabled for your API key.

    poloniex.withdraw('NXT', 2398, '17Hzfoobar')
    .then(console.log)
    .catch(console.error)


Example response:

    {
      "response": "Withdrew 2398 NXT."
    }


### returnFeeInfo()

If you are enrolled in the maker-taker fee schedule, returns your current trading fees and trailing 30-day volume in BTC. This information is updated once every 24 hours.

Example response:

    {
      "makerFee": "0.00140000",
      "takerFee": "0.00240000",
      "thirtyDayVolume": "612.00248891",
      "nextTier": "1200.00000000"
    }


### returnAvailableAccountBalances(account)

If `account` is `null` or omitted, returns your balances sorted by account. If `account` is a string, returns the balances for that account. Balances in a margin account may not be accessible if you have any open margin positions or orders.

Example response:

    {
      "exchange": {
        "BTC": "1.19042859",
        "BTM": "386.52379392",
        "CHA": "0.50000000",
        "ETH": "120.00000000",
        "STR": "3205.32958001",
        "VNL": "9673.22570147"
      },
      "margin": {
        "BTC": "3.90015637",
        "ETH": "250.00238240",
        "XMR": "497.12028113"
      },
      "lending": {
        "ETH": "0.01174765",
        "LTC": "11.99936230"
    }}


### returnTradableBalances()

Returns the current tradable balances for each currency in each market for which margin trading is enabled. Balances may vary continually with market conditions.

Example response:

    {
      "BTC_ETH": {
        "BTC": "8.50274777",
        "ETH": "654.05752077"
      },
      "BTC_LTC": {
        "BTC": "8.50274777",
        "LTC": "1214.67825290"
      },
      "BTC_XMR": {
        "BTC": "8.50274777",
        "XMR": "3696.84685650"
      }
    }


### transferBalance(currency, amount, fromAccount, toAccount)

Transfers funds from one account to another (e.g. from your exchange account to your margin account).

Example response:

    {
      "success": 1,
      "message": "Transferred 2 BTC from exchange to margin account."
    }


### returnMarginAccountSummary()

Returns a summary of the entire margin account. This is the same information you will find in the Margin Account section of the Margin Trading page, under the Markets list.

Example response:

    {
      "totalValue": "0.00346561",
      "pl": "-0.00001220",
      "lendingFees": "0.00000000",
      "netValue": "0.00345341",
      "totalBorrowedValue": "0.00123220",
      "currentMargin": "2.80263755"
    }


### marginBuy(currencyA, currencyB, rate, amount, lendingRate)

Places a margin buy order in a given market. You may optionally specify a maximum lending rate using the "lendingRate" parameter. If successful, the method will return the order number and any trades immediately resulting from your order.

    poloniex.buy('NXT', 'BTC', 0.1, 100)
    .then(console.log)
    .catch(console.error)


Example response:

    {
      "success": 1,
        "message": "Margin order placed.",
        "orderNumber": "154407998",
        "resultingTrades": {
        "BTC_ETH": [
          {
            "amount": "1.00000000",
            "date": "2015-05-10 22:47:05",
            "rate": "0.01383692",
            "total": "0.01383692",
            "tradeID": "1213556",
            "type": "buy"
          }
        ]
      }
    }


### marginSell(currencyA, currencyB, rate, amount, lendingRate)

Places a margin sell order in a given market. You may optionally specify a maximum lending rate using the "lendingRate" parameter. If successful, the method will return the order number and any trades immediately resulting from your order.

Example response:

    {
      "success": 1,
        "message": "Margin order placed.",
        "orderNumber": "154407998",
        "resultingTrades": {
        "BTC_ETH": [
          {
            "amount": "1.00000000",
            "date": "2015-05-10 22:47:05",
            "rate": "0.01383692",
            "total": "0.01383692",
            "tradeID": "1213556",
            "type": "sell"
          }
        ]
      }
    }


### getMarginPosition(currencyA, currencyB)

Returns information about the margin position in a given market. If you have no margin position in the specified market,
        "type" will be set to "none". "liquidationPrice" is an estimate, and does not necessarily represent the price at which an actual forced liquidation will occur. If you have no liquidation price, the value will be -1.

Example response:

    {
      "amount": "40.94717831",
      "total": "-0.09671314",
      ""basePrice": "0.00236190",
      "liquidationPrice": -1,
      "pl": "-0.00058655",
      "lendingFees": "-0.00000038",
      "type": "long"
    }


### closeMarginPosition(currencyA, currencyB)

Closes a margin position in a given market using a market order. This call will also return success if you do not have an open position in the specified market.

Example response:

    {
      "success": 1,
        "message": "Successfully closed margin position.",
        "resultingTrades": {
        "BTC_XMR": [
          {
            "amount": "7.09215901",
            "date": "2015-05-10 22:38:49",
            "rate": "0.00235337",
            "total": "0.01669047",
            "tradeID": "1213346",
            "type": "sell"
          },
        
          {
            "amount": "24.00289920",
            "date": "2015-05-10 22:38:49",
            "rate": "0.00235321",
            "total": "0.05648386",
            "tradeID": "1213347",
            "type": "sell"
          }
        ]
      }
    }


### createLoanOffer(currency, amount, duration, autoRenew, lendingRate)

Creates a loan offer for a given currency. The "autoRenew" parameter should be a 0 or a 1.

Example response:

    {
      "success": 1,
      "message": "Loan order placed.",
      "orderID": 10590
    }


### cancelLoanOffer(orderNumber)

Cancels a loan offer specified by "orderNumber".

Example response:

    {
      "success": 1,
      "message": "Loan offer canceled."
    }


### returnOpenLoanOffers()

Returns open loan offers for each currency.

Example response:

    {
      "BTC": [
        {
          "id": 10595,
          "rate": "0.00020000",
          "amount": "3.00000000",
          "duration": 2,
          "autoRenew": 1,
          "date": "2015-05-10 23:33:50"
        },
        ...
      ],
      
      "LTC": [
        {
          "id": 10598,
          "rate": "0.00002100",
          "amount": "10.00000000",
          "duration": 2,
          "autoRenew": 1,
          "date": "2015-05-10 23:34:35"
        },
        ...
      ]
    }


### returnActiveLoans()

Returns active loans for each currency.

Example response:

    {
      "provided": [
        {
          "id": 75073,
          "currency": "LTC",
          "rate": "0.00020000",
          "amount": "0.72234880",
          "range": 2,
          "autoRenew": 0,
          "date": "2015-05-10 23:45:05",
          "fees": "0.00006000"
        }
      ],
      
      "used": [
        {
          "id": 75238,
          "currency": "BTC",
          "rate": "0.00020000",
          "amount": "0.04843834",
          "range": 2,
          "date": "2015-05-10 23:51:12",
          "fees": "-0.00000001"
        }
      ]
    }


### returnLendingHistory(start, end, limit)

Returns up to "limit" closed loans within the "start" and "end" unix timestamps. (unix timestamps are expressed as numbers such as `1495681818`)

Example response:

    [
      {
        "id": 352149451,
        "currency": "XMR",
        "rate": "0.00000410",
        "amount": "0.08077792",
        "duration": "0.02410000",
        "interest": "0.00000001",
        "fee": "0.00000000",
        "earned": "0.00000001",
        "open": "2017-05-25 02:30:24",
        "close": "2017-05-25 03:05:08"
      },
      
      {
        "id": 352147612,
        "currency": "XRP",
        "rate": "0.00005506",
        "amount": "197.21610000",
        "duration": "0.00200000",
        "interest": "0.00002150",
        "fee": "-0.00000322",
        "earned": "0.00001828",
        "open": "2017-05-25 03:00:22",
        "close": "2017-05-25 03:03:14"
      }
    ]


### toggleAutoRenew(orderNumber)

Toggles the autoRenew setting on an active loan, specified by "orderNumber". If successful,
        "message" will indicate the new autoRenew setting.

Example response:

    {
      "success": 1,
      "message": 0
    }

## Changelog

2019-01-08 Migrate from original module author, https://github.com/premasagar/poloniex.js
2019-01-07 Promises support
2014-03-31 Initial commit by @premasagar

[repo]: https://github.com/poloniex/poloniex.js
[repo-zip]: https://github.com/poloniex/poloniex.js/archive/master.zip
[poloniex]: https://poloniex.com
[poloniex-api]: https://poloniex.com/api
[poloniex-keys]: https://poloniex.com/apiKeys
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
