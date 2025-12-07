import re
from pathlib import Path
p = Path(__file__).resolve().parent.parent / 'js' / 'lib' / 'butterchurn-presets.min.js'
s = p.read_text(encoding='utf8')
pattern = re.compile(r'(init_eqs_str|frame_eqs_str|pixel_eqs_str):"([\s\S]*?)"', re.DOTALL)
count = 0

def repl(m):
    global count
    key = m.group(1)
    inner = m.group(2)
    # Only replace if there are literal newlines
    if '\n' not in inner and '\r' not in inner:
        return m.group(0)
    # Replace literal newlines with escaped \n
    new_inner = inner.replace('\r\n', '\\n').replace('\n', '\\n')
    count += 1
    return f'{key}:"{new_inner}"'

s2 = pattern.sub(repl, s)
p.write_text(s2, encoding='utf8')
print('blocks replaced:', count)
