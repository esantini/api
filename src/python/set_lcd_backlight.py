# Import LCD library
import sys
from RPLCD import i2c

from constants import cols, rows, charmap, i2c_expander, address, port

# Initialise the LCD
lcd = i2c.CharLCD(i2c_expander, address, port=port, charmap=charmap,
                  cols=cols, rows=rows)

lcd.backlight_enabled = sys.argv[0].lower() == 'true'