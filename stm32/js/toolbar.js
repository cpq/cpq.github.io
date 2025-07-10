import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Boards } from "./boards.js";

export function Toolbar({sigState}) {
  const onboard = (ev) => {
    const board = ev.target.value;
    localStorage.setItem('stm32_board', board);
    sigState.value = { ...sigState.value, board };
  };
  const onmicro = (ev) => {
    const micro = ev.target.value;
    localStorage.setItem('stm32_micro', micro);
    sigState.value = { ...sigState.value, micro };
  };

  return html`
<div class="flex justify-between items-center px-4 py-2 border-b">
  <div class="flex justify-between items-center gap-2">
    <${Button} title="build" disabled={!sigState.value.micro} />
    <${Button} title="flash" disabled={!sigState.value.micro} />
    <${Select} options=${Boards} classes="w-40" onchange=${onboard} value=${sigState.value.board} />
    <${Input} classes="w-40 ${sigState.value.board == 'custom' ? '' : 'hidden'}" placeholder="Type micro name" value=${sigState.value.micro} oninput=${onmicro} />
  <//>
  <span class="font-bold">STM32 baremetal project generator<//>
<//>`;
};
