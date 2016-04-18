var prefs;
var tv;
var id;
var port = 9393;
var channel;
var cc = false;
var termsAccepted = false;
var hwnd = 0;
var lic = null;
var companyId = "RISEMASTER";
var displayId = "PREVIEW";

function showViewer() {
	prefs = new gadgets.Prefs();
	id = prefs.getString("id");
	channel = prefs.getString('channel');
	cc = prefs.getBool('cc');
	termsAccepted = prefs.getBool('terms');
	port = prefs.getInt('port');
	tv = document.getElementById('tv');
	hwnd = tv.getHandle();
	
    if (!termsAccepted) {
    	var termsError = document.getElementById('termsError');
    	if (termsError) {
    		termsError.style.display = "block";
    	}
    	if (tv) {
    		tv.style.display = "none";
    	}
    } 
    
    if (id) {
        gadgets.rpc.register("rscmd_play_" + id, playTV);
        gadgets.rpc.register("rscmd_pause_" + id, stopTV);
        gadgets.rpc.register("rscmd_stop_" + id, stopTV);
        gadgets.rpc.register("rsparam_set_" + id, setParamCallback);
        gadgets.rpc.call("", "rsparam_get", null, id, ["displayId", "companyId"]);
    }    

}

function setParamCallback(names, values) {
	if (names && values) {
		for (var i in names) {
			if (values[i]) {
			    if (names[i] == "displayId") {
			        displayId = values[i];
			    } else if (names[i] == "companyId") {
			    	companyId = values[i];
			    }
			}
		}

		//now we can check licence. No need for that if !termsAccepted
	    if (termsAccepted) {
		    lic = new rd.Lic("TV", displayId, companyId, "licError");
		    lic.start(function() { onAuthChecked(); });
			showHideTV(lic.isAuth);
	    }

		//and send ready event
	    readyEvent();
	}
}

function onAuthChecked() { 
	showHideTV(lic.isAuth);
}

function showHideTV(visible) {
	if (tv) {
		//tv.style.display = visible ? "block" : "none";
		tv.style.visibility = visible ? "visible" : "hidden";
	}
}

function playTV() {
    if (tv && termsAccepted && lic && lic.isAuth) {
        var url = 'http://localhost:' + port + '?cmd=play&channel=' + channel + '&cc=' + cc + '&hwnd=' + hwnd;
        callTvServer(url);
	}
}

function stopTV() {
	if (tv && termsAccepted) {
	    var url = 'http://localhost:' + port + '?cmd=stop&hwnd=' + hwnd;
        callTvServer(url);
	}
}

function readyEvent() {
    gadgets.rpc.call('', 'rsevent_ready', null, id, true, true, true, true, false);
}

function doneEvent() {
    gadgets.rpc.call('', 'rsevent_done', null, id);
}

function callTvServer(url) {
    var script = document.createElement("script");
    url += '&rnd=' + Math.random(); //get around browser caching
    script.setAttribute("src", url);
    script.setAttribute("type", "text/javascript");
    document.body.appendChild(script);
}

//riseTvData is callback funtion
function riseTvData() {
}

//keep this at the very bottom
gadgets.util.registerOnLoadHandler(showViewer); 
