var Poloniex = require('./lib/poloniex'),
    // When using as an NPM module, use `require('poloniex.js')`

    // Create a new instance, with optional API key and secret
    poloniex = new Poloniex(
        // 'API_KEY',
        // 'API_SECRET'
    );


// * IMPORTANT *
// The line below is temporary, to avoid API server certficiate failure `Error: CERT_UNTRUSTED`
// This is presumably a temporary issue and has been reported to Poloniex.
// Do not include the line below once the issue is resolved.
Poloniex.STRICT_SSL = false;


// Public call
poloniex.getTicker(function(err, data){
    if (err){
        console.log('ERROR', err);
        return;
    }

    console.log(data);
});


// Private call - requires API key and secret
/*
poloniex.buy('VTC', 'BTC', 0.1, 100, function(err, data){
    if (err){
        console.log('ERROR', err);
        return;
    }

    console.log(data);
});
*/
