var RiseVision = RiseVision || {};
RiseVision.ReutersNews = {};
RiseVision.ReutersNews.Controller = {};

RiseVision.ReutersNews.Controller = function(displayID) {
    var news = "";

    displayID = "cc12342d-fbcc-4ae7-8c0c-eb0b74bdbf23";

    this.isFeedLoaded = false;
    this.currentIndex = 0;
    this.nextIndex = 0;
    this.imageCount = 0;
    this.feedLoadFailedInterval = 5000;
    this.refreshInterval = 60000;
    this.images = new Array();
    this.layout = prefs.getString("layout");
    this.itemsCount = prefs.getInt("itemsCount");
    this.transition = prefs.getString("transition");
    this.transitionHold = prefs.getInt("transitionHold") * 1000;
    this.transitionResumes = prefs.getInt("transitionResumes") * 1000;
    this.scrollDirection = prefs.getString("scrollDirection");
    this.startTimeout = new Date();
    this.timeLeft = 0;
    this.isLoading = true;
    this.isPlaying = false;
    this.isPaused = false;
    this.isDone = false;
    this.isFadingIn = false;
    this.isFadingOut = false;
    this.util = RiseVision.Common.Utility;
    this.url = "http://content-news.appspot.com/news/data?DisplayId=" + displayID + "&CategoryCodeList=";

    if (prefs.getBool("entertainment")){
	news = "OLUSENT";
    }

    if (prefs.getBool("sports")){
	news += news == "" ? "OLUSSPORT" : "|OLUSSPORT";
    }

    if (prefs.getBool("top")){
	news += news == "" ? "OLUSTOPNEWS" : "|OLUSTOPNEWS";
    }

    this.url += news;

    if (prefs.getString("layout") == "custom") {
	this.layoutURL = prefs.getString("layoutURL");
    }
    else {
	this.layoutURL = "https://s3.amazonaws.com/Gadget-Reuters-News/layouts/" + prefs.getString("layout");
    }

    if ((prefs.getString("layout") == "4x1-no-image-no-headline") ||
	(prefs.getString("layout") == "4x1-no-image")) {
	this.isMediaLayout = false;
    }
    else {
	this.isMediaLayout = true;
    }
}
RiseVision.ReutersNews.Controller.prototype.getAdditionalParams = function(name, value) {
    if (name == "additionalParams") {
	if (value) {
	    var styleNode = document.createElement("style");

	    value = JSON.parse(value);

	    //Inject CSS font styles into the DOM.
	    styleNode.appendChild(document.createTextNode(value["headline_font-style"]));
	    styleNode.appendChild(document.createTextNode("a:active" + value["headline_font-style"]));
	    styleNode.appendChild(document.createTextNode("a:visited" + value["headline_font-style"]));
	    styleNode.appendChild(document.createTextNode(value["story_font-style"]));
	    styleNode.appendChild(document.createTextNode(value["date_font-style"]));
	    document.getElementsByTagName("head")[0].appendChild(styleNode);

	    controller.headlinePadding =  parseInt(value.headlinePadding);
	    controller.headlineColor = value.headlineColor;

	    controller.storyPadding =  parseInt(value.storyPadding);
	    controller.storyColor = value.storyColor;

	    controller.mediaPadding = parseInt(value.mediaPadding);

	    controller.datePadding =  parseInt(value.datePadding);
	    controller.dateColor = value.dateColor;
	}
    }

    controller.initialize();
}
RiseVision.ReutersNews.Controller.prototype.initialize = function() {
    var self = this,
	params = {};

    if (this.layoutURL) {
	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;

	gadgets.io.makeRequest(this.layoutURL, function(obj) {
	    var data = obj.data;

	    if (data.getElementsByTagName("Style").length > 0) {
		var head = document.getElementsByTagName("head")[0],
		    style = document.createElement("style");

		style.type = "text/css";
		style.innerHTML = data.getElementsByTagName("Style")[0].childNodes[1].nodeValue;
		head.appendChild(style);
	    }

	    if (data.getElementsByTagName("Layout").length == 0) {
		return;
	    }

	    self.item = data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue;

	    //Get news data.
	    $.ajax({
		url: self.url,
		success: function(data) {
		    self.onFeedLoaded(data);
		},
		dataType: "xml"
	    });
	}, params);
    }
}
RiseVision.ReutersNews.Controller.prototype.loadFeed = function() {
    var self = this;

    //Start a timer in case there is a problem loading the feed.
    this.feedLoadFailedTimer = setTimeout(function() {
	self.feedLoadFailed();
    }, this.feedLoadFailedInterval);

    //Get news data.
    $.ajax({
	url: this.url,
	success: function(data) {
	    if (!self.isFeedLoaded) {
		clearTimeout(self.feedLoadFailedTimer);
		self.onFeedLoaded(data);
	    }
	},
	dataType: "xml"
    });
}
RiseVision.ReutersNews.Controller.prototype.onFeedLoaded = function(obj) {
    var queue = prefs.getInt("queue"), oldTitle, newTitle, oldHeadline, newHeadline;

    this.isFeedLoaded = true;

    //Remove stories with duplicate headlines.
    for (var i = 0; i < obj.getElementsByTagName("Headline").length - 1; i++) {
	oldHeadline = obj.getElementsByTagName("Headline")[i];
	oldTitle = this.util.getNodeValue(oldHeadline.getElementsByTagName("Title"));

	for (var j = i + 1; j < obj.getElementsByTagName("Headline").length; j++) {
	    newHeadline = obj.getElementsByTagName("Headline")[j];
	    newTitle = this.util.getNodeValue(newHeadline.getElementsByTagName("Title"));

	    if (oldTitle == newTitle) {
		newHeadline.parentNode.removeChild(newHeadline);
	    }
	}
    }

    //This will return all headlines, so we need to limit to itemsCount.
    for (var i = obj.getElementsByTagName("Headline").length - 1; i >= queue; i--) {
	item = obj.getElementsByTagName("Headline")[i];
	item.parentNode.removeChild(item);
    }

    if (obj && obj.getElementsByTagName("Headlines").length > 0) {
	this.showFeed(obj);
    }
    else {
	console.log("No news stories found.");
	readyEvent();
    }
}
//This function will be called if the feed fails to load, for example, when there is no Internet connection.
//In that case, continue playing the same headlines.
RiseVision.ReutersNews.Controller.prototype.feedLoadFailed = function() {
    this.isFeedLoaded = true;

    if (this.transition == "fade") {
	this.isFadingIn = false;
	this.isFadingOut = false;

	if (!this.isPaused) {
	    this.showHeadline();
	}
    }
    else if (this.transition == "none") {
	if (!this.isPaused) {
	    this.showHeadline();
	}
    }
}
//This is only called when the feed has loaded or been reloaded.
RiseVision.ReutersNews.Controller.prototype.showFeed = function(obj) {
    var data = [],
	self = this;

    if (this.isHorizontal()) {
	if (this.isLoading) {
	    this.feedData = obj;
	    this.headlines = this.feedData.getElementsByTagName("Headline");

	    //Remove UI used for other transition types.
	    $("#hiddenContainer").remove();
	    $("#container").remove();

	    for (var i = 0; i < this.headlines.length; i++) {
		data.push(this.getHorizontalScrollData(this.headlines[i]));
	    }

	    var settings = {
		width: prefs.getInt("rsW"),
		height: prefs.getInt("rsH"),
		scrollBy: this.transition,
		scrollDirection: this.scrollDirection,
		speed: prefs.getString("scrollSpeed"),
		duration: this.transitionHold,
		interactivityTimeout: this.transitionResumes
	    };

	    this.horizontalScroll = new RiseVision.Common.HorizontalScroll(settings, data);

	    $(this.horizontalScroll).bind({
		done: function() {
		    doneEvent();
		}
	    });

	    readyEvent();
	}
	else {
	    //Save old and new data so that they can be compared.
	    this.oldData = this.feedData;
	    this.feedData = obj;
	    this.headlines = this.feedData.getElementsByTagName("Headline");
	    this.updateHorizontalScrollData();
	}
    }
    //Vertical scrolling, Fade or None transition.
    else {
	if (this.feedData != null) {
	    this.oldData = this.feedData;
	}

	this.feedData = obj;
	this.headlines = this.feedData.getElementsByTagName("Headline");
	this.imageURLs = new Array();

	//Check if there are any images to be displayed with this feed.
	if (this.isMediaLayout) {
	    this.getMedia();
	}

	//Preload any images.
	if (this.hasImage() && this.isMediaLayout) {
	    this.preloadImages();
	}
	else {
	    if (this.transition == "fade") {
		this.isFadingIn = false;
		this.isFadingOut = false;

		if (this.isLoading) {
		    this.init();
		}
		else {
		    this.showHeadline();
		}
	    }
	    else if (this.transition == "none") {
		if (this.isLoading) {
		    this.init();
		}
		else {
		    this.showHeadline();
		}
	    }
	    else {
		if (this.isLoading) {
		    this.init();
		}
		else {
		    this.updateVerticalScrollData();
		}
	    }
	}
    }
}
/* Start - Functions for all transition types except for horizontal scrolling. */
RiseVision.ReutersNews.Controller.prototype.init = function() {
    var self = this,
	dimensions = null;

    //For multi-page Presentations.
    $("#container").width(prefs.getString("rsW"));
    $("#container").height(prefs.getString("rsH"));

    if ((this.transition == "fade") || (this.transition == "none")) {
	$(".page").bind({
	    touchstart: function(e) {
		clearTimeout(self.showFeedTimer);

		self.showFeedTimer = setTimeout(function() {
		    self.showNext();
		}, self.transitionResumes);
	    }
	});

	this.addItems();

	$(".item").each(function(i) {
	    if (self.nextIndex < self.headlines.length) {
		self.populateItem(self.headlines[self.nextIndex], i, self.nextIndex);
		self.nextIndex++;
	    }
	});
    }
    else {
	this.showAllHeadlines();
	$(".item").height(this.getItemHeight());
    }

    if (this.isLoading) {
	if ((this.transition != "fade") && (this.transition != "none")) {
	    $("#container").infiniteScroll({
		direction: this.scrollDirection,
		scrollBy: this.transition,
		duration: this.transitionHold,
		speed: prefs.getString("scrollSpeed"),
		swipingTimeout: this.transitionResumes
	    })
	    .bind("onLastItemScrolled", function(e) {
		doneEvent();
	    });
	}

	readyEvent();
    }
}
RiseVision.ReutersNews.Controller.prototype.addItems = function() {
    $(".item").remove();

    for (var i = 0; i < this.itemsCount; i++) {
	$(".page").append(this.item);
    }

    this.applyStyle();

    $(".item").height(this.getItemHeight());
}
RiseVision.ReutersNews.Controller.prototype.applyStyle = function() {
    $(".headline").css({
	"padding": this.headlinePadding,
	"background-color": this.headlineColor
    });
    $(".story").css({
	"padding": this.storyPadding,
	"background-color": this.storyColor
    });
    $(".image").css({
	"padding": this.mediaPadding
    });
    $(".date").css({
	"padding": this.datePadding,
	"background-color": this.dateColor
    });
}
/*
 * Check for images.
 */
