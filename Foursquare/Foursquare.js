function Venue() {
    var prefs = new gadgets.Prefs();

    //Gadget settings
    this.location = prefs.getString("location");
    this.showCrown = prefs.getBool("showCrown");
    this.showTips = prefs.getBool("showTips");
    this.showSpecials = prefs.getBool("showSpecials");
    this.showPhotos = prefs.getBool("showPhotos");
    this.showMayor = prefs.getBool("showMayor");
    this.showCheckIns = prefs.getBool("showCheckIns");
    this.showQR = prefs.getBool("showQR");
    this.layoutURL = prefs.getString("layoutURL") ? prefs.getString("layoutURL") : "https://s3.amazonaws.com/Gadget-Foursquare/Default.xml";
    this.rsW = prefs.getInt("rsW");
    this.rsH = prefs.getInt("rsH");

    //Other variables
    this.mayor = new Object();
    this.tips = [];
    this.specials = [];
    this.photos = [];
    this.tipsIndex = 0;
    this.specialsIndex = 0;
    this.photosIndex = 0;
    this.hasTips = false, this.hasSpecials = false;
    this.hasPhotos = false;
    this.contentTimer = null;
    this.updateTimerExpired = false;
    this.refreshInterval = 10000;
    this.updateInterval = 60000;
    this.isLoading = true;
    this.isUpdating = false;
    this.currentContentType = null;
    this.contentTypes = {
        tips : "tips",
        specials : "specials",
        photos : "photos"
    }
}

