import { Series } from "./boards.js";

export const parseMicro = (micro) => {
  const m = micro.match(/^stm32((..)..)(.)(.)/);
  return m ? [m[1], m[2], m[4]] : [];
};

const FLASH_SIZES = {
  4: "16k",
  6: "32k",
  8: "64k",
  B: "128k",
  C: "256k",
  D: "384k",
  E: "512k",
  F: "768k",
  G: "1024k",
  H: "1536k",
  I: "2048k",
};

function expandSubstitutions(text, micro) {
  const [family, series, flash] = parseMicro(micro);
  const substitutions = {
    MCU_FAMILY: family,
    MCU_SERIES: series,
    MCU_CFLAGS: Series[series]?.cpu_flags,
    MCU_FLASH_SIZE: FLASH_SIZES[flash.toUpperCase()] || "16k",
    MCU_RAM_SIZE: Series[series]?.ram_size,
    MCU_CMSIS_REPO_VERSION: Series[series]?.cmsis_repo_version,
  };
  for (const [key, value] of Object.entries(substitutions)) {
    text = text.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
  }
  return text;
}

export function getMicroSeries(micro) {
  const [family, series, flash] = parseMicro(micro);
  return Series[series];
}

export const fetchFile = (name, micro) =>
  fetch(`files/${name}`)
    .then((x) => x.text())
    .then((text) => expandSubstitutions(text, micro));
