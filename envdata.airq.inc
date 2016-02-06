<?php
function envdata_airq_update_gov_file(){
  date_default_timezone_set('Asia/Taipei');
  $dir = "public://airq";
  file_prepare_directory($dir, FILE_CREATE_DIRECTORY);
  $hour = date('H');
  $cache = "$dir/airq_{$hour}.json";

  $latest = file_get_contents('http://opendata.epa.gov.tw/ws/Data/AQX/?$orderby=SiteName&$skip=0&$top=1000&format=json');
  file_save_data($latest, $cache, FILE_EXISTS_REPLACE);

  // update station
  if(date('G') == '3' || !file_exists('public://airq/station_list.json')){
    $station = file_get_contents('http://opendata.epa.gov.tw/ws/Data/AQXSite/?$orderby=SiteName&$skip=0&$top=1000&format=json');
    if($station){
      file_save_data($station, 'public://airq/station_list.json', FILE_EXISTS_REPLACE);
    }
  }
}

function envdata_airq_create_geojson(){
  $air = '';
  $files = file_scan_directory('public://airq', '/airq_.*/');
  foreach($files as $f){
    $air .= trim(file_get_contents($f->uri), '[]') . ',';
  }
  $air = '['.trim($air, ',').']';
  $air = json_decode($air);
  $airquality = array();
  foreach($air as $a){
    $timestamp = strtotime($a->PublishTime);
    $airquality[$a->County.$a->SiteName][$timestamp] = $a;
  }
  
  $station = json_decode(file_get_contents('public://airq/station_list.json'));
  $geojson = json_decode('{"type":"FeatureCollection","features":[]}');
  $pjson = '{"geometry":{"type":"Point","coordinates":[]},"type":"Feature","properties":{}}';

  foreach($station as $s){
    if(!empty($airquality[$s->County.$s->SiteName])){
      krsort($airquality[$s->County.$s->SiteName]);
      $p = json_decode($pjson);
      $p->geometry->coordinates = array((float)$s->TWD97Lon, (float)$s->TWD97Lat);
      $p->properties = reset($airquality[$s->County.$s->SiteName]);
      $geojson->features[] = $p;
      unset($p);
    }
  }
  file_save_data(json_encode($geojson), 'public://airq/realtime.json', FILE_EXISTS_REPLACE);
}
