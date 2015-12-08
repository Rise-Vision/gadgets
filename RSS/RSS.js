var RiseVision = RiseVision || {};
RiseVision.RSS = {};
RiseVision.RSS.Settings = {};
RiseVision.RSS.Controller = {};

/*
 * The Settings class handles the display and behavior of Gadget settings in the editor.
 */
RiseVision.RSS.Settings = function() {
    this.settings = new RiseVision.Common.Settings();
}
/*
 * Populate settings from saved values.
 */
RiseVision.RSS.Settings.prototype.initSettings = function() {
    var self = this;

    //Add event handlers.
    $(".colorPicker").click(function() {
  rssSettings.showColorPicker($(this).data("for"));
    });

    $(".fontSelector").click(function() {
  rssSettings.showFontSelector($(this).data("for"));
    });

    $("input:checkbox").change(function() {
  if ($(this).val() == "author") {
      $(this).is(":checked") ? $("li.author").show() : $("li.author").hide();
  }
  else if ($(this).val() == "date") {
      $(this).is(":checked") ? $("li.date").show() : $("li.date").hide();
  }
    });

    $("input[name='layout']").change(function() {
  var val = $(this).val();

  if ($("#scrollDirection").is(":visible") && (($("#scrollDirection").val() == "ltr") || (($("#scrollDirection").val() == "rtl")))) {
      $("li.headline").show();
      $("li.story").show();
      $("li.media").hide();
  }
  else {
      if ($(this).is(":checked")) {
    if ((val == "4x1-headline.xml") || (val == "2x1-headline.xml") || (val == "1x2-headline.xml") || (val == "custom")) {
        $("li.headline").show();
        $("li.story").show();
        $("li.media").show();
    }
    else if (val == "4x1-no-image.xml") {
        $("li.headline").show();
         $("li.story").show();
        $("li.media").hide();
    }
    else if ((val == "4x1-no-headline.xml") || (val == "2x1-no-headline.xml") || (val == "1x2-no-headline.xml")) {
        $("li.headline").hide();
         $("li.story").show();
        $("li.media").show();
    }
    else if (val == "4x1-no-image-no-headline.xml") {
        $("li.headline").hide();
         $("li.story").show();
        $("li.media").hide();
    }
    else {  //background.xml
        $("li.headline").hide();
        $("li.story").hide();
        $("li.media").show();
    }
      }
  }
    });

    $("#transition").change(function() {
  if (($(this).val() == "continuous") || (($(this).val() == "page") && (($("#scrollDirection").val() == "ltr") || ($("#scrollDirection").val() == "rtl")))) {
      $("li.transitionHold").hide();
  }
  else {
      $("li.transitionHold").show();
  }

  if (($(this).val() != "fade") && ($(this).val() != "none")) {
      $("li.transition").show();

      if (($(this).val() == "item") || ($(this).val() == "continuous")) {
    $("li.separator").show();
      }
      else {
    $("li.separator").hide();
      }

      if (($("#scrollDirection").val() == "ltr") || (($("#scrollDirection").val() == "rtl"))) {
    $("li.itemsCount").hide();
    $("li.layout").hide();
      }
      else {

      }
  }
  else {
      $("li.itemsCount").show();
      $("li.transition").hide();
      $("li.layout").show();
  }

  $("input[name='layout']").trigger("change");
  self.setSeparatorVisibility();
    });

    $("#scrollDirection").change(function() {
  if (($(this).is(":visible")) && (($(this).val() == "ltr") || (($(this).val() == "rtl")))) {
      $("li.itemsCount").hide();
      $("li.layout").hide();
      $("li.media").hide();
      $("li.headlineColor").hide();
      $("li.storyColor").hide();
      $("li.authorColor").hide();
      $("li.dateColor").hide();

      if ($("#transition").val() == "page") {
    $("li.transitionHold").hide();
      }
  }
  else {
      $("li.itemsCount").show();
      $("li.layout").show();
      $("li.media").show();
      $("li.headlineColor").show();
      $("li.storyColor").show();
      $("li.authorColor").show();
      $("li.dateColor").show();

      if ($("#transition").val() != "continuous") {
    $("li.transitionHold").show();
      }
  }

  $("input[name='layout']").trigger("change");
  self.setSeparatorVisibility();
    });

    $("#separator").change(function() {
  if ($(this).is(":visible") && $(this).is(":checked")) {
      $("li.separatorDetails").show();
  }
  else {
      $("li.separatorDetails").hide();
  }
    });

    //Request additional parameters from the Viewer.
    gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
  if (result) {
      var prefs = new gadgets.Prefs();

      result = JSON.parse(result);

      $("#url").val(prefs.getString("url"));
      $("#queue").val(prefs.getString("queue"));
      $("#itemsCount").val(prefs.getString("itemsCount"));
      $("#transition").val(prefs.getString("transition"));
      $("#scrollDirection").val(prefs.getString("scrollDirection"));
      $("#scrollSpeed").val(prefs.getString("scrollSpeed"));
      $("#separator").attr("checked", prefs.getBool("separator"));
      $("#separatorColor").val(prefs.getString("separatorColor"));
      $("#separatorSize").val(prefs.getString("separatorSize"));
      $("#transitionHold").val(prefs.getString("transitionHold"));
      $("#transitionResumes").val(prefs.getString("transitionResumes"));
      $("#bgColor").val(prefs.getString("bgColor"));

      $("input[type='radio'][name='contentType']").each(function() {
    if ($(this).val() == prefs.getString("contentType")) {
        $(this).attr("checked", "checked");
    }
      });

      $("#author").attr("checked", prefs.getBool("author"));
      $("#date").attr("checked", prefs.getBool("date"));

      $("input[type='radio'][name='layout']").each(function() {
    if ($(this).val() == prefs.getString("layout")) {
        $(this).attr("checked", "checked");
    }
      });

      $("#layoutURL").val(prefs.getString("layoutURL"));

      if (prefs.getBool("separator")) {
    $("li.separatorDetails").show();
      }

      //Populate colors and show color as background of text box.
      self.populateColor($("#separatorColor"), prefs.getString("separatorColor"));
      self.populateColor($("#bgColor"), prefs.getString("bgColor"));
      self.populateColor($("#headlineColor"), result["headlineColor"]);
      self.populateColor($("#storyColor"), result["storyColor"]);
      self.populateColor($("#authorColor"), result["authorColor"]);
      self.populateColor($("#dateColor"), result["dateColor"]);

      //Populate fields saved as additionalParams.
      $("#headline_font-style").text(result["headline_font"]);
      $("#headline_font-style").data("css", result["headline_font-style"]);
      $("#headlinePadding").val(result["headlinePadding"]);
      $("#headlineColor").val(result["headlineColor"]);

      $("#story_font-style").text(result["story_font"]);
      $("#story_font-style").data("css", result["story_font-style"]);
      $("#storyPadding").val(result["storyPadding"]);
      $("#storyColor").val(result["storyColor"]);

      $("#mediaPadding").val(result["mediaPadding"]);

      $("#author_font-style").text(result["author_font"]);
      $("#author_font-style").data("css", result["author_font-style"]);
      $("#authorPadding").val(result["authorPadding"]);
      $("#authorColor").val(result["authorColor"]);

      $("#date_font-style").text(result["date_font"]);
      $("#date_font-style").data("css", result["date_font-style"]);
      $("#datePadding").val(result["datePadding"]);
      $("#dateColor").val(result["dateColor"]);
  }

  $("form ol li ol.drillDown li:visible:last").css({
      "clear": "left",
      "float": "left",
      "margin-bottom": "10px"
  });

  $("#settings").show();

  //Manually trigger event handlers so that the visibility of fields can be set.
  $("input:checkbox").trigger("change");
  $("#transition").trigger("change");
  $("#scrollDirection").trigger("change");
    });
}
RiseVision.RSS.Settings.prototype.setSeparatorVisibility = function() {
    if ((($("#scrollDirection").val() == "up") || ($("#scrollDirection").val() == "down")) &&
  (($("#transition").val() == "item") || ($("#transition").val() == "continuous"))) {
  $("li.separator").show();
    }
    else {
  $("li.separator").hide();
    }

    $("#separator").trigger("change");
}
RiseVision.RSS.Settings.prototype.populateColor = function($element, color) {
    $element.val(color);
    $element.css("background-color", color);
}
RiseVision.RSS.Settings.prototype.showColorPicker = function(id) {
    gadgets.rpc.call("", "rscmd_openColorPicker", null, id, $("#" + id).val());
}
RiseVision.RSS.Settings.prototype.showFontSelector = function(id) {
    gadgets.rpc.call("", "rscmd_openFontSelector", null, id, $("#" + id).data("css"));
}
RiseVision.RSS.Settings.prototype.setColor = function(id, color) {
    $("#" + id).val(color);
    $("#" + id).css("background-color", color);
}
RiseVision.RSS.Settings.prototype.setFont = function(id, css, style) {
    $("#" + id).data("css", css);
    $("#" + id).text(style);
}
RiseVision.RSS.Settings.prototype.getSettings = function() {
  var errorFound = false,
    errors = document.getElementsByClassName("errors")[0],
    params = "",
    settings = null,
    selected;

  $(".errors").empty();
  $(".errors").css({ display: "none" });

  //Validate the URL.
  if ($("#url").val != "") {
    //RSS URL
    errorFound = (rssSettings.settings.validateRequired($("#url"), errors, "RSS URL")) ? true : errorFound;

    //Queue
    errorFound = (rssSettings.settings.validateRequired($("#queue"), errors, "Queue")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#queue"), errors, "Queue")) ? true : errorFound;

    if (parseInt($("#queue").val()) <= 0) {
      errors.innerHTML += "Queue must be greater than 0.<br />";
      errorFound = true;
    }

    //Items Count
    errorFound = (rssSettings.settings.validateRequired($("#itemsCount"), errors, "Items Count")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#itemsCount"), errors, "Items Count")) ? true : errorFound;

    if ($("#itemsCount").is(":visible") && parseInt($("#itemsCount").val()) <= 0) {
      errors.innerHTML += "Items Count must be greater than 0.<br />";
      errorFound = true;
    }

      //Separator Size
    if ($("#separatorSize").is(":visible")) {
      errorFound = (rssSettings.settings.validateNumeric($("#separatorSize"), errors, "Separator Size")) ? true : errorFound;
    }

      //Transition Hold
    errorFound = (rssSettings.settings.validateRequired($("#transitionHold"), errors, "Transition Hold")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#transitionHold"), errors, "Transition Hold")) ? true : errorFound;

    if ($("#transitionHold").is(":visible") && parseInt($("#transitionHold").val()) <= 0) {
      errors.innerHTML += "Transition Hold must be greater than 0.<br />";
      errorFound = true;
    }

    //Transition Resumes
    errorFound = (rssSettings.settings.validateRequired($("#transitionResumes"), errors, "Transition Resumes")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#transitionResumes"), errors, "Transition Resumes")) ? true : errorFound;

    if ($("#transitionResumes").is(":visible") && parseInt($("#transitionResumes").val()) <= 0) {
      errors.innerHTML += "Transition Resumes must be greater than 0.<br />";
      errorFound = true;
    }

    //Padding
    errorFound = (rssSettings.settings.validateNumeric($("#headlinePadding"), errors, "Headline Padding")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#storyPadding"), errors, "Summary / Story Padding")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#mediaPadding"), errors, "Media Padding")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#authorPadding"), errors, "Author Padding")) ? true : errorFound;
    errorFound = (rssSettings.settings.validateNumeric($("#datePadding"), errors, "Date Padding")) ? true : errorFound;

    //Required fields
    if ($("input[type='radio'][name='layout']:checked").val() == "custom") {
      errorFound = (rssSettings.settings.validateRequired($("#layoutURL"), errors, "Layout URL")) ? true : errorFound;
    }

    if (errorFound) {
      $(".errors").fadeIn(200).css("display", "inline-block");
      $("#wrapper").scrollTop(0);

      return null;
    }
    else {
      //Construct parameters string to pass to RVA.
      params = "up_url=" + escape($("#url").val()) +
          "&up_queue=" + $("#queue").val() +
          "&up_itemsCount=" + $("#itemsCount").val() +
          "&up_transition=" + $("#transition").val() +
          "&up_scrollDirection=" + $("#scrollDirection").val() +
          "&up_scrollSpeed=" + $("#scrollSpeed").val();
      params += "&up_separatorColor=" + $("#separatorColor").val() +
          "&up_separatorSize=" + $("#separatorSize").val() +
          "&up_transitionHold=" + $("#transitionHold").val() +
          "&up_transitionResumes=" + $("#transitionResumes").val() +
          "&up_bgColor=" + $("#bgColor").val();
      params += ($("#separator").is(":checked")) ? "&up_separator=true" : "&up_separator=false";

      //Summary or Story
      selected = $("input[type='radio'][name='contentType']:checked");

      if (selected.length > 0) {
          params += "&up_contentType=" + selected.val();
      }

      params += ($("#author").is(":checked")) ? "&up_author=true" : "&up_author=false";
      params += ($("#date").is(":checked")) ? "&up_date=true" : "&up_date=false";

      //Layout
      selected = $("input[type='radio'][name='layout']:checked");

      if (selected.length > 0) {
          params += "&up_layout=" + selected.val();
      }

      params += "&up_layoutURL=" + $("#layoutURL").val();

      settings = {
          "params": params,
          "additionalParams": JSON.stringify(rssSettings.saveAdditionalParams())
      };

      gadgets.rpc.call("", "rscmd_saveSettings", null, settings);
    }
  }
}
RiseVision.RSS.Settings.prototype.saveAdditionalParams = function() {
    var additionalParams = {};

    additionalParams["headline_font"] = $("#headline_font-style").text();
    additionalParams["headline_font-style"] = $("#headline_font-style").data("css");
    additionalParams["headlinePadding"] = $("#headlinePadding").val() == "" ? 0 : $("#headlinePadding").val();
    additionalParams["headlineColor"] = $("#headlineColor").val();

    additionalParams["story_font"] = $("#story_font-style").text();
    additionalParams["story_font-style"] = $("#story_font-style").data("css");
    additionalParams["storyPadding"] = $("#storyPadding").val() == "" ? 0 : $("#storyPadding").val();
    additionalParams["storyColor"] = $("#storyColor").val();

    additionalParams["mediaPadding"] = $("#mediaPadding").val() == "" ? 0 : $("#mediaPadding").val();

    additionalParams["author_font"] = $("#author_font-style").text();
    additionalParams["author_font-style"] = $("#author_font-style").data("css");
    additionalParams["authorPadding"] = $("#authorPadding").val() == "" ? 0 : $("#authorPadding").val();
    additionalParams["authorColor"] = $("#authorColor").val();

    additionalParams["date_font"] = $("#date_font-style").text();
    additionalParams["date_font-style"] = $("#date_font-style").data("css");
    additionalParams["datePadding"] = $("#datePadding").val() == "" ? 0 : $("#datePadding").val();
    additionalParams["dateColor"] = $("#dateColor").val();

   return additionalParams;
}

RiseVision.RSS.Controller = function() {
    this.isFeedLoaded = false;
    this.currentItemIndex = 0;
    this.nextItemIndex = 0;
    this.imageCount = 0;
    this.feedLoadFailedInterval = 5000;   //5 seconds
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
    this.supportedImages = new Array("image/bmp", "image/gif", "image/jpeg", "image/png", "image/tiff");
    this.supportedVideos = new Array("video/mp4", "video/webm", "video/ogg");
    this.util = RiseVision.Common.Utility;

    if (prefs.getString("layout") == "custom") {
  this.layoutURL = prefs.getString("layoutURL");
    }
    else {
  this.layoutURL = "https://s3.amazonaws.com/Gadget-RSS/layouts/" + prefs.getString("layout");
    }

    if ((prefs.getString("layout") == "4x1-no-image-no-headline") ||
  (prefs.getString("layout") == "4x1-no-image")) {
  this.isMediaLayout = false;
    }
    else {
  this.isMediaLayout = true;
    }
}
RiseVision.RSS.Controller.prototype.getAdditionalParams = function(name, value) {
    if (name == "additionalParams") {
  if (value) {
      var styleNode = document.createElement("style");

      value = JSON.parse(value);

      //Inject CSS font styles into the DOM.
      styleNode.appendChild(document.createTextNode(value["headline_font-style"]));
      styleNode.appendChild(document.createTextNode("a:active" + value["headline_font-style"]));
      styleNode.appendChild(document.createTextNode("a:visited" + value["headline_font-style"]));
      styleNode.appendChild(document.createTextNode(value["story_font-style"]));
      styleNode.appendChild(document.createTextNode(value["author_font-style"]));
      styleNode.appendChild(document.createTextNode(value["date_font-style"]));
      document.getElementsByTagName("head")[0].appendChild(styleNode);

      controller.headlinePadding =  parseInt(value.headlinePadding);
      controller.headlineColor = value.headlineColor;

      controller.storyPadding =  parseInt(value.storyPadding);
      controller.storyColor = value.storyColor;

      controller.mediaPadding = parseInt(value.mediaPadding);

      controller.authorPadding =  parseInt(value.authorPadding);
      controller.authorColor = value.authorColor;

      controller.datePadding =  parseInt(value.datePadding);
      controller.dateColor = value.dateColor;
  }
    }

    controller.initialize();
}
RiseVision.RSS.Controller.prototype.initialize = function() {
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
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
      params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 60;

      gadgets.io.makeRequest(prefs.getString("url"), function(obj) {
    self.onFeedLoaded(obj);
      }, params);
  }, params);
    }
}
RiseVision.RSS.Controller.prototype.loadFeed = function() {
    var self = this,
  params = {},
  url = prefs.getString("url");

    //Start a timer in case there is a problem loading the feed.
    this.feedLoadFailedTimer = setTimeout(function() {
  self.feedLoadFailed();
    }, this.feedLoadFailedInterval);

    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 60;

    gadgets.io.makeRequest(url, function(obj) {
  if (obj.errors.length == 0) {
      if (!self.isFeedLoaded) {
    clearTimeout(self.feedLoadFailedTimer);
    self.onFeedLoaded(obj);
      }
  }
    }, params);
}
RiseVision.RSS.Controller.prototype.onFeedLoaded = function(obj) {
    var queue = prefs.getInt("queue"),
  item;

    this.isFeedLoaded = true;

    //This will return all items, so we need to limit to itemsCount.
    for (var i = obj.data.getElementsByTagName("item").length - 1; i >= queue; i--) {
  item = obj.data.getElementsByTagName("item")[i];
  item.parentNode.removeChild(item);
    }

    if (obj.data && obj.data.getElementsByTagName("item").length > 0) {
  this.showFeed(obj);
    }
    else {
  console.log("This feed has no items.");
  readyEvent();
    }
}
//This function will be called if the feed fails to load, for example, when there is no Internet connection.
//In that case, continue playing the same feed items.
RiseVision.RSS.Controller.prototype.feedLoadFailed = function() {
    this.isFeedLoaded = true;

    if (this.transition == "fade") {
  this.isFadingIn = false;
  this.isFadingOut = false;

  if (!this.isPaused) {
      this.showItem();
  }
    }
    else if (this.transition == "none") {
  if (!this.isPaused) {
      this.showItem();
  }
    }
}
//This is only called when the feed has loaded or been reloaded.
RiseVision.RSS.Controller.prototype.showFeed = function(obj) {
    var data = [],
  self = this;

    if (this.isHorizontal()) {
  if (this.isLoading) {
      this.feedData = obj.data;
      this.items = this.feedData.getElementsByTagName("item");

      //Remove UI used for other transition types.
      $("#hiddenContainer").remove();
      $("#container").remove();

      for (var i = 0; i < this.items.length; i++) {
    data.push(this.getHorizontalScrollData(this.items[i]));
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
      this.feedData = obj.data;
      this.items = this.feedData.getElementsByTagName("item");
      this.updateHorizontalScrollData();
  }
    }
    //Vertical scrolling, Fade or None transition.
    else {
  if (this.feedData != null) {
      this.oldData = this.feedData;
  }

  this.feedData = obj.data;
  this.items = this.feedData.getElementsByTagName("item");
  this.imageURLs = new Array();
  this.videos = new Array();

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
        this.showItem();
    }
      }
      else if (this.transition == "none") {
    if (this.isLoading) {
        this.init();
    }
    else {
        this.showItem();
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
RiseVision.RSS.Controller.prototype.init = function() {
    var self = this,
  playlists = [],
  dimensions = null;
  this.playlists = [];

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
      if (self.nextItemIndex < self.items.length) {
    self.populateItem(self.items[self.nextItemIndex], i, self.nextItemIndex);
    self.nextItemIndex++;
      }
  });
    }
    else {
  this.showAllItems();
  $(".item").height(this.getItemHeight());
    }

    if (this.isLoading) {
  //Configure JW Player with playlist of videos. Videos are only supported for the Fade and None transitions.
  if ((this.videos.length > 0) && ((this.transition == "fade") || (this.transition == "none"))) {
      for (var i = 0; i < this.videos.length; i++) {
    if (this.videos[i] != null) {
        //In order to make .mov files work with JW 6, you need to specify the file type explicitly as mp4.
        this.playlists.push({
      sources: [{
          file: this.videos[i].url,
          type: this.videos[i].type == "video/quicktime" ? "mp4": ""
      }]
        });
    }
      }

      if (this.playlists.length > 0) {
    //Each video needs a unique ID in order to initialize it.
    $(".video").each(
        function(i) {
      self.videosLoaded = 0;

      $(this).attr("id", "video" + i);

      self.initPlayer(i);
        }
    );
      }
      else {
    readyEvent();
      }
  }
  else {
      if (this.videos.length > 0) {
    console.log("Videos are only supported for the Fade and None transitions.");
    $(".videoWrapper").hide();
      }

      readyEvent();
  }

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
    }
}
RiseVision.RSS.Controller.prototype.addItems = function() {
    //No need to re-add elements if video is involved, as stories containing video are not truncated.
    if (this.playlists.length == 0) {
  $(".item").remove();

  for (var i = 0; i < this.itemsCount; i++) {
      $(".page").append(this.item);
  }

  this.applyStyle();

  $(".item").height(this.getItemHeight());
    }
}
/*
 * Initialize JW Player.
 */
RiseVision.RSS.Controller.prototype.initPlayer = function(index) {
    var self = this;

    this.dimensions = this.getMediaDimensions(index, this.videos[index]);

    jwplayer("video" + index).setup({
  playlist: this.playlists,
  width: this.dimensions.width,
  height: this.dimensions.height,
  primary: "flash",
  controls: false,
  mute: false
    });

    jwplayer("video" + index).onReady(function() {
  var newIndex;

  if (self.isLoading) {
      self.videosLoaded++;

      if (self.videosLoaded == $(".videoWrapper").length) {
    newIndex = self.currentItemIndex;

    $(".videoWrapper").each(function(index) {
        jwplayer(index).playlistItem(newIndex);
        jwplayer(index).play(false);
        newIndex++;
    });

    readyEvent();
      }
  }
  else {
      newIndex = self.currentItemIndex;

      $(".videoWrapper").each(function(index) {
    jwplayer(index).playlistItem(newIndex);

    if (index > 0) {
        jwplayer(index).play(false);
    }

    newIndex++;
      });
  }
    });
    jwplayer("video" + index).onPause(function(state) {
  var jwplayer = this;

  if ((state.oldstate != "BUFFERING") && !self.isPaused) {
      self.resumeVideoTimer = setTimeout(function() {
    jwplayer.play(true);
      }, self.transitionResumes);
  }
    });
    jwplayer("video" + index).onComplete(function(event) {
  var isPlaying = false,
      newIndex = self.currentItemIndex;

  if ((self.transition == "fade") || (self.transition == "none")) {
      $(".videoWrapper").each(function(index) {
    if (jwplayer(index).getState() == "PLAYING") {
        isPlaying = true;
    }
    //Pause the video that has just completed so it doesn't proceed to the next playlist item.
    else if (jwplayer(index).getState() == "IDLE") {
        jwplayer(index).playlistItem(newIndex);
        jwplayer(index).play(false);
    }

    newIndex++;
      });

      //Show next item(s) if all videos have finished playing.
      if (!isPlaying) {
    self.showNext();
      }
  }
    });
    jwplayer("video" + index).onError(function(error) {
  console.log(error);
    });
}
RiseVision.RSS.Controller.prototype.applyStyle = function() {
    $(".headline").css({
  "padding": this.headlinePadding,
  "background-color": this.headlineColor
    });
    $(".story").css({
  "padding": this.storyPadding,
  "background-color": this.storyColor
    });
    $(".image, .videoWrapper").css({
  "padding": this.mediaPadding
    });
    $(".author").css({
  "padding": this.authorPadding,
  "background-color": this.authorColor
    });
    $(".date").css({
  "padding": this.datePadding,
  "background-color": this.dateColor
    });
}
/*
 * Check for media (image/video) in Media RSS feeds and RSS enclosures.
 */
RiseVision.RSS.Controller.prototype.getMedia = function() {
    var numItems = this.feedData.getElementsByTagName("item").length,
  item, media, medium, url, type, found, enclosure;

    for (var i = 0; i < numItems; i++) {
  found = false;
  item = this.items[i];
  story = this.getStory(item);
  media = this.util.getElementByNodeName(item, "media:content");
  enclosure = item.getElementsByTagName("enclosure");

  /* Media RSS */
  /* TODO: Test this when multiple <media:content> elements are contained within a <media:group> element.
    In that case, choose the first media listed. */
  if (media != null) {
      medium = media[0].getAttribute("medium");
      url = media[0].getAttribute("url");
      type = media[0].getAttribute("type");

      if (medium != null) {
    if (medium == "image") {
        if (!this.urlExists(url, story)) {
      this.imageURLs.push(url);
      found = true;
        }
    }
    else if (medium == "video") {
        if (!this.urlExists(url, story)) {
      this.videos.push({
          url: url,
          type: type,
          width: media[0].getAttribute("width"),
          height: media[0].getAttribute("height"),
          position: 0
      });

      found = true;
        }
    }
      }
      else if (type != null) {
    for (var j in this.supportedImages) {
        if (type == this.supportedImages[j]) {
      if (!this.urlExists(url, story)) {
          this.imageURLs.push(url);
          found = true;
      }

      break;
        }
    }

    if (!found) {
        for (var j in this.supportedVideos) {
      if (type == this.supportedVideos[j]) {
          if (!this.urlExists(url, story)) {
        this.videos.push({
            url: url,
            type: type,
            width: media[0].getAttribute("width"),
            height: media[0].getAttribute("height"),
            position: 0
        });

        found = true;
          }

          break;
      }
        }
    }
      }
  }
  /* RSS enclosure - Only one enclosure tag per item is allowed. */
  else if ((enclosure != null) && (enclosure.length > 0)) {
      url = enclosure[0].getAttribute("url");
      type = enclosure[0].getAttribute("type");

      for (var j in this.supportedImages) {
    if (type == this.supportedImages[j]) {
        if (!this.urlExists(url, story)) {
      this.imageURLs.push(url);
      found = true;
        }

        break;
    }
      }

      if (!found) {
    for (var j in this.supportedVideos) {
        if (type == this.supportedVideos[j]) {
      if (!this.urlExists(url, story)) {
          this.videos.push({
        url: url,
        type: type,
        position: 0
          });

          found = true;
      }

      break;
        }
    }
      }
  }

  //Add a null url if this particular item has no image.
  if (!found) {
      this.imageURLs.push(null);
      this.videos.push(null);
  }
    }
}
//Preload the images.
RiseVision.RSS.Controller.prototype.preloadImages = function() {
    var toLoad = this.imageURLs.length;

    this.imageCount = 0;
    this.images = new Array();
    this.loadImage(toLoad);
}
//Load each image.
RiseVision.RSS.Controller.prototype.loadImage = function(toLoad) {
    var self = this,
  feedImage;

    //Add a null image if there is no URL.
    if (this.imageURLs[this.imageCount] == null) {
  this.onImageLoaded(null, toLoad);
    }
    else {
  feedImage = new Image();
  feedImage.onload = function() {
      clearTimeout(self.feedLoadFailedTimer);
      self.onImageLoaded(feedImage, toLoad);
  }

  //Give the image 5 seconds to load before starting over.
  this.feedLoadFailedTimer = setTimeout(function() {
      self.feedLoadFailed();
  }, this.feedLoadFailedInterval);
  feedImage.src = this.imageURLs[this.imageCount];
    }
}
RiseVision.RSS.Controller.prototype.onImageLoaded = function(image, toLoad) {
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
    this.showItem();
      }
      else if (this.transition == "none") {
    this.showItem();
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
RiseVision.RSS.Controller.prototype.populateItem = function(item, elementIndex, mediaIndex) {
    var headline = this.util.getNodeValue(item.getElementsByTagName("title")),
  story = this.getStory(item),
  author = this.util.getNodeValue(this.util.getElementByNodeName(item, "dc:creator")),
  date = this.util.getNodeValue(item.getElementsByTagName("pubDate"));

    //Headline
    if (headline == "") {
  $(".headline").eq(elementIndex).hide();
    }
    else {
  $(".headline a").eq(elementIndex).html(headline);
  $(".headline").eq(elementIndex).show();
    }

    //Summary or Story
    if (story != "") {
  if (prefs.getString("contentType") == "summary") {
      //Strip HTML tags from story and truncate after 120 characters.
      $(".story").eq(elementIndex).text(RiseVision.Common.Utility.truncate($("<div/>").html(RiseVision.Common.Utility.stripScripts(story)).text(), 120));
  }
  else {
      $(".story").eq(elementIndex).html(RiseVision.Common.Utility.stripScripts(story));

      //Issue 937 Start - Apply CSS to child elements as well.
      $(".story").find("p").addClass("story_font-style");
      $(".story").find("div").addClass("story_font-style");
      $(".story").find("span").addClass("story_font-style");
      //Issue 937 End
  }

  $(".story").eq(elementIndex).show();
    }
    //TODO: Check other tags.
    else {
  $(".story").eq(elementIndex).hide();
    }

    $(".separator").eq(elementIndex).show();

    //Author
    if (prefs.getBool("author") && (author != "")) {
  $(".author").eq(elementIndex).html(author);
  $(".author").eq(elementIndex).show();
    }
    else {
  $(".author").eq(elementIndex).hide();
  $(".separator").eq(elementIndex).hide();
    }

    //Date
    if (prefs.getBool("date") && (date != "")) {
  $(".date").eq(elementIndex).text(new Date(date).toString("MMMM dS, yyyy"));
  $(".date").eq(elementIndex).attr("datetime", new Date(date).toString("yyyy-MM-dd"));
  $(".date").eq(elementIndex).show();
    }
    else {
  $(".date").eq(elementIndex).hide();
  $(".separator").eq(elementIndex).hide();
    }

    if (this.showSeparator()) {
  $(".item").css("border-bottom", "solid " + prefs.getInt("separatorSize") + "px " + prefs.getString("separatorColor"));
    }

    if ((this.images[mediaIndex] != null) && this.images[mediaIndex].src) {
  $(".videoWrapper").eq(elementIndex).hide();
  $(".image").eq(elementIndex).attr("src", this.images[mediaIndex].src);
  $(".image").eq(elementIndex).show();
  this.getMediaDimensions(elementIndex, this.images[mediaIndex], $("#container .image").eq(elementIndex));
    }
    else if (this.videos[mediaIndex] != null) {
  $(".image").eq(elementIndex).hide();
  $(".videoWrapper").eq(elementIndex).show();

  //Load video with proper playlist item.
  if (!this.isLoading) {
      jwplayer(elementIndex).playlistItem(mediaIndex);
      jwplayer(elementIndex).play(false);
  }
    }
    else {
  $(".image").eq(elementIndex).hide();
  $(".videoWrapper").eq(elementIndex).hide();
    }

    //Don't truncate stories for video or for the Fade and None transitions, as those transitions will be truncated in showItem.
    if (((this.transition != "fade") && (this.transition != "none") && (this.playlists.length == 0)) || this.isLoading) {
  $(".item").eq(elementIndex).dotdotdot({
      height: this.getItemHeight()
  });
    }
}
/*
 * Calculate dimensions of an image or video so that it will fit within the available space.
 */
RiseVision.RSS.Controller.prototype.getMediaDimensions = function(index, media, $element) {
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
  dimensions.height = ((prefs.getString("rsH") / this.itemsCount) - (this.mediaPadding * 2)) / 2; //Issue 901
    }
    else if ((prefs.getString("layout") == "4x1-headline.xml") || (prefs.getString("layout") == "4x1-no-headline.xml")) {
  dimensions.width = prefs.getString("rsW") * 0.33;
  dimensions.height = (prefs.getString("rsH") / this.itemsCount) - (this.mediaPadding * 2);
    }
    else if (prefs.getString("layout") == "background.xml") {
  dimensions.width = prefs.getString("rsW") - (this.mediaPadding * 2);
  dimensions.height = prefs.getString("rsH") / this.itemsCount - prefs.getInt("separatorSize") - (this.mediaPadding * 2);
    }

    //Scale media proportionally.
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
RiseVision.RSS.Controller.prototype.getHorizontalScrollData = function(item) {
    var items = [],
  authorFound = false,
  headline = this.util.getNodeValue(item.getElementsByTagName("title")),
  story = this.getStory(item),
  author = this.util.getNodeValue(this.util.getElementByNodeName(item, "dc:creator")),
  date = this.util.getNodeValue(item.getElementsByTagName("pubDate")),
  headlineFont, storyFont, authorFont, dateFont;

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

      if (rule.indexOf("author_font-style") != -1) {
    authorFont = document.styleSheets[2].cssRules[i].cssText;
      }

      if (rule.indexOf("date_font-style") != -1) {
    dateFont = document.styleSheets[2].cssRules[i].cssText;
      }
  }
    }

    //Headline
    if (headline != "") {
  items.push({
      type: "text",
      value: headline,
      fontRule: headlineFont,
      padding: this.headlinePadding,
      background: prefs.getString("headlineColor")
  });
    }

    //Author
    if (prefs.getBool("author") && (author != "")) {
  items.push({
      type: "text",
      value: author,
      fontRule: authorFont,
      padding: this.authorPadding,
      background: prefs.getString("authorColor")
  });

  authorFound = true;
    }

    //Date
    if (prefs.getBool("date") && (date != "")) {
  if (authorFound) {
      items.push({
    type: "text",
    value: " - ",
    fontRule: authorFont,
    padding: this.authorPadding,
    background: prefs.getString("dateColor")
      });
  }

  items.push({
      type: "text",
      value: new Date(date).toString("MMMM dS, yyyy"),
      fontRule: dateFont,
      padding: this.datePadding,
      background: prefs.getString("dateColor")
  });
    }

    //Summary or Story
    if (story != null) {
  if (prefs.getString("contentType") == "summary") {
      //Strip HTML tags from story and truncate after 120 characters.
      story = RiseVision.Common.Utility.truncate($("<div/>").html(RiseVision.Common.Utility.stripScripts(story)).text(), 120);
  }
  else {
      story = RiseVision.Common.Utility.unescapeHTML(RiseVision.Common.Utility.stripScripts(story));
  }

  items.push({
      type: "text",
      value: story,
      fontRule: storyFont,
      padding: this.storyPadding,
      background: prefs.getString("storyColor")
  });
    }

    return items;
}
RiseVision.RSS.Controller.prototype.updateHorizontalScrollData = function() {
    var self = this,
        oldItems = this.oldData.getElementsByTagName("item");

    if ((oldItems != null) && (this.items != null)) {
  //Refresh the whole thing if items have been added or removed.
  //This would likely be a rare occurrence.
  if (this.items.length != oldItems.length) {
      $.each(this.items, function(index, item) {
    self.updateItem(index, item);
      });
  }
  else {  //Check if the details have changed.
      $.each(this.items, function(index, item) {
    var oldItem = oldItems[index],
        isChanged = false;

    //Headline
    if (self.util.getNodeValue(item.getElementsByTagName("headline")) != self.util.getNodeValue(oldItem.getElementsByTagName("headline"))) {
        isChanged = true;
    }

    //Author
    if (prefs.getBool("author")) {
        if (self.util.getNodeValue(item.getElementsByTagName("dc:creator")) != self.util.getNodeValue(oldItem.getElementsByTagName("dc:creator"))) {
      isChanged = true;
        }
    }

    //Date
    if (prefs.getBool("date")) {
        if (self.util.getNodeValue(item.getElementsByTagName("pubDate")) != self.util.getNodeValue(oldItem.getElementsByTagName("pubDate"))) {
      isChanged = true;
        }
    }

    //Summary or Story
    if (self.util.getNodeValue(item.getElementsByTagName("description")) != self.util.getNodeValue(oldItem.getElementsByTagName("description"))) {
        isChanged = true;
    }

    if (isChanged) {
        self.updateItem(index, item);
    }
      });
  }
    }
}
RiseVision.RSS.Controller.prototype.updateItem = function(index, item) {
    var data = [];

    data = this.getHorizontalScrollData(item);
    this.horizontalScroll.updateItem(index, data);
    data = null;
}
/* End - Functions specific to horizontal scrolling. */

/* Start - Functions specific to vertical scrolling. */
RiseVision.RSS.Controller.prototype.showAllItems = function() {
    var len = this.items.length;

    for (var i = 0; i < len; i++) {
  $(".page").append(this.item);
    }

    this.applyStyle();

    for (var i = 0; i < len; i++) {
  this.populateItem(this.items[i], i, i);
    }
}
//Update feed entries in-place if they have changed.
RiseVision.RSS.Controller.prototype.updateVerticalScrollData = function() {
    var self = this,
  oldItems = this.oldData.getElementsByTagName("item"),
  oldItem, link, headline, story, author, date, oldLink, oldHeadline;

    $.each(this.items, function(index, item) {
  oldItem = oldItems[index];
  link = self.util.getNodeValue(item.getElementsByTagName("link"));
  headline = self.util.getNodeValue(item.getElementsByTagName("title"));
  story = self.getStory(item);
  author = self.util.getNodeValue(self.util.getElementByNodeName(item, "dc:creator"));
  date = self.util.getNodeValue(item.getElementsByTagName("pubDate"));
  oldLink = self.util.getNodeValue(oldItem.getElementsByTagName("link"));
  oldHeadline = self.util.getNodeValue(oldItem.getElementsByTagName("title"));

  //If the link has changed, it's a different story.
  //If the headline has changed, it may be the same story with a new headline.
  if ((link != oldLink) || (headline != oldHeadline)) {
      var $item = $(".item").eq(index);

      $item.find(".headline a").text(RiseVision.Common.Utility.unescapeHTML(headline));
      $item.find(".headline").show();

      //Summary or Story
      if (story != "") {
    if (prefs.getString("contentType") == "summary") {
        //Strip HTML tags from story and truncate after 120 characters.
        $item.find(".story").eq(index).text(RiseVision.Common.Utility.truncate($("<div/>").html(RiseVision.Common.Utility.stripScripts(story)).text(), 120));
    }
    else {
        $item.find(".story").eq(index).html(RiseVision.Common.Utility.stripScripts(story));
    }

    $item.find(".story").eq(index).show();
      }
      else {
    $item.find(".story").eq(index).hide();
      }

      $item.find(".separator").eq(index).show();

      //Author
      if (prefs.getBool("author") && (author != "")) {
    $item.find(".author").eq(index).html(author);
    $item.find(".author").eq(index).show();
      }
      else {
    $item.find(".author").eq(index).hide();
    $item.find(".separator").eq(index).hide();
      }

      //Date
      if (prefs.getBool("date") && (date != "")) {
    $item.find(".date").eq(index).text(new Date(date).toString("MMMM dS, yyyy"));
    $item.find(".date").eq(index).attr("datetime", new Date(date).toString("yyyy-MM-dd"));
    $item.find(".date").eq(index).show();
      }
      else {
    $item.find(".date").eq(index).hide();
    $item.find(".separator").eq(index).hide();
      }
  }
    });
}
/* End - Functions specific to vertical scrolling. */

/* Start - Functions specific to Fade or None transitions. */
RiseVision.RSS.Controller.prototype.showItem = function() {
    var self = this,
  hasVideo;

    if (this.items) {
  if (this.currentItemIndex >= this.items.length) {
      this.timeLeft = 0;
      this.currentItemIndex = 0;
      this.nextItemIndex = 0;
      this.isDone = true;
      doneEvent();
  }
  else {
      //The first time an item is displayed, it will not transition in. This code will only execute once.
      if (this.isLoading) {
    hasVideo = this.hasVideo(this.currentItemIndex);

    if (this.transition == "fade") {
        //600 is fade out only.
        this.transitionHold = prefs.getInt("transitionHold") * 1000 - 600;
    }

    if (!hasVideo) {
        this.startTimer();
    }
      }
      else {
    hasVideo = this.hasVideo(this.currentItemIndex);  //First item
    this.addItems();

    $(".item").each(function(i) {
        if (self.nextItemIndex < self.items.length) {
      self.populateItem(self.items[self.nextItemIndex], i, self.nextItemIndex);
      $(".item").eq(i).show();
        }
        //Clear other item.
        else {
      $(".item").eq(i).hide();
        }

        self.nextItemIndex++; //Item to show on next cycle.
    });

    if (this.transition == "fade") {
        //1600 is transition time.
        this.transitionHold = prefs.getInt("transitionHold") * 1000 - 1200;

        if (!this.isFadingIn && !this.isFadingOut) {
      this.isFadingIn = true;

      //This breaks video so don't use it.
      if (!hasVideo) {
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
      }

      //Start the timer when fade in has completed.
      $("#container").fadeTo("slow", 1.0, function() {
          self.isFadingIn = false;

          if (!self.isPaused) {
        if (hasVideo) {
            jwplayer(0).playlistItem(self.currentItemIndex);
        }
        else {
            self.startTimer();
        }
          }
      });
        }
    }
    else {
        //This breaks video so don't use it.
        if (!hasVideo) {
      $(".item").dotdotdot({
          height: this.getItemHeight()
      });
        }

        if (!this.isPaused) {
      if (hasVideo) {
          jwplayer(0).playlistItem(this.currentItemIndex);
      }
      else {
          this.startTimer();
      }
        }
    }
      }
  }
    }
}
RiseVision.RSS.Controller.prototype.showNext = function() {
    if (this.transition == "fade") {
  this.fadeOut();
    }
    else {
  this.transitionOut();
    }
}
RiseVision.RSS.Controller.prototype.transitionOut = function() {
    var self = this;

    this.showFeedTimer = null;
    this.currentItemIndex = this.nextItemIndex;

    if (!this.isPaused) {
  setTimeout(function() {
      self.showItem.call(self);
  }, 1000);
    }
}
RiseVision.RSS.Controller.prototype.fadeOut = function() {
    var self = this;

    if (!this.isFadingIn && !this.isFadingOut) {
  this.showFeedTimer = null;
  this.isFadingOut = true;

  //Don't fade out completely as this will mess up video.
  $("#container").fadeTo("slow", 0.01, function() {
      self.isFadingOut = false;
      self.currentItemIndex = self.nextItemIndex;

      if (!self.isPaused) { //This may break Market Wall?
    self.showItem();
      }
  });
    }
}
RiseVision.RSS.Controller.prototype.startTimer = function() {
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
RiseVision.RSS.Controller.prototype.pauseTimer = function() {
  var seconds, self = this, videoFound = false;

  //this.isPlaying is needed for multi-page Presentations (i.e. Market Wall).
  if (this.isPlaying) {
    clearTimeout(this.showFeedTimer);
    clearTimeout(this.resumeVideoTimer);

    //Pause all videos, if applicable.
    $(".videoWrapper").each(function(index) {
      if ($(this).is(":visible")) {
        jwplayer(index).play(false);
        videoFound = true;
      }
    });

    //if (!videoFound) {  // Issue 1154
      if ($(".item:first").is(":visible")) {
        this.timeLeft = this.transitionHold;
        this.timeLeft -= new Date() - this.startTimeout;

        //Round to nearest second, since transitionHold is counted in seconds.
        seconds = Math.round(this.timeLeft / 1000);
        this.timeLeft = seconds * 1000;

        //Issue 784 - Show next item.
        if (this.isDone || ((prefs.getInt("transitionHold") >= 20) && (seconds <= 10))) {
          this.timeLeft = 0;

          if (this.isDone) {
            if (this.isFeedLoaded) {
              this.showItem();
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
    //}
  }
}
RiseVision.RSS.Controller.prototype.resumeTimer = function() {
  var self = this;

  if (this.hasVideo(this.currentItemIndex)) {
    /* Issue 1154 Start - Don't start the video if the playlist has completed
       and the feed is reloading. */
    if (this.isDone) {
      this.isDone = false;
    }
    else {
      this.showItem();
      jwplayer(0).play(true);
    }
    /* Issue 1154 End */
  }
  else {
    if (this.isLoading) {
      this.timeLeft = this.transitionHold;

      if (this.isFeedLoaded) {
        this.showItem();
      }
      else {
        this.loadFeed();
      }

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
}
/* End - Functions specific to Fade and None transitions. */

/* Start - Helper functions */
RiseVision.RSS.Controller.prototype.getStory = function(item) {
    var story = this.util.getElementByNodeName(item, "content:encoded");

    if (story == null) {
  story = this.util.getElementByNodeName(item, "description");
    }

    return this.util.getNodeValue(story);
}
RiseVision.RSS.Controller.prototype.getItemHeight = function() {
    if (this.showSeparator()) {
  return prefs.getInt("rsH") / this.itemsCount - prefs.getInt("separatorSize");
    }
    else {
  return prefs.getInt("rsH") / this.itemsCount;
    }
}
RiseVision.RSS.Controller.prototype.expireUpdatesTimer = function() {
    this.refresh = true;
}
RiseVision.RSS.Controller.prototype.isHorizontal = function() {
    if ((this.transition != "fade") && (this.transition != "none")) {
  return this.scrollDirection == "ltr" || this.scrollDirection == "rtl";
    }
    else {
  return false;
    }
}
RiseVision.RSS.Controller.prototype.showSeparator = function() {
    if (prefs.getBool("separator") && (this.transition == "item" || this.transition == "continuous") &&
  (this.scrollDirection == "up" || this.scrollDirection == "down")) {
  return true;
    }
    else {
  return false;
    }
}
/*
 * Check if a particular feed item has an image associated with it.
 */
RiseVision.RSS.Controller.prototype.hasImage = function() {
    if (this.imageURLs.length > 0) {
  for (var i = 0; i < this.imageURLs.length; i++) {
      if (this.imageURLs[i] != null) {
    return true;
      }
  }
    }

    return false;
}
/*
 * Check if a particular feed item has a video associated with it.
 */
RiseVision.RSS.Controller.prototype.hasVideo = function(index) {
    if (this.videos) {
  if (this.videos.length > 0 && $(".videoWrapper").length > 0) {
      if (this.videos[index] != null) {
    return true;
      }
      else {
    return false;
      }
  }
  else {
      return false;
  }
    }
}
/*
 * Check if a URL exists within the story of an RSS feed item.
 */
RiseVision.RSS.Controller.prototype.urlExists = function(url, story) {
    if ((url != null) && (story != null)) {
  //Don't use src attribute since some feeds use elongated URLs that contain the original URL.
  //url = 'src="' + url + '"';

  if (story.indexOf(url) == -1) {
      return false;
  }
  else {
      return true;
  }
    }
    else {
  return false;
    }
}
/* End - Helper functions */

RiseVision.RSS.Controller.prototype.play = function() {
  var self = this;

  this.isPlaying = true;

  if ((this.transition == "fade") || (this.transition == "none")) {
    /* Issue 1154 Start */
    this.resumeTimer();
    this.isPaused = false;
    /* Issue 1154 End */
  }
  else if (this.isHorizontal()) {
    //Need to finish initializing horizontal scroller here as the Ready event had to be sent prematurely in order to
    //force any custom fonts to start downloading. Custom fonts won't start to download unless there is a visible DOM element that is using it.
    if (this.isLoading) {
      setTimeout(function() {
        self.horizontalScroll.initialize();
        self.horizontalScroll.tick();
      }, 3000);
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
RiseVision.RSS.Controller.prototype.pause = function() {
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