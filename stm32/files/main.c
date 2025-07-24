// Copyright (c) 2025 Cesanta Software Limited
// All rights reserved

#include "main.h"
#include "hal.h"

int main(void) {
  clock_init();
  rng_init();
  uart_init(UART_DEBUG, 115200);

  uint64_t blink_timer = 0;
  for (;;) {
    if (timer_expired(&blink_timer, 500, hal_get_tick())) {
      gpio_toggle(LED2);
      printf("Tick: %lu\r\n", (unsigned long) hal_get_tick());
    }
  }

  return 0;
}
