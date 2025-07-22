// Copyright (c) 2025 Cesanta Software Ltd.
// All rights reserved.

"use strict";
import { h, html, render, useSignalEffect, useEffect, useRef, useSignal } from "./bundle.js";
import { Toolbar } from "./toolbar.js";
import { Sidebar } from "./sidebar.js";

function Editor({sigState}) {
  const sigText = useSignal('');
  useEffect(function() {
    sigState.value.file && fetch('files/' + sigState.value.file)
        .then(x => x.text())
        .then(text => sigText.value = text);
  }, [sigState.value.file]);

  return html`
<pre class="flex flex-grow overflow-auto p-2">
  ${sigText.value}
<//>`;
}

function Console() {
  return html` <div class="h-24 border-t">Console...<//>`;
}

function App() {
  const sigState = useSignal(JSON.parse(localStorage.getItem("stm32_state") || "{}"));

  useSignalEffect(() => {
    localStorage.setItem("stm32_state", JSON.stringify(sigState.value));
  }, [sigState.value]);

  // console.log(sigState.value);
  return html` <div
    class="h-full flex flex-col bg-neutral-800 text-slate-200 text-sm"
  >
    <${Toolbar} sigState=${sigState} />
    <div class="h-full flex">
      <${Sidebar} sigState=${sigState} />
      <div class="flex-grow flex flex-col">
        <${Editor} sigState=${sigState} />
        <${Console} sigState=${sigState} />
      <//>
    <//>
  <//>`;
}

window.onload = () => render(h(App), document.body);
