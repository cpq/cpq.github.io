$(document).ready(function() {

  var authCookieName = 'cpq_auth';
  var ghClientId = '1c154c37a261751d93ac';
  var authToken;

  var render = function(data) {
    var options = {
      lines: {
        fill: false,
        lineWidth: 2,
        fillColor: {colors: [ { opacity: 0 }, { opacity: 1 } ] }
      },
      grid: { borderWidth: 1, borderColor: '#ccc', hoverable: true },
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
    var div = $('#graph');
    var plot = $.plot(div, data, options);
    div.bind('plothover', function (event, pos, item) {
      if (item) {
        var x = item.datapoint[0].toFixed(2);
        var y = item.datapoint[1].toFixed(2);
        $('#graph_tooltip').html(y + '<br/>' +
                                 moment(+x).format('YYYY-MM-DD HH:mm'))
          .css({top: item.pageY+5, left: item.pageX+5})
          .fadeIn(200);
      } else {
        $('#graph_tooltip').fadeOut(200);
      }
    });
  };

  function linkEnterToButtonPress(selector1, selector2) {
    $(document).on('keypress', selector1, function(ev) {
      if (ev.keyCode == 13) {
        $(selector2).trigger('click');
        return false;
      }
    });
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
    var tok = authToken ? '&access_token=' + authToken : '';
    $.ajax({
      url: 'https://api.github.com/repos/' + repo + '/stargazers?' +
        '&per_page=' + per_page + '&page=' + page + tok,
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
      get_chunk(repo, 1, per_page, [], data, repos.length);
    });
  };

  $(document).on('change', '#repos_input', function() {
    location.hash = $(this).val();
    refresh();
  });

  $(document).on('click', '#refresh_button', refresh);

  linkEnterToButtonPress('#repos_input', '#refresh_button');
  //$('#graph').height($(document.body).height() - $('.ui.menu').height() - 20);

  // Graph tooltip
  $("<div id='graph_tooltip'/>").css({
    position: 'absolute',
    display: 'none',
    border: '1px solid #cca',
    padding: '0.4em',
    'white-space': 'nowrap',
    'background-color': '#ffc',
    opacity: 0.80
  }).appendTo('body');

  $(window).on('hashchange', function() {
    var str = location.hash.substring(1);
    if (str) {
      $('#repos_input').val(str);
    }
    $('#repos_input').trigger('change');
  });

  // Authorization snippet
  var clearAuth = function() {
    $.cookie(authCookieName, '');
    location.reload();
  };
  $(document).on('click', '#logout', clearAuth);
  var m = (location.search || '').match(/code=([^&#]+)/);
  if (m && m[1]) {
    // Github Oauth redirects us here
    $.ajax({
      url: 'http://backend.cesanta.com/cgi-bin/gh.cgi',
      data: { code: m[1] },
      dataType: 'jsonp',
      error: clearAuth,
      success: function(jsonData) {
        //console.log(jsonData);
        $.cookie(authCookieName, jsonData.token || '');
        location.href = '/';
      }
    });
  }
  var authToken = $.cookie(authCookieName);

  if (authToken) {
    $.ajax({
      url: 'https://api.github.com/user',
      data: { access_token: authToken },
      error: clearAuth,
      success: function(jsonData) {
        $('.authonly').removeClass('authonly');
        $('#auth_button').hide();
        $('#avatar').attr({ src: jsonData.avatar_url });
        $('#username').text(jsonData.name || jsonData.login);
        $(window).trigger('hashchange');
      }
    });
  } else {
    $(window).trigger('hashchange');
  }
});
