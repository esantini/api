# Import LCD library
from RPLCD import i2c
from time import sleep
from constants import cols, rows, charmap, i2c_expander, address, port

# Initialise the LCD
lcd = i2c.CharLCD(i2c_expander, address, port=port, charmap=charmap,
                  cols=cols, rows=rows)

lcd.home()
lcd.clear()

sleep(.1)

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
lcd.home()
