// Copyright (c) 2025 Cesanta Software Ltd.
// All rights reserved.

"use strict";
import { h, html, render, useSignalEffect, useEffect, useRef, useSignal } from "./bundle.js";
import { Toolbar } from "./toolbar.js";
import { Sidebar } from "./sidebar.js";
import { Ace} from "./ace.js";

function Editor({sigState}) {
  const sigText = useSignal(sigState.value.files[sigState.value.file] || '');
  useEffect(function() {
    sigText.value = sigState.value.files[sigState.value.file] || ''
  }, [sigState.value.file, sigState.value.files]);

  return html`
<div class="flex-grow flex flex-col">
  <${Ace}
    code=${sigText.value}
    name=${sigState.value.file}
    readonly=${true}
    showGutter=${false}
  />
<//>`;
  // return html`<textarea class="w-full h-full p-2 outline-none bg-neutral-800 text-neutral-200 font-mono">${sigText.value}<//>`
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
