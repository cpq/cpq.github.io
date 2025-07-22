import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Boards } from "./boards.js";

export function Toolbar({sigState}) {
  const onboard = (ev) => {
    const board = ev.target.value;
    const micro = Boards.find(x => x.name == board)?.micro || sigState.value.micro || '';
    sigState.value = { ...sigState.value, board, micro };
  };
  const onmicro = (ev) => {
    sigState.value = { ...sigState.value, micro: ev.target.value };
  };

  const boards = [
    ['', '-- select board --'],
    ['custom', 'custom board'],
    ...Boards.map(x => [x.name, `${x.name} (${x.description})`])
  ];

  return html`
<div class="flex justify-between items-center px-4 py-2 border-b">
  <div class="flex justify-between items-center gap-2">
    <${Button} title="build" disabled={!sigState.value.micro} />
    <${Button} title="flash" disabled={!sigState.value.micro} />
    <${Select} options=${boards} classes="w-40" onchange=${onboard} value=${sigState.value.board} />
    <${Input} classes="w-40 ${sigState.value.board == '' ? 'hidden' : ''}" placeholder="stm32f756zg" value=${sigState.value.micro} oninput=${onmicro} disabled=${sigState.value.board != 'custom'} />
  <//>
  <span class="font-bold">STM32 baremetal project generator<//>
<//>`;
};
