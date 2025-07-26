export const Boards = [
  {
    name: "Nucleo-F756ZG",
    micro: "stm32f756zg",
    description: "M7 @ 216 MHz, 320K RAM, 1024K Flash",
  },
  {
    name: "STM32H573I-DK",
    micro: "stm32h573ii",
    description: "M33 @ 250 MHz, 640K RAM, 2048K Flash",
  },
];

export const Micros = {
  stm32f756zg: {
    files: [
      "Makefile",
      "f7/main.h",
      "main.c",
      "f7/hal.h",
      "hal.c",
      "f7/link.ld",
    ],
  },
  stm32h573ii: { files: ["h5/Makefile", "main.c"] },
};

export const Series = {
  f0: { arch: ["m0"] },
  f1: { arch: ["m3"] },
  f2: { arch: ["m3"] },
  f3: { arch: ["m4f"] },
  f4: { arch: ["m4f"] },
  f7: {
    arch: ["m7f"],
    cmsis_repo_version: "v1.2.10",
    ram_size: '320k',
    cpu_flags: "-mcpu=cortex-m7 -mthumb -mfloat-abi=hard -mfpu=fpv5-sp-d16",
  },
  h7: { arch: ["m4f", "m7f"] },
  h5: { arch: ["m33f"] },
  u0: { arch: ["m0"] },
  c0: { arch: ["m0+"] },
  g0: { arch: ["m0+"] },
  g4: { arch: ["m4f"] },
  l0: { arch: ["m0+"] },
  l1: { arch: ["m3"] },
  l4: { arch: ["m4f"] },
  l4plus: { arch: ["m4f"] },
  l5: { arch: ["m33f"] },
  u0: { arch: ["m0+"] },
  u5: { arch: ["m33f"] },
  wl: { arch: ["m0+", "m4"] },
  wb: { arch: ["m0"] },
  wb0: { arch: ["m0+", "m4f"] },
  wba: { arch: ["m33f"] },
  n6: { arch: ["m55f"] },
};
