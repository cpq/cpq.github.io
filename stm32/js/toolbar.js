import { h, html, render, useEffect, useRef, useSignal } from "./bundle.js";
import { Select, Button, Input } from "./controls.js";
import { mountCmsis } from "./cmsis.js";

function appendLog(sigState, line) {
  const logs = [...(sigState.value.logs ?? []), line].slice(-200);
  sigState.value = { ...sigState.value, logs };
}

async function writeDirectoryFile(handle, name, text) {
  const parts = name.split("/");
  const file = parts.pop();
  for (const part of parts) handle = await handle.getDirectoryHandle(part, { create: true });
  const fileHandle = await handle.getFileHandle(file, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
}

export function Toolbar({ sigState }) {
  const onnew = () => {
    sigState.value = {
      ...sigState.value,
      board: "",
      micro: "",
      file: "",
      files: {},
      logs: [],
      cmsisMount: null,
    };
  };

  const files = Object.keys(sigState.value.files || {});

  const ondownload = (ev) => {
    if (window.showDirectoryPicker) {
      window.showDirectoryPicker({ mode: "readwrite" }).then((handle) =>
        Promise.all(
          files.map((name) => {
            const text = sigState.value.files[name];
            return writeDirectoryFile(handle, name, text);
          }),
        ),
      );
    } else {
      var zip = new JSZip();
      for (const name of files) {
        zip.file(`stm32/${name}`, sigState.value.files[name]);
      }
      Promise.resolve()
        .then(() => zip.generateAsync({ type: "uint8array" }))
        .then((blob) => {
          let a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([blob]));
          a.download = "stm32.zip";
          a.click();
        });
    }
  };

  const onbuild = () => {
    const { micro, board } = sigState.value;
    appendLog(sigState, `Preparing CMSIS for ${micro}`);
    return mountCmsis(micro, board, {
      log: (line) => appendLog(sigState, line),
    }).then((files) => {
      if (sigState.value.micro === micro && sigState.value.board === board) {
        sigState.value = {
          ...sigState.value,
          cmsisMount: { micro, board },
          files: { ...(sigState.value.files ?? {}), ...files },
        };
        appendLog(sigState, "CMSIS ready");
      }
    }).catch((err) => {
      appendLog(sigState, `CMSIS error: ${err.message}`);
    });
  };

  return html` <div class="flex items-center px-4 py-2 border-b gap-4">
    <div class="flex items-center gap-2 flex-grow">
      <${Button} title="new" onclick=${onnew} />
      <${Button} title="build" disabled=${!sigState.value.micro} onclick=${onbuild} />
      <${Button} title="flash" disabled="{!sigState.value.micro}" />
      <${Button}
        title="save"
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
