'use strict';
import {useRef, useEffect, html} from  './bundle.js';

export function Ace({code, name, readonly = true, onchange, highlightLine, isHidden, showGutter = false, moveToOffset}) {
  const ref = useRef();

  useEffect(function() {
    if (ref.ace) {
      ref.ace.setReadOnly(readonly);
      ref.ace.renderer.$cursorLayer.element.style.display = readonly ? "none" : "block";
    }
  }, [readonly]);

  useEffect(function() {
    if (!ref.current) return;
    if (!ref.ace) {
      ref.pos = {row: 0, column: 0};

      ref.ace = ace.edit(ref.current, {
        useSvgGutterIcons: false,
        showInvisibles: false,
        highlightActiveLine: false,
        highlightGutterLine: false,
        theme: 'ace/theme/github_dark',
        //enableBasicAutocompletion: true,
        //enableLiveAutocompletion: true,
        //enableEmmet: true,
        tabSize: 2,
        printMargin: false,
        showGutter,
      });
      if (readonly) ref.ace.setReadOnly(readonly);
      ref.ace.renderer.$cursorLayer.element.style.display = readonly ? "none" : "block";
      ref.ace.session.on('change', function(a, b) {
        if (ref.ignorechange == false) {
          const lineNumber = a.start.row;
          onchange && onchange(ref.ace.getValue(), lineNumber);
          ref.pos = a.action == 'remove' ? a.start : a.end;
        }
      });
    }
    if (!window.require) window.require = function() {};
    let lang = '';
    if (name.endsWith('.js')) lang = 'javascript';
    if (name.endsWith('.c')) lang = 'c_cpp';
    if (name.endsWith('.h')) lang = 'c_cpp';
    if (name.endsWith('.ino')) lang = 'c_cpp';
    if (name.endsWith('.css')) lang = 'css';
    if (name.endsWith('.html')) lang = 'html';
    if (name.endsWith('.json')) lang = 'json';
    if (name.endsWith('Makefile')) lang = 'makefile';
    if (name.endsWith('.md')) lang = 'markdown';
    if (lang) ref.ace.session.setMode(`ace/mode/${lang}`);
  }, [name]);

  useEffect(() => {
    if (!ref.current || !ref.ace) return;

    if (ref.ace.session.highlightLineMarker) {
      ref.ace.session.removeMarker(ref.ace.session.highlightLineMarker);
    }

    if (highlightLine && highlightLine > -1) {
      ref.ace.session.highlightLineMarker = ref.ace.session.addMarker(
        new ace.Range(highlightLine, 0, highlightLine, Infinity),
        "ace-highlight-line",
        "fullLine"
      );
      ref.ace.scrollToLine(highlightLine, true, true, () => {});
    }
  }, [highlightLine]);

  useEffect(function() {
    if (!ref.ace) return;
    ref.ignorechange = true;
    ref.ace.setValue(code, -1);
    ref.ace.moveCursorTo(ref.pos.row, ref.pos.column);
    ref.ignorechange = false;
  }, [code]);

  useEffect(() => {
    if (!ref.ace) return;
    ref.ignorechange = true;
    ref.ace.setValue(code, -1);
    ref.ace.moveCursorTo(ref.pos.row, ref.pos.column);
    ref.ignorechange = false;
  }, [code]);

  useEffect(() => {
    if(!isHidden) {
      // force ace to rerender content
      ref.ace?.resize(true);
    }
  }, [isHidden])

  useEffect(() => {
    if(ref.ace && (moveToOffset?.offset ?? null) !== null) {
      const pos = ref.ace.session.getDocument().indexToPosition(moveToOffset.offset, 0);
      ref.ace.gotoLine(pos.row + 1, pos.column, true);

      if(moveToOffset.isHighlight) {
        const highlightMarkerId = ref.ace.session.addMarker(
          new ace.Range(pos.row, 0, pos.row, Infinity),
          "ace-highlight-line-tmp",
          "fullLine",
          true
        );

        setTimeout(() => {
          ref.ace.session.removeMarker(highlightMarkerId);
        }, 1500)
      }
    }
  }, [moveToOffset?.path, moveToOffset?.offset, moveToOffset?.isHighlight, moveToOffset?.timestamp, ref.ace])

  return html`<div class="ace-container" ref=${ref} />`;
};
