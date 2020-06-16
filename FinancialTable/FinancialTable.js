/* Primary functionality for the Financial Gadget. */
var RiseVision = RiseVision || {};
RiseVision.FinancialSettings = {};

/* Settings Start */
RiseVision.FinancialSettings = function() {
    this.settings = new RiseVision.Common.Settings();
}
//Populate settings from saved values.
RiseVision.FinancialSettings.prototype.initSettings = function() {
    var self = this;

    //Add event handlers.
    $("#selector").on("click", function(event) {
	financial.showStockSelector();
    });

    $(".colorPicker").on("click", function(event) {
	financial.showColorPicker($(this).data("for"));
    });

    $(".fontSelector").on("click", function(event) {
	financial.showFontSelector($(this).data("for"));
    });

    $("#scrollDirection").on("change", function(event) {
	if ($(this).val() == "none") {
	    $("li.scroll").hide();
	}
	else {
	    $("li.scroll").show();
	}
    });

    $("#scrollBy").on("change", function(event) {
	if ($(this).val() == "continuous") {
	    $("li.scrollHold").hide();
	}
	else {
	    $("li.scrollHold").show();
	}
    });

    $("#colCount").on("change", function(event) {
	financial.buildFieldsUI();
    });

    $("#useDefault").on("click", function(event) {
	if ($(this).is(":checked")) {
	    $("li.layoutURL").hide();
	}
	else {
	    $("li.layoutURL").show();
	}
    });

    //Request additional parameters from the Viewer.
    gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
	if (result) {
	    result = JSON.parse(result);

	    //Populate fields saved as UserPrefs.
	    $("#disclaimerFont").val(prefs.getString("disclaimerFont"));
	    $("#disclaimerLoc").val(prefs.getString("disclaimerLoc"));
	    $("#acceptance").attr("checked", prefs.getBool("acceptance"));
	    $("#scrollDirection").val(prefs.getString("scrollDirection"));
	    $("#scrollBy").val(prefs.getString("scrollBy"));
	    $("#scrollHold").val(prefs.getInt("scrollHold"));
	    $("#scrollSpeed").val(prefs.getString("scrollSpeed"));
	    $("#scrollResumes").val(prefs.getInt("scrollResumes"));
	    $("#rowPadding").val(prefs.getInt("rowPadding"));
	    $("#colPadding").val(prefs.getInt("colPadding"));
	    $("#colCount").val(prefs.getInt("colCount"));
	    $("#bgColor").val(prefs.getString("bgColor"));
	    $("#rowColor").val(prefs.getString("rowColor"));
	    $("#altRowColor").val(prefs.getString("altRowColor"));
	    $("#selRowColor").val(prefs.getString("selRowColor"));
	    $("#useDefault").attr("checked", prefs.getBool("useDefault"));
	    $("#layoutURL").val(prefs.getString("layoutURL"));

	    //Populate colors and show color as background of text box.
	    self.populateColor($("#rowColor"), prefs.getString("rowColor"));
	    self.populateColor($("#altRowColor"), prefs.getString("altRowColor"));
	    self.populateColor($("#selRowColor"), prefs.getString("selRowColor"));
	    self.populateColor($("#bgColor"), prefs.getString("bgColor"));

	    //Populate fields saved as additionalParams.
	    $("#instruments").val(result["instruments"]);
	    $("#heading_font-style").text(result["heading_font"]);
	    $("#heading_font-style").data("css", result["heading_font-style"]);
	    $("#data_font-style").text(result["data_font"]);
	    $("#data_font-style").data("css", result["data_font-style"]);

	    //Build UI for fields before populating.
	    $("#colCount").trigger("change");

	    for (var i = 0; i < parseInt($("#colCount").val()); i++) {
		self.initFields(i + 1, result.fields[i]);
	    }

	    $(".field").trigger("change");
	}
	else {
	    $("#colCount").trigger("change");
	    $(".field").trigger("change");
	}

	$("form ol li ol.drillDown li:visible:last").css({
	    "clear": "left",
	    "float": "left",
	    "margin-bottom": "10px"
	});

	//Manually trigger event handlers so that the visibility of fields can be set.
	$("#scrollDirection").trigger("change");
	$("#scrollBy").trigger("change");
	$("#useDefault").triggerHandler("click");
	$("#settings").show();
    });
}
RiseVision.FinancialSettings.prototype.populateColor = function($element, color) {
    $element.val(color);
    $element.css("background-color", color);
}
RiseVision.FinancialSettings.prototype.initFields = function(index, field) {
    $("#field" + index).val(field.field);
    $("#alignment" + index).val(field.alignment);
    $("#width" + index).val(field.width);
    $("#decimals" + index).val(field.decimals);
    $("#sign" + index).val(field.sign);
    $("#condition" + index + "Action").val(field.condition);
    $("#headerText" + index).val(field.header);
}
//Add UI for field format settings.
RiseVision.FinancialSettings.prototype.buildFieldsUI = function() {
    var colCount = parseInt($("#colCount").val()),
	conditionalCount = $(".field").length;

    //Hide all fields related to field formatting.
    if (isNaN(colCount) || colCount == 0) {
	$(".formatting").hide();
    }
    else {
	//Column formatting fields have already been created, so show them.
	if (colCount == conditionalCount) {
	    $(".formatting").show();
	}
	//There are enough settings, so show the appropriate number of them.
	else if (colCount < conditionalCount) {
	    $(".formatting").hide();
	    $(".formatting:lt(" + colCount + ")").show();
	}
	//Not enough conditional field formatting settings.
	else {
	    //Show all existing settings.
	    $(".formatting").show();

	    for (var i = conditionalCount + 1; i <= colCount; i++) {
		var li = document.createElement("li"),
		    ol = document.createElement("ol");

		    ol.setAttribute("class", "formatting drillDown");

		    $(ol)
			.append($("<li></li>")
			    .append("<label for='field" + i + "'>Field*:</label>")
			    .append("<select id='field" + i + "' name='field" + i + "' class='field medium'>" +
				"<option value='instrument'>Instrument</option>" +
				"<option value='logo'>Instrument Logo</option>" +
				"<option value='name'>Instrument Name</option>" +
				"<option value='lastPrice'>Last Price</option>" +
				"<option value='historicClose'>Previous Close</option>" +
				"<option value='netChange'>Change</option>" +
				"<option value='percentChange'>% Change</option>" +
				"<option value='accumulatedVolume'>Accumulated Volume</option>" +
				"<option value='dayHigh'>Day High</option>" +
				"<option value='dayLow'>Day Low</option>" +
				"<option value='yearHigh'>52 Week High</option>" +
				"<option value='yearLow'>52 Week Low</option>" +
				"<option value='bid'>Bid</option>" +
				"<option value='ask'>Ask</option>" +
				"<option value='yield'>Yield</option>" +
				"<option value='yieldChange'>Yield Change</option>" +
				"<option value='tradeTime'>Trade Time</option>" +
				"</select>"))
			.append($("<li></li>")
			    .append("<label for='alignment" + i + "'>Alignment:</label>")
			    .append("<select id='alignment" + i + "' name='alignment" + i + "' class='alignment short'>" +
				"<option value='left' selected='selected'>Left</option>" +
				"<option value='center'>Center</option>" +
				"<option value='right'>Right</option>" +
				"</select>"))
			.append($("<li></li>")
			    .append("<label for='width" + i + "'>Width (pixels):</label>")
			    .append("<input id='width" + i + "' name='width" + i + "' type='text' class='width short' />"))
			.append($("<li></li>")
			    .append("<label for='headerText" + i + i + "'>" +
				"<a href='#' class='tooltip'>Header Text:<span>Custom header text. If not specified, the header from the field will be used.</span></a>" +
				"</label>")
			    .append("<input id='headerText" + i + "' name='headerText" + i + "' type='text' class='headerText short' />"))
			.append($("<li class='numeric drilldown'></li>")
			    .append($("<ol></ol>")
				.append($("<li></li>")
				    .append("<label for='decimals" + i + "'>Decimals:</label>")
				    .append("<select id='decimals" + i + "' name='decimals" + i + "' class='decimals short'>" +
					"<option value='0'>0</option>" +
					"<option value='1'>1</option>" +
					"<option value='2' selected='selected'>2</option>" +
					"<option value='3'>3</option>" +
					"<option value='4'>4</option>" +
					"</select>"))
				.append($("<li></li>")
				    .append("<label for='sign" + i + "'>" +
					"<a href='#' class='tooltip'>Sign:<span>How to display positive and negative numbers</span></a>" +
					"</label>")
				    .append("<select id='sign" + i + "' name='sign" + i + "' class='sign short'>" +
					"<option value='none'>None</option>" +
					"<option value='minus'>-</option>" +
					"<option value='plusMinus'>+/-</option>" +
					"<option value='parentheses'>( )</option>" +
					"<option value='arrow' selected='selected'>Arrow</option>" +
					"</select>"))
				.append($("<li></li>")
				    .append("<label for='condition" + i + "'>" +
					"<a href='#' class='tooltip'>Color Condition:<span>Whether or not to use color to indicate positive or negative values, or to indicate a change in value</span></a>" +
					"</label>")
				    .append("<select id='condition" + i + "Action' name='condition" + i + "Action' class='condition medium'>" +
					"<option value='none' selected='selected'>None</option>" +
					"<option value='changeUp'>Change Up Green Down Red</option>" +
					"<option value='changeDown'>Change Down Green Up Red</option>" +
					"<option value='valuePositive'>Value Positive Green Negative Red</option>" +
					"<option value='valueNegative'>Value Negative Green Positive Red</option>" +
					"</select>"))));

		$(li).append(ol);

		//Insert before Background Color.
		$("#bgColor").parent().before(li);

		//Add event handler for the Field settings.
		$(".field").on("change", function(event) {
		    if ((this.value != "instrument") && (this.value != "logo") && (this.value != "name") && (this.value != "tradeTime")) {
			$(this).parent().parent().find(".numeric").show();
		    }
		    else {
			$(this).parent().parent().find(".numeric").hide();
		    }
		});
	    }

	    //Set default value for newly added fields.
	    for (var i = conditionalCount + 1; i <= colCount; i++) {
		$(".field").eq(i - 1)[0].selectedIndex = i - 1;
	    }
	}
    }
}
RiseVision.FinancialSettings.prototype.showStockSelector = function() {
    gadgets.rpc.call("", "rscmd_openFinancialSelector", null, "instruments", $("#instruments").val());
}
RiseVision.FinancialSettings.prototype.showColorPicker = function(id) {
    gadgets.rpc.call("", "rscmd_openColorPicker", null, id, $("#" + id).val());
}
RiseVision.FinancialSettings.prototype.showFontSelector = function(id) {
    gadgets.rpc.call("", "rscmd_openFontSelector", null, id, $("#" + id).data("css"));
}
RiseVision.FinancialSettings.prototype.setStocks = function(id, stocks) {
    $("#" + id).val(stocks);
}
RiseVision.FinancialSettings.prototype.setColor = function(id, color) {
    $("#" + id).val(color);
    $("#" + id).css("background-color", color);
}
RiseVision.FinancialSettings.prototype.setFont = function(id, css, style) {
    $("#" + id).data("css", css);
    $("#" + id).text(style);
}
RiseVision.FinancialSettings.prototype.getSettings = function() {
    var errorFound = false,
	errors = document.getElementsByClassName("errors")[0],
	params = "",
	settings = null;

    $(".errors").empty();

    //Perform validation.
    errorFound = (financial.settings.validateRequired($("#instruments"), errors, "Instruments")) ? true : errorFound;
    errorFound = (financial.settings.validateNumeric($("#scrollHold"), errors, "Scroll Hold")) ? true : errorFound;
    errorFound = (financial.settings.validateNumeric($("#scrollResumes"), errors, "Scroll Resumes")) ? true : errorFound;
    errorFound = (financial.settings.validateNumeric($("#rowPadding"), errors, "Row Padding")) ? true : errorFound;
    errorFound = (financial.settings.validateNumeric($("#colPadding"), errors, "Column Padding")) ? true : errorFound;

    if (parseInt($("#colCount").val()) > 0) {
	$(".field").each(function(i) {
	    errorFound = (financial.settings.validateRequired($(this), errors, "Field")) ? true : errorFound;
	});

	$(".width").each(function(i) {
	    errorFound = (financial.settings.validateNumeric($(this), errors, "Width")) ? true : errorFound;
	});
    }

    errorFound = (financial.settings.validateRequired($("#layoutURL"), errors, "Layout URL")) ? true : errorFound;

    if (errorFound) {
	$(".errors").fadeIn(200).css("display", "inline-block");
	$("#wrapper").scrollTop(0);

	return null;
    }
    else {
	//Construct parameters string to pass to RVA.
	params =
	    "up_disclaimerFont=" + $("#disclaimerFont").val() +
	    "&up_disclaimerLoc=" + $("#disclaimerLoc").val() +
	    "&up_scrollDirection=" + $("#scrollDirection").val() +
	    "&up_scrollBy=" + $("#scrollBy").val() +
	    "&up_scrollHold=" + $("#scrollHold").val() +
	    "&up_scrollSpeed=" + $("#scrollSpeed").val() +
	    "&up_scrollResumes=" + $("#scrollResumes").val() +
	    "&up_rowPadding=" + $("#rowPadding").val() +
	    "&up_colPadding=" + $("#colPadding").val() +
	    "&up_colCount=" + $("#colCount").val() +
	    "&up_bgColor=" + $("#bgColor").val() +
	    "&up_rowColor=" + $("#rowColor").val() +
	    "&up_altRowColor=" + $("#altRowColor").val() +
	    "&up_selRowColor=" + $("#selRowColor").val() +
	    "&up_layoutURL=" + escape($("#layoutURL").val());

	if ($("#acceptance").is(":checked")) {
	    params += "&up_acceptance=true";
	}
	else {
	    params += "&up_acceptance=false";
	}

	if ($("#useDefault").is(":checked")) {
	    params += "&up_useDefault=true";
	}
	else {
	    params += "&up_useDefault=false";
	}

	settings = {
	    "params": params,
	    "additionalParams": JSON.stringify(financial.saveAdditionalParams())
	};

	$(".errors").css({ display: "none" });

	return settings;
    }
}
RiseVision.FinancialSettings.prototype.saveAdditionalParams = function() {
    var additionalParams = {},
	fields = [];

    additionalParams["instruments"] = $("#instruments").val();
    additionalParams["heading_font"] = $("#heading_font-style").text();
    additionalParams["heading_font-style"] = $("#heading_font-style").data("css");
    additionalParams["data_font"] = $("#data_font-style").text();
    additionalParams["data_font-style"] = $("#data_font-style").data("css");

    for (var i = 0; i < parseInt($("#colCount").val()); i++) {
	fields.push(financial.saveFormatSettings(i + 1, fields));
    }

    additionalParams["fields"] = fields;

   return additionalParams;
}
RiseVision.FinancialSettings.prototype.saveFormatSettings = function(i) {
    var formatSettings = {
	"field": $("#field" + i).val(),
	"alignment": $("#alignment" + i).val(),
	"width": $("#width" + i).val(),
	"header": $("#headerText" + i).val()
    };

    if ($("#decimals" + i + ":visible").length > 0) {
	formatSettings["decimals"] = $("#decimals" + i).val();
	formatSettings["sign"] = $("#sign" + i).val();
	formatSettings["condition"] = $("#condition" + i + "Action").val();
    }

    return formatSettings;
}
/* Settings End */

