var config = require('config');
var request = require('request');
var xml2js = require('xml2js').parseString;
var utils = require('../utils');
var events = require('events');

function tgdbApi(platform, title, sensibility, timeout){

    this.platform = platform;
    this.tgdbPlatform = config.get(platform +'.theGamesDB.platformName');
    this.title = title;
    this.sensibility = sensibility;
    this.timeout = timeout;
    this.error = null;
}

tgdbApi.prototype = Object.create(events.EventEmitter.prototype);

tgdbApi.prototype.url = function(){

    console.log('http://thegamesdb.net/api/GetGame.php?platform=' + this.tgdbPlatform + '&name=' + this.title);
    return 'http://thegamesdb.net/api/GetGame.php?platform=' + this.tgdbPlatform + '&name=' + this.title;
};

tgdbApi.prototype.setError = function(title, error){

    this.error = {title: title, error: error};
};

tgdbApi.prototype.getError = function(title, error){

    this.emit('getError', this.error);
    return this.error;
};

tgdbApi.prototype.success = function(resolve, reject, body){

    var self = this;

    xml2js(body, function(error, result){

        if(error !== null){

            self.setError.call(self, 'xml2js', error);
            reject(self.getError.call(self));
            return;
        }

        if(typeof result.Data.Game != 'undefined' || typeof result.Data.Game == 'obejct')
            return self.getGame.call(self, resolve, reject, result.Data);

        self.setError.call(self, 'xml2js', 'xml2js fail');
        reject(self.getError.call(self));
    });
};

tgdbApi.prototype.request = function(){

    var self = this;
    return new Promise(function(resolve, reject){

        request({

            uri: self.url(),
            method: 'GET',
            timeout: self.timeout,
        }, function(error, response, body){

            if(error) console.log('error');
            if(typeof response.statusCode == 'undefined') console.log('error');
            if(response.statusCode != 200) console.log('status code');
            if(typeof response.body == 'undefined') console.log('body');
            if(response.body.length < 150) console.log('menor 150')

            if(error || typeof response.statusCode == 'undefined' || response.statusCode != 200 || typeof response.body == 'undefined' || response.body.length < 150){

                self.setError.call(self, 'request fail', error);
                reject(self.getError.call(self, 'request fail', error));
            }

            self.success.call(self, resolve, reject, body);
        });
    });
};

tgdbApi.prototype.prepareDate = function(date){

    if(date.length == 4) return date + '-00-00 00:00:00';

    if(date.length != 10) return '';

    var year = date.substring(6);
    var month = date.substring(0, 2);
    var day = date.substring(3, 5);

    return year + '-' + month + '-' + day + ' 00:00:00';
};

tgdbApi.prototype.getGame = function(resolve, reject, data){

    var self = this;
    var index = null;

    if(typeof data.error != 'undefined'){
        self.setError.call(self, 'xml2js', 'xml2js fail');
        return;
    }

    for(var i = 0; i < data.Game.length; i++){

        var test = utils.similar_text(this.title, data.Game[i].GameTitle[0], 100);

        if(test >= self.sensibility){
            self.sensibility = test;
            index = i;
            continue;
        }
    }

    if(index === null){
    
        self.setError.call(self, 'request', self.title + ' game not found');
        reject(self.getError.call(self));
        return;
    }

    baseimageurl = typeof data.baseImgUrl[0] != 'undefined' ? data.baseImgUrl[0] : data.baseImgUrl;

    if(typeof data.Game[index].Images[0].boxart != 'undefined' &&  typeof data.Game[index].Images[0].boxart[0] != 'undefined' && data.Game[index].Images[0].boxart[0]._.match(/\/front\//)){

        var boxFront = baseimageurl + data.Game[index].Images[0].boxart[0]._;
    }else{
        var boxFront = '';
    }


    if(typeof data.Game[index].Images[0].boxart != 'undefined' &&  typeof data.Game[index].Images[0].boxart[0] != 'undefined' && data.Game[index].Images[0].boxart[0]._.match(/\/back\//)){

        var boxBack = baseimageurl + data.Game[index].Images[0].boxart[0]._;
    }else{
        var boxBack = '';
    }

    if(boxFront == '' && typeof data.Game[index].Images[0].boxart != 'undefined' &&  typeof data.Game[index].Images[0].boxart[1] != 'undefined'){

        var boxFront = baseimageurl + data.Game[index].Images[0].boxart[1]._;  
    }

    var game = {

        db: 'thegamesdb',
        title: typeof data.Game[index].GameTitle[0] != 'undefined' ? data.Game[index].GameTitle[0] : '',
        platform: config.get(self.platform +'.platformName'),
        genre: typeof data.Game[index].Genres != 'undefined' && typeof data.Game[index].Genres[0].genre[0] != 'undefined' ? data.Game[index].Genres[0].genre.join(', ') : '',
        players: typeof data.Game[index].Players != 'undefined' && typeof data.Game[index].Players[0] != 'undefined' ? data.Game[index].Players[0] : '',
        overview: typeof data.Game[index].Overview != 'undefined' &&  typeof data.Game[index].Overview[0] != 'undefined' ? data.Game[index].Overview[0] : '',
        publisher: typeof data.Game[index].Publisher != 'undefined' && typeof data.Game[index].Publisher[0] != 'undefined' ? data.Game[index].Publisher[0] : '',
        developer: typeof data.Game[index].Developer != 'undefined' && typeof data.Game[index].Developer[0] ? data.Game[index].Developer[0] : '',
        esrb: typeof data.Game[index].ESRB != 'undefined' && typeof data.Game[index].ESRB[0] != 'undefined' ? data.Game[index].ESRB[0] : '',
        rating: typeof data.Game[index].Rating != 'undefined' && typeof data.Game[index].Rating[0] != 'undefined' ? Math.round((data.Game[index].Rating[0] / 10 ) * 100) / 100 : '',
        boxfront: boxFront,
        boxback: boxBack,
        screenshot: typeof data.Game[index].Images[0].screenshot != 'undefined' && typeof data.Game[index].Images[0].screenshot[0].original[0]._ != 'undefined' ? data.baseImgUrl[0] + data.Game[index].Images[0].screenshot[0].original[0]._ : '',
        clearlogo: typeof data.Game[index].Images[0].clearlogo != 'undefined' && typeof data.Game[index].Images[0].clearlogo[0]._ != 'undefined' ? data.baseImgUrl[0] + data.Game[index].Images[0].clearlogo[0]._ : '',
        fanart: typeof data.Game[index].Images[0].fanart != 'undefined' && typeof data.Game[index].Images[0].fanart[0].original[0]._ != 'undefined' ? data.baseImgUrl[0] + data.Game[index].Images[0].fanart[0].original[0]._ : '',
        release: typeof data.Game[index].ReleaseDate != 'undefined' && typeof data.Game[index].ReleaseDate[0] != 'undefined' ? self.prepareDate(data.Game[index].ReleaseDate[0]) : ''
    };

    resolve(game);
    self.emit('success', game);
};

module.exports = tgdbApi;