import io
import base64
import random
from datetime import datetime
import barcode
from barcode.writer import SVGWriter, ImageWriter

def generate_tracking_code(origin_code: str, dest_code: str) -> str:
    """
    Generates a tracking code formatted as KX-<ORG>-<DST>-<YYMMDD>-<RANDOM>.
    Example: KX-ALG-EUL-261012-4821
    """
    org_abbr = "ALG" if "ALG" in origin_code else "EUL"
    dst_abbr = "ALG" if "ALG" in dest_code else "EUL"
    date_part = datetime.now().strftime("%y%m%d")
    rand_part = f"{random.randint(1000, 9999)}"
    return f"KX-{org_abbr}-{dst_abbr}-{date_part}-{rand_part}"

def generate_barcode_svg(tracking_code: str) -> str:
    """
    Generates a Code 128 barcode as an SVG string.
    """
    try:
        code128 = barcode.get('code128', tracking_code, writer=SVGWriter())
        buffer = io.BytesIO()
        code128.write(buffer, options={'write_text': True, 'font_size': 10, 'module_height': 15.0})
        return buffer.getvalue().decode('utf-8')
    except Exception as e:
        return ""

def generate_barcode_base64_png(tracking_code: str) -> str:
    """
    Generates a Code 128 barcode as a base64 PNG data URL.
    """
    try:
        code128 = barcode.get('code128', tracking_code, writer=ImageWriter())
        buffer = io.BytesIO()
        code128.write(buffer, options={'write_text': True, 'font_size': 10, 'module_height': 15.0})
        encoded = base64.b64encode(buffer.getvalue()).decode('ascii')
        return f"data:image/png;base64,{encoded}"
    except Exception as e:
        return ""
