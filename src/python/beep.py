#!/usr/bin/python
from time import sleep
import RPi.GPIO as GPIO
from datetime import datetime

buzz_pin = 13

if __name__ == '__main__':
	# initialisieren
	GPIO.setmode(GPIO.BOARD)
	GPIO.setwarnings(False)

	# blinking light
	GPIO.setup(buzz_pin, GPIO.OUT, initial=GPIO.LOW)

	GPIO.output(buzz_pin, GPIO.HIGH) # Turn on
	sleep(.2)
	GPIO.output(buzz_pin, GPIO.LOW) # Turn off	

	GPIO.cleanup()