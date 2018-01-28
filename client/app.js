(function(){

  var width = 110
  var height = 100
  var connectionStatus = false
  var dataLoaded = false
  var whaleCount = 0
  var currentData = []

  function activate_page(){
    load_data(build_page)
    $('#preloader').hide()
  }

  function disable_page(){
    $('#preloader').show()
  }

  function load_data(done){
    $.get('/v1/whales', function(data){

      var ret = data.map(function(st){
        var parts = st.split(':')
        return {
          x:parts[0],
          y:parts[1]
        }
      })

      done(ret)

    })
  }

  function add_data(x, y, done){
    $.post('/v1/whales', x + ':' + y, done)
  }

  function check_status(done){
    $.get('/v1/ping', function(data){
      connectionStatus = data.connected

      if(connectionStatus){
        activate_page()
      }
      else{
        disable_page()
      }

      setTimeout(check_status, 1000)
    })
  }

  function add_whale(x, y, animate){
    var holder = document.getElementById('holder')
    var elem = document.createElement('div')
    whaleCount++
    if (y < 100 && whaleCount == 5) {
        $(elem).addClass('bug')
    } else {
        $(elem).addClass('whale')
    }
    $(elem).css({
      left:x + 'px',
      top:y + 'px',
      width:width + 'px',
      height:height + 'px'
    })
    if(animate){
      $(elem).addClass('animated tada');
    }
    holder.appendChild(elem)
    $('#clickmessage').hide()
  }

  function reset() {
    whaleCount = 0
    $('#holder').html('')
  }

  // will put the mobies on the screen as per state
  function build_page(backendData){
    if(JSON.stringify(backendData) == JSON.stringify(currentData)) return
    reset()
    backendData.forEach(function(pos){
      add_whale(pos.x, pos.y)
    })
    currentData = backendData
  }

  function handle_click(e){
    if(!connectionStatus) return
    var offset = $(this).offset();
    var x = e.pageX - offset.left - (width/2);
    var y = e.pageY - offset.top - (height/2);
    add_data(x, y, function(){
      add_whale(x, y, true)
    })
  }

  $(function(){
    $('#preloader').show()
    $('#clickmessage').show()
    $('#holder').click(handle_click)
    check_status()
  })

})()
