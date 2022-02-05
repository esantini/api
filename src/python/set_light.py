#!/usr/bin/python
import sys
import RPi.GPIO as GPIO
from datetime import datetime

led_pin = 22 # LED light

if __name__ == '__main__':
	# initialisieren
	GPIO.setmode(GPIO.BOARD)
	GPIO.setwarnings(False)

	# blinking light
	GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)

	isLightOn = sys.argv[1]

	print(isLightOn)
	sys.stdout.flush()

	if isLightOn == 'true':
		GPIO.output(led_pin, GPIO.HIGH) # Turn on
	else:
		GPIO.output(led_pin, GPIO.LOW) # Turn off