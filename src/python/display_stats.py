# Import LCD library
from RPLCD import i2c

import RPi.GPIO as GPIO
# Import sleep library
from time import sleep
lcdmode = 'i2c'
cols = 20
rows = 4
charmap = 'A00'
i2c_expander = 'PCF8574'
# Generally 27 is the address;Find yours using: i2cdetect -y 1 
address = 0x27 
port = 1 # 0 on an older Raspberry Pi

import subprocess

# Initialise the LCD
lcd = i2c.CharLCD(i2c_expander, address, port=port, charmap=charmap,
                  cols=cols, rows=rows)
lcd.home()
lcd.clear()

sleep(.1)

GPIO.setmode(GPIO.BOARD)

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
  display_stats()
  sleep(.3)
