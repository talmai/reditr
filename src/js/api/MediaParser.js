/**
    MediaParser class
    All parsing methods must have format:
        hanleMedia(url, callback)
*/
import Request from 'superagent';
import jsonp from './superagentJSONP';
import { decodeEntities } from '../Utilities.js';

class MediaParser {

    constructor() {
        this.regex = {
            RawImage: /\.(png|gif$|jpg|jpeg)/gi,
            ImgurAlbum: /.*?imgur\.com\/(a|gallery)\/([a-zA-Z0-9]{5,})/gi,
            ImgurImage: /.*?imgur\.com\/([a-zA-Z0-9]{5,})$/gi,
            ImgurGifv: /.*?imgur\.com\/([a-z0-9]{5,})\.gifv$/gi,
            YouTube: /youtube\.com\/watch/gi,
            YouTubeShort: /youtu\.be\/(.*?)/gi,
            Gyfcat: /.*?gfycat\.com\/([a-zA-Z0-9]{1,})/gi
        };
    }

    recycleRegex(type) {
        var regex = this.regex[type];
        if(!regex) return /(?:)/;
        regex.lastIndex = 0;
        return regex;
    }

    /** Method that delegates to the correct media type  */
    parse(url, callback) {

        var handled = false;
        for (var type in this.regex) {
            if(this.recycleRegex(type).test(url)) {
                this['handle' + type](url, callback);
                handled = true;
                break;
            }
        }

        if(!handled) {
            this.handleAnyUrl(url, callback);
        }
    }

    handleGyfcat(url, callback) {
        let name = this.recycleRegex('Gyfcat').exec(url).pop();
        callback({
            url: url,
            parsedUrl: ["http://giant.gfycat.com/" + name + ".webm",
                        "http://fat.gfycat.com/" + name + ".webm",
                        "http://zippy.gfycat.com/" + name + ".webm"],
            type: "video"
        });
    }

    handleYouTubeShort(url, callback) {
        var videoId = url.split('.be/')[1].split('?')[0].split('#')[0];
        callback({
            videoId,
            type: "youtube"
        });
    }

    handleYouTube(url, callback) {
        var urlParts = url.split('?v=');
        var videoId = url.length > 1 ? urlParts[1] : undefined;
        callback({
            videoId,
            type: "youtube"
        });
    }

    parseText(text, callback) {
        callback({
            parsedText: decodeEntities(text),
            type: "text"
        });
    }

    handleAnyUrl(url, callback) {
        Request
            .get('https://www.readability.com/api/content/v1/parser?callback=?')
            .use(jsonp)
            .query({
                url: url,
                token: 'e97c4f658162139ec8e04c4cbb2e80518c66757f'
            }).end(function(err, res) {
                callback({
                    url: url,
                    parsedText: res.body.excerpt,
                    type: "article"
                });
            });
    }

    handleImgurGifv(url, callback) {
        let imgurId = this.recycleRegex('ImgurGifv').exec(url).pop(); // id is last in matching group
        callback({
            url: url,
            parsedUrl: "http://i.imgur.com/" + imgurId + ".webm",
            type: "video"
        });
    }

    /** Simply adds .png to the url, imgur auto handles if it's a gif or not */
    handleImgurImage(url, callback) {
        callback({
            url: url,
            parsedUrl: url + ".png", // probably a smarter way to do this
            type: "image"
        });
    }

    /** returns consistent object for image */
    handleRawImage(url, callback) {
        callback({
            url: url,
            parsedUrl: url, // probably a smarter way to do this
            type: "image"
        });
    }

    /** Get imgur album to work */
    handleImgurAlbum(url, callback) {

        // get the id of the gallery
        let galleryid = url.replace(/#(.*?)$/,'').match(/\/(a|gallery)\/(.*?)(\/|$|#)/)[2];

        Request
            .get("https://api.imgur.com/3/gallery/album/" + galleryid + "/images")
            .set("Authorization", "Client-ID 6d5f34e8c30918b")
            .end((err, resp) => {

                if (!err) {
                    // if we don't have an error
                    let images = resp.body.data;
                    images = images.map(image => {
                        return image.link;
                    });

                    if (images.length == 1) {
                        callback({
                            url: images[0],
                            parsedUrl: images[0],
                            type: "image"
                        });
                    } else {
                        callback({
                            type: "gallery",
                            imageUrls: images
                        });
                    }

                } else {
                    // if we have an error ignore
                    callback({
                        type: "ignore"
                    });
                }

            });
    }

}

export default new MediaParser;