RiseVision.ReutersNews.Controller.prototype.getMedia = function() {
    var numItems = this.feedData.getElementsByTagName("Headline").length,
	found, imageIncluded, imageURL;

    for (var i = 0; i < numItems; i++) {
	found = false;
	imageIncluded = this.util.getNodeValue(this.headlines[i].getElementsByTagName("ImageIncluded"));

	if (imageIncluded == "1") {
	    imageURL = this.util.getNodeValue(this.headlines[i].getElementsByTagName("ImageURL"));

	    if (imageURL != "") {
		this.imageURLs.push(imageURL);
		found = true;
	    }
	}

	//Add a null url if this particular headline has no image.
	if (!found) {
	    this.imageURLs.push(null);
	}
    }
}
//Preload the images.
RiseVision.ReutersNews.Controller.prototype.preloadImages = function() {
    var toLoad = this.imageURLs.length;

    this.imageCount = 0;
    this.images = new Array();
    this.loadImage(toLoad);
}
//Load each image.
RiseVision.ReutersNews.Controller.prototype.loadImage = function(toLoad) {
    var self = this,
	feedImage;

    //Add a null image if there is no URL.
    if (this.imageURLs[this.imageCount] == null) {
	this.onImageLoaded(null, toLoad);
    }
    else {
	feedImage = new Image();

	feedImage.onload = function() {
	    self.onImageLoaded(feedImage, toLoad);
	}

	feedImage.onerror = function() {
	    console.log("Unable to load " + this.src);
	    self.onImageLoaded(null, toLoad);
	}

	feedImage.src = this.imageURLs[this.imageCount];
    }
}
RiseVision.ReutersNews.Controller.prototype.onImageLoaded = function(image, toLoad) {
    this.images.push(image);
    this.imageCount++;
    toLoad--;

    if (toLoad == 0) {
	if (this.isLoading) {
	    this.init();
	}
	else {
	    if (this.transition == "fade") {
		this.isFadingIn = false;
		this.isFadingOut = false;
		this.showHeadline();
	    }
	    else if (this.transition == "none") {
		this.showHeadline();
	    }
	    //Vertical scrolling
	    else {
		this.updateVerticalScrollData();
	    }
	}
    }
    else {
	this.loadImage(toLoad);
    }
}
RiseVision.ReutersNews.Controller.prototype.populateItem = function(headline, elementIndex, mediaIndex) {
    var title = this.util.getNodeValue(headline.getElementsByTagName("Title")),
	summary = this.util.getNodeValue(headline.getElementsByTagName("Summary")),
	date = this.util.getNodeValue(headline.getElementsByTagName("SourceTimeStamp"));

    //Headline
    if (title == "") {
	$(".headline").eq(elementIndex).hide();
    }
    else {
	$(".headline a").eq(elementIndex).html(title);
	$(".headline").eq(elementIndex).show();
    }

    //Summary or Story
    if (summary != "") {
	if (prefs.getString("contentType") == "summary") {
	    //Strip HTML tags from story and truncate after 120 characters.
	    $(".story").eq(elementIndex).text(this.util.truncate($("<div/>").html(summary).text(), 120));
	}
	else {
	    $(".story").eq(elementIndex).html(summary);
	}

	$(".story").eq(elementIndex).show();
    }
    else {
	$(".story").eq(elementIndex).hide();
    }

    //Date
    if (prefs.getBool("date") && (date != "")) {
	$(".date").eq(elementIndex).text(new Date(date).toString("MMMM dS, yyyy"));
	$(".date").eq(elementIndex).attr("datetime", new Date(date).toString("yyyy-MM-dd"));
	$(".date").eq(elementIndex).show();
    }
    else {
	$(".date").eq(elementIndex).hide();
    }

    if (this.showSeparator()) {
	$(".item").css("border-bottom", "solid " + prefs.getInt("separatorSize") + "px " + prefs.getString("separatorColor"));
    }

    if ((this.images[mediaIndex] != null) && this.images[mediaIndex].src) {
	$(".image").eq(elementIndex).attr("src", this.images[mediaIndex].src);
	$(".image").eq(elementIndex).show();
	this.getMediaDimensions(elementIndex, this.images[mediaIndex], $("#container .image").eq(elementIndex));
    }
    else {
	$(".image").eq(elementIndex).hide();
    }

    if (((this.transition != "fade") && (this.transition != "none")) || this.isLoading) {
	$(".item").eq(elementIndex).dotdotdot({
	    height: this.getItemHeight()
	});
    }
}
/*
 * Calculate dimensions of an image so that it will fit within the available space.
 */
