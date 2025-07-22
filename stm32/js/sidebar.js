import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Micros } from "./boards.js";

function File({ name, sigState }) {
  const onclick = () => sigState.value = { ...sigState.value, file: name };
  return html`
<div class="px-3 cursor-pointer ${sigState.value.file === name ? 'bg-neutral-700' : ''}" onclick=${onclick}>
  ${name.replace(/^.+\//g, '')}
<//>`;
};

function FileList({sigState}) {
  const sigFiles = useSignal([]);
  useEffect(async function() {
    sigFiles.value = Micros[sigState.value.micro]?.files || [];
  }, [sigState.value.micro]);
  return html`
<div class="h-64 overflow-auto border-b">
  <div class="font-bold bg-neutral-500 px-3 py-1">Project Files<//>
  ${sigFiles.value.map((name) => h(File, {name, sigState}))}
<//>`;
};

function ProjectSettings({sigState}) {
  const uarts = [['none', 'none'], ['UART1', 'UART1'], ['UART2', 'UART2']];
  const onretarget = (ev) => {
    sigState.value = { ...sigState.value, retarget: ev.target.value };
  };
  return html`
<div class="flex-grow overflow-auto">
  <div class="font-bold bg-neutral-500 px-3 py-1">Project settings<//>
  <div class="flex gap-2 items-center justify-between px-3 py-1">
    <div class="">Redirect printf to<//>
    <${Select} options=${uarts} classes="w-24" onchange=${onretarget} value=${sigState.value.retarget} />
  <//>
<//>`;
};

export function Sidebar({sigState}) {
  return html`
<div class="w-64 border-r flex flex-col">
  <${FileList} sigState=${sigState} />
  <${ProjectSettings} sigState=${sigState} />
 <//>`;
}
