var RiseVision = RiseVision || {};
RiseVision.FinancialChart = {};
RiseVision.FinancialChart.Settings = {};
RiseVision.FinancialChart.Controller = {};
RiseVision.FinancialChart.Chart = {};

/*
 * The Settings class handles the display and behavior of Gadget settings in the editor.
 */
RiseVision.FinancialChart.Settings = function() {
    this.settings = new RiseVision.Common.Settings();
}
//Populate settings from saved values.
RiseVision.FinancialChart.Settings.prototype.initSettings = function() {
    var self = this;

    //Add event handlers.
    $(".stockSelector").on("click", function(event) {
	chart.showStockSelector($(this).data("for"));
    });

    $(".colorPicker").on("click", function(event) {
	chart.showColorPicker($(this).data("for"));
    });

    $(".fontSelector").on("click", function(event) {
	chart.showFontSelector($(this).data("for"));
    });

    $("#duration").on("change", function(event) {
	if ($(this).val() == "Day") {
	    $("li.previousClose").show();
	}
	else {
	    $("li.previousClose").hide();
	}
    });

    $("#showTitles").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.title").show();
	}
	else {
	    $("li.title").hide();
	}
    });

    $("#showVolume").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.volume").show();
	}
	else {
	    $("li.volume").hide();
	}
    });

    $("#showVolumeTitle").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.volumeTitle").show();
	}
	else {
	    $("li.volumeTitle").hide();
	}
    });

    $("#showDuration").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.duration").show();
	}
	else {
	    $("li.duration").hide();
	}
    });

    $("#showComparison").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.comparison").show();
	    $("li.fill").hide();
	}
	else {
	    $("li.comparison").hide();
	    $("li.fill").show();
	}
    });

    $("#showAxis").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.axis").show();
	}
	else {
	    $("li.axis").hide();
	}
    });

    //Request additional parameters from the Viewer.
    gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
	if (result) {
	    result = JSON.parse(result);

	    $("#instrument").val(prefs.getString("instrument"));
	    $("#disclaimerFont").val(prefs.getString("disclaimerFont"));
	    $("#disclaimerLoc").val(prefs.getString("disclaimerLoc"));
	    $("#acceptance").attr("checked", prefs.getBool("acceptance"));

	    //Chart Duration
	    $("#duration").val(prefs.getString("duration"));
	    $("#previousCloseColor").val(prefs.getString("previousCloseColor"));

	    //Chart Titles
	    $("#showTitles").attr("checked", prefs.getBool("showTitles"));
	    $("#titleDecimals").val(prefs.getString("titleDecimals"));
	    $("#titleSign").val(prefs.getString("titleSign"));

	    //Volume
	    $("#showVolume").attr("checked", prefs.getBool("showVolume"));
	    $("#showVolumeTitle").attr("checked", prefs.getBool("showVolumeTitle"));
	    $("#volumeHeight").val(prefs.getInt("volumeHeight"));
	    $("#volumeColor").val(prefs.getString("volumeColor"));
	    $("#barWidth").val(prefs.getInt("barWidth") == "" ? 2 : prefs.getInt("barWidth"));

	    //Duration Options
	    $("#showDuration").attr("checked", prefs.getBool("showDuration"));
	    $("#durButtonColor").val(prefs.getString("durButtonColor"));
	    $("#durSelButtonColor").val(prefs.getString("durSelButtonColor"));
	    $("#durButtonRadius").val(prefs.getString("durButtonRadius"));
	    $("#durRotate").val(prefs.getInt("durRotate"));
	    $("#durReturn").val(prefs.getInt("durReturn"));

	    //Comparative Instruments
	    $("#showComparison").attr("checked", prefs.getBool("showComparison"));
	    $("#compInstruments").val(prefs.getString("compInstruments"));
	    $("#compNames").val(prefs.getString("compNames"));
	    $("#compLineColor").val(prefs.getString("compLineColor"));
	    $("#compButtonRadius").val(prefs.getString("compButtonRadius"));
	    $("#compButtonColor").val(prefs.getString("compButtonColor"));
	    $("#compSelButtonColor").val(prefs.getString("compSelButtonColor"));
	    $("#compReturn").val(prefs.getInt("compReturn"));

	    //Axis
	    $("#showAxis").attr("checked", prefs.getBool("showAxis"));
	    $("#axisDecimals").val(prefs.getString("axisDecimals"));
	    $("#axisLineColor").val(prefs.getString("axisLineColor"));

	    //Other
	    $("#gridLineColor").val(prefs.getString("gridLineColor"));
	    $("#chartPlotLineColor").val(prefs.getString("chartPlotLineColor"));
	    $("#chartFillColor").val(prefs.getString("chartFillColor"));
	    $("#bgColor").val(prefs.getString("bgColor"));

	    //Populate colors and show color as background of text box.
	    self.populateColor($("#previousCloseColor"), prefs.getString("previousCloseColor"));
	    self.populateColor($("#volumeColor"), prefs.getString("volumeColor"));
	    self.populateColor($("#durButtonColor"), prefs.getString("durButtonColor"));
	    self.populateColor($("#durSelButtonColor"), prefs.getString("durSelButtonColor"));
	    self.populateColor($("#compLineColor"), prefs.getString("compLineColor"));
	    self.populateColor($("#compButtonColor"), prefs.getString("compButtonColor"));
	    self.populateColor($("#compSelButtonColor"), prefs.getString("compSelButtonColor"));
	    self.populateColor($("#axisLineColor"), prefs.getString("axisLineColor"));
	    self.populateColor($("#gridLineColor"), prefs.getString("gridLineColor"));
	    self.populateColor($("#chartPlotLineColor"), prefs.getString("chartPlotLineColor"));
	    self.populateColor($("#chartFillColor"), prefs.getString("chartFillColor"));
	    self.populateColor($("#bgColor"), prefs.getString("bgColor"));

	    //Populate fields saved as additionalParams.
	    $("#title_font-style").text(result["title_font"]);
	    $("#title_font-style").data("css", result["title_font-style"]);
	    $("#volume_font-style").text(result["volume_font"]);
	    $("#volume_font-style").data("css", result["volume_font-style"]);
	    $("#durButton_font-style").text(result["durButton_font"]);
	    $("#durButton_font-style").data("css", result["durButton_font-style"]);
	    $("#compButton_font-style").text(result["compButton_font"]);
	    $("#compButton_font-style").data("css", result["compButton_font-style"]);
	    $("#axis_font-style").text(result["axis_font"]);
	    $("#axis_font-style").data("css", result["axis_font-style"]);
	}

	$("form ol li ol.drillDown li:visible:last").css({
	    "clear": "left",
	    "float": "left",
	    "margin-bottom": "10px"
	});

	//Manually trigger event handlers so that the visibility of fields can be set.
	$("#duration").trigger("change");
	$("#showTitles").triggerHandler("click");
	$("#showVolume").triggerHandler("click");
	$("#showVolumeTitle").triggerHandler("click");
	$("#showDuration").triggerHandler("click");
	$("#showComparison").triggerHandler("click");
	$("#showAxis").triggerHandler("click");
	$("#settings").show();
    });
}
RiseVision.FinancialChart.Settings.prototype.populateColor = function($element, color) {
    $element.val(color);
    $element.css("background-color", color);
}
RiseVision.FinancialChart.Settings.prototype.showStockSelector = function(id) {
    gadgets.rpc.call("", "rscmd_openFinancialSelector", null, id, $("#" + id).val());
}
RiseVision.FinancialChart.Settings.prototype.showColorPicker = function(id) {
    gadgets.rpc.call("", "rscmd_openColorPicker", null, id, $("#" + id).val());
}
RiseVision.FinancialChart.Settings.prototype.showFontSelector = function(id) {
    gadgets.rpc.call("", "rscmd_openFontSelector", null, id, $("#" + id).data("css"));
}
RiseVision.FinancialChart.Settings.prototype.setStocks = function(id, stocks) {
    $("#" + id).val(stocks);
}
RiseVision.FinancialChart.Settings.prototype.setColor = function(id, color) {
    $("#" + id).val(color);
    $("#" + id).css("background-color", color);
}
RiseVision.FinancialChart.Settings.prototype.setFont = function(id, css, style) {
    $("#" + id).data("css", css);
    $("#" + id).text(style);
}
RiseVision.FinancialChart.Settings.prototype.getSettings = function() {
    var errorFound = false,
	errors = document.getElementsByClassName("errors")[0],
	params = "",
	settings = null;

    $(".errors").empty();

    //Numeric fields
    errorFound = (chart.settings.validateNumeric($("#volumeHeight"), errors, "Volume Height")) ? true : errorFound;
    errorFound = (chart.settings.validateNumeric($("#barWidth"), errors, "Bar Width")) ? true : errorFound;
    errorFound = (chart.settings.validateNumeric($("#durButtonRadius"), errors, "Duration Button Corner Radius")) ? true : errorFound;
    errorFound = (chart.settings.validateNumeric($("#durRotate"), errors, "Rotate Every")) ? true : errorFound;
    errorFound = (chart.settings.validateNumeric($("#durReturn"), errors, "Return to Default After")) ? true : errorFound;
    errorFound = (chart.settings.validateNumeric($("#compButtonRadius"), errors, "Comparison Button Corner Radius")) ? true : errorFound;
    errorFound = (chart.settings.validateNumeric($("#compReturn"), errors, "Chart Returns to Default")) ? true : errorFound;

    //Required fields
    errorFound = (chart.settings.validateRequired($("#instrument"), errors, "Instrument")) ? true : errorFound;

    if ($("#showComparison").is(":checked")) {
	errorFound = (chart.settings.validateRequired($("#compInstruments"), errors, "Comparative Instruments")) ? true : errorFound;
    }

    if (errorFound) {
	$(".errors").fadeIn(200).css("display", "inline-block");
	$("#wrapper").scrollTop(0);

	return null;
    }
    else {
	//Construct parameters string to pass to RVA.
	params = "up_instrument=" + escape($("#instrument").val()) +
	    "&up_disclaimerFont=" + $("#disclaimerFont").val() +
	    "&up_disclaimerLoc=" + $("#disclaimerLoc").val();

	if ($("#acceptance").is(":checked")) {
	    params += "&up_acceptance=true";
	}
	else {
	    params += "&up_acceptance=false";
	}

	params += "&up_duration=" + $("#duration").val() +
	    "&up_previousCloseColor=" + $("#previousCloseColor").val();

	if ($("#showTitles").is(":checked")) {
	    params += "&up_showTitles=true";
	}
	else {
	    params += "&up_showTitles=false";
	}

	params += "&up_titleDecimals=" + $("#titleDecimals").val() +
	    "&up_titleSign=" + $("#titleSign").val();

	if ($("#showVolume").is(":checked")) {
	    params += "&up_showVolume=true";
	}
	else {
	    params += "&up_showVolume=false";
	}

	if ($("#showVolumeTitle").is(":checked")) {
	    params += "&up_showVolumeTitle=true";
	}
	else {
	    params += "&up_showVolumeTitle=false";
	}

	params += "&up_volumeHeight=" + $("#volumeHeight").val() +
	    "&up_volumeColor=" + $("#volumeColor").val() +
	    "&up_barWidth=" + $("#barWidth").val();

	if ($("#showDuration").is(":checked")) {
	    params += "&up_showDuration=true";
	}
	else {
	    params += "&up_showDuration=false";
	}

	params += "&up_durButtonColor=" + $("#durButtonColor").val() +
	    "&up_durSelButtonColor=" + $("#durSelButtonColor").val() +
	    "&up_durButtonRadius=" + $("#durButtonRadius").val() +
	    "&up_durRotate=" + $("#durRotate").val() +
	    "&up_durReturn=" + $("#durReturn").val();

	if ($("#showComparison").is(":checked")) {
	    params += "&up_showComparison=true";
	}
	else {
	    params += "&up_showComparison=false";
	}

	params += "&up_compInstruments=" + escape($("#compInstruments").val()) +
	    "&up_compNames=" + escape($("#compNames").val()) +
	    "&up_compLineColor=" + $("#compLineColor").val() +
	    "&up_compButtonRadius=" + $("#compButtonRadius").val() +
	    "&up_compButtonColor=" + $("#compButtonColor").val() +
	    "&up_compSelButtonColor=" + $("#compSelButtonColor").val() +
	    "&up_compReturn=" + $("#compReturn").val();

	if ($("#showAxis").is(":checked")) {
	    params += "&up_showAxis=true";
	}
	else {
	    params += "&up_showAxis=false";
	}

	params += "&up_axisDecimals=" + $("#axisDecimals").val() +
	    "&up_axisLineColor=" + $("#axisLineColor").val() +
	    "&up_gridLineColor=" + $("#gridLineColor").val() +
	    "&up_chartPlotLineColor=" + $("#chartPlotLineColor").val() +
	    "&up_chartFillColor=" + $("#chartFillColor").val() +
	    "&up_bgColor=" + $("#bgColor").val();

	settings = {
	    "params": params,
	    "additionalParams": JSON.stringify(chart.saveAdditionalParams())
	};

	$(".errors").css({ display: "none" });

	return settings;
    }
}
RiseVision.FinancialChart.Settings.prototype.saveAdditionalParams = function() {
    var additionalParams = {};

    additionalParams["title_font"] = $("#title_font-style").text();
    additionalParams["title_font-style"] = $("#title_font-style").data("css");
    additionalParams["volume_font"] = $("#volume_font-style").text();
    additionalParams["volume_font-style"] = $("#volume_font-style").data("css");
    additionalParams["durButton_font"] = $("#durButton_font-style").text();
    additionalParams["durButton_font-style"] = $("#durButton_font-style").data("css");
    additionalParams["compButton_font"] = $("#compButton_font-style").text();
    additionalParams["compButton_font-style"] = $("#compButton_font-style").data("css");
    additionalParams["axis_font"] = $("#axis_font-style").text();
    additionalParams["axis_font-style"] = $("#axis_font-style").data("css");

   return additionalParams;
}

