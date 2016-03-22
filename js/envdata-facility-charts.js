(function ($, Drupal, window, document) {

  // 'use strict';

  Drupal.behaviors.envdata = {
    attach: function (context, settings) {

      console.log("222222555");
      var dataURL = Drupal.settings.envdata.dataURL;
      console.log(dataURL);

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
        var hours = [], object = {}, h, hour, datehour;
        for (var i = 0; i < 24; i++) {
          h = i < 10 ? "0" + i.toString() : i.toString();
          hours[h] = 0;
        }

        for (h in obj) {
          datehour = h.split("-");
          hours[datehour[1]] = 1;
          object[datehour[1]] = obj[h];
        }
        return obj;
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
            datehour = row[5].split("-");
            max = row[3];
            avg = row[4];
            threshold = row[6];
            // new factory
            /*
            if(indexo != index){
            }
            */
            if(typeof values[index] === "undefined"){
              values[index] = [];
            }

            values[index]["h" + datehour[1].toString()] = max + "#" + threshold;
            indexo = index;
          }

          // crete chart
          var data, line, $div, $h3;
          var $root = $("#charts");
          var count = 0;

          for(index in values) {
            var name = index.split("_");
            /* TODO: missing hour problem
            indexues[index] = missingHours(values[index]);
            for(label in values[index]) {
              console.log(label + ":" +values[index][label]);
            }
            break;
            */
            var dataVals = [];
            var thresholdVals = [];

            data = {
              "labels": [],
              "series": [
                { name: "threshold-line", data: thresholdVals },
                { name: "data-line", data: dataVals }
              ]
            }

            /*
            data = {
              "labels": [],
              "series": [],
            };
            line = [];
            line[0] = {
              name: 'data-line',
              data: dataVals
            };
             line[1] = {
              name: 'threshold-line',
              data: thresholdVals
            };

            line = [{
              name: 'data-line',
              data: dataVals
            }, {
              name: 'threshold-line',
              data: thresholdVals
            }];
            */

            // console.log(values[index]);
            var keys = Object.keys(values[index]);
            keys.reverse();
            for (var i = 0; i < keys.length; i++) {
              var k = keys[i];
              data.labels.push(k.replace("h", ""));

              var v = values[index][k];
              v = v.split("#");

              // push data to data line
              dataVals.push(v[0]);

              // push data to threshold line
              v[1] = v[1] == 0 ? "" : v[1];
              thresholdVals.push(v[1]);
            }
            /*
            for(v in values[index]) {
              console.log(v);
              data.labels.push(v.replace('h', ''));
              line.push(values[index][v]);
            }
            */

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
        }
      });
    },
    
    detach: function (context, settings, trigger) {
      // Undo something.
    }
  };

})(jQuery, Drupal, this, this.document);