RiseVision.ReutersNews.Controller.prototype.getMediaDimensions = function(index, media, $element) {
    var dimensions = {},
	ratioX, ratioY, scale, width, height;

    $("#hiddenContainer").empty();
    $("#hiddenContainer").append($(".item").clone());

    //Width should be no greater than 50% of the width of the Placeholder unless there is no story text,
    //in which case it can be the full width of the Placeholder.
    if ((prefs.getString("layout") == "2x1-headline.xml") || (prefs.getString("layout") == "2x1-no-headline.xml")) {
	dimensions.width = prefs.getString("rsW") * 0.5;
	dimensions.height = (prefs.getString("rsH") / this.itemsCount) - $("#hiddenContainer .textWrapper").eq(index).outerHeight(true) - (this.mediaPadding * 2);

	if ($("#hiddenContainer .story").eq(index).length == 0) {
	    if ((prefs.getString("layout") == "2x1-headline.xml")) {
		dimensions.width = prefs.getString("rsW") - (this.mediaPadding * 2);
	    }
	}
    }
    else if ((prefs.getString("layout") == "1x2-headline.xml") || (prefs.getString("layout") == "1x2-no-headline.xml")) {
	dimensions.width = prefs.getString("rsW") - (this.mediaPadding * 2);
	//Reserve half of the height for the image.
	dimensions.height = ((prefs.getString("rsH") / this.itemsCount) - (this.mediaPadding * 2)) / 2;	//Issue 901
    }
    else if ((prefs.getString("layout") == "4x1-headline.xml") || (prefs.getString("layout") == "4x1-no-headline.xml")) {
	dimensions.width = prefs.getString("rsW") * 0.33;
	dimensions.height = (prefs.getString("rsH") / this.itemsCount) - (this.mediaPadding * 2);
    }
    else if (prefs.getString("layout") == "background.xml") {
	dimensions.width = prefs.getString("rsW") - (this.mediaPadding * 2);
	dimensions.height = prefs.getString("rsH") / this.itemsCount - prefs.getInt("separatorSize") - (this.mediaPadding * 2);
    }

    if (!$.isEmptyObject(dimensions)) {
	ratioX = dimensions.width / parseInt(media.width);
	ratioY = dimensions.height / parseInt(media.height);
	scale = ratioX < ratioY ? ratioX : ratioY;
	dimensions.width = parseInt(parseInt(media.width) * scale);
	dimensions.height = parseInt(parseInt(media.height) * scale);

	//Issue 901
	//Don't scale larger than native dimensions.
	//if ((dimensions.width > media.width) || (dimensions.height > media.height)) {
	//    dimensions.width = media.width;
	//    dimensions.height = media.height;
	//}

	if ($element != null) {
	    $element.width(dimensions.width);
	    $element.height(dimensions.height);
	}
    }

    $("#hiddenContainer").empty();

    return dimensions;
}
/* End - Functions for all transition types except for horizontal scrolling. */

