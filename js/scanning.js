$( document ).ready(function() {
	var interval = 0;
	var text = ["Connecting To Twitter", "Searching through tweets", "Connecting to Facebook", "Searching through posts", "Compiling data", "Organizizing Tweets and Posts", "Setting up For Display", "Done."];
	var arrayLength = text.length;

	var scanText = $('#scanText');
	var elipsesText = $('#elipses');
	var scanningBox = $('#scanningButton');

    var scanLoop = setInterval(function(){
    	scanText.html(text[interval]);
    	elipsesText.html('');

    	if (interval >= arrayLength) {
			clearInterval(scanLoop);
		}
    	interval += 1;
	}, 7000);

	var elipsesLoop = setInterval(function(){
    	if(scanText.text() != 'Done.' & elipsesText.text() != '...'){
    		elipsesText.append('.');
    	} else {
    		elipsesText.html('');
    	}
	}, 500);
});