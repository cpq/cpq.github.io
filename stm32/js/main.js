// Copyright (c) 2025 Cesanta Software Ltd.
// All rights reserved.

"use strict";
import { h, html, render, useEffect, useSignalEffect, useSignal } from "./bundle.js";
import { Toolbar } from "./toolbar.js";
import { Sidebar } from "./sidebar.js";
import { Ace} from "./ace.js";
import { mountCmsis } from "./cmsis.js";

function appendLog(sigState, line) {
  const logs = [...(sigState.value.logs ?? []), line].slice(-200);
  sigState.value = { ...sigState.value, logs };
}

function hasCmsisFiles(files) {
  return Object.keys(files ?? {}).some((name) => name.startsWith("cmsis_"));
}

function persistentState(state) {
  const files = {};
  for (const [name, text] of Object.entries(state.files ?? {})) {
    if (!name.startsWith("cmsis_")) files[name] = text;
  }
  return { ...state, files, logs: (state.logs ?? []).slice(-50) };
}

function Editor({sigState}) {
  const file = sigState.value.file ?? '';
  const text = sigState.value.files?.[file] ?? '';

  return html`
<div class="flex-grow flex flex-col">
  <${Ace}
    code=${text}
    name=${file}
    readonly=${true}
    showGutter=${false}
  />
<//>`;
}

function Console({sigState}) {
  const logs = sigState.value.logs ?? [];
  return html` <div class="h-24 border-t overflow-auto p-2 font-mono text-xs whitespace-pre-wrap">
    ${logs.length ? logs.join("\n") : "Console..."}
  <//>`;
}

function App() {
  const sigState = useSignal(JSON.parse(localStorage.getItem("stm32_state") || "{}"));

  useEffect(() => {
    const mount = sigState.value.cmsisMount;
    if (!mount || hasCmsisFiles(sigState.value.files)) return;

    appendLog(sigState, `Restoring CMSIS for ${mount.micro}`);
    mountCmsis(mount.micro, mount.board, {
      log: (line) => appendLog(sigState, line),
    }).then((files) => {
      if (
        sigState.value.micro === mount.micro &&
        sigState.value.board === mount.board
      ) {
        sigState.value = {
          ...sigState.value,
          files: { ...(sigState.value.files ?? {}), ...files },
        };
        appendLog(sigState, "CMSIS restored");
      }
    }).catch((err) => {
      appendLog(sigState, `CMSIS restore error: ${err.message}`);
    });
  }, []);

  useSignalEffect(() => {
    localStorage.setItem("stm32_state", JSON.stringify(persistentState(sigState.value)));
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
