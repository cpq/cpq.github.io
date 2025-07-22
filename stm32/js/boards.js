export const Boards = [
  {name: 'Nucleo-F756ZG', micro: 'stm32f756zg', description: 'M7 @ 216 MHz, 320K RAM, 1024K Flash', },
  {name: 'STM32H573I-DK', micro: 'stm32h573ii', description: 'M33 @ 250 MHz, 640K RAM, 2048K Flash', },
];

export const Micros = {
  stm32f756zg: { files: ['main.c', 'f7/Makefile'] },
  stm32h573ii: { files: ['main.c', 'h5/Makefile'] },
};

export const Boards2 = [
  ['', '-- select board --'],
  ['custom', 'custom board'],

  // f207: { description: 'Nucleo-F207ZG (M3 @ 120 MHz, 128K RAM, 1024K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // f429: { description: 'Nucleo-F429ZI (M4 @ 180 MHz, 256K RAM, 2048K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // f439: { description: 'Nucleo-F439ZI (M4 @ 180 MHz, 256K RAM, 2048K Flash)', ides: ['GCC+make', 'CubeIDE'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // f746: { description: 'Nucleo-F746ZG (M7 @ 216 MHz, 320K RAM, 1024K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  ['stm32f756zg', 'Nucleo-F756ZG (M7 @ 216 MHz, 320K RAM, 1024K Flash)'],
  // f767: { description: 'Nucleo-F767ZI (M7 @ 216 MHz, 512K RAM, 2048K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h563: { description: 'Nucleo-H563ZI (M33 @ 250 MHz, 640K RAM, 2048K Flash)',ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  ['stm32h573ii', 'STM32H573I-DK (M33 @ 250 MHz, 640K RAM, 2048K Flash)'],
  // h723: { description: 'Nucleo-H723ZG (M7 @ 480 MHz, 562K RAM, 1024K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h735: { description: 'STM32H735G-DK (M7 @ 550 MHz, 564K RAM, 1024K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h743: { description: 'Nucleo-H743ZI (M7 @ 480 MHz, 1024K RAM, 2048K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h745: { description: 'STM32H745I-DISCO (M7 @ 480 MHz, 1024K RAM, 2048K Flash)', cores: ['CM7', 'CM4'], ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h747: { description: 'STM32H747I-DISCO (M7 @ 480 MHz, 1024K RAM, 2048K Flash)', cores: ['CM7', 'CM4'], ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h753: { description: 'Nucleo-H753ZI (M7 @ 480 MHz, 1024K RAM, 2048K Flash)', ides: ['GCC+make', 'CubeIDE', 'Zephyr'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h755: { description: 'Nucleo-H755ZI-Q (M7 @ 480 MHz, 1024K RAM, 2048K Flash)', cores: ['CM7', 'CM4'], ides: ['GCC+make', 'CubeIDE'], rtoses: ['baremetal', 'FreeRTOS'], flasher: 'stlink'},
  // h7s3l8: {description: 'Nucleo-H7S3L8 (M7 @ 600 MHz, 620K RAM, 64K Flash)', ides: ['GCC+make'], rtoses: ['baremetal']},
];
