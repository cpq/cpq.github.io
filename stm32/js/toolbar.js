import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { Boards, Micros } from "./boards.js";

export function Toolbar({ sigState }) {
  const onnew = () => {
    sigState.value = { ...sigState.value, board: "", micro: "", file: "", files: {} };
  };

  const files = Object.keys(sigState.value.files || {});

  const ondownload = (ev) => {
    if (window.showDirectoryPicker) {
      window.showDirectoryPicker({ mode: "readwrite" }).then((handle) =>
        Promise.all(
          files.map((name) => {
            const text = sigState.value.files[name];
            handle
              .getFileHandle(name, { create: true })
              .then((fileHandle) => fileHandle.createWritable())
              .then((writable) =>
                writable.write(text).then(() => writable.close()),
              );
          }),
        ),
      );
    } else {
      var zip = new JSZip();
      Promise.all(
        files.map((name) =>
          fetch(`files/${name}`)
            .then((x) => x.text())
            .then((text) =>
              zip.file(`stm32/${name.replace(/^.+\//g, "")}`, text),
            ),
        ),
      )
        .then(() => zip.generateAsync({ type: "uint8array" }))
        .then((blob) => {
          let a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([blob]));
          a.download = "stm32.zip";
          a.click();
        });
    }
  };

  return html` <div class="flex items-center px-4 py-2 border-b gap-4">
    <div class="flex items-center gap-2 flex-grow">
      <${Button} title="new" onclick=${onnew} />
      <${Button} title="build" disabled="{!sigState.value.micro}" />
      <${Button} title="flash" disabled="{!sigState.value.micro}" />
      <${Button}
        title=${window.showDirectoryPicker
          ? "download project"
          : "download project .zip"}
        disabled=${files.length == 0}
        onclick=${ondownload}
      />
    <//>
    <div class="flex items-center gap-2">
      <span class="font-bold text-neutral-400">STM32 baremetal IDE<//>
      <img
        src="https://mongoose.ws/images/logo.svg"
        height="32"
        width="32"
        alt="Mongoose Logo"
      />
    <//>
  <//>`;
}
