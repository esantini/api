#!/usr/bin/python
import sys
import time
import RPi.GPIO as GPIO
from datetime import datetime

backlight_button = 7
enter_button = 12
select_button = 11

if __name__ == '__main__':
	# initialisieren
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BOARD)

	# blinking light
	GPIO.setup(backlight_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)
	GPIO.setup(enter_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)
	GPIO.setup(select_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)

	while True:
		if not GPIO.input(backlight_button):
			print('backlight')
			sys.stdout.flush()
		if not GPIO.input(enter_button):
			print('enter')
			sys.stdout.flush()
		if not GPIO.input(select_button):
			print('select')
			sys.stdout.flush()
		time.sleep(.1)
	GPIO.output(button_pin, GPIO.LOW) # Turn off	

	GPIO.cleanup()