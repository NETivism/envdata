<?php

function envdata_prepare_chart($vars) {
  global $base_url;

  if(!empty($vars['registration_no'])){
    if ($vars['path']) {
      $path = $vars['path'];
    }
    else {
      $path = 'realtime/air/chimney_cache/{interval}/' . $vars['registration_no'] . '.csv';
    }
    if(empty($vars['data_url'])){
      $vars['data_url'] = $base_url . base_path(). $path;
    }

    // verify file exists
    $settings = $attributes = array();
    $settings['chartist_load'] = FALSE;
    $settings['loading'] = base_path().drupal_get_path('module', 'envdata').'/loading.svg';
    $settings['all_interval'] = _envdata_chart_interval();
    $settings['all_interval_detail'] = _envdata_chart_interval_detail();
    $settings['facility_types_air_url'] = base_path().drupal_get_path('module', 'envdata').'/js/envdata-facility-air-types.json';
    $settings['facility_types_water_url'] = base_path().drupal_get_path('module', 'envdata').'/js/envdata-facility-water-types.json';
    drupal_add_js(array('envdata' => $settings), 'setting');

    // chart specific config into attributes
    $attributes['id'] = 'charts-'.$vars['type'];
    $attributes['type'] = $vars['type'];
    $attributes['class'] = 'charts-wrapper charts-'.$vars['type'];
    $attributes['display-help'] = TRUE;
    $attributes['display-share'] = TRUE;
    $attributes['filter'] = !empty($vars['filter']) ? $vars['filter'] : '';
    $attributes['helplink'] = url('node/18');
    $pass = FALSE;

    // using by svg
    if(!empty($vars['interval'])){
      $all_interval = _envdata_chart_interval();
      $attributes['interval'] = array($vars['interval'] => $all_interval[$vars['interval']]);
      $filename = DRUPAL_ROOT . '/'. str_replace('{interval}', $vars['interval'], $path);
      $attributes['display-help'] = 0;
      $attributes['display-share'] = 0;
      if(file_exists($filename)){
        $pass = TRUE;
        $attributes['url'] = str_replace('{interval}', $vars['interval'], $vars['data_url']);
      }
    }
    else{
      $interval = _envdata_chart_interval();
      foreach($interval as $k => $t){
        $filename = DRUPAL_ROOT . '/' . str_replace('{interval}', $k, $path);
        if(file_exists($filename)){
          $pass = TRUE;
          $attributes['url'] = $vars['data_url'];
        }
        else{
          unset($interval[$k]);
        }
      }

      $attributes['interval'] = implode(',', array_keys($interval));
      $attributes['interval-default'] = '30day';
    }
    $interval_detail = _envdata_chart_interval_detail();
    foreach ($interval_detail as $k => $t) {
      $filename = DRUPAL_ROOT . str_replace('{interval}', $k, $path);
      
      if (!file_exists($filename)) {
        unset($interval_detail[$k]);
      }
    }
    $attributes['interval-detail'] = implode(',', array_keys($interval_detail));

    if($pass) {
      $attr_str = envdata_chart_build_attr($attributes);
      envdata_add_resource();
      if ($settings['display_help']) {
        return '<div class="chart-intro">即時監測是在煙囪上裝設空氣污染物量測儀器，24小時不中斷地量測煙囪污染物排放狀況，如果監測數值出現超標，工廠無法有推托的藉口。按照法規，監測項目中，僅有二氧化硫、氮氧化物、一氧化碳、氯化氫的小時均值、及不透光率可作為裁罰依據，其餘的監測項目則是作為換算污染物濃度基準使用。</div><div '.$attr_str.'></div>';
      }
      return '<div class="chart-intro"></div><div '.$attr_str.'></div>';
    }
  }

  // error fallback
  return '';
}

function envdata_chart_build_attr($attributes) {
  $attr = array();
  foreach($attributes as $name => $value) {
    if ($name !== 'id' && $name !== 'class') {
      $name = 'data-'.$name;
    }
    $attr[$name] = $value;
  }
  return drupal_attributes($attr);
}

function envdata_chart_svg($chart_id) {
  $chart_args = _envdata_verify_chart_id($chart_id);
  if($chart_args){
    if(count($chart_args) == 5){
      $datetime = array_pop($chart_args);
    }
    $vars = array(
      'type' => $charts_args[0],
      'interval' => $chart_args[1],
      'registration_no' => $chart_args[2],
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
  if(!$chart_args || count($chart_args) < 6){
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
  if(count($ary) < 5 || count($ary) > 6){
    return FALSE;
  }
  $available_types = array('air', 'water');
  if (!in_array($ary[0], $available_types)) {
    return FALSE;
  }

  $available_interval = _envdata_chart_interval();
  if(!array_key_exists($ary[1], $available_interval)){
    return FALSE;
  }
  
  for ($i = 2; $i <= 4; $i++) {
    $matches = array();
    preg_match('/[0-9a-z]+/i', $ary[$i], $matches);
    if(strlen($matches[0]) != strlen($ary[$i])){
      return FALSE;
    }
  }

  return $ary;
}

function _envdata_chart_interval(){
  return array(
    '1day' => '24小時', 
    '30day' => '30天',
    '6month' => '半年',
  );
}

function _envdata_chart_interval_detail(){
  return array(
    'detail1day' => '24小時',
  );
}
