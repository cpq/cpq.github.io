export const Boards = [
  { name: "Nucleo-F756ZG", micro: "stm32f756zg" },
  { name: "STM32H573I-DK", micro: "stm32h573ii" },
];

export const Micros = {
  f0: { arch: ["m0"] },
  f1: { arch: ["m3"] },
  f2: { arch: ["m3"] },
  f3: { arch: ["m4f"] },
  f4: { arch: ["m4f"] },
  f7: {
    arch: ["m7f"],
    cmsis_repo_version: "v1.2.10",
    cpu_flags: "-mcpu=cortex-m7 -mthumb -mfloat-abi=hard -mfpu=fpv5-sp-d16",
    uart: "USART3",
    leds: "B0,B7,B14",
    families: {
      22: [
        { models: "re,ve,ze,ie", ram: 256, flash: 512 },
        { models: "rc,vc,zc,ic", ram: 256, flash: 256 },
      ],
      23: [
        { models: "ve,ze,ie", ram: 256, flash: 512 },
        { models: "vc,zc,ic", ram: 256, flash: 256 },
      ],
      30: [{ models: "r8,v8,z8,n8", ram: 256, flash: 64 }],
      32: [{ models: "re,ve,ze,ie", ram: 256, flash: 512 }],
      33: [{ models: "ve,ze,ie", ram: 256, flash: 512 }],
      45: [
        { models: "ve,ze,ie", ram: 320, flash: 512 },
        { models: "vg,zg,ig", ram: 320, flash: 1024 },
      ],
      46: [
        { models: "ve,ze,ie,be,ne", ram: 320, flash: 512 },
        { models: "vg,zg,ig,bg,ng", ram: 320, flash: 1024 },
      ],
      50: [{ models: "v8,z8,n8", ram: 320, flash: 64 }],
      56: [{ models: "vg,zg,ig,bg,ng", ram: 320, flash: 1024 }],
      65: [
        { models: "vg,zg,ig,bg,ng", ram: 512, flash: 1024 },
        { models: "vi,zi,ii,bi,ni", ram: 512, flash: 2048 },
      ],
      67: [
        { models: "vg,zg,ig,bg,ng", ram: 512, flash: 1024 },
        { models: "vi,zi,ii,bi,ni", ram: 512, flash: 2048 },
      ],
      69: [
        { models: "ig,bg,ng", ram: 512, flash: 1024 },
        { models: "ii,ai,bi,ni", ram: 512, flash: 2048 },
      ],
      77: [{ models: "vi,zi,ii,bi,ni", ram: 512, flash: 2048 }],
      79: [{ models: "ii,ai,bi,ni", ram: 512, flash: 2048 }],
    },
  },
  h7: { arch: ["m4f", "m7f"] },
  h5: { arch: ["m33f"] },
  u0: { arch: ["m0"] },
  c0: { arch: ["m0+"] },
  g0: { arch: ["m0+"] },
  g4: {
    arch: ["m4f"],
    cmsis_repo_version: "v1.2.5",
    cpu_flags: "-mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16",
    uart: "USART3",
    leds: "B0,B7,B13",
    families: {
      31: [
        { models: "k6,c6,r6,m6,v6", ram: 32, flash: 32 },
        { models: "k8,c8,r8,m8,v8", ram: 32, flash: 64 },
        { models: "kb,cb,rb,mb,vb", ram: 32, flash: 128 },
      ],
      41: [{ models: "kb,cb,rb,mb,vb", ram: 32, flash: 128 }],
      91: [
        { models: "kc,cc,rc,mc,vc", ram: 112, flash: 256 },
        { models: "ke,ce,re,me,ve", ram: 112, flash: 512 },
      ],
      a1: [{ models: "ke,ce,re,me,ve", ram: 112, flash: 512 }],
      73: [
        { models: "cb,rb,mb,vb,pb,qb", ram: 128, flash: 128 },
        { models: "cc,rc,mc,vc,pc,qc", ram: 128, flash: 256 },
        { models: "ce,re,me,ve,pe,qe", ram: 128, flash: 512 },
      ],
      83: [{ models: "ce,re,me,ve,pe,qe", ram: 128, flash: 512 }],
      74: [
        { models: "cb,rb,mb,vb,pb,qb", ram: 128, flash: 128 },
        { models: "cc,rc,mc,vc,pc,qc", ram: 128, flash: 256 },
        { models: "ce,re,me,ve,pe,qe", ram: 128, flash: 512 },
      ],
      84: [{ models: "ce,re,me,ve,pe,qe", ram: 128, flash: 512 }],
    },
  },
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

function makeDefinitions(m) {
  const lines = [];
  if (m.uart) lines.push(`#define UART_DEBUG ${m.uart}`);
  if (m.leds) lines.push(...m.leds.split(',')
    .map((led, i) => `#define LED${i+1} PIN('${led[0]}', ${led[1]}${led[2] ||''})`));
  // console.log(m, lines);
  return lines.join('\n');
};

export function getMicroList() {
  const result = [];
  for (const [seriesName, series] of Object.entries(Micros)) {
    for (const [familyName, family] of Object.entries(series.families ?? {})) {
      for (const variant of family) {
        const mcus = variant.models.split(',').map(
          (m) => `stm32${seriesName}${familyName}${m}`,
        );
        result.push(...mcus);
      }
    }
  }
  return result;
}

export function getMicro(name) {
  const x = name.match(/^stm32(..)(..)(..)/) || [];
  const s = Micros[x[1]];
  const f = s?.families?.[x[2]];
  const m = f?.find((a) => a.models.split(',').includes(x[3]));
  if (!m) return null;
  return {
    name,
    series: x[1],
    family: x[2],
    model: x[3],
    cmsis_repo_version: s.cmsis_repo_version,
    cpu_flags: s.cpu_flags,
    ram: m.ram,
    flash: m.flash,
    leds: s.leds,
    uart: s.uart,
  };
}

function expandSubstitutions(text, micro) {
  const m = getMicro(micro);
  if (!m) return text;
  const substitutions = {
    MCU_FAMILY: m.family,
    MCU_SERIES: m.series,
    MCU_CFLAGS: m.cpu_flags,
    MCU_FLASH_SIZE: m.flash,
    MCU_RAM_SIZE: m.ram,
    MCU_CMSIS_REPO_VERSION: m.cmsis_repo_version,
    MCU_MAIN_DEFINES: makeDefinitions(m),
  };
  for (const [key, value] of Object.entries(substitutions)) {
    text = text.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
  }
  return text;
}

const fetchFile = (name, micro) =>
  fetch(`files/${name}`)
    .then((x) => x.text())
    .then((text) => expandSubstitutions(text, micro));

export function generateProjectFiles(micro) {
  const m = getMicro(micro);
  if (!m) return Promise.resolve({});
  const FILES = [
    "Makefile",
    // `${m.series}/main.h`,
    "main.c",
    `${m.series}/hal.h`,
    "hal.c",
    "link.ld",
  ];
  const basename = (name) => name.replace(/^.+\//g, "");
  const files = {};
  for (const name of FILES) files[basename(name)] = "";
  return Promise.all(
    FILES.map((name) =>
      fetchFile(name, micro).then((text) => (files[basename(name)] = text)),
    ),
  ).then(() => files);
}
