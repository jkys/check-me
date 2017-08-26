$(document).ready(function() {
    var i = 1;
    setInterval(function() {
        $('#loginBody').css('background', 'url(images/mockup' + i + '.jpg) no-repeat center center fixed');
        $('#loginBody').css('-webkit-background-size', 'cover');
        $('#loginBody').css('-moz-background-size', 'cover');
        $('#loginBody').css('-o-background-size', 'cover');
        $('#loginBody').css('background-size:', 'cover');

        if (i < 6) {
            i++;
        } else {
            i = 0;
        }
    }, 15000);
});
