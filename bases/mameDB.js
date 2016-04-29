var request = require('request');
var events = require('events');
var utils = require('../utils')

function mameDbApi(rom, timeout){

    this.rom = rom;
    this.timeout = timeout;
    this.error = null;
}

mameDbApi.prototype = Object.create(events.EventEmitter.prototype);

mameDbApi.prototype.url = function(){

    return 'http://www.mamedb.com/game/' + this.rom;
};

mameDbApi.prototype.setError = function(title, error){

    this.error = {title: title, error: error};
};

mameDbApi.prototype.getError = function(title, error){

    this.emit('getError', this.error);
    return this.error;
};

mameDbApi.prototype.success = function(resolve, reject, body){

    var body = body.replace(/\&nbsp;|\&nbsp/g, ' ');
    var self = this;

    var title = body.match(/<h1>Game Details<\/h1><br\/><b>Name:\s<\/b>[^<]*/gmi);
    title = typeof title[0] != 'undefined' ? utils.trim(title[0].replace(/<h1>Game Details<\/h1><br\/><b>Name:\s<\/b>/, '')) : '';
    var genre = body.match(/<b>Category:\s<\/b>[^>]+>([^<]+)/);
    genre = typeof genre[1] != 'undefined' ? genre[1] : '';
    var players = body.match(/<b>Players:\s<\/b>([\d])/);
    players = typeof players[1] != 'undefined' ? players[1] : '';
    var developer = body.match(/(<b>Manufacturer:\s<\/b>[^>]*>)[^<]+/gmi);
    developer = typeof developer[0] != 'undefined' ? utils.trim(developer[0].replace(/<b>Manufacturer:\s<\/b>\s<a href='\/manufacturer\/[^']+'>/, '')) : '';
    var rating = body.match(/<b>Score:\s<\/b>([^\s]+)/gmi);
    rating = typeof rating[0] != 'undefined' ? Math.round(((rating[0].replace(/<b>Score:\s<\/b>/, '')) / 10 ) * 100) / 100 : '';
    var boxfront = body.match(/<a href=\'\/image\/title\/[^\']+\'><img\ssrc=\'[^']+/gmi);
    boxfront = typeof boxfront[0] != 'undefined' ? 'http://www.mamedb.com' + boxfront[0].replace(/<a href=\'\/image\/title\/[^\']+\'><img\ssrc=\'/, '') : '';
    var screenshot = body.match(/<a href=\'\/image\/snap\/[^\']+\'><img\ssrc=\'[^']+/gmi);
    screenshot = typeof screenshot[0] != 'undefined' ? 'http://www.mamedb.com' + screenshot[0].replace(/<a href=\'\/image\/snap\/[^\']+\'><img\ssrc=\'/, '') : '';
    var release = body.match(/<b>Year:\s<\/b>[^>]*>[\d]{4}/);
    release = typeof release[0] != 'undefined' ? release[0].replace(/<b>Year:\s<\/b>[^>]*>/, '') : '';

    var game = {

        db: 'mameDB',
        title: title,
        platform: 'Arcade',
        genre: genre,
        players: players,
        overview: '',
        publisher: '',
        developer: developer,
        esrb: '',
        rating: rating,
        boxfront: boxfront,
        boxback: '',
        screenshot: screenshot,
        clearlogo: '',
        fanart: '',
        release: release
    };

    self.emit('success', game);
    resolve(game);
};

mameDbApi.prototype.request = function(){

    var self = this;
    return new Promise(function(resolve, reject){

        request({

            url: self.url.call(self),
            method: 'GET',
            timeout: self.timeout
        }, function(error, response, body){

            if(error !== null || typeof response.statusCode == 'undefined' || response.statusCode != 200){

                self.setError.call(self, 'request', error);
                reject(self.getError.call(self));
                return;
            }

            self.success.call(self, resolve, reject, body);
        });
    });
};

module.exports = mameDbApi;