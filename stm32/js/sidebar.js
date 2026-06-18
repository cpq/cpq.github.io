import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input, Icon } from "./controls.js";
import { Boards, generateProjectFiles, getMicroList } from "./micro.js";
import { AutoComplete } from "./autocompl.js";

const MCU_LIST = getMicroList();

function makeTree(paths) {
  const root = { dirs: {}, files: [] };
  for (const path of paths.sort()) {
    const parts = path.split("/");
    const file = parts.pop();
    let node = root;
    for (const part of parts) {
      node = node.dirs[part] ??= { dirs: {}, files: [] };
    }
    node.files.push({ name: file, path });
  }
  return root;
}

function File({ name, path, level, sigState }) {
  const onclick = () => (sigState.value = { ...sigState.value, file: path });
  return html` <div
    class="pr-4 cursor-pointer ${sigState.value.file === path
      ? "bg-neutral-700"
      : ""}"
    style=${`padding-left:${12 + level * 14}px`}
    onclick=${onclick}
  >
    ${name}
  <//>`;
}

function Folder({ name, node, path, level, sigState }) {
  const isOpen = !!sigState.value.openDirs?.[path];
  const onclick = () => {
    sigState.value = {
      ...sigState.value,
      openDirs: { ...(sigState.value.openDirs ?? {}), [path]: !isOpen },
    };
  };
  return html`
    <div
      class="pr-4 cursor-pointer font-semibold text-neutral-300"
      style=${`padding-left:${12 + level * 14}px`}
      onclick=${onclick}
    >
      <span class="font-mono">${isOpen ? "[-]" : "[+]"}<//> ${name}/
    <//>
    ${isOpen ? h(Tree, { node, level: level + 1, base: path, sigState }) : null}
  `;
}

function Tree({ node, level, base, sigState }) {
  const dirs = Object.keys(node.dirs).sort();
  const files = node.files.sort((a, b) => a.name.localeCompare(b.name));
  return html`
    ${dirs.map((name) => {
      const path = base ? `${base}/${name}` : name;
      return h(Folder, { name, node: node.dirs[name], path, level, sigState });
    })}
    ${files.map((file) => h(File, { ...file, level, sigState }))}
  `;
}

function FileList({ sigState }) {
  const files = Object.keys(sigState.value.files ?? []);
  const tree = makeTree(files);
  return html` <div class="flex-grow overflow-auto py-2">
    <div
      class="font-bold border-b bg-neutral-800 px-4 py-1 flex items-center justify-between hidden"
    >
      <span>Project Files<//>
    <//>
    <${Tree} node=${tree} level=${0} base="" sigState=${sigState} />
  <//>`;
}

function ProjectSettings({ sigState }) {
  function refetchFiles(micro = sigState.value.micro, board = sigState.value.board) {
    if (!micro) return;
    generateProjectFiles(micro, board).then((files) => {
      if (sigState.value.micro === micro && sigState.value.board === board) {
        sigState.value = {
          ...sigState.value,
          files: { ...(sigState.value.files ?? {}), ...files },
        };
      }
    });
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
    sigState.value = { ...sigState.value, board, micro, files: {}, openDirs: {}, cmsisMount: null };
    refetchFiles(micro, board);
  };
  const onmicro = (ev) => {
    const micro = ev.target.value;
    sigState.value = { ...sigState.value, micro, files: {}, openDirs: {}, cmsisMount: null };
    refetchFiles(micro, sigState.value.board);
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

  const delay = (ms, value) => new Promise(r => setTimeout(r, ms, value));

  return html` <div class="py-2 border-b">
    <div class="font-bold bg-neutral-500 px-4 py-1 hidden">Settings<//>
    <div class="flex gap-2 items-center justify-between px-4 py-1">
      <div class="">Board<//>
      <${Button} icon=eye onclick=${ev => delay(500)}/>
      <${Select}
        options=${boards}
        classes="w-28"
        onchange=${onboard}
        value=${sigState.value.board}
      />
    <//>
    <div class="flex gap-2 items-center justify-between px-4 py-1">
      <div class="">MCU<//>
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
  return html` <div class="w-60 border-r flex flex-col">
    <${ProjectSettings} sigState=${sigState} />
    <${FileList} sigState=${sigState} />
  <//>`;
}
