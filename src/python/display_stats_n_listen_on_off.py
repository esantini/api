# Import LCD library
from RPLCD import i2c

import RPi.GPIO as GPIO
# Import sleep library
from time import sleep

import subprocess
from constants import cols, rows, charmap, i2c_expander, address, port


# Initialise the LCD
lcd = i2c.CharLCD(i2c_expander, address, port=port, charmap=charmap,
                  cols=cols, rows=rows)
lcd.clear()

smiley = (
  0b00000,
  0b01010,
  0b01010,
  0b00000,
  0b10001,
  0b10001,
  0b01110,
  0b00000,
)
lcd.create_char(2, smiley)

# Write a string on first line and move to next line
lcd.write_string('     Hello world')
lcd.crlf()
lcd.write_string('')
lcd.crlf()
lcd.write_string('         \x02')

sleep(2)

lcd.clear()

button_pin = 7

GPIO.setmode(GPIO.BOARD)

# blinking light
GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def display_stats():
  lcd.home()

  # Shell scripts for system monitoring from here : https://unix.stackexchange.com/questions/119126/command-to-display-memory-usage-disk-usage-and-cpu-load
  cmd = "hostname -I | cut -d\' \' -f1"
  IP = subprocess.check_output(cmd, shell = True )
  cmd = "top -bn1 | grep load | awk '{printf \"CPU Load: %.2f\", $(NF-2)}'"
  CPU = subprocess.check_output(cmd, shell = True )
  cmd = "free -m | awk 'NR==2{printf \"Mem: %s/%sMB %.2f%%\", $3,$2,$3*100/$2 }'"
  MemUsage = subprocess.check_output(cmd, shell = True )
  cmd = "df -h | awk '$NF==\"/\"{printf \"Disk: %d/%dGB %s\", $3,$2,$5}'"
  Disk = subprocess.check_output(cmd, shell = True )

  # Write two lines of text.
  lcd.write_string("IP: " + str(IP)[2:-3][:cols])
  lcd.crlf()
  lcd.write_string(str(CPU)[2:-1][:cols])
  lcd.crlf()
  lcd.write_string(str(MemUsage)[2:-1][:cols])
  lcd.crlf()
  lcd.write_string(str(Disk)[2:-1][:cols])

while True:
  if not GPIO.input(button_pin):
    lcd.backlight_enabled = not lcd.backlight_enabled
    if lcd.backlight_enabled:
      display_stats()
    else:
      lcd.clear()
    sleep(.3)
  if lcd.backlight_enabled:
    display_stats()
  sleep(.1)

# Switch off backlight
lcd.backlight_enabled = False 
# Clear the LCD screen
lcd.close(clear=True)