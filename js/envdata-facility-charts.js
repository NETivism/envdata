(function ($, Drupal, window, document) {

  // 'use strict';

  Drupal.behaviors.envdata = {
    attach: function (context, settings) {
      
      var url          = Drupal.settings.envdata.dataURL;      
      var types        = Drupal.settings.envdata.types;
      var typeDefault  = '30day';
      var dataSum      = types.length;
      var dataLoadNum  = 0;
      var dataAllLoad  = false;
      var chartSum     = 0;
      var chartLoadNum = 0;
      var chartAllLoad = false;
      var loadingSvg      = Drupal.settings.envdata.loading;

      var item = {
        "211": {
          "item": "211",
          "abbr": "OPC",
          "desp": "[均值]不透光率",
          "help": "粒狀污染物",
          "unit": "%"
        },
        "222": {
          "item": "222",
          "abbr": "SOX",
          "desp": "[均值]二氧化硫",
          "help": "29",
          "unit": "ppm"
        },
        "223": {
          "item": "223",
          "abbr": "NOX",
          "desp": "[均值]氮氧化物",
          "help": "28",
          "unit": "ppm"
        },
        "224": {
          "item": "224",
          "abbr": "CO",
          "desp": "[均值]一氧化碳",
          "help": "27",
          "unit": "ppm"
        },
        "225": {
          "item": "225",
          "abbr": "TRS",
          "desp": "[均值]總還原硫",
          "help": "",
          "unit": "ppm"
        },
        "226": {
          "item": "226",
          "abbr": "HCL",
          "desp": "[均值]氯化氫",
          "help": "33",
          "unit": "ppm"
        },
        "227": {
          "item": "227",
          "abbr": "VOC",
          "desp": "[均值]揮發性有機物",
          "help": "",
          "unit": "ppm"
        },
        "228": {
          "item": "228",
          "abbr": "NMHC",
          "desp": "[均值]NMHC",
          "help": "",
          "unit": "ppm"
        },
        "236": {
          "item": "236",
          "abbr": "O2",
          "desp": "[均值]氧氣",
          "help": "",
          "unit": "%"
        },
        "237": {
          "item": "237",
          "abbr": "CO2",
          "desp": "[均值]二氧化碳",
          "help": "26",
          "unit": "%"
        },
        "248": {
          "item": "248",
          "abbr": "FLOW",
          "desp": "[均值]排放流率",
          "help": "",
          "unit": "Nm3/hr"
        },
        "259": {
          "item": "259",
          "abbr": "TEMP",
          "desp": "[均值]溫度",
          "help": "",
          "unit": "℃"
        },
        "280": {
          "item": "280",
          "abbr": "CMH",
          "desp": "[均值]排放流率",
          "help": "",
          "unit": "CMH"
        },
        "911": {
          "item": "911",
          "abbr": "OPC",
          "desp": "不透光率",
          "help": "粒狀污染物",
          "unit": "%"
        },
        "922": {
          "item": "922",
          "abbr": "SOX",
          "desp": "二氧化硫",
          "help": "29",
          "unit": "ppm"
        },
        "923": {
          "item": "923",
          "abbr": "NOX",
          "desp": "氮氧化物",
          "help": "28",
          "unit": "ppm"
        },
        "924": {
          "item": "924",
          "abbr": "CO",
          "desp": "一氧化碳",
          "help": "27",
          "unit": "ppm"
        },
        "925": {
          "item": "925",
          "abbr": "TRS",
          "desp": "總還原硫",
          "help": "",
          "unit": "ppm"
        },
        "926": {
          "item": "926",
          "abbr": "HCL",
          "desp": "氯化氫",
          "help": "33",
          "unit": "ppm"
        },
        "927": {
          "item": "927",
          "abbr": "VOC",
          "desp": "揮發性有機物",
          "help": "",
          "unit": "ppm"
        },
        "928": {
          "item": "928",
          "abbr": "NMHC",
          "desp": "NMHC",
          "help": "",
          "unit": "ppm"
        },
        "936": {
          "item": "936",
          "abbr": "O2",
          "desp": "氧氣",
          "help": "",
          "unit": "%"
        },
        "937": {
          "item": "937",
          "abbr": "CO2",
          "desp": "二氧化碳",
          "help": "26",
          "unit": "%"
        },
        "948": {
          "item": "948",
          "abbr": "FLOW",
          "desp": "排放流率",
          "unit": "Nm3/hr"
        },
        "959": {
          "item": "959",
          "abbr": "TEMP",
          "desp": "溫度",
          "help": "",
          "unit": "℃"
        },
        "980": {
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
        /*
        plugins: [
          Chartist.plugins.ctThreshold({
            threshold: 40
          }),
          Chartist.plugins.ctAxisTitle(axisTitleOption)
        ]
        */
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
        var $chartItem = $("#charts > .chart-item");
        var group = [];
        
        $chartItem.each(function() {
            var gid = $(this).attr("data-chart-gid");
            if ($.inArray(gid, group) == -1) {
              group.push(gid);
            }
        });
        
        for (index in group) {
          var gid = group[index];
          var chartGroupID = "cg-" + gid;
          var tabsContainer = "<div id='" + chartGroupID + "' class='chart-group tabs-container chart-tabs'></div>";
          $charts.append(tabsContainer);
  
          var $thisTabs = $("#" + chartGroupID);

          var tabsControl = "<ul class='tabs-control'>";
          var activeTab = 1;

          $(".chart-item[data-chart-gid='" + gid + "']").each(function(i) {
            var chartItemID = $(this).attr("id");  
            var chartType = $(this).attr("data-chart-type");
            
            tabsControl += "<li class='tab' data-chart-type='" + chartType + "'><a href='#" + chartItemID + "'>" + typesName[chartType] + "</a></li>";
            $(this).addClass("tabs-panel").appendTo($("#cg-" + gid));

            activeTab = chartType == typeDefault ? i + 1 : activeTab;
          });

          tabsControl += "</ul>";

          $thisTabs.prepend(tabsControl);
          
          // Initialize tabslet plugin
          $thisTabs.tabslet({
            active: activeTab
          });
        } 
      }

      var renderChart = function(results, type){
        var values = {};
        var i, indexo, row, index, datehour, max, avg, threshold;
        var filter = Drupal.settings.envdata.filter;

        // grouping by registration_no,facility_no,type
        for(i = 0; i < results.data.length; i++){
          row = results.data[i];
          if(row.length < 5) continue;
          index = type+'_'+row[0] + "_" + row[1] + "_" + row[2];



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
              if (type=='1day') {
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
        var data, line, $div, $h3;
        var $root = $("#charts");
        var count = 0;

        for(index in values) {
          var name = index.split("_");
          if (!Drupal.settings.envdata.loggedin) {
            if (name[3][0] === '9') {
              continue;
            }
          }
          
          // Reordering object in the beginning to ensure order of time is correct
          values[index] = sortObj(values[index]);
          
          var dateStart = Object.keys(values[index])[0];
          
          if(type == '1day') {
            values[index] = missingHours(values[index]);
          }

          var dataVals = [];
          var thresholdVals = [];

          data = {
            "labels": [],
            "series": [
              { name: "threshold-line", data: thresholdVals },
              { name: "data-line", data: dataVals }
            ]
          }

          var keys = Object.keys(values[index]);
          var exceed = false;
          var topValue;
          var lastMonitorId;

          // console.log(values[index]);
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];

            switch (type) {
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
            thresholdVals.push(v[1]);

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
          var knowledgeUrl = "";
          if (item[name[3]]["help"]) {
            knowledgeUrl = '<a href="/knowledge/'+item[name[3]]["help"]+'" target="_blank" title="說明" class="help-link"><span class="fa fa-question-circle"></span></a>';
          }
          var chartName = name[2] + " - " + item[name[3]]["desp"] + knowledgeUrl;
          var chartItem = "<div id='ci-" + index + "' class='chart-item' data-chart-gid='" + chartGID + "' data-chart-type='" + type + "'>";
          var chartBtnClass = exceed ? "chart-report-btn" : "chart-share-btn";
          var chartBtnText = exceed ? "檢舉與分享" : "分享";
          var chartBtn = exceed ? "<a class='chart-btn " + chartBtnClass + "' href='#' data-chart-id='" + chartID + "'><span class='fa fa-share'></span>" + chartBtnText + "</a>" : "";
          if (lastMonitorId !== name[2] && type == typeDefault) {
            chartItem += '<h3>'+ name[2] +'</h3>';
          }
          lastMonitorId = name[2];
          var title = (type === typeDefault) ? "<h4>" + chartName + "</h4>" : "<strong>" + chartName + "</strong>";
          chartItem += title; 
          
          if(chartBtn){
            chartItem += "<div class='chart-btns'><a class='help-link' href='"+Drupal.settings.envdata.helplink+"' title='怎樣是排放超標？怎樣才達到違法要開罰的標準？' target='_blank'><span class='fa fa-question-circle'></span>超標說明</a>" + chartBtn + "</div>";
          }
          chartItem += "<div id='" + chartID + "' class='" + index + " chart ct-chart' data-chart-name='" + chartName  + "' data-chart-type='" + type + "'></div>";
          chartItem += "</div>";
          $root.append(chartItem);

          // Create a new line chart object where as first parameter we pass in a selector
          // that is resolving to our chart container element. The Second parameter
          // is the actual data object.
          axisTitleOption.axisY.axisTitle = item[name[3]]["unit"];

          var axTitle;

          switch (type) {
            case "1day":
              var ds = dateStart.split("-");
              axTitle = "從 " + formatDate(dateFromYmd(ds[0]), "/") + " " + ds[1] + ":00 起的 24 小時";
              break;

            case "30day":
              axTitle = "從 " + formatDate(dateFromYmd(dateStart), "/") + " 起的 30 天";
              break;
          } 

          if (typeof axTitle != "undefined") axisTitleOption.axisX.axisTitle = axTitle;
          
          chartOption.plugins = [
            //Chartist.plugins.ctThreshold({threshold: 40}),
            Chartist.plugins.ctAxisTitle(axisTitleOption)
          ];
          new Chartist.Line("." + index, data, chartOption);
          count++;
          chartSum++;
        }

        if (!count) {
          $('#block-envdata-facility-realtime-charts .content #charts').html('<p>目前沒有任何資料可供繪製圖表。</p>');
        }
      }

      for(var key in types) {
        var dataURL = url.replace('{type}', types[key]);
        (function(url, type){
          Papa.parse(url, {
            download: true,
            complete: function(results){
              renderChart(results, type);
              dataLoadNum++;
            } 
          });
        })(dataURL, types[key]);
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
          Drupal.settings.envdata.chartist_load = true;

          // Group chart
          groupChart();

          // Show a share preview modal when user click chart share button.
          $(".chart-btns").on("click", ".chart-btn", function(e) {
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
                shareText += "<p>看到工廠排放廢氣、廢水，除了憤怒，不知道能有什麼行動，也不覺得能改變什麼嗎？綠色公民行動聯盟邀你一起加入「透明足跡」的監督行動！</p>";
                shareText += "<p>綠盟彙整了企業污染排放資料，在「透明足跡」網站看到即時監測數據出現「超標」警訊，只需按下「分享」，就可把企業污染訊息傳出去，讓污染環境的企業現身！按下「立即檢舉」，會將超標資料通報給綠盟，也可進一步填寫陳情單向環保署檢舉。</p>";
                shareText += "<p>過去我們把監督的權力與責任都交給政府，現在我們要將一部分的權力拿回來，唯有全民一起參與監督，才能打破環境治理的困境，「透明足跡」監督政府也監督企業，讓政府落實管制，讓企業負起社會責任。請你一起加入監督行動，讓污染無所遁形！</p>";

                // Prepare share modal HTML.
                var shareModal = "<div class='modal' id='chart-share-modal'>";
                shareModal += "<h3 class='facility-name'>" + facilityName + " - " + chartDate + "</h3>";
                shareModal += "<h4 class='chart-name'>" + chartName + "</h4>";
                shareModal += "<div class='chart-img'><img src='" + chartImgURL + "' /></div>";
                shareModal += "<div class='share-text'>" + shareText + "</div>";
                // shareModal += "<div class='share-btns-top'><a href='#' class='fb-share-btn'>分享到Facebook</a></div>";
                shareModal += "<div class='share-btns-bottom'>";
                shareModal += "<a href='#' class='btn fb-share-btn'>分享到Facebook <i class='fa fa-share'></i></a>";
                shareModal += "<a href='/report/submit?report_picture="+encodeURI(chartImgURL)+"&registration_no=" + registrationNo + "' class='btn report-btn' target='_blank'>立即檢舉 <i class='fa fa-ban'></i></a>";
                shareModal += "</div>";
                $("body").append(shareModal);
                
                // Open share modal automatically
                $shareModal = $("#chart-share-modal");
                $shareModal.modal();

                // Remove share modal after modal closed
                $('#chart-share-modal').on($.modal.AFTER_CLOSE, function(event, modal) {
                  $shareModal.remove();
                });

                // Popup a facebook share dialog when user click facebook share button in share modal. 
                $("#chart-share-modal").on("click", ".fb-share-btn", function(e) {
                  e.preventDefault();
                  
                  console.log("在送出分享設定參數之前，印出分享圖片網址： " + chartImgURL);

                  var dMethod  = "feed";
                  var dName    = "[即時排放監測] " + facilityName + " - " + chartDate;
                  var dLink    = window.location.href;
                  var dPic     = chartImgURL;
                  var dDesc    = chartName;
                  var dCaption = "透明足跡 thaubing.gcaa.org.tw";

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
      }, 100);
    },

    detach: function (context, settings, trigger) {
      // Undo something.
    }
  };

})(jQuery, Drupal, this, this.document);
