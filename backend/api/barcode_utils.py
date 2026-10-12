"""
Pure Python Code 128 Barcode Generator (Subset B)
Produces standard SVG output for thermal label printing (80mm) and bons.
"""

CODE128_PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
]

START_B = 104
STOP = 106

def encode_code128_b(text: str) -> str:
    """Encodes ASCII text into Code 128 bar pattern sequence."""
    ascii_values = [ord(c) for c in text if 32 <= ord(c) <= 126]
    char_codes = [v - 32 for v in ascii_values]
    
    # Checksum calculation: Start B (104) + sum(pos * val)
    checksum = START_B + sum((i + 1) * code for i, code in enumerate(char_codes))
    check_char = checksum % 103

    full_codes = [START_B] + char_codes + [check_char, STOP]
    pattern_str = "".join(CODE128_PATTERNS[c] for c in full_codes)
    return pattern_str

def generate_barcode_svg(text: str, width: int = 320, height: int = 80, show_text: bool = True) -> str:
    """
    Generates a clean SVG string for the given text as a Code 128 barcode.
    Suitable for embedding in HTML, web apps, and thermal 80mm ticket printing.
    """
    pattern = encode_code128_b(text)
    
    # Calculate module bars
    # Pattern digits represent alternate bar and space widths
    modules = []
    is_bar = True
    for digit in pattern:
        w = int(digit)
        modules.append((is_bar, w))
        is_bar = not is_bar

    total_modules = sum(w for _, w in modules)
    quiet_zone = 10
    total_width = total_modules + (2 * quiet_zone)
    
    scale = width / total_width
    bar_height = height - (20 if show_text else 0)

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
        f'<rect width="{width}" height="{height}" fill="#ffffff"/>'
    ]

    current_x = quiet_zone * scale
    for is_bar, w in modules:
        rect_width = w * scale
        if is_bar:
            svg_parts.append(
                f'<rect x="{current_x:.2f}" y="5" width="{rect_width:.2f}" height="{bar_height:.2f}" fill="#000000"/>'
            )
        current_x += rect_width

    if show_text:
        text_y = height - 4
        svg_parts.append(
            f'<text x="{width / 2:.2f}" y="{text_y}" font-family="Courier, monospace, sans-serif" '
            f'font-size="13" font-weight="bold" text-anchor="middle" fill="#111827">{text}</text>'
        )

    svg_parts.append('</svg>')
    return "".join(svg_parts)
