/**
    MediaParser class
    All parsing methods must have format:
        hanleMedia(url, callback)
*/
import Request from 'superagent';
import jsonp from './superagentJSONP';
import { decodeEntities } from '../utilities/Common';

class MediaParser {

    constructor() {
        this.regex = {
            RawImage: /\.(png|gif$|jpg|jpeg)/gi,
            ImgurAlbum: /.*?imgur\.com\/(a|gallery)\/([a-zA-Z0-9]{5,})/gi,
            ImgurImage: /.*?imgur\.com\/([a-zA-Z0-9]{5,})$/gi,
            ImgurGifv: /.*?imgur\.com\/([a-z0-9]{5,})\.gifv$/gi,
            YouTube: /youtube\.com\/watch/gi,
            YouTubeShort: /youtu\.be\/(.*?)/gi,
            Gyfcat: /.*?gfycat\.com\/([a-zA-Z0-9]{1,})/gi,
            Tweet: /twitter\.com\/.*\/status\/([^\/]+).*/i
        };
    }

    /** takes the key of a used regex from this.regex and returns a re-usable regex obj */
    recycleRegex(type) {
        var regex = this.regex[type];
        if(!regex) return /(?:)/;
        regex.lastIndex = 0;
        return regex;
    }

    /** Method that delegates to the correct media type */
    parse(url, callback) {
        // try and match url to every exp in this.regex
        var handler = 'handleAnyUrl';
        for (var type in this.regex) {
            if(this.recycleRegex(type).test(url)) {
                handler = 'handle' + type;
                break;
            }
        }
        // run the default handler or the handler that matched
        this[handler](url, callback);
    }

    /* really disgusting tweet scraping as to avoid having to do multiple requests
     * to their other endpoints to get everything we want to just display
     * a single tweet...
     */

    tweetParseText(str) {
        var start = str.search(/Tweet\-text[^>]+>([^<]+)</);
        if(start == -1) return '';
        var stack = 1;
        var prevChar = false;
        var text = '';
        for(var pos = start+1; pos < str.length && stack > 0; pos++) {
            var char = str[pos];
            if(prevChar !== false) {
                text += prevChar;
                prevChar = char;
            }
            if(char == '<') {
                // increase stack if hit open tag, decrease if hit close tag
                stack += str[pos+1] == '/' ? -1 : 1;
            }else if(!prevChar && char == '>') {
                // only start tracking prevChar once we hit our first open tag
                prevChar = '';
            }
        }
        return text.replace(/\\n/g, "<br/>").replace(/\\"/g, '"').replace(/<a/g, '<a target="blank"');
    }

    handleTweet(url, callback) {
        let id = this.recycleRegex('Tweet').exec(url).pop();
        let embeddedTweetUrl = 'https://syndication.twitter.com/tweets.json?callback=?&ids='
                + id
                + '&lang=en&suppress_response_codes=true';
        Request
            .get(embeddedTweetUrl)
            .use(jsonp)
            .end((err, res) => {
                var id = Object.keys(res.body)[0];
                let str = JSON.stringify(res);
                let avatarTail = str.match(/\/profile_images\/([^\/]+)\/(.*?)\.(jpg|jpeg|png)/);
                let avatar = avatarTail.length > 0 ? 'https://pbs.twimg.com' + avatarTail[0] : undefined;
                let text = this.tweetParseText(str);
                let name = str.match(/element:name[^>]+>([^<]+)</).pop();
                let username = str.match(/element:screen_name[^>]+>([^<]+)</).pop().substr(1);
                let datetime = str.match(/data-datetime=\\"([^\\]+)\\/).pop();
                let retweets = (str.match(/element:retweet_count[^>]+>([^<]+)</)||[0]).pop();
                let hearts = (str.match(/element:heart_count[^>]+>([^<]+)</)||[0]).pop();
                let imgParts = str.match(/NaturalImage\-image.*data-srcset=\\"([^ ]+)/);
                let image = imgParts ? decodeURIComponent(imgParts.pop()) : undefined;
                let videoThumbParts = str.match(/ext_tw_video_thumb(.*?)\.(jpg|jpeg|png)/);
                let videoThumb = videoThumbParts ? 'https://pbs.twimg.com/' + decodeURIComponent(videoThumbParts[0]) : undefined;
                let videoParts = str.match(/video_url=(.*?)\.mp4/);
                let video = videoParts ? decodeURIComponent(videoParts.pop()) + '.mp4' : undefined;
                let tweet = { avatar, text, name, username, datetime, retweets, hearts, image, videoThumb, video, id };
                callback({
                    url,
                    tweet,
                    type: "tweet"
                });
            });
    }

    handleGyfcat(url, callback) {
        let name = this.recycleRegex('Gyfcat').exec(url).pop();
        let mime = "video/webm";
        callback({
            url: url,
            parsedUrl: [{ url:"http://giant.gfycat.com/" + name + ".webm", mime },
                        { url:"http://fat.gfycat.com/" + name + ".webm", mime },
                        { url:"http://zippy.gfycat.com/" + name + ".webm", mime }],
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
            }).end((err, res) => {
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
            parsedUrl: [{ url: "http://i.imgur.com/" + imgurId + ".webm", mime: "video/webm" },
                        { url: "http://i.imgur.com/" + imgurId + ".mp4", mime: "video/mp4" }],
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
