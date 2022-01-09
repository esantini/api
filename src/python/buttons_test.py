#!/usr/bin/python
import sys
import time
import RPi.GPIO as GPIO
from datetime import datetime

enter_button = 5
select_button = 3
buzz_pin = 13
led_pin = 22 # LED light

if __name__ == '__main__':
	# initialisieren
	GPIO.setwarnings(False)
	GPIO.setmode(GPIO.BOARD)

	# blinking light
	GPIO.setup(enter_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)
	GPIO.setup(select_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)
	GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)
	GPIO.setup(buzz_pin, GPIO.OUT, initial=GPIO.LOW)


	GPIO.output(led_pin, GPIO.HIGH) # Turn on
	time.sleep(1)
	GPIO.output(led_pin, GPIO.LOW) # Turn off
	
	while True:
		if not GPIO.input(enter_button):
			GPIO.output(led_pin, GPIO.HIGH) # Turn on
		else:
			GPIO.output(led_pin, GPIO.LOW) # Turn off

		if not GPIO.input(select_button):
			GPIO.output(buzz_pin, GPIO.HIGH) # Turn on
		else:
			GPIO.output(buzz_pin, GPIO.LOW) # Turn off

		time.sleep(.1)

	GPIO.cleanup()