/*
 * The Controller class takes care of managing all chart instances.
 * There may be multiple instances when the Show Duration Options setting is checked.
 */
RiseVision.FinancialChart.Controller = function(displayID) {
    this.displayID = displayID;

    var id = 0,
	options = {
	    "displayID": this.displayID,
	    "doCompare": this.doCompare(),
	    "callback": this.onDataLoaded
	};

    this.instrument = $.trim(prefs.getString("instrument")).split(",").slice(0, 1)[0];	 //Only one instrument can be specified as the primary instrument.
    this.isLoading = true;
    this.isPlaying = false;
    this.isDataLoaded = false;
    this.isReloading = false;
    this.isRefreshing = false;
    this.isRetrying = false;
    this.notPermissioned = false;
    this.isDrawn = false;
    this.numRetries = 0;
    this.retryLimit = 3;
    this.isSpinnerVisible = false;
    this.isLabelFirst = false;
    this.compareIndex = -1;
    this.numCallbacks = 0;
    this.numReloads = 0;
    this.totalReloads = 0;
    this.refreshInterval = 60000;
    this.errorInterval = 10000;
    this.charts = [];
    this.compInstruments = [];
    this.compNames = [];
    this.compData = [];
    this.chartData = {};
    this.titleData = null;
    this.showDuration = prefs.getBool("showDuration");
    this.duration = prefs.getString("duration");
    this.durations = [{type: "Day", description: "Day"}, {type: "Week", description: "Week"}, {type: "1M", description: "Month"}, {type: "3M", description: "3 Months"},
	{type: "6M", description: "6 Months"}, {type: "1Y", description: "1 Year"}, {type: "5Y", description: "5 Years"}];
    this.realTime = new RiseVision.Common.Financial.RealTime(this.displayID, this.instrument);
    this.arrowURL = "https://s3.amazonaws.com/risecontentlogos/financial/";
    this.url = "https://contentfinancial2.appspot.com/reserve?id=" + this.displayID + "&codes=" + this.instrument;

    //Create one chart instance for each combination of instrument and chart duration.
    if (this.showDuration) {
	for (var i = 0; i < this.durations.length; i++) {
	    options.id = id;
	    options.instrument = this.instrument;
	    options.duration = this.durations[i].type;

	    this.charts.push({
		"primary": new RiseVision.FinancialChart.PrimaryInstrument(options)
	    });

	    this.createDurationButton(this.durations[i]);

	    if (this.durations[i].type == prefs.getString("duration")) {
		this.currentIndex = i;
		this.currentChart = this.charts[this.currentIndex];
	    }

	    id++;
	}

	$("#durations").show();
    }
    else {
	options.id = id;
	options.instrument = this.instrument;
	options.duration = prefs.getString("duration");

	this.charts.push({
	    "primary": new RiseVision.FinancialChart.PrimaryInstrument(options)
	});
	this.currentIndex = 0;
	this.currentChart = this.charts[this.currentIndex];

	id++;
    }

    //Create one chart instance for each combination of comparative instrument and chart duration.
    if (prefs.getBool("showComparison")) {
	var compInstruments = prefs.getString("compInstruments").split(","),
	    compNames = [];

	if (prefs.getString("compNames")) {
	    compNames = prefs.getString("compNames").split(",");
	}

	//A max. of 3 instruments can be compared.
	compInstruments = compInstruments.slice(0, 3);
	compNames = compNames.slice(0, 3);
	this.url += "|" + compInstruments.join("|");

	//Create array of objects from retrieving real-time data for comparative instruments.
	for (var i = 0; i < compInstruments.length; i++) {
	    this.compData[i] = new RiseVision.Common.Financial.RealTime(this.displayID, $.trim(compInstruments[i]));
	}

	for (var i = 0; i < this.charts.length; i++) {
	    for (var j = 0; j < compInstruments.length; j++) {
		if (j == 0) {
		    this.charts[i].comparative = [];
		}

		this.charts[i].comparative.push(new RiseVision.FinancialChart.Instrument({
		    "id": id,
		    "displayID": this.displayID,
		    "instrument": $.trim(compInstruments[j]),
		    "duration": this.charts[i].primary.getDuration(),
		    "name": compNames[j],
		    "callback": this.onDataLoaded
		}));

		id++;
	    }
	}

	this.createInstrumentButtons(compInstruments);
    }

    switch (prefs.getInt("axisDecimals")) {
	case 1:
	    this.factor = 10;
	    break;
	case 2:
	    this.factor = 100;
	    break;
	case 3:
	    this.factor = 1000;
	    break;
	case 4:
	    this.factor = 10000;
	    break;
	default:
	    this.factor = 1;
	    break;
    }

    this.setTotalCallbacks();
    this.reserveInstruments();

    $(document).bind("retry", function (e, callback) {
	controller.startRetryTimer(callback);
    });
}
//Issue 919 - Make a request to reserve the instruments so that interval volume will be calculated on the server
//as opposed to accumulated volume.
RiseVision.FinancialChart.Controller.prototype.reserveInstruments = function() {
    var self = this;

    gadgets.io.makeRequest(encodeURI(this.url), function(obj) {
    }, {});

    //Reserve instruments every 24 hours.
    setTimeout(function() {
	self.reserveInstruments();
    }, 86400000);
}
RiseVision.FinancialChart.Controller.prototype.stopRotation = function() {
    clearTimeout(this.rotateTimer);
}
RiseVision.FinancialChart.Controller.prototype.setInstrument = function(instrument, resumeRotation) {
  if (!this.isRefreshing) {
    this.resumeRotation = resumeRotation;	//Issue 905

    if (!resumeRotation) {
	clearTimeout(this.rotateTimer);
    }

    if (this.isRetrying) {
	clearInterval(this.retryTimer);
	this.isReloading = false;
	this.isRetrying = false;
    }

    if (this.instrument == instrument) {
	return;
    }
    else {
	this.instrument = instrument;
    }

    //Don't reload data if it hasn't finished loading from the last time.
    if (!this.isReloading) {
	clearTimeout(this.refreshTimer);
	clearTimeout(this.inactivityTimer);

	this.chartData = {};
	this.isReloading = true;
	this.currentIndex = 0;
	this.realTime.setInstruments(instrument);

	//Update instruments for all charts and refresh.
	for (var i = 0; i < this.charts.length; i++) {
	    this.charts[i].primary.setInstrument(instrument);
	}

	this.setTotalCallbacks();

	//Now reload data and refresh charts.
	this.load();
    }
  }
}
//This isn't actually used anywhere yet.
RiseVision.FinancialChart.Controller.prototype.setDuration = function(duration) {
    //Don't reload data if it hasn't finished loading from the last time.
    if (!this.isReloading) {
	clearTimeout(this.refreshTimer);
	clearTimeout(this.inactivityTimer);
	clearTimeout(this.rotateTimer);

	this.isReloading = true;
	this.duration = duration;

	//Update durations for all charts and refresh.
	for (var i = 0; i < this.charts.length; i++) {
	    this.charts[i].primary.setDuration(duration);

	    if (this.charts[i].comparative != null) {
		for (var j = 0; j < this.charts[i].comparative.length; j++) {
		    this.charts[i].comparative[j].setDuration(duration);
		}
	    }
	}

	//Now reload data and refresh charts.
	this.load();
    }
}
//RiseVision.FinancialChart.Controller.prototype.getCharts = function() {
//    return this.charts;
//}
/*
 * Keep track of the total number of asynchronous callbacks that need to execute.
 */
