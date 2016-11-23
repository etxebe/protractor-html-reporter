function drawChart(chartData) {
  var data = google.visualization.arrayToDataTable([
    ['Task', 'Project Results'],
    ['Passed', chartData.passed],
    ['Skipped', chartData.skipped],
    ['Errors', chartData.errors],
    ['Failed', chartData.failed]
  ]);

  var testsNumber = chartData.passed + chartData.failed + (chartData.skipped || 0) + (chartData.errors || 0);
  var title;

  if (testsNumber === 1) {
    title = testsNumber + ' ' + chartData.title.slice(0, -1);
  } else {
    title = testsNumber + ' ' + chartData.title;
  }

  var options = {
    width: '100%',
    height: 270,
    title: title,
    is3D: true,
    fontSize: '12',
    colors: ['#5cb85c', '#f0ad4e', '#5bc0de', '#d9534f'],
    pieStartAngle: 100,
    backgroundColor: 'white',
    titleTextStyle: {
      fontSize: '13',
      color: '#5e5e5e'
    }
  };

  var chart = new google.visualization.PieChart(document.getElementById('piechart_' + chartData.title.toLowerCase()));
  chart.draw(data, options);
}
