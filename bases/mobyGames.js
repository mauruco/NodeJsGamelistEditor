var config = require('config');
var request = require('request');
var utils = require('../utils');
var events = require('events');


function mobyGamesApi(platform, title, sensibility, timeout){

    this.platform = platform;
    this.platformId = config.get(this.platform + '.mobyGames.platformId');
    this.title = title;
    this.sensibility = sensibility;
    this.timeout = timeout;
    this.domainName = 'http://www.mobygames.com';
    this.error = null;
}

mobyGamesApi.prototype = Object.create(events.EventEmitter.prototype);

mobyGamesApi.prototype.url = function(){

    return 'http://www.mobygames.com/search/quick?sFilter=1&offset=0&q=' + this.title + '&p=' + this.platformId + '&sG=on';
};

mobyGamesApi.prototype.setError = function(title, error){

    this.error = {title: title, error: error};
};

mobyGamesApi.prototype.getError = function(title, error){

    this.emit('getError', this.error);
    return this.error;
};

mobyGamesApi.prototype.success = function(resolve, reject, body){

    var self = this;

    var links = body.match(/<a href="([^"]*)">([^<]*)/gmi);

    var sensibility = self.sensibility;

    if(links.length > 14){

        for(var i = 0; i < links.length; i++){

            link = /<a href="([^"]*)">(.*)/.exec(links[i]);

            var test = utils.similar_text(self.title, link[2], 100);

            if(test > sensibility){

                sensibility = test;
                var game = self.domainName + link[1];
            }
        }
    }

    if(typeof game == 'undefined'){

        self.setError.call(self, 'request fail', 'game not found');
        reject(self.getError.call(self));
        return;
    }

    this.getGame.call(self, resolve, reject, game);
};

mobyGamesApi.prototype.getGame = function(resolve, reject, link){

    var self = this;
    request({

        uri: link,
        method: 'GET',
        timeout: self.timeout,
    }, function(error, response, body){

        if(error !== null || typeof response.statusCode == 'undefined' || response.statusCode != 200){

            self.setError.call(self, 'request2', error);
            reject(self.getError.call(self));
            return;
        }

        self.getGameInfos.call(self, resolve, reject, body);
    });
};

mobyGamesApi.prototype.prepareDate = function(date){

    if(date.length == 4) return date + '-00-00 00:00:00';

    if(date.length != 12) return '';

    var find = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var replace = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    for(var i = 0; i < find.length; i++){

        date = date.replace(find[i], replace[i]);
    }

    var year = date.substring(7);
    var month = date.substring(0, 2);
    var day = date.substring(3, 5);

    return year + '-' + month + '-' + day + ' 00:00:00';
};

mobyGamesApi.prototype.getGameInfos = function(resolve, reject, body){

    var body = body.replace(/\&nbsp;/g, ' ');
    var self = this;

    var overview = body.match(/<h2>Description<\/h2>((((?!<div class="sideBarLinks).)*)\n?)*/);
    overview = typeof overview[0] != 'undefined' ? overview[0].replace(/<h2>Description<\/h2>/, '').replace(/<br>/g, '') : '';

    var title = body.match(/niceHeaderTitle">[^>]*>([^<]*)/);
    title = typeof title[1] != 'undefined' ? title[1] : '';

    var genre = body.match(/>Genre([^>]*>){3}([^<]*)/);
    genre = typeof genre[2] != 'undefined' ? genre[2] : '';

    var publisher = body.match(/>Published by([^>]*>){3}([^<]*)/);
    publisher = typeof publisher[2] != 'undefined' ? publisher[2] : '';

    var developer = body.match(/>Developed by([^>]*>){3}([^<]*)/);
    developer = typeof developer[2] != 'undefined' ? developer[2] : '';

    var esrb = body.match(/>ESRB Rating([^>]*>){3}([^<]*)/);
    esrb = typeof esrb[2] != 'undefined' ? esrb[2] : '';

    var release = body.match(/>Released([^>]*>){3}([^<]*)/);
    release = typeof release[2] != 'undefined' ? release[2] : '';
    release = self.prepareDate.call(self, release);

    var boxfront = body.match(/coreGameCover"><a[^>]*><img([^"]*"){5}([^"]*)/);
    boxfront = typeof boxfront[2] != 'undefined' ? self.domainName + boxfront[2].replace('/s/', '/l/') : '';

    var screenshot = body.match(/thumbnail[^>]*><img([^"]*"){5}([^"]*)/);
    screenshot = typeof screenshot[2] != 'undefined' ? self.domainName + screenshot[2].replace('/s/', '/l/') : '';

    var game = {

        db: 'mobyGames',
        title: title,
        platform: config.get(self.platform),
        genre: genre,
        players: '',
        overview: overview,
        publisher: publisher,
        developer: developer,
        esrb: esrb,
        rating: '',
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

mobyGamesApi.prototype.request = function(){

    var self = this;

    return new Promise(function( resolve, reject){

        request({

            uri: self.url(),
            method: 'GET',
            timeout: self.timeout,
        }, function(error, response, body){

            if(error !== null || typeof response.statusCode == 'undefined' || response.statusCode != 200){

                self.setError.call(self, 'request fail', error);
                reject(self.getError.call(self));
                return;
            }

            self.success.call(self, resolve, reject, body);
        });
    });
};

module.exports = mobyGamesApi;