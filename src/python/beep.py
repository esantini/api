#!/usr/bin/python
import time
import RPi.GPIO as GPIO
from datetime import datetime

buzz_pin = 13

if __name__ == '__main__':
	# initialisieren
	GPIO.setmode(GPIO.BOARD)
	GPIO.setwarnings(False)

	# blinking light
	GPIO.setup(buzz_pin, GPIO.OUT, initial=GPIO.LOW)

	# Beep for .5 second:

	GPIO.output(buzz_pin, GPIO.HIGH) # Turn on
	time.sleep(.5)
	GPIO.output(buzz_pin, GPIO.LOW) # Turn off	

	GPIO.cleanup()