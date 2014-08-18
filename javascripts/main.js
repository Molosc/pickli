$(function() {

		// DEFAULT MENU

      $('#default').pickli();



      // CLOCK

      var hours = [];
      for (var i = 0 ; i < 24 ; i++) {
        hours.push({value:i});
      }
      var mins = [];
      for (var i = 0 ; i < 60 ; i++) {
        mins.push({value:i});
      }

      var d = new Date();
      var hour = $('#hour').pickli({
        orientation:'vertical',
        labelKey: 'value',
        data: hours,
        size: "30px",
        index: d.getHours(),
        interaction: false,
        cursor: 'default',
        wrapperClass: 'clock',
        selectClass:'none'
      });
      var min = $('#min').pickli({
        orientation:'vertical',
        labelKey: 'value',
        data: mins,
        size: "30px",
        index: d.getMinutes(),
        interaction: false,
        cursor: 'default',
        wrapperClass: 'clock',
        selectClass:'none'
      });
      var sec = $('#sec').pickli({
        orientation:'vertical',
        labelKey: 'value',
        data: mins,
        size: "30px",
        index: d.getSeconds(),
        interaction: false,
        cursor: 'default',
        wrapperClass: 'clock',
        selectClass:'none'
      });
      
      var clock = setInterval(function() {
        d = new Date();
        hour.value(d.getHours());
        min.value(d.getMinutes());
        sec.value(d.getSeconds());
      }, 1000);
      
      
      
      
      
      
      var tab_cont = $('#tab_cont').pickli({
          default:'home',
          resize: true,
          selectClass: 'tab_page tab_page_cur',
          unselectClass: 'tab_page',
          interaction: false,
          cursor:false
      });
      
      var tab = $('#tab').pickli({
          default:'home',
          resize: true,
          selectClass: 'tab_menu tab_menu_cur',
          unselectClass: 'tab_menu',
          onChange: function(e) {
              tab_cont.value(e);
          },
          loop:true
      });



	    $('#firsttab').on('click', function() {
	        tab.first();
	        return false;
	    });
	    $('#lasttab').on('click', function() {
	        tab.last();
	        return false;
	    });

	    $('#nexttab').on('click', function() {
	        tab.next();
	        return false;
	    });
	    $('#prevtab').on('click', function() {
	        tab.prev();
	        return false;
	    });

    })
