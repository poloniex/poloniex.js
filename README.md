# poloniex.js

An (unofficial) Node.js API client for the [Poloniex][poloniex] cryptocurrency exchange.

The client supports both public (unauthenticated) and private (authenticated) calls to the [Poloniex API][poloniex-api].

For private calls, the user secret is never exposed to other parts of the program or over the Web. The user key is sent as a header to the API, along with a signed request.

Repo home: [github.com/premasagar/poloniex.js][repo]


## License

MIT, open source. See LICENSE file.


## Install via NPM

    npm install poloniex.js


## Or clone from GitHub

    git clone https://github.com/premasagar/poloniex.js.git
    cd poloniex
    npm install


## Or download the latest zip

* [zip download][repo-zip]


## Require as a module

In your app, require the module:

    var Poloniex = require('poloniex.js');

If not installed via NPM, then provide the path to lib/poloniex.js


## Temporary certificate workaround

Currently, the API server's certficate is rejected. This is presumably a temporary issue and has been reported to Poloniex. The line below is a temporary workaround. First try using the client without this.

    Poloniex.STRICT_SSL = false;


## Create an instance of the client

If only public API calls are needed, then no API key or secret is required:

    var poloniex = new Poloniex();

Or, to use Poloniex's trading API, [your API key and secret][poloniex-keys] must be provided:

    var poloniex = new Poloniex('API_KEY', 'API_SECRET');


## Make API calls

All [Poloniex API][poloniex-api] methods are supported (with some name changes to avoid naming collisions). All methods require a callback function.

The callback is passed two arguments:

1. An error object, or `null` if the API request was successful
2. A data object, the response from the API

For the most up-to-date API documentation, see [poloniex.com/api][poloniex-api].


## Public API methods

These methods do not require a user key or secret.


### getTicker(callback)

Returns the ticker for all markets.  
Calls API method `returnTicker`.

    poloniex.getTicker(function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"BTC_LTC":"0.026","BTC_NXT":"0.00007600", ... }


### get24hVolume(callback)

Returns the 24-hour volume for all markets, plus totals for primary currencies.  
Calls API method `return24hVolume`.

    poloniex.get24hVolume(function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"BTC_LTC":{"BTC":"2.23248854","LTC":"87.10381314"},"BTC_NXT":{"BTC":"0.981616","NXT":"14145"}, ... "totalBTC":"81.89657704","totalLTC":"78.52083806"}


### getOrderBook(currencyA, currencyB, callback)

Returns the order book for a given market.  
Calls API method `returnOrderBook`.

    poloniex.getOrderBook('VTC', 'BTC', function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"asks":[[0.00007600,1164],[0.00007620,1300], ... "bids":[[0.00006901,200],[0.00006900,408], ... }


### getTradeHistory(currencyA, currencyB, callback)

Returns the past 200 trades for a given market.  
Calls API method `returnTradeHistory`.

    poloniex.getTradeHistory('VTC', 'BTC', function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    [{"date":"2014-02-10 04:23:23","type":"buy","rate":"0.00007600","amount":"140","total":"0.01064"},{"date":"2014-02-10 01:19:37","type":"buy","rate":"0.00007600","amount":"655","total":"0.04978"}, ... ]



## Private, trading API methods

These methods require the user key and secret.


### myBalances(callback)

Returns all of your balances.  
Calls API method `returnBalances`.

    poloniex.myBalances(function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"BTC":"0.59098578","LTC":"3.31117268", ... }


### myOpenOrders(currencyA, currencyB, callback)

Returns your open orders for a given market, specified by the currency pair.  
Calls API method `returnOpenOrders`.

    poloniex.myOpenOrders('VTC', 'BTC', function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    [{"orderNumber":"120466","type":"sell","rate":"0.025","amount":"100","total":"2.5"},{"orderNumber":"120467","type":"sell","rate":"0.04","amount":"100","total":"4"}, ... ]


### myTradeHistory(currencyA, currencyB, callback)

Returns your trade history for a given market, specified by the currency pair.  
Calls API method `returnTradeHistory`.

    poloniex.myTradeHistory('VTC', 'BTC', function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    [{"date":"2014-02-19 03:44:59","rate":"0.0011","amount":"99.9070909","total":"0.10989779","type":"sell"},{"date":"2014-02-19 04:55:44","rate":"0.0015","amount":"100","total":"0.15","type":"sell"}, ... ]


### buy(currencyA, currencyB, rate, amount, callback)

Places a buy order in a given market.

    poloniex.buy('VTC', 'BTC', 0.1, 100, function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"orderNumber":170675}
    

### sell(currencyA, currencyB, rate, amount, callback)

Places a sell order in a given market.

    poloniex.sell('VTC', 'BTC', 0.1, 100, function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"orderNumber":170675}
    

### cancelOrder(currencyA, currencyB, orderNumber, callback)

Cancels an order you have placed in a given market.

    poloniex.cancelOrder('VTC', 'BTC', 170675, function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"success":1} 
    

### withdraw(currency, amount, address, callback)

Returns your open orders for a given market, specified by the currency pair.

    poloniex.myOpenOrders('BTC', 0.01, '17Hzfoobar', function(err, data){
        if (err){
            // handle error
        }

        console.log(data);
    });


Example response:

    {"response":"Withdrew 2398 NXT."} 



[repo]: https://github.com/premasagar/poloniex.js
[repo-zip]: https://github.com/premasagar/poloniex.js/archive/master.zip
[poloniex]: https://poloniex.com
[poloniex-api]: https://poloniex.com/api
[poloniex-keys]: https://poloniex.com/apiKeys
