/*! SelectFilter v0.1.3 | (c) masanori kitajima | https://github.com/k-masa2501/SelectFilter */
(function( $ ) {

  var methods = {
    init: function(o_this, arg){

      var obj = null;
      var user_data = null;
      var div_filter = null;
      var ul_filter = null;
      var input_hidden = null;
      var input_text = null;
      var radio_id = null;
      var delay = null;

      if (arg == null || typeof arg != 'object' || !('delay' in arg) || !(isFinite(arg.delay))){
        delay = 300;
      }else{
        delay = arg.delay;
      }

      for(var i=0;i < o_this.length;i++){

        obj = $(o_this[i]);

        user_data = new Array();
        div_filter = $("<div class='div_filter' tabIndex='0' style='display: none;'></div>");
        ul_filter = $("<ul></ul>");
        input_hidden = $("<input type='hidden' data-text='' name='"+ obj.attr('name') +"'>");
        input_text = $("<input type='text'>");
        radio_id = obj.attr('id') + '-radio-id';

        $('body').append(div_filter);
        obj.after(input_hidden);
        obj.after(input_text);
        div_filter.append(ul_filter);

        $.each(obj.children(),function(i,v){
          user_data.push([$(v).val(),$(v).text()]);
        });

        obj.data('user_data', user_data);
        obj.data('div_filter', div_filter);
        obj.data('ul_filter', ul_filter);
        obj.data('input_hidden', input_hidden);
        obj.data('input_text', input_text);
        obj.data('radio_id', radio_id);
        obj.data('delay', delay);

        obj.hide();

        methods._add_event_lisner(obj);

        methods._set_value(obj.val(), obj);

      }
    },
    _add_event_lisner: function(obj){
      var div_filter = obj.data('div_filter');
      var input_text = obj.data('input_text');
      var radio_id = obj.data('radio_id');

      input_text.mousedown(function(){
        methods._mousedown(obj);
      });

      input_text.focusout(function(){
        methods._focusout(obj);
      });

      input_text.keyup(function() {
        methods._keyup(obj);
      });

      input_text.on('input propertychange',function(){
        methods._keyup(obj);
      });

      div_filter.focusout(function(){
        methods._focusout(obj);
      });

      div_filter.mouseenter(function(){
        methods._mouseenter(this);
      });

      div_filter.mouseleave(function(){
        methods._mouseleave(this);
      });

      $(document).on('click', '.'+radio_id, function(){
        methods._click_radio(this, obj);
      });

      obj.on('destroy', function(e, arg) {
        methods._destroy(obj);
      });

      obj.on('set_value', function(e, arg) {
        methods._set_value(arg, obj);
      });
    },
    _mousedown: function(obj){
      methods._search(obj);
      methods._show(obj);
    },
    _focusout: function (obj){
      var div_filter = obj.data('div_filter');
      var input_hidden = obj.data('input_hidden');
      var input_text = obj.data('input_text');

      if ('1' != div_filter.attr('data-onmouse')){
        input_text.val(input_hidden.attr('data-text'));
        div_filter.hide();
      }
    },
    _click_radio: function(radio, obj){
      var text = $(radio).attr('data-text');
      var input_hidden = obj.data('input_hidden');
      var input_text = obj.data('input_text');

      input_text.val(text);
      input_hidden.attr('data-text', text);
      input_hidden.val($(radio).val());
    },
    _mouseenter: function(o){
      $(o).attr('data-onmouse','1');      
    },
    _mouseleave: function(o){
      $(o).attr('data-onmouse','0');      
    },
    _keyup: function(obj){
      var delay = obj.data('delay');
      var div_filter = obj.data('div_filter');
      methods._search_delay((function(){
        methods._search(obj);
        if ('none' == div_filter.css('display')) methods._show(obj);
      }),delay);
    },
    _destroy: function(obj){
      var div_filter = obj.data('div_filter');
      var input_hidden = obj.data('input_hidden');
      var input_text = obj.data('input_text');
      var radio_id = obj.data('radio_id');

      input_text.off();
      div_filter.off();
      obj.off();
      $(document).off("click", '.'+radio_id);

      div_filter.remove();
      input_hidden.remove();
      input_text.remove();

      obj.removeData('user_data');
      obj.removeData('div_filter');
      obj.removeData('ul_filter');
      obj.removeData('input_hidden');
      obj.removeData('input_text');
      obj.removeData('delay');
      obj.removeData('radio_id');

      div_filter = null;
      input_text = null;
      input_hidden = null;
      radio_id = null;
      obj.init = null;

      obj.show();      
    },
    _set_value: function (val, obj){
      var id = val != null ? val:'';
      var input_hidden = obj.data('input_hidden');
      var input_text = obj.data('input_text');
      var user_data = obj.data('user_data');

      input_text.val('');
      input_hidden.attr('data-text', '');
      input_hidden.val('');

      $.each(user_data,function(i,v){
        if (String(id) == String(v[0])){
          input_text.val(v[1]);
          input_hidden.attr('data-text', v[1]);
          input_hidden.val(v[0]);
          return false;
        }
      });
    },
    _search: function(obj){
      var ul_filter = obj.data('ul_filter');
      var input_hidden = obj.data('input_hidden');
      var input_text = obj.data('input_text');
      var user_data = obj.data('user_data');
      var radio_id = obj.data('radio_id');

      var regexp = methods._set_regexp(input_text.val());
      var tmp = '';

      for (var i=0; i < user_data.length; i++){
        if (regexp.test(user_data[i][1])){
          tmp = tmp + "<li><input type='radio' class='"+ radio_id +"' name='"+ radio_id +
              "' data-text='"+ user_data[i][1] +"' value='"+ user_data[i][0] +"'>"+ user_data[i][1] +"</li>";
        }
      }

      ul_filter[0].innerHTML = tmp;
      if ('' != tmp){
        $.each(ul_filter.find("input[type='radio']"), function(i,v){
          $(v).attr('checked', 'checked');
          input_hidden.attr('data-text', $(v).attr('data-text'));
          input_hidden.val($(v).val());
          return false;
        });
      }else{
        ul_filter[0].innerHTML = '<li>not exist.</li>';
      }
    },
    _set_regexp: function (val){
      var regexp = '';
      if ("" == val){
        regexp = new RegExp('.+');
      }else{
        val = val.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        val = val.replace(/\s|　/g, ".*");
        regexp = new RegExp('.*' + val + '.*');
      }
      return regexp;      
    },
    _search_delay: function(callback, ms){
      return (function(callback, ms){
        clearTimeout (methods.timer);
        methods.timer = setTimeout(callback, ms);
      })(callback, ms);
    },
    _show: function(obj){
      var div_filter = obj.data('div_filter');
      var input_text = obj.data('input_text');
      var left = input_text.position().left + Number(input_text.css('margin-left').replace(/px/g, ''));
      var top = input_text.outerHeight()+input_text.position().top;
      div_filter.css('min-width',String(input_text.width())+'px');
      div_filter.css('left', String(left)+'px');
      div_filter.css('top', String(top)+'px');
      div_filter.show();
    },
    timer: 0
  };


  $.fn.SelectFilter = function(method) {

    if ('init' == method){
      methods[method](this, arguments[1]);
    }else{
      $(this).trigger(method, arguments[1]);
    }

  };

})( jQuery );