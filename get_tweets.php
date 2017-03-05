<?php

ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

$user_id = $_POST['userID'];
$oauth_access_token = $_POST['token'];
$oauth_access_token_secret = $_POST['secret'];

$settings = array(
    'oauth_access_token' => $user_id . '-' .$oauth_access_token,
    'oauth_access_token_secret' => $oauth_access_token_secret,
    'consumer_key' => "ifZDKvMyvpP4uzRUPMHACnUwj",
    'consumer_secret' => "K1I63Xpp96eruMsVzhk2S4dZ48tAddQe8Vc7exCTzRi2aJaKwM"
);

// $settings = array(
//     'oauth_access_token' => $user_id . '-' .$oauth_access_token,
//     //'oauth_access_token' => '602086335-wiQPEmB5JFLrGKYtB48wywuGGkDjOdoRXg7Nn8gO',
//     'oauth_access_token_secret' => $oauth_access_token_secret,
//     //'oauth_access_token_secret' => '26cOcASxxED31GmzrlELBfnJBKbEBQDwJTxYPb02aOjef',
//     'consumer_key' => "ifZDKvMyvpP4uzRUPMHACnUwj",
//     'consumer_secret' => "K1I63Xpp96eruMsVzhk2S4dZ48tAddQe8Vc7exCTzRi2aJaKwM"
// );

//old key : qZRhHGisBP0vNd5WMdaJCxWSY
// old secret: nRKkTheFXywOgJpmWTFBcqqVNOodEOvDxUl2GON0pUwM1IabrP

//old callback: https://checkme-8f276.firebaseapp.com/__/auth/handler


$url = 'https://api.twitter.com/1.1/users/lookup.json';
 
$requestMethod = "GET";
 
$getfield = '?user_id=' . $user_id;
 
$twitter = new TwitterAPIExchange($settings);
$response1 =    $twitter->setGetfield($getfield)
                    ->buildOauth($url, $requestMethod)
                    ->performRequest();

echo json_encode($response1);

$response1 = json_decode($response1, true);
var_dump($response1);

$screen_name = $response1['screen_name'];

echo ' | screen Name: ' . $screen_name;
//$screen_name = "CheckMeTest";


$url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
$getfield = '?screen_name=' . $screen_name . '&trim_user=true&count=199&exclude_replies=true';
$requestMethod = 'GET';
$twitter = new TwitterAPIExchange($settings);
$response = $twitter->setGetfield($getfield)
    ->buildOauth($url, $requestMethod)
    ->performRequest();

//var_dump(json_decode($response));

//header('Content-Type: text/html; charset=utf-8');


// echo json_encode($response);
//echo json_encode($response1);




//echo $repsonse; 

?>