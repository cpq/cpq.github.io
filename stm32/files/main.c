// Copyright (c) 2025 Cesanta Software Limited
// All rights reserved

#include "hal.h"

${MCU_MAIN_DEFINES}

int _write(int fd, char *ptr, int len) {
  if (fd == 1) uart_write_buf(UART_DEBUG, ptr, (size_t) len);
  return len;
}

static void blink_task(void) {
  static uint64_t blink_timer = 0;
  if (timer_expired(&blink_timer, 500, hal_get_tick())) {
    gpio_toggle(LED1);
    printf("Tick: %lu\r\n", (unsigned long) hal_get_tick());
  }
}

int main(void) {
  clock_init();
  rng_init();
  gpio_output(LED1);
  uart_init(UART_DEBUG, 115200);

  for (;;) {
    blink_task();
  }

  return 0;
}
