$(document).ready(function () {
    if (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) {
        window.location.href = 'https://itunes.apple.com/us/app/check-me-social-media-checker/id1207914479?mt=8';
    }

    window.fbAsyncInit = function () {
        FB.init({
            appId: '1229742877063233',
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));


    $('#loggedInBar').hide();

    var config = {
        apiKey: 'AIzaSyBXpn2g6SLj4CB_4hkvLs4N4P4D7yTZf_k',
        authDomain: 'checkme-8f276.firebaseapp.com',
        databaseURL: 'https://checkme-8f276.firebaseio.com',
        storageBucket: 'checkme-8f276.appspot.com',
        messagingSenderId: '410954694898'
    };

    firebase.initializeApp(config); // Initialize FireBase
    const auth = firebase.auth(); // Create constant on FireBase authenticated
    const database = firebase.database(); // Create constant on FireBase database

    auth.onAuthStateChanged(function (user) {
        if (user) {
            var twitterLinked = checkTwitterLink();
            var facebookLinked = checkFacebookLink();

            $('#loggedInBar').show();
            var currentPage = window.location.pathname;
            if (~currentPage.indexOf('index.html')) {
                window.location = 'home.html';
            }

            if (twitterLinked) {
                $('#linkTwitter').hide();
                $('#unlinkTwitter').show();
            } else {
                $('#unlinkTwitter').hide();
                $('#linkTwitter').show();
            }

            if (facebookLinked) {
                $('#linkFacebook').hide();
                $('#unlinkFacebook').show();
            } else {
                $('#unlinkFacebook').hide();
                $('#linkFacebook').show();
            }

            if (!twitterLinked && !facebookLinked) {
                $('#scanningDiv').hide();
                $('#noSMPDiv').show();
            }
        } else {
            $('#loggedInBar').hide();
        }
    });

    function getTwitterPosts(page) {
        page = page == undefined ? 0 : page;
        var user;
        var accessToken;
        var secret;
        if (page == 0) {
            var provider = new firebase.auth.TwitterAuthProvider();
            auth.signInWithPopup(provider).then(function (result) {
                accessToken = result.credential.accessToken;
                secret = result.credential.secret;
                user = getTwitterUser(accessToken);
                $.ajax({
                    type: 'POST',
                    url: 'getTweets.php',
                    data: {
                        userID: user,
                        token: accessToken,
                        secret: secret,
                        page: page
                    },
                    dataType: 'json',
                    success: getTweets
                });
            });
        } else if (user != '' && user != null) {

            $.ajax({
                type: 'POST',
                url: 'getTweets.php',
                data: {
                    userID: user,
                    token: accessToken,
                    secret: secret,
                    page: page
                },
                dataType: 'json',
                success: getTweets
            });

        }
    }

    function getTweets(response) {
        var postID = [];
        if (response != '[]') {
            if (typeof response.errors === 'undefined' || response.errors.length < 1) {
                var page = 1;
                $.each(JSON.parse(response), function (i, obj) {
                    var date = Date.parse(obj.created_at.replace(/( +)/, ' UTC$1'));
                    var date = convertIso(date);
                    var tweet = obj.text;
                    var url = 'https://twitter.com/' + obj.user.id_str + '/status/' + obj.id_str;

                    displayPost(tweet, date, url, 'twitter');
                });
                page += 1;
                getTwitterPosts(page);
            }
        }
    }

    function getPosts(response) {
        if (response && !response.error && response.data != '') {
            var res = response.posts.data;
            res.forEach(function (postInfo) {
                var from = postInfo.from.name;
                var post = postInfo.message;
                //var url = getFaceBookPostUrl(postInfo.id);
                var url = postInfo.permalink_url;
                var time = postInfo.created_time;
                var date = convertIso(time);
                displayPost(post, date, url, 'facebook', from);
                if (postInfo.comments != null && postInfo.comments != '') {
                    postInfo.comments.data.forEach(function (commentInfo) {
                        var from = "Comment by: " + commentInfo.from.name;
                        var post = commentInfo.message;
                        //var url = getFaceBookPostUrl(commentInfo.id);
                        var url = commentInfo.permalink_url;
                        var date = convertIso(commentInfo.created_time);
                        displayPost(post, date, url, 'facebook', from);
                    })
                }
            });
            // FB.api(response.paging.next, getPosts);
        }

    }

    function getFacebookPosts(token) {
        FB.api('/me?fields=posts.limit(10000){created_time,permalink_url,from,comments{message,from,created_time,permalink_url},message}', {
            'access_token': token
        }, getPosts);

        if (checkTwitterLink()) {
            getTwitterPosts();
        } else {
            $('#tw_tab').hide();
            $('#login').hide();
            $('#fb_tab').hide();
        }
    }

    function getTwitterUser(accessToken) {
        var index = accessToken.indexOf('-');
        return accessToken.substring(0, index);
    }


    /*************************************************
     ****************FUNCTION METHODS*****************
     *************************************************/

    function convertIso(iso) {
        var monthNames = ['January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'
        ];

        var date = new Date(iso);
        var day = date.getDate();
        var year = date.getFullYear();
        var month = date.getMonth();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var postfix = 'am';

        if (hour > 12) {
            hour -= 12;
            postfix = 'pm';
        } else if (hour == 0) {
            hour = 12;
        }
        return monthNames[month] + ' ' + day + ', ' + year + ' at ' + hour + ':' + minute + postfix;
    }

    function displayPost(message, date, url, platform, from) {
        if (message != '' && message != undefined) {
            var imgUrl = 'images/logo.png';
            var score = 0;
            var flaggedWords = '';
            var profaneJson = firebase.database().ref('Profanity');

            var link = "window.open('" + url + "', '_blank', 'toolbar=yes, location=yes, status=yes, menubar=yes, scrollbars=yes');";

            profaneJson.on('value', function (snapshot) {
                profaneWordSet = snapshot.val();
                profaneWordSet.forEach(function (profaceInnerJson) {
                    var word = profaceInnerJson.Word;
                    var scale = profaceInnerJson.scale;

                    if (containsProfanity(message, word)) {
                        flaggedWords = flaggedWords + word + ', ';
                        score += scale;
                    }
                });

                if (score > 0) {
                    if (platform == 'facebook') {
                        auth.currentUser.providerData.forEach(function (array) {
                            if (array.providerId.includes(platform)) {
                                imgUrl = array.photoURL;
                            }
                        });
                        $('#' + platform + 'Results').append('<div onclick="$(this).find(\'.reasons\').toggle();" class="postButton"><div class="post"><img src="' + imgUrl + '" class="postImg"><div class="timename"><h3 class="time">' + from + '</h3><h3 class="time">' + date + '</h3></div><p class="text">' + message + '</p><div class="reasons" style="display: none;"><hr>Flagged words in post: ' + flaggedWords.slice(0, -2) + '<br>Flagged words: ' + (score / 100) + '.<br><p id="pLink" onclick="' + link + '">Click here to navigate to post.</p></div></div></div>');
                    } else {
                        auth.currentUser.providerData.forEach(function (array) {
                            if (array.providerId.includes(platform)) {
                                imgUrl = array.photoURL;
                            }
                        });
                        $('#' + platform + 'Results').append('<div onclick="$(this).find(\'.reasons\').toggle();" class="postButton"><div class="post"><img src="' + imgUrl + '" class="postImg"><h3 class="time">' + date + '</h3><p class="text">' + message + '</p><div class="reasons" style="display: none;"><hr>Flagged words in post: ' + flaggedWords.slice(0, -2) + '<br>Flagged words: ' + (score / 100) + '.<br><p id="pLink" onclick="' + link + '">Click here to navigate to post.</p></div></div></div>');
                    }
                }
            });
        }
    }

    function containsProfanity(message, word) {
        message = message.toLowerCase();
        word = word.toLowerCase();
        var profane = false;
        var prefix = ['', 'er', 'ing', 's', 'ed', 'in'];
        prefix.forEach(function (ending) {
            message = message + ending;
            word = word + ending;
            message.split(' ').forEach(function (messageWord) {
                messageWord = messageWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                var messageShort = messageWord.replace(/(.)\1{1,}/g, '$1');
                var wordShort = word.replace(/(.)\1{1,}/g, '$1');
                if (messageShort == wordShort && messageWord != 'as' && messageWord != 'con') {
                    profane = true;
                }
            });
        });
        return profane || message.includes(' ' + word + ' ') || message.match('^' + word + ' ') || message.match(' ' + word + '$');
    }

    function postNotEmpty(message) {
        return (message != '') && (message != undefined);
    }

    function getFaceBookPostUrl(id) {
        var index = id.indexOf('_');
        var prefix = id.substring(0, index);
        var postfix = id.substring((index + 1));

        var urlPrefix = 'http://www.facebook.com/';
        var urlPostfix = '/posts/';
        var url = urlPrefix + prefix + urlPostfix + postfix;
        return url;
    }

    function signOutAndRedirect() {
        auth.signOut();
        window.location = 'index.html';
    }

    function redirectUser() {
        if (auth.currentUser) {
            window.location = 'home.html';
        } else {
            window.location = 'index.html';
        }
    }

    function signInToAccount(provider) {
        auth.signInWithPopup(provider).then(function (result) {
            window.location = 'home.html';
            return result;
        }).catch(function (error) {
            outPutMessage('register', false, error.message);
            return error;
        });
    }

    function linkAccounts(user, provider, platform) {
        user.linkWithPopup(provider).then(function (result) {
            outPutMessage('linkAccount', true, platform + ' account linked!');
            $('#link' + platform).hide();
            $('#unlink' + platform).show();
            return result;
        }).catch(function (error) {
            outPutMessage('linkAccount', false, error.message);
            return error;
        });
    }

    function unlinkAccounts(user, platform) {
        providerid = null;
        user.providerData.forEach(function (array) {
            if (array.providerId.includes(platform.toLowerCase())) {
                providerid = array.providerId;
            }
        });

        user.unlink(providerid).then(function () {
            outPutMessage('linkAccount', true, platform + ' account unlinked!');
            $('#unlink' + platform).hide();
            $('#link' + platform).show();
        }).catch(function (error) {
            outPutMessage('linkAccount', false, error.message);
            return error;
        });
    }

    function intializeScan() {
        var scanText = $('#scanText');
        var elipsesText = $('#elipses');

        scanText.html('Scanning');

        interval = 0;
        maxInterval = 12;

        var loop = setInterval(function () {
            if (elipsesText.text() != '...') {
                elipsesText.append('.');
            } else {
                elipsesText.html('');
            }

            if (interval >= maxInterval) {
                clearInterval(loop);
                $('#scanningDiv').hide();
                $('#scanResults').show();
            }

            interval += 1;
        }, 500);
    }

    function outPutMessage(object, success, errorMessage) {
        var object = $('#' + object + 'Message');
        if (success) {
            object.removeClass('errorMessage');
            object.addClass('successMessage');
        } else {
            object.removeClass('successMessage');
            object.addClass('errorMessage');
        }
        object.html(errorMessage);
    }

    function checkFacebookLink() {

        var result = auth.currentUser.providerData;
        var response = false;

        result.forEach(function (provider) {
            if (provider.providerId == "facebook.com") {
                response = true;
            }
        });
        return response;
    }

    function checkTwitterLink() {
        var result = auth.currentUser.providerData;
        var response = false;

        result.forEach(function (provider) {
            if (provider.providerId == "twitter.com") {
                response = true;
            }
        });
        return response;
    }


    /*************************************************
     ****************LISTENER METHODS*****************
     *************************************************/

    $('#signUp').click(function () {
        var registerEmailText = $('#registerEmail').val();
        var setPasswordText = $('#setPassword').val();

        const signUpPromise = auth.createUserWithEmailAndPassword(registerEmailText, setPasswordText);
        signUpPromise.then(function (user) {
            user.sendEmailVerification().then(function () {
                outPutMessage('register', true, 'Verification Email Sent.');
                window.location = 'home.html';
            }).catch(function (error) {
                outPutMessage('register', true, 'Account created, however verification email not sent.');
            });
        }).catch(function (error) {
            outPutMessage('register', false, error.message);
        });
    });

    $('#unlinkFacebook').click(function () {
        var result = unlinkAccounts(auth.currentUser, 'Facebook');
    });

    $('#unlinkTwitter').click(function () {
        var result = unlinkAccounts(auth.currentUser, 'Twitter');
    });

    $('#signIn').click(function () {
        var emailText = $('#email').val();
        var passwordText = $('#password').val();

        const signInPromise = auth.signInWithEmailAndPassword(emailText, passwordText);
        signInPromise.then(function () {
            window.location = 'home.html';
        }).catch(function (error) {
            outPutMessage('login', false, error.message);
        });
    });

    $('#updateEmail').click(function () {
        var newEmailText = $('#newEmail').val();
        var currentPasswordText = $('#currentPassword').val();
        var user = auth.currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

        user.reauthenticate(cred).then(function () {
            user.updateEmail(newEmailText).then(function () {
                outPutMessage('updateEmail', true, 'Email Updated to ' + newEmailText + '.');
            }).catch(function (error) {
                outPutMessage('updateEmail', false, error.message);
            });
        }).catch(function (error) {
            outPutMessage('updateEmail', false, error.message);
        });
    });

    $('#updatePassword').click(function () {
        var newPasswordText = $('#newPassword').val();
        var currentPasswordText = $('#currentPassword').val();
        var user = auth.currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

        user.reauthenticate(cred).then(function () {
            user.updatePassword(newPasswordText).then(function () {
                outPutMessage('updatePassword', true, 'Password Successfully Updated.');
            }).catch(function (error) {
                outPutMessage('updatePassword', false, error.message);
            });
        }).catch(function (error) {
            outPutMessage('updatePassword', false, error.message);
        });
    });

    $('#forgotPassword').click(function () {
        var emailText = $('#email').val();
        if (emailText == '') {
            outPutMessage('login', false, 'Please enter an email above.');
        } else {
            var forgotPasswordPromise = auth.sendPasswordResetEmail(emailText);
            forgotPasswordPromise.then(function () {
                outPutMessage('login', true, 'Password resent email sent to ' + emailText + '.');
            }).catch(function (error) {
                outPutMessage('login', false, error.message);
            });
        }
    });

    $('#deleteAccount').click(function () {
        var currentPasswordText = $('#currentPassword').val();
        var user = auth.currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

        user.reauthenticate(cred).then(function () {
            user.delete().then(function () {
                window.location = 'index.html';
            }).catch(function (error) {
                outPutMessage('deleteAccount', false, error.message);
            });
        }).catch(function (error) {
            outPutMessage('deleteAccount', false, error.message);
        });
    });

    $('#linkFacebook').click(function () {
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('user_posts');
        var result = linkAccounts(auth.currentUser, provider, 'Facebook');
    });

    $('#linkTwitter').click(function () {
        var provider = new firebase.auth.TwitterAuthProvider();
        var result = linkAccounts(auth.currentUser, provider, 'Twitter');
    });

    $('#logOut').click(function () {
        signOutAndRedirect();
    });

    $('#CheckMeLogo, #homeButton').click(function () {
        redirectUser();
    });

    $('#scanButton').click(function () {
        intializeScan();

        if (checkFacebookLink()) {
            var provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('user_posts');
            auth.signInWithPopup(provider).then(function (result) {
                var accessToken = result.credential.accessToken;
                getFacebookPosts(accessToken);
            });

        } else {
            $('#fb_tab').hide();
            $('#signup').hide();
            $('#fb_tab').removeClass('active');

            $('#login').show();
            $('#tw_tab').hide();
            getTwitterPosts();
        }
    });
});