/* Functionality Start */
RiseVision.Financial = {};

RiseVision.Financial = function(displayID) {
    this.displayID = displayID;

    //Gadget settings
    this.scrollDirection = prefs.getString("scrollDirection");
    this.scrollBy = prefs.getString("scrollBy");
    this.scrollHold = prefs.getInt("scrollHold") * 1000;
    this.scrollSpeed = prefs.getString("scrollSpeed");
    this.scrollResumes = prefs.getInt("scrollResumes") * 1000;
    this.rowPadding = prefs.getInt("rowPadding") / 2 + "px";
    this.colPadding = prefs.getInt("colPadding") / 2 + "px";
    this.disclaimerFont = prefs.getString("disclaimerFont");
    this.disclaimerLoc = prefs.getString("disclaimerLoc");
    this.useDefault = prefs.getBool("useDefault");

    if (this.useDefault) {
	this.layoutURL = "";
    }
    else {
	this.layoutURL = prefs.getString("layoutURL");
    }

    this.logosURL = "//s3.amazonaws.com/risecontentlogos/financial/";
    this.hasLogos = false;
    this.hasLastItemScrolled = false;
    this.updateInterval = 60000;
    this.selectedIndex = -1;

    this.isLoading = true;
    this.sortConfig = {
	"bAutoWidth": false,
	"bDestroy": true,
	"bFilter": false,
	"bInfo": false,
	"bLengthChange": false,
	"bPaginate": false,
	"bSort": false,
	"sScrollY": "500px"	//Needed just to force table structure conducive to sorting.
    };
}
RiseVision.Financial.prototype.getInstrument = function(index) {
    $("tr").removeClass("selected");
    $(".item").eq(index).addClass("selected");

    return $(".item").eq(index).attr("data-code");
}
/*
 * Keep track of previously unrequested instruments, particularly in a chain.
 * This list is made available via an RPC call.
 */
