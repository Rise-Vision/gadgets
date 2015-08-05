"use strict";

/* Primary functionality for the Directory Gadget. */
var RiseVision = RiseVision || {};
RiseVision.Directory = {};
RiseVision.Directory.Settings = {};
RiseVision.Directory.Controller = {};

/*
 * The Settings class handles the display and behavior of Gadget settings in the editor.
 */
 RiseVision.Directory.Settings = function() {
	this.settings = new RiseVision.Common.Settings();
	this.picker = new RiseVision.Common.Picker();
	this.viz = new RiseVision.Common.Visualization();
	this.baseURL = "";
	this.headerRows = "0";
	this.range = "";
 }
//Populate settings from saved values.
RiseVision.Directory.Settings.prototype.initSettings = function() {
	var self = this;

	//Add event handlers.
	$("#googleDrive").click(function() {
		self.picker.showPicker($(this).data("for"), google.picker.ViewId.SPREADSHEETS);
	});

	$("input[name='cells']").change(function() {
		var val = $(this).val();

		if (val == "range") {
			self.range = $("#range").val();
			$("#rangeContainer").show();
		}
		else {
			self.range = "";
			$("#rangeContainer").hide();
		}

		self.showDataURLOptions();
	});

	$("#range").blur(function() {
		self.range = $(this).val();
		self.showDataURLOptions();
	});

	$("#headerRows").change(function() {
		self.headerRows = $(this).val();
		self.showDataURLOptions();
	});

	$("#sheet").change(function() {
		self.showDataURLOptions();
	});

	$("#cardImage").on("blur", function(event) {
		var cardImage = $(this).val();

		if (cardImage && (isNaN(cardImage))) {
			$("li.cardImage").show();
		}
		else {
			$("li.cardImage").hide();
		}
	});

	$("#cardTitle").on("blur", function(event) {
		var cardTitle = $(this).val();

		if (cardTitle && (isNaN(cardTitle))) {
			$("li.cardTitle").show();
		}
		else {
			$("li.cardTitle").hide();
		}
	});

	$("#cardSubtitle").on("blur", function(event) {
		var cardSubtitle = $(this).val();

		if (cardSubtitle && (isNaN(cardSubtitle))) {
			$("li.cardSubtitle").show();
		}
		else {
			$("li.cardSubtitle").hide();
		}
	});

	$("#cardDetail").on("blur", function(event) {
		var cardDetail = $(this).val();

		if (cardDetail && (isNaN(cardDetail))) {
			$("li.cardDetail").show();
		}
		else {
			$("li.cardDetail").hide();
		}
	});

	$(".colorPicker").on("click", function(event) {
		directorySettings.showColorPicker($(this).data("for"));
	});

	$(".fontSelector").on("click", function(event) {
		directorySettings.showFontSelector($(this).data("for"));
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

	$("#nav").on("change", function(event) {
		var nav = $(this).val();

		if (nav == "none") {
			$("li.nav").hide();
		}
		else {
			$("li.nav").show();
		}

		if ((nav == "left") || (nav == "right")) {
			$("li.horizontal").hide();
		}
		else {
			$("li.horizontal").show();
		}
	});

	$("#colCount").on("change", function(event) {
		directorySettings.buildColumnsUI();
	});

	$("#showCard").on("click", function(event) {
		if ($(this).is(":checked")) {
			$("li.card").show();
		}
		else {
			$("li.card").hide();
		}
	});

	$("#cardUseDefault").on("click", function(event) {
		if ($(this).is(":checked")) {
			$("li.cardLayoutURL").hide();
		}
		else {
			$("li.cardLayoutURL").show();
		}
	});

	$("#useDefault").on("click", function(event) {
		if ($(this).is(":checked")) {
			$("li.layoutURL").hide();
		}
		else {
			$("li.layoutURL").show();
		}
	});

	//If Data URL has a value, then this Gadget has been saved before. Restore the saved settings.
	if (prefs.getString("url")) {
		$("#url").val(prefs.getString("url"));

	//Get metadata from the spreadsheet if docID exists. It will only exist if the spreadsheet
	//has been selected using Google Picker.
	if (prefs.getString("docID") != "") {
		this.docID = prefs.getString("docID");
		this.picker.getSheets({
			"docID": prefs.getString("docID"),
			"callback": function(sheets) {
				if (sheets != null) {
					self.onSheetsLoaded(sheets);
					$("#sheet").val(unescape(prefs.getString("sheet")));
					$("li.more").show();
				}
			}
		});

		$("input[type='radio'][name='cells']").each(function() {
			if ($(this).val() == prefs.getString("cells")) {
				$(this).attr("checked", "checked");

				if ($(this).val() == "range") {
					$("#rangeContainer").show();
				}
			}
		});

		$("#range").val(prefs.getString("range"));
		$("#headerRows").val(prefs.getString("headerRows"));
	}

	$("#refresh").val(prefs.getInt("refresh"));
	$("#imageCol").val(prefs.getString("imageCol"));
	$("#scrollDirection").val(prefs.getString("scrollDirection"));
	$("#scrollBy").val(prefs.getString("scrollBy"));
	$("#scrollHold").val(prefs.getInt("scrollHold"));
	$("#scrollSpeed").val(prefs.getString("scrollSpeed"));
	$("#scrollResumes").val(prefs.getInt("scrollResumes"));
	$("#rowPadding").val(prefs.getInt("rowPadding"));
	$("#nav").val(prefs.getString("nav"));
	$("#showAll").val(prefs.getInt("showAll"));
	$("#navMargin").val(prefs.getInt("navMargin"));
	$("#rowHeight").val(prefs.getInt("rowHeight"));
	$("#colPadding").val(prefs.getInt("colPadding"));
	$("#colCount").val(prefs.getInt("colCount"));
	$("#showCard").attr("checked", prefs.getBool("showCard"));
	$("#useDefault").attr("checked", prefs.getBool("useDefault"));
	$("#layoutURL").val(prefs.getString("layoutURL"));

	//Populate colors and show color as background of text box.
	this.populateColor($("#rowColor"), prefs.getString("rowColor"));
	this.populateColor($("#altRowColor"), prefs.getString("altRowColor"));
	this.populateColor($("#bgColor"), prefs.getString("bgColor"));
	this.populateColor($("#navColor"), prefs.getString("navColor"));
	this.populateColor($("#navBgColor"), prefs.getString("navBgColor"));
	this.populateColor($("#headingColor"), prefs.getString("headingColor"));;
	this.populateColor($("#headingBgColor"), prefs.getString("headingBgColor"));
	this.populateColor($("#headingSortColor"), prefs.getString("headingSortColor"));
}

	//Build UI for columns before populating.
	$("#colCount").trigger("change");

	//Request additional parameters from the Viewer.
	gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
		if (result) {
			result = JSON.parse(result);

		//Populate fonts.
		$("#data_font-style").text(result["data_font"]);
		$("#data_font-style").data("css", result["data_font-style"]);
		$("#nav_font-style").text(result["nav_font"]);
		$("#nav_font-style").data("css", result["nav_font-style"]);
		$("#heading_font-style").text(result["heading_font"]);
		$("#heading_font-style").data("css", result["heading_font-style"]);

		//Populate card settings.
		$("#cardLocation").val(result["cardLocation"]);
		$("#cardWidth").val(result["cardWidth"]);
		$("#cardTimeout").val(result["cardTimeout"]);
		$("#cardBorder").attr("checked", result["cardBorder"]);
		$("#cardImage").val(result["cardImage"]);
		$("#cardImageAlign").val(result["cardImageAlign"]);
		$("#cardImageWidth").val(result["cardImageWidth"]);
		$("#cardImagePadding").val(result["cardImagePadding"]);
		$("#cardTitle").val(result["cardTitle"]);
		$("#cardTitle_font-style").text(result["cardTitle_font"]);
		$("#cardTitle_font-style").data("css", result["cardTitle_font-style"]);
		$("#cardTitlePadding").val(result["cardTitlePadding"]);
		$("#cardSubtitle").val(result["cardSubtitle"]);
		$("#cardSubtitle_font-style").text(result["cardSubtitle_font"]);
		$("#cardSubtitle_font-style").data("css", result["cardSubtitle_font-style"]);
		$("#cardSubtitlePadding").val(result["cardSubtitlePadding"]);
		$("#cardDetail").val(result["cardDetail"]);
		$("#cardDetail_font-style").text(result["cardDetail_font"]);
		$("#cardDetail_font-style").data("css", result["cardDetail_font-style"]);
		$("#cardDetailPadding").val(result["cardDetailPadding"]);
		$("#cardUseDefault").attr("checked", result["cardUseDefault"]);
		$("#cardLayoutURL").val(result["cardLayoutURL"]);

		//Populate colors and show color as background of text box.
		self.populateColor($("#cardBgColor"), result["cardBgColor"]);
		self.populateColor($("#closeBorderColor"), result["closeBorderColor"]);
		self.populateColor($("#closeFillColor"), result["closeFillColor"]);

		//Populate columns.
		for (var i = 0; i < parseInt($("#colCount").val()); i++) {
			self.initColumns(i + 1, result.columns[i]);
		}
	}

	//Manually trigger event handlers so that the visibility of fields can be set.
	$("#cardImage").trigger("blur");
	$("#cardTitle").trigger("blur");
	$("#cardSubtitle").trigger("blur");
	$("#cardDetail").trigger("blur");
	$("#scrollDirection").trigger("change");
	$("#scrollBy").trigger("change");
	$("#nav").trigger("change");
	$("#showCard").triggerHandler("click");
	$("#cardUseDefault").triggerHandler("click");
	$("#useDefault").triggerHandler("click");
	$("#settings").show();
});
}
RiseVision.Directory.Settings.prototype.populateColor = function($element, color) {
	$element.val(color);
	$element.css("background-color", color);
}
RiseVision.Directory.Settings.prototype.initColumns = function(index, column) {
	$("#column" + index).val(column.column);
	$("#alignment" + index).val(column.alignment);
	$("#width" + index).val(column.width);
	$("#headerText" + index).val(column.header);
}
//Add UI for column format settings.
RiseVision.Directory.Settings.prototype.buildColumnsUI = function() {
	var colCount = parseInt($("#colCount").val()),
	conditionalCount = $(".column").length;

	//Hide all fields related to column formatting.
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
	//Not enough conditional column formatting settings.
	else {
		//Show all existing settings.
		$(".formatting").show();

		for (var i = conditionalCount + 1; i <= colCount; i++) {
			var li = document.createElement("li"),
			ol = document.createElement("ol");

			ol.setAttribute("class", "formatting drillDown");

			$(ol)
			.append($("<li></li>")
				.append("<label for='column" + i + "'>" +
					"<a href='#' class='tooltip'>Column*:<span>Column of the spreadsheet that the formatting should apply to (e.g. A or AW)</span></a>" +
					"</label>")
				.append("<input id='column" + i + "' name='column" + i + "' type='text' class='column short' />"))
			.append($("<li></li>")
				.append("<label for='alignment" + i + "'>Alignment:</label>")
				.append("<select id='alignment" + i + "' name='alignment" + i + "' class='alignment short'>" +
					"<option value='left' selected='selected'>Left</option>" +
					"<option value='center'>Center</option>" +
					"<option value='right'>Right</option>" +
					"</select>"))
			.append($("<li></li>")
				.append("<label for='width" + i + "'>Width (pixels):</label>")
				.append("<input id='width" + i + "' name='width" + i + "' type='text' class='width short' value='100' />"))
			.append($("<li></li>")
				.append("<label for='headerText" + i + i + "'>" +
					"<a href='#' class='tooltip'>Header Text:<span>Custom header text. If not specified, the header from the spreadsheet will be used.</span></a>" +
					"</label>")
				.append("<input id='headerText" + i + "' name='headerText" + i + "' type='text' class='headerText short' />"));

			$(li).append(ol);

		//Insert into DOM.
		$(".horizontal").append(li);
	}
}
}
}
RiseVision.Directory.Settings.prototype.showColorPicker = function(id) {
	gadgets.rpc.call("", "rscmd_openColorPicker", null, id, $("#" + id).val());
}
RiseVision.Directory.Settings.prototype.showFontSelector = function(id) {
	gadgets.rpc.call("", "rscmd_openFontSelector", null, id, $("#" + id).data("css"));
}
RiseVision.Directory.Settings.prototype.setColor = function(id, color) {
	$("#" + id).val(color);
	$("#" + id).css("background-color", color);
}
RiseVision.Directory.Settings.prototype.setFont = function(id, css, style) {
	$("#" + id).data("css", css);
	$("#" + id).text(style);
}
RiseVision.Directory.Settings.prototype.setURL = function(id, doc) {
	var request;

	$("#" + id).val("");

	directorySettings.picker.getSheets({
		"docID": doc.id,
		"callback": function(sheets) {
			if (sheets != null) {
				directorySettings.docID = doc.id;
				directorySettings.onSheetsLoaded(sheets);
				directorySettings.showDataURLOptions();
			}
		}
	});
}
RiseVision.Directory.Settings.prototype.onSheetsLoaded = function(sheets) {
	$("#sheet").empty();

	for (var i = 0; i < sheets.length; i++) {
		document.getElementById("sheet").add(sheets[i]);
	}
}
RiseVision.Directory.Settings.prototype.showDataURLOptions = function() {
	var url = this.picker.getURL({
		"baseURL": $("#sheet").val(),
		"headerRows": this.headerRows,
		"range": this.range
	});

	$(".errors").empty();
	$(".errors").css({ display: "none" });
	$("#url").val(url);
	$("li.more").show();
}
RiseVision.Directory.Settings.prototype.getSettings = function() {
	var errorFound = false;
	var errors = document.getElementsByClassName("errors")[0];
	var nav = $("#nav").val();
	var params = "";
	var settings = null;
	var selected;

	$(".errors").empty();
	$(".errors").css({ display: "none" });

	//Validate all settings.
	errorFound = (directorySettings.settings.validateRequired($("#url"), errors, "Data URL")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#refresh"), errors, "Data Refresh")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#scrollHold"), errors, "Scroll Hold")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#scrollResumes"), errors, "Scroll Resumes")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#rowPadding"), errors, "Row Padding")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#showAll"), errors, "Return to All after x seconds")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#navMargin"), errors, "Margin")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#rowHeight"), errors, "Row Height")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#colPadding"), errors, "Column Padding")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardWidth"), errors, "Pop Up Card Width")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardTimeout"), errors, "Timeout")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardImageWidth"), errors, "Pop Up Card Image Width")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardImagePadding"), errors, "Pop Up Card Image Padding")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardTitlePadding"), errors, "Title Column Padding")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardSubtitlePadding"), errors, "Subtitle Column Padding")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateNumeric($("#cardDetailPadding"), errors, "Detail Column Padding")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateRequired($("#cardLayoutURL"), errors, "Card Layout URL")) ? true : errorFound;
	errorFound = (directorySettings.settings.validateRequired($("#layoutURL"), errors, "Layout URL")) ? true : errorFound;

	if (parseInt($("#colCount").val()) > 0) {
		$(".column").each(function(i) {
			errorFound = (directorySettings.settings.validateRequired($(this), errors, "Column")) ? true : errorFound;
		});

		$(".width").each(function(i) {
			errorFound = (directorySettings.settings.validateNumeric($(this), errors, "Column Width")) ? true : errorFound;
		});
	}

	if (errorFound) {
		$(".errors").css("display", "inline-block");
		$("#wrapper").scrollTop(0);

		return null;
	}
	else {
		//Construct parameters string to pass to RVA.
		params = "up_url=" + escape($("#url").val());

		//Only save spreadsheet metadata settings if file has been selected using Google Picker(i.e. if docID has a value).
		if (directorySettings.docID != null) {
			params += "&up_docID=" + directorySettings.docID;

			//Entire Sheet or Range
			selected = $("input[type='radio'][name='cells']:checked");

			if (selected.length > 0) {
				params += "&up_cells=" + selected.val() +
				"&up_range=" + $("#range").val();
			}

			params += "&up_sheet=" + escape($("#sheet").val()) +
			"&up_headerRows=" + $("#headerRows").val();
		}

		params += "&up_refresh=" + $("#refresh").val() +
			"&up_imageCol=" + $("#imageCol").val() +
			"&up_rowColor=" + $("#rowColor").val() +
			"&up_altRowColor=" + $("#altRowColor").val() +
			"&up_bgColor=" + $("#bgColor").val() +
			"&up_rowPadding=" + $("#rowPadding").val() +
			"&up_nav=" + nav +
			"&up_showAll=" + $("#showAll").val() +
			"&up_scrollDirection=" + $("#scrollDirection").val() +
			"&up_scrollBy=" + $("#scrollBy").val() +
			"&up_scrollSpeed=" + $("#scrollSpeed").val() +
			"&up_scrollResumes=" + $("#scrollResumes").val() +
			"&up_scrollHold=" + $("#scrollHold").val() +
			"&up_navMargin=" + $("#navMargin").val() +
			"&up_navColor=" + $("#navColor").val() +
			"&up_navBgColor=" + $("#navBgColor").val() +
			"&up_headingColor=" + $("#headingColor").val() +
			"&up_headingBgColor=" + $("#headingBgColor").val() +
			"&up_headingSortColor=" + $("#headingSortColor").val() +
			"&up_rowHeight=" + $("#rowHeight").val() +
			"&up_colPadding=" + $("#colPadding").val() +
			"&up_colCount=" + $("#colCount").val();

		if ($("#showCard").is(":checked")) {
			params += "&up_showCard=true";
		}
		else {
			params += "&up_showCard=false";
		}

		if ($("#useDefault").is(":checked")) {
			params += "&up_useDefault=true";
		}
		else {
			params += "&up_useDefault=false";
		}

		params += "&up_layoutURL=" + escape($("#layoutURL").val());

		settings = {
			"params": params,
			"additionalParams": JSON.stringify(directorySettings.saveAdditionalParams())
		};

		gadgets.rpc.call("", "rscmd_saveSettings", null, settings);
	}
}
RiseVision.Directory.Settings.prototype.saveAdditionalParams = function() {
	var additionalParams = {},
	columns = [];

	additionalParams["heading_font"] = $("#heading_font-style").text();
	additionalParams["heading_font-style"] = $("#heading_font-style").data("css");
	additionalParams["data_font"] = $("#data_font-style").text();
	additionalParams["data_font-style"] = $("#data_font-style").data("css");
	additionalParams["nav_font"] = $("#nav_font-style").text();
	additionalParams["nav_font-style"] = $("#nav_font-style").data("css");

	//Save Pop Up Card settings.
	additionalParams["cardLocation"] = $("#cardLocation").val();
	additionalParams["cardWidth"] = $("#cardWidth").val();
	additionalParams["cardTimeout"] = $("#cardTimeout").val();

	if ($("#cardBorder").is(":checked")) {
		additionalParams["cardBorder"] = true;
	}
	else {
		additionalParams["cardBorder"] = false;
	}

	additionalParams["cardBgColor"] = $("#cardBgColor").val();
	additionalParams["cardImage"] = $("#cardImage").val();
	additionalParams["cardImageAlign"] = $("#cardImageAlign").val();
	additionalParams["cardImageWidth"] = $("#cardImageWidth").val();
	additionalParams["cardImagePadding"] = $("#cardImagePadding").val();
	additionalParams["closeBorderColor"] = $("#closeBorderColor").val();
	additionalParams["closeFillColor"] = $("#closeFillColor").val();
	additionalParams["cardTitle"] = $("#cardTitle").val();
	additionalParams["cardTitle_font"] = $("#cardTitle_font-style").text();
	additionalParams["cardTitle_font-style"] = $("#cardTitle_font-style").data("css");
	additionalParams["cardTitlePadding"] = $("#cardTitlePadding").val();
	additionalParams["cardSubtitle"] = $("#cardSubtitle").val();
	additionalParams["cardSubtitle_font"] = $("#cardSubtitle_font-style").text();
	additionalParams["cardSubtitle_font-style"] = $("#cardSubtitle_font-style").data("css");
	additionalParams["cardSubtitlePadding"] = $("#cardSubtitlePadding").val();
	additionalParams["cardDetail"] = $("#cardDetail").val();
	additionalParams["cardDetail_font"] = $("#cardDetail_font-style").text();
	additionalParams["cardDetail_font-style"] = $("#cardDetail_font-style").data("css");
	additionalParams["cardDetailPadding"] = $("#cardDetailPadding").val();

	if ($("#cardUseDefault").is(":checked")) {
		additionalParams["cardUseDefault"] = true;
	}
	else {
		additionalParams["cardUseDefault"] = false;
	}

	additionalParams["cardLayoutURL"] = $("#cardLayoutURL").val();

	for (var i = 0; i < parseInt($("#colCount").val()); i++) {
		columns.push(directorySettings.saveFormatSettings(i + 1, columns));
	}

	additionalParams["columns"] = columns;

	return additionalParams;
}
RiseVision.Directory.Settings.prototype.saveFormatSettings = function(i) {
	return {
		"column": $("#column" + i).val(),
		"alignment": $("#alignment" + i).val(),
		"width": $("#width" + i).val(),
		"header": $("#headerText" + i).val()
	};
}
/* Settings End */

/* Functionality Start */
RiseVision.Directory.Controller = function() {
	this.url = prefs.getString("url");
	this.refresh = prefs.getInt("refresh");
	this.imageCol = prefs.getString("imageCol").toUpperCase();
	this.rowPadding = prefs.getInt("rowPadding") / 2 + "px";
	this.colPadding = prefs.getInt("colPadding") / 2 + "px";
	this.nav = prefs.getString("nav");
	this.showAll = prefs.getInt("showAll") * 1000;
	this.useDefault = prefs.getBool("useDefault");

	if (this.useDefault) {
		this.layoutURL = "";
	}
	else {
		this.layoutURL = prefs.getString("layoutURL");
	}

	this.imageIndex = -1;
	this.cardImageIndex = -1;
	this.cardTitleIndex = -1;
	this.cardSubtitleIndex = -1;
	this.cardDetailIndex = -1;
	this.imageTotal = 0;
	this.isLoading = true;
	this.isSwiping = false;
	this.isTable = false;
	this.column = "A";
	this.columns = {};
	this.sortIndex = 0;
	this.sortDirection = "asc";
	this.sortConfig = {
		"bDestroy": true,
		"bFilter": false,
		"bInfo": false,
		"bLengthChange": false,
		"bPaginate": false,
		"sScrollY": "500px"	//Needed just to force table structure conducive to sorting.
	};

	this.viz = new RiseVision.Common.Visualization();
	this.verticalLayout = "//s3.amazonaws.com/Gadget-Directory/css/Vertical.css";
	this.horizontalLayout = "//s3.amazonaws.com/Gadget-Directory/css/Horizontal.css";
}
RiseVision.Directory.Controller.prototype.getAdditionalParams = function(name, value) {
	if (name == "additionalParams") {
		if (value) {
			var styleNode = document.createElement("style");

			value = JSON.parse(value);

		//Inject CSS font styles into the DOM.
		styleNode.appendChild(document.createTextNode(value["heading_font-style"]));
		styleNode.appendChild(document.createTextNode(value["data_font-style"]));
		styleNode.appendChild(document.createTextNode(value["nav_font-style"]));
		styleNode.appendChild(document.createTextNode(value["cardTitle_font-style"]));
		styleNode.appendChild(document.createTextNode(value["cardSubtitle_font-style"]));
		styleNode.appendChild(document.createTextNode(value["cardDetail_font-style"]));
		styleNode.appendChild(document.createTextNode("#nav ul li a:active, #nav ul li a:visited" + value["nav_font-style"]));
		document.getElementsByTagName("head")[0].appendChild(styleNode);

		//Save other parameters in variables so that they can be used later.
		controller.columns = value.columns;
		controller.cardLocation = value.cardLocation;
		controller.cardWidth = value.cardWidth;
		controller.cardTimeout = value.cardTimeout * 1000;
		controller.cardBorder = value.cardBorder;
		controller.cardBgColor = value.cardBgColor;

		if (value.cardImage) {
			controller.cardImage = value.cardImage.toUpperCase();
		}

		controller.cardImageAlign = value.cardImageAlign;
		controller.cardImageWidth = value.cardImageWidth;
		controller.cardImagePadding = value.cardImagePadding;

		controller.closeBorderColor = value.closeBorderColor;
		controller.closeFillColor = value.closeFillColor;

		if (value.cardTitle) {
			controller.cardTitle = value.cardTitle.toUpperCase();
		}

		controller.cardTitlePadding = value.cardTitlePadding;

		if (value.cardSubtitle) {
			controller.cardSubtitle = value.cardSubtitle.toUpperCase();
		}

		controller.cardSubtitlePadding = value.cardSubtitlePadding;

		if (value.cardDetail) {
			controller.cardDetail = value.cardDetail.toUpperCase();
		}

		controller.cardDetailPadding = value.cardDetailPadding;
		controller.cardUseDefault = value.cardUseDefault;
		controller.cardLayoutURL = value.cardLayoutURL;
	}
}

controller.init();
}
//Load the layout and CSS files.
RiseVision.Directory.Controller.prototype.init = function() {
	var self = this,
	params = {},
	link = document.createElement("link");

	if (this.useDefault) {
		if (this.isVerticalLayout()) {
			RiseVision.Common.Utility.loadCSS(this.verticalLayout);
		}
	//Horizontal layout
	else {
		RiseVision.Common.Utility.loadCSS(this.horizontalLayout);
	}

	if (self.cardUseDefault) {
		self.getListings("all");
	}
	else {
		self.loadCustomCard();
	}
}
else {
	//Load custom layout.
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

		self.directory = data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue;

		if (self.cardUseDefault) {
			self.getListings("all");
		}
		else {
			self.loadCustomCard();
		}
	}, params);
}
}
//Load custom layout for the Pop Up Card.
RiseVision.Directory.Controller.prototype.loadCustomCard = function() {
	var params = {},
	self = this;

	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
	gadgets.io.makeRequest(this.cardLayoutURL, function(obj) {
		var data = obj.data;

		if (data.getElementsByTagName("Style").length > 0) {
			var head = document.getElementsByTagName("head")[0],
			style = document.createElement("style");

			style.type = "text/css";
			style.innerHTML = data.getElementsByTagName("Style")[0].childNodes[1].nodeValue;
			head.appendChild(style);
		}

	//Remove UI for default card and append custom card UI instead..
	$("#card.default").remove();
	$("#container").append(data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue);
	self.getListings("all");
}, params);
}
RiseVision.Directory.Controller.prototype.configureNavigation = function($element) {
	var self = this;

	$element.alphaNav({
		position: prefs.getString("nav"),
		margin: prefs.getInt("navMargin"),
		selectedColor: prefs.getString("navColor"),
		selectedBackground: prefs.getString("navBgColor"),
		onclick: function(letter) {
			self.onAlphaNavClicked(letter);
		}
	})
}
RiseVision.Directory.Controller.prototype.onAlphaNavClicked = function(letter) {
	clearTimeout(this.showAllTimer);

	//Remember the sort column and direction.
	if (this.isTable) {
		var sortColumn = null;

	//Get the column that has been sorted.
	if ($(".sorting_asc").length != 0) {
		sortColumn = $(".sorting_asc");
		this.sortDirection = "asc";
	}
	else if ($(".sorting_desc").length != 0) {
		sortColumn = $(".sorting_desc");
		this.sortDirection = "desc";
	}

	//Get the index of the column that has been sorted.
	if (sortColumn && sortColumn.length > 0) {
		if ($(".dataTables_scrollHead th").index($(".sorting_asc")) >= 0) {
			this.sortIndex = $(".dataTables_scrollHead th").index($(".sorting_asc"));
		}
		else {
			this.sortIndex = $(".dataTables_scrollHead th").index($(".sorting_desc"));
		}
	}
}

this.getListings(letter);
}
RiseVision.Directory.Controller.prototype.getListings = function(letter) {
	var self = this,
	queryString = "select *",
	settings = null;

	//Gadget Issue 671 - Temporarily size the Gadget using the UserPrefs.
	$("#container").width(prefs.getString("rsW"));
	$("#container").height(prefs.getString("rsH"));

	if ((letter != "all") && (this.nav != "none")) {
		if (this.isTable && this.hasHeadings()) {
		//The navigation applies to the currently selected column.
		if ($(".dataTables_scrollHeadInner .sorting_asc").length == 1) {
			this.column = $(".dataTables_scrollHeadInner .sorting_asc").attr("id");
		}
		else if ($(".dataTables_scrollHeadInner .sorting_desc").length == 1) {
			this.column = $(".dataTables_scrollHeadInner .sorting_desc").attr("id");
		}
	}

	//Case insensitive search.
	queryString = queryString + " where " + this.column + " starts with upper('" + letter + "') or " + this.column + " starts with lower('" + letter + "')";
}

settings = {
	url: this.url,
	refreshInterval: this.refresh,
	queryString: queryString,
	callback: function(data) {
		//Issue 810
		if (data != null) {
			var numRows = data.getNumberOfRows(),
			numCols = data.getNumberOfColumns(),
			col, id;

			self.data = data;
			self.imagesLoaded = 0;
			self.cols = [];

		//Display a message if no data was found.
		if (numRows == 0) {
			$("#scrollContainer").infiniteScroll.stop();
			$("#scrollContainer").empty();
			$("#scrollContainer").append("<div class='noData'>No matching records found</div>");

			if (self.isLoading) {
				readyEvent();
			}
			else {
				self.startShowAllTimer();
			}
		}
		else {
			for (col = 0; col < numCols; col++) {
				//self.cols.push(self.getColumnId(col));
				self.cols.push(data.getColumnId(col));
			}

			//Save index of image column and indices of columns used by the card.
			for (col = 0; col < numCols; col++) {
				if (self.imageCol && (self.cols[col] === self.imageCol)) {
					self.imageIndex = col;
					break;
				}
			}

			if (prefs.getBool("showCard")) {
				if (self.cardImage) {
					for (col = 0; col < numCols; col++) {
						if (self.cols[col] === self.cardImage) {
							self.cardImageIndex = col;
							break;
						}
					}
				}

				if (self.cardTitle) {
					for (col = 0; col < numCols; col++) {
						if (self.cols[col] === self.cardTitle) {
							self.cardTitleIndex = col;
							break;
						}
					}
				}

				if (self.cardSubtitle) {
					for (col = 0; col < numCols; col++) {
						if (self.cols[col] === self.cardSubtitle) {
							self.cardSubtitleIndex = col;
							break;
						}
					}
				}

				if (self.cardDetail) {
					for (col = 0; col < numCols; col++) {
						if (self.cols[col] === self.cardDetail) {
							self.cardDetailIndex = col;
							break;
						}
					}
				}
			}

			self.hasImage = self.imageIndex == -1 ? false: true;

			if (self.hasImage) {
			//Only one image allowed per row.
			self.imageTotal = numRows;
		}

		if (self.isLoading && self.hasImage) {
			if (self.useDefault) {
				//Image column can't be sorted. Since image is the first column in a default layout, put the default sort index on the next column.
				self.sortIndex = 1;
			}
			else {
				//Figure out what the first column is that is not the image column.
				self.sortIndex = self.imageIndex == 0 ? 1 : self.imageIndex - 1;
			}
		}

			//Hide to avoid flickering while UI is being recreated.
			$("#scrollContainer").hide();

			if (self.useDefault) {
				if (self.isVerticalLayout()) {
					self.buildVerticalLayout.call(self);
				}
				else {
					self.buildHorizontalLayout.call(self);
				}
			}
			//Custom layout.
			else {
				self.showCustomLayout.call(self);
			}
		}
	}
}
};

this.viz.getData(settings);
}
RiseVision.Directory.Controller.prototype.buildVerticalLayout = function() {
	var page = document.createElement("ul"),
	numRows = this.data.getNumberOfRows(),
	numCols = this.data.getNumberOfColumns(),
	isFirstTextCol = true,
	self = this;

	page.setAttribute("class", "page");

	//Remove old content.
	if (!this.isLoading) {
		$("#scrollContainer").infiniteScroll.stop();
		$("#scrollContainer").empty();
	}

	$("#scrollContainer").append(page);

	for (var row = 0; row < numRows; row++) {
		$(".page").append("<li class='listing item'><div class='content'></div></li>");
		$(".listing:last").data("row", row);

		for (var col = 0; col < numCols; col++) {
			if (this.showColumn(col)) {
		//Add text first because the height of the content will be used to set the height of the image.
		if (col != this.imageIndex) {
			if (isFirstTextCol) {
				if (this.data.getFormattedValue(row, col)) {
					$(".content:last").append("<p class='heading_font-style'>" + this.data.getFormattedValue(row, col) + "</p>");
				}

				isFirstTextCol = false;
			}
			else {
				if (this.data.getFormattedValue(row, col)) {
					$(".content:last").append("<span class='data_font-style'>" + this.data.getFormattedValue(row, col) + "</span><br />");
				}
			}
		}
	}

		//Add horizontal line after last column and then add the image.
		if (col == numCols - 1) {
			$(".listing:last").append("<hr>");
			isFirstTextCol = true;

			if (this.hasImage) {
				this.loadImage(row, this.imageIndex, this.onImageLoaded, this.onImageError);
			}
		}
	}
}

	//No images to load.
	if (!this.hasImage) {
		$(".content").css("margin-left", "0%");
		this.initDirectory();
	}
}
RiseVision.Directory.Controller.prototype.buildHorizontalLayout = function() {
	var table = document.createElement("table"),
	numRows = this.data.getNumberOfRows(),
	numCols = this.data.getNumberOfColumns(),
	images = [];

	this.isTable = true;

	table.setAttribute("id", "directory");
	table.setAttribute("class", "page");

	//Remove old content.
	if (!this.isLoading) {
		$(".dataTables_scrollBody").infiniteScroll.stop();
		$("#scrollContainer").empty();
		$("#nav").hide();
	}

	$("#scrollContainer").append(table);

	//Add rows.
	for (var row = 0; row < numRows; row++) {
		this.renderRow(row);
	}

	//Add headings.
	if (numCols > 0) {
		this.renderHeadings(true);
	}

	if (this.hasImage) {
		if (this.imageTotal > 0) {
			for (var row = 0; row < numRows; row++) {
				this.loadImage(row, this.imageIndex, this.onBgImageLoaded, this.onBgImageError);
			}
		}
	else {	//No rows
		this.initTable();
	}
}
else {
	this.initTable();
}
}
RiseVision.Directory.Controller.prototype.showCustomLayout = function() {
	var numRows = this.data.getNumberOfRows();
	var numCols = this.data.getNumberOfColumns();
	var self = this;
	var $listing;

	//Remove old content.
	if (!this.isLoading) {
		$("#scrollContainer").infiniteScroll.stop();
		$("#scrollContainer").empty();
	}

	//Add the layout.
	$("#scrollContainer").append(this.directory);
	$listing = $(".listing");
	this.isTable = $("#scrollContainer").find("table#directory").length > 0 ? true : false;

	//Add headings.
	if (this.isTable) {
		if (numCols !== $(".listing > td").length) {
			console.log("The number of columns in the spreadsheet does not match " +
				"the number of columns in the layout file. Please ensure that " +
				"these are the same.");

			return;
		}

		this.renderHeadings(false);
	}

	//One listing has already been added, so add new listings for each row less one.
	for (var row = 1; row < numRows; row++) {
		$(".listing:last").after($listing.clone());
	}

	for (var row = 0; row < numRows; row++) {
		$(".listing").eq(row).data("row", row);

		for (var col = 0; col < numCols; col++) {
			var $cell = $("." + this.cols[col]).eq(row);

			if ($cell.length > 0) {
				//Add text first because the height of the content will be used to set the height of the image.
				if (col != this.imageIndex) {
					$cell.html(this.data.getFormattedValue(row, col));
				}
			}

			//Load the image after all of the text has been populated.
			if (col == numCols - 1) {
				if (this.hasImage) {
					if (this.isTable) {
						this.loadImage(row, this.imageIndex, this.onBgImageLoaded, this.onBgImageError);
					}
					else {
						this.loadImage(row, this.imageIndex, this.onImageLoaded, this.onImageError);
					}
				}
			}
		}
	}

	if (this.imageTotal == 0) {
		if (this.isTable) {
			this.initTable();
		}
		else {
			this.initDirectory();
		}
	}
}
RiseVision.Directory.Controller.prototype.configureCard = function() {
	var self = this,
	width = this.cardWidth / prefs.getInt("rsW") * 100 + "%",
	imageWidth = this.cardImageWidth,
	radius = $("#close").width() / 2 + "em";

	if (prefs.getBool("showCard")) {
		if (this.isLoading) {
		//Card
		$("#card").css("width", width);
		$("#card").css("background-color", this.cardBgColor);

		if (this.cardBorder) {
			$("#card").addClass("cardBorder");
		}

		//Card image
		if (this.cardImageAlign == "topRight") {
			$("#image").addClass("right");
		}
		else if (this.cardImageAlign == "topLeft") {
			$("#image").addClass("left");
		}
		else {
			$("#image").addClass("center");
		}

		$("#image").css("padding", this.cardImagePadding);

		if (this.cardImageIndex != -1) {
		//Show card temporarily to obtain width.
		$("#card").show();
		imageWidth = imageWidth / $("#card").outerWidth(true) * 100 + "%";
		$("#card").hide();

		if (this.cardImageAlign != "center") {
			$("#image").css("width", imageWidth);
		}
	}

		//Close button
		$("#close").css("color", this.closeBorderColor);
		$("#close").css("background-color", this.closeFillColor);
		$("#close").css("border-color", this.closeBorderColor);
		$("#close").css({
			"-webkit-border-radius": radius,
			"-moz-border-radius": radius,
			"border-radius": radius
		});

		$("#close").on("click", function() {
			clearTimeout(self.cardCloseTimer);
			$("#card").bPopup().close();

			return false;
		});

		//Content
		$("#title").css("padding", this.cardTitlePadding);
		$("#subtitle").css("padding", this.cardSubtitlePadding);
		$("#detail").css("padding", this.cardDetailPadding);
	}

	$(".listing").on("click", function(e) {
		var row = $(this).data("row");

		if (!self.isSwiping) {
			if (row >= 0) {
				if (self.cardTitleIndex != -1) {
					$("#title").html(self.data.getFormattedValue(row, self.cardTitleIndex));
				}

				if (self.cardSubtitleIndex != -1) {
					$("#subtitle").html(self.data.getFormattedValue(row, self.cardSubtitleIndex));
				}

				if (self.cardDetailIndex != -1) {
					$("#detail").html(self.data.getFormattedValue(row, self.cardDetailIndex));
				}

				if (self.cardImageIndex != -1) {
					self.loadImage(row, self.cardImageIndex, function(row, img) {
						$("#image").empty();
						$("#image").append(img);

						if (self.cardImageAlign == "center") {
							$("#image > img").css("width", imageWidth);
						}

						self.showCard();
					}, function() {
						$("#image").empty();
						self.showCard();
					});
				}
				else {
					self.showCard();
				}
			}
		}
		else {
			self.isSwiping = false;
		}
	});
}
}
RiseVision.Directory.Controller.prototype.showCard = function() {
	var settings = { modalClose: false },
	hPos = 0,
	vPos = 0;

	if (this.cardLocation == "left") {
		settings.position = [hPos, "auto"];
	}
	else if (this.cardLocation == "right") {
		hPos = prefs.getInt("rsW") - $("#card").outerWidth(true);
		settings.position = [hPos, "auto"];
	}
	else if (this.cardLocation == "top") {
		settings.position = ["auto", vPos];
	}
	else if (this.cardLocation == "bottom") {
		vPos = prefs.getInt("rsH") - $("#card").outerHeight(true);
		settings.position = ["auto", vPos];
	}
	else {
	//Center is default position.
}

$("#card").bPopup(settings);

this.cardCloseTimer = setTimeout(function() {
	$("#card").bPopup().close();
}, this.cardTimeout);
}
RiseVision.Directory.Controller.prototype.renderHeadings = function(exclude) {
	var tr = document.createElement("tr"), th;
	var hasHeadings = this.hasHeadings();
	var numCols = this.data.getNumberOfColumns();
	var arrow, indicator, indicator1, indicator2;

	for (var col = 0; col < numCols; col++) {
		th = document.createElement("th");

		//Don't render table headings for data that doesn't have any headings, or for data that already appears on the Pop Up card.
		//Also, only create a heading if this column exists in the layout (might not for a custom layout where a column has been removed).
		if (hasHeadings) {
			if ((!exclude || (exclude && this.showColumn(col))) && ($("." + this.cols[col]).length > 0)) {
				th.setAttribute("id", this.cols[col]);
				th.setAttribute("class", "nowrap heading_font-style");
				$(th).html(this.data.getColumnLabel(col));

			//No sort indicator for the image column.
			if (this.hasImage && col == this.imageIndex) {
				if (this.useDefault) {
					$(tr).prepend(th);
				}
				else {
					$(tr).append(th);
				}
			}
			else {
				arrow = document.createElement("div");
				indicator = document.createElement("div");
				indicator1 = document.createElement("div");
				indicator2 = document.createElement("div");

				arrow.setAttribute("class", "arrow");
				indicator.setAttribute("class", "indicator");
				indicator1.setAttribute("class", "indicator1");
				indicator2.setAttribute("class", "indicator2");

				if (this.sortDirection == "asc") {
					$(arrow).html("&darr;");
					$(indicator1).html("A");
					$(indicator2).html("Z");
				}
				else {
					$(arrow).html("&uarr;");
					$(indicator1).html("Z");
					$(indicator2).html("A");
				}

				$(th).append(arrow);
				$(indicator).append(indicator1);
				$(indicator).append(indicator2);
				$(th).append(indicator);
				$(tr).append(th);
			}
		}
	}
	else {
		if (this.showColumn(col)) {
			$(tr).append(th);
		}
	}
}

$("table").prepend($("<thead>").append(tr));
}
RiseVision.Directory.Controller.prototype.hasHeadings = function() {
	var hasHeading = false,
	numCols = this.data.getNumberOfColumns();

	for (var col = 0; col < numCols; col++) {
		var label = this.data.getColumnLabel(col);

		if (label) {
			hasHeading = true;
			break;
		}
	}

	return hasHeading;
}
//Render each row of data.
RiseVision.Directory.Controller.prototype.renderRow = function(row) {
	var tr = document.createElement("tr"),
	numCols = this.data.getNumberOfColumns();

	tr.setAttribute("class", "listing item");
	$(tr).data("row", row);

	for (var col = 0; col < numCols; col++) {
		if (this.showColumn(col)) {
			var value = "", style = "";

			value = this.data.getFormattedValue(row, col);
			style = this.data.getProperty(row, col, "style");

		//Strip out the font-family that holds an incorrect value.
		if (style) {
			style = style.substring(0, style.indexOf("font-family:"));
		}

		if (this.hasImage && col == this.imageIndex) {
			this.addImage(tr, this.cols[col]);
		}
		else {
			this.addCell(tr, value, style, this.cols[col]);
		}
	}
}

$("table").append(tr);
}
RiseVision.Directory.Controller.prototype.addImage = function(tr, className) {
	var td = document.createElement("td");

	td.setAttribute("class", className + " image");
	$(tr).prepend(td);
}
RiseVision.Directory.Controller.prototype.addCell = function(tr, value, style, className) {
	var td = document.createElement("td");

	if (style) {
		td.setAttribute("style", style);
	}

	td.setAttribute("class", className + " data_font-style");
	$(td).html(value);
	$(tr).append(td);
}
RiseVision.Directory.Controller.prototype.loadImage = function(row, imageIndex, onLoadCallback, onErrorCallback) {
	var self = this,
	img = new Image();

	img.onload = function() {
		if (onLoadCallback) {
			onLoadCallback.call(self, row, this);
		}
	}
	img.onerror = function() {
		if (onErrorCallback) {
			onErrorCallback.call(self, row, this);
		}
	}

	img.src = this.data.getFormattedValue(row, imageIndex);
}
RiseVision.Directory.Controller.prototype.onImageLoaded = function(row, img) {
	var div = document.createElement("div");

	div.setAttribute("class", "image");

	$(div).css({
		"background": "url(" + this.data.getFormattedValue(row, this.imageIndex) + ") center center no-repeat"
	});

	$(".listing").eq(row).prepend(div);

	this.onAllImagesLoaded();
}
RiseVision.Directory.Controller.prototype.onImageError = function(row, img) {
	var div = document.createElement("div");

	div.setAttribute("class", "image");
	$(".listing").eq(row).prepend(div);

	this.onAllImagesLoaded();
}
RiseVision.Directory.Controller.prototype.onAllImagesLoaded = function() {
	var self = this;

	this.imagesLoaded++;

	if (this.imagesLoaded == this.imageTotal) {
		this.initDirectory();
	}
}
RiseVision.Directory.Controller.prototype.initDirectory = function() {
	var $img = null,
	self = this;

	$("#scrollContainer").show();

	$(".content").css({
		"padding-top": this.rowPadding,
		"padding-bottom": this.rowPadding
	});

	$(".listing:odd").addClass("odd");
	$(".listing:even").addClass("even");

	$(".listing").each(function(index) {
		$(".image").eq(index).css("height", $(".listing").eq(index).height());
	});

	//Need to use margins with background images and not padding.
	$(".image").css({
		"margin-top": this.rowPadding,
		"margin-bottom": this.rowPadding
	});

	$("#scrollContainer").infiniteScroll({
		scrollBy: prefs.getString("scrollBy"),
		direction: prefs.getString("scrollDirection"),
		duration: prefs.getInt("scrollHold") * 1000,
		speed: prefs.getString("scrollSpeed"),
		swipingTimeout: prefs.getInt("scrollResumes") * 1000,
		toggleOddEven: true
	})
	.bind("onSwipe", function(event) {
		self.isSwiping = true;
	})
	.bind("onSwipeEnd", function(event) {
		self.isSwiping = false;
	});

	this.configureCard();

	//Size container back to its original dimensions.
	$("#container").width("100%");
	$("#container").height("100%");

	if (this.isLoading) {
		this.configureNavigation($("#container"));
		readyEvent();
	}
	else {
		$("#scrollContainer").infiniteScroll.start();
		this.startShowAllTimer();
	}
}
//Move this functionality to AlphaNav.js instead.
RiseVision.Directory.Controller.prototype.startShowAllTimer = function() {
	var self = this;

	if ($("#nav ul li.selected").attr("id") != "all") {
		if (this.showAll) {
			this.showAllTimer = setTimeout(function() {
				$("#nav ul li.selected a").css({
					"background": "",
					"-webkit-border-radius": "",
					"-moz-border-radius": "",
					"border-radius": ""
				});
				$("#nav ul li.selected a").css("color", "");
				$("#nav ul li.selected").removeClass("selected");
				$("#nav ul li#all").addClass("selected");

				var radius = $("#nav ul li a").width() / 2 + "em";

				$("#nav ul li.selected a").css({
					"background": prefs.getString("navBgColor"),
					"-webkit-border-radius": radius,
					"-moz-border-radius": radius,
					"border-radius": radius
				});
				$("#nav ul li.selected a").css("color", prefs.getString("navColor"));

				self.onAlphaNavClicked("all");
			}, this.showAll);
		}
	}
}
RiseVision.Directory.Controller.prototype.onBgImageLoaded = function(row, img) {
	var $image = $(".listing").eq(row).find(".image"),
	$img = $("<img>");

	if ($image.length > 0) {
		$img.attr("src", this.data.getFormattedValue(row, this.imageIndex));
		$img.height(0);
		$img.css("max-width", img.width);
		$img.css("max-height", img.height);
		$image.append($img);
	}

	this.onAllBackgroundImagesLoaded();
}
RiseVision.Directory.Controller.prototype.onBgImageError = function() {
	this.onAllBackgroundImagesLoaded();
}
RiseVision.Directory.Controller.prototype.onAllBackgroundImagesLoaded = function() {
	var self = this;

	this.imagesLoaded++;

	if (this.imagesLoaded == this.imageTotal) {
		this.initTable();
	}
}
RiseVision.Directory.Controller.prototype.loadCardImage = function() {
	var numRows = this.data.getNumberOfRows();

	for (var row = 0; row < numRows; row++) {
		this.loadImage(row, this.cardImageIndex);
	}
}
RiseVision.Directory.Controller.prototype.initTable = function() {
	var self = this;
	var colIndex, maxHeight;

	this.formatColumns($("th"));

	//Logo column is not sortable.
	if (this.hasImage) {
		if (this.useDefault) {
			this.sortConfig.aoColumnDefs = [{"bSortable": false, "aTargets": [0]}];
		}
		//Image in custom layout can be shown in any column.
		else {
			this.sortConfig.aoColumnDefs = [{"bSortable": false, "aTargets": [this.imageIndex]}];
		}
	}
	else {
		this.sortConfig.aoColumnDefs = [];
	}

	//Use oSettings.aoColumns.sWidth for datatables to size columns.
	$.each(this.columns, function(index, value) {
		if (value.width) {
			colIndex = $("." + value.column + ":first").parent().children().index($("." + value.column + ":first"));

			self.sortConfig.aoColumnDefs.push({
				"sWidth": value.width,
				"aTargets": [colIndex]
			});
		}
	});

	this.sortConfig.aaSorting = [[this.sortIndex, this.sortDirection]];

	$("#scrollContainer").show();
	$("#nav").show();

	//Find the maximum height of all images.
	maxHeight = Math.max.apply(null, $(".image").map(function () {
		return $(this).height();
	}).get());

	//Set the height of the images now that we know maxHeight.
	$(".image img").height(maxHeight);
	$("#directory").dataTable(this.sortConfig);	//TODO: Change this to table to remove dependency on id.

	if (!this.hasHeadings()) {
		$(".dataTables_wrapper table thead").css("display", "none");
	}

	$(".dataTables_scrollHead table thead tr, .dataTables_scrollBody table tbody tr").height(prefs.getInt("rowHeight"));

	//Add padding. No need to calculate as a percentage since it will work out to be the same result every time.
	$(".dataTables_scrollHead table thead tr th, td").css({
		"padding-top": this.rowPadding,
		"padding-bottom": this.rowPadding
	});

	$("table thead tr th, td").css({
		"padding-left": this.colPadding,
		"padding-right": this.colPadding
	});

	//First cell shouldn't have any padding in front of it.
	$("table tr th:first-child, td:first-child").css({
		"padding-left": "10px"
	});

	//Last cell shouldn't have any padding after it.
	$("table tr th:last-child, td:last-child").css({
		"padding-right": "10px"
	});

	this.configureCard();

	if (this.isLoading) {
		this.configureNavigation($("#container"));
	}

	if (this.isVerticalLayout()) {
		$(".dataTables_scrollBody").height($("#container").outerHeight(true) - $(".dataTables_scrollHead").height());
	}
	else {
		$("#scrollContainer").height($("#container").outerHeight(true) - $("#nav").outerHeight(true));
		$(".dataTables_scrollBody").height($("#container").outerHeight(true) - $("#nav").outerHeight(true) - $(".dataTables_scrollHead").height());
	}

	$(".dataTables_scrollBody").infiniteScroll({
		scrollBy: prefs.getString("scrollBy"),
		direction: prefs.getString("scrollDirection"),
		duration: prefs.getInt("scrollHold") * 1000,
		speed: prefs.getString("scrollSpeed"),
		swipingTimeout: prefs.getInt("scrollResumes") * 1000,
		toggleOddEven: true
	})
	.bind("onSwipe", function(event) {
		self.isSwiping = true;
	})
	.bind("onSwipeEnd", function(event) {
		self.isSwiping = false;
	});

	//Size container back to its original dimensions.
	$("#container").width("100%");
	$("#container").height("100%");

	if (this.isLoading) {
		readyEvent();
	}
	else {
		$(".dataTables_scrollBody").infiniteScroll.start();
		this.startShowAllTimer();
	}
}
/* Format each column. */
RiseVision.Directory.Controller.prototype.formatColumns = function($elem) {
	var self = this;

	$.each(this.columns, function(index, value) {
		if (value.column) {
			var $columns = $("." + value.column),
			colIndex = $("." + value.column + ":first").parent().children().index($("." + value.column + ":first")),
			width;

			if ($columns.length > 0) {
		//Header Text
		if (value.header) {
			$elem.eq(colIndex).html(value.header);
		}

		if (self.isLoading && value.width) {
			width = parseInt(value.width);
			width = width / prefs.getInt("rsW") * 100 + "%";
			value.width = width;
		}

		if (self.hasImage && colIndex == 0) {
			$columns.find("div").css("background-position", value.alignment);
		}
		else {
			$columns.css("text-align", value.alignment);
		}

		$elem.eq(colIndex).css("text-align", value.alignment);
	}
}
});
}
RiseVision.Directory.Controller.prototype.showColumn = function(col) {
	return (col != this.cardTitleIndex) && (col != this.cardSubtitleIndex) && (col != this.cardDetailIndex) && (col != this.cardImageIndex);
}
//Set a timer that will expire if there is no user interaction.
RiseVision.Directory.Controller.prototype.setTimer = function() {
	var self = this;

	$.idleTimer(60000);
	$(document).bind("idle.idleTimer", function() {
		$.idleTimer("destroy");
	self.showTab(self.tabIDs[0]);	//Go to Today.
});
}
RiseVision.Directory.Controller.prototype.isVerticalLayout = function() {
	return (this.nav == "left") || (this.nav == "right");
}
/* Issue 1136 - To compensate for new Google sheets having column IDs
   of "Col 0", "Col 1" etc. instead of "A", "B" etc., this function converts
   them to uppercase letters so that they can be used as valid IDs and
   CSS classes. */
