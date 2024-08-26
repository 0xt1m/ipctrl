import pyfiglet

def draw_ascii_art(text, font="standard", width=80, justify="center"):
    figlet = pyfiglet.Figlet(font=font, width=width, justify=justify)
    ascii_art = figlet.renderText(text)
    print(ascii_art)

# Customize font, width, and alignment
draw_ascii_art("IPCTRL", font="banner", width=100, justify="center")