RiseVision.FinancialChart.Controller.prototype.setTotalCallbacks = function() {
    this.totalCallbacks = 1 + this.compData.length;	//Real-time

    //Historical
    for (var i = 0; i < this.charts.length; i++) {
	if (this.charts[i].primary.getIsLoading()) {
	    this.totalCallbacks++;
	}

	if (this.charts[i].comparative != null) {
	    for (var j = 0; j < this.charts[i].comparative.length; j++) {
		if (this.charts[i].comparative[j].getIsLoading()) {
		    this.totalCallbacks++;
		}
	    }
	}
    }
}
RiseVision.FinancialChart.Controller.prototype.createDurationButton = function(duration) {
    var self = this,
	$button = $("<a href='#' class='duration durButton_font-style'>");

    //Create new button for duration.
    $button.text(duration.description);
    $button.data("type", duration.type);

    if (duration.type == prefs.getString("duration")) {
        $button.addClass("selected");
    }

    //Add event handlers to each of the duration buttons.
    $button.on("click", function(event) {
	event.preventDefault();

	if (!self.isLoading && !self.isReloading) {
	    clearTimeout(self.inactivityTimer);
	    clearTimeout(self.rotateTimer);
	    self.showChart($(this).data("type"));

	    //Resume rotation when timer expires.
	    if (prefs.getInt("durReturn") > 0) {
		self.inactivityTimer = setTimeout(function() {
		    //Issue 899 Start
		    self.currentIndex = (self.currentIndex + 1 >= self.durations.length) ? 0 : self.currentIndex + 1;
		    self.currentChart = self.charts[self.currentIndex];
		    self.showChart($(".duration").eq(self.currentIndex).data("type"));
		    //Issue 899 End
		    self.startRotateTimer();
		}, prefs.getInt("durReturn") * 1000);
	    }
	}
    });

    $("#durations").append($button);
}
//Add button for each comparative instrument.
RiseVision.FinancialChart.Controller.prototype.createInstrumentButtons = function(instruments) {
    var self = this;

    if (this.doCompare()) {
	for (var i = 0; i < instruments.length; i++) {
	    $button = $("<a href='#' class='button compButton_font-style'>");

	    $button.on("click", function(event) {
		var index = $(this).index(),
		    comp = self.currentChart.comparative[index];

		event.preventDefault();

		clearTimeout(self.compReturnTimer);
		$(".button").removeClass("selected");
		$(this).addClass("selected");

		self.compareIndex = index;
		self.setChartData(true);
		self.drawPriceChart();

		if (prefs.getInt("compReturn") > 0) {
		    self.compReturnTimer = setTimeout(function() {
			$(".button").removeClass("selected");
			self.compareIndex = -1;
			self.setChartData(true);
			self.drawPriceChart();
		    }, prefs.getInt("compReturn") * 1000);
		}
	    });

	    $("#buttons").append($button);
	}

	$("#buttons").show();
    }
}
RiseVision.FinancialChart.Controller.prototype.getAdditionalParams = function(name, value) {
    if (name == "additionalParams") {
	if (value) {
	    var styleNode = document.createElement("style");

	    value = JSON.parse(value);

	    //Inject CSS font styles into the DOM.
	    if (value["title_font-style"]) {
		styleNode.appendChild(document.createTextNode(value["title_font-style"]));
	    }

	    if (value["volume_font-style"]) {
		styleNode.appendChild(document.createTextNode(value["volume_font-style"]));
	    }

	    if (value["durButton_font-style"]) {
		styleNode.appendChild(document.createTextNode(".duration:active, .duration:visited, " + value["durButton_font-style"]));
	    }

	    if (value["compButton_font-style"]) {
		styleNode.appendChild(document.createTextNode(".button:active, .button:visited, " + value["compButton_font-style"]));
	    }

	    if (value["axis_font-style"]) {
		styleNode.appendChild(document.createTextNode(".flotr-grid-label, " + value["axis_font-style"]));
	    }

	    document.getElementsByTagName("head")[0].appendChild(styleNode);
	}
    }

    controller.load();
}
RiseVision.FinancialChart.Controller.prototype.load = function() {
    var self = this;

    this.isDataLoaded = false;

    if (this.isLoading) {
	for (var i = 0; i < this.charts.length; i++) {
	    this.charts[i].primary.reset();

	    if (this.charts[i].comparative != null) {
		for (var j = 0; j < this.charts[i].comparative.length; j++) {
		    this.charts[i].comparative[j].reset();
		}
	    }
	}
    }

    //Load real-time data for primary instrument.
    this.loadRealTimeData();
}
RiseVision.FinancialChart.Controller.prototype.loadRealTimeData = function() {
    var self = this;

    //Load real-time data for primary instrument.
    this.realTime.getData(["name", "lastPrice", "netChange", "accumulatedVolume", "tradeTime", "historicClose", "percentChange"], false, false, function(result) {
	self.onRealTimeDataLoaded(result);
    });
}
RiseVision.FinancialChart.Controller.prototype.onRealTimeDataLoaded = function(result) {
    var self = this;	//Issue 1027

    if (result != null) {
	if (result.getFormattedValue(0, 1) == "...") {
	    this.numRetries++;

	    if (this.numRetries == this.retryLimit) {
		$("#priceChart").spinner("remove");

		this.isSpinnerVisible = false;
		this.numRetries = 0;
		this.onDataLoaded(false);
		this.getRemainingData(false);

		console.log("Unable to load real-time data for: " + this.instrument + " " + this.duration);
	    }
	    else {
		$.event.trigger("retry", function() {
		    self.loadRealTimeData();
		});
	    }
	}
	else {
	    if (result.getFormattedValue(0, 1) == "N/P") {
		this.notPermissioned = true;
	    }

	    if (result != null) {
		this.titleData = result;
	    }

	    this.numRetries = 0;

	    //Pass real-time data to all charts.
	    for (var i = 0, len = this.charts.length; i < len; i++) {
		this.charts[i].primary.setRealTimeData(result);
	    }

	    this.updateTitles();

	    if (this.isLoading) {
		this.initUI();
		$("#disclaimer, #buttons, #title, #priceChart, #durations, #volumeTitle, #volumeChart").removeClass("hidden");
	    }

	    this.onDataLoaded(true);
	    this.getRemainingData(true);
	}
    }
    //Data is being requested outside of collection time.
    else {
	this.getRemainingData(false);	//Issue 915 - Return false instead of true.
    }
}
RiseVision.FinancialChart.Controller.prototype.getRemainingData = function(success) {
    var self = this;

    if (success) {	//Issue 915
	//Show UI. Chart will not have populated yet.
	if (this.isLoading || this.isReloading) {
	    //Display a spinner while the data loads.
	    if (!this.isSpinnerVisible) {
		$("#priceChart").spinner({
		    img: "https://preview.risevision.com/images/ajax-loader-circle-notext.gif",
		    width: 100,
		    height: 100,
		    position: "center"
		});

		this.isSpinnerVisible = true;
	    }

	    //Show the UI that is ready while the rest of the data loads.
	    if (this.isLoading) {
		readyEvent();
	    }
	}

	//No comparative instruments.
	if (this.compData.length == 0) {
	    if (this.charts.length > 0) {
		this.updatePrimaryChart(0, this.onPrimaryDataLoaded);
	    }
	}
	//Load real-time data for comparative instruments.
	else {
	    this.compDataLoaded = 0;

	    for (var i = 0; i < this.compData.length; i++) {
		this.loadComparativeData(i);
	    }
	}
    }
    //Issue 915
    else {
	this.isDataLoaded = true;
	this.isRefreshing = false;
	this.startRefreshTimer();
    }
}
/*
 * Load real-time data for comparative instruments.
 */
RiseVision.FinancialChart.Controller.prototype.loadComparativeData = function(index) {
    var self = this;

    this.compData[index].getData(["percentChange", "tradeTime", "name"], false, false, function(result) {
	self.onComparativeDataLoaded(result, index);
    });
}
RiseVision.FinancialChart.Controller.prototype.onComparativeDataLoaded = function(result, index) {
    var self = this,
	notPermissioned = false;

    if (result != null) {
	if (result.getFormattedValue(0, 2) == null) {	//No Trade Time
	    this.numRetries++;

	    if (this.numRetries == this.retryLimit) {
		$("#priceChart").spinner("remove");

		this.isSpinnerVisible = false;
		this.numRetries = 0;
		this.onDataLoaded(false);
		this.onCompRealTimeDataLoaded(false);

		console.log("Unable to load comparative real-time data.");
	    }
	    else {
		$.event.trigger("retry", function() {
		    self.loadComparativeData(index);
		});
	    }
	}
	else {
	    this.numRetries = 0;

	    //Pass real-time data to all comparative charts.
	    for (var i = 0; i < this.charts.length; i++) {
		//Issue 1007 Start - If any of the comparative instruments are not permissioned, show a message.
		//Won't get historical data for primary or comparative instruments.
		if (result.getFormattedValue(0, 0) == "N/P") {
		    if (this.isLoading) {
			$("#error").text("One or more of the comparative instruments requires a Premium license. Contact sales@risedisplay.com for licensing options.").show();
			notPermissioned = true;
			break;
		    }
		}
		else {
		    this.charts[i].comparative[index].setRealTimeData(result);
		}
		//Issue 1007 End
	    }

	    //Issue 1007 Start
	    if (!notPermissioned) {
		this.onDataLoaded(true);
		this.onCompRealTimeDataLoaded(true);
	    }
	    else {
		if (this.isSpinnerVisible) {
		    $("#priceChart").spinner("remove");
		    this.isSpinnerVisible = false;
		}

		$("#buttons, #priceChart, #durations").hide();
	    }
	    //Issue 1007 End
	}
    }
    //Data is being requested outside of collection time.
    else {
	this.onDataLoaded(true);
	this.onCompRealTimeDataLoaded(true);
    }
}
RiseVision.FinancialChart.Controller.prototype.onCompRealTimeDataLoaded = function(success) {
    this.compDataLoaded++;

    if (this.compDataLoaded == this.compData.length) {
	if (this.charts.length > 0) {
	    this.updatePrimaryChart(0, this.onPrimaryDataLoaded);
	}
    }
}
RiseVision.FinancialChart.Controller.prototype.onPrimaryDataLoaded = function() {
    //Since collection times have been loaded for the first chart, asynchronously load data for remaining charts.
    for (var i = 1; i < this.charts.length; i++) {
	this.updatePrimaryChart(i, null);
    }
}
RiseVision.FinancialChart.Controller.prototype.updatePrimaryChart = function(i, callback) {
    var self = this;

    if (this.charts[i].primary.getIsLoading()) {
	this.charts[i].primary.reset();

	//Load historical data for primary instrument.
	this.charts[i].primary.loadHistoricalData(function(success) {
	    self.onDataLoaded();

	    //Plot data for comparative charts.
	    if (self.charts[i].comparative != null) {
		if (i == 0) {
		    var count = 0;

		    for (var j = 0; j < self.charts[i].comparative.length; j++) {
			self.updateComparativeCharts(i, j, function() {
			    count++;

			    if (count == self.charts[i].comparative.length) {
				if (callback != null) {
				    callback.call(self);
				}
			    }
			});
		    }
		}
		else {
		    for (var j = 0; j < self.charts[i].comparative.length; j++) {
			self.updateComparativeCharts(i, j, null);
		    }
		}
	    }
	    else {
		if (callback != null) {
		    callback.call(self);
		}
	    }
	});
    }
    else {
	//Plot real-time data for primary instrument.
	this.charts[i].primary.plotRealTimeData();

	//Plot data for comparative charts.
	if (self.charts[i].comparative != null) {
	    if (i == 0) {
		var count = 0;

		for (var j = 0; j < self.charts[i].comparative.length; j++) {
		    self.updateComparativeCharts(i, j, function() {
			count++;

			if (count == self.charts[i].comparative.length) {
			    if (callback != null) {
				callback.call(self);
			    }
			}
		    });
		}
	    }
	    else {
		for (var j = 0; j < self.charts[i].comparative.length; j++) {
		    self.updateComparativeCharts(i, j, null);
		}
	    }
	}
	else {
	    if (callback != null) {
		callback.call(self);
	    }
	}
    }
}
RiseVision.FinancialChart.Controller.prototype.updateComparativeCharts = function(i, j, callback) {
    var self = this;

    if (this.charts[i].comparative[j].getIsLoading()) {
	this.charts[i].comparative[j].reset();

	//Load historical and real-time data for comparative instrument.
	this.charts[i].comparative[j].loadHistoricalData(this.charts[i].primary.getTicks(), function(success) {
	    if (self.isLoading) {
		//Show instrument name on comparative instrument button.
		$(".button").eq(j).text(self.charts[i].comparative[j].name);
		$(".button").eq(j).css("display", "inline-block");
	    }

	    self.onDataLoaded();

	    if (callback != null) {
		callback.call(self);
	    }
	});
    }
    else {
	//Plot real-time data for primary instrument.
	this.charts[i].comparative[j].plotRealTimeData();

	if (callback != null) {
	    callback.call(self);
	}
    }
}
/*
 * If all of the callbacks functions have executed, update the chart.
 */
