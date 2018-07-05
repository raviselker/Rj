
(function($) {
  $.fn.enableSmartTab = function() {
    var $this;
    $this = $(this);
    $this.keydown(function(e) {
      var after, before, end, lastNewLine, changeLength, re, replace, selection, start, val;
      if ((e.charCode === 9 || e.keyCode === 9) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        start = this.selectionStart;
        end = this.selectionEnd;
        val = $this.val();
        before = val.substring(0, start);
        after = val.substring(end);
        replace = true;
        if (start !== end) {
          selection = val.substring(start, end);
          if (~selection.indexOf('\n')) {
            replace = false;
            changeLength = 0;
            lastNewLine = before.lastIndexOf('\n');
            if (!~lastNewLine) {
              selection = before + selection;
              changeLength = before.length;
              before = '';
            } else {
              selection = before.substring(lastNewLine) + selection;
              changeLength = before.length - lastNewLine;
              before = before.substring(0, lastNewLine);
            }
            if (e.shiftKey) {
              re = /(\n|^)(\t|[ ]{1,8})/g;
              if (selection.match(re)) {
                start--;
                changeLength--;
              }
              selection = selection.replace(re, '$1');
            } else {
              selection = selection.replace(/(\n|^)/g, '$1\t');
              start++;
              changeLength++;
            }
            $this.val(before + selection + after);
            this.selectionStart = start;
            this.selectionEnd = start + selection.length - changeLength;
          }
        }
        if (replace && !e.shiftKey) {
          $this.val(before + '\t' + after);
          this.selectionStart = this.selectionEnd = start + 1;
        }
      }
    });
  };
})($);

const events = {
	loaded: function(ui) {
	    let $contents = ui.view.$el;
		
		let $advice = $(`<div style="text-align: right">\u2318 + Enter to run</div>`).prependTo($contents);
		
		this.$textarea = $(`
            <textarea
                id="code"
                style="
                    tab-size: 4 ;
                    font-family: Consolas, 'Liberation Mono', Menlo, Courier, monospace ;
                    font-size: inherit ;
                    width: 100% ;
                    height: 80% ;
                    resize: none ;
            "></textarea>`).prependTo($contents);
        
        $("textarea").enableSmartTab();
        
        this.$textarea.on('keydown', (event) => {
            if (event.keyCode === 13 && event.metaKey) {
                ui.code.setValue(this.$textarea.val());
                event.stopPropagation();
            }
            else if (event.keyCode === 65 && event.metaKey) {
                this.$textarea.select();
            }
        });
	},
	
    update: function(ui) {
        this.$textarea.text(ui.code.value());
        this.requestData('columns').then((data) => {
            let cols = data.columns.map(col => col.name);
            ui.vars.setValue(cols);
        });
    }
};


module.exports = events;
