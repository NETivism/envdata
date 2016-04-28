(function ($, Drupal, window, document) {

  // 'use strict';

  Drupal.behaviors.envdata = {
    attach: function (context, settings) {

      var dataURL = Drupal.settings.envdata.dataURL;      
      // console.log(dataURL);

      var item = {
        "211": {
          "item": "211",
          "abbr": "OPC",
          "desp": "[均值]不透光率",
          "unit": "%"
        },
        "222": {
          "item": "222",
          "abbr": "SOX",
          "desp": "[均值]二氧化硫",
          "unit": "ppm"
        },
        "223": {
          "item": "223",
          "abbr": "NOX",
          "desp": "[均值]氮氧化物",
          "unit": "ppm"
        },
        "224": {
          "item": "224",
          "abbr": "CO",
          "desp": "[均值]一氧化碳",
          "unit": "ppm"
        },
        "225": {
          "item": "225",
          "abbr": "TRS",
          "desp": "[均值]總還原硫",
          "unit": "ppm"
        },
        "226": {
          "item": "226",
          "abbr": "HCL",
          "desp": "[均值]氯化氫",
          "unit": "ppm"
        },
        "227": {
          "item": "227",
          "abbr": "VOC",
          "desp": "[均值]揮發性有機物",
          "unit": "ppm"
        },
        "228": {
          "item": "228",
          "abbr": "NMHC",
          "desp": "[均值]NMHC",
          "unit": "ppm"
        },
        "236": {
          "item": "236",
          "abbr": "O2",
          "desp": "[均值]氧氣",
          "unit": "%"
        },
        "237": {
          "item": "237",
          "abbr": "CO2",
          "desp": "[均值]二氧化碳",
          "unit": "%"
        },
        "248": {
          "item": "248",
          "abbr": "FLOW",
          "desp": "[均值]排放流率",
          "unit": "Nm3/hr"
        },
        "259": {
          "item": "259",
          "abbr": "TEMP",
          "desp": "[均值]溫度",
          "unit": "℃"
        },
        "280": {
          "item": "280",
          "abbr": "CMH",
          "desp": "[均值]排放流率",
          "unit": "CMH"
        },
        "911": {
          "item": "911",
          "abbr": "OPC",
          "desp": "不透光率",
          "unit": "%"
        },
        "922": {
          "item": "922",
          "abbr": "SOX",
          "desp": "二氧化硫",
          "unit": "ppm"
        },
        "923": {
          "item": "923",
          "abbr": "NOX",
          "desp": "氮氧化物",
          "unit": "ppm"
        },
        "924": {
          "item": "924",
          "abbr": "CO",
          "desp": "一氧化碳",
          "unit": "ppm"
        },
        "925": {
          "item": "925",
          "abbr": "TRS",
          "desp": "總還原硫",
          "unit": "ppm"
        },
        "926": {
          "item": "926",
          "abbr": "HCL",
          "desp": "氯化氫",
          "unit": "ppm"
        },
        "927": {
          "item": "927",
          "abbr": "VOC",
          "desp": "揮發性有機物",
          "unit": "ppm"
        },
        "928": {
          "item": "928",
          "abbr": "NMHC",
          "desp": "NMHC",
          "unit": "ppm"
        },
        "936": {
          "item": "936",
          "abbr": "O2",
          "desp": "氧氣",
          "unit": "%"
        },
        "937": {
          "item": "937",
          "abbr": "CO2",
          "desp": "二氧化碳",
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
          "unit": "℃"
        },
        "980": {
          "item": "980",
          "abbr": "CMH",
          "desp": "排放流率",
          "unit": "CMH"
        }
      };

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
          robj[dtmp[4]] = o;
        }
        return robj;
      }

      var axisTitleOption = {
        axisX: {
          axisTitle: "",
          axisClass: "ct-axis-title",
          offset: {
            x: 0,
            y: 0
          },
          textAnchor: "end",
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
              console.log("分享成功！");
            } 
            else {
              console.log("分享失敗...");
            }
          }
        );
      }

      Papa.parse(dataURL, {
        download: true,
        complete: function(results) {
          var values = {};
          var i, indexo, row, index, datehour, max, avg, threshold;

          // grouping by registration_no,facility_no,type
          for(i = 0; i < results.data.length; i++){
            row = results.data[i];
            if(row.length < 5) continue;
            index = row[0] + "_" + row[1] + "_" + row[2];
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

          // crete chart
          var data, line, $div, $h3;
          var $root = $("#charts");
          var count = 0;

          for(index in values) {
            var name = index.split("_");
            values[index] = missingHours(values[index]);
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
            var topValue;
            for (var i = 0; i < keys.length; i++) {
              var k = keys[i];
              data.labels.push(k);

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

                if (v[1] && v[1] >= topValue) {
                  // console.log("threshold: " + v[1]);
                  v[1] += 10;
                  // console.log("high: " + v[1]);
                  chartOption.high = v[1];
                }

                topValue = undefined;
              }
            }

            // data["series"].push(line);
            // console.log(data);

            var chartID = "chart-" + index;
            var chartName = name[1] + " - " + item[name[2]]["desp"];
            var chartItem = "<div class='chart'>";
            chartItem += "<h3>" + chartName + "</h3>";
            chartItem += "<div class='chart-btns'><a class='chart-share-btn' href='#'>分享</a></div>";
            chartItem += "<div id='" + chartID + "' class='" + index + " ct-chart' data-chart-name='" + chartName  + "'></div>";
            chartItem += "</div>";
            $root.append(chartItem);

            // Create a new line chart object where as first parameter we pass in a selector
            // that is resolving to our chart container element. The Second parameter
            // is the actual data object.
            axisTitleOption.axisY.axisTitle = item[name[2]]["unit"];
            chartOption.plugins = [
              //Chartist.plugins.ctThreshold({threshold: 40}),
              Chartist.plugins.ctAxisTitle(axisTitleOption)
            ];
            new Chartist.Line("." + index, data, chartOption);
            count++;
            // if(count > 2) break;
          }

          // Set chartist_load is true after gerenate all charts.
          Drupal.settings.envdata.chartist_load = true;

          // Show a share preview modal when user click chart share button.
          $(".chart-btns").on("click", ".chart-share-btn", function(e) {
            e.preventDefault();

            var $chart       = $(this).parent(".chart-btns").next(".ct-chart");
            var chartID      = $chart.attr("id");
            var chartName    = $chart.attr("data-chart-name");
            var pngDataVal   = svgToPng(chartID);
            var fileNameVal  = chartID;
            var facilityName = $(".views-field-facility-name .field-content").text();
            
            var postData = {
              imgData: pngDataVal,
              fileName: fileNameVal,
            };

            $.ajax({
              type: "POST",
              url: "/ajax/save-chart",
              data: postData,
              success: function(chartImgURL) {
                console.log("成功將圖表圖片儲存於server後（ajax success），印出圖片網址： " + chartImgURL);

                // Prepare share modal HTML.
                var shareModal = "<div class='modal' id='chart-share-modal'><h3>[即時排放監測] " + facilityName + "</h3><h4>" + chartName + "</h4><div class='chart-img'><img src='" + chartImgURL + "' /></div><div class='share-btns'><a href='#' class='fb-share-btn'>立刻分享到Facebook</a></div></div>";
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
                  var dName    = "[即時排放監測] " + facilityName;
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
      });

    },
    
    detach: function (context, settings, trigger) {
      // Undo something.
    }
  };

})(jQuery, Drupal, this, this.document);
