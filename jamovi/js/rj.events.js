
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
		
		if (navigator.platform === 'MacIntel')
		    $(`<div style="text-align: right">\u2318 + Shift + Enter to run</div>`).prependTo($contents);
		else
		    $(`<div style="text-align: right">Ctrl + Shift + Enter to run</div>`).prependTo($contents);
		
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
            if (event.keyCode === 13 && (event.metaKey || event.ctrlKey) && event.shiftKey) {
                
                let script = this.$textarea.val();
                
                // replace " with '
                script = script.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (s) => "'" + s.substring(1, s.length - 1) + "'");
                
                this.requestData('columns').then((data) => {
                    
                    let allVars = data.columns.map(col => col.name);
                    
                    let match = script.match(/^\s*\#\s*\((.*)\)/);
                    if (match !== null) {
                        let content = match[1];
                        let vars = content.split(',');
                        vars = vars.map(s => s.trim());
                        vars = vars.filter(v => allVars.includes(v));
                        ui.vars.setValue(vars);
                        ui.code.setValue(script);
                    }
                    else {
                        ui.vars.setValue(allVars);
                        ui.code.setValue(script);
                    }
                });
                
                event.stopPropagation();
            }
            else if (event.keyCode === 65 && event.metaKey) {
                this.$textarea.select();
            }
        });
	},
	
    update: function(ui) {
        this.$textarea.val(ui.code.value());
    }
};


module.exports = events;