RiseVision.Financial.prototype.checkInstruments = function(includeAll) {
    var self = this,
	instruments = [],
	unrequested = [],
	numRows = this.data.getNumberOfRows();

    if (includeAll) {
	this.requested = [];
    }

    for (var row = 0; row < numRows; row++) {
	instruments.push(this.data.getFormattedValue(row, this.financial.dataFields["code"]));
    }

    //Find all symbols in 'instruments' that are not already in 'this.requested'.
    unrequested = $.grep(instruments, function(el) {
	return $.inArray(el, self.requested) == -1
    });

    for (var i = 0; i < unrequested.length; i++) {
    	this.requested.push(unrequested[i]);
    }

    if (unrequested.length > 0) {
	gadgets.rpc.call("", "instrumentsChanged", null, this.displayID, unrequested);
    }

    if (includeAll) {
	//Every 24 hours, pass a list of all instruments to any listeners.
	setTimeout(function() {
	    self.checkInstruments(true);
	}, 86400000);
    }
}
RiseVision.Financial.prototype.getAdditionalParams = function(name, value) {
    if (name == "additionalParams") {
	if (value) {
	    var styleNode = document.createElement("style"),
		currentIndex = 0;

	    value = JSON.parse(value);

	    //Inject CSS font styles into the DOM.
	    styleNode.appendChild(document.createTextNode(value["heading_font-style"]));
	    styleNode.appendChild(document.createTextNode(value["data_font-style"]));
	    document.getElementsByTagName("head")[0].appendChild(styleNode);

	    financial.instruments = value.instruments;

	    //Determine what fields will need to be requested from the data source.
	    //Instrument is always returned.
	    financial.requestedFields = [];

	    $.each(value.fields, function(index, value) {
		if ((value.field == "name" ) || (value.field == "logo") || (value.field == "instrument") || (value.field == "arrow")) {}	//Issue 853
		else {
		    financial.requestedFields.push(value.field);
		}
	    });

	    financial.requestedFields.push("code");
	    financial.requestedFields.push("name");	//Issue 853
	    financial.fields = value.fields;

	    $.each(value.fields, function(index, value) {
		if (value.field == "logo") {
		    financial.hasLogos = true;
		    return false;
		}
	    });
	}
    }

    financial.init();
}
RiseVision.Financial.prototype.init = function() {
    var self = this,
	params = {};

    this.financial = new RiseVision.Common.Financial.RealTime(this.displayID, this.instruments);

    if (this.useDefault) {
	this.getData();
    }
    else {
	//Load custom layout.
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
		    console.log("No Layout tag specified in custom layout file.");
		    return;
		}

		self.layout = data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue;
		self.getData();
	    }, params);
	}
    }
}
RiseVision.Financial.prototype.getData = function() {
    var self = this;

    this.financial.getData(this.requestedFields, this.hasLogos, this.isChain(), function(data, urls) {
	if (data) {
	    self.data = data;
	    self.urls = urls;
	    self.arrowCount = 0;

	    //Temporarily size the Gadget using the UserPrefs. Workaround for multi-page Presentation issue.
	    $("#container").width(prefs.getString("rsW"));
	    $("#container").height(prefs.getString("rsH"));

	    if (self.isLoading) {
		self.loadArrow(self.logosURL + "animated-green-arrow.gif");
		self.loadArrow(self.logosURL + "animated-red-arrow.gif");
	    }
	    else {
		//Only chains could potentially contain different instruments.
		if (self.isChain()) {
		    self.checkInstruments(false);
		}

		if (self.layoutURL) {
		    self.showCustomLayout();
		}
		else {
		    self.showDefaultLayout();
		}
	    }
	}
	else {
	    self.startTimer();
	}
    });
}
RiseVision.Financial.prototype.loadArrow = function(url) {
    var self = this,
	img = new Image();

    img.onload = function() {
	self.onArrowLoaded();
    }

    img.onerror = function() {
	self.onArrowLoaded();
    }

    img.src = url;
}
RiseVision.Financial.prototype.onArrowLoaded = function() {
    this.arrowCount++;

    if (this.arrowCount == 2) {
	if (this.layoutURL) {
	    this.showCustomLayout();
	}
	else {
	    this.showDefaultLayout();
	}
    }
}
RiseVision.Financial.prototype.showDefaultLayout = function() {
    var disclaimer = null,
	table = null;

    if (this.isLoading || this.isChain()) {
	this.selectedIndex = $(".selected").index();

	$("#container").empty();

	//Configure disclaimer.
	disclaimer = document.createElement("div");
	disclaimer.setAttribute("id", "disclaimer");
	disclaimer.setAttribute("class", "default");
	$("#container").append(disclaimer);

	//Configure table.
	table = document.createElement("table");
	table.setAttribute("id", "financial");
	table.setAttribute("class", "default page");
	$("#container").append(table);
    }

    this.initTable();
}
/* Custom layout may or may not be a table. Need to account for both possibilities. */
RiseVision.Financial.prototype.showCustomLayout = function() {
    var numRows = 0;

    if (this.isLoading || this.isChain()) {
	numRows = this.data.getNumberOfRows();

	$("#container").empty();
	$("#container").append(this.layout);

	for (var row = 0; row < numRows; row++) {
	    var parent = $(".repeat:first").parent();

	    if (row > 0) {
		$(parent).append($(".repeat:first").clone());
	    }
	}
    }

    this.initTable();
}
RiseVision.Financial.prototype.initTable = function() {
    var self = this,
	numRows = this.data.getNumberOfRows(),
	numCols = this.data.getNumberOfColumns();

    //The table data can be removed and re-added only for a chain.
    //Individual stocks have to have their rows updated since it is possible for only some stocks to be returned
    //by the Data Server depending on collection times (e.g. one stock within collection time, another not).
    if (this.isLoading || this.isChain()) {
	if (!this.isLoading) {
	    $(".dataTables_scrollBody").infiniteScroll.stop();
	}

	//Add table headings.
	if (numCols > 0) {
	    this.addHeadings();
	}

	//Add table rows.
	for (var row = 0; row < numRows; row++) {
	    if ($(".repeat").eq(row).length > 0) {
		this.addRow(row, $(".repeat").eq(row));
	    }
	    else {
		this.addRow(row, null);
	    }
	}

	if (this.selectedIndex != -1) {
	    $(".item").eq(this.selectedIndex).addClass("selected");
	}
    }
    else {
	//Update rows.
	this.updateRows();
    }

    this.formatFields();

    if (this.isLoading || this.isChain()) {
	this.sortConfig.aoColumnDefs = [];

	//Use oSettings.aoColumns.sWidth for datatables to size columns.
	$.each(this.fields, function(index, value) {
	    if (value.width) {
		self.sortConfig.aoColumnDefs.push({
		    "sWidth": value.width,
		    "aTargets": [index]
		});
	    }
	});

	$("#financial").dataTable(this.sortConfig);

	//TODO: Try setting padding as part of this.sortConfig to see if it prevents column alignment issues.
	//Row Padding
	$(".dataTables_scrollHead table thead tr th, td").css({
	    "padding-top": this.rowPadding,
	    "padding-bottom": this.rowPadding
	});

	//Column Padding
	$("table thead tr th, td").css({
	    "padding-left": this.colPadding,
	    "padding-right": this.colPadding
	});

	//First cell should have 10px of padding in front of it.
	$("table tr th:first-child, td:first-child").css({
	    "padding-left": "10px"
	});

	//Last cell should have 10px of padding after it.
	$("table tr th:last-child, td:last-child").css({
	    "padding-right": "10px"
	});

	//Configure disclaimer.
	$("#disclaimer").text("Market Data by Thomson Reuters - Delayed 20 Minutes");
	$("#disclaimer").css("font-family", this.disclaimerFont);

	if ((this.disclaimerLoc == "bottomRight") || (this.disclaimerLoc == "bottomLeft")) {
	    $("#disclaimer").addClass("bottom");

	    if (this.disclaimerLoc == "bottomRight") {
		$("#disclaimer").addClass("right");
	    }
	}
	else {
	    $("#container").addClass("fullScreen");
	    $("#disclaimer").addClass("top");

	    if (this.disclaimerLoc == "topRight") {
		$("#disclaimer").addClass("right");
	    }
	}

	//$(".dataTables_scrollBody").height(($("#container").outerHeight(true) - $("#disclaimer").height() - $(".dataTables_scrollHead").height()) / prefs.getInt("rsH") * 100 + "%");
	$(".dataTables_scrollBody").height($("#container").outerHeight() - $("#disclaimer").outerHeight() - $(".dataTables_scrollHead").outerHeight() + "px");
    }

    //Conditions
    $.each(this.fields, function(index, value) {
	if (value.condition == "changeUp" || value.condition == "changeDown") {
	    var results = self.financial.compare(value.field);

	     $.each(results, function(i, result) {
		var $cell = $("td." + value.field).eq(i);

		if (value.condition == "changeUp") {
		    if (result == 1) {
			$cell.addClass("changeUpIncrease");
		    }
		    else if (result == -1) {
			$cell.addClass("changeUpDecrease");
		    }
		    else {
			$cell.removeClass("changeUpIncrease changeUpDecrease");
		    }
		}
		else {
		    if (result == 1) {
			$cell.addClass("changeDownIncrease");
		    }
		    else if (result == -1) {
			$cell.addClass("changeDownDecrease");
		    }
		    else {
			$cell.removeClass("changeDownIncrease changeDownDecrease");
		    }
		}
	    });
	}
	else if (value.condition == "valuePositive" || value.condition == "valueNegative") {
	    var results = self.financial.checkSigns(value.field);

	    $.each(results, function(i, result) {
		var $cell = $("td." + value.field).eq(i);

		if (value.condition == "valuePositive") {
		    //Positive or 0
		    if (result == 1) {
			$cell.addClass("valuePositivePositive");
		    }
		    //Negative
		    else {
			$cell.addClass("valuePositiveNegative");
		    }
		}
		else {
		    //Positive or 0
		    if (result == 1) {
			$cell.addClass("valueNegativePositive");
		    }
		    //Negative
		    else {
			$cell.addClass("valueNegativeNegative");
		    }
		}
	    });
	}
    });

    //Initialize scrolling after conditions so that when scrolling by page, the cloned items will show the conditions as well.
    if (this.isLoading || this.isChain()) {
	$(".dataTables_scrollBody").infiniteScroll({
	    scrollBy: prefs.getString("scrollBy"),
	    direction: self.scrollDirection,
	    duration: prefs.getInt("scrollHold") * 1000,
	    speed: prefs.getString("scrollSpeed"),
	    swipingTimeout: prefs.getInt("scrollResumes") * 1000,
	    toggleOddEven: true
	})
	.bind("onLastItemScrolled", function(event) {
	    self.onLastItemScrolled.call(self, event);
	});
    }

    //Size container back to its original dimensions.
    $("#container").width("100%");
    $("#container").height("95%");

    if (this.isLoading) {
	this.isLoading = false;
	readyEvent();

	this.checkInstruments(true);
    }
    else {
	$(".dataTables_scrollBody").infiniteScroll.start();
    }

    this.startTimer();
}
RiseVision.Financial.prototype.addHeadings = function() {
    var self = this,
	tr = document.createElement("tr");

    //Add headings for data.
    $.each(this.fields, function(index, value) {
	var th = document.createElement("th");

	if (value.field == "logo") {
	    th.setAttribute("class", "logo");
	    $(th).html("Logo");
	}
	else if (value.field == "instrument") {
	    th.setAttribute("class", self.data.getColumnId(0));
	    $(th).html(self.data.getColumnLabel(0));
	}
	else {
	    th.setAttribute("class", self.data.getColumnId(self.financial.dataFields[value.field]));
	    $(th).html(self.data.getColumnLabel(self.financial.dataFields[value.field]));
	}

	$(th).addClass("heading_font-style");
	$(tr).append(th);
    });

    $("#financial").prepend($("<thead>").append(tr));
}
RiseVision.Financial.prototype.addRow = function(row, tr) {
    var self = this,
	logoIndex = -1,
	instruments,
	numCols = this.data.getNumberOfColumns();

    if (this.data.getFormattedValue(row, 0) == "INCORRECT_TYPE") {
	console.log("Chain could not be displayed. Please check that only one chain is being requested and that " +
	    "chains are not being requested together with stocks.");
    }
    else {
	if (tr == null) {
	    tr = document.createElement("tr");
	    tr.setAttribute("class", "item");
	    tr.setAttribute("data-alias", this.data.getFormattedValue(row, 0));
	    tr.setAttribute("data-code", this.data.getFormattedValue(row, this.financial.dataFields["code"]));
	}
	else {
	    tr.attr("data-alias", this.data.getFormattedValue(row, 0));
	    tr.attr("data-code", this.data.getFormattedValue(row, this.financial.dataFields["code"]));
	}

	//Add an event handler for when a row is clicked.
	$(tr).on("click", function(event) {
	    $("tr").removeClass("selected");
	    $(this).addClass("selected");
	    gadgets.rpc.call("", "instrumentSelected", null, $(this).attr("data-code"));
	});

	$.each(this.fields, function(index, value) {
	    var td = document.createElement("td");

	    //Remember the position of the logo column.
	    if (value.field == "logo") {
		logoIndex = index;
	    }
	    else if (value.field == "instrument") {
		td.setAttribute("class", "data_font-style " + self.data.getColumnId((0)));
		$(td).html(self.data.getFormattedValue(row, 0));
		$(tr).append(td);
	    }
	    else if (value.field == "tradeTime") {
		td.setAttribute("class", "data_font-style " + self.data.getColumnId(self.financial.dataFields[value.field]));
		$(td).html(self.data.getValue(row, self.financial.dataFields[value.field]));
		$(td).attr("data-value", self.data.getValue(row, self.financial.dataFields[value.field]));
		$(tr).append(td);
	    }
	    else {
		td.setAttribute("class", "data_font-style " + self.data.getColumnId(self.financial.dataFields[value.field]));
		$(td).html(self.data.getFormattedValue(row, self.financial.dataFields[value.field]));
		$(td).attr("data-value", self.data.getFormattedValue(row, self.financial.dataFields[value.field]));		//Issue 978
		$(tr).append(td);
	    }

	    //Add logo as background image last, so that we know what the height of the logo should be.
	    if ((logoIndex != -1) && (index == self.fields.length - 1)) {
		td = document.createElement("td");
		td.setAttribute("class", "data_font-style logo");

		if (self.urls[row] != null) {
		    $img = $("<img>");
		    $img.attr("src", self.urls[row]);
		    $img.height(0);	//For now so that we can determine the true height of the row without taking the logo into account.
		    $(td).append($img);
		}
		else {
		    $(td).html(self.data.getFormattedValue(row, self.financial.dataFields["name"]));
		}

		$(tr).find("td").eq(logoIndex).before(td);
	    }
	});

	if (this.useDefault) {
	    $("#financial").append(tr);
	}

	$(".logo img").height($(tr).height());

	//If this is a non-permissioned instrument, don't request it again.
	if (this.data.getFormattedValue(row, self.financial.dataFields["name"]) == "N/P") {
	    instruments = this.splitInstruments();
	    instruments.splice(row, 1);
	    this.financial.setInstruments(instruments.join());
	}
    }
}
//Update the rows in place for all instruments returned by the data server.
RiseVision.Financial.prototype.updateRows = function () {
    var $tr,
	self = this,
	newRows = [],
	numRows = this.data.getNumberOfRows(),
	numCols = this.data.getNumberOfColumns();

    //Try to find a match for each instrument in the table.
    for (var row = 0; row < numRows; row++) {
	$tr = $("tr[data-alias='" + this.data.getFormattedValue(row, 0) + "']:first");

	//Issue 736, 755 - Unable to locate row as data-alias is ... or N/A. Find first ... or N/A and update that row.
	//Issue 978 - This could also occur if the request to the data server only returned a partial list of stocks because the
	//others were outside of their collection times.
	if ($tr.length == 0) {
	    $tr = $("tr[data-alias='N/A']");

	    if ($tr.length == 0) {
		$tr = $("tr[data-alias='...']");
	    }

	    if ($tr.length > 0) {	//Issue 978
		$tr.attr("data-alias", this.data.getFormattedValue(row, 0));
		$tr.attr("data-code", this.data.getFormattedValue(row, numCols - 1));
	    }
	}

	//Update row.
	if ($tr.length > 0) {
	    $.each(this.fields, function(index, value) {
		var $td = $tr.find("." + value.field);

		//Update logo.
		if (value.field == "logo") {
		    if (self.urls[row] != null) {
			$img = $("<img>");
			$img.attr("src", self.urls[row]);
			$img.height($tr.height());
			$td.find("div").append($img);
		    }
		    else {
			$td.html(self.data.getFormattedValue(row, self.financial.dataFields["name"]));
		    }
		}
		else if (value.field == "instrument") {
		    $td.html(self.data.getFormattedValue(row, 0));
		}
		else {
		    $td.html(self.data.getFormattedValue(row, self.financial.dataFields[value.field]));
		    $td.attr("data-value", self.data.getFormattedValue(row, self.financial.dataFields[value.field]));	//Issue 978
		}
	    });
	}
    }
}
RiseVision.Financial.prototype.formatFields = function() {
    var self = this;

    $.each(this.fields, function(index, value) {
	if (value.field) {
	    var $fields = $("td." + value.field),
		width;

	    if ($fields.length > 0) {
		if (!$fields.hasClass("updated")) {
		    if (self.isLoading || self.isChain()) {
			//Header Text
			if (value.header) {
			    $("th").eq(index).html(value.header);
			}

			if (self.isLoading) {
			    if (value.width) {
				width = parseInt(value.width);
				width = width / prefs.getInt("rsW") * 100 + "%";
				value.width = width;
			    }
			}

			$("th").eq(index).css("text-align", value.alignment);
		    }

		    $fields.css("text-align", value.alignment);

		    //Decimals and Sign
		    $fields.each(function(i) {
			var number, height;

			if ($(this).text() && !isNaN($(this).text())) {
			    $(this).text(parseFloat($(this).text()).toFixed(value.decimals));

			    //Issue 978 Start - The value in data-value is the true value together with its sign.
			    number = $(this).attr("data-value");

			    //If there is no old value, use the current value.
			    if (!number) {
				number = $(this).text();
			    }
			    //Issue 978 End

			    if (value.sign == "none") {
				$(this).html(self.addCommas(Math.abs(number).toFixed(value.decimals)));
			    }
			    else if (value.sign == "minus") {
				$(this).html(self.addCommas(number));
			    }
			    else if (value.sign == "plusMinus") {
				if (parseFloat(number) > 0) {
				    $(this).html("+" + self.addCommas(number));
				}
			    }
			    else if (value.sign == "parentheses") {
				if (parseFloat(number) < 0) {
				    $(this).html("(" + self.addCommas(Math.abs(number).toFixed(value.decimals)) + ")");
				}
			    }
			    //Add img tags to show arrows.
			    else if (value.sign == "arrow") {
				var $img = $("<img class='arrow'>");

				$img.height($(this).height());

				//Issue 708 - Eliminate - sign for negative numbers, add commas.
				$(this).html(self.addCommas(Math.abs(number).toFixed(value.decimals)));

				if (parseFloat(number) < 0) {
				    $img.attr("src", self.logosURL + "animated-red-arrow.gif");
				}
				else if (parseFloat(number) >= 0) {
				    $img.attr("src", self.logosURL + "animated-green-arrow.gif");
				}

				$(this).prepend($img);
			    }
			}
		    });

		    //Keep track of which cells have been updated, as it's possible that some cells may have been selected multiple times in the Gadget settings.
		    $fields.addClass("updated");
		}
	    }
	}
    });

    $("td").removeClass("updated");
}
RiseVision.Financial.prototype.addCommas = function(number)
{
    number += '';
    var x = number.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var regex = /(\d+)(\d{3})/;

    while (regex.test(x1)) {
	x1 = x1.replace(regex, '$1' + ',' + '$2');
    }

    return x1 + x2;
}
RiseVision.Financial.prototype.onLastItemScrolled = function(e) {
    if (this.scrollBy != "page") {
	doneEvent();
    }

    if (this.checkForUpdates) {
	if (this.scrollBy == "page") {
	    //$(".dataTables_scrollBody").infiniteScroll.stop();
	    this.checkForUpdates = false;
	    this.getData();
	}
	else {
	    this.checkForUpdates = false;
	    this.getData();
	}
    }
}
RiseVision.Financial.prototype.startTimer = function() {
    var self = this;

    setTimeout(function() {
	//If we're not scrolling, or there is not enough content to scroll, check for updates right away.
	if ((self.scrollDirection == "none") || (!$(".dataTables_scrollBody").infiniteScroll.canScroll())) {
	    self.getData();
	}
	else {
	    self.checkForUpdates = true;
	}
    }, this.updateInterval);
}
RiseVision.Financial.prototype.splitInstruments = function() {
    var instruments = this.instruments.split(",");

    $.each(instruments, function(index, value) {
	instruments[index] = $.trim(instruments[index]);
    });

    return instruments;
}
RiseVision.Financial.prototype.isChain = function() {
    var instruments = this.splitInstruments();

    //This is a chain if there is only one instrument being requested, but multiple rows of data are returned.
    if (this.data != null) {
	return instruments.length == 1 && this.data.getNumberOfRows() > 1;
    }
    else {
	return false;
    }
}
RiseVision.Financial.prototype.play = function() {
    $(".dataTables_scrollBody").infiniteScroll.start();
}
RiseVision.Financial.prototype.pause = function() {
    $(".dataTables_scrollBody").infiniteScroll.pause();
}