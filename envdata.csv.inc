<?php
function envdata_csv($freq, $registration_no){
  $name = db_query("SELECT facility_name FROM {factory} WHERE registration_no = :rid", array('rid' => $registration_no))->fetchField();
  if(!empty($name)){
    $file = '/var/www/html/realtime/chimney_cache/'.$freq.'/'.$registration_no.'.csv';
    if(file_exists($file) && filesize($file) && REQUEST_TIME - filemtime($file) < 86400) {
      envdata_csv_export($file, $registration_no.'_'.$freq.'.csv');
    }
    else{
      if($freq == 'overalltime'){
        $cmd = '/usr/bin/php /var/www/html/realtime/4_statistics.inc '. $freq.' '.$registration_no;
      }
      else {
        $cmd = '/usr/bin/php /var/www/html/realtime/4_statistics.inc '. $freq;
      }
      shell_exec($cmd);
      if(file_exists($file) && filesize($file)) {
        envdata_csv_export($file, $registration_no.'_'.$freq.'.csv');
      }
      else{
        echo "目前查無超標資料，可能無標準值，或是過往紀錄完全無超標";
      }
    }
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
