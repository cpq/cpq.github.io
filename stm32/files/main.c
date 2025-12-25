// Copyright (c) 2025 Cesanta Software Limited
// All rights reserved

#include "hal.h"

${MCU_MAIN_DEFINES}

int _write(int fd, char *ptr, int len) {
  if (fd == 1) hal_uart_write_buf(DEBUG_UART, ptr, (size_t) len);
  return len;
}

static void blink_task(void) {
  static uint64_t blink_timer = 0;
  if (hal_timer_expired(&blink_timer, 500, hal_get_tick())) {
    hal_gpio_toggle(LED1);
    printf("Tick: %lu\r\n", (unsigned long) hal_get_tick());
  }
}

int main(void) {
  hal_clock_init();
  hal_rng_init();
  hal_gpio_output(LED1);
  hal_uart_init(DEBUG_UART, 115200);
  printf("Initialised. CPU clock: %lu\r\n", SystemCoreClock / 1000000);

  for (;;) {
    blink_task();
  }

  return 0;
}
