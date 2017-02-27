$( document ).ready(function() {

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '1229742877063233',
			xfbml      : true,
			version    : 'v2.8'
		});
		FB.AppEvents.logPageView();
	};

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

  
	$('#loggedInBar').hide();
	
	var config = {
		apiKey: "AIzaSyBXpn2g6SLj4CB_4hkvLs4N4P4D7yTZf_k",
	    authDomain: "checkme-8f276.firebaseapp.com",
	    databaseURL: "https://checkme-8f276.firebaseio.com",
	    storageBucket: "checkme-8f276.appspot.com",
	    messagingSenderId: "410954694898"
	};

	firebase.initializeApp(config); // Intialize firebase
	const auth = firebase.auth(); // Create constant on firebase authenticated

	auth.onAuthStateChanged(function(user) {
        if (user) {
        	$('#loggedInBar').show();
        	var currentPage = window.location.pathname;
        	if (~currentPage.indexOf("index.html")) {
        		window.location = "home.html";
        	}
        } else {
        	$('#loggedInBar').hide();
        }
    });

	$('#signUp').click(function() {
		var registerEmailText = $('#registerEmail').val();
		var setPasswordText = $('#setPassword').val();

		const signUpPromise = auth.createUserWithEmailAndPassword(registerEmailText, setPasswordText);
		signUpPromise.then(function(user) {
			user.sendEmailVerification().then(function() {
			 	outPutMessage('register', true, 'Verification Email Sent.');
			 	window.location = "home.html";
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
			window.location = "home.html";
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
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_posts');
		auth.signInWithPopup(provider).then(function(result) {
		  var accessToken = result.credential.accessToken;
		  var posts = getFacebookPosts(accessToken);
		  console.log(posts);
		});
	});

	function getFacebookPosts(user) {
		FB.api("/" + user + "/feed", function (response) {
			if (response && !response.error) {
				console.log(response);
				alert(response);
			} else {
				console.log(response.error);
			}
		});
	}

	function signOutAndRedirect() {
		auth.signOut();
		window.location = "index.html";
	}

	function redirectUser() {
		if(auth.currentUser) {
			window.location = "home.html";
		} else {
			window.location = "index.html";
		}
	}

	function signInToAccount(provider) {
        auth.signInWithPopup(provider).then(function(result) {
        	window.location = "home.html";
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
});