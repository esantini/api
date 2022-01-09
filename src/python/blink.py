#!/usr/bin/python
import time
import RPi.GPIO as GPIO
from datetime import datetime

led_pin = 22 # LED light

if __name__ == '__main__':
	# initialisieren
	GPIO.setmode(GPIO.BOARD)
	GPIO.setwarnings(False)

	# blinking light
	GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)

	# Beep for 1 second:

	GPIO.output(led_pin, GPIO.HIGH) # Turn on
	time.sleep(5)
	GPIO.output(led_pin, GPIO.LOW) # Turn off	

	GPIO.cleanup()