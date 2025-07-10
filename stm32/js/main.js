// Copyright (c) 2025 Cesanta Software Ltd.
// All rights reserved.

"use strict";
import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Files } from "./files.js";
import { Toolbar } from "./toolbar.js";

function getMicro(sigState) {
  const { board, micro } = sigState.value;
  return !board && board !== "custom" ? board : micro;
}

const File = (name) => html`<div>${name}</div>`;

function Sidebar() {
  return html` <div class="w-64 px-4 py-2 border-r flex flex-col">
    ${Object.keys(Files).map((file) => html`<${File} name=${name} />`)}
  <//>`;
}

function Editor() {
  return html` <div class="flex flex-grow h">Editor...<//>`;
}

function Console() {
  return html` <div class="h-24 border-t">Console...<//>`;
}

function App() {
  const sigState = useSignal({
    board: localStorage.getItem("stm32_board") || "",
    micro: localStorage.getItem("stm32_micro") || "",
  });
  console.log(sigState.value);
  return html` <div
    class="h-full flex flex-col bg-neutral-800 text-slate-200 text-sm"
  >
    <${Toolbar} sigState=${sigState} />
    <div class="h-full flex">
      <${Sidebar} />
      <div class="flex-grow flex flex-col">
        <${Editor} />
        <${Console} />
      <//>
    <//>
  <//>`;
}

window.onload = () => render(h(App), document.body);
