import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Micros } from "./boards.js";

function File({ name, sigState }) {
  const onclick = () => sigState.value = { ...sigState.value, file: name };
  return html`
<div class="px-4 cursor-pointer ${sigState.value.file === name ? 'bg-neutral-700' : ''}" onclick=${onclick}>
  ${name.replace(/^.+\//g, '')}
<//>`;
};

function FileList({sigState}) {
  // const sigFiles = useSignal([]);
  // useEffect(async function() {
  //   sigFiles.value = Micros[sigState.value.micro]?.files || [];
  // }, [sigState.value.micro]);
  // console.log(123, sigFiles.value);
  const files = Micros[sigState.value.micro]?.files || [];

  const ondownload = async ev => {
    var zip = new JSZip();
    Promise.all(files.map(name => fetch(`files/${name}`)
          .then(x => x.text())
          .then(text => zip.file(`stm32/${name.replace(/^.+\//g, '')}`, text))
    )).then(() => zip.generateAsync({type : "uint8array"}))
    .then(blob => {
      // console.log(blob);
      let a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([blob]));
      a.download = 'stm32.zip';
      a.click();
    });
  }

  return html`
<div class="h-64 overflow-auto border-b">
  <div class="font-bold border-b bg-neutral-800 px-4 py-1 flex items-center justify-between">
    <span>Project Files<//>
    <${Button} title="download .zip" disabled=${files.length == 0} onclick=${ondownload} />
  <//>
  ${files.map((name) => h(File, {name, sigState}))}
<//>`;
};

function ProjectSettings({sigState}) {
  const uarts = [['none', 'none'], ['UART1', 'UART1'], ['UART2', 'UART2']];
  const onretarget = (ev) => {
    sigState.value = { ...sigState.value, retarget: ev.target.value };
  };
  return html`
<div class="flex-grow overflow-auto">
  <div class="font-bold bg-neutral-500 px-4 py-1">Project settings<//>
  <div class="flex gap-2 items-center justify-between px-4 py-1">
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
