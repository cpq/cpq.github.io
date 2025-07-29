# Copyright (c) 2025 Cesanta Software Limited
# Environment setup: https://mongoose.ws/documentation/tutorials/tools/

CFLAGS  = -W -Wall -Wextra -Wundef -Wshadow -Wdouble-promotion
CFLAGS += -Wformat-truncation -fno-common -Wconversion -Wno-sign-conversion
CFLAGS += -g3 -Os -ffunction-sections -fdata-sections
CFLAGS += -I. -Icmsis_core/CMSIS/Core/Include -Icmsis_${MCU_SERIES}/Include
CFLAGS += ${MCU_CFLAGS} $(CFLAGS_EXTRA)
LDFLAGS ?= -Tlink.ld -nostdlib -nostartfiles --specs nosys.specs -lc -lgcc -Wl,--gc-sections -Wl,-Map=$@.map

SOURCES = main.c hal.c
SOURCES += cmsis_${MCU_SERIES}/Source/Templates/gcc/startup_stm32${MCU_SERIES}${MCU_FAMILY}xx.s

all: firmware.bin

firmware.elf: cmsis_core cmsis_${MCU_SERIES} hal.h main.h link.ld Makefile $(SOURCES)
	arm-none-eabi-gcc $(SOURCES) $(CFLAGS) $(CFLAGS_EXTRA) $(LDFLAGS) -o $@

firmware.bin: firmware.elf
	arm-none-eabi-objcopy -O binary $< $@

flash: firmware.bin
	STM32_Programmer_CLI -c port=swd -e all -w $< 0x8000000 -hardRst

cmsis_core:
	git clone -q -c advice.detachedHead=false --depth 1 -b 5.9.0 https://github.com/ARM-software/CMSIS_5 $@

cmsis_${MCU_SERIES}:
	git clone -q -c advice.detachedHead=false --depth 1 -b ${MCU_CMSIS_REPO_VERSION} https://github.com/STMicroelectronics/cmsis_device_${MCU_SERIES} $@

clean:
	rm -rf firmware.* cmsis_*
