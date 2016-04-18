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

            $div = $("<div class='" + index + " ct-chart'></div>");
            $h3 = $("<h3>" + name[1] + " - " + item[name[2]]["desp"] + "</h3>");
            $root.append($h3);
            $root.append($div);

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
        }
      });
    },
    
    detach: function (context, settings, trigger) {
      // Undo something.
    }
  };

})(jQuery, Drupal, this, this.document);
