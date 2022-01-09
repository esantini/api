#!/usr/bin/python
import RPi.GPIO as GPIO

led_pin = 22
buzz_pin = 13

if __name__ == '__main__':
	GPIO.setmode(GPIO.BOARD)
	GPIO.setup(led_pin, GPIO.OUT, initial=GPIO.LOW)
	GPIO.setup(buzz_pin, GPIO.OUT, initial=GPIO.LOW)
	GPIO.cleanup()