RiseVision.FinancialChart.Controller.prototype.onDataLoaded = function() {
    this.numCallbacks++;

    if (this.numCallbacks == this.totalCallbacks) {
	if (this.isSpinnerVisible) {
	    $("#priceChart").spinner("remove");
	    this.isSpinnerVisible = false;
	}

	this.isDataLoaded = true;

	//Issue 922 Start - Only need to set collection times update flag once per instrument.
	this.charts[0].primary.setIsUpdated(false);

	if (this.charts[0].comparative != null) {
	    for (var i = 0; i < this.charts[0].comparative.length; i++) {
		this.charts[0].comparative[i].setIsUpdated(false);
	    }
	}
	//Issue 922 End

	if (this.isLoading) {
	    this.isLoading = false;
	    this.setChartData(false);

	    //If Chart Gadget is visible in Placeholder, render the Gadget.
	    if (this.isPlaying) {
		this.drawChart();
	    }
	}
	else if (this.isReloading) {
	    if (this.isPlaying) {
		if (this.isDrawn) {
		    this.currentChart = this.charts[this.currentIndex];

		    //Issue 986 Start
		    if (this.showDuration) {
			this.showChart($(".duration").eq(this.currentIndex).data("type"));
		    }
		    else {
			this.showChart(this.duration);
		    }
		    //Issue 986 End

		    this.updateTitles();
		    this.startRefreshTimer();
		    this.startRotateTimer();
		}
		//setInstrument called before Gadget was ever told to play?
		//Called if Day chart has no data but all other chart durations do.
		else {
		    this.setChartData(false);
		    this.drawChart();
		}
	    }
	}
	else {
	    this.setChartData(true);
	    this.refresh();

	    if (this.isPlaying && this.isDrawn) {
		this.startRotateTimer();
	    }
	}

	this.numCallbacks = 0;
	this.isReloading = false;
    }
}
RiseVision.FinancialChart.Controller.prototype.refresh = function() {
    this.drawPriceChart();

    if (prefs.getBool("showVolume")) {
	this.drawVolumeChart();
    }

    this.isRefreshing = false;
    this.startRefreshTimer();
}
/*
 * Populate an object with data from the selected chart.
 * This object contains the data to be plotted.
 */
RiseVision.FinancialChart.Controller.prototype.setChartData = function(isRefreshing) {
    var y, fillColor, fillOpacity, result,
	fill = prefs.getBool("showComparison") ? false : true;

    if (fill) {
	if ((prefs.getString("chartFillColor") == "transparent") || (prefs.getString("chartFillColor") == "")) {
	    fill = false;
	    fillColor = "";
	}
	else {
	    //Check if it's an rgba color.
	    fillColor = prefs.getBool("showComparison") ? "" : prefs.getString("chartFillColor");

	    if ((result = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(fillColor))) {
		fillOpacity = parseFloat(result[4]);
	    }
	}
    }

    if (isRefreshing) {
	//Determine whether or not two instruments are currently being compared.
	if (this.compareIndex >= 0) {
	    y = this.currentChart.primary.getPercentChange();
	}
	else {
	    y = this.currentChart.primary.getY();
	}

	this.chartData.price = [];

	//Primary instrument data is always at index 0.
	this.chartData.price.push({
	    data: [this.currentChart.primary.getX(), y],
	    color: prefs.getString("chartPlotLineColor"),
	    "lite-lines": {
		lineWidth: 3,
		fill: fill,
		fillColor: fillColor,
		fillOpacity: fillOpacity
	    }
	});

	if (this.compareIndex >= 0) {
	    this.chartData.price.push({
		data: [this.currentChart.comparative[this.compareIndex].getX(), this.currentChart.comparative[this.compareIndex].getY()],
		color: prefs.getString("compLineColor")
	    });
	}
	else {
	    //Add new series for Previous Close line.
	    if (this.currentChart.primary.getHistoricCloseX().length > 0 && this.currentChart.primary.getHistoricCloseY().length > 0) {
		this.chartData.price.push({
		    data: [this.currentChart.primary.getHistoricCloseX(), this.currentChart.primary.getHistoricCloseY()],
		    color: prefs.getString("previousCloseColor"),
		    "lite-lines": {
			lineStyle: "dashed"
		    }
		});
	    }
	}
    }
    else {
	this.chartData.price = [{
	    data: [this.currentChart.primary.getX(), this.currentChart.primary.getY()],
	    color: prefs.getString("chartPlotLineColor"),
	    "lite-lines": {
		lineWidth: 3,
		fill: fill,
		fillColor: fillColor,
		fillOpacity: fillOpacity
	    }
	}];

	//Add new series for Previous Close line.
	if (this.currentChart.primary.getHistoricCloseX().length > 0 && this.currentChart.primary.getHistoricCloseY().length > 0) {
	    this.chartData.price.push({
		data: [this.currentChart.primary.getHistoricCloseX(), this.currentChart.primary.getHistoricCloseY()],
		color: prefs.getString("previousCloseColor"),
		"lite-lines": {
		    lineStyle: "dashed"
		}
	    });
	}
    }

    this.chartData.summaryTicks = this.currentChart.primary.getTicks();
    this.chartData.volume = [this.currentChart.primary.getVolumeX(), this.currentChart.primary.getVolumeY()];
}
RiseVision.FinancialChart.Controller.prototype.updateTitles = function() {
    var lastPrice = parseFloat(this.titleData.getValue(0, 2)),
	netChange = parseFloat(this.titleData.getValue(0, 3)),
	volume = parseFloat(this.titleData.getValue(0, 4)),
	titleDecimals = prefs.getInt("titleDecimals"),
	titleSign = prefs.getString("titleSign"),
	last = "Last ";

    $("#instrument").text(this.titleData.getFormattedValue(0, 1));
    $("#last").text(last + RiseVision.Common.Utility.addCommas(lastPrice.toFixed(titleDecimals)));

    if (titleSign == "none") {
	$("#last").text(last + RiseVision.Common.Utility.addCommas(Math.abs(lastPrice).toFixed(titleDecimals)));
	$("#changeValue").text(RiseVision.Common.Utility.addCommas(Math.abs(netChange).toFixed(titleDecimals)));
    }
    else if (titleSign == "minus") {
	$("#changeValue").text(RiseVision.Common.Utility.addCommas(netChange.toFixed(titleDecimals)));
    }
    else if (titleSign == "plusMinus") {
	if (lastPrice > 0) {
	    $("#last").text(last + "+" + RiseVision.Common.Utility.addCommas(lastPrice.toFixed(titleDecimals)));
	}

	if (netChange > 0) {
	    $("#changeValue").text("+" + RiseVision.Common.Utility.addCommas(ge.toFixed(titleDecimals)));
	}
	else {
	    $("#changeValue").text(RiseVision.Common.Utility.addCommas(netChange.toFixed(titleDecimals)));
	}
    }
    else if (titleSign == "parentheses") {
	if (lastPrice < 0) {
	    $("#last").text(last + "(" + RiseVision.Common.Utility.addCommas(Math.abs(lastPrice).toFixed(titleDecimals)) + ")");
	}

	if (netChange < 0) {
	    $("#changeValue").text("(" + RiseVision.Common.Utility.addCommas(Math.abs(netChange).toFixed(titleDecimals)) + ")");
	}
	else {
	    $("#changeValue").text(RiseVision.Common.Utility.addCommas(netChange.toFixed(titleDecimals)));
	}
    }
    else if (titleSign == "arrow") {
	$("#changeValue").text(RiseVision.Common.Utility.addCommas(Math.abs(netChange).toFixed(titleDecimals)));

	if (netChange < 0) {
	    $("#arrow").css("background-image", "url('" + this.arrowURL + "animated-red-arrow.gif')");
	}
	else {
	    $("#arrow").css("background-image", "url('" + this.arrowURL + "animated-green-arrow.gif')");
	}
    }

    if (prefs.getBool("showVolumeTitle")) {
	$("#volumeTitle").text("Accumulated Volume " + RiseVision.Common.Utility.addCommas(volume));
    }
}
/*
 * Configure the disclaimer and draw the chart(s).
 */
