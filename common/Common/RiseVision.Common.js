var RiseVision = RiseVision || {};

RiseVision.Common = RiseVision.Common || {};
RiseVision.Common.Settings = {};
RiseVision.Common.Picker = {};
RiseVision.Common.Visualization = {};
RiseVision.Common.Financial = {};
RiseVision.Common.Financial.Helper = {};
RiseVision.Common.Financial.RealTime = {};
RiseVision.Common.Financial.Historical = {};
RiseVision.Common.Financial.Historical.CollectionTimes = {};
RiseVision.Common.HorizontalScroll = {};
RiseVision.Common.Item = {};
RiseVision.Common.Scroller = {};
RiseVision.Common.Authorization = {};
RiseVision.Common.Font = {};
RiseVision.Common.Utility = {};

/*
 * Validation functions for custom Gadget settings.
 */
RiseVision.Common.Settings = function() {
}
RiseVision.Common.Settings.prototype.validateRequired = function($element, errors, fieldName) {
  //Don't validate element if it's hidden.
  if (!$element.is(":visible")) {
    return false;
  }
  else {
    if (!$.trim($element.val())) {
      errors.innerHTML += fieldName + " is a required field.<br />";
      return true;
    }
    else {
      return false;
    }
  }
}
RiseVision.Common.Settings.prototype.validateNumeric = function($element, errors, fieldName) {
  //Don't validate element if it's hidden.
  if (!$element.is(":visible")) {
    return false;
  }
  else {
    if (isNaN($element.val())) {
      errors.innerHTML += "The " + fieldName + " field must contain only numbers.<br />";
      return true;
    }
    else {
      return false;
    }
  }
}
/*
 * Show Google Picker dialog box.
 */
RiseVision.Common.Picker = function() {
}
RiseVision.Common.Picker.prototype.showPicker = function(id, type) {
  gadgets.rpc.call("", "rscmd_openGooglePicker", null, id, type);
}
/*
 * Use id returned by Google picker to query Spreadsheet API for worksheets.
 */
RiseVision.Common.Picker.prototype.getSheets = function(params) {
  var data, option, href;
  var self = this, sheets = [];

  $.getJSON(encodeURI("https://spreadsheets.google.com/feeds/worksheets/" + params.docID + "/public/basic?alt=json&dummy=" + Math.ceil(Math.random() * 100)))
    .done(function(data) {
      for (var i = 0; i < data.feed.entry.length; i++) {
        option = document.createElement("option");
        option.text = data.feed.entry[i].title.$t;  //Sheet name
        //Issue 960 Start - Visualization API doesn't refresh properly if 'pub' parameter is present, so remove it.
        href = data.feed.entry[i].link[2].href;
        href = href.replace("&pub=1", "");  //Visualization URL

        //Issue 1130 - Use docs.google.com domain when using new Google Sheets due to this bug - http://goo.gl/4Zf8LQ.
        //If /gviz/ is in the URL path, then use this as an indicator that the new Google Sheets is being used.
        if (href.indexOf("/gviz/") == -1) {
          option.value = href;
        }
        else {
          option.value = href.replace("spreadsheets.google.com", "docs.google.com");
        }

        sheets.push(option);
      }

      params.callback(sheets);
    })
    .fail(function(jqxhr, textStatus, error) {
      $(".errors").empty();
      $(".errors").append("To use this spreadsheet, it first needs to be published to the web. From the Google Spreadsheet menu, select " + "<em>File > Publish to the web</em>, and then click the <em>Start Publishing</em> button. Once done, select your file from the " + "Google Drive link again.");
      $(".errors").css("display", "inline-block");
      $("li.more").hide();

      console.log(jqxhr.status + " - " + jqxhr.statusText);
      console.log(jqxhr.responseText);

      params.callback(null);
    });
}
RiseVision.Common.Picker.prototype.getURL = function(params) {
  var url = "";

  url = params.baseURL;

  if (params.headerRows != "") {
    url += "&headers=" + params.headerRows;
  }

  if (params.range != "") {
    url += "&range=" + params.range;
  }

  return url;
}
/*
 * Use the Google Visualization API to read data from a Google spreadsheet or other visualization data source.
 */
RiseVision.Common.Visualization = function() {
  this.query = null;
  this.isVisualizationLoaded = false;
}
RiseVision.Common.Visualization.prototype.getData = function(opts) {
  this.url = opts.url;
  this.refreshInterval = opts.refreshInterval;
  this.timeout = opts.timeout || 30;
  this.callback = opts.callback;
  this.params = opts.params;
  //Issue 903

  if (opts.queryString) {
    this.queryString = opts.queryString;
  }

  //For some reason, trying to load the Visualization API more than once does not execute the callback function.
  if (!this.isVisualizationLoaded) {
    this.loadVisualizationAPI();
  }
  else {
    this.sendQuery();
  }
}
RiseVision.Common.Visualization.prototype.loadVisualizationAPI = function() {
  var self = this;

  google.charts.load('current', {
    packages: ['corechart'],
    callback: function() {
      self.isVisualizationLoaded = true;
      self.sendQuery();
    }
  });
}
RiseVision.Common.Visualization.prototype.sendQuery = function() {
  var self = this;

  if (this.query != null) {
    this.query.abort();
  }

  this.query = new google.visualization.Query(this.url);
  this.query.setRefreshInterval(this.refreshInterval);

  //Sets the number of seconds to wait for the data source to respond before raising a timeout error.
  this.query.setTimeout(this.timeout);

  if (this.queryString) {
    this.query.setQuery(this.queryString);
  }

  this.query.send(function onQueryExecuted(response) {
    self.onQueryExecuted(response);
  });
}
RiseVision.Common.Visualization.prototype.onQueryExecuted = function(response) {
  if (response == null) {
    this.callback(response, this.params);
  }
  else {
    if (response.isError()) {
      console.log("Message: " + response.getMessage());
      console.log("Detailed message: " + response.getDetailedMessage());
      console.log("Reasons: " + response.getReasons());
      this.callback(null, this.params);
    }
    else {
      this.callback(response.getDataTable(), this.params);
    }
  }
}
RiseVision.Common.Financial.Helper = function(instruments) {
  this.instruments = instruments;
}
RiseVision.Common.Financial.Helper.prototype.setInstruments = function(instruments) {
  this.instruments = instruments;
}
RiseVision.Common.Financial.Helper.prototype.getInstruments = function(isLoading, collectionTimes) {
  var self = this;

  if (isLoading) {
    return this.instruments.join("|");
  }
  else {
    var dayOfWeek = new Date().getDay(), len = collectionTimes.length, instruments = [];

    $.each(this.instruments, function(i, instrument) {
      for (var j = 0; j < len; j++) {
        if (instrument == collectionTimes[j].instrument) {
          var startTime = collectionTimes[j].startTime, endTime = collectionTimes[j].endTime, daysOfWeek = collectionTimes[j].daysOfWeek;

          //Check if the instrument should be requested again based on its collection data.
          $.each(daysOfWeek, function(j, day) {
            //Check collection day.
            if (day == dayOfWeek) {
              //Check collection time.
              if (new Date().between(startTime, endTime)) {
                instruments.push(self.instruments[i]);
              }

              return false;
            }
          });
        }
      }
    });

    return instruments.join("|");
  }
}