/* Start - Functions specific to horizontal scrolling. */
RiseVision.ReutersNews.Controller.prototype.getHorizontalScrollData = function(item) {
    var headlines = [],
	title = this.util.getNodeValue(item.getElementsByTagName("Title")),
	summary = this.util.getNodeValue(item.getElementsByTagName("Summary")),
	date = this.util.getNodeValue(item.getElementsByTagName("SourceTimeStamp")),
	headlineFont, storyFont, dateFont;

    for (var i = 0; i < document.styleSheets[2].cssRules.length; i++) {
	var rule = document.styleSheets[2].cssRules[i].cssText;

	if (rule.indexOf("@font-face") == -1) {
	    //Custom font is being used.
	    if (rule.indexOf("headline_font-style") != -1) {
		headlineFont = document.styleSheets[2].cssRules[i].cssText;
	    }

	    if (rule.indexOf("story_font-style") != -1) {
		storyFont = document.styleSheets[2].cssRules[i].cssText;
	    }

	    if (rule.indexOf("date_font-style") != -1) {
		dateFont = document.styleSheets[2].cssRules[i].cssText;
	    }
	}
    }

    //Headline
    if (title != "") {
	headlines.push({
	    type: "text",
	    value: title,
	    fontRule: headlineFont,
	    padding: this.headlinePadding,
	    background: prefs.getString("headlineColor")
	});
    }

    //Date
    if (prefs.getBool("date") && (date != "")) {
	headlines.push({
	    type: "text",
	    value: new Date(date).toString("MMMM dS, yyyy"),
	    fontRule: dateFont,
	    padding: this.datePadding,
	    background: prefs.getString("dateColor")
	});
    }

    //Summary or Story
    if (summary != null) {
	if (prefs.getString("contentType") == "summary") {
	    //Strip HTML tags from story and truncate after 120 characters.
	    summary = this.util.truncate($("<div/>").html(summary).text(), 120);
	}
	else {
	    summary = this.util.unescapeHTML(summary);
	}

	headlines.push({
	    type: "text",
	    value: summary,
	    fontRule: storyFont,
	    padding: this.storyPadding,
	    background: prefs.getString("storyColor")
	});
    }

    return headlines;
}
RiseVision.ReutersNews.Controller.prototype.updateHorizontalScrollData = function() {
    var self = this,
        oldHeadlines = this.oldData.getElementsByTagName("Headline");

    if ((oldHeadlines != null) && (this.headlines != null)) {
	//Refresh the whole thing if headlines have been added or removed.
	//This would likely be a rare occurrence.
	if (this.headlines.length != oldHeadlines.length) {
	    $.each(this.headlines, function(index, headline) {
		self.updateItem(index, headline);
	    });
	}
	else {	//Check if the details have changed.
	    $.each(this.headlines, function(index, headline) {
		var oldHeadline = oldHeadlines[index],
		    isChanged = false;

		//Headline
		if (self.util.getNodeValue(headline.getElementsByTagName("headline")) != self.util.getNodeValue(oldHeadline.getElementsByTagName("headline"))) {
		    isChanged = true;
		}

		//Date
		if (prefs.getBool("date")) {
		    if (self.util.getNodeValue(headline.getElementsByTagName("SourceTimeStamp")) != self.util.getNodeValue(oldHeadline.getElementsByTagName("SourceTimeStamp"))) {
			isChanged = true;
		    }
		}

		//Summary or Story
		if (self.util.getNodeValue(headline.getElementsByTagName("description")) != self.util.getNodeValue(oldHeadline.getElementsByTagName("description"))) {
		    isChanged = true;
		}

		if (isChanged) {
		    self.updateItem(index, headline);
		}
	    });
	}
    }
}
RiseVision.ReutersNews.Controller.prototype.updateItem = function(index, headline) {
    var data = [];

    data = this.getHorizontalScrollData(headline);
    this.horizontalScroll.updateItem(index, data);
    data = null;
}
/* End - Functions specific to horizontal scrolling. */

