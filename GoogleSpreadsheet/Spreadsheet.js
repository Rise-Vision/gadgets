var RiseVision = RiseVision || {};
RiseVision.Spreadsheet = {};

/* Main functionality for the Spreadsheet Gadget. */
RiseVision.Spreadsheet = function() {
	var prefs = new gadgets.Prefs(),
	defaultLayout = "https://s3.amazonaws.com/Gadget-Spreadsheet/layouts/Table/Table.xml",
	layoutURL = unescape(prefs.getString("layoutURL"));

	//Gadget settings
	this.prefs = prefs;
	this.url = unescape(prefs.getString("url"));
	this.useLayoutURL = prefs.getBool("useLayoutURL");
	this.isDefaultLayout = prefs.getBool("useLayoutURL") && (!layoutURL || layoutURL == defaultLayout) ? true : false;
	this.layoutURL = layoutURL ? layoutURL : defaultLayout;
	this.scrollBy = prefs.getString("scrollBy");
	this.scrollDirection = prefs.getString("scrollDirection");
	this.duration = prefs.getInt("duration") * 1000;
	this.scrollSpeed = prefs.getString("scrollSpeed");
	this.interactivityTimeout = prefs.getInt("interactivityTimeout") * 1000;
	this.spacing = parseInt(prefs.getInt("spacing") / 2) + "px";
	this.colPadding = parseInt(prefs.getInt("colPadding") / 2) + "px";
	this.colCount = prefs.getInt("colCount");
	this.interval = prefs.getInt("interval");
	this.showStale = prefs.getBool("showStale");
	this.condition1 = prefs.getInt("condition1");
	this.condition2 = prefs.getInt("condition2");
	this.condition3 = prefs.getInt("condition3");
	this.condition1Action = prefs.getString("condition1Action");
	this.condition2Action = prefs.getString("condition2Action");
	this.condition3Action = prefs.getString("condition3Action");
	this.rsW = prefs.getInt("rsW");
	this.rsH = prefs.getInt("rsH");

	this.isLoading = true;
	this.isPaused = true;
	this.noDataFound = false;
	this.columns = {};
	this.sortConfig = {
		"bDestroy": true,
		"bFilter": false,
		"bInfo": false,
		"bLengthChange": false,
		"bPaginate": false,
		"bSort": false,
		"sScrollY": "500px"
	};

	this.settings = new RiseVision.Common.Settings();
	this.picker = new RiseVision.Common.Picker();
	this.viz = new RiseVision.Common.Visualization();
	this.baseURL = "";
	this.headerRows = "0";
	this.range = "";
}
/* Settings Start */
//Populate settings from saved values.
RiseVision.Spreadsheet.prototype.initSettings = function() {
	var self = this;

	//If the required field (URL) has been set, then we know the Gadget has already been saved.
	if (this.url) {
		$("#url").val(this.url);

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

		//Issue 973 Start
		this.range = prefs.getString("range");
		this.headerRows = prefs.getString("headerRows");
		//Issue 973 End
	}

	$("#interval").val(this.interval);
	$("#scrollBy").val(this.scrollBy);
	$("#scrollDirection").val(this.scrollDirection);
	$("#scrollSpeed").val(this.scrollSpeed);
	$("#scrollResumes").val(prefs.getInt("interactivityTimeout"));
	$("#rowPadding").val(prefs.getInt("spacing"));
	$("#colPadding").val(prefs.getInt("colPadding"));
	$("#colCount").val(this.colCount);
	$("#backgroundColor").val(prefs.getString("backgroundColor"));
	$("#rowColor").val(prefs.getString("rowColor"));
	$("#alternateRowColor").val(prefs.getString("alternateRowColor"));
	$("#scrollHold").val(prefs.getInt("duration"));
	$("#useDefaultURL").attr("checked", !this.useLayoutURL);
	$("#layoutURL").val(this.layoutURL);
}

this.onScrollByChanged();
this.onScrollDirectionChanged();
this.onLayoutURLChanged();
this.buildColumnFormatUI();

$("#scrollBy").change(function() {
	self.onScrollByChanged();
});

$("#scrollDirection").change(function() {
	self.onScrollDirectionChanged();
});

$("#useDefaultURL").click(function() {
	self.onLayoutURLChanged();
});

