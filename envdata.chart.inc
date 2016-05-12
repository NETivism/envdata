<?php

function envdata_prepare_chart($vars) {
  global $base_url;

  if(!empty($vars['registration_no'])){
    $path = '/realtime/chimney_cache/{type}/' . $vars['registration_no'] . '.csv';
    if(empty($vars['data_url'])){
      $vars['data_url'] = $base_url . $path;
    }

    // verify file exists
    $settings = array();
    $settings['chartist_load'] = FALSE;
    $settings['filter'] = !empty($vars['filter']) ? $vars['filter'] : '';
    $settings['helplink'] = url('node/18');
    $pass = FALSE;
    if(!empty($vars['type'])){
      $settings['types'] = array($vars['type']);
      $filename = DRUPAL_ROOT . str_replace('{type}', $vars['type'], $path);
      if(file_exists($filename)){
        $pass = TRUE;
        $settings['dataURL'] = str_replace('{type}', $vars['type'], $vars['data_url']);
      }
    }
    else{
      $types = _envdata_chart_types();
      foreach($types as $k => $t){
        $filename = DRUPAL_ROOT . str_replace('{type}', $t, $path);
        if(file_exists($filename)){
          $pass = TRUE;
          $settings['dataURL'] = $vars['data_url'];
        }
        else{
          unset($types[$k]);
        }
      }
      $settings['types'] = $types;
    }

    if($pass) {
      envdata_add_resource();
      drupal_add_js(array('envdata' => $settings), 'setting');
      return '<div id="charts"></div>';
    }
  }

  // error fallback
  return '';
}

function envdata_chart_svg($chart_id) {
  $chart_args = _envdata_verify_chart_id($chart_id);
  if($chart_args){
    if(count($chart_args) == 5){
      $datetime = array_pop($chart_args);
    }
    $vars = array(
      'type' => $chart_args[0],
      'registration_no' => $chart_args[1],
      'filter' => implode('_', $chart_args),
    );
    $output = envdata_prepare_chart($vars);
    if($output) {
      $name = db_query("SELECT facility_name FROM {factory} WHERE registration_no = :rid", array('rid' => $chart_args[1]))->fetchField();
      drupal_set_title($name .' - ' . date('Y/m/d')); 
    }
    return $output;
  }
  else{
    drupal_not_found();
  }
}

function envdata_chart_image($chart_id) {
  global $base_url;
  $chart_args = _envdata_verify_chart_id($chart_id);
  if(!$chart_args || count($chart_args) < 5){
    drupal_not_found();
    return;
  }

  $datetime = array_pop($chart_args);
  $dir = 'public://chart/'.implode('/', $chart_args);
  $filename = $datetime.'.png';
  $file_uri = $dir.'/'.$filename;
  if(file_exists($file_uri) && empty($_GET['nocache'])) {
    $img_url = file_create_url($file_uri);
    drupal_json_output($img_url);
    drupal_exit();
  }
  file_prepare_directory($dir, FILE_CREATE_DIRECTORY);
  
  $img_data = '';
  // using base64 image data
  if(isset($_POST['imgData'])){
    $img_data = $_POST['imgData'];

    // Remove the headers (data:,) part.
    // A real application should use them according to needs such as to check image type
    $img_filtered_data  = substr($img_data, strpos($img_data, ',')+1);

    // Need to decode before saving since the data we received is already base64 encoded
    $img_data = base64_decode($img_filtered_data);
  }
  // using wkhtmltoimage
  else{
    $imgurl = $base_url . base_path(). str_replace('chart/image', 'chart/svg', $_GET['q']);
    $tmp = file_directory_temp().'/'.$chart_id.'.png';
    $command = 'xvfb-run wkhtmltoimage-0.13 '.$imgurl.' '.$tmp;
    $outcome = array();
    exec($command, $outcome, $status);
    if(file_exists($tmp)){  // linux exit 0 is fine
      $img_data = file_get_contents($tmp);
      drupal_unlink($tmp);
    }
  }

  if(!empty($img_data)){
    file_unmanaged_save_data($img_data, $file_uri, FILE_EXISTS_REPLACE);
    $img_url = file_create_url($file_uri);
    drupal_json_output($img_url);
  }
  else{
    echo '';
  }
  drupal_exit();
}


function _envdata_verify_chart_id($chart_id){
  $ary = explode('_', $chart_id);
  if(count($ary) < 4 || count($ary) > 5){
    return FALSE;
  }

  $available_types = _envdata_chart_types();
  if(!in_array($ary[0], $available_types)){
    return FALSE;
  }
  
  for ($i = 1; $i <= 3; $i++) {
    $matches = array();
    preg_match('/[0-9a-z]+/i', $ary[$i], $matches);
    if(strlen($matches[0]) != strlen($ary[$i])){
      return FALSE;
    }
  }

  return $ary;
}

function _envdata_chart_types(){
  return array('1day', '30day');
}
