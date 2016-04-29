var config = require('config');
var request = require('request');
var events = require('events');
var utils = require('../utils');

function giantBombApi(platform, title, sensibility, timeout){

    this.platform = platform;
    this.title = title;
    this.sensibility = sensibility;
    this.key = config.get(platform + '.giantBomb.key');
    this.platformId = config.get(platform + '.giantBomb.platformId');
    this.error = null;
}

giantBombApi.prototype = Object.create(events.EventEmitter.prototype);

giantBombApi.prototype.url = function(what){

    var self = this;
    if(what == 'gameslist') return 'http://www.giantbomb.com/api/search/?format=json&field_list=name,id,platforms&resources=game&query=' + self.title + '&api_key=' + self.key;
    return 'http://www.giantbomb.com/api/game/3030-' + what + '/?api_key=' + self.key + '&format=json&field_list=name,genres,publishers,description,original_release_date,image,images,developers';
};

giantBombApi.prototype.setError = function(title, error){

    this.error = {title: title, error: error};
};

giantBombApi.prototype.getError = function(title, error){

    this.emit('getError', this.error);
    return this.error;
};

giantBombApi.prototype.success = function(resolve, reject, body){

    var self = this;
    var gameList = JSON.parse(body);
    var gameId = null;
    var apiUrl = null;

    if(typeof gameList.results != 'undefined' && gameList.results.length > 0){

        for(var i = 0; i < gameList.results.length; i++){

            var test = utils.similar_text(self.title, gameList.results[i].name, 100);

            if(test >= self.sensibility){

                self.sensibility = test;

                for(var y = 0; y < gameList.results[i].platforms.length; y++){

                    if(gameList.results[i].platforms[y].id == self.platformId){

                        gameId = gameList.results[i].id;
                        break;
                    }
                }
            }

            // if(typeof gameId === null) break;
        }
    }

    if(!gameId){

        self.setError.call(self, 'request', 'game not found');
        reject(self.getError.call(self));
        return;
    }

    self.getGame.call(self, resolve, reject, gameId, apiUrl);
};

giantBombApi.prototype.getGame = function(resolve, reject, gameId){

    var self = this;
    request({

        url: self.url.call(this, gameId),
        method: 'GET',
        timeout: self.timeout,
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
        },

    }, function(error, response, body){

        if(error !== null || typeof response.statusCode == 'undefined' || response.statusCode != 200){

            self.setError.call(self, 'request2', error);
            reject(self.getError.call(self));
            return;
        }

        self.giveGame.call(self, resolve, reject, body);
    });
};

giantBombApi.prototype.giveGame = function(resolve, reject, body){

    var self = this;
    var game = JSON.parse(body);
    if(typeof game.error != 'undefined' && game.error != 'OK' ){

        self.setError.call(self, 'request', 'game not found');
        reject(self.getError.call(self));
        return;
    }

    var game = {

        db: 'giantBomb',
        title: typeof game.results.name != 'undefined' ?  game.results.name : '',
        platform: config.get(self.platform +'.platformName'),
        genre: typeof game.results.genres[0].name != 'undefined' ?  game.results.genres[0].name : '',
        players: '',
        overview: typeof game.results.description != 'undefined' ?  utils.trim(utils.strip_tags(game.results.description)) : '',
        publisher: typeof game.results.publishers[0].name != 'undefined' ?  game.results.publishers[0].name : '',
        developer: typeof game.results.developers[0].name != 'undefined' ?  game.results.developers[0].name : '',
        esrb: '',
        rating: '',
        boxfront: typeof game.results.image.super_url != 'undefined' ?  game.results.image.super_url : '',
        boxback: '',
        screenshot: typeof game.results.images[0].super_url != 'undefined' ?  game.results.images[0].super_url : '',
        clearlogo: '',
        fanart: '',
        release: typeof game.results.original_release_date != 'undefined' ?  self.prepareDate.call(self, game.results.original_release_date) : ''
    };

    self.emit('success', game);
    resolve(game);
};

giantBombApi.prototype.prepareDate = function(datetime){

    if(datetime.length != 19) return '';
    return datetime;
};

giantBombApi.prototype.request = function(){

    var self = this;

    return new Promise(function(resolve, reject){

        request({

            url: self.url('gameslist'),
            method: 'GET',
            timeout: self.timeout,
            headers:{
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
            },

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

module.exports = giantBombApi;
