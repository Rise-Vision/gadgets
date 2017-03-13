function PhotoAlbum() {
    var prefs = new gadgets.Prefs();

    this.url = prefs.getString("url");
    this.visualOption = prefs.getString("visualOption");
    this.maxImages = prefs.getInt("maxImages");
    this.entries = null;
    this.isLoading = true;
    this.isFeedLoaded = false;
    this.isLastPhoto = false;
    this.isStarted = false;
    this.feedLoadFailedTimer = null;
    this.feedLoadFailedCount = 0;
    this.images = [];
    this.captions = [];
    this.imageCount = 0;
    //this.checkForUpdates = false;
    //this.updateInterval = 60000;
}
PhotoAlbum.prototype.initialize = function() {
    var self = this;
    
    $.ajaxSetup({
	cache: true
    });
    
    //Dynamically load external Javascript and CSS files.
    if (this.visualOption == "slideShow") {
	$("<link/>", {
	    rel: "stylesheet",
	    type: "text/css",
	    href: "https://s3.amazonaws.com/Gadget-Photo-Album/SlideShow/css/SlideShow.css"
	 }).appendTo("head");
	
	$.getScript("https://s3.amazonaws.com/Gadget-Photo-Album/SlideShow/js/SlideShow.min.js", function() {
	    self.loadFeed();		
	});  
    }    
    else if (this.visualOption == "collage") {
	$("<link/>", {
	    rel: "stylesheet",
	    type: "text/css",
	    href: "https://s3.amazonaws.com/Gadget-Photo-Album/Collage/css/Collage.css"
	}).appendTo("head");
	
	$.getScript("https://s3.amazonaws.com/Gadget-Photo-Album/Collage/js/Collage.min.js", function() {
	    self.loadFeed();		
	});
    }
    else if (this.visualOption == "coverFlow") {
	this.loadFeed();
    }
}
PhotoAlbum.prototype.loadFeed = function() {
    var self = this,
	params = {};
    
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 60;
    
    //Start a timer in case there is a problem loading the feed.
    this.feedLoadFailedTimer = setTimeout(function() {
	self.feedLoadFailed();
    }, 5000);
    
    gadgets.io.makeRequest(this.url, function(obj) {
	if (obj.errors.length == 0) {
	    clearTimeout(self.feedLoadFailedTimer);	    
	    self.onFeedLoaded(obj);	    
	}
    }, params);
}
PhotoAlbum.prototype.onFeedLoaded = function(obj) {
    var item;
	
    this.isFeedLoaded = true;
    
    //This will return all items, so we need to limit to Maximum Images setting.
    for (var i = obj.data.getElementsByTagName("item").length - 1; i >= this.maxImages; i--) {
	item = obj.data.getElementsByTagName("item")[i];
	item.parentNode.removeChild(item);
    }
    
    if (obj.data && obj.data.getElementsByTagName("item").length > 0) {
	this.entries = obj.data.getElementsByTagName("item");
	this.loadPhotos();
    }
    else {
	console.log("This feed has no items.");
	readyEvent();
    }
}
PhotoAlbum.prototype.loadPhotos = function() {
    var $group, $content, title, description, url, imageProps
	self = this,
	prefs = new gadgets.Prefs(),
	rsW = prefs.getInt("rsW"),
	rsH = prefs.getInt("rsH"),
	supportedTypes = new Array("image/bmp", "image/gif", "image/jpeg", "image/png", "image/tiff");
    
    this.oldImages = this.images;
    this.images = new Array();
    this.captions = new Array();

    $.each(this.entries, function(index, value) {
	$group = $(this).find("group");
	
	if ($group.length > 0) {
	    $content = $group.find("content");
	    
	    if ($content.length > 0) {
		for (var j in supportedTypes) {
		    if ($content.attr("type") == supportedTypes[j]) {
			imageProps = {};
			url = $content.attr("url")
			
			self.addCaption($group.find("title").text(), $group.find("description").text(), url);
			
			imageProps.src = url;
			imageProps.caption = self.captions[index].caption;
			
			self.images.push(imageProps);
			self.load(imageProps.src, index);
			
			break;
		    }
		}
	    }
	}
	//Issue 952 Start
	else {
	    $content = $(this).find("content");
	    
	    if ($content.length > 0) {
		for (var j in supportedTypes) {
		    if ($content.attr("type") == supportedTypes[j]) {
			imageProps = {};
			title = $(this).find("title");
			description = $(this).find("description");
			url = $content.attr("url");
			
			//Media RSS feeds may have both a <title> element and a <media:title> element.
			if (title.length > 1) {
			    title = $(title[1]).text();
			}
			else {
			    title = $(title).text();
			}
			
			//Media RSS feeds may have both a <description> element and a <media:description> element.
			if (description.length > 1) {
			    description = $(description[1]).text();
			}
			else {
			    description = $(description).text();
			}
			
			self.addCaption(title, description, url);
			
			imageProps.src = url;
			imageProps.caption = self.captions[index].caption;
			
			self.images.push(imageProps);
			self.load(imageProps.src, index);
			
			break;
		    }
		}
	    }
	    else if (self.isLoading) {
		self.isLoading = false;
		readyEvent();
	    }
	}
	//Issue 952 End
    });
}
PhotoAlbum.prototype.addCaption = function(title, description, url, isFirst) {
    var field,
	isPicasa = this.url.indexOf("https://picasaweb.google.com", 0) != -1 ? true : false;

    if (isPicasa) {
	if (description == null || description == "") {
	    field = title;
	}
	else {
	    field = description;
	}
    }
    else {
	//Store URL with the caption so we can match the caption to the correct image as the images are loaded.
	if (title == null || title == "") {
	    field = description;
	}
	else {
	    field = title;
	}
    }
    
    if (isFirst) {
	this.captions.unshift({src: url, caption: field});
    }
    else {
	this.captions.push({src: url, caption: field});
    }
}
PhotoAlbum.prototype.load = function(url, index) {
    if (this.visualOption == "slideShow") {
	this.loadSlideShow(url, index);
    }
    else if (this.visualOption == "coverFlow") {
	this.loadCoverFlow(url, index);
    }
    else {
	this.loadCollage(url, index);
    }
}
PhotoAlbum.prototype.loadSlideShow = function(src, index) {
    var self = this,
	prefs = new gadgets.Prefs(),
	rsW = prefs.getInt("rsW"),
	rsH = prefs.getInt("rsH"),
	settings = {
	    url: src + "?imgmax=1600&dummy=" + Math.ceil(Math.random() * 100),
	    rsW: rsW,
	    rsH: rsH,
	    callback: function (newWidth, newHeight) {
		var matchFound = false;
		
		//Issue 920 Start - Preserve old dimensions.
		for (var i = 0; i < self.oldImages.length; i++) {
		    if (src == self.oldImages[i].src) {
			self.images[index].width = self.oldImages[i].width;
			self.images[index].height = self.oldImages[i].height;
			self.images[index].marginTop = self.oldImages[i].marginTop;
			self.images[index].marginLeft = self.oldImages[i].marginLeft;
			matchFound = true;
			
			break;
		    }
		}
		
		if (!matchFound) {
		    self.images[index].width = newWidth;
		    self.images[index].height = newHeight;
		    self.images[index].marginTop = -(newHeight / 2) + "px";
		    self.images[index].marginLeft = -(newWidth / 2) + "px";
		}
		//Issue 920 End
		
		if (!window.slideShow) {
		    window.slideShow = new SlideShow(self.onLastPhotoShown);
		    window.slideShow.initialize();
		}

		if (self.isLoading) {
		    window.slideShow.addImage(self.images[index]);
		}
		
		self.imageCount++;
		self.onImageLoaded();
	    },
	    onerror: function() {
		//Issue 1023 Start - Preserve old dimensions.
		for (var i = 0; i < self.oldImages.length; i++) {
		    if (src == self.oldImages[i].src) {
			self.images[index].width = self.oldImages[i].width;
			self.images[index].height = self.oldImages[i].height;
			self.images[index].marginTop = self.oldImages[i].marginTop;
			self.images[index].marginLeft = self.oldImages[i].marginLeft;
			
			break;
		    }
		}
		//Issue 1023 End
		
		self.imageCount++;
		self.onImageLoaded();
		console.log("Error loading image " + src);
	    }
	};
	
    RiseVision.Common.Utility.scaleToFit(settings);
}
PhotoAlbum.prototype.loadCoverFlow = function(src, index) {
    var self = this,
	prefs = new gadgets.Prefs(),
	rsW = prefs.getInt("rsW"),
	rsH = prefs.getInt("rsH"),
	settings = {
	    url: src + "?imgmax=1600&dummy=" + Math.ceil(Math.random() * 100),
	    rsW: rsW,
	    rsH: rsH,
	    callback: function (newWidth, newHeight) {
		var matchFound = false;

		//Issue 920 Start - Preserve old dimensions.
		for (var i = 0; i < self.oldImages.length; i++) {
		    if (src == self.oldImages[i].src) {
			self.images[index].width = self.oldImages[i].width;
			self.images[index].height = self.oldImages[i].height;
			self.images[index].marginTop = self.oldImages[i].marginTop;
			self.images[index].marginLeft = self.oldImages[i].marginLeft;
			matchFound = true;
			
			break;
		    }
		}
		
		if (!matchFound) {
		    self.images[index].width = newWidth;
		    self.images[index].height = newHeight;
		    self.images[index].marginTop = -(newHeight / 2) + "px";
		    self.images[index].marginLeft = -(newWidth / 2) + "px";
		}
		//Issue 920 End
		
		self.imageCount++;
		self.onImageLoaded();
	    },
	    onerror: function() {
		//Issue 1023 Start - Preserve old dimensions.
		for (var i = 0; i < self.oldImages.length; i++) {
		    if (src == self.oldImages[i].src) {
			self.images[index].width = self.oldImages[i].width;
			self.images[index].height = self.oldImages[i].height;
			self.images[index].marginTop = self.oldImages[i].marginTop;
			self.images[index].marginLeft = self.oldImages[i].marginLeft;
			
			break;
		    }
		}
		//Issue 1023 End
		
		self.imageCount++;
		self.onImageLoaded();
		console.log("Error loading image " + src);
	    }
	};
	
    RiseVision.Common.Utility.scaleToFit(settings);
}
PhotoAlbum.prototype.loadCollage = function(src, index) {
    var self = this;
    var prefs = new gadgets.Prefs(),
	maxSize = prefs.getInt("maxSize");
    var settings = {
	url: src + "?imgmax=1600&dummy=" + Math.ceil(Math.random() * 100),
	rsW: maxSize,
	rsH: maxSize,
	callback: function (newWidth, newHeight) {
	    var matchFound = false;
	    
	    //Issue 920 Start - Preserve old dimensions.
	    for (var i = 0; i < self.oldImages.length; i++) {
		if (src == self.oldImages[i].src) {
		    self.images[index].width = self.oldImages[i].width;
		    self.images[index].height = self.oldImages[i].height;
		    matchFound = true;
		    
		    break;
		}
	    }
	    
	    if (!matchFound) {
		self.images[index].width = newWidth;
		self.images[index].height = newHeight;
	    }
	    //Issue 920 End
	    
	    if (!window.collage) {
		window.collage = new Collage(self.onLastPhotoShown);
		window.collage.initialize();
	    }
	    
	    if (self.isLoading) {
		window.collage.addImage(self.images[index]);
	    }
	    
	    self.imageCount++;
	    self.onImageLoaded();
	},
	onerror: function() {
	    //Issue 1023 Start - Preserve old dimensions.
	    for (var i = 0; i < self.oldImages.length; i++) {
		if (src == self.oldImages[i].src) {
		    self.images[index].width = self.oldImages[i].width;
		    self.images[index].height = self.oldImages[i].height;
		    
		    break;
		}
	    }
	    //Issue 1023 End
		
	    self.imageCount++;
	    self.onImageLoaded();
	    console.log("Error loading image " + src);
	}
    };
	
    RiseVision.Common.Utility.scaleToFit(settings);
}
PhotoAlbum.prototype.onImageLoaded = function() {
    var i = 0,
	numImages = this.images.length;
    
    if (this.visualOption == "slideShow") {
	if (!this.isLoading) {
	    //Show images in same order as feed on all cycles after the first.
	    if (this.imageCount == numImages) {
		for (i = 0; i < numImages; i++) {
		    window.slideShow.addImage(this.images[i]);
		}
		    
		window.slideShow.play();
	    }
	}
	else {
	    //Initialize Gadget after 10 images have been loaded, or after all images have been loaded (if less than 10).
	    if ((this.imageCount == 10) || (this.imageCount == numImages && !this.isStarted)) {
		this.isStarted = true;
		readyEvent();
	    }
	}
	
	if (this.imageCount == numImages) {
	    this.imageCount = 0;
	    this.isStarted = false;
	    this.isLoading = false;
	}
    }
    else if (this.visualOption == "coverFlow") {
	//Not sure images can be easily added to CoverFlow as they are loaded.
	//if ((this.imageCount == 10) || (this.imageCount == this.entries.length && !this.isStarted)) {
	if (this.imageCount == numImages) {
	    if (!window.coverFlow) {
		window.coverFlow = new CoverFlow(this.images, this.onLastPhotoShown);
	    }
	    else {
		window.coverFlow.setPhotos(this.images);
	    }
	    
	    window.coverFlow.render(this.onRendered, this);
	    this.imageCount = 0;
	}
    }
    else {	//Collage
	if (!this.isLoading) {
	    //Show images in same order as feed on all cycles after the first.
	    if (this.imageCount == numImages) {
		for (i = numImages - 1; i >= 0; i--) {
		    window.collage.addImage(this.images[i]);
		}
		    
		window.collage.play();
	    }
	}
	else {
	    //Initialize Gadget after 10 images have been loaded, or after all images have been loaded (if less than 10).
	    if ((this.imageCount == 10) || (this.imageCount == numImages && !this.isStarted)) {
		this.isStarted = true;
		readyEvent();
	    }
	}
	
	if (this.imageCount == numImages) {
	    this.imageCount = 0;
	    this.isStarted = false;
	    this.isLoading = false;
	}
    }
}
PhotoAlbum.prototype.onRendered = function(self) {
    if (self.isLoading) {
	self.isLoading = false;
	readyEvent();
    }
    else {
	if (self.visualOption == "slideShow") {
	    window.slideShow.play();
	}
	else if (self.visualOption == "coverFlow") {
	    window.coverFlow.play();
	    //this.startTimer();
	}
    }
}
//Some problems with this. Implement later.
//PhotoAlbum.prototype.startTimer = function() {
//    var self = this;
//    
//    setTimeout(function() {
//	self.checkForUpdates = true;
//    }, this.updateInterval);
//}
PhotoAlbum.prototype.onLastPhotoShown = function() {
    //Only reload images if at least a minute has passed since the last update.
    //if (this.checkForUpdates) {
	//this.checkForUpdates = false;
	this.isFeedLoaded = false;
	this.isLastPhoto = true;
	doneEvent();
    //}
//    else {
//	this.play();
//    }
}
//This function will be called if the feed fails to load, for example, when there is no Internet connection.
//In that case, continue showing the same photos.
PhotoAlbum.prototype.feedLoadFailed = function() {
    var i,
	numImages = this.images.length;
    
    this.feedLoadFailedCount++;
    
    if (this.visualOption == "slideShow") {
	if (window.slideShow != null) {
	    //Add the images again since they were removed after the last photo was shown.
	    for (i = 0; i < numImages; i++) {
		window.slideShow.addImage(this.images[i]);
	    }
		
	    window.slideShow.play();
	}
    }
    else if (this.visualOption == "coverFlow") {
	if (window.coverFlow != null) {
	    window.coverFlow.render(this.onRendered, this);
	}
    }
    else if (this.visualOption == "collage") {
	if (window.collage != null) {
	    for (i = numImages - 1; i >= 0; i--) {
		window.collage.addImage(this.images[i]);
	    }
		
	    window.collage.play();
	}
    }
}
PhotoAlbum.prototype.play = function() {
    if (this.isFeedLoaded) {
	if (this.visualOption == "slideShow") {
	    window.slideShow.play();
	}
	else if (this.visualOption == "coverFlow") {
	    window.coverFlow.play();
	}
	else {
	    window.collage.play();
	}
    }
    else {
	this.loadFeed();
    }
}
PhotoAlbum.prototype.pause = function() {
    if (this.visualOption == "slideShow") {
	window.slideShow.pause();
    }
    else if (this.visualOption == "coverFlow") {
	window.coverFlow.pause();
    }
    else {
	window.collage.pause();
    }
}