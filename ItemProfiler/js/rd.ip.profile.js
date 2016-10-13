if (!window['rd']) { window['rd'] = {}; }
if (!window['rd']['ip']) { window['rd']['ip'] = {}; }

rd.ip.Profile = function(data) {
    var self = this,
      RISE_CACHE_PATH = "http://localhost:9494/files?url=";

    this.data = data;

    if (data) {
        if (data.length == 1) { //if only image URL is supplied
            this.imageUrl = data[0];
        } else {
            rd.ip.globals.createProfile(this, data);
        }

        this.image = null;
        this.imageState = ""; //"" or "loaded" or "error"

        if (rd.ip.core.useProxy) {
          rd.ip.core.isV2Running(function(isV2) {
            if (self.imageUrl) {
              if (isV2) {
                self.imageUrl = RISE_CACHE_PATH + encodeURIComponent(self.imageUrl);
              } else {
                self.imageUrl = rd.ip.globals.IMAGE_PROXY_PATH + escape(self.imageUrl);
              }

              self.loadImage();
            }
          })
        } else {
          this.loadImage();
        }
    }
};

rd.ip.Profile.prototype.loadImage = function() {
    this.image = new Image();

    var _this = this;
    this.image.onload = function() {
        _this.handleImageLoaded();
    }
    this.image.onerror = function() {
        _this.handleImageError();
    }
    this.image.onabort = function() {
        _this.handleImageError();
    }
    this.image.crossOrigin = 'anonymous'; // no credentials flag
    this.image.src = this.imageUrl;
};

rd.ip.Profile.prototype.handleImageLoaded = function() {
    this.imageState = "loaded";
}

rd.ip.Profile.prototype.handleImageError = function() {
    this.imageState = "error";
}
