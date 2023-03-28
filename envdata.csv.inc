<?php
function envdata_csv($freq, $registration_no, $type){
  $found = FALSE;
  $name = db_query("SELECT facility_name FROM {factory} WHERE registration_no = :rid", array('rid' => $registration_no))->fetchField();
  if(!empty($name) && $type == 'air'){
    $file = '/var/www/html/realtime/air/chimney_cache/'.$freq.'/'.$registration_no.'.csv';
    if(file_exists($file) && filesize($file) && REQUEST_TIME - filemtime($file) < 86400) {
      $found = TRUE;
      envdata_csv_export($file, $registration_no.'_'.$freq.'.csv');
    }
    else{
      if($freq == 'overalltime'){
        $cmd = '/usr/bin/php /var/www/html/realtime/air/4_statistics.inc '. $freq.' '.$registration_no;
      }
      else {
        $cmd = '/usr/bin/php /var/www/html/realtime/air/4_statistics.inc '. $freq;
      }
      $output = shell_exec($cmd);
      watchdog('envdata', $cmd.":::".$output);
      if(file_exists($file) && filesize($file)) {
        $found = TRUE;
        envdata_csv_export($file, $registration_no.'_'.$freq.'.csv');
      }
    }
  }
  if(!empty($name) && $type == 'water'){
    $file = '/var/www/html/realtime/water/statistics/'.$freq.'/'.$registration_no.'.csv';
    if(file_exists($file) && filesize($file) && REQUEST_TIME - filemtime($file) < 86400) {
      $found = TRUE;
      envdata_csv_export($file, $registration_no.'_'.$freq.'.csv');
    }
    else{
      if($freq == 'overalltime'){
        $cmd = '/usr/bin/php /var/www/html/realtime/water/3_statistics.inc '. $freq.' '.$registration_no;
      }
      else {
        $cmd = '/usr/bin/php /var/www/html/realtime/water/3_statistics.inc '. $freq;
      }
      $output = shell_exec($cmd);
      watchdog('envdata', $cmd.":::".$output);
      if(file_exists($file) && filesize($file)) {
        $found = TRUE;
        envdata_csv_export($file, $registration_no.'_'.$freq.'.csv');
      }
    }

  }
  if (!$found) {
    echo '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>';
    echo "目前查無超標資料，可能原因為無此監測、或是無標準值，或過往紀錄完全無超標";
    echo '</body></html>';
  }
  drupal_exit();
}

function envdata_csv_export($file, $export_name){
  if(file_exists($file)) {
    header('Content-Type: application/csv');
    header('Content-Disposition: attachment; filename='.$export_name);
    header('Pragma: no-cache');
    echo "registration_no,facilities_no,type,value,n/a,datetime,threshold\n";
    readfile($file);
  }
}