//Load the layout and CSS files.
Venue.prototype.loadLayout = function() {
    var params = {};
    var self = this;
    var link = $("<link>");

    //Load CSS file as specified in the Gadget settings.
    if (this.styleURL) {
        link.attr({
            type : "text/css",
            rel : "stylesheet",
            href : this.styleURL
        });
        $("head").append(link);
    }

    if (this.layoutURL) {
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
        gadgets.io.makeRequest(this.layoutURL, function(obj) {
            var data = obj.data;

            if (data.getElementsByTagName("Style").length > 0) {
                var head = document.getElementsByTagName("head")[0], style = document.createElement("style");

                style.type = "text/css";
                style.innerHTML = data.getElementsByTagName("Style")[0].childNodes[1].nodeValue;
                head.appendChild(style);
            }

            if (data.getElementsByTagName("Layout").length == 0) {
                return;
            }

            //Set the layout for the first page.
            $("#container").html(data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue);
            $("#container").append("<div class='error'></div>");
            self.getData();
        }, params);
    }
}
Venue.prototype.getData = function() {
    gadgets.rpc.call('', 'rsparam_get', null, new gadgets.Prefs().getString("id"), "social:foursquare");
}
Venue.prototype.processData = function(self, name, value) {
    if (value) {
        var json = JSON.parse(value);

        self.token = json.access;
        //access token

        if (!json.access) {//No social connection has been set up.
            self.showError("Please create a Foursquare Social Connection for your Company or Display before using this Gadget.");
            readyEvent();
        }
        else {
            if (self.location == "display" && json.displayLocation) {
                self.venueID = json.displayLocation;
            }
            else {
                self.venueID = json.companyLocation;
            }

            self.getVenue();
        }
    }
    else {
        self.isLoading = false;
        self.showError("Please create a Foursquare Social Connection for your Company or Display before using this Gadget.");
        readyEvent();
    }
}
//Get the venue details from the Foursquare API.
Venue.prototype.getVenue = function() {
    var params = {};
    var self = this;

    this.tips = [];
    this.specials = [];
    this.photos = [];
    this.hasTips = false;
    this.hasSpecials = false;
    this.hasPhotos = false;

    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 60;
    gadgets.io.makeRequest("https://api.foursquare.com/v2/venues/" + this.venueID + "?oauth_token=" + this.token + "&v=20131212", //Issue 1081 - Add version parameter.
    function(response) {
        if (response.data) {
            var i, j;
            var firstName, lastName, photo;
            var venue = response.data.response.venue;
            var index = 0;

            $("#content").show();
            $(".error").hide();

            //Check for mayor.
            if (venue.mayor.count == 0) {//No mayor.
                $("#crown").hide();
                $("#mayor").hide();
                $(".mayor").hide();
                $(".noMayor").show();
            }
            else {
                if (venue.mayor.user) {
                    if (self.showMayor) {
                        $(".photo").attr("src", venue.mayor.user.photo ? venue.mayor.user.photo.prefix + "110x110" + venue.mayor.user.photo.suffix : "");
                    }
                    else {
                        $(".photo").remove();
                    }

                    $(".message").show();
                    $(".noMayor").hide();
                    $(".mayorName").text(venue.mayor.user.firstName ? venue.mayor.user.firstName : "");
                    $(".mayorCheckins").text(venue.mayor.count);
                }
            }

            if (!self.showCrown) {
                $("#crown").hide();
            }

            if (!self.showCheckIns) {
                $("#description").hide();
            }

            //Get total venue check ins.
            if (venue.stats) {
                $(".checkins").text(venue.stats.checkinsCount ? venue.stats.checkinsCount : 0);
            }

            if (self.showQR) {
                $(".qrCode").attr("src", "https://chart.googleapis.com/chart?cht=qr&chs=110x110&chld=H|0&chl=" + encodeURIComponent("https://foursquare.com/mobile/venue/" + self.venueID));
            }
            else {
                //Remove it from the DOM so it doesn't take up space.
                $("#qr").remove();
            }

            //Check for tips.
            if (self.showTips) {
                for ( i = 0; i < venue.tips.groups.length; i++) {
                    for ( j = 0; j < venue.tips.groups[i].items.length; j++) {
                        var tipDate = new Date(venue.tips.groups[i].items[j].createdAt * 1000);

                        self.tips[index] = new Object();
                        self.tips[index].name = venue.tips.groups[i].items[j].user.firstName;
                        self.tips[index].photo = venue.tips.groups[i].items[j].user.photo;
                        self.tips[index].text = venue.tips.groups[i].items[j].text;
                        self.tips[index].date = tipDate.toString("MMMM d, yyyy");
                        self.hasTips = true;
                        index++;
                    }
                }
            }

            //Check for specials.
            if (self.showSpecials) {
                for ( i = 0; i < venue.specials.length; i++, j++) {
                    self.specials[i] = new Object();
                    self.specials[i].icon = venue.specials[i].icon;
                    self.specials[i].title = venue.specials[i].title;
                    self.specials[i].text = venue.specials[i].message;
                    self.hasSpecials = true;
                }
            }

            index = 0;

            //Check for photos.
            if (self.showPhotos) {
                //Show both checkin and venue photos.
                for ( i = 0; i < venue.photos.groups.length; i++) {
                    for ( j = 0; j < venue.photos.groups[i].items.length; j++) {
                        self.photos[index] = new Object();
                        //Get the first item, which is the photo at its original size.
                        //self.photos[index].url = venue.photos.groups[i].items[j].sizes.items[0].url;
                        self.photos[index].url = venue.photos.groups[i].items[j].prefix + "original" + venue.photos.groups[i].items[j].suffix;
                        self.photos[index].width = venue.photos.groups[i].items[j].width;
                        self.photos[index].height = venue.photos.groups[i].items[j].height;
                        self.hasPhotos = true;
                        index++;
                    }
                }

                if (self.hasPhotos) {
                    //Configure the cover flow.
                    if (self.rsW > self.rsH) {
                        $("#lower").height($("#container").height() - $("#upper").outerHeight(true));

                        if (self.cf) {
                            self.cf = null;
                            $(".flow").empty();
                        }

                        self.cf = new ContentFlow("cf", {
                            flowSpeedFactor : 2.0,
                            scaleFactor : 1.0,
                            maxItemHeight : $("#lower").height() * 0.5, //Issue 646 - Leave enough room for full height of reflection.
                            //relativeItemPosition: "center",
                            reflectionHeight : 0.0
                        });
                    }
                    else {
                        self.cf = new ContentFlow("cf", {
                            flowSpeedFactor : 2.0,
                            scaleFactor : 1.0,
                            //relativeItemPosition: "center",
                            reflectionHeight : 0.0
                        });
                    }

                    var imageCount = 0, totalImages = self.photos.length;

                    $.each(self.photos, function(index, value) {
                        var $item = $("<div class='item'>"), $content = $("<img class='content'>");

                        //Append image once it has loaded.
                        $content.load(function() {
                            $item.append($content);

                            //Add image as last item in cover flow.
                            self.cf.addItem($item.get(0), "last", function() {
                                imageCount++;

                                //Once all images have been added, move to the first image.
                                //Remove the old cover flow and show the new one.
                                if (imageCount == totalImages) {
                                    if (totalImages == 1) {//Already at first photo.
                                        self.hideCoverFlow();
                                        self.setContentType();
                                        self.isLoading = false;
                                        readyEvent();
                                    }
                                    else {//Move to first photo.
                                        self.cf.moveTo("first", function() {
                                            self.hideCoverFlow();
                                            self.setContentType();
                                            self.isLoading = false;
                                            readyEvent();
                                        });
                                    }
                                }
                            });
                        });

                        $content.error(function() {
                            console.log("Image could not be loaded: " + value.url);
                            imageCount++;
                        });

                        $content.attr("src", value.url);
                    });
                }
                else {
                    self.setContentType();
                    self.isLoading = false;
                    readyEvent();
                }
            }
            else {
                self.setContentType();
                self.isLoading = false;
                readyEvent();
            }

            setTimeout(function() {
                self.expireUpdatesTimer(self);
            }, self.updateInterval);
        }
        else {
            if (response.errors.length > 0) {
                if (response.errors[0] == "400 Error") {
                    self.showError(self.venueID + " is not a valid Venue ID.");
                }
                else if (response.errors[0] == "401 Error") {
                    self.showError("The Foursquare token has been revoked. Please generate a new one.");
                }
            }

            self.isLoading = false;
            readyEvent();
        }
    }, params);
}
Venue.prototype.showError = function(message) {
    var self = this;

    $("#content").hide();
    $(".error").text(message).show();
    setTimeout(function() {
        self.getData();
    }, this.updateInterval);
}
Venue.prototype.setContentType = function() {
    //No Tips, Specials or Photos
    if (!this.currentContentType) {
        if (this.hasTips) {
            this.currentContentType = this.contentTypes.tips;
        }
        else if (this.hasSpecials) {
            this.currentContentType = this.contentTypes.specials;
        }
        else if (this.hasPhotos) {
            this.currentContentType = this.contentTypes.photos;
        }
        else {
            $("#tips").hide();
            $("#specials").hide();
            this.hideCoverFlow();
        }
    }
    else if (this.currentContentType == this.contentTypes.tips) {
        if (this.hasSpecials) {
            this.currentContentType = this.contentTypes.specials;
        }
        else if (this.hasPhotos) {
            this.currentContentType = this.contentTypes.photos;
        }
    }
    else if (this.currentContentType == this.contentTypes.specials) {
        if (this.hasPhotos) {
            this.currentContentType = this.contentTypes.photos;
        }
        else if (this.hasTips) {
            this.currentContentType = this.contentTypes.tips;
        }
    }
    else {//Photos
        if (this.hasTips) {
            this.currentContentType = this.contentTypes.tips;
            $("#wrapper").show();
        }
        else if (this.hasSpecials) {
            this.currentContentType = this.contentTypes.specials;
            $("#wrapper").show();
        }
    }

    this.showContent();
}
Venue.prototype.showContent = function() {
    var self = this;

    switch (this.currentContentType) {
        case this.contentTypes.tips:
            this.displayTips();
            break;
        case this.contentTypes.specials:
            this.displaySpecials();
            break;
        case this.contentTypes.photos:
            this.showNextPhoto();
            break;
    }
}
Venue.prototype.displayTips = function() {
    var self = this, $wrapper = $("#wrapper");

    if (this.tipsIndex == this.tips.length) {
        this.tipsIndex = 0;
        this.setContentType();
    }
    else {
        if (!this.isLoading) {
            if (this.tipsIndex == 0) {
                //Don't fade out if there are no specials and photos and there are not more than 2 tips.
                if (!this.hasSpecials && !this.hasPhotos && this.tips.length <= 2) {
                    this.fadeInTips();
                    //Just starts the timer.
                }
                else {
                    //Coming from photos.
                    if ($("#wrapper").hasClass("fadeOut")) {
                        this.fadeInTips();
                    }
                    //Only Show Tips is selected and there are more than 2 tips, or Show Tips is not the only item selected.
                    else {
                        this.fadeOutTips();
                    }
                }
            }
            else {
                this.fadeOutTips();
            }
        }
    }
}
Venue.prototype.fadeOutTips = function() {
    var self = this;

    $("#wrapper").bind("webkitTransitionEnd", function(event) {
        self.fadeInTips();
        $(this).unbind(event);
    });

    $("#wrapper").addClass("fadeOut").removeClass("fadeIn");
}
Venue.prototype.fadeInTips = function() {
    var self = this, $wrapper = $("#wrapper");

    this.hideCoverFlow();
    $wrapper.show();
    $("#specials").hide();
    $("#tips").show();
    $(".tipPhotoWrapper").show();
    $(".tipWrapper").show();
    this.loadTips();

    if ($wrapper.hasClass("fadeIn")) {
        self.startTimer();
    }
    else {
        $wrapper.bind("webkitTransitionEnd", function(event) {
            self.startTimer();
            $(this).unbind(event);
        });

        $wrapper.addClass("fadeIn").removeClass("fadeOut");
    }
}
Venue.prototype.loadTips = function() {
    var self = this;

    $(".tipPhoto").each(function(index) {
        if (self.tipsIndex == self.tips.length) {
            //Hide second tip if there is only one left to show.
            if (index == $(".tipPhoto").length - 1) {
                $(".tipPhotoWrapper").slice(index).hide();
                $(".tipWrapper").slice(index).hide();
                return false;
            }
        }

        $(this).attr("src", self.tips[self.tipsIndex].photo.prefix + "110x110" + self.tips[self.tipsIndex].photo.suffix);
        $(".tip").eq(index).text(self.tips[self.tipsIndex].text);
        $(".tipName").eq(index).text(self.tips[self.tipsIndex].name);
        $(".tipDate").eq(index).text(self.tips[self.tipsIndex].date);
        self.tipsIndex++;
    });
}
Venue.prototype.displaySpecials = function() {
    var self = this, $wrapper = $("#wrapper");

    if (this.specialsIndex == this.specials.length) {
        this.specialsIndex = 0;
        this.setContentType();
    }
    else {
        if (!this.isLoading) {
            if (this.specialsIndex == 0) {
                //Don't fade out if there are no tips and photos and there are not more than 2 specials.
                if (!this.hasTips && !this.hasPhotos && this.specials.length <= 2) {
                    this.fadeInSpecials();
                    //Just starts the timer.
                }
                else {
                    //Coming from photos.
                    if ($("#wrapper").hasClass("fadeOut")) {
                        this.fadeInSpecials();
                    }
                    //Only Show Specials is selected and there are more than 2 specials, or Show Specials is not the only item selected.
                    else {
                        this.fadeOutSpecials();
                    }
                }
            }
            else {
                this.fadeOutSpecials();
            }
        }
    }
}
Venue.prototype.fadeOutSpecials = function() {
    var self = this;

    $("#wrapper").bind("webkitTransitionEnd", function(event) {
        self.fadeInSpecials();
        $(this).unbind(event);
    });

    $("#wrapper").addClass("fadeOut").removeClass("fadeIn");
}
Venue.prototype.fadeInSpecials = function() {
    var self = this, $wrapper = $("#wrapper");

    this.hideCoverFlow();
    $wrapper.show();
    $("#tips").hide();
    $("#specials").show();
    $(".specialLogoWrapper").show();
    $(".specialWrapper").show();
    this.loadSpecials();

    if ($wrapper.hasClass("fadeIn")) {
        self.startTimer();
    }
    else {
        $wrapper.bind("webkitTransitionEnd", function(event) {
            self.startTimer();
            $(this).unbind(event);
        });

        $wrapper.addClass("fadeIn").removeClass("fadeOut");
    }
}
Venue.prototype.loadSpecials = function() {
    var self = this;

    $(".specialLogo").each(function(index) {
        if (self.specialsIndex == self.specials.length) {
            //Hide second special if there is only one left to show.
            if (index == $(".specialLogo").length - 1) {
                $(".specialLogoWrapper").slice(index).hide();
                $(".specialWrapper").slice(index).hide();
                return false;
            }
        }

        $(this).attr("src", "//foursquare.com/img/specials/" + self.specials[self.specialsIndex].icon + ".png");
        $(".specialTitle").eq(index).text(self.specials[self.specialsIndex].title);
        $(".special").eq(index).text(self.specials[self.specialsIndex].text);
        self.specialsIndex++;
    });
}
Venue.prototype.showNextPhoto = function() {
    var self = this, $wrapper = $("#wrapper");

    //This will only execute if the Gadget is not updating.
    if (this.photosIndex == this.photos.length) {
        //Minor issue - photos don't fade out.
        this.photosIndex = 0;
        this.setContentType();
    }
    else {
        if (!this.isLoading) {
            this.cf.moveTo(this.photosIndex);

            if (this.photosIndex == 0) {
                //Fade out wrapper if necessary.
                if ($wrapper.hasClass("fadeIn")) {
                    $wrapper.bind("webkitTransitionEnd", function(event) {
                        $wrapper.hide();
                        self.showCoverFlow();
                        $(this).unbind(event);
                    });

                    $wrapper.addClass("fadeOut").removeClass("fadeIn");
                }
                //Only Show Photos is selected.
                else {
                    $wrapper.hide();
                    this.showCoverFlow();
                }
            }

            this.photosIndex++;
            this.startTimer();
        }
    }
}
Venue.prototype.startTimer = function() {
    var self = this;

    this.contentTimer = setTimeout(function() {
        self.checkForUpdates();

        if (self.isUpdating) {
            if (self.currentContentType == self.contentTypes.tips) {
                self.tipsIndex = 0;
            }
            else if (self.currentContentType == self.contentTypes.specials) {
                self.specialsIndex = 0;
            }
            else {
                self.photosIndex = 0;
            }

            self.updateTimerExpired = false;
            self.getData();
        }
        else {
            if (self.currentContentType == self.contentTypes.tips) {
                self.displayTips();
            }
            else if (self.currentContentType == self.contentTypes.specials) {
                self.displaySpecials();
            }
            else {
                self.showNextPhoto();
            }
        }
    }, this.refreshInterval);
}
//Cover Flow can't be hidden or it will not work correctly.
//Instead, move it off-screen when hidden and move it back to its original position when shown.
Venue.prototype.hideCoverFlow = function() {
    $("#cf").css({
        top : "10000px"
    });
    $("#photos").addClass("photoFadeOut").removeClass("fadeIn");
}
Venue.prototype.showCoverFlow = function() {
    $("#cf").css({
        top : ""
    });
    $("#photos").addClass("fadeIn").removeClass("photoFadeOut");
}
Venue.prototype.startContentTimer = function() {
    if (this.currentContentType == this.contentTypes.tips) {
        this.fadeInTips();
    }
    else if (this.currentContentType == this.contentTypes.specials) {
        this.fadeInSpecials();
    }
    else if (this.currentContentType == this.contentTypes.photos) {
        this.showNextPhoto();
    }
}
Venue.prototype.stopContentTimer = function() {
    clearTimeout(this.contentTimer);
}
Venue.prototype.expireUpdatesTimer = function(self) {
    self.updateTimerExpired = true;
}
Venue.prototype.checkForUpdates = function() {
    this.isUpdating = false;

    //Update timer must have expired so that we are not constantly
    //checking for updates for venues that don't have a lot of content.
    if (this.updateTimerExpired) {
        //Updating should be done after all tips have been shown.
        if ((this.currentContentType == this.contentTypes.tips) && (this.tipsIndex == this.tips.length)) {
            this.isUpdating = true;
        }
        //All specials have been shown and there are no tips.
        else if ((this.currentContentType == this.contentTypes.specials) && (this.specialsIndex == this.specials.length) && (this.tips.length == 0)) {
            this.isUpdating = true;
        }
        //All photos have been shown and there are no tips or specials.
        else if ((this.currentContentType == this.contentTypes.photos) && (this.photosIndex == this.photos.length) && (this.tips.length == 0) && (this.specials.length == 0)) {
            this.isUpdating = true;
        }
        else if (!this.currentContentType) {
            this.isUpdating = true;
        }
    }
}