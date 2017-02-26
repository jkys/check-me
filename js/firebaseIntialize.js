$( document ).ready(function() {
	// Fire base config
	var config = {
		apiKey: "AIzaSyBXpn2g6SLj4CB_4hkvLs4N4P4D7yTZf_k",
	    authDomain: "checkme-8f276.firebaseapp.com",
	    databaseURL: "https://checkme-8f276.firebaseio.com",
	    storageBucket: "checkme-8f276.appspot.com",
	    messagingSenderId: "410954694898"
	};

	// Intialize firebase
	firebase.initializeApp(config);

	// Create constant on firebase authenticated
	const auth = firebase.auth();

	auth.onAuthStateChanged(function(user) {
        if (user) {
        	$('#loggedInBar').show();
        } else {
        	$('#loggedInBar').hide();
        }
    });

	// Check for user clicking the sign up button
	$('#signUp').click(function() {
		// Retreive values from sign up fields
		var registerEmailText = $('#registerEmail').val();
		var setPasswordText = $('#setPassword').val();

		const signUpPromise = auth.createUserWithEmailAndPassword(registerEmailText, setPasswordText);
		signUpPromise.then(function(user) {
			user.sendEmailVerification().then(function() {
				// On success redirect user to home page
			 	outPutMessage('register', 'error', 'success', 'Verification Email Sent.');
			 	window.location = "home.html";
			}, function(error) {
				outPutMessage('register', 'error', 'success', 'Account created, however verification email not sent.');
			});
		}).catch(function(error) {
			outPutMessage('register', 'success', 'error', error.message);
		});
	});

	// Check for user clikcing the log in button
	$('#signIn').click(function() {
		// Retrieve tvalues from login fields
		var emailText = $('#email').val();
		var passwordText = $('#password').val();
		
		const signInPromise = auth.signInWithEmailAndPassword(emailText, passwordText);
		signInPromise.then(function() {
			// On success redirect user to home page
			window.location = "home.html";
		}).catch(function(error) {
			// On failure, output message to home screen
			outPutMessage('login', 'success', 'error', error.message);
		});
	});

	$('#updateEmail').click(function() {
		var newEmailText = $('#newEmail').val();
		var currentPasswordText = $('#currentPassword').val();
		var user = auth.currentUser;
		var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

		user.reauthenticate(cred).then(function() {
	  		user.updateEmail(newEmailText).then(function() {
				outPutMessage('updateEmail', 'error', 'success', 'Email Updated to ' + newEmailText + '.');
			}).catch(function(error) {
			 	outPutMessage('updateEmail', 'success', 'error', error.message);
			});
  		}).catch(function(error) {
		 	outPutMessage('updateEmail', 'success', 'error', error.message);
		});
	});

	$('#updatePassword').click(function() {
		var newPasswordText = $('#newPassword').val();
		var currentPasswordText = $('#currentPassword').val();
		var user = auth.currentUser;
		var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPasswordText);

		user.reauthenticate(cred).then(function() {
	  		user.updatePassword(newPasswordText).then(function() {
				outPutMessage('updatePassword', 'error', 'success', 'Password Successfully Updated.');
			}).catch(function(error) {
			 	outPutMessage('updatePassword', 'success', 'error', error.message);
			});
  		}).catch(function(error) {
		 	outPutMessage('updatePassword', 'success', 'error', error.message);
		});
	});

	$('#forgotPassword').click(function() {
		var emailText = email.val();
		if(emailText == '') {
			outPutMessage('login', 'success', 'error', 'Please enter an email above.');
		} else {
			var forgotPasswordPromise = auth.sendPasswordResetEmail(emailText);
			forgotPasswordPromise.then(function() {
				outPutMessage('login', 'error', 'success', 'Password resent email sent to ' + emailText + '.');
			}).catch(function(error) {
				outPutMessage('login', 'success', 'error', error.message);
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
			 	outPutMessage('deleteAccount', 'successMessage', 'errorMessage', error.message);
			});
  		}).catch(function(error) {
		 	outPutMessage('deleteAccount', 'successMessage', 'errorMessage', error.message);
		});
	});

	// Check for user clicking the logout button
	$('#logOut').click(function() {
		auth.signOut();
		window.location = "index.html";
	});

	$('#authorizeFacebook').click(function() {
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_posts');
		firebase.auth().signInWithRedirect(provider).then(function(result) {
			if (result.credential) {
				var token = result.credential.accessToken;
				var user = result.user;

				FB.api('/' + user + '/feed', function (response) {
					if (response && !response.error) {
						console.log(response);
					}
				});
			}
		}).catch(function(error) {
			console.log(error.code);
			console.log(errorCode);
		});
	});

	$('#authorizeTwitter').click(function() {
		var provider = new  firebase.auth.TwitterAuthProvider();
		provider.addScope('user_posts');
		firebase.auth().signInWithRedirect(provider).then(function(result) {
			if (result.credential) {
				var token = result.credential.accessToken;
				var user = result.user;

				console.log(user);
				console.log(token);
				
				$.ajax({
					url: 'https://api.twitter.com/1.1/search/tweets.json?q=%23freebandnames',
					dataType: 'jsonp',
					success: function(response) {
						console.log(response)
					}
				});
			}
		}).catch(function(error) {
			console.log(error.code);
			console.log(errorCode);
		});
	});


	$('#CheckMeLogo').click(function() {
		if(auth.currentUser) {
			window.location = "home.html";
		} else {
			window.location = "index.html";
		}
	});

	$('#homeButton').click(function() {
		if(auth.currentUser) {
			window.location = "home.html";
		} else {
			window.location = "index.html";
		}
	});


	function outPutMessage(object, removeClass, addClass, errorMessage) {
		var message = 'Message'
		$('#' + object + message).removeClass(removeClass + message);
		$('#' + object + message).addClass(addClass + message);
		$('#' + object + message).html(errorMessage);
	}
});