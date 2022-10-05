/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5566666666666666, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7, 500, 1500, "Post Books"], "isController": false}, {"data": [0.6333333333333333, 500, 1500, "Post Users"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "Delete book"], "isController": false}, {"data": [0.0, 500, 1500, "Get Books"], "isController": false}, {"data": [0.36666666666666664, 500, 1500, "Delete User"], "isController": false}, {"data": [0.75, 500, 1500, "Get User by Id"], "isController": false}, {"data": [0.7, 500, 1500, "Put books"], "isController": false}, {"data": [0.7833333333333333, 500, 1500, "Put Users"], "isController": false}, {"data": [0.75, 500, 1500, "Get Users"], "isController": false}, {"data": [0.21666666666666667, 500, 1500, "Get Book by ID"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 300, 0, 0.0, 6944.226666666664, 203, 94081, 753.0, 5577.300000000011, 70377.34999999999, 83046.39000000003, 2.2404110407456086, 203.29299436303248, 0.5446124182249971], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Post Books", 30, 0, 0.0, 710.9333333333334, 234, 2866, 540.0, 1166.1000000000001, 1984.349999999999, 2866.0, 0.23682091602330319, 0.09320198159901483, 0.08399741865201535], "isController": false}, {"data": ["Post Users", 30, 0, 0.0, 782.4000000000001, 217, 2916, 538.0, 2201.7000000000025, 2768.0499999999997, 2916.0, 0.23811791599199925, 0.09371242201638251, 0.0647383084103248], "isController": false}, {"data": ["Delete book", 30, 0, 0.0, 865.6666666666665, 203, 4075, 570.0, 2000.1000000000001, 3050.8999999999987, 4075.0, 0.2373661848133115, 0.04891041503477415, 0.050146697247343476], "isController": false}, {"data": ["Get Books", 30, 0, 0.0, 60695.06666666666, 4401, 94081, 70281.5, 82743.90000000001, 88169.59999999999, 94081.0, 0.2289621907102407, 206.01684762232304, 0.04293041075817013], "isController": false}, {"data": ["Delete User", 30, 0, 0.0, 1241.266666666667, 446, 2744, 1181.5, 2013.2000000000003, 2486.5999999999995, 2744.0, 0.23793283949050648, 0.049027176887203976, 0.050266410426217024], "isController": false}, {"data": ["Get User by Id", 30, 0, 0.0, 588.1, 216, 1216, 496.5, 1018.9000000000001, 1192.35, 1216.0, 0.2385856641827248, 0.10787613527011873, 0.04527846426384393], "isController": false}, {"data": ["Put books", 30, 0, 0.0, 750.0666666666665, 214, 4118, 519.5, 1119.7000000000003, 3058.699999999999, 4118.0, 0.23766517729822226, 0.09353424458123397, 0.08414213763982635], "isController": false}, {"data": ["Put Users", 30, 0, 0.0, 549.4333333333332, 207, 1189, 426.5, 1013.0000000000001, 1182.4, 1189.0, 0.23897908136441123, 0.09405133768540794, 0.06528360842480921], "isController": false}, {"data": ["Get Users", 30, 0, 0.0, 669.9333333333333, 209, 4590, 497.0, 863.2, 2594.5999999999976, 4590.0, 0.2377235591971283, 0.28136811889347607, 0.044573167349461554], "isController": false}, {"data": ["Get Book by ID", 30, 0, 0.0, 2589.4000000000005, 318, 9995, 2126.5, 5577.300000000001, 9078.15, 9995.0, 0.23651471909935196, 0.9422709453493322, 0.04488544311032623], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 300, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
