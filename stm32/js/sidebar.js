import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Boards, generateProjectFiles, getMicroList } from "./micro.js";
import { AutoComplete } from "./autocompl.js";

const MCU_LIST = getMicroList();

function File({ name, sigState }) {
  const onclick = () => (sigState.value = { ...sigState.value, file: name });
  return html` <div
    class="px-4 cursor-pointer ${sigState.value.file === name
      ? "bg-neutral-700"
      : ""}"
    onclick=${onclick}
  >
    ${name.replace(/^.+\//g, "")}
  <//>`;
}

function FileList({ sigState }) {
  const files = Object.keys(sigState.value.files ?? []);
  return html` <div class="flex-grow overflow-auto py-2">
    <div
      class="font-bold border-b bg-neutral-800 px-4 py-1 flex items-center justify-between hidden"
    >
      <span>Project Files<//>
    <//>
    ${files.map((name) => h(File, { name, sigState }))}
  <//>`;
}

function ProjectSettings({ sigState }) {
  function refetchFiles() {
    sigState.value.micro && generateProjectFiles(sigState.value.micro).then(
      (files) => (sigState.value = { ...sigState.value, files }),
    );
  }

  useEffect(() => {
    refetchFiles();
  }, []);

  const onboard = (ev) => {
    const board = ev.target.value;
    const micro =
      board == ""
        ? ""
        : board == "custom"
          ? sigState.value.micro
          : Boards.find((x) => x.name == board).micro;
    sigState.value = { ...sigState.value, board, micro, file: "", files: [] };
    refetchFiles();
  };
  const onmicro = (ev) => {
    sigState.value = { ...sigState.value, micro: ev.target.value, files: [] };
    refetchFiles();
  };

  const boards = [
    ["", "-- select --"],
    ["custom", "custom board"],
    ...Boards.map((x) => [x.name, `${x.name}`]),
  ];

  // const series = [
  //   ["", "-- select --"],
  //   ...Object.keys(Micros).map((name) =>
  //     h("optgroup", { label: `STM32 ${name.toUpperCase()}` }, []),
  //   ),
  // ];
  // console.log(series.map(x => Array.isArray(x)));

  return html` <div class="py-2 border-b">
    <div class="font-bold bg-neutral-500 px-4 py-1 hidden">Settings<//>
    <div class="flex gap-2 items-center justify-between px-4 py-1">
      <div class="">Board<//>
      <${Select}
        options=${boards}
        classes="w-28"
        onchange=${onboard}
        value=${sigState.value.board}
      />
    <//>
    <div class="flex gap-2 items-center justify-between px-4 py-1">
      <div class="">Microcontroller<//>
      <${AutoComplete}
        options=${MCU_LIST}
        classes="w-28 ${Object.keys(sigState.value.files ?? {}).length > 0 ? '' : 'border border-red-500 bg-red-100'}"
        placeholder="stm32f756zg"
        value=${sigState.value.micro}
        oninput=${onmicro}
        disabled=${sigState.value.board != "custom"}
      />
    <//>
  <//>`;
}

export function Sidebar({ sigState }) {
  return html` <div class="w-64 border-r flex flex-col">
    <${ProjectSettings} sigState=${sigState} />
    <${FileList} sigState=${sigState} />
  <//>`;
}
