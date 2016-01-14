$(document).ready(function() {

  var render = function(data) {
    var options = {
      lines: {
        fill: false,
        lineWidth: 2,
        fillColor: {colors: [ { opacity: 0 }, { opacity: 1 } ] }
      },
      grid: { borderWidth: 1, borderColor: '#ccc'},
      xaxis: { mode: 'time', ticks: 5 },
      //yaxis: getParam('yaxis', {}),
      legend: { labelBoxBorderColor: '#fff' },
      colors: [ '#DB2828', '#2185D0', '#FBBD08', '#21BA45',
        '#69c', '#fec', '#e39', '#9e2' ],
      hooks: {
        draw: [function(plot, canvas) {
          canvas.font = '13px sans-serif';
          canvas.fillStyle = '#aaa';
          //canvas.fillText(title, getParam('titleOffset', 50), 25);
        }]
      }
    };
    var plot = $.plot('#graph', data, options);
  };

  var get_chunk = function(repo, page, per_page, series, data, last) {
    $.ajax({
      url: 'https://api.github.com/repos/' + repo + '/stargazers' +
        '?per_page=' + per_page + '&page=' + page,
      headers: { Accept: 'application/vnd.github.v3.star+json' },
      success: function(obj) {
        $.each(obj, function(i, v) {
          var t = new Date(v.starred_at);
          series.push([t.getTime(), series.length]);
        });
        if (obj.length < per_page) {
          data.push({label: repo, data: series});
          if (last) {
            render(data);
            $('#refresh_button').removeClass('loading');
          }
        } else {
          get_chunk(repo, page + 1, per_page, series, data, last);
        }
      }
    });
  };

  var refresh = function() {
    var repos = $('#repos_input').val().split(/[,\s]+/);
    var page = 1, per_page = 100, data = [];
    $('#refresh_button').addClass('loading');
    $.each(repos, function(i, repo) {
      get_chunk(repo, 1, 100, [], data, i == repos.length - 1);
    });
  };

  $(document).on('change', '#repos_input', refresh);
  $(document).on('click', '#refresh_button', refresh);

  $(document).on('change', '#repos_input', function() {
    location.hash = $(this).val();
  });
  if (location.hash) {
    $('#repos_input').val(location.hash.substring(1));
  }
  $('#repos_input').trigger('change');
});
