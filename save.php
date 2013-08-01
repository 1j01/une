<?
$json = $_POST['json'];
if($json){
	json_decode($json);
	if(json_last_error() == JSON_ERROR_NONE){
		file_put_contents("state.json", $json);
		echo "saved";
	}else{
		echo "json decode error";
	}
}
?>