/* Start - Functions specific to vertical scrolling. */
RiseVision.ReutersNews.Controller.prototype.showAllHeadlines = function() {
    var //elementIndex = 0,
	len = this.headlines.length;

    for (var i = 0; i < len; i++) {
	$(".page").append(this.item);
    }

    this.applyStyle();

    for (var i = 0; i < len; i++) {
	this.populateItem(this.headlines[i], i, i);
    }
}
//Update feed entries in-place if they have changed.
RiseVision.ReutersNews.Controller.prototype.updateVerticalScrollData = function() {
    var self = this,
	isChanged = false,
	oldHeadlines = this.oldData.getElementsByTagName("Headline"),
	oldHeadline, oldID, id, title, summary, date;

    $.each(this.headlines, function(index, headline) {
	oldHeadline = oldHeadlines[index];
	oldID = self.util.getNodeValue(oldHeadline.getElementsByTagName("Id"));
	id = self.util.getNodeValue(headline.getElementsByTagName("Id"));
	title = self.util.getNodeValue(headline.getElementsByTagName("Title"));
	summary = self.util.getNodeValue(headline.getElementsByTagName("Summary"));
	date = self.util.getNodeValue(headline.getElementsByTagName("SourceTimeStamp"));

	if (id != oldID) {
	    var $item = $(".item").eq(index);

	    $item.find(".headline a").text(self.util.unescapeHTML(title));
	    $item.find(".headline").show();

	    //Summary or Story
	    if (summary != "") {
		if (prefs.getString("contentType") == "summary") {
		    //Strip HTML tags from story and truncate after 120 characters.
		    $item.find(".story").eq(index).text(self.util.truncate($("<div/>").html(summary).text(), 120));
		}
		else {
		    $item.find(".story").eq(index).html(summary);
		}

		$item.find(".story").eq(index).show();
	    }
	    else {
		$item.find(".story").eq(index).hide();
	    }

	    //Date
	    if (prefs.getBool("date") && (date != "")) {
		$item.find(".date").eq(index).text(new Date(date).toString("MMMM dS, yyyy"));
		$item.find(".date").eq(index).attr("datetime", new Date(date).toString("yyyy-MM-dd"));
		$item.find(".date").eq(index).show();
	    }
	    else {
		$item.find(".date").eq(index).hide();
	    }

	    if ((self.images[index] != null) && self.images[index].src) {
		$(".image").eq(index).attr("src", self.images[index].src);
		$(".image").eq(index).show();
		self.getMediaDimensions(index, self.images[index], $("#container .image").eq(index));
	    }
	    else {
		$(".image").eq(index).hide();
	    }

	    $item.dotdotdot({
		height: self.getItemHeight()
	    });

	    isChanged = true;
	}
    });

//    if (isChanged) {
//	$(".item").dotdotdot({
//	    height: this.getItemHeight()
//	});
//    }
}
/* End - Functions specific to vertical scrolling. */

