#!/usr/bin/python
import sys
import time
import RPi.GPIO as GPIO
from datetime import datetime

button_pin = 5
led_pin = 22 # LED light

if __name__ == '__main__':
	# initialisieren
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BOARD)

	# blinking light
	GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
	GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)

	while True:
		if not GPIO.input(button_pin):
			print('hello')
			sys.stdout.flush()
			time.sleep(1)
		time.sleep(.1)
	GPIO.output(button_pin, GPIO.LOW) # Turn off	

	GPIO.cleanup()