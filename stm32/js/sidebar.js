import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Series, Boards, Micros } from "./boards.js";
import { parseMicro, fetchFile } from "./file.js";

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
  const uarts = [
    ["none", "none"],
    ["UART1", "UART1"],
    ["UART2", "UART2"],
  ];
  const onretarget = (ev) => {
    sigState.value = { ...sigState.value, retarget: ev.target.value };
  };
  const onleds = (ev) => {
    // sigState.value = { ...sigState.value, leds: ev.target.value };
  };

  function refetchFiles() {
    const [family, series, flash] = parseMicro(sigState.value.micro);
    if (!family) return;
    const FILES = [
      "Makefile",
      `${series}/main.h`,
      "main.c",
      `${series}/hal.h`,
      "hal.c",
      "link.ld",
    ];
    const basename = name => name.replace(/^.+\//g, "")
    const files = {};
    for (const name of FILES) files[basename(name)] = '';
    Promise.all(FILES.map(name => fetchFile(name, sigState.value.micro)
          .then(text => files[basename(name)] = text)
    )).then(() => {
      sigState.value = { ...sigState.value, files };
    })
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
    ...Boards.map((x) => [x.name, `${x.name} (${x.description})`]),
  ];

  const series = [
    ["", "-- select --"],
    ...Object.keys(Series).map((name) =>
      h("optgroup", { label: `STM32 ${name.toUpperCase()}` }, []),
    ),
  ];
  // console.log(series.map(x => Array.isArray(x)));

  return html` <div class="py-2 border-b">
    <div class="font-bold bg-neutral-500 px-4 py-1 hidden">Settings<//>
    <div class="flex gap-2 items-center justify-between px-4 py-1 hidden">
      <div class="">Series<//>
      <${Select} options=${series} classes="w-28" value="stm32f7" />
    <//>
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
      <${Input}
        classes="w-28"
        placeholder="stm32f756zg"
        value=${sigState.value.micro}
        oninput=${onmicro}
        disabled=${sigState.value.board != "custom"}
      />
    <//>
    <div class="flex gap-2 items-center justify-between px-4 py-1 hidden">
      <div class="">Debug UART<//>
      <${Select}
        options=${uarts}
        classes="w-28"
        onchange=${onretarget}
        value=${sigState.value.retarget}
        disabled=${!sigState.value.micro}
      />
    <//>
    <div class="flex gap-2 items-center justify-between px-4 py-1 hidden">
      <div class="">LED pins<//>
      <${Input}
        classes="w-28"
        value=${"B0,B7,B14"}
        oninput=${onleds}
        disabled=${!sigState.value.micro}
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