/* Start - Functions specific to Fade or None transitions. */
RiseVision.ReutersNews.Controller.prototype.showHeadline = function() {
    var self = this;

    if (this.currentIndex >= this.headlines.length) {
	this.timeLeft = 0;
	this.currentIndex = 0;
	this.nextIndex = 0;
	this.isDone = true;
	doneEvent();
    }
    else {
	//The first time an item is displayed, it will not transition in. This code will only execute once.
	if (this.isLoading) {
	    if (this.transition == "fade") {
		//600 is fade out only.
		this.transitionHold = prefs.getInt("transitionHold") * 1000 - 600;
	    }

	    this.startTimer();
	}
	else {
	    this.addItems();

	    $(".item").each(function(i) {
		if (self.nextIndex < self.headlines.length) {
		    self.populateItem(self.headlines[self.nextIndex], i, self.nextIndex);
		    $(".item").eq(i).show();
		}
		//Clear other item.
		else {
		    $(".item").eq(i).hide();
		}

		self.nextIndex++;	//Item to show on next cycle.
	    });

	    if (this.transition == "fade") {
		//1600 is transition time.
		this.transitionHold = prefs.getInt("transitionHold") * 1000 - 1200;

		if (!this.isFadingIn && !this.isFadingOut) {
		    this.isFadingIn = true;

		    //Need to make the container momentarily visible so that the dotdotdot plugin can get its height, as it would otherwise be 0.
		    $("#container").css({
			visibility: "hidden"
		    });

		    $(".item").dotdotdot({
			height: this.getItemHeight()
		    });

		    $("#container").css({
			visibility: "visible"
		    });

		    //Start the timer when fade in has completed.
		    $("#container").fadeTo("slow", 1.0, function() {
			self.isFadingIn = false;

			if (!self.isPaused) {
			    self.startTimer();
			}
		    });
		}
	    }
	    else {
		$(".item").dotdotdot({
		    height: this.getItemHeight()
		});

		if (!this.isPaused) {
		    this.startTimer();
		}
	    }
	}
    }
}
RiseVision.ReutersNews.Controller.prototype.showNext = function() {
    if (this.transition == "fade") {
	this.fadeOut();
    }
    else {
	this.transitionOut();
    }
}
RiseVision.ReutersNews.Controller.prototype.transitionOut = function() {
    var self = this;

    this.showFeedTimer = null;
    this.currentIndex = this.nextIndex;

    if (!this.isPaused) {
	this.showHeadline();
    }
}
RiseVision.ReutersNews.Controller.prototype.fadeOut = function() {
    var self = this;

    if (!this.isFadingIn && !this.isFadingOut) {
	this.showFeedTimer = null;
	this.isFadingOut = true;

	$("#container").fadeTo("slow", 0.01, function() {
	    self.isFadingOut = false;
	    self.currentIndex = self.nextIndex;

	    if (!self.isPaused) {	//This may break Market Wall?
		self.showHeadline();
	    }
	});
    }
}
RiseVision.ReutersNews.Controller.prototype.startTimer = function() {
    var self = this;

    //Ensure timer is cleared before starting it again.
    clearTimeout(this.showFeedTimer);

    this.showFeedTimer = setTimeout(function() {
	self.showNext();
    }, this.transitionHold);

    if (!this.isPaused) {
	this.startTimeout = new Date();
    }
}
RiseVision.ReutersNews.Controller.prototype.pauseTimer = function() {
    var seconds,
	self = this;

    //this.isPlaying is needed for multi-page Presentations (i.e. Market Wall).
    if (this.isPlaying) {
	clearTimeout(this.showFeedTimer);

	if ($(".item:first").is(":visible")) {
	    this.timeLeft = this.transitionHold;
	    this.timeLeft -= new Date() - this.startTimeout;

	    //Round to nearest second, since transitionHold is counted in seconds.
	    seconds = Math.round(this.timeLeft / 1000);
	    this.timeLeft = seconds * 1000;

	    //Issue 784 - Show next headline.
	    if (this.isDone || ((prefs.getInt("transitionHold") >= 20) && (seconds <= 10))) {
		this.timeLeft = 0;

		if (this.isDone) {
		    if (this.isFeedLoaded) {
			this.showHeadline();
		    }
		    else {
			this.loadFeed();
		    }
		}
		else {
		    this.showNext();
		}
	    }
	}
    }
}
RiseVision.ReutersNews.Controller.prototype.resumeTimer = function() {
    var self = this;

    if (this.isLoading) {
	this.timeLeft = this.transitionHold;
	this.showHeadline();

	return;
    }
    else if (this.isDone) {
	this.timeLeft = this.transitionHold;
	this.isDone = false;
    }

    //Ensure timer is cleared before starting it again.
    clearTimeout(this.showFeedTimer);

    this.showFeedTimer = setTimeout(function() {
	self.showNext();
    }, this.timeLeft);
}
/* End - Functions specific to Fade and None transitions. */