RiseVision.Common.Financial.RealTime = function(displayID, instruments) {
  var self = this;

  if (displayID) {
    this.displayID = displayID;
  }
  else {
    this.displayID = "preview";
  }

  //Trim any whitespace from instruments.
  instruments = instruments.split(",");

  $.each(instruments, function(index, value) {
    instruments[index] = $.trim(instruments[index]);
  });

  this.instruments = instruments;
  this.isLoading = true;
  this.conditions = {};
  this.collectionTimes = [];
  this.updateInterval = 60000;
  this.now = Date.today();
  //Issue 922
  this.url = "http://contentfinancial2.appspot.com/data?";
  this.logosURL = "https://s3.amazonaws.com/risecontentlogos/financial/";
  this.viz = new RiseVision.Common.Visualization();
  this.helper = new RiseVision.Common.Financial.Helper(this.instruments);
}
RiseVision.Common.Financial.RealTime.prototype.setInstruments = function(instruments) {
  //Trim any whitespace from instruments.
  instruments = instruments.split(",");

  $.each(instruments, function(index, value) {
    instruments[index] = $.trim(instruments[index]);
  });

  this.isLoading = true;
  this.collectionTimes = [];
  this.instruments = instruments;
  this.helper.setInstruments(this.instruments);
}
/* fields is an array of fields to request from data server. Note: instrument column is always requested. */
/* Financial Data */
RiseVision.Common.Financial.RealTime.prototype.getData = function(fields, loadLogos, isChain, callback) {
  var self = this, duplicateFound = false, fieldCount = 0, queryString = "select instrument", codes = "";

  this.dataFields = {};
  this.dataFields["instrument"] = 0;
  //TODO: Get rid of startTimeIndex and append instruments as last column?
  this.startTimeIndex = 1;
  //Used to determine where collection data columns are.

  if (this.isLoading) {
    this.callback = callback;
  }

  //Build the query string.
  $.each(fields, function(index, field) {
    duplicateFound = false;

    //Do nothing as instrument is already being requested.
    if (field == "instrument") {
    }
    else {
      //Visualization API doesn't allow requesting the same field more than once.
      $.each(self.dataFields, function(i, dataField) {
        if (i == field) {
          duplicateFound = true;
          return false;
        }
      });

      if (!duplicateFound) {
        queryString += ", " + field;
        //Create a mapping between field names and column indices.
        self.dataFields[field] = fieldCount + 1;
        fieldCount++;
        self.startTimeIndex++;
      }
    }
  });

  this.logoCount = 0;
  queryString += ", startTime, endTime, daysOfWeek, timeZoneOffset";

  //Issue 922 Start
  if (!Date.equals(Date.today(), this.now)) {
    this.now = Date.today();

    for (var i = 0; i < this.collectionTimes.length; i++) {
      this.collectionTimes[i].startTime.addDays(1);
      this.collectionTimes[i].endTime.addDays(1);
    }
  }
  //Issue 922 End

  codes = this.helper.getInstruments(this.isLoading, this.collectionTimes);

  //Perform a search for the instruments.
  if (codes) {
    var self = this, options = {
      url : this.url + "id=" + this.displayID + "&codes=" + encodeURIComponent(codes),
      refreshInterval : 0,
      queryString : queryString,
      callback : function rtCallback(data) {
        self.onRealTimeDataLoaded(data, loadLogos, isChain);
      }
    };

    //Start a timer in case there is a problem loading the data (i.e. Internet has been disconnected).
    this.getDataTimer = setTimeout(function() {
      self.getData(fields, loadLogos, isChain, callback);
    }, this.updateInterval);

    this.viz.getData(options);
  }
  else {
    callback(null);
  }
}
RiseVision.Common.Financial.RealTime.prototype.onRealTimeDataLoaded = function(data, loadLogos, isChain) {
  if (data != null) {
    clearTimeout(this.getDataTimer);

    this.data = data;

    if (this.isLoading) {
      this.isLoading = false;

      if (this.collectionTimes.length == 0) {
        this.saveCollectionTimes();
      }

      if (loadLogos) {
        this.loadLogos();
      }
      else {
        if (this.callback) {
          this.callback(this.data, this.logoURLs);
        }
      }
    }
    else {
      if (loadLogos && isChain) {
        this.loadLogos();
      }
      else {
        if (this.callback) {
          this.callback(this.data, this.logoURLs);
        }
      }
    }
  }
  //Timeout or some other error occurred.
  else {
    console.log("Error encountered loading real-time data for: ");
    console.log(this.instruments[0]);
  }
}
RiseVision.Common.Financial.RealTime.prototype.saveCollectionTimes = function() {
  var numRows, timeZoneOffset, startTime, endTime;

  numRows = this.data.getNumberOfRows();

  //Only need to save collection time once for the entire chain.
  //Use the collection data from the first stock since the rest should all be the same.
  //Data is for a chain if there is only one instrument being requested, but multiple rows of data are returned.
  if ((this.instruments.length == 1) && (this.data.getNumberOfRows() > 1)) {
    if ((this.data.getValue(0, 0) != "INVALID_SYMBOL")) {
      // If the data is stale, then force collection times to be saved again later.
      if (this.data.getValue(0, 0) == "...") {
        this.isLoading = true;
      }
      else {
        timeZoneOffset = this.data.getValue(0, this.startTimeIndex + 3);
        startTime = this.data.getValue(0, this.startTimeIndex);
        endTime = this.data.getValue(0, this.startTimeIndex + 1);

        if (startTime && endTime && timeZoneOffset != "N/P") {
          this.collectionTimes.push({
            "instrument" : this.instruments[0],
            "startTime" : startTime.setTimezoneOffset(timeZoneOffset),
            "endTime" : endTime.setTimezoneOffset(timeZoneOffset),
            "daysOfWeek" : this.data.getFormattedValue(0, this.startTimeIndex + 2).split(",")
          });
        }
      }
    }
  }
  //Save collection data for each stock.
  else {
    for (var row = 0; row < numRows; row++) {
      if (this.data.getValue(row, 0) != "INVALID_SYMBOL") {
        // If the data is stale, then force collection times to be saved again later.
        if (this.data.getValue(row, 0) == "...") {
          this.isLoading = true;
        }
        else {
          timeZoneOffset = this.data.getValue(row, this.startTimeIndex + 3);
          startTime = this.data.getValue(row, this.startTimeIndex);
          endTime = this.data.getValue(row, this.startTimeIndex + 1);

          if (startTime && endTime && timeZoneOffset != "N/P") {
            this.collectionTimes.push({
              "instrument" : this.instruments[row],
              "startTime" : startTime.setTimezoneOffset(timeZoneOffset),
              "endTime" : endTime.setTimezoneOffset(timeZoneOffset),
              "daysOfWeek" : this.data.getFormattedValue(row, this.startTimeIndex + 2).split(",")
            });
          }
        }
      }
    }

    if (this.collectionTimes.length == 0) {
      console.log(this.collectionTimes);
    }
  }
}
//Preload the logos.
RiseVision.Common.Financial.RealTime.prototype.loadLogos = function() {
  var numRows = this.data.getNumberOfRows();

  this.logoCount = 0;
  this.urls = new Array();
  this.logoURLs = new Array();

  for (var row = 0; row < numRows; row++) {
    this.urls.push(this.logosURL + this.data.getFormattedValue(row, 0) + ".svg");
  }

  this.loadLogo(this.urls.length);
}
//Load each logo.
RiseVision.Common.Financial.RealTime.prototype.loadLogo = function(toLoad) {
  var logo, self = this;

  logo = new Image();
  logo.onload = function() {
    self.logoURLs.push(logo.src);
    self.onLogoLoaded(toLoad);
  }

  logo.onerror = function() {
    self.logoURLs.push(null);
    self.onLogoLoaded(toLoad);
  }

  logo.src = this.urls[this.logoCount];
}
RiseVision.Common.Financial.RealTime.prototype.onLogoLoaded = function(toLoad) {
  this.logoCount++;
  toLoad--;

  if (toLoad == 0) {
    if (this.callback) {
      this.callback(this.data, this.logoURLs);
    }
  }
  else {
    this.loadLogo(toLoad);
  }
}
/* Conditions */
RiseVision.Common.Financial.RealTime.prototype.checkSigns = function(field) {
  var row = 0, signs = [], current, sign;

  for ( row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
    current = this.data.getValue(row, this.dataFields[field]);

    if (isNaN(current)) {
      current = current.replace(/[^0-9\.-]+/g, "");
      current = parseFloat(current);
    }

    if (!isNaN(current)) {
      if (current >= 0) {
        sign = 1;
      }
      else {
        sign = -1;
      }

      signs.push(sign);
    }
  }

  return signs;
}
/* Return 1 if current value is greater than the previous value.
 Return 0 if both values are equal.
 Return -1 if current value is less than the previous value. */
RiseVision.Common.Financial.RealTime.prototype.compare = function(field) {
  var self = this, current = 0, previous = 0, result = [], matchFound = false;

  if (this.conditions[field]) {
    for ( row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
      current = this.data.getValue(row, this.dataFields[field]);
      matchFound = false;

      $.each(this.conditions[field], function(index, value) {
        //Instrument is used to ensure that the rows that are being compared are for the same stock.
        //In chains, rows may be added or deleted.
        if (value.instrument == self.data.getValue(row, 0)) {
          previous = value.value;

          if (isNaN(current)) {
            current = current.replace(/[^0-9\.-]+/g, "");
            current = parseFloat(current);
          }

          if (isNaN(previous)) {
            previous = previous.replace(/[^0-9\.-]+/g, "");
            previous = parseFloat(previous);
          }

          //The data type of a column can still be a number even if there is string data in it.
          //To be sure, let's check that the values we are comparing are numbers.
          if (!isNaN(current) && !isNaN(previous)) {
            if (current != previous) {
              if (current > previous) {
                result.push(1);
              }
              else {
                result.push(-1);
              }
            }
            //They are equal.
            else {
              result.push(0);
            }
          }

          matchFound = true;

          return false;
        }
      });

      //No match found for this instrument (ie it's new).
      if (!matchFound) {
        result.push(0);
      }
    }
  }

  this.saveBeforeValues([field]);

  return result;
}
RiseVision.Common.Financial.RealTime.prototype.saveBeforeValues = function(fields) {
  var self = this;

  $.each(fields, function(index, value) {
    self.conditions[value] = [];
    self.saveBeforeValue(value, self.dataFields[value]);
  });
}
/* Store the current values so they can be compared to new values on a refresh. */
RiseVision.Common.Financial.RealTime.prototype.saveBeforeValue = function(field, colIndex) {
  for (var row = 0, numRows = this.data.getNumberOfRows(); row < numRows; row++) {
    this.conditions[field].push({
      "instrument" : this.data.getValue(row, 0),
      "value" : this.data.getValue(row, colIndex)
    });
  }
}

