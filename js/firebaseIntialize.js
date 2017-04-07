$( document ).ready(function() {

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '1229742877063233',
			xfbml      : true,
			version    : 'v2.8'
		});
		FB.AppEvents.logPageView();
	};

	var globalProfanityFlag = 0;

	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
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

	firebase.initializeApp(config); // Intialize firebase
	const auth = firebase.auth(); // Create constant on firebase authenticated
	const database = firebase.database(); // Create constant on firebase database


	auth.onAuthStateChanged(function (user) {
        if (user) {
        	$('#loggedInBar').show();
        	var currentPage = window.location.pathname;
        	if (~currentPage.indexOf('index.html')) {
        		window.location = 'home.html';
        	}
        } else {
        	$('#loggedInBar').hide();
        }
    });

	

	function getTwitterPosts(page = 0) {
		var user;
		var accessToken;
		var secret;
		if(page == 0){
			var provider = new firebase.auth.TwitterAuthProvider();
			auth.signInWithPopup(provider).then(function(result) {
			accessToken = result.credential.accessToken;
			secret = result.credential.secret;
			user = getTwitterUser(accessToken);
			$.ajax({
				type: 'POST',
				url: 'get_tweets.php',
				data: {
					userID: user,
					token: accessToken, 
					secret: secret,
					page: page
				},
				dataType : 'json',
				success: getTweets
			}).done(function() {
				$('.postButton').on('click', function(){
					var reasons = $(this).find('.reasons');
					if(reasons.is(":visible")) {
						reasons.slideUp("slow");
					} else {
						reasons.slideDown("slow");
					}
				});
			});
		});
		} else if(user != '' && user !=null){

			$.ajax({
				type: 'POST',
				url: 'get_tweets.php',
				data: {
					userID: user,
					token: accessToken, 
					secret: secret,
					page: page
				},
				dataType : 'json',
				success: getTweets
			}).done(function() {
				$('.postButton').on('click', function(){
					var reasons = $(this).find('.reasons');
					if(reasons.is(":visible")) {
						reasons.slideUp("slow");
					} else {
						reasons.slideDown("slow");
					}
				});
			});

		}
	}

	function getTweets (response) {
		var postID = [];
		if(response != '[]'){
			if (typeof response.errors === 'undefined' || response.errors.length < 1 ) {
				var page = 1;
				$.each(JSON.parse(response), function(i, obj) {
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

	function getPosts (response) {
		if (response && !response.error && response.data != '') {
			response.posts.data.forEach(function(data) {
					var from = data.from.name;
					var post = data.message;
					//var url = getFaceBookPostUrl(data.id);
					var url = data.permalink_url;
					var date = convertIso(data.created_time);
					displayPost(post, date, url, 'facebook', from);
				if(data.comments != null && data.comments != ''){
					data.comments.data.forEach(function(data) {
						var from = "Comment by: " + data.from.name;
						var post = data.message;
						//var url = getFaceBookPostUrl(data.id);
						var url = data.permalink_url;
						var date = convertIso(data.created_time);
						displayPost(post, date, url, 'facebook', from);
					})
				}
			})
	    	// FB.api(response.paging.next, getPosts);
		}

	}

	function getFacebookPosts(token) {
		FB.api('/me?fields=posts.limit(10000){created_time,permalink_url,from,comments{message,from,created_time,permalink_url},message}', {
	        'access_token' : token
     	}, getPosts);
     	
     	if (checkTwitterLink()) {
     		getTwitterPosts();
     	} else {
 			$('#tw_tab').hide();
			$('#login').hide();
     	}

		if(globalProfanityFlag == 0){

			//alert("No profanity found!!!!"); 
		}
	}

	function getTwitterUser(accessToken) {
		var index = accessToken.indexOf('-');
		return accessToken.substring(0, index);
	}


	/*************************************************
	 *************************************************
	 *************************************************
	 *************************************************
	 *************************************************
	 ****************FUNCTION METHODS*****************
	 *************************************************
	 *************************************************
	 *************************************************
	 *************************************************
	 *************************************************/

	function convertIso(iso) {
		var monthNames = 
			['January', 'February', 'March', 'April', 
			'May', 'June', 'July', 'August', 'September', 
			'October', 'November', 'December'];


		var date = new Date(iso);	
		var day = date.getDate();
		var year = date.getFullYear();
		var month = date.getMonth();
		var hour = date.getHours();
		var minute = date.getMinutes();
		var postfix = 'am';

		if(hour > 12) {
			hour -= 12;
			postfix = 'pm';
		} else if (hour == 0) {
			hour = 12;
		}
		var dateString = monthNames[month] + ' ' + day + ', ' + year + ' at ' + hour + ':' + minute + postfix;
		return dateString;
	}

	function displayPost(message, date, url, platform, from) {
		if(message != '' && message != undefined) {
			var imgUrl = 'images/logo.png';
			var score = 0;
			var flaggedWords = '';
			var profaneJson = firebase.database().ref('Profanity');

			var link = "window.open('" + url + "', '_blank', 'toolbar=yes, location=yes, status=yes, menubar=yes, scrollbars=yes');";
			
			profaneJson.on('value', function(snapshot) {
				profaneWordSet = snapshot.val();
				profaneWordSet.forEach(function(profaceInnerJson) {
					var word = profaceInnerJson.Word;
					var scale = profaceInnerJson.scale;

					if(containsProfanity(message, word)) {
						flaggedWords = flaggedWords + word + ', ';
						score += scale;
						globalProfanityFlag = 1;
					}
				});

				if(score > 0) {


					if(platform == 'facebook'){
											auth.currentUser.providerData.forEach(function(array) {
						if(array.providerId.includes(platform)){
							imgUrl = array.photoURL;
						}
					});
						$('#' + platform + 'Results').append('<button class="postButton"><div class="post"><img src="' + imgUrl + '" class="postImg"><div class="timename"><h3 class="time">' + from + '</h3><h3 class="time">' + date + '</h3></div><p class="text">' + message + '</p><div class="reasons"><hr>Flagged words in post: ' + flaggedWords.slice(0, -2) + '<br>Flagged words: ' + (score/100) + '.<br><p onclick="' + link + '">Click here to navigate to post.</p></div></div></button>');
					}
					else{
											auth.currentUser.providerData.forEach(function(array) {
						if(array.providerId.includes(platform)){
							imgUrl = array.photoURL;
						}
					});
						$('#' + platform + 'Results').append('<button class="postButton"><div class="post"><img src="' + imgUrl + '" class="postImg"><h3 class="time">' + date + '</h3><p class="text">' + message + '</p><div class="reasons"><hr>Flagged words in post: ' + flaggedWords.slice(0, -2) + '<br>Flagged words: ' + (score/100) + '.<br><a href="' + url + '" class="postLink">Click here to navigate to post.</a></div></div></button>');
					}
				}

			});
		}
	}

	function containsProfanity(message, word) {
		var profane = false;
		var prefix = ['', 'er', 'ing', 's', 'ed', 'in'];
		prefix.forEach(function(ending) {
			message = message.toLowerCase() + ending;
			word = word.toLowerCase() + ending;
			message.split(' ').forEach(function(messageWord) {
				messageWord = messageWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
				messageShort = messageWord.replace(/(.)\1{1,}/g, '$1');
				wordShort = word.replace(/(.)\1{1,}/g, '$1');
				if(messageShort == wordShort && messageWord != 'as' && messageWord != 'con' || messageShort.includes(word)) {
					profane = true;
				}
			});
		});
		return profane || message.includes(' ' + word + ' ') || message.match('^' + word + ' ') || message.match(' ' + word + '$') || message == word;
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
		if(auth.currentUser) {
			window.location = 'home.html';
		} else {
			window.location = 'index.html';
		}
	}

	function signInToAccount(provider) {
        auth.signInWithPopup(provider).then(function(result) {
        	window.location = 'home.html';
        	return result;
        }).catch(function(error) {
			outPutMessage('register', false, error.message);
			return error;
		});
	}

	function linkAccounts(user, provider, platform) {
		user.linkWithPopup(provider).then(function(result) {
			outPutMessage('linkAccount', true, platform + ' account linked!');
			return result;
		}).catch(function(error) {
			outPutMessage('linkAccount', false, error.message);
			return error;
		});
	}

	function unlinkAccounts(user, platform) {
		providerid = null;
		user.providerData.forEach(function(array) {
			if(array.providerId.includes(platform)){
				providerid = array.providerId;
			}
		});

		user.unlink(providerid).then(function() {
			outPutMessage('linkAccount', true, (platform.substr(0,1).toUpperCase() + platform.substr(1)) + ' account unlinked!');
		}).catch(function(error) {
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

		var loop = setInterval(function() {
	    	if(elipsesText.text() != '...') {
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
		if(success) {
			object.removeClass('errorMessage');
			object.addClass('successMessage');
		} else {
			object.removeClass('successMessage');
			object.addClass('errorMessage');
		}
		object.html(errorMessage);
	}

	function getUserLogin(){

		var user = auth.currentUser;
		var result = user.providerData
		if(result.length > 1){
			console.log(result);
			return true;
		} else {
			return false;

		}
	}

	function checkFacebookLink(){

		var result = auth.currentUser.providerData;
		var response = false;

		result.forEach(function(provider){
			if(provider.providerId == "facebook.com"){
				//alert("facebook is linked");
				response = true;
			}
		});
		return response;
	}

	function checkTwitterLink(){

		var result = auth.currentUser.providerData;
		var response = false;

		result.forEach(function(provider){
			if(provider.providerId == "twitter.com"){
				//alert("twitter is linked");
				response = true;
			}
		});
		return response;
	}




	/*************************************************
	 *************************************************
	 *************************************************
	 *************************************************
	 *************************************************
	 ****************LISTENER METHODS*****************
	 *************************************************
	 *************************************************
	 *************************************************
	 *************************************************
	 *************************************************/

	$('#signUp').click(function() {
		var registerEmailText = $('#registerEmail').val();
		var setPasswordText = $('#setPassword').val();

		const signUpPromise = auth.createUserWithEmailAndPassword(registerEmailText, setPasswordText);
		signUpPromise.then(function(user) {
			user.sendEmailVerification().then(function() {
			 	outPutMessage('register', true, 'Verification Email Sent.');
			 	window.location = 'home.html';
			}).catch(function(error) {
				outPutMessage('register', true, 'Account created, however verification email not sent.');
			});
		}).catch(function(error) {
			outPutMessage('register', false, error.message);
		});
	});

	$('#unlinkFacebook').click(function() {
		var result = unlinkAccounts(auth.currentUser, 'facebook');
	});

	$('#unlinkTwitter').click(function() {
		var result = unlinkAccounts(auth.currentUser, 'twitter');
	});

	$('#signIn').click(function() {
		var emailText = $('#email').val();
		var passwordText = $('#password').val();
		
		const signInPromise = auth.signInWithEmailAndPassword(emailText, passwordText);
		signInPromise.then(function() {
			window.location = 'home.html';
		}).catch(function(error) {
			outPutMessage('login', false, error.message);
		});
	});

	$('#updateEmail').click(function() {
		var newEmailText = $('#newEmail').val();
		var currentPasswordText = $('#currentPassword').val();
		var user = auth.currentUser;
		var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

		user.reauthenticate(cred).then(function() {
	  		user.updateEmail(newEmailText).then(function() {
				outPutMessage('updateEmail', true, 'Email Updated to ' + newEmailText + '.');
			}).catch(function(error) {
			 	outPutMessage('updateEmail', false, error.message);
			});
  		}).catch(function(error) {
		 	outPutMessage('updateEmail', false, error.message);
		});
	});

	$('#updatePassword').click(function() {
		var newPasswordText = $('#newPassword').val();
		var currentPasswordText = $('#currentPassword').val();
		var user = auth.currentUser;
		var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

		user.reauthenticate(cred).then(function() {
	  		user.updatePassword(newPasswordText).then(function() {
				outPutMessage('updatePassword', true, 'Password Successfully Updated.');
			}).catch(function(error) {
			 	outPutMessage('updatePassword', false, error.message);
			});
  		}).catch(function(error) {
		 	outPutMessage('updatePassword', false, error.message);
		});
	});

	$('#forgotPassword').click(function() {
		var emailText = $('#email').val();
		if(emailText == '') {
			outPutMessage('login', false, 'Please enter an email above.');
		} else {
			var forgotPasswordPromise = auth.sendPasswordResetEmail(emailText);
			forgotPasswordPromise.then(function() {
				outPutMessage('login', true, 'Password resent email sent to ' + emailText + '.');
			}).catch(function(error) {
				outPutMessage('login', false, error.message);
			});
		}
	});

	$('#deleteAccount').click(function() {
		var currentPasswordText = $('#currentPassword').val();
		var user = auth.currentUser;
		var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

		user.reauthenticate(cred).then(function() {
	  		user.delete().then(function() {
				window.location = 'index.html';
			}).catch(function(error) {
			 	outPutMessage('deleteAccount', false, error.message);
			});
  		}).catch(function(error) {
		 	outPutMessage('deleteAccount', false, error.message);
		});
	});

	$('#linkFacebook').click(function() {
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_posts');
		var result = linkAccounts(auth.currentUser, provider, 'Facebook');
	});

	$('#linkTwitter').click(function() {
		var provider = new  firebase.auth.TwitterAuthProvider();
		var result = linkAccounts(auth.currentUser, provider, 'Twitter');
	});

	$('#logOut').click(function() { signOutAndRedirect(); });

	$('#CheckMeLogo, #homeButton').click(function() { redirectUser(); });

	$('#scanButton').click(function() {
		if(getUserLogin()){

			intializeScan();
			
			if(checkFacebookLink()){
				var provider = new firebase.auth.FacebookAuthProvider();
				provider.addScope('user_posts');
				auth.signInWithPopup(provider).then(function(result) {
					var accessToken = result.credential.accessToken;
					getFacebookPosts(accessToken);
				});

			} else{
				$('#fb_tab').hide();
				$('#signup').hide();
				$('#fb_tab').removeClass('active');

				$('#login').show();
				$('#tw_tab').hide();
				getTwitterPosts();
			}

		} else {

			alert("link your account");
		}


	});
});