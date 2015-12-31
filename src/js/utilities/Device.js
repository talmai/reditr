class Device {

    constructor() {
        this.useragent = navigator.userAgent.toLowerCase();
    }

    isAndroid() {
        return this.useragent.indexOf("android") > -1;
    }

    isIOS() {
        return this.useragent.search(/(ipad|iphone|ipod)/) > -1;
    }

    isIE() {
        return this.useragent.indexOf("msie") > -1;
    }

}

export default new Device;