RiseVision.Common.Financial.Historical = function(displayID, instrument, duration) {
  var self = this;

  if (displayID) {
    this.displayID = displayID;
  }
  else {
    this.displayID = "preview";
  }

  this.instrument = instrument;
  this.duration = duration;
  this.isLoading = true;
  this.updateInterval = 60000;
  this.now = Date.today();
  //Issue 922
  this.url = "http://contentfinancial2.appspot.com/data/historical?";
  this.historicalViz = new RiseVision.Common.Visualization();
  this.helper = new RiseVision.Common.Financial.Helper([this.instrument]);
}
RiseVision.Common.Financial.Historical.prototype.setInstrument = function(instrument) {
  this.isLoading = true;
  this.instrument = instrument;
  this.helper.setInstruments([this.instrument]);
}
RiseVision.Common.Financial.Historical.prototype.setDuration = function(duration) {
  this.duration = duration;
}
RiseVision.Common.Financial.Historical.prototype.setIsUpdated = function(isUpdated) {
  CollectionTimes.getInstance().setIsUpdated(this.instrument, isUpdated);
}
/* Historical Financial data - Only one stock can be requested at a time. */
RiseVision.Common.Financial.Historical.prototype.getHistoricalData = function(fields, callback, options) {
  var self = this, queryString = "select " + fields.join() + " ORDER BY tradeTime", codes = "";

  //Customize the query string.
  if (options) {
    if (options.sortOrder) {
      if (options.sortOrder == "desc") {
        queryString += " desc";
      }
    }

    if (options.limit) {
      queryString += " LIMIT " + options.limit;
    }
  }

  CollectionTimes.getInstance().addInstrument(this.instrument, this.now, function(times, now) {
    self.now = now;
    codes = self.helper.getInstruments(self.isLoading, [times]);

    //Perform a search for the instrument.
    if (codes) {
      options = {
        url : self.url + "id=" + self.displayID + "&code=" + self.instrument + "&kind=" + self.duration,
        refreshInterval : 0,
        queryString : queryString,
        callback : function histCallback(data) {
          self.onHistoricalDataLoaded(data, times, callback);
        }
      };

      //Start a timer in case there is a problem loading the data (i.e. Internet has been disconnected).
      self.getHistoricalDataTimer = setTimeout(function() {
        self.getHistoricalData(fields, callback, options);
      }, self.updateInterval);

      self.historicalViz.getData(options);
    }
    //Request has been made outside of collection times.
    else {
      callback(null);
    }
  });
}
RiseVision.Common.Financial.Historical.prototype.onHistoricalDataLoaded = function(data, times, callback) {
  var numDataRows = 0;

  if (data != null) {
    clearTimeout(this.getHistoricalDataTimer);

    this.historicalData = data;
    numDataRows = data.getNumberOfRows();

    if ((numDataRows == 0) || ((numDataRows == 1) && (data.getFormattedValue(0, 0) == "0"))) {
      this.isLoading = true;
    }
    else {
      this.isLoading = false;
    }

    if (this.historicalData != null) {
      callback({
        "data" : this.historicalData,
        "collectionData" : times
      });
    }
    else {
      callback({
        "collectionData" : times
      });
    }
  }
  //Timeout or some other error occurred.
  else {
    console.log("Error encountered loading historical data for: ");
    console.log(this);
  }
}
/*
 * Singleton object to handle retrieving collection times for a historical instrument.
 */
var CollectionTimes = (function() {
  //Private variables and functions.
  var instantiated = false, instruments = [];

  function init() {
    //Issue 903 Start
    function loadCollectionTimes(instrument, callback) {
      var updateInterval = 60000, viz = new RiseVision.Common.Visualization(), options;

      //Start a timer in case there is a problem loading the data (i.e. Internet has been disconnected).
      collectionTimesTimer = setTimeout(function() {
        loadCollectionTimes(instrument, callback);
      }, updateInterval);

      options = {
        //Change me for Production.
        url : "http://contentfinancial2.appspot.com/info?codes=" + instrument,
        refreshInterval : 0,
        queryString : "select startTime, endTime, daysOfWeek, timeZoneOffset, updateInterval",
        callback : function(result, timer) {
          viz = null;

          if (result != null) {
            clearTimeout(timer);
            saveCollectionTimes(instrument, result);
            callback();
          }
          //Timeout or some other error occurred.
          else {
            console.log("Error encountered loading collection times for: " + instrument);
          }
        },
        params : collectionTimesTimer
      };

      viz.getData(options);
    }

    //Issue 903 End

    function saveCollectionTimes(instrument, data) {
      var numRows, startTime, endTime, timeZoneOffset;

      if (data != null) {
        numRows = data.getNumberOfRows();

        for (var i = 0; i < instruments.length; i++) {
          if (instruments[i].instrument == instrument) {
            timeZoneOffset = data.getValue(0, 3);
            startTime = data.getValue(0, 0);
            endTime = data.getValue(0, 1);

            instruments[i].collectionTimes = {
              "instrument" : instrument,
              "startTime" : startTime.setTimezoneOffset(timeZoneOffset),
              "endTime" : endTime.setTimezoneOffset(timeZoneOffset),
              "daysOfWeek" : data.getFormattedValue(0, 2).split(","),
              "timeZoneOffset" : timeZoneOffset,
              "isUpdated" : true
            };

            break;
          }
        }
      }
    }

    return {
      setIsUpdated : function(instrument, isUpdated) {
        for (var i = 0; i < instruments.length; i++) {
          if (instruments[i].instrument == instrument) {
            if (instruments[i].collectionTimes != null) {
              instruments[i].collectionTimes.isUpdated = isUpdated;
            }
          }
        }
      },
      addInstrument : function(instrument, now, callback) {
        var i = 0, instrumentFound = false, collectionTimesFound = false;

        //Check if there is already collection data for this instrument.
        for (; i < instruments.length; i++) {
          if (instruments[i].instrument == instrument) {
            //Issue 922 Start
            if (instruments[i].collectionTimes != null) {
              if ((!Date.equals(Date.today(), now)) && (!instruments[i].collectionTimes.isUpdated)) {
                now = Date.today();
                instruments[i].collectionTimes.startTime.addDays(1);
                instruments[i].collectionTimes.endTime.addDays(1);
                instruments[i].collectionTimes.isUpdated = true;
              }

              collectionTimesFound = true;
            }
            //Issue 922 End

            instrumentFound = true;
            break;
          }
        }

        if (collectionTimesFound) {
          callback(instruments[i].collectionTimes, now);
        }
        else {
          if (!instrumentFound) {
            instruments.push({
              instrument : instrument,
              collectionTimes : null
            });
          }

          loadCollectionTimes(instrument, function() {
            callback(instruments[i].collectionTimes, now);
          });
        }
      }
    }
  }

  //Public functions.
  return {
    getInstance : function() {
      if (!instantiated) {
        instantiated = init();
      }

      return instantiated;
    }
  }
})()

/*
 * Scroll horizontally on HTML5 canvas.
 */
