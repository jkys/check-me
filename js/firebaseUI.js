$( document ).ready(function() {
	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: 'home.html',
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.FacebookAuthProvider.PROVIDER_ID,
			firebase.auth.TwitterAuthProvider.PROVIDER_ID
		],
		// Terms of service url.
		tosUrl: 'terms.html'
	};

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());

	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);
});