RiseVision.FinancialChart.Controller.prototype.initUI = function() {
    var button, priceCSS, volumeCSS, styleNode,
	disclaimerLoc = prefs.getString("disclaimerLoc");

    //Manually set dimensions of container since hidden Gadgets on multi-page Presentations will be 0x0.
    $("#container").width(prefs.getString("rsW"));
    $("#container").height(prefs.getString("rsH"));

    //Configure disclaimer.
    if ((disclaimerLoc == "bottomRight") || (disclaimerLoc == "topRight")) {
	$("#disclaimer").addClass("right");
    }

    $("#disclaimer").css("font-family", prefs.getString("disclaimerFont"));

    //Now that we know the height of the disclaimer, move it to the bottom if applicable.
    if ((disclaimerLoc == "bottomRight") || (disclaimerLoc == "bottomLeft")) {
	$("#disclaimer").appendTo("#container");
    }

    $("#disclaimer").show();

    if (!prefs.getBool("showTitles")) {
	$("#title").hide();
    }

    //The height of the price chart needs to be set via CSS. This needs to be done before the chart is drawn.
    if (prefs.getBool("showVolume")) {
	if (this.doCompare()) {
	    priceCSS = "#priceChart { height: " +
		($("#container").height() - $("#disclaimer").outerHeight(true) - $("#buttons").outerHeight(true) - $("#instrument").outerHeight(true) -
		$("#durations").outerHeight(true) - $("#volumeTitle").outerHeight(true) - (prefs.getInt("volumeHeight") / 100 * $("#container").height())) + "px; }";
	}
	else {
	    priceCSS = "#priceChart { height: " +
		($("#container").height() - $("#disclaimer").outerHeight(true) - $("#instrument").outerHeight(true) -
		$("#durations").outerHeight(true) - $("#volumeTitle").outerHeight(true) -
		(prefs.getInt("volumeHeight") / 100 * $("#container").height())) + "px; }";
	}
    }
    else {
	if (this.doCompare()) {
	    priceCSS = "#priceChart { height: " + ($("#container").height() - $("#disclaimer").outerHeight(true) - $("#buttons").outerHeight(true)
		- $("#instrument").outerHeight(true) - $("#durations").outerHeight(true) - $("#priceChart").outerHeight(true)) + "px; }";
	}
	else {
	    priceCSS = "#priceChart { height: " + ($("#container").height() - $("#disclaimer").outerHeight(true)
		- $("#instrument").outerHeight(true) - $("#durations").outerHeight(true) - $("#priceChart").outerHeight(true)) + "px; }";
	}
    }

    //Inject the CSS into the document.
    styleNode = document.createElement("style");
    styleNode.appendChild(document.createTextNode(priceCSS));
    document.getElementsByTagName("head")[0].appendChild(styleNode);

    //Size Volume chart.
    if (prefs.getBool("showVolume")) {
	styleNode = document.createElement("style");
	//2 refers to the top and bottom border around the volume chart.
	volumeCSS = ".envision-finance-volume .envision-component { height: " +
	    (prefs.getInt("volumeHeight") / 100 * $("#container").height() - parseInt($("#priceChart").css("margin-bottom")) - 2) + "px" + " !important; }";
	styleNode.appendChild(document.createTextNode(volumeCSS));
	document.getElementsByTagName("head")[0].appendChild(styleNode);
    }
    else {
	$(".volume").hide();
    }

    //Native dimensions of arrows are 300x300, so make width and height the same.
    $("#arrow").width($("#instrument").height());
    $("#arrow").height($("#instrument").height());
}
RiseVision.FinancialChart.Controller.prototype.drawChart = function() {
    var disclaimerLoc = prefs.getString("disclaimerLoc");

    this.drawPriceChart();

    if (prefs.getBool("showVolume")) {
	this.drawVolumeChart();
    }

    this.startRefreshTimer();
    this.startRotateTimer();
}
//Configure the price chart settings and display it.
RiseVision.FinancialChart.Controller.prototype.drawPriceChart = function() {
    var self = this,
	summaryTicks = this.chartData.summaryTicks,
	options = {
	    container: $("#priceChart"),
	    data: {
		price: this.chartData.price,
		volume: this.chartData.volume
	    },
	    defaults: {
		price: {
		    config: {
			xaxis: {
			    showLabels: prefs.getBool("showAxis"),
			    ticks: prefs.getBool("showAxis") ? this.getTicks() : null
			},
			yaxis: {
			    showLabels: prefs.getBool("showAxis"),
			    min: this.calculateMin(),
			    max: this.calculateMax(),
			    tickDecimals: prefs.getInt("axisDecimals")
			},
			grid: {
			    horizontalLines: true,
			    verticalLines: true,
			    backgroundColor: null,
			    tickColor: prefs.getString("gridLineColor")
			}
		    }
		}
	    },
	    yTickFormatter: function(n) {
		n = RiseVision.Common.Utility.addCommas(n);

		//Show % if doing a compare.
		if (self.compareIndex >= 0) {
		    return n + "%";
		}
		else {
		    return n;
		}
	    }/*,
	    trackFormatter: function (o) {
		var data = o.series.data,
		    index = data[o.index][0],
		    duration = prefs.getString("duration"),
		    format = "";

		if (duration == "Day") {
		    format = "HH:mm";
		}
		else if (duration == "Week") {
		    format ="ddd MMM d HH:mm";
		}
		else if ((duration == "1M") || (duration == "3M")) {
		    format ="ddd MMM d";
		}
		else if ((duration == "6M") || (duration == "1Y")) {
		    format ="MMM d";
		}
		else if (duration == "5Y") {
		    format ="MMM d, yyyy";
		}

		if (self.doCompare()) {
		    return new Date(summaryTicks[index].date).toString(format) + ': ' + summaryTicks[index].close.toFixed(prefs.getInt("axisDecimals")) + "%, Vol: " + RiseVision.Common.Utility.addCommas(summaryTicks[index].volume);
		}
		else {
		    return new Date(summaryTicks[index].date).toString(format) + ': $' + summaryTicks[index].close.toFixed(prefs.getInt("axisDecimals")) + ", Vol: " + RiseVision.Common.Utility.addCommas(summaryTicks[index].volume);
		}
	    }*/
	};

    if (!this.isDrawn) {
	this.finance = new envision.templates.PriceChart(options);

	//Apply CSS styles after chart has been drawn.
	$(".envision-finance-price").css("border-color", prefs.getString("axisLineColor"));

	this.isDrawn = true;
    }
    else {
	//Issue 794 - Destroy and recreate price chart every time.
	$(".envision-finance-price").unbind();
	$(".envision-finance-price").remove();
	this.finance.vis.destroy();
	this.finance.vis = null;
	this.finance.price = null;
	this.finance = null;
	this.finance = new envision.templates.PriceChart(options);
    }

    //Set axis line colors.
    $(".envision-finance-price").css("border-color", prefs.getString("axisLineColor"));

    //Need to shift label over or it will be cut off.
    if (this.isLabelFirst) {
	$(".envision-finance-price .flotr-grid-label-x:first-child").addClass("importantRule");
	this.isLabelFirst = false;
    }
}
//Configure the volume chart settings and display it.
RiseVision.FinancialChart.Controller.prototype.drawVolumeChart = function() {
    var self = this,
	hasData = true,
	summaryTicks = this.chartData.summaryTicks,
	options = {
	    container: $("#volumeChart"),
	    data : {
		price: this.chartData.price,
		volume: this.chartData.volume
	    },
	    defaults: {
		volume: {
		    config: {
			whiskers: {
			    color: prefs.getString("volumeColor"),
			    lineWidth: prefs.getInt("barWidth")
			},
			grid: {
			    tickColor: prefs.getString("gridLineColor")
			}
		    }
		}
	    },
	    yTickFormatter: function(value) {
		value = parseInt(value);

		if (!isNaN(value)) {
		    if (value == 0) {
			return "";
		    }
		    //Express axis label in terms of nearest million.
		    else {
			return (value / 1000000) + "M";
		    }
		}
		else {
		    return "";
		}
	    }
	};

    //Issue 1027 Start - Don't draw chart if data failed to load.
    for (var i = 0; i < this.chartData.volume.length; i++) {
	if (this.chartData.volume[i].length == 0) {
	    hasData = false;
	    break;
	}
    }

    //Issue 794 - Destroy and recreate volume chart every time.
    if (this.volume) {
	this.volume.vis.destroy();
	this.volume = null;
    }

    if (hasData) {
	this.volume = new envision.templates.VolumeChart(options);
    }
    //Issue 1027 End

    //Set axis line colors.
    $(".envision-finance-volume").css("border-color", prefs.getString("axisLineColor"));
}
RiseVision.FinancialChart.Controller.prototype.getTicks = function() {
    if (this.duration == "Day") {
	return this.getDailyTicks();
    }
    else if (this.duration == "Week") {
	return this.getWeeklyTicks();
    }
    else if ((this.duration == "1M") || (this.duration == "3M")) {
	return this.getMonthlyTicks();
    }
     else if ((this.duration == "6M")) {
	return this.get6MonthTicks();
    }
    else if ((this.duration == "1Y") || (this.duration == "5Y")) {
	return this.getYearlyTicks();
    }
}
//Create x-axis labels (ticks) on the hour, every two hours, in 24 hour format.
RiseVision.FinancialChart.Controller.prototype.getDailyTicks = function() {
    var numRows = this.chartData.summaryTicks.length,
	currentTime = new Date(this.charts[0].primary.collectionStartTime),	//Today's date
	endTime = new Date(this.charts[0].primary.collectionEndTime),		//Today's date
	tradeTime, nextTime, newCurrentTime, minutes, ticks = [], i = 0;

    if ((this.charts[0].primary.collectionStartTime != null) && (this.charts[0].primary.collectionEndTime != null)) {
	while (currentTime.isBefore(endTime)) {
	    minutes = currentTime.getMinutes();

	    //Check if this time is on the hour.
	    if (minutes == 0) {
		if (i == 0) {
		    this.isLabelFirst = true;
		}

		ticks.push([i, currentTime.toString("HH:mm")]);
		nextTime = new Date(currentTime.getTime());
		nextTime = nextTime.addHours(2);
		currentTime.addMinutes(5);

		//Search through the remaining start times until a match is found for the next two hour time interval.
		while (currentTime.isBefore(endTime)) {
		    if (Date.equals(currentTime, nextTime)) {
			//Now need to determine the position at which the closest time resides in the chart data.
			for (; i < numRows; i++) {
			    tradeTime = new Date(this.chartData.summaryTicks[i].date);	//Need to remember date as it could be yesterday.

			    //Issue 921 Start - Markets not open yet or GOOG.O (Eastern, Central) or EUR= (Eastern).
			    if (Date.equals(new Date(this.charts[0].primary.collectionStartTime).clearTime(), Date.today())) {
				newCurrentTime = new Date(tradeTime);
			    }
			    //Collection Start Time is not today (e.g. EUR= Central time).
			    else {
				newCurrentTime = new Date(currentTime);
			    }
			    //Issue 921 End

			    newCurrentTime.setHours(new Date(currentTime).getHours());
			    newCurrentTime.setMinutes(new Date(currentTime).getMinutes());
			    newCurrentTime.setSeconds(0);

			    if (tradeTime.equals(newCurrentTime)) {
				ticks.push([i, nextTime.toString("HH:mm")]);
				break;
			    }
			    else if (tradeTime.isAfter(newCurrentTime)) {
				//Back up one data point so the tick is associated with the data point before tradeTime.
				ticks.push([i - 1, nextTime.toString("HH:mm")]);
				break;
			    }
			}

			nextTime = nextTime.addHours(2);
		    }

		    currentTime.addMinutes(5);
		}

		break;
	    }

	    currentTime.addMinutes(5);
	    i++;
	}
    }

    return ticks;
}
/*
 * X axis labels are days of the week in the format "Fri Feb 8".
 */
RiseVision.FinancialChart.Controller.prototype.getWeeklyTicks = function() {
    var numRows = this.chartData.summaryTicks.length,
	tradeTime = null, previousTradeTime = null,
	ticks = [];

    for (var i = 0; i < numRows; i++) {
	tradeTime = new Date(this.chartData.summaryTicks[i].date).clearTime();

	if (previousTradeTime && tradeTime) {
	   if (!Date.equals(tradeTime, previousTradeTime)) {
		//Issue 877 - Ensure trade time is a weekday.
		if ((tradeTime.getDay() >= 1) && (tradeTime.getDay() <= 5)) {
		    ticks.push([i, tradeTime.toString("ddd MMM d")]);
		}
	    }
	}
	else {
	    //Issue 877 - Ensure trade time is a weekday.
	    if ((tradeTime.getDay() >= 1) && (tradeTime.getDay() <= 5)) {
		ticks.push([i, tradeTime.toString("ddd MMM d")]);
	    }
	}

	previousTradeTime = tradeTime;
    }

    this.isLabelFirst = true;

    //Issue 877 - Remove first label if there are already more than five labels as otherwise the first label may overlap the second.
    if (ticks.length > 5) {
	ticks.splice(0, ticks.length - 5);
    }

    return ticks;
}
/*
 * X axis labels are the last Friday of the week in the format Fri Feb 8.
 */
RiseVision.FinancialChart.Controller.prototype.getMonthlyTicks = function() {
    var numRows = this.chartData.summaryTicks.length,
	ticks = [],
	tradeTime;

    for (var i = 0; i < numRows; i++) {
	tradeTime = new Date(this.chartData.summaryTicks[i].originalDate);

	if (tradeTime.getDay() == 5) {
	    if (i <= 1) {
		this.isLabelFirst = true;
	    }

	    ticks.push([i, tradeTime.toString("MMM d")]);
	}
    }

    return ticks;
}
/*
 * X axis labels are for each month in the format Feb 8.
 */
RiseVision.FinancialChart.Controller.prototype.get6MonthTicks = function() {
    var numRows = this.chartData.summaryTicks.length,
	ticks = [],
	currentMonth, previousMonth, tradeTime;

    for (var i = 0; i < numRows; i++) {
	tradeTime = new Date(this.chartData.summaryTicks[i].date);

	if (i == 0) {
	    ticks.push([i, tradeTime.toString("MMM")]);
	    previousMonth = tradeTime.getMonth();
	}
	else {
	    currentMonth = tradeTime.getMonth();

	    if (currentMonth != previousMonth) {
		ticks.push([i, tradeTime.toString("MMM")]);
	    }

	    previousMonth = currentMonth;
	}
    }

    this.isLabelFirst = true;

    return ticks;
}
/*
 * X axis labels are for each quarter with January showing the year instead of the month.
 */
RiseVision.FinancialChart.Controller.prototype.getYearlyTicks = function() {
    var numRows = this.chartData.summaryTicks.length,
	ticks = [],
	currentMonth, previousMonth, tradeTime;

    for (var i = 0; i < numRows; i++) {
	tradeTime = new Date(this.chartData.summaryTicks[i].date);
	currentMonth = tradeTime.getMonth();

	if (currentMonth == 0) {
	    if (currentMonth != previousMonth) {
		if (i == 0) {
		    this.isLabelFirst = true;
		}

		ticks.push([i, tradeTime.toString("yyyy")]);
	    }
	}
	else if (currentMonth % 3 == 0) {
	    if (currentMonth != previousMonth) {
		if (i == 0) {
		    this.isLabelFirst = true;
		}

		ticks.push([i, tradeTime.toString("MMM")]);
	    }
	}

	previousMonth = currentMonth;
    }

    return ticks;
}
RiseVision.FinancialChart.Controller.prototype.calculateMin = function() {
    var values = this.getInstrumentValues();

    if (this.doCompare()) {
	return (Math.floor(Math.min.apply(null, values) * this.factor)) / this.factor;
    }
    else {
	//Add Previous Close value as well when plotting a single instrument.
	if (this.currentChart.primary.getHistoricCloseY().length > 0) {
	    values.push(parseFloat(this.currentChart.primary.getHistoricCloseY()[0]));
	}

	return (Math.floor(Math.min.apply(null, values) * this.factor)) / this.factor;
    }
}
RiseVision.FinancialChart.Controller.prototype.calculateMax = function() {
    var values = this.getInstrumentValues();

    if (this.doCompare()) {
	return (Math.ceil(Math.max.apply(null, values) * this.factor)) / this.factor;
    }
    else {
	//Add Previous Close value as well when plotting a single instrument.
	if (this.currentChart.primary.getHistoricCloseY().length > 0) {
	    values.push(parseFloat(this.currentChart.primary.getHistoricCloseY()[0]));
	}

	return (Math.ceil(Math.max.apply(null, values) * this.factor)) / this.factor;
    }
}
RiseVision.FinancialChart.Controller.prototype.getInstrumentValues = function() {
    var i, j, numRows,
	values = [];

    for (i = 0; i < this.chartData.price.length; i++) {
	numRows = this.chartData.price[i].data[1].length;

	for (j = 0; j < numRows; j++) {
	    //Don't include fake minimum values that may have been used for day chart.
	    if (this.chartData.price[i].data[1][j] != -1000) {
		values.push(parseFloat(this.chartData.price[i].data[1][j]));
	    }
	}
    }

    return values;
}
RiseVision.FinancialChart.Controller.prototype.showChart = function(type) {
    var index = 0;

    //Reset buttons to originally selected chart.
    $(".duration").each(function(i) {
	if ($(this).data("type") == type) {
	    index = i;

	    return false;
	}
    });

    //Prevent chart from being displayed if it hasn't loaded properly.
    if (!this.charts[index].primary.isLoading || this.charts[index].primary.duration == "Day") {
	$(".duration").removeClass("selected");
	$(".duration").eq(index).addClass("selected");

	this.currentIndex = index;
	this.currentChart = this.charts[this.currentIndex];
	this.duration = type;
	this.setChartData(true);
	this.drawPriceChart();

	if (prefs.getBool("showVolume")) {
	    this.drawVolumeChart();
	}
    }
}
/*
 * Start a retry timer if data is not yet available from the server.
 */
