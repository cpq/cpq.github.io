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
      legend: {
        labelFormatter: function(str, series) {
          return '<a href="https://github.com/' + str + '">' + str + '</a>';
        },
        labelBoxBorderColor: '#fff',
        position: 'nw'
      },
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

  var get_chunk = function(repo, page, per_page, series, data, num_series) {
    var onChunk = function(obj) {
      if (obj.length < per_page) {
        data.push({label: repo, data: series});
        if (data.length == num_series) {
          render(data);
          $('#refresh_button').removeClass('loading');
        }
      } else {
        get_chunk(repo, page + 1, per_page, series, data, num_series);
      }
    };
    $.ajax({
      url: 'https://api.github.com/repos/' + repo + '/stargazers?' +
        '&per_page=' + per_page + '&page=' + page,
      headers: { Accept: 'application/vnd.github.v3.star+json' },
      error: function() {
        onChunk([]);
      },
      success: function(obj) {
        $.each(obj, function(i, v) {
          var t = new Date(v.starred_at);
          series.push([t.getTime(), series.length]);
        });
        onChunk(obj);
      }
    });
  };

  var refresh = function() {
    var repos = $('#repos_input').val().split(/[,\s]+/);
    var page = 1, per_page = 100, data = [];
    $('#refresh_button').addClass('loading');
    $.each(repos, function(i, repo) {
      get_chunk(repo, 1, 100, [], data, repos.length);
    });
  };

  $(document).on('change', '#repos_input', function() {
    location.hash = $(this).val();
    refresh();
  });

  $(document).on('click', '#refresh_button', refresh);

  $(window).on('hashchange', function() {
    var str = location.hash.substring(1);
    if (str) {
      $('#repos_input').val(str);
    }
    $('#repos_input').trigger('change');
  });

  $(window).trigger('hashchange');
});
