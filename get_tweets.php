<?php

ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

$settings = array(
    'oauth_access_token' => "602086335-qYPvhzXpZic1yB9q6rASjDVlSyEYSckl3TctlXr8",
    'oauth_access_token_secret' => "ybTmZ7gcPQqDJBX1tbRVtxk95wNZcctKPdqnA8OD7tprq",
    'consumer_key' => "ifZDKvMyvpP4uzRUPMHACnUwj",
    'consumer_secret' => "K1I63Xpp96eruMsVzhk2S4dZ48tAddQe8Vc7exCTzRi2aJaKwM"
);

$url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
$getfield = '?screen_name=ColbyDaly';
$requestMethod = 'GET';
$twitter = new TwitterAPIExchange($settings);
$response = $twitter->setGetfield($getfield)
    ->buildOauth($url, $requestMethod)
    ->performRequest();

//var_dump(json_decode($response));

//header('Content-Type: text/html; charset=utf-8');


echo json_encode($response);




//echo $repsonse; 

?>