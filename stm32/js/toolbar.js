import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Boards } from "./boards.js";

export function Toolbar({sigState}) {
  const onboard = (ev) => {
    const board = ev.target.value;
    const micro =
      board == '' ? ''
      : board == 'custom' ? sigState.value.micro
      : Boards.find(x => x.name == board).micro;
    sigState.value = { ...sigState.value, board, micro, file: '' };
  };
  const onmicro = (ev) => {
    sigState.value = { ...sigState.value, micro: ev.target.value };
  };

  const boards = [
    ['', '-- select board --'],
    ['custom', 'custom board'],
    ...Boards.map(x => [x.name, `${x.name} (${x.description})`])
  ];

  const onnew = () => {
    sigState.value = { ...sigState.value, board: '', micro: '', file: '' };
  };

  return html`
<div class="flex justify-between items-center px-4 py-2 border-b">
  <div class="flex justify-between items-center gap-2">
    <${Button} title="new" onclick=${onnew} />
    <${Button} title="build" disabled={!sigState.value.micro} classes="hidden" />
    <${Button} title="flash" disabled={!sigState.value.micro} classes="hidden" />
    <${Select} options=${boards} classes="w-40" onchange=${onboard} value=${sigState.value.board} />
    <${Input} classes="w-32 ${sigState.value.board == '' ? 'hidden' : ''}" placeholder="stm32f756zg" value=${sigState.value.micro} oninput=${onmicro} disabled=${sigState.value.board != 'custom'} />
  <//>
  <span class="font-bold text-neutral-400">STM32 baremetal project generator<//>
<//>`;
};
