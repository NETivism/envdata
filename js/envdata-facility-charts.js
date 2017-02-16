(function ($, Drupal, window, document) {

  // 'use strict';

  Drupal.behaviors.envdata = {
    attach: function (context, settings) {
    $("#charts:not(.is-processed)", context).once('envdata', function(){
      $("#charts").addClass('is-processed');

      var url          = Drupal.settings.envdata.dataURL;      
      var chartTypes   = Drupal.settings.envdata.types;
      var typeDefault  = '30day';
      var dataSum      = Drupal.settings.envdata.types.length;
      var dataLoadNum  = 0;
      var dataAllLoad  = false;
      var chartSum     = 0;
      var chartLoadNum = 0;
      var chartAllLoad = false;
      var loadingSvg   = Drupal.settings.envdata.loading;

      var facilityType = {
        "222": {
          "fine": true,
          "order": 1,
          "item": "222",
          "abbr": "SOX",
          "desp": "[均值]二氧化硫",
          "help": "29",
          "unit": "ppm"
        },
        "223": {
          "fine": true,
          "order": 2,
          "item": "223",
          "abbr": "NOX",
          "desp": "[均值]氮氧化物",
          "help": "28",
          "unit": "ppm"
        },
        "224": {
          "fine": true,
          "order": 3,
          "item": "224",
          "abbr": "CO",
          "desp": "[均值]一氧化碳",
          "help": "27",
          "unit": "ppm"
        },
        "225": {
          "fine": true,
          "order": 4,
          "item": "225",
          "abbr": "TRS",
          "desp": "[均值]總還原硫",
          "help": "",
          "unit": "ppm"
        },
        "226": {
          "fine": true,
          "order": 5,
          "item": "226",
          "abbr": "HCL",
          "desp": "[均值]氯化氫",
          "help": "33",
          "unit": "ppm"
        },
        "911": {
          "fine": true,
          "order": 6,
          "item": "911",
          "abbr": "OPC",
          "desp": "不透光率",
          "help": "80",
          "unit": "%"
        },
        "211": {
          "fine": false,
          "order": 7,
          "item": "211",
          "abbr": "OPC",
          "desp": "[均值]不透光率",
          "help": "80",
          "unit": "%"
        },
        "227": {
          "fine": false,
          "order": 8,
          "item": "227",
          "abbr": "VOC",
          "desp": "[均值]揮發性有機物",
          "help": "",
          "unit": "ppm"
        },
        "228": {
          "fine": false,
          "order": 9,
          "item": "228",
          "abbr": "NMHC",
          "desp": "[均值]NMHC",
          "help": "",
          "unit": "ppm"
        },
        "236": {
          "fine": false,
          "order": 10,
          "item": "236",
          "abbr": "O2",
          "desp": "[均值]氧氣",
          "help": "",
          "unit": "%"
        },
        "237": {
          "fine": false,
          "order": 11,
          "item": "237",
          "abbr": "CO2",
          "desp": "[均值]二氧化碳",
          "help": "26",
          "unit": "%"
        },
        "248": {
          "fine": false,
          "order": 12,
          "item": "248",
          "abbr": "FLOW",
          "desp": "[均值]排放流率",
          "help": "81",
          "unit": "Nm3/hr"
        },
        "259": {
          "fine": false,
          "order": 13,
          "item": "259",
          "abbr": "TEMP",
          "desp": "[均值]溫度",
          "help": "",
          "unit": "℃"
        },
        "280": {
          "fine": false,
          "order": 14,
          "item": "280",
          "abbr": "CMH",
          "desp": "[均值]排放流率",
          "help": "",
          "unit": "CMH"
        },
        "922": {
          "fine": false,
          "order": 15,
          "item": "922",
          "abbr": "SOX",
          "desp": "二氧化硫",
          "help": "29",
          "unit": "ppm"
        },
        "923": {
          "fine": false,
          "order": 16,
          "item": "923",
          "abbr": "NOX",
          "desp": "氮氧化物",
          "help": "28",
          "unit": "ppm"
        },
        "924": {
          "fine": false,
          "order": 17,
          "item": "924",
          "abbr": "CO",
          "desp": "一氧化碳",
          "help": "27",
          "unit": "ppm"
        },
        "925": {
          "fine": false,
          "order": 18,
          "item": "925",
          "abbr": "TRS",
          "desp": "總還原硫",
          "help": "",
          "unit": "ppm"
        },
        "926": {
          "fine": false,
          "order": 19,
          "item": "926",
          "abbr": "HCL",
          "desp": "氯化氫",
          "help": "33",
          "unit": "ppm"
        },
        "927": {
          "fine": false,
          "order": 20,
          "item": "927",
          "abbr": "VOC",
          "desp": "揮發性有機物",
          "help": "",
          "unit": "ppm"
        },
        "928": {
          "fine": false,
          "order": 21,
          "item": "928",
          "abbr": "NMHC",
          "desp": "NMHC",
          "help": "",
          "unit": "ppm"
        },
        "936": {
          "fine": false,
          "order": 22,
          "item": "936",
          "abbr": "O2",
          "desp": "氧氣",
          "help": "",
          "unit": "%"
        },
        "937": {
          "fine": false,
          "order": 23,
          "item": "937",
          "abbr": "CO2",
          "desp": "二氧化碳",
          "help": "26",
          "unit": "%"
        },
        "948": {
          "fine": false,
          "order": 24,
          "item": "948",
          "abbr": "FLOW",
          "desp": "排放流率",
          "unit": "Nm3/hr"
        },
        "959": {
          "fine": false,
          "order": 25,
          "item": "959",
          "abbr": "TEMP",
          "desp": "溫度",
          "help": "",
          "unit": "℃"
        },
        "980": {
          "fine": false,
          "order": 26,
          "item": "980",
          "abbr": "CMH",
          "desp": "排放流率",
          "help": "",
          "unit": "CMH"
        }
      };

      var typesName = {
        "1day" : "24小時",
        "30day" : "30天"
      }

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
              robj[hour] = [0, threshold];
            }
          }

          // for next loop
          timestamp = date.getTime();
          robj["t"+dtmp[4]] = o;
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
          right: 15,
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
        
        //console.log(svg);
        
        if (typeof window.XMLSerializer != "undefined") {
          var svgData = (new XMLSerializer()).serializeToString(svg);
        }

        if (typeof svg.xml != "undefined") {
          var svgData = svg.xml;
        }

        // console.log(svg);
        // console.log(svgData);

        var canvas = document.createElement("canvas");
        var svgSize = svg.getBoundingClientRect();
      
        canvas.width = svgSize.width;
        canvas.height = svgSize.height;

        var ctx = canvas.getContext("2d");

        // console.log(canvas);

        var img = document.createElement("img");
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) );

        ctx.drawImage(img, 0, 0);
        var pngData = canvas.toDataURL("image/png");
        
        return pngData;

        /*
        img.onload = function() {
          console.log('img onload !!');
          ctx.drawImage(img, 0, 0);
          var pngData = canvas.toDataURL("image/png");
          
          if (pngData) {
            return pngData;
          }
          
          // var newimg = document.createElement("img");
          // newimg.setAttribute("src", imgsrc);
          //document.body.appendChild(newimg);
        };
        */
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
        var $charts = $("#charts");
        var $chartItem = $("#charts > .chart-item[data-chart-type='"+typeDefault+"']");
        
        $chartItem.each(function() {
          var gid = $(this).attr("data-chart-gid");
          var chartGroupID = "cg-" + gid;
          var $thisTabs = $("<div id='" + chartGroupID + "' class='chart-group tabs-container chart-tabs'></div>");
          var $tabsControl = $("<ul class='tabs-control'></ul>");
          $thisTabs.prepend($tabsControl);
          $(this).after($thisTabs);

          var activeTab;
          for ( var i in chartTypes) {
            ctype = chartTypes[i];
            var $chartItem = $(".chart-item[data-chart-gid='" + gid + "'][data-chart-type='"+ctype+"']");
            if ($chartItem.length) {
              if (ctype == typeDefault) {
                activeTab = parseInt(i)+1; 
              }
              var chartItemID = $chartItem.attr("id");  
              $tabsControl.append("<li class='tab' data-chart-type='" + ctype + "'><a href='#" + chartItemID + "'>" + typesName[ctype] + "</a></li>");
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
            });
            var ctype = $thisTabs.find('li.active').attr('data-chart-type');
            ga('send', 'event', 'chart', 'tab-'+ctype, $thisTabs.attr('id'));
            /*
            if (document.createEvent) { // W3C
              window.dispatchEvent(new Event('resize'));
            }
            else { // IE
              element = document.documentElement;
              var ev = document.createEventObject();
              element.fireEvent("onresize", ev);
            }
            */
          });
        });
      }

      var renderChart = function(results, chartType){
        // two level object
        var values = {};
        var i, indexo, row, index, datehour, max, avg, threshold;
        var filter = Drupal.settings.envdata.filter;

        // loop 
        // grouping by registration_no,facility_no,type
        for(i = 0; i < results.data.length; i++){
          row = results.data[i];
          if(row.length < 5) continue;
          // 1day_registrationNo_facilityNo_type
          index = chartType+'_'+row[0] + "_" + row[1] + "_" + row[2];

          // apply filter parameter from drupal setting
          var include = 1;
          if(filter){
            var regex = new RegExp(filter); 
            if(!regex.test(index)){
              include = 0;
            }
          }

          if(include) {
            index = 'T'+index;
            max = row[3];
            avg = row[4];
            threshold = row[6] || 0;
            // new factory
            if(typeof values[index] === "undefined"){
              values[index] = [];
            }
            values[index][row[5]] = [max, threshold];

            /*
            if (i==0) {
              if (chartType=='1day') {
                console.log('1day: '+row[5]);
              } else {
                console.log('30day: '+row[5]);
              }
            }
            */

            indexo = index;
          }
        }

        // create chart
        var data, prepared = [];
        var $root = $("#charts");
        var count = 0;

        for(index in values) {
          var name = index.split("_");
          
          // Reordering object in the beginning to ensure order of time is correct
          values[index] = sortObj(values[index]);
          
          var dateStart = Object.keys(values[index])[0];
          
          if(chartType == '1day') {
            values[index] = missingHours(values[index]);
          }

          var dataVals = [];
          var thresholdVals = [];

          data = {
            "labels": [],
            "series": [
              { name: "threshold-line", data: thresholdVals },
              { data: dataVals }
            ]
          }

          var keys = Object.keys(values[index]);
          var exceed = false;
          var topValue;
          var lastMonitorId;

          // console.log(values[index]);
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];

            switch (chartType) {
              case "1day":
                var hour = k.replace("t", "");
                data.labels.push(hour);
                break;

              case "30day":
                var day = k.substr(6, 2);
                data.labels.push(day);
                break;
            } 

            var v = values[index][k];

            // push data to data line
            dataVals.push(v[0]);

            // push data to threshold line
            v[1] = v[1] == 0 ? "" : v[1];
            thresholdVals.push({"meta":v[1],"value":v[1]});

            // If threshold value more than max data 
            v[0] = parseInt(v[0]);
            v[1] = parseInt(v[1]);
            topValue = topValue === undefined ? topValue = v[0] : topValue < v[0] ? topValue = v[0] : topValue = topValue;
            
            if (i == keys.length - 1) {
              // console.log("topValue: " + topValue);

              if (v[1]) {
                if (v[1] >= topValue) {
                  // console.log("threshold: " + v[1]);
                  v[1] += 10;
                  // console.log("high: " + v[1]);
                  chartOption.high = v[1];
                } 
                else {
                  exceed = true;
                }
              }

              topValue = undefined;
            }
          }

          // data["series"].push(line);
          // console.log(data);
          var chartID = "chart-" + index;
          var chartGID = name[1] + "_" + name[2] + "_" + name[3];
          var fine = facilityType[name[3]]["fine"];
          var knowledgeUrl = "";
          if (facilityType[name[3]]["help"]) {
            knowledgeUrl = '<a href="/knowledge/'+facilityType[name[3]]["help"]+'" target="_blank" title="說明" class="help-link colorbox-node"><span class="fa fa-question-circle"></span></a>';
          }
          var chartName = name[2] + " - " + facilityType[name[3]]["desp"] + knowledgeUrl;
          var chartItem = "<div id='ci-" + index + "' class='chart-item' data-chart-gid='" + chartGID + "' data-chart-type='" + chartType + "'>";
          var chartBtnClass = exceed && fine ? "chart-report-btn" : "chart-share-btn";
          var chartBtnText = exceed && fine ? "檢舉與分享" : "分享";
          var chartBtn = exceed ? "<a class='chart-btn " + chartBtnClass + "' href='#' data-chart-id='" + chartID + "'><span class='fa fa-share'></span>" + chartBtnText + "</a>" : "";
          var facilityName = "";
          if (lastMonitorId !== name[2] && chartType == typeDefault) {
            facilityName = name[2];
          }
          lastMonitorId = name[2];
          var title = (chartType === typeDefault) ? "<h5>" + chartName + "</h5>" : "<strong>" + chartName + "</strong>";
          chartItem += title; 
          
          if(chartBtn){
            chartItem += "<div class='chart-btns'><a class='help-link colorbox-node' href='"+Drupal.settings.envdata.helplink+"' title='怎樣是排放超標？怎樣才達到違法要開罰的標準？' target='_blank'><span class='fa fa-question-circle'></span>超標說明</a>" + chartBtn + "</div>";
          }
          chartItem += "<div id='" + chartID + "' class='" + index + " chart ct-chart' data-chart-name='" + chartName  + "' data-chart-type='" + chartType + "'></div>";
          chartItem += "</div>";

          // Create a new line chart object where as first parameter we pass in a selector
          // that is resolving to our chart container element. The Second parameter
          // is the actual data object.
          var axisYTitle = facilityType[name[3]]["unit"];

          var axisXTitle;

          switch (chartType) {
            case "1day":
              var ds = dateStart.split("-");
              axisXTitle = "從 " + formatDate(dateFromYmd(ds[0]), "/") + " " + ds[1] + ":00 起的 24 小時";
              break;

            case "30day":
              axisXTitle = "從 " + formatDate(dateFromYmd(dateStart), "/") + " 起的 30 天";
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
            "chartType": chartType,
            "facility": facilityName,
            "axis": {"x":axisXTitle, "y":axisYTitle},
            "option": chartOption
          };
        }
        // render chart in correct order
        var fine, added;
        for (facility in prepared) {
          fine = false;
          added = 0;
          for (order in prepared[facility]) {
            var pre = prepared[facility][order];
            fine = pre.type.fine;
            if (pre.facility) {
              $root.append("<h3>"+pre.facility+"煙道</h3>");
            }
            if (fine && !added && chartType == typeDefault) {
              $root.append('<div class="section-report section-report-des"><h4>裁罰依據</h4><p>按照法規，排放超標可開罰的標準是氣狀污染物（如二氧化硫、氮氧化物、一氧化碳、氯化氫）的小時均值，以及粒狀污染物6分鐘一筆的即時監測值</p></div>');
              added = 1;
            }
            if (!fine && added < 2 && chartType == typeDefault) {
              $root.append('<div class="section-normal section-normal-des"><h4>其他監測項目</h4><p>其他監測項目則是氣狀污染物15分鐘一筆的即時監測值，以及換算其他污染物濃度基準的監測項目</p></div>');
              added = 2;
            }
            $root.append(pre.item);
            axisTitleOption.axisX.axisTitle = pre.axis.x;
            axisTitleOption.axisY.axisTitle = pre.axis.y;
            pre.option.plugins = [
              // Chartist.plugins.ctThreshold({threshold: 40}),
              Chartist.plugins.tooltip(),
              Chartist.plugins.ctAxisTitle(axisTitleOption)
            ];

            new Chartist.Line("." + pre.index, pre.data, pre.option);
            var additionalClass = fine ? "chart-report" : "chart-normal";
            $("."+pre.index).addClass(additionalClass);
            chartSum++;
            count++;
          }
        }
        if (!count) {
          $('#block-envdata-facility-realtime-charts .content #charts').html('<p>目前沒有任何資料可供繪製圖表。</p>');
        }
      }

      var dataLoadComplete = setInterval(function() {
        if (dataLoadNum == dataSum) {
          // console.log("data Load Complete !! dataSum: " + dataSum);
          dataAllLoad = true;
          clearInterval(dataLoadComplete);
        }
      }, 100);

      var chartLoadComplete = setInterval(function() {
        chartLoadNum = $(".ct-chart > svg").length;

        if (dataAllLoad && chartLoadNum == chartSum) {
          // console.log("chart Load Complete !! chartSum: " + chartSum);
          chartAllLoad = true;
          clearInterval(chartLoadComplete);
        }

        if (chartAllLoad) {
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
            var chartType    = $chart.attr("data-chart-type");
            var chartName    = $chart.attr("data-chart-name") + "（" + typesName[chartType] + "）";
            var chartDate    = [year, month, day].join("/");
            var fileNameVal  = chartID.replace(/^chart-T/, '')+'_'+ymd;
            var facilityName = $(".views-field-facility-name .field-content").text();
            var registrationNo = fileNameVal.split('_')[1];
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
                // console.log("成功將圖表圖片儲存於server後（ajax success），印出圖片網址： " + chartImgURL);
                $parent.find('img.loading').remove();

                var shareText = "<h5>加入監督行動，讓污染無所遁形！</h5>";
                shareText += "<p>面對企業污染源的超標排放，我們不只要檢舉究責，還要讓更多人知道。請大家持續關注與分享，讓污染的幽暗角落攤在陽光下！</p>";

                // Prepare share modal HTML.
                var shareModal = "<div class='modal' id='chart-share-modal'>";
                shareModal += "<h3 class='facility-name'>" + facilityName + " - " + chartDate + "</h3>";
                shareModal += "<h4 class='chart-name'>" + chartName + "</h4>";
                shareModal += "<div class='chart-img'><img src='" + chartImgURL + "' /></div>";
                shareModal += "<div class='share-text'>" + shareText + "</div>";
                // shareModal += "<div class='share-btns-top'><a href='#' class='fb-share-btn'>分享到Facebook</a></div>";
                shareModal += "<div class='share-btns-bottom'>";
                shareModal += "<a href='#' class='btn fb-share-btn'>分享到Facebook <i class='fa fa-share'></i></a>";
                if (report) {
                  shareModal += "<a href='/report/submit?report_picture="+encodeURI(chartImgURL)+"&registration_no=" + registrationNo + "' class='btn report-btn' target='_blank'>立即檢舉 <i class='fa fa-ban'></i></a>";
                }
                shareModal += "</div>";
                $("body").append(shareModal);
                
                // Open share modal automatically
                $shareModal = $("#chart-share-modal");
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
      for(var key in chartTypes) {
        var dataURL = url.replace('{type}', chartTypes[key]);
        (function(url, type){
          Papa.parse(url, {
            download: true,
            complete: function(results){
              renderChart(results, type);
              dataLoadNum++;
            } 
          });
        })(dataURL, chartTypes[key]);
      }
    }); // for run only once
    },

    detach: function (context, settings, trigger) {
      // Undo something.
    }
  };

})(jQuery, Drupal, this, this.document);
