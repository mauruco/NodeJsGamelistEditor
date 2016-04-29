// var Tgdb = require('./bases/theGamesDB');
// var TgdbGame = new Tgdb('psp', 'bomberman', 80, 10000);
// var TgdbPromise = TgdbGame.request();
// TgdbPromise.then(function(game){

//     console.log(game);

// }).catch(function(error){

//     console.log(error);
// });

// TgdbGame.on('success', function(game){

//     console.log(game);
// });
// TgdbGame.on('getError', function(error){

//     console.log(error);

// });

// var giantBomb = require('./bases/giantBomb');
// var giantBombGame = new giantBomb('ps1', 'resident evil', 80, 10000);
// var giantBombPromise = giantBombGame.request();

// giantBombPromise.then(function(game){

//     console.log(game);

// }).catch(function(error){

//     console.log(error);
// });

// giantBombGame.on('success', function(game){

//     console.log(game);
// });

// giantBombGame.on('getError', function(error){

//     console.log(error);
// });

// var mameDb = require('./bases/mameDb');
// var mameDbGame = new mameDb('1943', 10000);
// var mameDdPromise = mameDbGame.request();

// mameDdPromise.then(function(game){

//     console.log(game);

// }).catch(function(error){

//     console.log(error);
// });

// mameDbGame.on('success', function(game){

//     console.log(game);
//     mameDbGame = null;
// });

// mameDbGame.on('getError', function(error){

//     console.log(error);
// });