/* Start - Helper functions */
RiseVision.ReutersNews.Controller.prototype.getItemHeight = function() {
    if (this.showSeparator()) {
	return prefs.getInt("rsH") / this.itemsCount - prefs.getInt("separatorSize");
    }
    else {
	return prefs.getInt("rsH") / this.itemsCount;
    }
}
RiseVision.ReutersNews.Controller.prototype.expireUpdatesTimer = function() {
    this.refresh = true;
}
RiseVision.ReutersNews.Controller.prototype.isHorizontal = function() {
    if ((this.transition != "fade") && (this.transition != "none")) {
	return this.scrollDirection == "ltr" || this.scrollDirection == "rtl";
    }
    else {
	return false;
    }
}
RiseVision.ReutersNews.Controller.prototype.showSeparator = function() {
    if (prefs.getBool("separator") && (this.transition == "item" || this.transition == "continuous") &&
	(this.scrollDirection == "up" || this.scrollDirection == "down")) {
	return true;
    }
    else {
	return false;
    }
}
/*
 * Check if there any images in the feed.
 */
RiseVision.ReutersNews.Controller.prototype.hasImage = function() {
    if (this.imageURLs.length > 0) {
	for (var i = 0; i < this.imageURLs.length; i++) {
	    if (this.imageURLs[i] != null) {
		return true;
	    }
	}
    }

    return false;
}
/* End - Helper functions */

