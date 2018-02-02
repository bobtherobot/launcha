/****************************
Launcha
By Mike Gieson
www.gieson.com

Generate a plist file for use with launchd to schedule a background script / process / job 
to run at regular intervals and (scheduling timed jobs). This is the preferred replacement for cron
"at jobs" and "periodic jobs" on Mac OS X.

Available on github at:

*****************************/

(function(){

	// Adjust according to you preferences.
	var reverseDomainBase = "com.gieson.launcha";

	// Just some checking to make sure the naming is valid for the plist and filename as well.
	reverseDomainBase = cleanRevDomain(reverseDomainBase);
	

	var sourceTimeTable = {
		min : {every:[], on:[]},
		h : {every:[], on:[]},
		w : {every:[], on:[]},
		d : {every:[], on:[]},
		m : {every:[], on:[]}
	};
	
	var everyChangeList = {
		min : ["[id^=minutes-every-]", "[id^=minutes-on-]"],
		h : ["[id^=hours-every-]", "[id^=hours-on-]"],
		w : ["[id^=weekday-every-]", "[id^=weekday-on-]"],
		d : ["[id^=days-every-]", "[id^=days-on-]"],
		m : ["[id^=months-every-]", "[id^=months-on-]"]
	};
	
	for(var prop in everyChangeList){
		var c = everyChangeList[prop];
		var sel = c[0];
		
		// everys
		$(c[0]).each(function(idx, elem){
			var kind = prop;
			var item = $(elem);
			elem.dataset.waschecked = false;
			item.change(function(){
				eChange(kind, item);
			});
		});
		
		// ons
		$(c[1]).each(function(idx, elem){
			var kind = prop;
			var item = $(elem);
			
			item.change(function(){
				eChange(kind, item);
			});
		});
		
		
		// checkboxes
		var list = [
			//"LaunchOnlyOnce",
			"LowPriorityIO",
			//"RunAtLoad",
			"useStartInterval"
		];
		for(var i=0; i<list.length; i++){
			$("#" + list[i]).change(function(){
				grabInputsAndMakeXML();
			});
		}
	
	
	
		// test areas
		var list = [
			"GroupName",
			"Program",
			"ProgramArguments",
			"WorkingDirectory",
			"StartInterval"
		];
		
		for(var i=0; i<list.length; i++){
			$("#" + list[i]).blur(function(){
				grabInputsAndMakeXML();
			});
		}
		
		$("#saveButton").unbind().click(savePlist);
		//var saveButton = document.getElementById("saveButton");
		
		
	}
	
	
	function eChange(kind, $item){
		var otherList;
		var ecl = everyChangeList[kind];
		var myElem = $item[0]
		var id = myElem.id;
		var val = myElem.value;
		
		var isEvery = /every/.test(id);
		
		var wasChecked;
		if(isEvery){
			wasChecked = myElem.dataset.waschecked == "true" ? true : false;
		}

		var otherSel = isEvery ? ecl[1] : ecl[0];
		$(otherSel).each(function(idx, elem){
			if( elem.checked ){
				elem.checked = false;
				elem.parentNode.classList.remove('active');
				if( ! isEvery ){
					elem.dataset.waschecked = "false";
				}
			}
		
		});
		
		var arr = [];
		var mySel = isEvery ? ecl[0] : ecl[1];
		
		$(mySel).each(function(idx, elem){
			
			if(isEvery){
				if(elem != myElem){
					if( elem.checked ){
						elem.checked = false;
						elem.parentNode.classList.remove('active');
						elem.dataset.waschecked = "false";
					}
				} else {	
		
					// Turn off
					if( wasChecked ){
				
						// Gotta fire after the change event is finisheed doing it's thang.
						setTimeout(function(){
							elem.checked = false;
							elem.parentNode.classList.remove('active');
							elem.dataset.waschecked = "false";	
						}, 100);
					
					} else {
			
						elem.dataset.waschecked = "true";
						arr.push(elem.value);
						
					}
					
				}
				
				
			} else {
				if(elem.checked){
					arr.push(elem.value);
				}
			}
			
		});
		
		// Swap the other one to an empty array.
		sourceTimeTable[kind][isEvery ? "on" : "every"] = [];
		
		// Put arr into "this one" 
		sourceTimeTable[kind][isEvery ? "every" : "on"] = arr;
		
		grabInputsAndMakeXML();
		
	}
	
	
	function getTimestamp(){
		var d = new Date();
		return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()).valueOf();
	}
	
	function alphanumeric (str, strict){
		if(strict){
			return str.replace(/[^A-Za-z0-9]/g, "");
		} else {
			return str.replace(/[^A-Za-z0-9_\-\.]/g, "");
		}

	}
	
	function TYPEOF(input) {
    
      var type = ({}).toString.call(input);
    
      if (type === '[object Object]') {
    
        return 'object';
    
      } else if (type === '[object Array]') {
    
        return 'array';
    
      } else if (type === '[object String]') {
    
        return 'string';
    
      } else if (type === '[object Number]') {
    
        return 'number';
    
      } else if (type === '[object Function]') {
    
        return 'function';
    
      } else if (type === '[object Null]') {
    
        return 'null';
    
      }
    
      return 'undefined';
    
    }

    function cleanRevDomain(str){
		if (str ){
			var Astr = str.split(".");
			var Aclean = [];
			for(var i=0; i<Astr.length; i++){
				if(Astr[i]){
					Aclean[i] = alphanumeric(Astr[i], true);
				}
			}
			str = Aclean.join(".");
		}

		if( ! str ){
			str = "com.gieson.launcha";
		}

		return str;
		
	}

	function isNumber (val) {

		// Faster?
		// return parseFloat(val) == val;

		// JQuery:
		//return !isNaN(parseFloat(val)) && isFinite(val);

		// Prototype
		// https://github.com/sstephenson/prototype/blob/ecacc02/src/prototype/lang/object.js#L524
		return Object.prototype.toString.call(val) === '[object Number]' && isFinite(val);
	}

	function clone(input) {

		var output = input;
		var type = TYPEOF(input);
		var index;
		var size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index) {
				output[index] = clone(input[index]);
			}

		} else if (type === 'object') {

			output = {};

			for (index in input) {
				output[index] = clone(input[index]);
			}

		}

		return output;

	};
	
	var timeXref = {
		min : "Minute",
		h : "Hour",
		d : "Day",
		w : "Weekday",
		m : "Month"
		
	}
	
	function grabInputsAndMakeXML(){

		var obj = {};

		var name = document.getElementById("GroupName").value || "My Program";
		obj.GroupName 		= name;
		//obj.Label 			= "com.gieson.launcha." + alphanumeric( name + "" + getTimestamp(), true ).toLowerCase();
		obj.Label 			= reverseDomainBase + "." + alphanumeric( name );
		//obj.LaunchOnlyOnce 	= document.getElementById("LaunchOnlyOnce").checked;
		obj.LowPriorityIO 	= document.getElementById("LowPriorityIO").checked;
		//obj.RunAtLoad 		= document.getElementById("RunAtLoad").checked;
		obj.WorkingDirectory = document.getElementById("WorkingDirectory").value;
		obj.Program 		= document.getElementById("Program").value;

		var args = document.getElementById("ProgramArguments").value;
		if(args){
			//obj.ProgramArguments = args.split(" ");
			obj.ProgramArguments = args;
		}

		if( document.getElementById("useStartInterval").checked ){
			var interval = Number(document.getElementById("StartInterval").value);
			obj.StartInterval = interval;
		} else {
			obj.StartCalendarInterval = sourceTimeTable;
		}
		
		var elem = document.getElementById("output");
		
		var store = JSON.stringify(obj, null, '\t');
		//elem.value = store;
		
		var xml = buildXML(obj);
		elem.value = buildXML(obj);
		saveasData = xml;
		saveasFileName = obj.Label + ".plist";
	}
	
	
	function savePlist(){
		console.log("savePlist");
		if( ! saveasFileName ){
			grabInputsAndMakeXML();
		}
		var blob = new Blob([saveasData], {type: "application/xml;charset=utf-8"});
		window.saveAs(blob, saveasFileName);
	}
	
	
	
	function getFilePathComplete(result){
		var elem = document.getElementById("output");
		elem.value = "getFilePathComplete"; //result.toString();
		if(result.status == 0) {
			getFileListCallback(result.stdOut);
		} else {
			getFileListCallback("ERROR: " + result.stdOut);
		}
	}
	
	var saveasFileName = "";
	var saveasData = "";
	
	function buildXML(dataset){
		
		var clean = {};
		
		var name = dataset.GroupName || "My launchd";
		clean.GroupName 		= name;
		clean.Label 			= dataset.Label || ( reverseDomainBase + "." + alphanumeric( name ) );
		
		
		
		var args = dataset.ProgramArguments;
		if(args){
			clean.ProgramArguments = args.split(" ");
		}
		
		// ------------------
		// Booleans
		// ------------------
		var opts = [
			//"LaunchOnlyOnce",
			"LowPriorityIO"
			//"RunAtLoad"
			// Can include all the rest of the items as decribed in:
			// https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
		];
		
		for(var i=0; i<opts.length; i++){
			var opName = opts[i];
			var val = dataset[opName]
			if( val === "true" || val === true || val === 1){
				clean[opName] = true;
			} else if (val === "false" || val === false || val === 0){
				clean[opName] = false;
			}
		}
		
		// ------------------
		// String-like
		// ------------------
		var opts = [
			"Program",
			"WorkingDirectory"
			// Can include all the rest of the items as decribed in:
			// https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
		];
		
		for(var i=0; i<opts.length; i++){
			var opName = opts[i];
			if( dataset[opName] ){
				clean[opName] = dataset[opName];
			}
		}
		
		// ------------------
		// Number-like
		// ------------------
		var opts = [
			"StartInterval"
			// Can include all the rest of the items as decribed in:
			// https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
		];
		
		for(var i=0; i<opts.length; i++){
			var opName = opts[i];
			var val = Number( dataset[opName] );
			// Compaare parsed number to actual value, loosely
			if( val == dataset[opName] && isNumber(val) ){
				clean[opName] = val;
			}
		}
		
		if(typeof clean.StartInterval != "undefined"){
			if(clean.StartInterval < 10){
				clean.StartInterval = 10;
			}
		}
		
		clean.RunAtLoad = true;
		clean.EnvironmentVariables = {PATH:"/bin:/usr/bin:/usr/local/bin"};
		
		
		// ------------------
		// Convert time object to collated array or interval as needed.
		// ------------------
		var calSrc = dataset.StartCalendarInterval;
		if(calSrc){
			var cal = buildTimes(calSrc);
			//clean.StartCalendarInterval = cal;
			//*
			var type = TYPEOF(cal);
			if(type == "array"){
				if(cal.length > 0){
					clean.StartCalendarInterval = cal;
				}
			} else if(type == "number"){
				if(cal > 0){
					clean.StartInterval = cal;
				}
			}
			//*/
		}

		

		var xml = plist.build(clean);
		
		
		return xml;
		
	}
	

	function buildTimes(inputTimesSrc){
		
		// Make a clean copy so we don't pollute the user's object
		var inputTimes = clone(inputTimesSrc);

		var table = {};

		// if w, d, or m is set, but h and/or min isn't set, then we need to force hours to run on 0

		var forceHoursToZero = ["w", "d", "m"];
		if(inputTimes.h.on.length < 1 && inputTimes.h.every.length < 1){
			var forceit = false;
			for(var i=0; i<forceHoursToZero.length; i++){
				var item = forceHoursToZero[i];
				if(inputTimes[item].on.length > 0 || inputTimes[item].every.length > 0){
					forceit = true;
					break;
				}
			}
			if(forceit){
				inputTimes.h.on = [0];
				if(inputTimes.min.on.length < 1 && inputTimes.min.every.length < 1){
					inputTimes.min.on = [0];
				}
			}
		}


		for(var t in inputTimes){

			var Aon = [];
			var Aevery = [];
			var interval = 0;

			var obj = inputTimes[t];

			if(obj.on.length > 0){
				Aon = obj.on.slice();
			} else {
				var val = obj.every[0];
				var intVal = parseInt(val);

				// If weekday, day or month is set to run every 1 parcel of time, 
				// e.g. every day, every month, every weekday, then treat them as wildcards and 
				// they'll run, well, every day, so we don't have to set them explicitely.
				// By omiting them, they behave as wildcards.

				// We have to check val.length < 2 for weekday's weirdo 1-2-3-4-5, which inval parseInt parses to 1

				// "every" should normally only have one thing in there.
				if(obj.every.length > 0 && 
					!( (intVal === 1 && val.length < 2) && (t == "w" || t == "d" || t == "m") )
				){
					
					// --------------------
					// minutes
					// --------------------
					if(t == "min"){

						for(var i=0; i<60; i++){
							if( i % intVal === 0 ){
								Aevery.push(i);
							}
						}

					// --------------------
					// hours
					// --------------------
					} else if(t == "h"){

						for(var i=0; i<24; i++){
							if( i % intVal === 0 ){
								Aevery.push(i);
							}
						}

					// --------------------
					// weekday
					// --------------------
					} else if(t == "w"){

						if( val.indexOf("-") > 0 ){
							Aevery = val.split("-");
						} else {

							for(var i=0; i<7; i++){
								if( i % intVal === 0 ){
									Aevery.push(i);
								}
							}
						}

					// --------------------
					// days
					// --------------------
					} else if(t == "d"){

						var offset = 0;
						if(val == "+2"){
							offset = 1;
						}


						for(var i=0; i<31; i++){
							if( i % intVal === offset ){
								Aevery.push(i);
							}
						}

					// --------------------
					// months
					// --------------------
					} else if(t == "m"){

						var offset = 0;
						if(val == "+2"){
							offset = 1;
						}

						for(var i=0; i<12; i++){
							if( i % intVal === offset ){
								Aevery.push(i);
							}
						}

					}

				}

			}

			// See which one has something in there
			var use = (Aon.length > 0) ? Aon : Aevery;
			
			// Convert any strings to numbers
			use = use.map(Number);
			
			// And finally populate the table that we'll convert.
			table[t] = use;

		}

		/*
		// Minutes or hours using "every" option? 
		// Then just convert into an interval and return a simple numeric value.
		if(table.w.length < 1 && table.d.length < 1 && table.m.length < 1){

			if(table.h.length < 1){
				if(inputTimes.min.every.length > 0){
					return parseInt(inputTimes.min.every[0]) * 60;
				}
			}

			if(table.min.length < 1){
				if(inputTimes.h.every.length > 0){
					return parseInt(inputTimes.h.every[0]) * 60 * 60;
				}
			}


		}
		*/


		// Build an array of collated objects.
		var ordered = ["min", "h", "w", "d", "m"];
		ordered.reverse();

		var merged = [];
		for(var ord=0; ord<ordered.length; ord++){
			var key = ordered[ord]; // Gets the items according to the order listed.
			var values = table[key]; // Gets the selected values, h[5,7].
			var partRef = timeXref[key]; // Converts min->Minute, h->Hour... etc...

			// Only when we've got some values.
			if(values.length > 0){

				// First run?
				if(merged.length < 1){

					// Build a base from which to work.
					for(var v=0;v<values.length; v++){
						var obj = {};
						obj[partRef] = values[v];
						merged.push(obj);
					}

				} else {

					// Create an array to feed.
					var feeder = [];

					// Get any existing things we already have.
					for(var r=0;r<merged.length; r++){

						// Get a thing.
						var robj = merged[r];

						// Clone the robj, then feed it.
						for(var v=0;v<values.length; v++){

							// Object.assign only available after Chrome v45, Opera 32, IE Edge, Safari 9, Firefox 32
							//var copy = Object.assign({}, robj);

							var copy = clone(robj)
							copy[partRef] = values[v];
							feeder.push(copy);
						}
					}

					// Swap out feeder and make it the new merged array for the next go-round.
					merged = feeder.slice();
				}
			}
		}

		return merged;


	}
	
	
}());