RiseVision.Common.HorizontalScroll = function(settings, data) {
  //Private variables
  var scrollers = [], totalPixels = 0, isStopped = false, interactivityTimerID = null, options = {
    width : 800,
    height : 75,
    scrollBy : "item",
    scrollDirection : "rtl",
    speed : "medium",
    spacing : 20,
    duration : 10000,
    interactivityTimeout : 5000
  };

  //Merge settings with options.
  if (settings) {
    $.extend(options, settings);
  }

  //Public variables
  this.scroller = document.createElement("canvas");
  this.scroller.id = "scroller"
  this.scroller.width = options.width;
  this.scroller.height = options.height;
  //this.scroller.height = 75;
  this.interactivityTimeout = options.interactivityTimeout;
  this.context = this.scroller.getContext("2d");
  this.data = data;
  this.isHolding = false;
  this.isLoading = true;

  this.items = [];
  this.previousItemIndex = -1;
  this.itemCount = 0;
  this.currentItemIndex = 0;

  this.mouseDown = false;
  this.mouseMove = false;
  this.lastMouseX = 0;

  //Number of pixels to move per each redraw.
  if (options.speed) {
    if (options.speed == "fastest") {
      this.speed = 5;
    }
    else if (options.speed == "fast") {
      this.speed = 4;
    }
    else if (options.speed == "medium") {
      this.speed = 3;
    }
    else if (options.speed == "slow") {
      this.speed = 2;
    }
    else if (options.speed == "slowest") {
      this.speed = 1;
    }
  }
  else {
    this.speed = 3;
    //Backwards compatability.
  }

  if (options.scrollDirection == "ltr") {
    this.speed = -this.speed;
  }

  //Getters
  this.getScrollBy = function() {
    return options.scrollBy;
  }
  this.getScrollDirection = function() {
    return options.scrollDirection;
  }
  this.getDuration = function() {
    return options.duration;
  }
  this.getScroller = function(index) {
    return scrollers[index];
  }
  this.getScrollers = function() {
    return scrollers;
  }
  this.getTotalPixels = function() {
    return totalPixels;
  }
  this.getIsStopped = function() {
    return isStopped;
  }
  this.getInteractivityTimerID = function() {
    return interactivityTimerID;
  }
  this.getSpacing = function() {
    return options.spacing;
  }
  //Setters
  this.setScroller = function(index, value) {
    scrollers[index] = value;
  }
  this.setTotalPixels = function(value) {
    totalPixels = value;
  }
  this.setIsStopped = function(value) {
    isStopped = value;
  }

  document.body.appendChild(this.scroller);

  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(/* function */callback, /* DOMElement */element) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  window.cancelRequestAnimFrame = (function() {
    return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
  })();
}
//Create separate canvas for each data item.
RiseVision.Common.HorizontalScroll.prototype.initialize = function() {
  var text = "", self = this;

  this.scroller.onmousemove = function(e) {
    self.handleMouseMove(e);
  }

  this.scroller.onmousedown = function(e) {
    self.handleMouseDown(e);
  }

  this.scroller.onmouseup = function(e) {
    self.handleMouseUp(e);
  }

  this.scroller.onmouseout = function(e) {
    self.handleMouseOut(e);
  }
  //Create 2 Scroller objects.
  for (var i = 0; i < 2; i++) {
    if (this.getScrollDirection() == "rtl") {
      this.setScroller(i, new RiseVision.Common.Scroller(i * this.scroller.width, this.scroller.width, this.scroller.height));
    }
    else {
      this.setScroller(i, new RiseVision.Common.Scroller(-i * this.scroller.width, this.scroller.width, this.scroller.height));
    }
  }

  this.totalWidth = 0;
  this.itemsCount = 1;

  var length = this.data.length;

  if (length > 0) {
    this.loadItem();
  }
}
RiseVision.Common.HorizontalScroll.prototype.loadItem = function() {
  var item = new RiseVision.Common.Item(this.data[this.currentItemIndex], this.scroller, this.getSpacing(), this.getScrollDirection()), self = this;

  item.initialize(function() {
    self.items[self.currentItemIndex] = this;
    self.totalWidth += this.getWidth();
    self.onItemInitialized();
  });
}
RiseVision.Common.HorizontalScroll.prototype.onItemInitialized = function() {
  this.itemCount++;

  //All items have been loaded.
  if (this.itemCount == this.data.length) {
    for (var i = 0; i < this.getScrollers().length; i++) {
      this.adjustCanvas(i);
    }

    this.currentItemIndex = 0;

    readyEvent();
  }
  else {
    this.currentItemIndex++;
    this.loadItem();
  }
}
RiseVision.Common.HorizontalScroll.prototype.adjustCanvas = function(i, swipeDirection) {
  var itemPosition = 0, isCopied = false, isMovingForward = true;

  if (!swipeDirection) {//Auto-scroll
    swipeDirection = this.getScrollDirection();
  }

  if (this.getScrollDirection() == "rtl") {
    if (swipeDirection == "rtl") {
      this.getScroller(i).writeDirection = "forward";
    }
    else {
      this.getScroller(i).writeDirection = "backward";
    }
  }
  else {
    if (swipeDirection == "rtl") {
      this.getScroller(i).writeDirection = "backward";
    }
    else {
      this.getScroller(i).writeDirection = "forward";
    }
  }

  if (this.getScrollBy() == "item") {
    var j, index;

    //Get position at which to start copying based on position of other scroller at which copying was stopped.
    this.getScroller(i).holdPositions = [];
    itemPosition = this.getItemPosition(this.getNextScrollerIndex(i), swipeDirection);

    //Copy until the scroller is filled, or until we have finished copying all of the text associated with the current ID.
    while (this.getScroller(i).totalPixelsCopied < this.getScroller(i).canvas.width) {
      if (this.getScroller(i).totalPixelsCopied == 0) {
        if (((this.getScrollDirection() == "rtl") && (swipeDirection == "rtl")) || ((this.getScrollDirection() == "ltr") && (swipeDirection == "rtl"))) {
          //Save the index of the first item that is being copied.
          this.getScroller(i).startCanvasIndex = this.currentItemIndex;
          this.getScroller(i).startCanvasItem = this.items[this.currentItemIndex];
        }
        else {
          this.getScroller(i).endCanvasIndex = this.currentItemIndex;
          this.getScroller(i).endCanvasItem = this.items[this.currentItemIndex];
        }
      }

      if (this.currentItemIndex != this.previousItemIndex) {
        if (this.getScrollDirection() == "rtl") {
          if (swipeDirection == "rtl") {
            if (this.getScroller(i).writeDirection == "forward") {
              this.getScroller(i).holdPositions.push({
                position : this.getScroller(i).writePosition,
                wasHeld : false
              });
            }
          }
          else {
            if (itemPosition != 0) {
              this.getScroller(i).holdPositions.push({
                position : this.getScroller(i).writePosition,
                wasHeld : false
              });
            }
          }
        }
        else {
          this.getScroller(i).holdPositions.push({
            position : this.getScroller(i).writePosition,
            wasHeld : false
          });
        }
      }

      if (this.getScrollDirection() == "rtl") {
        if (swipeDirection == "rtl") {
          isCopied = this.getScroller(i).drawCanvasFromStart(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection());

          //If the scroller is filled and the ending position is 0, move to the next item.
          if (this.getScroller(i).endCanvasPosition == 0 && this.getScroller(i).writePosition == 0) {
            this.setNextItem(this.currentItemIndex);
          }

          this.getScroller(i).endCanvasIndex = this.currentItemIndex;
          this.getScroller(i).endCanvasItem = this.items[this.currentItemIndex];
        }
        else {
          isCopied = this.getScroller(i).drawCanvasFromEnd(this.items[this.currentItemIndex].canvas, itemPosition);
          this.getScroller(i).startCanvasIndex = this.currentItemIndex;
          this.getScroller(i).startCanvasItem = this.items[this.currentItemIndex];
        }
      }
      else {
        if (swipeDirection == "ltr") {
          isCopied = this.getScroller(i).drawCanvasFromEnd(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection());
          this.getScroller(i).startCanvasIndex = this.currentItemIndex;
          this.getScroller(i).startCanvasItem = this.items[this.currentItemIndex];
        }
        else {
          isCopied = this.getScroller(i).drawCanvasFromStart(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection());
          this.getScroller(i).endCanvasIndex = this.currentItemIndex;
          this.getScroller(i).endCanvasItem = this.items[this.currentItemIndex];
        }
      }

      if (isCopied) {//This item has been copied. Copy the next item if it shares the same id.
        if (this.getScroller(i).writeDirection == "forward") {
          this.setNextItem(this.currentItemIndex);
        }
        else {
          this.setPreviousItem(this.currentItemIndex);
        }
      }

      itemPosition = 0;
    }
  }
  else {
    itemPosition = this.getItemPosition(this.getNextScrollerIndex(i), swipeDirection);

    while (this.getScroller(i).totalPixelsCopied < this.getScroller(i).canvas.width) {
      //Save the index of the first canvas that is being copied.
      if (this.getScroller(i).totalPixelsCopied == 0) {
        if (((this.getScrollDirection() == "rtl") && (swipeDirection == "rtl")) || ((this.getScrollDirection() == "ltr") && (swipeDirection == "rtl"))) {
          this.getScroller(i).startCanvasIndex = this.currentItemIndex;
        }
        else {
          this.getScroller(i).endCanvasIndex = this.currentItemIndex;
        }
      }

      if (this.getScrollDirection() == "rtl") {
        if (swipeDirection == "rtl") {
          isCopied = this.getScroller(i).drawCanvasFromStart(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection());
        }
        else {
          isCopied = this.getScroller(i).drawCanvasFromEnd(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection(), this.getScroller(this.getNextScrollerIndex(i)).writeDirection);
        }
      }
      else {
        if (swipeDirection == "rtl") {
          isCopied = this.getScroller(i).drawCanvasFromStart(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection());
        }
        else {
          isCopied = this.getScroller(i).drawCanvasFromEnd(this.items[this.currentItemIndex].canvas, itemPosition, this.getScrollDirection(), this.getScroller(this.getNextScrollerIndex(i)).writeDirection);
        }
      }

      if (isCopied) {
        if (this.getScroller(i).writeDirection == "forward") {
          this.setNextItem(this.currentItemIndex);
        }
        else {
          this.setPreviousItem(this.currentItemIndex);
        }
      }

      itemPosition = 0;
    }

    //Save the index of the last canvas that is being copied.
    if (((this.getScrollDirection() == "rtl") && (swipeDirection == "rtl")) || ((this.getScrollDirection() == "ltr") && (swipeDirection == "rtl"))) {
      this.getScroller(i).endCanvasIndex = this.currentItemIndex;
    }
    else {
      this.getScroller(i).startCanvasIndex = this.currentItemIndex;
    }
  }

  this.isLoading = false;
  this.getScroller(i).totalPixelsCopied = 0;
}
RiseVision.Common.HorizontalScroll.prototype.getItemPosition = function(j, swipeDirection) {
  var itemPosition;

  if (this.getScrollDirection() == "rtl") {
    if (swipeDirection == "rtl") {
      //Row, Left, auto-scroll
      itemPosition = this.getPositionFromEnd(j, swipeDirection);
    }
    else {
      //Row, Left, swipe in opposite direction
      itemPosition = this.getPositionFromStart(j, swipeDirection);
    }
  }
  else {
    if (swipeDirection == "rtl") {
      //Row, Right, swipe in opposite direction
      itemPosition = this.getPositionFromEnd(j, swipeDirection);
    }
    else {
      //Row, Right, auto-scroll
      itemPosition = this.getPositionFromStart(j, swipeDirection);
    }
  }

  return itemPosition;
}
RiseVision.Common.HorizontalScroll.prototype.getPositionFromStart = function(j, swipeDirection) {
  var itemPosition;

  itemPosition = this.getScroller(j).startCanvasPosition;
  this.currentItemIndex = this.getScroller(j).startCanvasIndex;

  if (this.getScrollDirection() == "rtl" && swipeDirection == "ltr") {
    //If we're at the very beginning of a canvas, move to the previous canvas.
    if (itemPosition == 0) {
      this.setPreviousItem(this.getScroller(j).startCanvasIndex);
    }
  }
  else if (this.getScrollDirection() == "ltr" && swipeDirection == "ltr") {
    //If we're at the very beginning of a canvas, move to the previous canvas.
    if (!this.isLoading) {
      if (itemPosition == 0) {
        this.setNextItem(this.getScroller(j).startCanvasIndex);
      }
    }
  }

  if (!this.isLoading) {
    this.previousItemIndex = this.currentItemIndex;
  }

  return itemPosition;
}
RiseVision.Common.HorizontalScroll.prototype.getPositionFromEnd = function(j, swipeDirection) {
  var itemPosition;

  this.currentItemIndex = this.getScroller(j).endCanvasIndex;
  itemPosition = this.getScroller(j).endCanvasPosition;

  if (this.getScrollDirection() == "ltr" && swipeDirection == "rtl") {
    if (itemPosition == this.items[this.currentItemIndex].canvas.width) {
      this.setPreviousItem(this.getScroller(j).endCanvasIndex);
      itemPosition = 0;
    }
  }
  else if (this.getScrollDirection() == "rtl" && swipeDirection == "rtl") {
    //If we're at the very end of a canvas, move to the next canvas.
    if (itemPosition == this.items[this.currentItemIndex].canvas.width) {
      this.setNextItem(this.getScroller(j).endCanvasIndex);
      itemPosition = 0;
    }
  }

  if (!this.isLoading) {
    this.previousItemIndex = this.currentItemIndex;
  }

  return itemPosition;
}
RiseVision.Common.HorizontalScroll.prototype.getNextScrollerIndex = function(index) {
  var next = ++index;

  if (next >= this.getScrollers().length) {
    next = 0;
  }

  return next;
}
RiseVision.Common.HorizontalScroll.prototype.setNextItem = function(index) {
  var next = ++index;

  if (next >= this.items.length) {
    next = 0;
  }

  this.currentItemIndex = next;

  return next;
}
RiseVision.Common.HorizontalScroll.prototype.setPreviousItem = function(index) {
  var previous = --index;

  if (previous < 0) {
    previous = this.items.length - 1;
  }

  this.currentItemIndex = previous;

  return previous;
}
RiseVision.Common.HorizontalScroll.prototype.drawScene = function() {
  var self = this, difference;

  if (!this.mouseDown && !this.isStopped) {
    this.context.clearRect(0, 0, this.scroller.width, this.scroller.height);

    for (var i = 0; i < this.getScrollers().length; i++) {
      var scroller = this.getScroller(i);

      scroller.x = scroller.x - this.speed;

      if (this.getScrollDirection() == "rtl") {
        difference = scroller.x + this.scroller.width;
      }
      else {
        difference = scroller.x - this.scroller.width;
      }

      if ((difference < 0) && (this.getScrollDirection() == "rtl")) {
        //Move canvas to the end.
        scroller.x = this.scroller.width;
        scroller.x = scroller.x - (-difference);
        this.adjustCanvas(i);
      }
      else if ((difference > 0) && (this.getScrollDirection() == "ltr")) {
        //Move canvas to the start.
        scroller.x = -this.scroller.width;
        scroller.x = scroller.x - (-difference);
        this.adjustCanvas(i);
      }

      this.drawCanvas(scroller.x, i);
    }

    this.setTotalPixels(this.getTotalPixels() + Math.abs(this.speed));

    if (this.totalWidth == 0) {
      this.pause();

      //Wait 5 seconds before triggering Done to prevent it from firing continuously.
      setTimeout(function() {
        if (self.totalWidth == 0) {
          $(self).trigger("done");
        }
        else {
          self.tick();
        }
      }, 5000);
    }
    //PUD is implemented by counting the number of pixels that have been scrolled.
    else if (this.getTotalPixels() > this.totalWidth) {
      this.setTotalPixels(this.getTotalPixels() - this.totalWidth);
      $(this).trigger("done");
    }
  }
}
RiseVision.Common.HorizontalScroll.prototype.drawSceneByItem = function() {
  if (!this.mouseDown && !this.isStopped) {
    var difference = 0;

    //Check if either of the Scrollers should be held.
    for (var i = 0; i < this.getScrollers().length; i++) {
      var scroller = this.getScroller(i);

      if (scroller.holdPositions.length > 0) {
        for (var j = 0; j < scroller.holdPositions.length; j++) {
          if ((scroller.x <= -scroller.holdPositions[j].position) && !scroller.holdPositions[j].wasHeld && this.getScrollDirection() == "rtl") {
            //Position scroller at the hold position.
            difference = scroller.x + scroller.holdPositions[j].position;
            scroller.x = -scroller.holdPositions[j].position;
            this.holdScroller(scroller, i, j);

            break;
          }
          else if ((scroller.x >= scroller.holdPositions[j].position) && !scroller.holdPositions[j].wasHeld && this.getScrollDirection() == "ltr") {
            //Position scroller at the hold position.
            difference = scroller.x - scroller.holdPositions[j].position;
            scroller.x = scroller.holdPositions[j].position;
            this.holdScroller(scroller, i, j);

            break;
          }
          else {
            this.isHolding = false;
          }
        }

        if (this.isHolding) {
          //Adjust other scroller by the same number of pixels.
          var index = this.getNextScrollerIndex(i);

          this.getScroller(index).x = this.getScroller(index).x - difference;
          this.moveCanvas(i);
          this.drawCanvas(this.getScroller(index).x, index);

          break;
        }
      }
      else {
        this.isHolding = false;
      }
    }

    //Draw only if the scroller is not holding.
    if (!this.isHolding) {
      this.context.clearRect(0, 0, this.scroller.width, this.scroller.height);

      for (var i = 0; i < this.getScrollers().length; i++) {
        var scroller = this.getScroller(i), newX = scroller.x - this.speed;

        scroller.x = newX;
        this.moveCanvas(i);
        this.drawCanvas(scroller.x, i);
      }
    }
  }
}
RiseVision.Common.HorizontalScroll.prototype.holdScroller = function(scroller, i, j) {
  scroller.holdPositions[j].wasHeld = true;

  this.context.clearRect(0, 0, this.scroller.width, this.scroller.height);
  this.moveCanvas(i);
  this.drawCanvas(scroller.x, i);
  this.setHoldTimer();
  this.isHolding = true;
}
RiseVision.Common.HorizontalScroll.prototype.moveCanvas = function(i) {
  var scroller = this.getScroller(i), difference;

  if (this.getScrollDirection() == "rtl") {
    difference = scroller.x + this.scroller.width;
  }
  else {
    difference = scroller.x - this.scroller.width;
  }

  //Move canvas to the end.
  if ((difference < 0) && (this.getScrollDirection() == "rtl")) {
    scroller.x = this.scroller.width;
    scroller.x = scroller.x - (-difference);
    this.adjustCanvas(i);
  }
  //Move canvas to the beginning.
  else if ((difference > 0) && (this.getScrollDirection() == "ltr")) {
    scroller.x = -this.scroller.width;
    scroller.x = scroller.x - (-difference);
    this.adjustCanvas(i);
  }
}
//Draw entire Scroller piece onto scroller at 0, 0.
RiseVision.Common.HorizontalScroll.prototype.drawCanvas = function(x, i) {
  var canvas = this.getScroller(i).canvas;

  this.context.save();
  this.context.translate(x, 0);
  this.context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  this.context.restore();
}
RiseVision.Common.HorizontalScroll.prototype.setHoldTimer = function() {
  var self = this;

  clearTimeout(this.holdTimerID);

  //PUD is implemented by counting the number of items that have been shown.
  if (this.itemsCount > this.items.length - 1) {
    this.itemsCount = 0;
    $(this).trigger("done");
  }
  else {
    this.isHolding = true;
    this.isStopped = true;
    this.holdTimerID = setTimeout(function() {
      self.isHolding = false;
      self.isStopped = false;
      self.itemsCount++;
    }, this.getDuration());
  }
}
RiseVision.Common.HorizontalScroll.prototype.handleMouseDown = function(event) {
  this.mouseDown = true;
  this.lastMouseX = event.clientX;
}
RiseVision.Common.HorizontalScroll.prototype.handleMouseUp = function(event) {
  var self = this;

  this.mouseDown = false;

  if (!this.mouseMove) {
    clearTimeout(this.interactivityTimerID);
    this.isStopped = true;
    this.interactivityTimerID = setTimeout(function() {
      self.isStopped = false;
    }, this.interactivityTimeout);
  }
  else {
    this.mouseMove = false;
  }
}
RiseVision.Common.HorizontalScroll.prototype.handleMouseOut = function(event) {
  this.mouseDown = false;
}
RiseVision.Common.HorizontalScroll.prototype.handleMouseMove = function(event) {
  if (!this.mouseDown) {
    return;
  }

  clearTimeout(this.holdTimerID);
  this.isHolding = false;

  var newX = event.clientX, deltaX = this.lastMouseX - newX, difference;

  this.mouseMove = true;
  this.context.clearRect(0, 0, this.scroller.width, this.scroller.height);

  for (var i = 0; i < this.getScrollers().length; i++) {
    var scroller = this.getScroller(i);

    scroller.x = scroller.x - deltaX;

    if (this.getScrollDirection() == "rtl") {
      if (deltaX > 0) {//Swipe left
        difference = scroller.x + this.scroller.width;

        if (difference < 0) {
          scroller.x = this.scroller.width;
          scroller.x = scroller.x - (-difference);
          this.adjustCanvas(i, "rtl");
        }
      }
      else if (deltaX < 0) {//Swipe right
        difference = scroller.x - this.scroller.width;

        if (difference > 0) {
          scroller.x = -this.scroller.width;
          scroller.x = scroller.x - (-difference);
          this.adjustCanvas(i, "ltr");
        }
      }

      //Flag hold position(s) as having been held when swiping past it.
      for (var j = 0; j < scroller.holdPositions.length; j++) {
        if ((scroller.x <= -scroller.holdPositions[j].position) && !scroller.holdPositions[j].wasHeld) {
          scroller.holdPositions[j].wasHeld = true;
        }
      }
    }
    else {//right
      if (deltaX > 0) {//Swipe left
        difference = scroller.x + this.scroller.width;

        if (difference < 0) {
          scroller.x = this.scroller.width;
          scroller.x = scroller.x - (-difference);
          this.adjustCanvas(i, "rtl");
        }
      }
      else if (deltaX < 0) {//Swipe right
        difference = scroller.x - this.scroller.width;

        if (difference > 0) {
          scroller.x = -this.scroller.width;
          scroller.x = scroller.x - (-difference);
          this.adjustCanvas(i, "ltr");
        }
      }

      //Flag hold position(s) as having been held when swiping past it.
      //Prevent scroller from snapping back to hold position if user has swiped past it.
      for (var j = 0; j < scroller.holdPositions.length; j++) {
        if ((scroller.x <= -scroller.holdPositions[j].position) && !scroller.holdPositions[j].wasHeld && scroller.writeDirection == "forward") {
          scroller.holdPositions[j].wasHeld = true;
        }
        else if ((scroller.x >= scroller.holdPositions[j].position) && !scroller.holdPositions[j].wasHeld && scroller.writeDirection == "backward") {
          scroller.holdPositions[j].wasHeld = true;
        }
      }
    }

    this.drawCanvas(scroller.x, i);
  }

  this.isStopped = false;
  this.lastMouseX = newX;
}
RiseVision.Common.HorizontalScroll.prototype.tick = function() {
  var self = this;

  this.request = requestAnimFrame(function() {
    self.tick();
  });

  if (this.getScrollBy() == "item") {
    this.drawSceneByItem();
  }
  else {
    this.drawScene();
  }
}
RiseVision.Common.HorizontalScroll.prototype.pause = function() {
  cancelRequestAnimFrame(this.request);
}
RiseVision.Common.HorizontalScroll.prototype.updateItem = function(index, data, callback) {
  var self = this, oldItem = this.items[index], newItem = null;

  if (oldItem != null) {
    this.totalWidth -= oldItem.getWidth();
    this.items[index] = null;
    oldItem.destroy();
  }

  newItem = new RiseVision.Common.Item(data, this.scroller, this.getSpacing(), this.getScrollDirection(), index);
  newItem.initialize(function() {
    self.items[index] = this;
    self.totalWidth += this.getWidth();
    newItem = null;

    if (callback) {
      callback();
    }
  });
}
RiseVision.Common.HorizontalScroll.prototype.clear = function() {
  for (var i = 0; i < this.getScrollers().length; i++) {
    this.getScroller(i).clear();
  }

  for (var i = 0; i < this.items.length; i++) {
    this.items[i].destroy();
  }

  this.totalWidth = 0;
  this.items = [];
}
//var svgCanvases = [];
RiseVision.Common.Item = function(data, scroller, padding, scrollDirection, position, isRefreshing) {
  this.svgCanvases = [];
  this.canvas = document.createElement("canvas");
  this.canvas.className = "item";
  this.context = this.canvas.getContext("2d");
  this.context.canvas.height = scroller.height;

  this.data = data;
  //Array of JSON objects representing contents to be drawn for a single item.
  this.index = 0;
  this.width = 0;
  this.writePosition = 0;
  this.scroller = scroller;
  this.padding = padding;
  this.scrollDirection = scrollDirection;
  this.isRefreshing = isRefreshing;
  this.dataIndex = 0;

  if ( typeof position === "undefined") {
    this.position = -1;
  }
  else {
    this.position = position;
  }
}
RiseVision.Common.Item.prototype.getWidth = function() {
  return this.context.canvas.width;
}
RiseVision.Common.Item.prototype.initialize = function(callback) {
  this.callback = callback;
  this.getImage();
}
RiseVision.Common.Item.prototype.getImage = function() {
  var self = this, data = this.data[this.dataIndex], padding;

  if (data) {
    //Remain backwards compatible with old method of specifying padding via the padding parameter.
    //New method is to attach it to the data object.
    padding = (data.padding == null) ? this.padding : data.padding;

    //Check if there are any images to load.
    if (data.type == "image") {
      this.index = this.dataIndex;

      //First check if the image has been cached.
      if (this.svgCanvases.length > 0) {
        $.each(this.svgCanvases, function(index, canvas) {
          if (canvas.url == data.value) {
            data.svg = self.svgCanvases[index].canvas;
            return false;
          }
        });

        if (data.svg) {
          this.width += data.svg.width + padding;
          this.dataIndex++;
          this.getImage();
        }
        else {
          this.loadImage(data.value);
        }
      }
      else {
        this.loadImage(data.value);
      }
    }
    else {//Text
      this.createTempText(data.value, data.fontRule, padding);
      this.dataIndex++;
      this.getImage();
    }
  }
  else {//All images loaded.
    this.drawCanvas();
  }
}
RiseVision.Common.Item.prototype.loadImage = function(url) {
  var params = {}, self = this;

  //Need to use makeRequest to get around cross-domain issues for loading SVG images.
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
  gadgets.io.makeRequest(url, function(obj) {
    //Save the SVG data.
    if (obj.data) {
      var data = self.data[self.dataIndex];

      data.svg = obj.data;
      self.createTempImage(self.dataIndex, data.svg, data.value);
    }

    self.dataIndex++;
    self.getImage();
  }, params);

  //Load regular images.
  //    var image = new Image();
  //
  //    image.onload = function() {
  //  callback(this);
  //    };
  //    image.onerror = function(e) {
  //  callback(this);
  //    };
  //    image.crossOrigin = 'anonymous'; // no credentials flag
  //    image.src = this.logo;
  //    this.image = image;
}
//Necessary for getting the width of the image when drawn onto the canvas.
RiseVision.Common.Item.prototype.createTempImage = function(i, svg, url) {
  var svgCanvas = document.createElement("canvas"), //Canvas on which the SVG image will be drawn.
  svgContext = svgCanvas.getContext("2d"), padding = (this.data[i].padding == null) ? this.padding : this.data[i].padding, id = "svg";

  svgCanvas.id = id;
  svgCanvas.height = this.scroller.height - 10;
  //Leave 5px of padding at top and bottom.
  svgCanvas.width = this.scroller.height - 10;
  //Necessary in order for scaling to work.

  document.body.appendChild(svgCanvas);

  //Draw the image and scale the height to fill the scroller.
  canvg(id, svg, {
    scaleHeight : true,
    ignoreDimensions : true
  });

  this.width += svgCanvas.width + padding;
  this.data[i].svg = svgCanvas;

  this.svgCanvases.push({
    "url" : url,
    "canvas" : svgCanvas
  });

  document.body.removeChild(svgCanvas);
}
RiseVision.Common.Item.prototype.createImage = function(i, svg) {
  var padding = (this.data[i].padding == null) ? this.padding : this.data[i].padding;

  //Scale the non-SVG image if necessary.
  //    var ratio = 1;
  //
  //    if (this.image.height > scroller.height) {
  //  ratio = scroller.height / this.image.height;
  //    }
  //    else if (this.image.width > scroller.width) {
  //  ratio = scroller.width / this.image.width;
  //    }

  //Draw the image after the text and starting 5px from the top.
  if (this.scrollDirection == "rtl") {
    this.context.drawImage(this.data[i].svg, 0, 0, this.data[i].svg.width, this.data[i].svg.height, this.writePosition, 5, this.data[i].svg.width, this.data[i].svg.height);
    this.writePosition += this.data[i].svg.width + padding;
  }
  else {
    this.context.drawImage(this.data[i].svg, 0, 0, this.data[i].svg.width, this.data[i].svg.height, this.writePosition + padding, 5, this.data[i].svg.width, this.data[i].svg.height);
    this.writePosition += this.data[i].svg.width + padding;
  }
}
/* Text is written to a temporary canvas first so that the width of the text can be determined.
 This is then used to set the width of the actual canvas, which needs to be done before being written to. */
