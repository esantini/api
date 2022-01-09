#!/usr/bin/python
import time
import RPi.GPIO as GPIO
from datetime import datetime

buzz_pin = 13 # LED light
led_pin = 22 # LED light

if __name__ == '__main__':
	# initialisieren
	GPIO.setmode(GPIO.BOARD)
	GPIO.setwarnings(False)

	# blinking light
	GPIO.setup(buzz_pin, GPIO.OUT, initial=GPIO.LOW)
	GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)

	GPIO.output(buzz_pin, GPIO.HIGH) # Turn on
	GPIO.output(led_pin, GPIO.HIGH) # Turn on
	time.sleep(.3)
	GPIO.output(buzz_pin, GPIO.LOW) # Turn off
	GPIO.output(led_pin, GPIO.LOW) # Turn off

	while True:
		time.sleep(2)
		GPIO.output(led_pin, GPIO.HIGH) # Turn on
		time.sleep(.05)
		GPIO.output(led_pin, GPIO.LOW) # Turn off

	GPIO.cleanup()