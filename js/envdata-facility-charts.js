(function ($, Drupal, window, document) {
  'use strict';

  Drupal.behaviors.envdata = {
    attach: function (context, settings) {
    $(".charts-wrapper:not(.is-processed)", context).once('envdata', function(){
      $(this).addClass('is-processed');

      var loadingSvg       = Drupal.settings.envdata.loading;
      var chartAllLoad     = 0;
      var chartTotal       = 2;
      var chartInterval = {},
          chartIntervalDetail = {},
          chartIntervalDefault = '';

      var dataDetailDay = {};

      var sortObj = function (obj, order) {
        // Based on https://gist.github.com/CFJSGeek/5550678
        var key, i, 
            tempArray = [],
            tempObj = {},
            order = typeof order !== "undefined" ? order : "asc";

        for (key in obj) {
          tempArray.push(key);
        }

        tempArray.sort(
          function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          }
        );

        switch (order) {
          case "desc":
            for (i = tempArray.length - 1; i >= 0; i--) {
              tempObj[tempArray[i]] = obj[tempArray[i]];
            }
            break;

          default:
            for (i = 0; i < tempArray.length; i++) {
              tempObj[tempArray[i]] = obj[tempArray[i]];
            }
            break;
        }

        return tempObj;
      }

      var dateFromYmd = function(str) {
        var y = str.substr(0, 4),
            m = str.substr(4, 2) - 1,
            d = str.substr(6, 2);
        var D = new Date(y, m, d);

        return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : "invalid date";
      }

      var formatDate = function(date, separator) {
        var D = new Date(date),
            m = "" + (D.getMonth() + 1),
            d = "" + D.getDate(),
            y = D.getFullYear();

        if (m.length < 2) m = "0" + m;
        if (d.length < 2) d = "0" + d;

        return [y, m, d].join(separator);
      }

      // reference: http://stackoverflow.com/questions/16590500/javascript-calculate-date-from-week-number
      var getDateOfISOWeek = function(w, y) {
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;

        if (dow <= 4) {
          ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        }
        else {
          ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }

        return ISOweekStart;
      }

      var missingHours = function(obj) {
        var robj = {}, timestamp;
        for(var key in obj){
          var o = obj[key];
          var datestr = key.replace('-', '');
          var dtmp = datestr.match(/.{1,2}/g) || [];
          var date = new Date(dtmp[0]+dtmp[1], dtmp[2], dtmp[3], dtmp[4]);

          var timediff = date.getTime() - timestamp;
          if(timediff > 3600000){
            for(var i = 1; i < timediff/3600000; i++){
              var dd = new Date(timestamp + 3600000*i);
              var hour = dd.getHours();
              if(hour.length < 2) {
                hour = '0' + datestr;
              }
              var threshold = o[1] || 0;
              robj["t"+hour] = [0, threshold];
            }
          }

          // for next loop
          timestamp = date.getTime();
          robj["t"+dtmp[4]] = o;
        }
        return robj;
      }

      var missingWeeks = function(obj) {
        var robj      = {};
        var max       = 53;
        var min       = 0;
        var half      = 27;
        var size      = Object.keys(obj).length;
        var begin     = Object.keys(obj)[0];
        var end       = Object.keys(obj)[size - 1];
        var firstYear = parseInt(begin.split("-")[0]);
        var lastYear  = parseInt(end.split("-")[0]);
        var firstWeek = parseInt(begin.split("-")[1]);
        var lastWeek  = parseInt(end.split("-")[1]);
        var sameYear  = firstYear == lastYear ? true : false;
        
        var firstHalf, secondHalf, total;
        
        if (sameYear) {
          total = lastWeek - firstWeek + 1;
        }
        else {
          firstHalf = max - firstWeek + 1;
          secondHalf = lastWeek + 1;
          total = firstHalf + secondHalf;
        }

        var threshold = parseInt(obj[begin][1]) || 0;
        var currentWeek = firstWeek;
        var currentYear = firstYear;
        var key = begin;
        
        for(var i = 0; i < total; i++) {
          if (i > 0) {
            currentWeek++;

            if (currentWeek > max) {
              currentWeek = 0;
              currentYear++;
            }
          
            key = currentWeek < 10 ? currentYear + "-0" + currentWeek : currentYear + "-" + currentWeek;
          }

          var label = i + 1;
          robj[key] = [];
          
          if (obj[key]) {
            robj[key] = obj[key];
            robj[key].push(label);
          }
          else {
            robj[key] = [0, threshold, label];
          }
        }
        
        return robj;
      }

      var axisTitleOption = {
        axisX: {
          axisTitle: "",
          axisClass: "ct-axis-title",
          offset: {
            x: 0,
            y: 40
          },
          textAnchor: "middle",
        },

        axisY: {
          axisTitle: "",
          axisClass: "ct-axis-title",
          offset: {
            x: 0,
            y: -5
          },
          textAnchor: "end",
          flipTitle: false
        }
      };

      var chartOption = {
        axisY: {
          type: Chartist.AutoScaleAxis,
          onlyInteger: true
        },
        chartPadding: {
          top: 15,
          right: 50,
          bottom: 30,
          left: 10
        },
        lineSmooth: false,
        series: {
          "data-line": {
            showArea: true
          },
          "threshold-line": {
            showPoint: false
          }
        },
      };

      var svgToPng = function(container) {
        var container = document.getElementById(container);
        var svg = container.querySelector("svg");
        
        
        if (typeof window.XMLSerializer != "undefined") {
          var svgData = (new XMLSerializer()).serializeToString(svg);
        }

        if (typeof svg.xml != "undefined") {
          var svgData = svg.xml;
        }


        var canvas = document.createElement("canvas");
        var svgSize = svg.getBoundingClientRect();
      
        canvas.width = svgSize.width;
        canvas.height = svgSize.height;

        var ctx = canvas.getContext("2d");

        var img = document.createElement("img");
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) );

        ctx.drawImage(img, 0, 0);
        var pngData = canvas.toDataURL("image/png");
        
        return pngData;
      }

      var fbDialog = function(settings) { 
        FB.ui(settings,
          function(response) {
            if (response && response.post_id) {
              // console.log("分享成功！");
            } 
            else {
              // console.log("分享失敗...");
            }
          }
        );
      }

      var groupChart = function() {
      $(".charts-wrapper").each(function(){
        var $charts = $(this);
        var intervalDefault = $charts.data('interval-default');
        var $chartItem = $charts.find(".chart-item[data-chart-interval='"+intervalDefault+"']");
        
        $chartItem.each(function() {
          var gid = $(this).attr("data-chart-gid");
          var chartGroupID = "cg-" + gid;
          var $thisTabs = $("<div id='" + chartGroupID + "' class='chart-group tabs-container chart-tabs'></div>");
          var $tabsControl = $("<ul class='tabs-control'></ul>");
          $thisTabs.prepend($tabsControl);
          $(this).after($thisTabs);

          var activeTab;
          for (var cInterval in chartInterval) {
            var i = Object.keys(chartInterval).indexOf(cInterval);
            var $chartItem = $(".chart-item[data-chart-gid='" + gid + "'][data-chart-interval='"+cInterval+"']");

            if ($chartItem.length) {
              if (cInterval == intervalDefault) {
                activeTab = parseInt(i)+1; 
              }
              var chartItemID = $chartItem.attr("id");  
              $tabsControl.append("<li class='tab' data-chart-interval='" + cInterval + "'><a href='#" + chartItemID + "'>" + chartInterval[cInterval] + "</a></li>");
              $chartItem.addClass("tabs-panel")
              if($chartItem.find('.chart-report').length){
                $thisTabs.addClass('section-report');
              }
              $chartItem.appendTo($thisTabs);
            }
          }

          // Initialize tabslet plugin
          $thisTabs.tabslet({
            active: activeTab
          });

          $thisTabs.on("_after", function(){
            // trigger resize event to prevent chart loosing width
            $(this).find('.ct-chart:visible').each(function(e, tab){
              tab.__chartist__.update();
              $('g.ct-series-threshold path.ct-threshold-below').remove();
              $('g.ct-series-threshold path').removeAttr('mask');
            });
            var cInterval= $thisTabs.find('li.active').attr('data-chart-interval');
            ga('send', 'event', 'chart', 'tab-'+cInterval, $thisTabs.attr('id'));
          });
        });

      });
      }

      var getDetailDay = function(results, interval, $chartWrapper) {
        var values = {};
        var i, indexo, row, index, value, time;
        var type = $chartWrapper.data('type');

        // loop
        // grouping by registration_no,facility_no,type
        for(i = 0; i < results.data.length; i++){
          row = results.data[i];
          if(row.length < 5) continue;
          // 1day_registrationNo_facilityNo_type
          index = type+'_'+interval+'_'+row[0] + "_" + row[1] + "_" + row[2];

          // apply filter parameter from drupal setting
          var include = 1;
          if($chartWrapper.data('filter')){
            var filter = $chartWrapper.data('filter');

            var regex = new RegExp(filter);
            if(!regex.test(index)){
              include = 0;
            }
          }

          if(include) {
            index = index;
            value = row[3];
            time = row[7].split("-");

            // new factory
            if(typeof values[index] === "undefined"){
              values[index] = [];
            }

            // new hour
            if (typeof values[index][row[5]] == "undefined") {
              values[index][row[5]] = [];
            }
            values[index][row[5]][time[1]] = value;

            indexo = index;
          }
        }

        for (index in values) {
          values[index] = sortObj(values[index]);
          values[index] = missingHours(values[index]);
        }

        return values;
      }

      var renderDetailData = function(data, interval, threshold) {
        var output = "";
        var interval = typeof interval !== "undefined" ? interval : "1day";

        if (data) {
          if (!("0" in data)) {
            threshold = parseFloat(threshold);
            output = "<ul class='data-detail-list'>";

            for (var index in data) {
              var time = index;
              var value = parseFloat(data[index]);

              if (value > threshold) {
                output += "<li class='is-exceed'>";
              }
              else {
                output += "<li>";
              }

              output += "<span class='data-time'>" + time + "</span><span class='data-value'>" + value + "</span></li>";
            }

            output += "</ul>";
          }
          else {
            output = "0";
          }
        }

        return output;
      }

      var renderChart = function(results, interval, $chartWrapper, facilityType){
        // two level object
        var values = {};
        var i, indexo, row, index, datehour, max, avg, threshold;
        var type = $chartWrapper.data('type');

        // loop 
        // grouping by registration_no,facility_no,type
        for(i = 0; i < results.data.length; i++){
          row = results.data[i];
          if(row.length < 5) continue;
          // 1day_registrationNo_facilityNo_type
          index = type+'_'+interval+'_'+row[0] + "_" + row[1] + "_" + row[2];

          // apply filter parameter from drupal setting
          var include = 1;
          if($chartWrapper.data('filter')){
            var filter = $chartWrapper.data('filter');
            var regex = new RegExp(filter); 
            if(!regex.test(index)){
              include = 0;
            }
          }

          if(include) {
            max = row[3];
            avg = row[4];
            threshold = row[6] || 0;
            // new factory
            if(typeof values[index] === "undefined"){
              values[index] = [];
            }
            values[index][row[5]] = [max, threshold];

            indexo = index;
          }
        }

        // create chart
        var data, prepared = [];
        var count = 0;

        for(index in values) {
          var name = index.split("_");
          var type = name.shift();
          
          // Reordering object in the beginning to ensure order of time is correct
          values[index] = sortObj(values[index]);
          
          var dateStart = Object.keys(values[index])[0];
          
          if(interval == '1day') {
            values[index] = missingHours(values[index]);
          }

          if (interval == '6month') {
            values[index] = missingWeeks(values[index]);
          }

          var dataVals = [];
          var thresholdVals = [];

          data = {
            "labels": [],
            "series": [
              { className: 'ct-series ct-series-a ct-series-threshold', name: "threshold-line", data: thresholdVals },
              { data: dataVals }
            ]
          }

          var keys = Object.keys(values[index]);
          var exceed = false;
          var topValue = null;
          var lastMonitorId = null;
          var lastStandardVal = 0;

          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];

            switch (interval) {
              case "1day":
                var hour = k.replace("t", "");
                data.labels.push(hour);
                break;

              case "30day":
                var day = k.substr(6, 2);
                data.labels.push(day);
                break;

              case "6month":
                var week = i + 1;
                data.labels.push(week);
                break;
            } 

            var v = values[index][k];

            // push data to threshold line
            v[1] = v[1] == 0 ? "" : v[1];
            if (!v[1]) {
              v[1] = lastStandardVal;
            }
            if (v[1]) {
              thresholdVals.push(v[1]);
              lastStandardVal = v[1];
            }

            // push data to data line
            if (interval == "1day") {
              if (chartIntervalDetail["detail1day"]) {
                var detailData = renderDetailData(dataDetailDay[index][k], interval, v[1]);
                dataVals.push({meta: detailData, value: v[0]});
              }
              else {
                dataVals.push(v[0]);
              }
            }
            else {
              dataVals.push(v[0]);
            }

            // If threshold value more than max data 
            v[0] = parseInt(v[0]);
            v[1] = parseInt(v[1]);
            topValue = topValue === undefined ? topValue = v[0] : topValue < v[0] ? topValue = v[0] : topValue = topValue;
            
            if (i == keys.length - 1) {
              if (v[1]) {
                if (v[1] >= topValue) {
                  v[1] += 10;
                  chartOption.high = v[1];
                } 
                else {
                  exceed = true;
                }
              }

            }
          }

          var chartID = index;
          var chartGID = name[1] + "_" + name[2] + "_" + name[3];
          var fine = facilityType[name[3]]["fine"];
          var knowledgeUrl = "";
          if (facilityType[name[3]]["help"]) {
            knowledgeUrl = '<a href="/knowledge/'+facilityType[name[3]]["help"]+'" target="_blank" title="說明" class="help-link colorbox-node"><span class="fa fa-question-circle"></span></a>';
          }
          var chartName = name[2] + " - " + facilityType[name[3]]["desp"] + knowledgeUrl;
          var chartItem = "<div id='wrapper-" + index + "' class='chart-item' data-chart-gid='" + chartGID + "' data-chart-interval='" + interval + "'>";
          var chartBtnClass = exceed && fine ? "chart-report-btn" : "chart-share-btn";
          var chartBtnText = exceed && fine ? "檢舉與分享" : "分享";
          var chartBtn = exceed && $chartWrapper.data('display-share') ? "<a class='chart-btn " + chartBtnClass + "' href='#' data-chart-id='" + chartID + "'><span class='fa fa-share'></span>" + chartBtnText + "</a>" : "";
          var facilityName = "";
          if (lastMonitorId !== name[2] && interval == $chartWrapper.data('interval-default')) {
            facilityName = name[2];
          }
          lastMonitorId = name[2];
          var title = (interval === $chartWrapper.data('interval-default')) ? "<h5>" + chartName + "</h5>" : "<strong>" + chartName + "</strong>";
          chartItem += title; 
          
          if(chartBtn){
            chartItem += "<div class='chart-btns'><a class='help-link colorbox-node' href='"+Drupal.settings.envdata.helplink+"' title='怎樣是排放超標？怎樣才達到違法要開罰的標準？' target='_blank'><span class='fa fa-question-circle'></span>超標說明</a>" + chartBtn + "</div>";
          }
          chartItem += "<div id='" + chartID + "' class='" + chartID + " chart ct-chart' data-chart-name='" + chartName  + "' data-chart-interval='" + interval + "'></div>";
          chartItem += "</div>";

          // Create a new line chart object where as first parameter we pass in a selector
          // that is resolving to our chart container element. The Second parameter
          // is the actual data object.
          var axisYTitle = facilityType[name[3]]["unit"];

          var axisXTitle;

          switch (interval) {
            case "1day":
              var ds = dateStart.split("-");
              axisXTitle = "從 " + formatDate(dateFromYmd(ds[0]), "/") + " " + ds[1] + ":00 起的 24 小時";
              break;

            case "30day":
              axisXTitle = "從 " + formatDate(dateFromYmd(dateStart), "/") + " 起的 30 天";
              break;

            case "6month":
              var ds = dateStart.split("-");
              axisXTitle = "從 " + formatDate(getDateOfISOWeek(ds[1], ds[0]), "/") + " 起的半年（單位：週）";
              break;
          } 

          var order = facilityType[name[3]]["order"];
          if (typeof prepared[name[2]] == 'undefined') {
            prepared[name[2]] = [];
          }
          if (typeof prepared[name[2]][order] == 'undefined') {
            prepared[name[2]][order] = {};
          }
          prepared[name[2]][order] = {
            "index": index,
            "data": data,
            "item": chartItem,
            "type": facilityType[name[3]],
            "interval": interval,
            "facility": facilityName,
            "axis": {"x":axisXTitle, "y":axisYTitle},
            "standard": lastStandardVal ? lastStandardVal : topValue + 10,
            "option": chartOption
          };
        }

        // render chart in correct order
        var fine, added;
        for (var facility in prepared) {
          fine = false;
          added = 0;
          for (order in prepared[facility]) {
            var pre = prepared[facility][order];
            fine = pre.type.fine;
            if (pre.facility && !added) {
              if ($chartWrapper.data("type") == 'air') {
                $chartWrapper.append("<h3>"+pre.facility+"煙道</h3>");
              }
              if ($chartWrapper.data("type") == 'water') {
                $chartWrapper.append("<h3>"+pre.facility+"監測點</h3>");
              }
            }
            if (fine && !added && interval == $chartWrapper.data('interval-default')) {
              $chartWrapper.append('<div class="section-report section-report-des"><h4>裁罰依據</h4><p>按照法規，排放超標可開罰的標準是氣狀污染物（如二氧化硫、氮氧化物、一氧化碳、氯化氫）的小時均值，以及粒狀污染物6分鐘一筆的即時監測值</p></div>');
              added = 1;
            }
            if (!fine && added < 2 && interval == $chartWrapper.data('interval-default')) {
              $chartWrapper.append('<div class="section-normal section-normal-des"><h4>其他監測項目</h4><p>其他監測項目則是氣狀污染物15分鐘一筆的即時監測值，以及換算其他污染物濃度基準的監測項目</p></div>');
              added = 2;
            }
            $chartWrapper.append(pre.item);
            axisTitleOption.axisX.axisTitle = pre.axis.x;
            axisTitleOption.axisY.axisTitle = pre.axis.y;
            pre.option.plugins = [
              Chartist.plugins.tooltip({
                tooltipFnc: function (meta, value, event) {
                  var output = '';

                  if (meta) {
                    meta = $("<textarea/>").html(meta).text(); // decode meta
                    output += "<div class='chartist-tooltip-meta'>" + meta + "</div>";
                  }

                  output += "<div class='chartist-tooltip-value'>" + value + "</div>";
                  
                  return output;
                }
              }),
              Chartist.plugins.ctAxisTitle(axisTitleOption),
              Chartist.plugins.ctThreshold({
                threshold: pre.standard,
                maskNames: {
                  aboveThreshold: 'ct-threshold-' +pre.index + '-above',
                  belowThreshold: 'ct-threshold-' +pre.index + '-below',
                }
              })
            ];

            var chart = new Chartist.Line("." + pre.index, pre.data, pre.option);
            chart.on('draw', function(data) {
              if (data.type == 'line' && data.series.name == 'threshold-line') {
                if (typeof data.values["0"] != 'undefined') {
                  var axisX = data.axisX.axisLength + data.axisX.gridOffset + 15;
                  var axisY = data.axisY.axisLength == data.path.pathElements["0"].y ? data.path.pathElements["0"].y - 10 : data.path.pathElements["0"].y;
                  var val = data.values["0"].y;
                  
                  var caption = new Chartist.Svg('g');
                  caption.addClass('ct-threshold-caption');

                  var captionLabel = new Chartist.Svg('text', {
                        x: axisX,
                        y: axisY
                      }, 'ct-threshold-caption-label', caption);
                  captionLabel.text('標準值');
                  
                  var captionValue = new Chartist.Svg('text', {
                        x: axisX,
                        y: axisY + 15
                      }, 'ct-threshold-caption-value', caption);
                  captionValue.text(val);
                  
                  data.group.append(caption);
                }
              }
            });
            var additionalClass = fine ? "chart-report" : "chart-normal";
            $("."+pre.index).addClass(additionalClass);
            count++;
          }
        }
        if (!count) {
          $chartWrapper.html('<p>目前沒有任何資料可供繪製圖表。</p>');
        }
      }

      var chartLoadComplete = setInterval(function() {
        if (chartAllLoad >= chartTotal) {
          clearInterval(chartLoadComplete);

          // remove standard
          $('g.ct-series-threshold path.ct-threshold-below').remove();
          $('g.ct-series-threshold path').removeAttr('mask');

          // Set chartist_load is true after gerenate all charts.
          $('.colorbox-node', context).once('init-colorbox-node-processed', function () {
            $(this).colorboxNode({'launch': false});
          });

          // Group chart
          groupChart();
          Drupal.settings.envdata.chartist_load = true;

          // Show a share preview modal when user click chart share button.
          $(".chart-btns").on("click", ".chart-btn", function(e) {
            var report = $(this).hasClass('chart-report-btn');
            var $parent = $(this).parent(".chart-btns");
            $parent.find('img.loading').remove();
            $(this).after('<img class="loading" src="'+loadingSvg+'">');
            e.preventDefault();
            var d = new Date(),
              month = '' + (d.getMonth() + 1),
              day = '' + d.getDate(),
              year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            var ymd = [year, month, day].join('');

            var $chart       = $parent.next(".ct-chart");
            var chartID      = $chart.attr("id");
            var interval = $chart.data("chart-interval");
            var chartName    = $chart.data("chart-name") + "（" + chartInterval[interval] + "）";
            var chartDate    = [year, month, day].join("/");
            var fileNameVal  = chartID+'_'+ymd;
            var facilityName = $(".views-field-facility-name .field-content").text();
            var registrationNo = fileNameVal.split('_')[2];
            // var pngDataVal   = svgToPng(chartID);
            if (report) {
              ga('send', 'event', 'chart', 'share', 'report-'+chartID);
            }
            else {
              ga('send', 'event', 'chart', 'share', 'share-'+chartID);
            }
            
            var postData = {
            //  imgData: pngDataVal
              imgURL: '/envdata/chart/svg/' + fileNameVal
            };

            var getURL = '/envdata/chart/image/' + fileNameVal;
            $.ajax({
              type: "POST",
              url: getURL,
              data: postData,
              success: function(chartImgURL) {
                $parent.find('img.loading').remove();

                var shareText = "<h5>加入監督行動，讓污染無所遁形！</h5>";
                shareText += "<p>面對企業污染源的超標排放，我們不只要檢舉究責，還要讓更多人知道。請大家持續關注與分享，讓污染的幽暗角落攤在陽光下！</p>";

                // Prepare share modal HTML.
                var shareModal = "<div class='modal' id='chart-share-modal'>";
                shareModal += "<h3 class='facility-name'>" + facilityName + " - " + chartDate + "</h3>";
                shareModal += "<h4 class='chart-name'>" + chartName + "</h4>";
                shareModal += "<div class='chart-img'><img src='" + chartImgURL + "' /></div>";
                shareModal += "<div class='share-text'>" + shareText + "</div>";
                shareModal += "<div class='share-btns-bottom'>";
                shareModal += "<a href='#' class='btn fb-share-btn'>分享到Facebook <i class='fa fa-share'></i></a>";
                if (report) {
                  shareModal += "<a href='/report/submit?report_picture="+encodeURI(chartImgURL)+"&registration_no=" + registrationNo + "' class='btn report-btn' target='_blank'>立即檢舉 <i class='fa fa-ban'></i></a>";
                }
                shareModal += "</div>";
                $("body").append(shareModal);
                
                // Open share modal automatically
               
                var $shareModal = $("#chart-share-modal");
                $shareModal.modal();

                // Remove share modal after modal closed
                $('#chart-share-modal').on($.modal.AFTER_CLOSE, function(event, modal) {
                  $shareModal.remove();
                });

                $("#chart-share-modal").on("click", ".report-btn", function(){
                  ga('send', 'event', 'chart', 'share-report', facilityName+'-'+chartName.replace(/<(?:.|\n)*?>/gm, ''));
                });

                // Popup a facebook share dialog when user click facebook share button in share modal. 
                $("#chart-share-modal").on("click", ".fb-share-btn", function(e) {
                  e.preventDefault();
                  
                  // console.log("在送出分享設定參數之前，印出分享圖片網址： " + chartImgURL);

                  var dMethod  = "feed";
                  var dName    = "[即時排放監測] " + facilityName + " - " + chartDate;
                  var dLink    = window.location.href;
                  var dPic     = chartImgURL;
                  var dDesc    = chartName.replace(/<(?:.|\n)*?>/gm, '');
                  var dCaption = "透明足跡 thaubing.gcaa.org.tw";
                  ga('send', 'event', 'chart', 'share-fb', facilityName+'-'+dDesc);

                  var dSettings = {
                    method: dMethod,
                    name: dName,
                    link: dLink,
                    picture: dPic,
                    description: dDesc,
                    caption: dCaption
                  };

                  // Send facebook share dialog settings to fbDialog function
                  fbDialog(dSettings);
                });
              }
            });
          });
        }
      }, 500);

      // main function
      $(".charts-wrapper").each(function(){
        var enableIntervals = $(this).data('interval').split(','); // 1day, 30day, 6month
        chartTotal = enableIntervals.length;
        var $chartWrapper = $(this);
        enableIntervals.forEach(function(cInterval){
          if (Drupal.settings.envdata.all_interval[cInterval]) {
            chartInterval[cInterval]  = Drupal.settings.envdata.all_interval[cInterval];

            (function(interval, $chart){
              var url  = $chart.data('url').replace('{interval}', interval);
              Papa.parse(url, {
                download: true,
                complete: function(results){
                  var facilityUrl = 'facility_types_' + $chart.data('type') + '_url';
                  var facilityType;
                  if (Drupal.settings.envdata[facilityUrl]) {
                    facilityType = $.getJSON(Drupal.settings.envdata[facilityUrl], function(data){
                      facilityType = data;
                      if (interval == '1day') {
                        if (chartIntervalDetail['detail1day']) {
                          var detailDataURL = url.replace('1day', 'detail1day');

                          Papa.parse(detailDataURL, {
                            download: true,
                            complete: function(results){
                              dataDetailDay = getDetailDay(results, interval, $chart, facilityType);
                              renderChart(results, interval);
                              dataLoadNum++;
                            }
                          });
                        }
                        else {    
                          renderChart(results, interval, $chart, facilityType);
                        }
                      }
                      else {
                        renderChart(results, interval, $chart, facilityType);
                      }
                      chartAllLoad++;
                    });
                  }
                }
              });
            })(cInterval, $chartWrapper);
          }
        });
      });
    }); // for run only once
    },

    detach: function (context, settings, trigger) {
      // Undo something.
    }
  };

})(jQuery, Drupal, this, this.document);