$("#colCount").change(function() {
	self.buildColumnFormatUI();
});

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

	//Request additional parameters from the Viewer.
	gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
		if (result) {
			result = JSON.parse(result);

		//Populate colors and show color as background of text box.
		self.populateColor($("#backgroundColor"), prefs.getString("backgroundColor"));
		self.populateColor($("#rowColor"), prefs.getString("rowColor"));
		self.populateColor($("#alternateRowColor"), prefs.getString("alternateRowColor"));

		$("#heading_font-style").text(result["heading_font"]);
		$("#heading_font-style").data("css", result["heading_font-style"]);
		$("#data_font-style").text(result["data_font"]);
		$("#data_font-style").data("css", result["data_font-style"]);

		for (var i = 0; i < parseInt($("#colCount").val()); i++) {
			self.initFormatSettings(i + 1, result.columns[i]);
		}
	}

	$("#settings").show();
});
}
RiseVision.Spreadsheet.prototype.initFormatSettings = function(index, column) {
	$("#column" + index).val(column.column);
	$("#alignment" + index).val(column.alignment);
	$("#width" + index).val(column.width);
	$("#decimals" + index).val(column.decimals);
	$("#sign" + index).val(column.sign);
	$("#condition" + index + "Action").val(column.condition);
	$("#headerText" + index).val(column.header);
}
//Set visibility of Scroll Hold.
RiseVision.Spreadsheet.prototype.onScrollByChanged = function() {
	if ($("#scrollBy").val() == "continuous") {
		$("li.scrollHold").hide();
	}
	else {
		$("li.scrollHold").show();
	}
}
RiseVision.Spreadsheet.prototype.onScrollDirectionChanged = function() {
	var direction = $("#scrollDirection").val();

	if (direction == "none") {
		$("li.scroll").hide();
	}
	else {
		$("li.scroll").show();
	}

	//Heading Font, Use Default Layout and Layout URL are not visible for horizontal scrolling.
	if (direction == "rtl" || direction == "ltr") {
		$("li.headingFont, li.useDefaultURL, li.layoutURL").hide();
	}
	else {
		$("li.headingFont, li.useDefaultURL").show();

		if (!$("#useDefaultURL").is(":checked")) {
			$("li.layoutURL").show();
		}
	}
}
//Set visibility of Layout URL.
RiseVision.Spreadsheet.prototype.onLayoutURLChanged = function() {
	if ($("#useDefaultURL").is(":checked")) {
		$("li.layoutURL").hide();
	}
	else if ($("li.useDefaultURL").is(":visible")){
		$("li.layoutURL").show();
	}
}
//Add UI for column format settings.
RiseVision.Spreadsheet.prototype.buildColumnFormatUI = function() {
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
			var $li = $("<li></li>"),
			$ol = $("<ol class='formatting drillDown'></ol>");

			$($ol)
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
					"<option value='none' selected='selected'>None</option>" +
					"<option value='minus'>-</option>" +
					"<option value='plusMinus'>+/-</option>" +
					"<option value='parentheses'>( )</option>" +
					"<option value='arrow'>Arrow</option>" +
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
					"</select>"))
			.append($("<li></li>")
				.append("<label for='headerText" + i + i + "'>" +
					"<a href='#' class='tooltip'>Header Text:<span>Custom header text. If not specified, the header from the spreadsheet will be used.</span></a>" +
					"</label>")
				.append("<input id='headerText" + i + "' name='headerText" + i + "' type='text' class='headerText short' />"));

			$li.append($ol);

		//Insert before Background Color.
		$("#backgroundColor").parent().before($li);
	}
}
}
}
RiseVision.Spreadsheet.prototype.showColorPicker = function(id) {
	gadgets.rpc.call("", "rscmd_openColorPicker", null, id, $("#" + id).val());
}
RiseVision.Spreadsheet.prototype.showFontSelector = function(id) {
	gadgets.rpc.call("", "rscmd_openFontSelector", null, id, $("#" + id).data("css"));
}
RiseVision.Spreadsheet.prototype.populateColor = function($element, color) {
	$element.val(color);
	$element.css("background-color", color);
}
RiseVision.Spreadsheet.prototype.setColor = function(id, color) {
	$("#" + id).val(color);
	$("#" + id).css("background-color", color);
}
RiseVision.Spreadsheet.prototype.setFont = function(id, css, style) {
	$("#" + id).data("css", css);
	$("#" + id).text(style);
}
RiseVision.Spreadsheet.prototype.setURL = function(id, doc) {
	$("#" + id).val("");
	spreadsheet.picker.getSheets({
		"docID": doc.id,
		"callback": function(sheets) {
			if (sheets != null) {
				spreadsheet.docID = doc.id;
				spreadsheet.onSheetsLoaded(sheets);
				spreadsheet.showDataURLOptions();
			}
		}
	});
}
RiseVision.Spreadsheet.prototype.onSheetsLoaded = function(sheets) {
	$("#sheet").empty();

	for (var i = 0; i < sheets.length; i++) {
		document.getElementById("sheet").add(sheets[i]);
	}
}
RiseVision.Spreadsheet.prototype.showDataURLOptions = function() {
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
RiseVision.Spreadsheet.prototype.getSettings = function() {
	var errorFound = false,
	errors = document.getElementsByClassName("errors")[0],
	params = "",
	settings = null,
	vizSettings = null,
	selected;

	$(".errors").empty();
	$(".errors").css({ display: "none" });

	//Validate the URL to ensure that it returns data.
	if ($("#url").val() != "") {
		vizSettings = {
		url: $("#url").val() + ($("#url").val().indexOf("?") == -1 ? "?" : "&") + "dummy=" + Math.ceil(Math.random() * 100),	//Issue 976
		refreshInterval: 0,
		callback: function(data) {
			if (data != null) {
			//Validate all other settings.
			errorFound = (spreadsheet.settings.validateRequired($("#url"), errors, "Data URL")) ? true : errorFound;
			errorFound = (spreadsheet.settings.validateNumeric($("#interval"), errors, "Data Refresh")) ? true : errorFound;
			errorFound = (spreadsheet.settings.validateNumeric($("#scrollHold"), errors, "Scroll Hold")) ? true : errorFound;
			errorFound = (spreadsheet.settings.validateNumeric($("#scrollResumes"), errors, "Scroll Resumes")) ? true : errorFound;
			errorFound = (spreadsheet.settings.validateNumeric($("#rowPadding"), errors, "Row Padding")) ? true : errorFound;
			errorFound = (spreadsheet.settings.validateNumeric($("#colPadding"), errors, "Column Padding")) ? true : errorFound;

			if (parseInt($("#colCount").val()) > 0) {
				$(".column").each(function(i) {
					errorFound = (spreadsheet.settings.validateRequired($(this), errors, "Column")) ? true : errorFound;
				});

				$(".width").each(function(i) {
					errorFound = (spreadsheet.settings.validateNumeric($(this), errors, "Column Width")) ? true : errorFound;
				});
			}

			if (errorFound) {
				$(".errors").fadeIn(200).css("display", "inline-block");
				$("#wrapper").scrollTop(0);

				return null;
			}
			else {
			//Construct parameters string to pass to RVA.
			params = "up_url=" + escape($("#url").val());

			//Only save spreadsheet metadata settings if file has been selected using Google Picker(i.e. if docID has a value).
			if (spreadsheet.docID != null) {
				params += "&up_docID=" + spreadsheet.docID;

				//Entire Sheet or Range
				selected = $("input[type='radio'][name='cells']:checked");

				if (selected.length > 0) {
					params += "&up_cells=" + selected.val() +
					"&up_range=" + $("#range").val();
				}

				params += "&up_sheet=" + escape($("#sheet").val()) +
				"&up_headerRows=" + $("#headerRows").val();
			}

			params += "&up_interval=" + $("#interval").val() +
			"&up_scrollBy=" + $("#scrollBy").val() +
			"&up_duration=" + $("#scrollHold").val() +
			"&up_scrollDirection=" + $("#scrollDirection").val() +
			"&up_scrollSpeed=" + $("#scrollSpeed").val() +
			"&up_interactivityTimeout=" + $("#scrollResumes").val() +
			"&up_spacing=" + $("#rowPadding").val() +
			"&up_colPadding=" + $("#colPadding").val() +
			"&up_colCount=" + $("#colCount").val() +
			"&up_backgroundColor=" + $("#backgroundColor").val() +
			"&up_rowColor=" + $("#rowColor").val() +
			"&up_alternateRowColor=" + $("#alternateRowColor").val();

			//useLayoutURL now refers to whether or not to use the default URL, so it should be saved as the opposite value.
			if ($("#useDefaultURL").is(":checked")) {
				params += "&up_useLayoutURL=false";
			}
			else {
				params += "&up_useLayoutURL=true";
			}

			if ($("#layoutURL").is(":visible")) {
				params += "&up_layoutURL=" + escape($("#layoutURL").val());
			}

			//Save fonts and column formatting as additional parameters.
			var columns = [];

			for (var i = 0; i < parseInt($("#colCount").val()); i++) {
				spreadsheet.saveFormatSettings(i + 1, columns);
			}

			var additionalParams = {
				"heading_font": $("#heading_font-style").text(),
				"heading_font-style": $("#heading_font-style").data("css"),
				"data_font": $("#data_font-style").text(),
				"data_font-style": $("#data_font-style").data("css"),
				"columns": columns
			};

			var settings = {
				params: params,
				additionalParams: JSON.stringify(additionalParams)
			};

			gadgets.rpc.call("", "rscmd_saveSettings", null, settings);
		}
	}
		else {	//Spreadsheet could not be read.
			$(".errors").append("The spreadsheet could not be read. Please ensure that the Data URL is correct and that the spreadsheet has been " +
				"published to the web.");
			$(".errors").fadeIn(200).css("display", "inline-block");
			$("#wrapper").scrollTop(0);

			return null;
		}
	}
}

spreadsheet.viz.getData(vizSettings);
}
else {
	errorFound = (spreadsheet.settings.validateRequired($("#url"), errors, "Data URL")) ? true : errorFound;

	if (errorFound) {
		$(".errors").fadeIn(200).css("display", "inline-block");
		$("#wrapper").scrollTop(0);

		return null;
	}
}
}
RiseVision.Spreadsheet.prototype.saveFormatSettings = function(i, columns) {
	columns.push({
		column: $("#column" + i).val(),
		alignment: $("#alignment" + i).val(),
		width: $("#width" + i).val(),
		decimals: $("#decimals" + i).val(),
		sign: $("#sign" + i).val(),
		condition: $("#condition" + i + "Action").val(),
		header: $("#headerText" + i).val()
	});
}
/* Settings End */

/* Functionality Start */
RiseVision.Spreadsheet.prototype.getAdditionalParams = function(name, value) {
	if (name == "additionalParams") {
		if (value) {
			var styleNode = document.createElement("style");

			value = JSON.parse(value);

		//Inject CSS fonts into the DOM since they are stored as additional parameters.
		styleNode.appendChild(document.createTextNode(value["heading_font-style"]));
		styleNode.appendChild(document.createTextNode(value["data_font-style"]));
		styleNode.appendChild(document.createTextNode("a:active" + value["data_font-style"]));

		document.getElementsByTagName("head")[0].appendChild(styleNode);

		spreadsheet.columns = value.columns;
	}
}

spreadsheet.initialize();
}
RiseVision.Spreadsheet.prototype.initialize = function() {
	var self = this,
	params = {};

	//Same CSS file is used for default table layout and when a custom layout is not used.
	if (!this.useLayoutURL && !this.isHorizontal()) {	//Issue 911
		self.loadCSS("https://s3.amazonaws.com/Gadget-Spreadsheet/layouts/Table/Table.css");
	}

	//Load XML layout.
	if (this.useLayoutURL) {
		params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
		gadgets.io.makeRequest(encodeURI(this.layoutURL), function(obj) {
			var data = obj.data,
			index = 0;

			if (data.getElementsByTagName("Style").length > 0) {
		//External CSS
		if (data.getElementsByTagName("Style")[0].getAttribute("url")) {
			self.loadCSS(data.getElementsByTagName("Style")[0].getAttribute("url"));
		}
		//Inline CSS
		else {
			var head = document.getElementsByTagName("head")[0],
			style = document.createElement("style");

			style.innerHTML = data.getElementsByTagName("Style")[0].childNodes[1].nodeValue;
			head.appendChild(style);
		}
	}

		//Save the layout.
		self.layout = data.getElementsByTagName("Layout")[0].childNodes[1].nodeValue;
		self.getData();
	}, params);
	}
	else {
		this.getData();
	}
}
//Load CSS file.
RiseVision.Spreadsheet.prototype.loadCSS = function(url) {
	var link = $("<link>");

	link.attr({
		type: "text/css",
		rel: "stylesheet",
		href: url
	});
	$("head").append(link);
}
RiseVision.Spreadsheet.prototype.getData = function(url) {
	var self = this;

	if (url) {
		this.url = url;
	}

	if (this.isHorizontal()) {
		this.initHorizontalScroll();
	}
	else {
		var settings = {
			url: this.url,
			refreshInterval: this.interval,
			callback: function(data) {
				self.onDataLoaded.call(self, data);
			}
		};

		this.viz.getData(settings);
	}
}
RiseVision.Spreadsheet.prototype.onDataLoaded = function(data) {
	if (data == null) {
		if (this.isLoading) {
			this.isLoading = false;
			readyEvent();
		}
	}
	else {
		this.pause();
		this.data = data;

		if (this.useLayoutURL) {
			this.showCustomLayout();
		}
		else {
			this.showDefaultLayout();
		}
	}
}
/* Default layout is a table. */
RiseVision.Spreadsheet.prototype.showDefaultLayout = function() {
	if (!this.checkForNoData()) {
		if (!this.isLoading && (this.dataTable != null)) {
			this.dataTable.fnClearTable(false);
		}

		this.cols = [];

		for (var col = 0, totalCols = this.data.getNumberOfColumns(); col < totalCols; col++) {
			this.cols.push(this.data.getColumnId(col));
		}

	//Assume same number of columns with every refresh.
	if (this.isLoading) {
		this.createDataTable();
	}
	//Issue 734
	else {
		//Issue 746 - Recreate table with correct number of columns.
		if ($(".dataTables_scrollHeadInner .page th").length != this.data.getNumberOfColumns()) {
			this.dataTable.fnDestroy(true);
			this.dataTable = null;
			this.createDataTable();
		}
		else {
		this.updateHeadings();	//Issue 838
		this.addRows();
	}
}

	//Add padding. No need to calculate as a percentage since it will work out to be the same result every time.
	$(".dataTables_scrollHead table tr th, td").css({
		"padding-top": this.spacing,
		"padding-bottom": this.spacing,
		"padding-left": this.colPadding,
		"padding-right": this.colPadding
	});

	//First cell shouldn't have any padding in front of it.
	$(".dataTables_scrollHead table tr th:first-child, td:first-child").css({
		"padding-left": "10px"
	});

	//Last cell shouldn't have any padding after it.
	$(".dataTables_scrollHead table tr th:last-child, td:last-child").css({
		"padding-right": "10px"
	});

	//$(".dataTables_scrollBody").height(($("#container").outerHeight(true) - $(".dataTables_scrollHead").height()) / this.rsH * 100 + "%");

	this.setFontSizes();
	this.configureScrolling();
	this.handleConditions();

	if (this.isLoading) {
		this.isLoading = false;
		readyEvent();
	}
	else {
		$(".dataTables_scrollBody").infiniteScroll.start();
	}
}
}
//Issue 746
RiseVision.Spreadsheet.prototype.createDataTable = function() {
	var self = this,
	colIndex;

	//Gadget Issue 804 - Size the Gadget using the UserPrefs.
	$("#container").width(prefs.getString("rsW"));
	$("#container").height(prefs.getString("rsH"));

	$(".page").empty();

	//Add column headings.
	if (this.data.getNumberOfColumns() > 0) {
		this.renderHeadings();
	}

	//Add rows.
	for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
		this.renderRow(this.data.getNumberOfColumns(), row);
	}

	this.formatColumns($(".page th"));
	this.sortConfig.aoColumnDefs = [];

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

	this.dataTable = $(".page").dataTable(this.sortConfig);
	$(".dataTables_scrollBody").height(($("#container").outerHeight(true) - $(".dataTables_scrollHead").height()) / this.rsH * 100 + "%");
}
/* Custom layout may or may not be a table. Need to account for both possibilities. */
RiseVision.Spreadsheet.prototype.showCustomLayout = function() {
	if (!this.checkForNoData()) {
		var self = this,
		$headerRow = null,
		$thead = $("<thead />"),
		$repeat = null;

		this.cols = [];
		this.imagesLoaded = 0;

		$("#container").empty();
		$("#container").append(this.layout);
		$headerRow = $("#header table tbody").html();
		$repeat = $(".repeat");

		for (var col = 0; col < this.data.getNumberOfColumns(); col++) {
			this.cols.push(this.data.getColumnId(col));
		}

	//Calculate number of images that need to be loaded.
	this.imageTotal = ($(".image").length * this.data.getNumberOfRows()) + ($(".qrCode").length * this.data.getNumberOfRows());

	for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
		if (row > 0) {
			$repeat.parent().append($repeat.clone());
		}

		for (var col = 0, numCols = this.cols.length; col < numCols; col++) {
			var $cell = $("." + this.cols[col] + ":last");

			if ($cell) {
			//Show an image.
			if ($cell.hasClass("image")) {
				this.loadImage(this.data.getValue(row, col), $cell);
			}
			//Generate QR code.
			else if ($cell.hasClass("qrCode")) {
				if (this.data.getValue(row, col)) {
					this.loadImage("https://chart.googleapis.com/chart?cht=qr&chs=100x100&chld=H|0&chl=" + encodeURIComponent(this.data.getValue(row, col)), $cell);
				}
				else {
					this.imageTotal--;
				}
			}
			else {
			//Date
			if (this.data.getColumnType(col) == "date") {
				$cell.html(this.data.getFormattedValue(row, col));
			}
			//Text
			else {
				$cell.html(this.data.getFormattedValue(row, col));
			}
		}
	}
}
}

	//Massage old custom layouts to new format. In particular, headers should be moved to the same table as the data.
	//Test that this doesn't need to be in finalizeCustomLayout too for images.
	if ($headerRow) {
		$thead.append($headerRow);
		$(".page").prepend($thead);
		$("#header").remove();
	}

	if (this.imageTotal == 0) {
		this.finalizeCustomLayout();
	}
}
}
RiseVision.Spreadsheet.prototype.finalizeCustomLayout = function() {
	//Only execute the following code if the layout is a table.
	if ($(this.layout).find("table").length > 0) {
		this.formatColumns($(".page th"));
		this.dataTable = $(".page").dataTable(this.sortConfig);

	//No need to calculate padding in percentage since it will work out to be the same result every time.
	$(".dataTables_scrollHead table tr th, td").css({
		"padding-top": this.spacing,
		"padding-bottom": this.spacing,
		"padding-left": this.colPadding,
		"padding-right": this.colPadding
	});

	//First cell shouldn't have any padding in front of it.
	$(".dataTables_scrollHead table tr th:first-child, td:first-child").css({
		"padding-left": "10px"
	});

	//Last cell shouldn't have any padding after it.
	$(".dataTables_scrollHead table tr th:last-child, td:last-child").css({
		"padding-right": "10px"
	});

	$(".dataTables_scrollBody").height(($("#container").outerHeight(true) - $(".dataTables_scrollHead").height()) / this.rsH * 100 + "%");
}

this.setFontSizes();
this.buildMenu();
this.handleConditions();
this.configureScrolling();

if (this.isLoading) {
	this.isLoading = false;
	readyEvent();
}
else {
	$(".dataTables_scrollBody").infiniteScroll.start();
}
}
RiseVision.Spreadsheet.prototype.buildMenu = function() {
	var self = this,
	classFound = false,
	menuWrapper = $("<div class='tableMenuWrapper' />"),
	menuBtn = $("<a href='#' class='tableMenuButton data_font-style'>Display</a>"),
	menuContainer = $("<div class='tableMenu tableMenuHidden data_font-style'><ul /></div>"),
	$toggle = null;

	//Check to see if any of the th elements have been assigned any of the responsive class names (i.e. persist, essential or optional).
	$(".dataTables_scrollHead th").each(function(i) {
		if ($(this).is(".persist, .essential, .optional")) {
			classFound = true;

			return false;
		}
	});

	//Not a responsive layout, so no need to build the menu.
	if (!classFound) {
		return;
	}

	//Iterate over each table heading.
	$(".dataTables_scrollHead th").each(function(i) {
		var th = $(this),
		classes = th.attr("class");

	//Loop through each row to assign any classes (essential, optional) to the matching cell.
	$("tbody tr").each(function() {
		var cell = $(this).find("th, td").eq(i);

		if (classes) {
			cell.addClass(classes);
		}
	});

	//Create the menu checkboxes.
	if (!th.is(".persist")) {
		$toggle = $("<li><input type='checkbox' id='toggleCol" + i + "' value='" + i + "' /> <label for='toggleCol" + i + "'>" + th.html() + "</label></li>");

		menuContainer.find("ul").append($toggle);

		//Assign event handlers to the checkbox.
		$toggle.find("input")
		.change(function() {
			var colIndex = parseInt($(this).val()),
			bVisible = self.dataTable.fnSettings().aoColumns[colIndex].bVisible,
			cellIndex = colIndex + 1;

			//Show or hide the column and redraw the table. Note that the column is removed from the DOM if hidden.
			self.dataTable.fnSetColumnVis(colIndex, bVisible ? false : true);
			th.css("display", "table-cell");
			$("tr > td:nth-child(" + cellIndex + ")").css("display", "table-cell");
		})
		//Custom event that sets the checked state for each checkbox based on column visibility, which is controlled by media queries.
		//Called whenever the window is resized or re-oriented (mobile).
		.bind("updateCheck", function() {
			var colIndex = parseInt($(this).val());

			if (th.css("display") == "table-cell") {
				$(this).attr("checked", true);
				self.dataTable.fnSetColumnVis(colIndex, true);
			}
			else {
				$(this).attr("checked", false);
				self.dataTable.fnSetColumnVis(colIndex, false);
			}
		})
	}
});

	//Call the custom event on each of the checkboxes.
	$(menuContainer.find("input")).each(function(i) {
		$(this).trigger("updateCheck");
	});

	//Update the checkboxes checked status.
	$(window).bind("orientationchange resize", function() {
		menuContainer.find("input").trigger("updateCheck");
	});

	menuBtn.click(function() {
		menuContainer.toggleClass("tableMenuHidden");
		return false;
	});

	menuWrapper.append(menuBtn).append(menuContainer);
	$(".dataTables_scrollHead table").before(menuWrapper);

	//Close menu when user clicks off it.
	$(document).click(function(e) {
		if (!$(e.target).is(menuContainer) && !$(e.target).is(menuContainer.find("*"))) {
			menuContainer.addClass("tableMenuHidden");
		}
	});
}
/* Format each column. */
RiseVision.Spreadsheet.prototype.formatColumns = function($elem) {
	var self = this,
	logosURL = "https://s3.amazonaws.com/risecontentlogos/financial/";

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
			width = width / self.rsW * 100 + "%";
			value.width = width;
		}

		$elem.eq(colIndex).css("text-align", value.alignment);
		$columns.css("text-align", value.alignment);

		//Decimals and Sign
		$columns.each(function(i) {
			if ($(this).text() && !isNaN($(this).text())) {
				var number;

				$(this).text(parseFloat($(this).text()).toFixed(value.decimals));

				number = $(this).text();

				if (value.sign == "none") {
					$(this).html(Math.abs(number).toFixed(value.decimals));
				}
				else if (value.sign == "minus") {
				//Do nothing. This is the default behavior.
			}
			else if (value.sign == "plusMinus") {
				if (parseFloat(number) > 0) {
					$(this).html("+" + number);
				}
			}
			else if (value.sign == "parentheses") {
				if (parseFloat(number) < 0) {
					$(this).html("(" + Math.abs(number).toFixed(value.decimals) + ")");
				}
			}
			else if (value.sign == "arrow") {
				var $img = $("<img class='arrow'>");

				$img.height($(this).height());

				$(this).html(Math.abs(number).toFixed(value.decimals));

				if (parseFloat(number) < 0) {
					$img.attr("src", logosURL + "animated-red-arrow.gif");
				}
				else if (parseFloat(number) >= 0) {
					$img.attr("src", logosURL + "animated-green-arrow.gif");
				}

				$(this).prepend($img);
			}
		}
	});
}
}
});
}
/* Use ems for all font sizes.*/
RiseVision.Spreadsheet.prototype.setFontSizes = function() {
	var headingFontSize = parseInt($(".heading_font-style").css("font-size")),
	dataFontSize = parseInt($(".data_font-style").css("font-size"));

	//The default font size of the body tag is 16px.
	headingFontSize = headingFontSize / 16;
	dataFontSize = dataFontSize / 16;

	$(".heading_font-style").css("font-size", headingFontSize + "em");
	$(".data_font-style, .tableMenuButton").css("font-size", dataFontSize + "em");
}
RiseVision.Spreadsheet.prototype.loadImage = function(url, $cell) {
	var self = this,
	img = new Image();

	img.onload = function () {
		$cell.append(this);
		self.onImageLoaded();
	}

	img.onerror = function() {
		self.onImageLoaded();
	}

	img.src = url;
}
RiseVision.Spreadsheet.prototype.onImageLoaded = function() {
	this.imagesLoaded++;

	//May have to resize headers after all images have loaded.
	if (this.imagesLoaded == this.imageTotal) {
		this.finalizeCustomLayout();
	}
}
RiseVision.Spreadsheet.prototype.configureScrolling = function() {
	var self = this;

	//Auto-scrolling.
	if ($(".dataTables_scrollBody").length > 0) {
		$(".dataTables_scrollBody").infiniteScroll({
			direction: this.scrollDirection,
			scrollBy: this.scrollBy,
			duration: this.duration,
			speed: this.scrollSpeed,
			swipingTimeout: this.interactivityTimeout
		});
	}
	else if ($("#scrollContainer").length > 0) {
		$("#scrollContainer").infiniteScroll({
			direction: this.scrollDirection,
			scrollBy: this.scrollBy,
			duration: this.duration,
			speed: this.scrollSpeed,
			swipingTimeout: this.interactivityTimeout
		});
	}
}
RiseVision.Spreadsheet.prototype.hasHeadings = function() {
	var hasHeading = false;

	for (var col = 0; col < this.data.getNumberOfColumns(); col++) {
		var label = this.data.getColumnLabel(col);

		if ((label != null) && (label != "")) {
			hasHeading = true;
			break;
		}
	}

	return hasHeading;
}
/* Render column headings. */
RiseVision.Spreadsheet.prototype.renderHeadings = function() {
	var $thead = $("<thead>"),
	$tr = $("<tr>"),
	hasHeadings = this.hasHeadings();

	for (var col = 0; col < this.data.getNumberOfColumns(); col++) {
		var $th = $("<th class='heading_font-style'>");

		if (hasHeadings) {
			$th.html(this.data.getColumnLabel(col));
		}

		$tr.append($th);
	}

	$thead.append($tr)
	$(".page").append($thead);
}
//Issue 838
RiseVision.Spreadsheet.prototype.updateHeadings = function() {
	var $th,
	hasHeadings = this.hasHeadings();

	for (var col = 0; col < this.data.getNumberOfColumns(); col++) {
		$th = $(".page thead th").eq(col);

		if (hasHeadings && ($th.length > 0)) {
			$th.html(this.data.getColumnLabel(col));
		}
	}
}
/* Render rows of data. */
RiseVision.Spreadsheet.prototype.renderRow = function(colsCount, row) {
	var $tr = $("<tr class='item'>");

	for (var col = 0; col < colsCount; col++) {
		var value = "", style = "";

		value = this.data.getFormattedValue(row, col);
		style = this.data.getProperty(row, col, "style");

	//Strip out the font-family that holds an incorrect value.
	if (style) {
		style = style.substring(0, style.indexOf("font-family:"));
	}

	this.addCell($tr, value, style, this.cols[col]);
}

$(".page").append($tr);
}
RiseVision.Spreadsheet.prototype.addCell = function($tr, value, style, className) {
	var $td = $("<td>");

	if (style != "") {
		$td.attr("style", style);
	}

	$td.addClass("data_font-style " + className);
	$td.html(value);
	$tr.append($td);
}
//Issue 734
RiseVision.Spreadsheet.prototype.addRows = function() {
	var row = 0,
	col = 0,
	numRows = this.data.getNumberOfRows(),
	numCols = this.data.getNumberOfColumns(),
	newRow;

	for (; row < numRows; row++) {
		newRow = [];

		for (col = 0; col < numCols; col++) {
			newRow.push(this.data.getFormattedValue(row, col));
		}

		this.dataTable.fnAddData(newRow);
	}

	$(".dataTables_scrollBody table tbody tr").addClass("item");
	$(".dataTables_scrollBody table tbody tr td").addClass("data_font-style");

	for (col = 0; col < numCols; col++) {
		$(".dataTables_scrollBody table tbody tr td:nth-child(" + (col + 1) + ")").addClass(this.cols[col]);
	}

	this.formatColumns($(".page th"));
}
RiseVision.Spreadsheet.prototype.checkForNoData = function() {
	//NODATA is returned by a DDE data source when the DDE application (e.g. Excel) is not open.
	if (this.data.getColumnId(0) == "NODATA") {
		if (!this.noDataFound && this.showStale) {
			this.noDataFound = true;

			$(".item").contents().each(function(index) {
				$(this).html($(this).html() + "*");
			});
		}

		if (!this.isLoading) {
			if ($(".dataTables_scrollBody").length > 0) {
				$(".dataTables_scrollBody").infiniteScroll.start();
			}
			else if ($("#scrollContainer").length > 0) {
				$("#scrollContainer").infiniteScroll.start();
			}
		}

		return true;
	}
	else {
		this.noDataFound = false;
		return false;
	}
}
RiseVision.Spreadsheet.prototype.handleConditions = function() {
	var self = this,
	colIndex = -1;

	//No need to save conditions if the data is not set to ever refresh.
	if (this.interval > 0) {
		if (!this.conditions) {
			this.conditions = {};
		}

		$.each(this.columns, function(index, value) {
			if (value.condition == "changeUp" || value.condition == "changeDown") {
				if (self.conditions.columns) {
			//Issue 1009 Start - Use index for self.conditions.columns instead of index from this.columns.
			$.each(self.conditions.columns, function(conditionIndex, conditionValue) {
				if (conditionValue.column == value.column) {
					colIndex = conditionIndex;

					return false;
				}
			});

			self.checkConditions(self.conditions.columns[colIndex], value.condition);
			//Issue 1009 End
		}
	}
	else if (value.condition == "valuePositive" || value.condition == "valueNegative") {
		self.checkSigns(value.column, value.condition);
	}
});

	this.saveConditions();	//TODO: No need to save for checkSigns?
}
}
RiseVision.Spreadsheet.prototype.checkSigns = function(column, condition) {
	var colIndex = $("." + column + ":first").parent().children().index($("." + column + ":first"));

	for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
		var current = this.data.getValue(row, colIndex);

		if (isNaN(current)) {
			current = current.replace(/[^0-9\.-]+/g,"");
			current = parseFloat(current);
		}

		if (!isNaN(current)) {
			var $cell = $("." + this.cols[colIndex]).eq(row);

			if (condition == "valuePositive") {
				if (current >= 0) {
					$cell.addClass("valuePositivePositive");
				}
				else {
					$cell.addClass("valuePositiveNegative");
				}
			}
			else {
				if (current < 0) {
					$cell.addClass("valueNegativeNegative");
				}
				else {
					$cell.addClass("valueNegativePositive");
				}
			}
		}
	}
}
//Compare new values to old one's.
RiseVision.Spreadsheet.prototype.checkConditions = function(column, condition) {
	var colIndex = $("." + column.column + ":first").parent().children().index($("." + column.column + ":first"));

	for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
		var current = this.data.getValue(row, colIndex),
		previous = column.values[row];

		if (isNaN(current)) {
			current = current.replace(/[^0-9\.-]+/g,"");
			current = parseFloat(current);
		}

		if (isNaN(previous)) {
			previous = previous.replace(/[^0-9\.-]+/g,"");
			previous = parseFloat(previous);
		}

	//The data type of a column can still be a number even if there is string data in it.
	//To be sure, let's check that the values we are comparing are numbers.
	if (current != previous && !isNaN(current) && !isNaN(previous)) {
		var $cell = $("." + column.column).eq(row);

		if (condition == "changeUp") {
			if (current > previous) {
				$cell.addClass("changeUpIncrease");
			}
			else {
				$cell.addClass("changeUpDecrease");
			}
		}
		else {
			if (current < previous) {
				$cell.addClass("changeDownDecrease");
			}
			else {
				$cell.addClass("changeDownIncrease");
			}
		}
	}
}
}
RiseVision.Spreadsheet.prototype.saveConditions = function() {
	var self = this
	i = 0;

	self.conditions.columns = [];

	$.each(this.columns, function(index, value) {
		if (value.condition == "changeUp" || value.condition == "changeDown") {
			self.conditions.columns.push({
				column: value.column,
				values: []
			});

			self.saveCondition(self.conditions.columns[i].values, value.column);
			i++;
		}
	});
}
/* Store the current values so they can be compared to new values on a refresh. */
RiseVision.Spreadsheet.prototype.saveCondition = function(values, column) {
	var colIndex = $("." + column + ":first").parent().children().index($("." + column + ":first"));

	for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
		values.push(this.data.getValue(row, colIndex));
	}
}
RiseVision.Spreadsheet.prototype.isHorizontal = function() {
	return this.scrollDirection == "rtl" || this.scrollDirection == "ltr";
}
RiseVision.Spreadsheet.prototype.initHorizontalScroll = function() {
	var self = this,
	classes = document.styleSheets[2].cssRules,
	settings = {
		url: this.url,
		refreshInterval: this.interval,
		callback: function(result) {
			var numRows = result.getNumberOfRows(),
			fontRule = "",
			item;

		//Get proper CSS font rule.
		for (var i = 0; i < classes.length; i++) {
			if (classes[i].selectorText == ".data_font-style") {
				fontRule = classes[i].cssText;
				break;
			}
		}

		if (self.isLoading) {
			$("#container").remove();
			self.isLoading = false;
		}

		if (self.horizontalScroll == null) {
			if (numRows > 0) {
				var data = [];

				for (var row = 0; row < numRows; row++) {
					data.push(self.getHorizontalScrollData(row, result, fontRule));
				}

				self.horizontalScroll = new RiseVision.Common.HorizontalScroll({
					width: self.rsW,
					height: self.rsH,
					scrollBy: self.prefs.getString("scrollBy"),
					scrollDirection: self.prefs.getString("scrollDirection"),
					duration: self.prefs.getInt("duration") * 1000,
					speed: self.scrollSpeed,
					interactivityTimeout: self.interactivityTimeout,
					spacing: self.prefs.getInt("spacing")
				}, data);

				$(self.horizontalScroll).bind({
					done: function() {
						doneEvent();
					}
				});

			//Need to add a delay that allows sufficient time for the custom font to be loaded by the div tag.
			//If the font is not already loaded, the canvas can't use it.
			setTimeout(function() {
				self.horizontalScroll.initialize();
			}, 1000);
		}
	}
		//Refresh data.
		else {
			if (numRows == 0) {
				self.horizontalScroll.clear();
			}
			else {
				for (var row = 0; row < numRows; row++) {
					item = self.getHorizontalScrollData(row, result, fontRule);
					self.horizontalScroll.updateItem(row, item);
				}
			}
		}
	}
};

this.viz.getData(settings);
}
RiseVision.Spreadsheet.prototype.getHorizontalScrollData = function(row, result, fontRule) {
	var numCols = result.getNumberOfColumns(),
	rowData = "",
	item = [];

	for (var col = 0; col < numCols; col++) {
		if (rowData == "") {
			rowData = result.getFormattedValue(row, col);
		}
		else {
			rowData = rowData + " " + result.getFormattedValue(row, col);
		}
	}

	item.push({
		type: "text",
		value: rowData,
		fontRule: fontRule
	});

	return item;
}
RiseVision.Spreadsheet.prototype.play = function() {
	if (!this.isHorizontal()) {
		if ($(".dataTables_scrollBody").length > 0) {
			$(".dataTables_scrollBody").infiniteScroll.start();
		}
		else if ($("#scrollContainer").length > 0) {
			$("#scrollContainer").infiniteScroll.start();
		}
	}

	if (this.isPaused) {
		this.isPaused = false;

		if (this.isHorizontal()) {
			this.horizontalScroll.tick();
		}
	}
}
RiseVision.Spreadsheet.prototype.pause = function() {
	this.isPaused = true;

	if (this.isHorizontal()) {
		this.horizontalScroll.pause();
	}
	else if (!this.isLoading) {
		if ($(".dataTables_scrollBody").length > 0) {
			$(".dataTables_scrollBody").infiniteScroll.pause();
		}
		else if ($("#scrollContainer").length > 0) {
			$("#scrollContainer").infiniteScroll.pause();
		}
	}
}