RiseVision.FinancialChart.Controller.prototype.startRetryTimer = function(callback) {
    var self = this;

    if (!this.isRetrying) {
	this.callbacks = [callback];
	this.isRetrying = true;
	this.countdown = this.errorInterval / 1000;

	//Display a countdown message.
	this.retryTimer = setInterval(function() {
	    self.countdown--;

	    //Re-request data once the countdown reaches 0.
	    if (self.countdown == 0) {
		self.isRetrying = false;
		clearInterval(self.retryTimer);

		//Fire callbacks for all data that has failed to load.
		for (var i = 0; i < self.callbacks.length; i++) {
		    self.callbacks[i]();
		}

		self.callbacks = [];
	    }
	}, 1000);
    }
    else {
	this.callbacks.push(callback);
    }
}
/* Rotate through different chart durations. */
RiseVision.FinancialChart.Controller.prototype.startRotateTimer = function() {
    var self = this,
	chartLoaded = false;

    for (var i = this.currentIndex; i < this.charts.length; i++) {
	if (!this.charts[i].primary.isLoading) {
	    chartLoaded = true;
	    break;	//Why is only one chart being checked?
	}
    }

    if (chartLoaded) {
	if (this.showDuration && (prefs.getInt("durRotate") > 0)) {
	    clearTimeout(this.rotateTimer);

	    this.rotateTimer = setTimeout(function() {
		self.onRotateTimerExpired.call(self);
	    }, prefs.getInt("durRotate") * 1000);
	}
    }
    else {
	if (this.showDuration && (prefs.getInt("durRotate") > 0)) {
	    //Runaway Market Wall here because chart is constantly loading?
	    clearTimeout(this.rotateTimer);

	    this.rotateTimer = setTimeout(function() {
		//Issue 1027 Start
		if (!self.isReloading) {
		    doneEvent();
		}
		//Issue 1027 End
	    }, prefs.getInt("durRotate") * 1000);
	}
    }
}
RiseVision.FinancialChart.Controller.prototype.onRotateTimerExpired = function() {
    var self = this;

    if (!this.isReloading && this.resumeRotation) {	//Issue 905 & 1027
	this.currentIndex = (this.currentIndex + 1 >= this.durations.length) ? 0 : this.currentIndex + 1;
	this.currentChart = this.charts[this.currentIndex];

	//Issue 777 - Add support for PUD.
	if (this.currentIndex == 0) {
	    doneEvent();
	}
	else {
	    this.showChart($(".duration").eq(this.currentIndex).data("type"));
	    this.startRotateTimer();
	}
    }
}
RiseVision.FinancialChart.Controller.prototype.startRefreshTimer = function() {
    var self = this;

    if (!this.notPermissioned) {
	clearTimeout(this.refreshTimer);

	//Start a timer in case there is a problem loading the data.
	this.refreshTimer = setTimeout(function() {
	    self.isRefreshing = true;
	    self.setTotalCallbacks();
	    self.load();
	}, this.refreshInterval);
    }
}
/* Determine whether or not instruments can be compared. */
RiseVision.FinancialChart.Controller.prototype.doCompare = function() {
    if (prefs.getBool("showComparison")) {
	return prefs.getString("compInstruments").split(",").length > 0;
    }
    else {
	return false;
    }
}
RiseVision.FinancialChart.Controller.prototype.play = function() {
    this.resumeRotation = true;	//Issue 905

    //Placeholder containing chart needs to be visible before being drawn.
    if (!this.isDrawn && !this.isRetrying && this.isDataLoaded && $("#container:visible").length > 0) {
	this.drawChart();
    }
    else if (this.isDrawn && !this.isRetrying && !this.isReloading) {
	this.startRotateTimer();
    }

    this.isPlaying = true;
}
RiseVision.FinancialChart.Controller.prototype.pause = function() {
    var seconds,
	self = this;

    clearTimeout(this.rotateTimer);
    clearTimeout(this.inactivityTimer);

    if (this.isDrawn && this.showDuration && (this.currentIndex == 0)) {
	//Issue 910 Start - Fix for Indices tab Gadget flash in Market Wall.
	clearTimeout(self.pauseTimer);

	self.pauseTimer = setTimeout(function() {
	    self.showChart($(".duration").eq(self.currentIndex).data("type"));
	}, 500);
	//Issue 910 End
    }

    this.isPlaying = false;
}

RiseVision.FinancialChart.Instrument = {};

/*
 * The Instrument class handles data for comparative instruments.
 */
RiseVision.FinancialChart.Instrument = function(options) {
    var prefs = new gadgets.Prefs();

    if (options) {
	this.instrument = options.instrument; //remove this
	this.id = options.id;
	this.displayID = options.displayID;
	this.duration = options.duration;
	this.name = options.name;
	this.callback = options.callback;
	this.retryLimit = 3;
	this.historical = new RiseVision.Common.Financial.Historical(options.displayID, options.instrument, options.duration);
	this.reset();

	//Rates at which the historic data server updates are what gets used for the x-axis intervals.
	if (options.duration == "Day") {
	    this.interval = 300000;	//5 minutes
	}
	else if (options.duration == "Week") {
	    this.interval = 1800000;	//30 minutes
	}
    }
}
RiseVision.FinancialChart.Instrument.prototype.reset = function() {
    this.x = [];
    this.y = [];
    this.isLoading = true;
    this.startIndex = 0;
    this.numRetries = 0;
}
RiseVision.FinancialChart.Instrument.prototype.getIsLoading = function() {
    return this.isLoading;
}
RiseVision.FinancialChart.Instrument.prototype.getX = function() {
    return this.x;
}
RiseVision.FinancialChart.Instrument.prototype.getY = function() {
    return this.y;
}
RiseVision.FinancialChart.Instrument.prototype.getDuration = function() {
    return this.duration;
}
RiseVision.FinancialChart.Instrument.prototype.setInstrument = function(instrument) {
    this.reset();
    this.historical.setInstrument(instrument);
}
RiseVision.FinancialChart.Instrument.prototype.setRealTimeData = function (data) {
    this.realTimeData = data;
}
RiseVision.FinancialChart.Instrument.prototype.setIsUpdated = function (isUpdated) {
    this.historical.setIsUpdated(isUpdated);
}
RiseVision.FinancialChart.Instrument.prototype.setDuration = function(duration) {
    this.reset();
    this.duration = duration;
    this.historical.setDuration(duration);

    //Rates at which the historic data server updates are what gets used for the x-axis intervals.
    if (duration == "Day") {
	this.interval = 300000;	//5 minutes
    }
    else if (duration == "Week") {
	this.interval = 1800000;	//30 minutes
    }
}
/* Load historical data. */
RiseVision.FinancialChart.Instrument.prototype.loadHistoricalData = function(ticks, callback) {
    var self = this;

    this.ticks = ticks;
    this.historical.getHistoricalData(["percentChange", "tradeTime"], function(result) {
	if (result != null) {
	    self.save(result, callback);
	}
	//No data, likely because this is a refresh and it is outside of the collection time, or because an error occurred.
	else {
	    callback(true);
	}
    });
}
RiseVision.FinancialChart.Instrument.prototype.save = function(result, callback) {
    var self = this,
	numDataRows = result.data.getNumberOfRows(),
	timeZoneOffset = result.collectionData.timeZoneOffset,
	row = 0,
	index = 0,
	tradeTime,
	tickTradeTime,
	now;

    //Data is stale if no rows are returned or if one row is returned and the tradeTime is null.
    //Issue 1027 - Check for empty string as well.
    if ((numDataRows == 0) || ((numDataRows == 1) && ((result.data.getFormattedValue(0, 1) == null) || (result.data.getFormattedValue(0, 1) == "")))) {
	this.numRetries++;

	if (this.numRetries == this.retryLimit) {
	    this.numRetries = 0;

	    console.log("Unable to load data for: " + this.instrument + " " + this.duration);
	    callback(false);
	}
	else {
	    $.event.trigger("retry", function() {
		self.loadHistoricalData(self.ticks, callback);
	    });
	}
    }
    else {
	//Add a matching data point for every tick.
	for (var i = 0; i < this.ticks.length; i++) {
	    if (row < numDataRows) {
		tickTradeTime = new Date(this.ticks[i].date);
		tradeTime = RiseVision.Common.Utility.adjustTime(new Date(result.data.getFormattedValue(row, 1)), timeZoneOffset);	//Convert this in common?
		y = parseFloat(result.data.getValue(row, 0));

		this.x.push(index);
		this.y.push(y);
		this.startIndex++;
		index++;

		//Trade time of comparative instrument matches or is before the trade time of tick (primary instrument).
		if ((Date.equals(tradeTime, tickTradeTime)) || (tradeTime.isBefore(tickTradeTime))) {
		    row++;
		}
	    }
	    //There are more ticks than data points for the comparative instrument.
	    else {
		if ((this.duration == "Day") || (this.duration == "Week")) {	//Issue 922
		    now = new Date();

		    //Now add any missing data from the last historical data point until now.
		    if (tradeTime.isBefore(now)) {
			this.x.push(index);
			this.y.push(y);
			this.startIndex++;

			tradeTime.addMilliseconds(this.interval);
			index++;
		    }
		    else {
			this.x.push(index);
			this.y.push(-1000);	//Use an inflated negative value so that the flat line connecting empty ticks won't be visible.
			index++;
		    }
		}
	    }
	}

	this.numRetries = 0;

	//Issue 1027 Start - this.ticks may be empty if historical data for primary instrument failed to load.
	if (this.ticks.length > 0) {
	    this.lastTradeTime = new Date(this.ticks[this.startIndex - 1].date);	//Issue 915
	}
	//Issue 1027 End

	this.plotRealTimeData();
	callback(true);
    }
}
/* Load real-time data. */
RiseVision.FinancialChart.Instrument.prototype.plotRealTimeData = function() {
    var timeZoneOffset = this.realTimeData.getFormattedValue(0, 7),
	tradeTime, tickTradeTime,
	found = false
	i = 0;

    if (this.realTimeData != null) {
	if (this.isLoading) {
	    if ((this.realTimeData.getFormattedValue(0, 2) != null) && (this.realTimeData.getFormattedValue(0, 2) != "") && (this.lastTradeTime != null)) {
		tradeTime = RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 2)), timeZoneOffset).clearTime();

		//Real-time data is the last data point.
		if ((this.duration != "Day") && (this.duration != "Week")) {
		    //Prevent charts from showing two data points for yesterday if running before markets open.
		    if (!Date.equals(tradeTime, this.lastTradeTime)) {
			this.x.push(this.startIndex);
			this.y.push(parseFloat(this.realTimeData.getValue(0, 1)));
			this.lastTradeTime = RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 2)), timeZoneOffset);
		    }
		}
	    }

	    this.isLoading = false;
	}
	//After initial load, data is updated from the real-time server.
	else {
	    if ((this.realTimeData.getFormattedValue(0, 2) != null) && (this.realTimeData.getFormattedValue(0, 2) != "") && (this.lastTradeTime != null)) {
		tradeTime = RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 2)), timeZoneOffset);
		tradeDay = tradeTime.clone().clearTime();
		lastTradeDay = this.lastTradeTime.clone().clearTime();

		//Issue 915 Start - Check if the dates are the same between the two trade times.
		if (Date.equals(tradeDay, lastTradeDay)) {
		    //Add new data points for Day and Week charts.
		    if ((this.duration == "Day") || (this.duration == "Week")) {
			for (i = 0; i < this.ticks.length; i++) {
			    tickTradeTime = new Date(this.ticks[i].date);

			    //Find first tick that is equal to or after the trade time.
			    if (tickTradeTime.isAfter(tradeTime) || Date.equals(tickTradeTime, tradeTime)) {
				found = true;
				break;
			    }
			}

			if (found) {
			    //Update all data points between tickTradeTime and current time.
			    while ((tickTradeTime.isAfter(tradeTime) || Date.equals(tickTradeTime, tradeTime)) && tickTradeTime.isBefore(new Date())) {
				if (i < this.y.length) {	//Issue 938
				    this.y[i] = parseFloat(this.realTimeData.getValue(0, 1))
				    this.lastTradeTime = tradeTime;

				    tickTradeTime.addMilliseconds(this.interval);
				    i++;
				}
				else {
				    break;
				}
			    }
			}
		    }
		    //Issue 915 End
		    //Other chart types have the last data point updated.
		    else {
			this.y[this.startIndex - 1] = parseFloat(this.realTimeData.getValue(0, 1));
			this.lastTradeTime = tradeTime;
		    }
		}
		//Markets have just opened.
		else {
		    this.isLoading = true;
		}
	    }
	}

	if (this.name == null) {
	    this.name = this.realTimeData.getFormattedValue(0, 3);
	}
    }
    else {
	this.isLoading = false;

	if (this.name == null) {
	    this.name = this.realTimeData.getFormattedValue(0, 3);
	}
    }
}

