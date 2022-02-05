#!/usr/bin/python
import sys
from time import sleep
import RPi.GPIO as GPIO
from datetime import datetime
from RPLCD import i2c

# constants to initialise the LCD
lcdmode = 'i2c'
cols = 20
rows = 4
charmap = 'A00'
i2c_expander = 'PCF8574'

# Generally 27 is the address;Find yours using: i2cdetect -y 1 
address = 0x27 
port = 1 # 0 on an older Raspberry Pi

# Initialise the LCD
lcd = i2c.CharLCD(i2c_expander, address, port=port, charmap=charmap,
                  cols=cols, rows=rows)

button_pin = 7

GPIO.setmode(GPIO.BOARD)

# blinking light
GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:
	if not GPIO.input(button_pin):
		lcd.backlight_enabled = not lcd.backlight_enabled
		sleep(1)
	sleep(.1)
GPIO.output(button_pin, GPIO.LOW) # Turn off	

GPIO.cleanup()


