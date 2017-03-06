$( document ).ready(function() {

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '1229742877063233',
			xfbml      : true,
			version    : 'v2.8'
		});
		FB.AppEvents.logPageView();
	};

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


	auth.onAuthStateChanged(function(user) {
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

	

	function getTwitterPosts() {
		var provider = new firebase.auth.TwitterAuthProvider();
		auth.signInWithPopup(provider).then(function(result) {
			var accessToken = result.credential.accessToken;
			var secret = result.credential.secret;
			var user = getTwitterUser(accessToken);

			$(function() {
				$.ajax({
					type: 'POST',
					url: 'get_tweets.php',
					data: {
							userID: user,
							token: accessToken, 
							secret: secret
					},
					dataType : 'json',
					success: function(response) {
						if (typeof response.errors === 'undefined' || response.errors.length < 1) {
							$.each(JSON.parse(response), function(i, obj) {
								var date = obj.created_at;
								var tweet = obj.text;
								var url = 'https://twitter.com/ColbyDaly/status/' + obj.id;

								displayPost(tweet, date, url, 'twitter');
							});
						}
					}, error: function(errors) {
					}
				});
			});
		});
	}

	function test (response) {
		if (response && !response.error) {
			var arrayLength = (response.feed.data.length - 1);

			if(response.data == ''){
					console.log('Woah no response!');
			} else {
				var next = response.paging.next;
			}
			for (var i = 1; i < arrayLength; i++) {
				var iso = response.feed.data[i].created_time;
				var id = response.feed.data[i].id;
				
				var url = getFaceBookPostUrl(id);
				var post = response.feed.data[i].message;
				var date = convertIso(iso);
				displayPost(post, date, url, 'facebook');
			}

			if (response.feed.paging.next != undefined){
		       FB.api(response.feed.paging.next, doSomething);
		   }
		}
	}

	function getFacebookPosts(token) {
		var responseReceived = true;
		// var offset = 0;
		FB.api('/me', {
	        'fields'       : 'feed',
	        'limit'       : '100',
	        'access_token' : token
     	}, test);
		getTwitterPosts();
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
		var dateString = monthNames[month] + ' ' + day + ', ' + year + '.';
		return dateString;
	}

	function displayPost(message, date, url, platform) {
		if(message != '' && message != undefined) {
			var score = 0;
			var profaneJson = firebase.database().ref('Profanity');
			profaneJson.on('value', function(snapshot) {
				profaneWordSet = snapshot.val();
				profaneWordSet.forEach(function(profaceInnerJson) {
					var word = profaceInnerJson.Word;
					var scale = profaceInnerJson.scale;

					if(message.includes(word)) {
						score += scale;
					}
				});

				if(score > 0) {
					$('#' + platform + 'Results').append('<div class="post"><h3 class="time">' + date + '</h3><p class="text">' + message + '</p><p><a href="' + url + '">Link</a></p></div>');
				}
			});
		}
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

	function linkAccounts(user, provider) {
		user.linkWithPopup(provider).then(function(result) {
			outPutMessage('linkAccount', true, 'Account Linked!');
			return result;
		}).catch(function(error) {
			outPutMessage('linkAccount', false, error.message);
			return error;
		});
	}

	function unlinkAccounts(user, provider) {
		user.unlink(provider).then(function() {
			outPutMessage('linkAccount', true, 'Account Unlinked!');
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
		var result = linkAccounts(auth.currentUser, provider);
	});

	$('#facebookSignUp').click(function() {
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_posts');
		var result = signInToAccount(provider);
	});

	$('#twitterSignUp').click(function() {
		var provider = new firebase.auth.TwitterAuthProvider();
        var result = signInToAccount(provider);
	});

	$('#linkTwitter').click(function() {
		var provider = new  firebase.auth.TwitterAuthProvider();
		var result = linkAccounts(auth.currentUser, provider);
	});

	$('#logOut').click(function() { signOutAndRedirect(); });

	$('#CheckMeLogo, #homeButton').click(function() { redirectUser(); });

	$('#scanButton').click(function() {
		intializeScan();

		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_posts');
		auth.signInWithPopup(provider).then(function(result) {
			var accessToken = result.credential.accessToken;
			getFacebookPosts(accessToken);
		});
	});
});