RiseVision.Common.Item.prototype.createTempText = function(value, fontRule, padding) {
  var textCanvas = document.createElement("canvas"), textContext = textCanvas.getContext("2d");

  this.writeText(value, fontRule, padding, textContext);
  this.width += textContext.measureText(value).width + padding;
}
/* Write the text to the actual canvas. */
RiseVision.Common.Item.prototype.createText = function(value, fontRule, padding) {
  this.writeText(value, fontRule, padding, this.context);
  this.writePosition += this.context.measureText(value).width + padding;
}
RiseVision.Common.Item.prototype.writeText = function(text, fontRule, padding, context) {
  var topOffset = context.canvas.height / 2, //Y coordinate at which to being drawing (vertical alignment).
  rules = "", canvasFont = "";

  rules = RiseVision.Common.Utility.parseCSSRule(fontRule);

  if ((rules[3] != null) && (rules[3] != "normal")) {
    canvasFont += rules[3] + " ";
  }

  if ((rules[4] != null) && (rules[4] != "normal")) {
    canvasFont += rules[4] + " ";
  }

  canvasFont += rules[2] + " " + rules[0];

  context.font = canvasFont;
  context.strokeStyle = rules[1];
  context.textAlign = "left";
  context.textBaseline = "middle";

  context.save();
  context.translate(0, topOffset);

  context.fillStyle = rules[1];

  if (this.scrollDirection == "rtl") {
    context.fillText(text, this.writePosition + padding, 0);
  }
  else {//ltr
    context.fillText(text, this.writePosition + padding, 0);
  }

  context.restore();
}
RiseVision.Common.Item.prototype.drawCanvas = function() {
  var length = this.data.length, padding;

  this.context.canvas.width = this.width;
  this.context.canvas.style.display = "none";

  //Draw to canvas.
  for (var i = 0; i < length; i++) {
    padding = (this.data[i].padding == null) ? this.padding : this.data[i].padding;

    if (this.data[i].type == "text") {
      this.createText(this.data[i].value, this.data[i].fontRule, padding);
    }
    else if (this.data[i].type == "image") {
      if (this.data[i].svg) {
        this.createImage(i, this.data[i].svg);
      }
    }
  }

  this.addCanvas();
  this.callback();
}
RiseVision.Common.Item.prototype.addCanvas = function() {
  if (this.position != -1) {
    var $item = $(".item").eq(this.position);

    if ($item.length > 0) {
      $(this.canvas).insertBefore($item);
    }
    else {//Add it to the end.
      document.body.appendChild(this.canvas);
    }
  }
  else {
    document.body.appendChild(this.canvas);
  }
}
RiseVision.Common.Item.prototype.destroy = function() {
  document.body.removeChild(this.canvas);
  this.context = null;
  this.canvas = null;
  this.data = null;
  this.scroller = null;
  this.callback = null;
}
RiseVision.Common.Item.prototype.getFontHeight = function(fontStyle) {
  var body = document.getElementsByTagName("body")[0], dummy = document.createElement("div"), dummyText = document.createTextNode("M"), result;

  dummy.setAttribute("style", fontStyle);
  body.appendChild(dummy);
  dummy.appendChild(dummyText);

  result = dummy.offsetHeight;

  dummy.removeChild(dummyText);
  body.removeChild(dummy);

  body = null;
  dummy = null;
  dummyText = null;

  return result;
}
/* Parent class for all scrollers. */
RiseVision.Common.Scroller = function(xPos, width, height) {
  this.canvas = document.createElement("canvas");
  this.canvas.width = width;
  this.canvas.height = height;
  this.context = this.canvas.getContext("2d");

  this.x = xPos;
  this.startCanvasItem = null;
  this.endCanvasItem = null;
  this.startCanvasIndex = 0;
  //Index of the first canvas to be copied onto the scroller.
  this.endCanvasIndex = 0;
  //Index of the last canvas to be copied onto the scroller.
  this.startCanvasPosition = 0;
  //Position at which the canvas at index startCanvasIndex started being copied.
  this.endCanvasPosition = 0;
  //Position at which the canvas at index endCanvasIndex finished being copied.
  this.writeDirection = "forward";
  this.totalPixelsCopied = 0;
  this.writePosition = 0;
  this.holdPositions = [];

  //document.body.appendChild(document.createElement("div"));
  //document.body.appendChild(this.canvas);
}
RiseVision.Common.Scroller.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}
/* Draw starting from beginning of scroller. */
RiseVision.Common.Scroller.prototype.drawCanvasFromStart = function(canvas, currentItemPosition, scrollDirection) {//canvas = item's canvas
  var context2D = canvas.getContext("2d"), pixelsRemaining = this.canvas.width - this.totalPixelsCopied, isCanvasCopied = false, pixelsCopied = 0, imageData = null, width;

  //Only set this on first time through.
  if (this.totalPixelsCopied == 0) {
    this.startCanvasPosition = currentItemPosition;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  if (scrollDirection == "rtl") {
    if (currentItemPosition == 0) {//All canvases except first one to be written.
      width = canvas.width;
    }
    else {
      width = canvas.width - currentItemPosition;
    }
  }
  else {
    width = canvas.width - currentItemPosition;
  }

  //Content that remains to be shown is shorter than the scroller.
  if (width <= pixelsRemaining) {
    if (width > 0) {
      imageData = context2D.getImageData(currentItemPosition, 0, width, canvas.height);
    }

    pixelsCopied = width;
    this.totalPixelsCopied += pixelsCopied;
    currentItemPosition = 0;
    isCanvasCopied = true;
  }
  else {
    imageData = context2D.getImageData(currentItemPosition, 0, pixelsRemaining, canvas.height);
    pixelsCopied = pixelsRemaining;
    this.totalPixelsCopied += pixelsRemaining;
    currentItemPosition += pixelsRemaining;
  }

  //Paint the pixel data into the context.
  if (imageData) {
    this.context.putImageData(imageData, this.writePosition, 0);
  }

  this.writePosition += pixelsCopied;
  this.endCanvasPosition = currentItemPosition;
  //Indicates how many pixels have been copied already.

  if (this.totalPixelsCopied >= this.canvas.width) {
    this.writePosition = 0;
  }

  imageData = null;

  return isCanvasCopied;
}
/* Draw starting from end of scroller. */
RiseVision.Common.Scroller.prototype.drawCanvasFromEnd = function(canvas, currentItemPosition) {
  var context2D = canvas.getContext("2d"), pixelsRemaining = this.canvas.width - this.totalPixelsCopied, isCanvasCopied = false, pixelsCopied = 0, imageData, width;

  if (currentItemPosition == 0) {//All canvases except first one to be written.
    width = canvas.width;
    currentItemPosition = width;
  }
  else {
    width = currentItemPosition;
  }

  //Only set this on first time through. We're working backwards here.
  if (this.totalPixelsCopied == 0) {
    this.endCanvasPosition = width;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  //Content that remains to be shown is shorter than the scroller.
  if (width <= pixelsRemaining) {
    imageData = context2D.getImageData(0, 0, width, canvas.height);
    pixelsCopied = width;
    this.totalPixelsCopied += pixelsCopied;
    currentItemPosition = 0;
    isCanvasCopied = true;
  }
  else {
    imageData = context2D.getImageData(width - pixelsRemaining, 0, pixelsRemaining, canvas.height);
    pixelsCopied = pixelsRemaining;
    this.totalPixelsCopied += pixelsRemaining;
    currentItemPosition -= pixelsRemaining;
  }

  //Paint the pixel data into the context.
  this.context.putImageData(imageData, this.canvas.width - this.totalPixelsCopied, 0);
  this.startCanvasPosition = currentItemPosition;
  //Indicates how many pixels have been copied already.
  this.writePosition += pixelsCopied;

  if (this.totalPixelsCopied >= this.canvas.width) {
    this.writePosition = 0;
  }

  imageData = null;

  return isCanvasCopied;
}

RiseVision.Common.Authorization = function() {
  this.clientID = "726689182011.apps.googleusercontent.com";
  this.scope = "https://www.googleapis.com/auth/drive.file";
}
RiseVision.Common.Authorization.prototype.checkAuth = function() {
  var self = this;

  gapi.auth.authorize({
    client_id : this.clientID,
    scope : this.scope,
    immediate : true
  }, function(authResult) {
    self.handleAuthResult(authResult);
  });
}
RiseVision.Common.Authorization.prototype.handleAuthResult = function(authResult) {
  if (authResult && !authResult.error) {
    this.oauthToken = authResult.access_token;
    $(window).trigger("authorized");
  }
  else {
    $(window).trigger("notAuthorized");
  }
}
RiseVision.Common.Authorization.prototype.handleLogin = function() {
  var self = this;

  gapi.auth.authorize({
    client_id : this.clientID,
    scope : this.scope,
    immediate : false
  }, function(authResult) {
    self.handleAuthResult(authResult);
  });

  return false;
}

RiseVision.Common.Font = function(font, fontStyle, fontURL, customFont) {
  this.font = font;
  this.fontStyle = fontStyle;
  this.customFont = customFont;

  if (font == "Use Custom Font") {
    if (fontURL != "") {
      RiseVision.Common.Utility.loadCustomFont(customFont, fontURL);
    }
  }
  else if (fontStyle == "Google") {
    RiseVision.Common.Utility.loadGoogleFont(this.font);
  }
}
RiseVision.Common.Font.prototype.getFontFamily = function() {
  if (this.font == "Use Custom Font") {
    return this.customFont;
  }
  else if (this.fontStyle == "Google") {
    return this.font;
  }
  else {
    return this.fontStyle;
  }
}

RiseVision.Common.CKEditorFonts = function() {
  this.reset();
}
RiseVision.Common.CKEditorFonts.prototype.reset = function() {
  this.customFonts = [];
  this.googleFonts = [];
}
/* Extract custom and Google fonts from CKEditor data. */
RiseVision.Common.CKEditorFonts.prototype.getFonts = function(data) {
  var html = $.parseHTML(data), self = this;

  if (html != null) {
    $.each(html, function(i, elem) {
      //Find all elements that have custom font data attributes associated with them.
      var customFontElems = $(elem).find("[data-custom-font-url]").andSelf().filter("[data-custom-font-url]"), googleFontElems = $(elem).find("[data-google-font-url]").andSelf().filter("[data-google-font-url]");

      $.each(customFontElems, function() {
        var customFont = $(this).attr("data-custom-font"), customFontURL = $(this).attr("data-custom-font-url"), found = false;

        //Check that this custom font does not already exist in the array.
        $.each(self.customFonts, function(j, value) {
          if (value.font == customFont) {
            found = true;
            return false;
          }
        });

        //Only add the custom font if it has not already been added.
        if (!found) {
          self.customFonts.push({
            font : customFont,
            url : customFontURL
          });
        }
      });

      $.each(googleFontElems, function() {
        var googleFont = $(this).attr("data-google-font"), googleFontURL = $(this).attr("data-google-font-url"), found = false;

        //Check that this Google font does not already exist in the array.
        $.each(self.googleFonts, function(j, value) {
          if (value == googleFontURL) {
            found = true;
            return false;
          }
        });

        //Only add the Google font if it has not already been added.
        if (!found) {
          self.googleFonts.push({
            font : googleFont,
            url : googleFontURL
          });
        }
      });
    });
  }
}
RiseVision.Common.CKEditorFonts.prototype.loadFonts = function(contentDocument) {
  if (this.customFonts != null) {
    if (this.customFonts.length > 0) {
      //Load each of the custom fonts.
      $.each(this.customFonts, function(i, value) {
        RiseVision.Common.Utility.loadCustomFont(value.font, value.url, contentDocument);
      });
    }
  }

  if (this.googleFonts != null) {
    if (this.googleFonts.length > 0) {
      //Load each of the Google fonts.
      $.each(this.googleFonts, function(i, value) {
        RiseVision.Common.Utility.loadGoogleFont(value.font, contentDocument);
      });
    }
  }
}
/*
 * Utility classes.
 */

/*
 * Load a custom font.
 */
RiseVision.Common.Utility.loadCustomFont = function(family, url, contentDocument) {
  if (contentDocument == null) {
    contentDocument = document;
  }

  var sheet = contentDocument.styleSheets[0], rule = "font-family: " + family + "; " + "src: url('" + url + "');";

  if (sheet != null) {
    sheet.addRule("@font-face", rule);
  }
}
/*
 * Load a Google font.
 */
RiseVision.Common.Utility.loadGoogleFont = function(family, contentDocument) {
  if (contentDocument == null) {
    contentDocument = document;
  }

  var stylesheet = document.createElement("link");

  stylesheet.setAttribute("rel", "stylesheet");
  stylesheet.setAttribute("type", "text/css");
  stylesheet.setAttribute("href", "https://fonts.googleapis.com/css?family=" + family);

  if (stylesheet != null) {
    contentDocument.getElementsByTagName("head")[0].appendChild(stylesheet);
  }
}
/*
 * Load a CSS file.
 */
RiseVision.Common.Utility.loadCSS = function(url) {
  var link = $("<link>");

  link.attr({
    type : "text/css",
    rel : "stylesheet",
    href : url
  });

  $("head").append(link);
}
/*
 * Load a Javascript file.
 */
RiseVision.Common.Utility.loadJS = function(filename, callback) {
  var fileref = document.createElement("script");

  fileref.type = "text/javascript";
  fileref.onload = function() {
    if (callback) {
      callback();
    }
  };

  fileref.src = filename;

  if ( typeof fileref != "undefined") {
    document.getElementsByTagName("head")[0].appendChild(fileref);
  }
}
/*
 * Format a number to include commas.
 */
RiseVision.Common.Utility.addCommas = function(number) {
  var x, x1, x2, regex;

  number += '';
  x = number.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  regex = /(\d+)(\d{3})/;

  while (regex.test(x1)) {
    x1 = x1.replace(regex, '$1' + ',' + '$2');
  }

  return x1 + x2;
}
/*
 * Unescape HTML.
 */
RiseVision.Common.Utility.unescapeHTML = function(html) {
  var div = document.createElement("div");

  div.innerHTML = html;

  if (div.innerText !== undefined) {
    return div.innerText;
    // IE
  }

  return div.textContent;
}
/*
 * Strips script tags from an HTML string.
 */
RiseVision.Common.Utility.stripScripts = function(html) {
  var div = document.createElement("div"), scripts, i;

  div.innerHTML = html;
  scripts = div.getElementsByTagName("script");
  i = scripts.length;

  while (i--) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }

  return div.innerHTML;
}
/*
 * Truncate text while preserving word boundaries.
 */
RiseVision.Common.Utility.truncate = function(text, length) {
  //Truncate the text and then go back to the end of the previous word to ensure that
  //we don't truncate in the middle of a word.
  if (text.length > length) {
    text = text.substring(0, length);
    text = text.replace(/\w+$/, '');
    text = text + " ...";
  }

  return text;
}
/*
 * Scale an image down if necessary to fit within a particular area.
 */
RiseVision.Common.Utility.scaleToFit = function(settings) {
  var objImage = new Image();

  //Use an Image object in order to get the actual dimensions of the image.
  objImage.onload = function() {
    var imageWidth, imageHeight, ratioX, ratioY, scale, newWidth, newHeight;

    imageWidth = objImage.width;
    imageHeight = objImage.height;

    //Scale down images only. Don't scale up.
    if ((imageWidth > 0) && (imageHeight > 0) && ((imageWidth > settings.rsW) || (imageHeight > settings.rsH))) {
      //Calculate scale ratios.
      ratioX = settings.rsW / imageWidth;
      ratioY = settings.rsH / imageHeight;
      scale = ratioX < ratioY ? ratioX : ratioY;

      //Calculate and set new image dimensions.
      newWidth = parseInt(imageWidth * scale, 10);
      newHeight = parseInt(imageHeight * scale, 10);

      //Call the callback function and pass the new dimensions.
      settings.callback(newWidth, newHeight);
    }
    else {//Pass the original dimensions unchanged.
      settings.callback(imageWidth, imageHeight);
    }
  }
  //Call the error handler if the image could not be loaded.
  objImage.onerror = function() {
    settings.onerror(objImage);
  }

  objImage.setAttribute("src", settings.url);
}
RiseVision.Common.Utility.getNodeValue = function(node) {
  var value = "";

  if ((node != null) && (node.length > 0)) {
    return node[0].textContent;
  }

  return value;
}
//Helper function for node names that include a prefix and a colon, such as "<yt:rating>"
RiseVision.Common.Utility.getElementByNodeName = function(parentNode, nodeName) {
  var colonIndex = nodeName.indexOf(":"), tag = nodeName.substr(colonIndex + 1), nodes = parentNode.getElementsByTagNameNS("*", tag);

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeName == nodeName) {
      return nodes;
    }
  }

  return null;
}
/*
 * Adjust a date to compensate for differences in time zone.
 */
