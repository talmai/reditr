/**
    MediaParser class
    All parsing methods must have format:
        hanleMedia(url, callback)
*/
import Request from 'superagent';

class MediaParser {

    /** Method that delegates to the correct media type  */
    parse(url, callback) {

        this.regex = {
            RAW_IMAGE: /\.(png|gif$|jpg|jpeg)/gi,
            IMGUR_ALBUM: /(http|https):\/\/*(.?)imgur.com\/(a|gallery)\/([a-zA-Z0-9]{5,})/gi,
            IMGUR_IMAGE: /(http|https):\/\/*(.?)imgur.com\/([a-zA-Z0-9]{5,})$/gi,
            IMGUR_GIFV: /.*?i\.imgur\.com\/([a-z0-9]{5,})\.gifv$/gi
        }

        if (this.regex.RAW_IMAGE.test(url)) {
            this.handleRawImage(url, callback);
        } else if (this.regex.IMGUR_ALBUM.test(url)) {
            this.handleImgurAlbum(url, callback);
        } else if (this.regex.IMGUR_IMAGE.test(url)) {
            this.handleImgurImage(url, callback);
        } else if (this.regex.IMGUR_GIFV.test(url)) {
            this.handleImgurGifv(url, callback);
        } else {
            this.handleAnyUrl(url, callback);
        }

    }

    parseText(text, callback) {
        // WARNING, MOVE THIS TO A UTILITIES FILE
        var decodeEntities = (function() {
          // this prevents any overhead from creating the object each time
          var element = document.createElement('div');

          function decodeHTMLEntities (str) {
            if(str && typeof str === 'string') {
              // strip script/html tags
              str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
              str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
              element.innerHTML = str;
              str = element.textContent;
              element.textContent = '';
            }

            return str;
          }

          return decodeHTMLEntities;
        })();

        callback({
            parsedText: decodeEntities(text),
            type: "text"
        });
    }

    handleAnyUrl(url, callback) {

        let jsonp = require('superagent-jsonp');

        Request
            .get('https://www.readability.com/api/content/v1/parser')
            .use(jsonp)
            .query({
                url: url,
                token: 'e97c4f658162139ec8e04c4cbb2e80518c66757f'
            }).end(function(err, res) {
                callback({
                    url: url,
                    parsedText: res.body.content,
                    type: "article"
                });
            });
    }

    handleImgurGifv(url, callback) {
        // reset regex pos
        this.regex.IMGUR_GIFV.lastIndex = 0
        let imgurId = this.regex.IMGUR_GIFV.exec(url).pop() // id is last in matching group

        callback({
            url: url,
            parsedUrl: "http://i.imgur.com/" + imgurId + ".webm",
            type: "video"
        })
    }

    /** Simply adds .png to the url, imgur auto handles if it's a gif or not */
    handleImgurImage(url, callback) {
        callback({
            url: url,
            parsedUrl: url + ".png", // probably a smarter way to do this
            type: "image"
        })
    }

    /** returns consistent object for image */
    handleRawImage(url, callback) {
        callback({
            url: url,
            parsedUrl: url, // probably a smarter way to do this
            type: "image"
        })
    }

    /** Will do nothing useful for now */
    handleImgurAlbum(url, callback) {
        callback({
            type: "ignore"
        })
    }

}

export default MediaParser