RiseVision.ReutersNews.Controller.prototype.play = function() {
    var self = this;

    this.isPlaying = true;

    if ((this.transition == "fade") || (this.transition == "none")) {
	this.isPaused = false;
	this.resumeTimer();
    }
    else if (this.isHorizontal()) {
	//Need to finish initializing horizontal scroller here as the Ready event had to be sent prematurely in order to
	//force any custom fonts to start downloading. Custom fonts won't start to download unless there is a visible DOM element that is using it.
	if (this.isLoading) {
	    setTimeout(function() {
		self.horizontalScroll.initialize();
		self.horizontalScroll.tick();
	    }, 1000);
	}

	if (this.isPaused) {
	    this.horizontalScroll.tick();
	    this.isPaused = false;
	}
    }
    //Vertical scrolling
    else {
	this.isPaused = false;
	$("#container").infiniteScroll.start();
    }

    if (this.isLoading) {
	this.isLoading = false;

	setInterval(function() {
	    self.isFeedLoaded = false;

	    if ((self.transition != "fade") && (self.transition != "none")) {
		self.loadFeed();
	    }
	}, this.refreshInterval);
    }
}
RiseVision.ReutersNews.Controller.prototype.pause = function() {
    if ((this.transition == "fade") || (this.transition == "none")) {
	this.pauseTimer();
    }
    else if (this.isHorizontal()) {
	this.horizontalScroll.pause();
    }
    //Vertical scrolling or None
    else {
	$("#container").infiniteScroll.pause();
    }

    this.isPaused = true;
}