RiseVision.Common.Utility.adjustTime = function(date, offset) {
  return date.setTimezoneOffset(offset);
}
//Find and return the contents of a particular CSS rule.
RiseVision.Common.Utility.getStyle = function(className) {
  var i, j, styleSheet, classes, style = "";

  //Iterate over all style sheets.
  for ( i = 0; i < document.styleSheets.length; i++) {
    styleSheet = document.styleSheets[i];
    classes = styleSheet.rules || styleSheet.cssRules;

    for ( j = 0; j < classes.length; j++) {
      if (classes[j].selectorText == className) {
        style = classes[j].cssText ? classes[j].cssText : classes[j].style.cssText;

        return style;
      }
    }
  }

  return style;
}
RiseVision.Common.Utility.parseCSSRule = function(rule) {
  var a = rule.indexOf("{"), b = rule.indexOf("}"), selector = rule.substring(0, a), rules = rule.substring(++a, b).split(";"), values = [], position;

  //Now remove property name and just keep the value.
  for (var i = 0; i < rules.length; i++) {
    position = -1;

    //Issue 963 Start - font-weight and font-style can switch positions.
    //Ensure font-weight is always in third position and font-style is in the fourth.
    if (rules[i].indexOf("font-family:", 0) != -1) {
      position = 0;
    }
    else if (rules[i].indexOf("color:", 0) != -1) {
      position = 1;
    }
    else if (rules[i].indexOf("font-size:", 0) != -1) {
      position = 2;
    }
    else if (rules[i].indexOf("font-weight:", 0) != -1) {
      position = 3;
    }
    else if (rules[i].indexOf("font-style:", 0) != -1) {
      position = 4;
    }

    if (position == -1) {
      values.push(rules[i].substring(rules[i].indexOf(":", 0) + 1).trim());
    }
    else {
      values[position] = rules[i].substring(rules[i].indexOf(":", 0) + 1).trim();
    }
    //Issue 963 End
  }

  return values;
}
//Issue 953 Start
RiseVision.Common.Utility.isTouchDevice = function() {
  return "ontouchstart" in window;
}
//Issue 953 End
RiseVision.Common.Utility.getQueryParam = function(param) {
  var query = window.location.search.substring(1), vars = query.split("&"), pair;

  for (var i = 0; i < vars.length; i++) {
    pair = vars[i].split("=");

    if (pair[0] == param) {
      return decodeURIComponent(pair[1]);
    }
  }

  return null;
}