// RiseVision.Directory.Controller.prototype.getColumnId = function(col) {
// 	var columnID = this.data.getColumnId(col), result = "";

// 	if (columnID.indexOf("Col ") !== -1) {
// 		//Strip out "Col " for new Google Sheets.
// 		columnID = parseInt(columnID.replace("Col ", ""));

// 		//Convert number to Unicode character - http://goo.gl/Axhm6.
// 		while (columnID >= 0) {
// 			result = String.fromCharCode(columnID % 26 + 65) + result;	//65 is Unicode value of "A".
// 			columnID = Math.floor(columnID / 26) - 1;
// 		}

// 		return result;
// 	}
// 	else {
// 		return columnID;
// 	}
// }
//Issue 961 Start
RiseVision.Directory.Controller.prototype.onresize = function() {
	$(".listing").each(function(index) {
		$(".image").eq(index).css("height", $(".listing").eq(index).height());
	});

	//Need to use margins with background images and not padding.
	$(".image").css({
		"margin-top": this.rowPadding,
		"margin-bottom": this.rowPadding
	});
}
//Issue 961 End
RiseVision.Directory.Controller.prototype.play = function() {
	this.isLoading = false;

	if (this.isTable) {
		$(".dataTables_scrollBody").infiniteScroll.start();
	}
	else {
		$("#scrollContainer").infiniteScroll.start();
	}
}
RiseVision.Directory.Controller.prototype.pause = function() {
	if (this.isTable) {
		$(".dataTables_scrollBody").infiniteScroll.pause();
	}
	else {
		$("#scrollContainer").infiniteScroll.pause();
	}
}