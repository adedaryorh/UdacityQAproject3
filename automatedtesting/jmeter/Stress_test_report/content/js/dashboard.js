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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5033333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5416666666666666, 500, 1500, "Post Books"], "isController": false}, {"data": [0.65, 500, 1500, "Delete Books"], "isController": false}, {"data": [0.36666666666666664, 500, 1500, "Delete User"], "isController": false}, {"data": [0.75, 500, 1500, "Get User by Id"], "isController": false}, {"data": [0.5166666666666667, 500, 1500, "Get Users by Id"], "isController": false}, {"data": [0.5, 500, 1500, "Put User"], "isController": false}, {"data": [0.7166666666666667, 500, 1500, "Put Books"], "isController": false}, {"data": [0.7, 500, 1500, "Put books"], "isController": false}, {"data": [0.7833333333333333, 500, 1500, "Put Users"], "isController": false}, {"data": [0.21666666666666667, 500, 1500, "Get Book by ID"], "isController": false}, {"data": [0.6166666666666667, 500, 1500, "Get Books by ID"], "isController": false}, {"data": [0.575, 500, 1500, "Post Users"], "isController": false}, {"data": [0.5833333333333334, 500, 1500, "Delete Users"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "Delete book"], "isController": false}, {"data": [0.0, 500, 1500, "Get Books"], "isController": false}, {"data": [0.0, 500, 1500, "Get books"], "isController": false}, {"data": [0.38333333333333336, 500, 1500, "Get Users"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 600, 0, 0.0, 6394.974999999996, 203, 94081, 852.0, 10831.999999999978, 56718.299999999974, 77753.51000000001, 0.2132129485645083, 19.355253191153757, 0.05160003214185199], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Post Books", 60, 0, 0.0, 1154.4500000000003, 208, 4755, 853.5, 3006.2, 3141.65, 4755.0, 0.021367879020767085, 0.008409428950555796, 0.007578919590178325], "isController": false}, {"data": ["Delete Books", 30, 0, 0.0, 939.2999999999998, 213, 5460, 623.0, 1297.5, 4975.999999999999, 5460.0, 0.31849500493667254, 1.165534129393904, 0.06033987398214305], "isController": false}, {"data": ["Delete User", 30, 0, 0.0, 1241.266666666667, 446, 2744, 1181.5, 2013.2000000000003, 2486.5999999999995, 2744.0, 0.23793283949050648, 0.049027176887203976, 0.050266410426217024], "isController": false}, {"data": ["Get User by Id", 30, 0, 0.0, 588.1, 216, 1216, 496.5, 1018.9000000000001, 1192.35, 1216.0, 0.2385856641827248, 0.10787613527011873, 0.04527846426384393], "isController": false}, {"data": ["Get Users by Id", 30, 0, 0.0, 985.3666666666668, 303, 3423, 851.0, 2365.0000000000023, 2942.8499999999995, 3423.0, 0.4417026163518309, 0.19928379761186119, 0.08368194098853046], "isController": false}, {"data": ["Put User", 30, 0, 0.0, 1060.1333333333337, 307, 2686, 935.0, 2224.9000000000005, 2589.2, 2686.0, 0.43649061545176776, 0.17178292776080314, 0.11909714644260147], "isController": false}, {"data": ["Put Books", 30, 0, 0.0, 653.9, 203, 2387, 532.5, 1172.5000000000002, 1735.249999999999, 2387.0, 0.3225667713216636, 0.12694766488538126, 0.11472540831577135], "isController": false}, {"data": ["Put books", 30, 0, 0.0, 750.0666666666665, 214, 4118, 519.5, 1119.7000000000003, 3058.699999999999, 4118.0, 0.23766517729822226, 0.09353424458123397, 0.08414213763982635], "isController": false}, {"data": ["Put Users", 30, 0, 0.0, 549.4333333333332, 207, 1189, 426.5, 1013.0000000000001, 1182.4, 1189.0, 0.23897908136441123, 0.09405133768540794, 0.06528360842480921], "isController": false}, {"data": ["Get Book by ID", 30, 0, 0.0, 2589.4000000000005, 318, 9995, 2126.5, 5577.300000000001, 9078.15, 9995.0, 0.23651471909935196, 0.9422709453493322, 0.04488544311032623], "isController": false}, {"data": ["Get Books by ID", 30, 0, 0.0, 860.1333333333333, 217, 4721, 641.5, 1410.7000000000005, 3789.299999999999, 4721.0, 0.3196215680634129, 1.2084650107605928, 0.06055330488701377], "isController": false}, {"data": ["Post Users", 60, 0, 0.0, 870.2000000000002, 217, 2916, 612.0, 2284.0999999999995, 2724.8999999999996, 2916.0, 0.021733193178385325, 0.008553200049696568, 0.00590871189537351], "isController": false}, {"data": ["Delete Users", 30, 0, 0.0, 869.6333333333333, 269, 2783, 838.0, 1215.0000000000002, 2625.7, 2783.0, 0.462934386766249, 0.09538980039812357, 0.09765022220850564], "isController": false}, {"data": ["Delete book", 30, 0, 0.0, 865.6666666666665, 203, 4075, 570.0, 2000.1000000000001, 3050.8999999999987, 4075.0, 0.2373661848133115, 0.04891041503477415, 0.050146697247343476], "isController": false}, {"data": ["Get Books", 30, 0, 0.0, 60695.06666666666, 4401, 94081, 70281.5, 82743.90000000001, 88169.59999999999, 94081.0, 0.2289621907102407, 206.01684762232304, 0.04293041075817013], "isController": false}, {"data": ["Get books", 30, 0, 0.0, 45961.166666666664, 14199, 67036, 48637.5, 62814.90000000001, 65038.399999999994, 67036.0, 0.27817443391502694, 249.61497470930772, 0.05215770635906756], "isController": false}, {"data": ["Get Users", 60, 0, 0.0, 2620.7833333333338, 209, 12062, 1534.5, 5588.7, 10931.65, 12062.0, 0.021735696824704505, 0.025726234913615094, 0.004075443154632094], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 600, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
