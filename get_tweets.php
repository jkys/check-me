<?php
ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

$settings = array(
    'oauth_access_token' => $_POST['token'],
    'oauth_access_token_secret' => $_POST['secret'],
    'consumer_key' => "ifZDKvMyvpP4uzRUPMHACnUwj",
    'consumer_secret' => "K1I63Xpp96eruMsVzhk2S4dZ48tAddQe8Vc7exCTzRi2aJaKwM"
);
$twitter = new TwitterAPIExchange($settings);

$url = 'https://api.twitter.com/1.1/users/lookup.json';
$getfield = '?user_id=' . $_POST['userID'];
$user = 
    $twitter
    ->setGetfield($getfield)
    ->buildOauth($url, 'GET')
    ->performRequest();

$json_user = json_decode($user, true);
$screen_name = $json_user[0]['screen_name'];

$url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
$getfield = '?screen_name=' . $screen_name . '&trim_user=true&count=200&exclude_replies=true&page=4';
$page = 1;

while($tweet != '' | $page > 5) {
    $getfield = '?screen_name=' . $screen_name . '&trim_user=true&count=200&exclude_replies=true&page=' . $page;
    $tweet = 
        $twitter
        ->setGetfield($getfield)
        ->buildOauth($url, 'GET')
        ->performRequest();
    ++$page;
    $tweets += $tweet;
}

echo json_encode($tweets);
?>