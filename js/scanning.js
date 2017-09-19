$(document).ready(function () {
    var interval = 0;
    var text = ["Connecting To Twitter", "Searching through tweets", "Connecting to Facebook", "Searching through posts", "Compiling data", "Organizing Tweets and Posts", "Setting up For Display", "Done."];
    var arrayLength = text.length;

    var scanText = $('#scanText');
    var ellipsesText = $('#ellipses');
    var scanningBox = $('#scanningButton');

    var scanLoop = setInterval(function () {
        scanText.html(text[interval]);
        ellipsesText.html('');

        if (interval >= arrayLength) {
            clearInterval(scanLoop);
        }
        interval += 1;
    }, 7000);

    var ellipsesLoop = setInterval(function () {
        if (scanText.text() != 'Done.' && ellipsesText.text() != '...') {
            ellipsesText.append('.');
        } else {
            ellipsesText.html('');
        }
    }, 500);
});