/* PrimaryInstrument class is inherited from Instrument class. */
RiseVision.FinancialChart.PrimaryInstrument = {};
RiseVision.FinancialChart.PrimaryInstrument.prototype = new RiseVision.FinancialChart.Instrument();
RiseVision.FinancialChart.PrimaryInstrument.prototype.constructor = RiseVision.FinancialChart.PrimaryInstrument;

/*
 * The PrimaryInstrument class handles data for the primary instrument.
 */
RiseVision.FinancialChart.PrimaryInstrument = function(options) {
    this.doCompare = options.doCompare;
    this.reset();

    RiseVision.FinancialChart.Instrument.call(this, {
	"id": options.id,
	"displayID": options.displayID,
	"instrument": options.instrument,
	"duration": options.duration,
	"callback": options.callback
    });
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.reset = function () {
    this.ticks = [];
    this.volumeX = [];
    this.volumeY = [];
    this.accumulatedVolume = 0;	//Issue 919
    this.historicCloseX = [];
    this.historicCloseY = [];

    if (this.doCompare) {
	this.percentChange = [];
    }

    RiseVision.FinancialChart.Instrument.prototype.reset.call(this);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getIsLoading = function() {
    return RiseVision.FinancialChart.Instrument.prototype.getIsLoading.call(this);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getX = function() {
    return RiseVision.FinancialChart.Instrument.prototype.getX.call(this);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getY = function() {
    return RiseVision.FinancialChart.Instrument.prototype.getY.call(this);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getPercentChange = function() {
    return this.percentChange;
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getTicks = function() {
    return this.ticks;
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getVolumeX = function() {
    return this.volumeX;
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getVolumeY = function() {
    return this.volumeY;
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getHistoricCloseX = function() {
    return this.historicCloseX;
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getHistoricCloseY = function() {
    return this.historicCloseY;
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.getDuration = function() {
    return RiseVision.FinancialChart.Instrument.prototype.getDuration.call(this);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.setInstrument = function (instrument) {
    this.reset();
    RiseVision.FinancialChart.Instrument.prototype.setInstrument.call(this, instrument);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.setDuration = function (duration) {
    this.reset();
    RiseVision.FinancialChart.Instrument.prototype.setDuration.call(this, duration);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.setRealTimeData = function (data) {
    RiseVision.FinancialChart.Instrument.prototype.setRealTimeData.call(this, data);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.setIsUpdated = function (isUpdated) {
    RiseVision.FinancialChart.Instrument.prototype.setIsUpdated.call(this, isUpdated);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.loadHistoricalData = function(callback) {
    var self = this,
	options = {},
	fields = null;

    if (this.doCompare) {
        fields = ["closePrice", "accumulatedVolume", "tradeTime", "percentChange"];
    }
    else {
        fields = ["closePrice", "accumulatedVolume", "tradeTime"];
    }

    this.historical.getHistoricalData(fields, function(result) {
	if (result != null) {
	    self.save(result, callback);
	}
	//No data, likely because this is a refresh and it is outside of the collection time, or because an error occurred.
	else {
	    callback(true);
	}
    }, options);
}
RiseVision.FinancialChart.PrimaryInstrument.prototype.save = function(result, callback) {
    var self = this,
	numDataRows = 0,
	closePrice = 0,
	lastClosePrice = 0,
	lastPercentChange = 0,
	lastVolume = 0,
	index = 0,
	tradeTime = null,
	timeZoneOffset = "",
	lastTradeTime,
	endTime;

    numDataRows = result.data.getNumberOfRows();

    //Check if the data is stale.
    if ((numDataRows == 0) || ((numDataRows == 1) && (result.data.getFormattedValue(0, 0) == "0"))) {
	this.numRetries++;

	if (this.numRetries == this.retryLimit) {
	    this.numRetries = 0;

	    console.log("Unable to load data for: " + this.instrument + " " + this.duration);
	    callback(false);
	}
	else {
	    $.event.trigger("retry", function() {
		self.loadHistoricalData(callback);
	    });
	}
    }
    else {
	//For some reason, sometimes values are already populated. Reset them again.
	if (this.x.length > 0) {
	    this.reset();
	}

	endTime = result.collectionData.endTime.clone();	//Issue 915
	timeZoneOffset = result.collectionData.timeZoneOffset;

	//Issue 877 - Collection times are already converted to the appropriate time zone on the server, so no need to adjust.
	this.collectionStartTime = result.collectionData.startTime;
	this.collectionEndTime = result.collectionData.endTime;

	for (var row = 0; row < numDataRows; row++) {
	    //Issue 915 Start - Fill in any gaps in data with a flat line for daily and weekly charts.
	    //Gaps could occur from the start collection time until the first available trade time,
	    //and/or between the trade times of consecutive data points.
	    if ((this.duration == "Day") || (this.duration == "Week")) {
		tradeTime = RiseVision.Common.Utility.adjustTime(new Date(result.data.getFormattedValue(row, 2)), timeZoneOffset);

		if (row == 0) {
		    //Initialize lastTradeTime with date of current tradeTime but time of the collection start time,
		    //so that we can check if there is a gap in data before the first available data point.
		    lastTradeTime = new Date(tradeTime);
		    lastTradeTime.setHours(this.collectionStartTime.getHours());
		    lastTradeTime.setMinutes(this.collectionStartTime.getMinutes());

		    //Issue 944 Start - If the collection start time is earlier than lastTradeTime, set lastTradeTime to yesterday.
		    if ((this.duration == "Day") && (this.collectionStartTime.clone().clearTime().isBefore(lastTradeTime.clone().clearTime()))) {
			lastTradeTime.add({ days: -1 });
		    }
		    //Issue 944 End

		    lastTradeDay = lastTradeTime.clone().clearTime();

		    endTime.setFullYear(lastTradeTime.getFullYear());
		    endTime.setMonth(lastTradeTime.getMonth());
		    endTime.setDate(lastTradeTime.getDate());

		    //If collection start and end times go across two days, then we need to set endTime appropriately.
		    if (!Date.equals(result.collectionData.startTime.clone().clearTime(), result.collectionData.endTime.clone().clearTime())) {
			endTime.addDays(1);
		    }

		    //Store values of first available data points in case we need to use them to backfill data.
		    if (this.doCompare) {
			lastClosePrice = parseFloat(result.data.getValue(row, 0));
			lastPercentChange = parseFloat(result.data.getValue(row, 3));
		    }
		    else {
			lastClosePrice = parseFloat(result.data.getValue(row, 0));
		    }

		    lastVolume = parseFloat(result.data.getValue(row, 1));
		}

		//Only add a data point if it falls between the collection times.
		while ((tradeTime.isAfter(lastTradeTime)) && ((lastTradeTime.isBefore(endTime)) || Date.equals(lastTradeTime, endTime))) {
		    index = this.addDataPoint({
			"plotTime": lastTradeTime,
			"tradeTime": tradeTime,
			"lastTradeTime": lastTradeTime,
			"endTime": endTime,
			"collectionStartTime": result.collectionData.startTime.clone().clearTime(),
			"collectionEndTime": result.collectionData.endTime.clone().clearTime(),
			"closePrice": lastClosePrice,
			"volume": lastVolume,
			"percentChange": lastPercentChange,
			"index": index
		    });
		}

		//Reset lastTradeTime to collection start time of next day.
		if (lastTradeTime.isAfter(endTime)) {
		    lastTradeTime = new Date(tradeTime);
		    lastTradeTime.setHours(this.collectionStartTime.getHours());
		    lastTradeTime.setMinutes(this.collectionStartTime.getMinutes());
		    lastTradeDay = lastTradeTime.clone().clearTime();

		    endTime.setFullYear(lastTradeTime.getFullYear());
		    endTime.setMonth(lastTradeTime.getMonth());
		    endTime.setDate(lastTradeTime.getDate());
		}

		//Now plot data point received from data server.
		if (this.doCompare) {
		    closePrice = parseFloat(result.data.getValue(row, 0));
		    lastPercentChange = parseFloat(result.data.getValue(row, 3));
		}
		else {
		    closePrice = parseFloat(result.data.getValue(row, 0));
		}

		//One plot point for every interval. This is needed to make it easier to plot comparative instruments.
		index = this.addDataPoint({
		    "plotTime": lastTradeTime,
		    "tradeTime": tradeTime,
		    "lastTradeTime": lastTradeTime,
		    "endTime": endTime,
		    "collectionStartTime": result.collectionData.startTime.clone().clearTime(),
		    "collectionEndTime": result.collectionData.endTime.clone().clearTime(),
		    "closePrice": closePrice,
		    "volume": parseFloat(result.data.getValue(row, 1)),
		    "percentChange": lastPercentChange,
		    "index": index
		});

		lastClosePrice = closePrice;
		lastVolume = parseFloat(result.data.getValue(row, 1));
	    }
	    //All other chart types use data as is from data server.
	    else {
		if (this.doCompare) {
		    closePrice = parseFloat(result.data.getValue(row, 0));
		    this.percentChange.push(parseFloat(result.data.getValue(row, 3)));
		}
		else {
		    closePrice = parseFloat(result.data.getValue(row, 0))
		}

		this.ticks.push({
		    "date": RiseVision.Common.Utility.adjustTime(new Date(result.data.getFormattedValue(row, 2)), timeZoneOffset).getTime(),
		    "originalDate": new Date(result.data.getFormattedValue(row, 2)).getTime(),
		    "close": closePrice,
		    "volume": parseInt(result.data.getFormattedValue(row, 1))
		});

		this.x.push(row);
		this.volumeX.push(row);
		this.y.push(parseFloat(result.data.getValue(row, 0)));
		this.volumeY.push(parseFloat(result.data.getValue(row, 1)));
	    }
	}

	//Now add any missing data from the last historical data point until now.
	if ((this.duration == "Day") || (this.duration == "Week")) {
	    var now = new Date();

	    //If current date is not the same as the lastTradeTime, we need to add data points from
	    //the last trade time until the collection end time.
	    if ((now.clone().clearTime().isAfter(lastTradeTime.clone().clearTime())) ||
		(Date.equals(now.clone().clearTime(), lastTradeTime.clone().clearTime()))) {
		while ((lastTradeTime.isBefore(endTime)) && (lastTradeTime.isBefore(now))) {
		    this.ticks.push({
			"date": lastTradeTime.getTime(),
			"close": lastClosePrice,
			"volume": lastVolume
		    });

		    this.x.push(index);
		    this.volumeX.push(index);
		    this.y.push(lastClosePrice);
		    this.volumeY.push(lastVolume);

		    if (this.doCompare) {
			this.percentChange.push(lastPercentChange);
		    }

		    lastTradeTime.addMilliseconds(this.interval);
		    index++;
		}
	    }
	    else {
		while (lastTradeTime.isBefore(now)) {
		    this.ticks.push({
			"date": lastTradeTime.getTime(),
			"close": lastClosePrice,
			"volume": lastVolume
		    });

		    this.x.push(index);
		    this.volumeX.push(index);
		    this.y.push(lastClosePrice);
		    this.volumeY.push(lastVolume);

		    if (this.doCompare) {
			this.percentChange.push(lastPercentChange);
		    }

		    lastTradeTime.addMilliseconds(this.interval);
		    index++;
		}
	    }

	     //Keep track of where last data point was inserted.
	    this.startIndex = index;
	}
	else {
	    this.startIndex = numDataRows;
	}
	//Issue 915 End

	if (this.duration == "Day") {
	    this.addExtraTicks(result.collectionData, new Date(this.ticks[this.ticks.length - 1].date));	//Issue 915
	}

	this.numRetries = 0;
	this.lastTradeTime = new Date(this.ticks[this.startIndex - 1].date);	//Issue 915
	this.plotRealTimeData();
	callback(true);
    }
}
//Issue 915 Start
RiseVision.FinancialChart.PrimaryInstrument.prototype.addDataPoint = function(data) {
    var lastTradeDay,
	previousLastTradeDay;

    this.ticks.push({
	"date": data.plotTime.getTime(),
	"close": data.closePrice,
	"volume": data.volume
    });

    this.x.push(data.index);
    this.volumeX.push(data.index);
    this.y.push(data.closePrice);
    this.volumeY.push(data.volume);

    if (this.doCompare) {
	this.percentChange.push(data.percentChange);
    }

    previousLastTradeDay = data.lastTradeTime.clone().clearTime();
    data.lastTradeTime.addMilliseconds(this.interval);
    lastTradeDay = data.lastTradeTime.clone().clearTime();

    //If lastTradeTime has crossed over into a new day, use the date from tradeTime
    //so that weekends and holidays are ignored. Make sure that tradeTime is not the same day
    //as previousLastTradeDay so we don't end up in an infinite loop.
    if ((!Date.equals(previousLastTradeDay, lastTradeDay)) &&
	(!Date.equals(previousLastTradeDay, data.tradeTime.clone().clearTime()))) {
	data.lastTradeTime.setFullYear(data.tradeTime.getFullYear());
	data.lastTradeTime.setMonth(data.tradeTime.getMonth());
	data.lastTradeTime.setDate(data.tradeTime.getDate());
    }
    //if (Date.equals(previousLastTradeDay, data.tradeTime.clone().clearTime()) then may need to get next tradeTime
    //and set data.lastTradeTime to that.

    data.endTime.setFullYear(data.lastTradeTime.getFullYear());
    data.endTime.setMonth(data.lastTradeTime.getMonth());
    data.endTime.setDate(data.lastTradeTime.getDate());

    //If collection start and end times go across two days, then we need to set endTime appropriately.
    if (!Date.equals(data.collectionStartTime, data.collectionEndTime)) {
	data.endTime.addDays(1);
    }

    return data.index + 1;
}
//Issue 915 End
RiseVision.FinancialChart.PrimaryInstrument.prototype.plotRealTimeData = function() {
    var tradeTime, tickTradeTime, tradeDay, lastTradeDay, plotValue,
	timeZoneOffset = this.realTimeData.getFormattedValue(0, 11),
	found = false,
	volume = 0,
	i = 0;

    if (this.realTimeData != null) {
	plotValue = parseFloat(this.realTimeData.getValue(0, 2));

	if (this.isLoading) {
	    if ((this.realTimeData.getFormattedValue(0, 5) != null) && (this.realTimeData.getFormattedValue(0, 5) != "") && (this.lastTradeTime != null)) {
		tradeTime = RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 5)), timeZoneOffset).clearTime();

		//Show Previous Close line as another series in the chart, where the x endpoints are the start and end times of the current day.
		if (this.duration == "Day") {
		    for (i = 0; i < this.x.length; i++) {
			this.historicCloseX.push(i);
			this.historicCloseY.push(parseFloat(this.realTimeData.getValue(0, 6)));
		    }
		}

		//Real-time data is the last data point.
		if ((this.duration != "Day") && (this.duration != "Week")) {
		    //Prevent charts from showing two data points for yesterday if running before markets open.
		    if (!Date.equals(tradeTime, this.lastTradeTime)) {
			this.ticks.push({
			    "date": RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 5)), timeZoneOffset).getTime(),
			    "close": plotValue,
			    "volume": parseInt(this.realTimeData.getFormattedValue(0, 4))
			});

			this.x.push(this.startIndex);
			this.volumeX.push(this.startIndex);
			this.y.push(plotValue);
			this.volumeY.push(parseFloat(this.realTimeData.getValue(0, 4)));

			if (this.doCompare) {
			    this.percentChange.push(parseFloat(this.realTimeData.getValue(0, 7)));
			}

			this.startIndex++;
		    }
		}
	    }

	    this.isLoading = false;
	    this.lastTradeTime = RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 5)), timeZoneOffset);
	}
	//After initial load, data is updated from the real-time server.
	else {
	    if ((this.realTimeData.getFormattedValue(0, 5) != null) && (this.realTimeData.getFormattedValue(0, 5) != "") && (this.lastTradeTime != null)) {
		tradeTime = RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 5)), timeZoneOffset);
		tradeDay = tradeTime.clone().clearTime();
		lastTradeDay = this.lastTradeTime.clone().clearTime();

		//Issue 915 Start - Check if the dates are the same between the two trade times.
		if (Date.equals(tradeDay, lastTradeDay)) {
		    //Add new data points for Day and Week charts.
		    if ((this.duration == "Day") || (this.duration == "Week")) {
			for (i = 0; i < this.ticks.length; i++) {
			    tickTradeTime = new Date(this.ticks[i].date);

			    //Find first tick that is equal to or after the trade time.
			    if (tickTradeTime.isAfter(tradeTime) || Date.equals(tickTradeTime, tradeTime)) {
				found = true;
				break;
			    }
			}

			if (found) {
			    if (!Date.equals(tradeTime, this.lastTradeTime)) {
				this.volume = parseFloat(this.realTimeData.getValue(0, 4)) - this.accumulatedVolume
			    }

			    //Update all data points between tickTradeTime and current time.
			    while ((tickTradeTime.isAfter(tradeTime) || Date.equals(tickTradeTime, tradeTime)) && tickTradeTime.isBefore(new Date())) {
				if (this.duration == "Day") {
				    if (i < this.ticks.length) {
					this.ticks[i].close = plotValue;
					this.ticks[i].volume = this.volume	//Issue 919
					this.y[i] = plotValue;
					this.volumeY[i] = this.volume;	//Issue 919

					if (this.doCompare) {
					    this.percentChange[i] = parseFloat(this.realTimeData.getValue(0, 7));
					}
				    }
				}
				else {	//Week
				    this.ticks.push({
					"date" : RiseVision.Common.Utility.adjustTime(new Date(this.realTimeData.getFormattedValue(0, 5)), timeZoneOffset).getTime(),
					"close": plotValue,
					"volume": parseFloat(this.realTimeData.getValue(0, 4)) - this.accumulatedVolume	//Issue 919
				    });

				    this.x.push(i);
				    this.volumeX.push(i);
				    this.y.push(plotValue);
				    this.volumeY.push(parseFloat(this.realTimeData.getValue(0, 4)) - this.accumulatedVolume);	//Issue 919

				    if (this.doCompare) {
					this.percentChange.push(parseFloat(this.realTimeData.getValue(0, 7)));
				    }
				}

				this.lastTradeTime = tradeTime;
				tickTradeTime.addMilliseconds(this.interval);
				i++;
			    }
			}
		    //Issue 915 End
		    }
		    //Other chart types have the last data point updated.
		    else {
			this.ticks[this.startIndex - 1].date = new Date(this.realTimeData.getFormattedValue(0, 5)).getTime();
			this.ticks[this.startIndex - 1].close = plotValue;
			this.ticks[this.startIndex - 1].volume = parseFloat(this.realTimeData.getValue(0, 4)) - this.accumulatedVolume;	//Issue 919
			this.y[this.startIndex - 1] = plotValue;
			this.volumeY[this.startIndex - 1] = parseFloat(this.realTimeData.getValue(0, 4)) - this.accumulatedVolume;	//Issue 919

			if (this.doCompare) {
			    this.percentChange[this.startIndex - 1] = parseFloat(this.realTimeData.getValue(0, 7));
			}

			this.lastTradeTime = tradeTime;
		    }
		}
		//Markets have just opened. Retrieve historical and real-time data again.
		else {
		    this.isLoading = true;
		}
	    }
	}

	this.accumulatedVolume = parseFloat(this.realTimeData.getValue(0, 4));	//Issue 919
    }
    else {
	this.isLoading = false;
    }
}
/*
 * Get the number of intervals between two times.
 */
RiseVision.FinancialChart.PrimaryInstrument.prototype.getNumDayIntervals = function(startTime, endTime, interval) {
    var start = startTime.getTime(),
	end = endTime.getTime(),
	difference = end - start;

    return Math.round(difference / interval);
}
/*
 * Add empty data until the collection end time has been reached, so that all of the x-axis labels will show up.
 * This only needs to be done for the day chart, since there is not necessarily going to be data for all x-axis ticks.
 */
RiseVision.FinancialChart.PrimaryInstrument.prototype.addExtraTicks = function(collectionTimes, lastTradeTime) {
    var numIntervals = 0,
	tradeTime = new Date(lastTradeTime),
	//endTime = new Date(lastTradeTime),	//Issue 921
	endTime = new Date(collectionTimes.endTime),	//Already converted.
	newTradeTime;

    //Issue 921
    //endTime.setHours(collectionTimes.endTime.getHours());
    //endTime.setMinutes(collectionTimes.endTime.getMinutes());

    //Find the number of intervals between the collection start and end times.
    numIntervals = this.getNumDayIntervals(collectionTimes.startTime, collectionTimes.endTime, this.interval)

    for (var i = this.startIndex; i < numIntervals; i++) {
	lastTradeTime.add({ milliseconds: this.interval });
	tradeTime = new Date(lastTradeTime);

	if (tradeTime.isBefore(endTime)) {	//Or equal to?
	    this.ticks.push({
		"date": lastTradeTime.getTime(),
		"close": 0,
		"volume": 0
	    });

	    this.x.push(i);
	    this.volumeX.push(i);
	    this.y.push(-1000);	//Use an inflated negative value so that the flat line connecting empty ticks won't be visible.
	    this.volumeY.push("");

	    if (this.percentChange != null) {
		this.percentChange.push(-1000);
	    }
	}
	else {
	    break;
	}
    }
}