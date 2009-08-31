var Delicious = {
  launch: function(){
    var text = gBrowser.contentWindow.getSelection();
    
    var params = {
      url: gBrowser.contentWindow.location.href,
      description: gBrowser.contentDocument.title,
      extended: (text != "" ? '"' + text + '"' : text)
    }
    
    window.openDialog('chrome://delicious/content/submit.xul', '', 'centerscreen, chrome', params);
  },
  
  dialog: function(){
    var args = window.arguments[0];
    for (var id in args){
      document.getElementById("delicious-dialog-" + id).setAttribute("value", args[id]);    
    }
    document.getElementById("delicious-dialog-tags").select();
  },
  
  toggle: function(disable){
    document.getElementById("delicious-dialog-accept").setAttribute("disabled", disable);
    var dialog = document.getElementById("delicious-dialog");
    
    if (disable){
      dialog.setAttribute("wait-cursor", true);
      window.opener.focus();
    }
    else{
      dialog.removeAttribute("wait-cursor"); // setting to false doesn't work
      window.focus();
    }
  },
  
  accept: function(){
    Delicious.toggle(true);
    var bundle = document.getElementById("delicious-stringbundle");
    
    var params = ["url", "description", "extended", "tags"];

    var q = [];
    for each (var id in params){
      q.push(id + "=" + encodeURIComponent(document.getElementById("delicious-dialog-" + id).value));    
    }
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST",  "https://api.del.icio.us/v1/posts/add", false);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlhttp.send(q.join("&"));

		try {
		  switch (xmlhttp.status) {
			  case 503:
				  alert(bundle.getString("statusthrottled"));
				break;
				  
			  case 401:
			  case 403:
				  alert(bundle.getString("statusauthenticationfailed"));
				break;
				  
			  case 200:
				  Delicious.notify(bundle.getString("statussuccess"));
				  return true;
				break;
			  }
	  }
	  catch (e) {
		  alert(bundle.getString("statusconnectionerror") + ": " + e);
	  }
	  
		Delicious.toggle(false);
	  return false;
  },
  
  notify: function(text){
    try {
    Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService)
       .showAlertNotification("chrome://delicious/skin/icon.png", "del.icio.us", text);
     }
     catch(e){
       // notification not available on OS X in Firefox 2
     }
  },
  
  tasty: function(event){
    event.stopPropagation();
    gBrowser.contentWindow.location.href = "http://del.icio.us/url?url=" + encodeURIComponent(gBrowser.contentWindow.location.href); 
  },
}

