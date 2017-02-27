$( document ).ready(function() {
	$('#loggedInBar').hide();
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
			 	outPutMessage('register', true, 'Verification Email Sent.');
			 	window.location = "home.html";
			}, function(error) {
				outPutMessage('register', true, 'Account created, however verification email not sent.');
			});
		}).catch(function(error) {
			outPutMessage('register', false, error.message);
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

	// Check for user clicking the logout button
	$('#logOut').click(function() {
		auth.signOut();
		window.location = "index.html";
	});

	$('#authorizeFacebook').click(function() {
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_posts');
		var result = linkAccounts(auth.currentUser, provider);
	});

	$('#facebookSignUp').click(function() {
		var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('user_posts');
        firebase.auth().signInWithPopup(provider).then(function(result) {
        	window.location = "home.html";
        }).catch(function(error) {
			outPutMessage('register', false, error.message);
			return error;
		});
	});

	$('#twitterSignUp').click(function() {
		var provider = new firebase.auth.TwitterAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
        	window.location = "home.html";
        }).catch(function(error) {
			outPutMessage('register', false, error.message);
			return error;
		});
	});

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

	$('#authorizeTwitter').click(function() {
		var provider = new  firebase.auth.TwitterAuthProvider();
		var result = linkAccounts(auth.currentUser, provider);
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


	function outPutMessage(object, success, errorMessage) {
		var message = 'Message'
		var object = $('#' + object + message);
		if(success) {
			object.removeClass('error');
			object.addClass('success');
		} else {
			object.removeClass('success');
			object.addClass('error');
		}
		object.html(errorMessage);
	}
});