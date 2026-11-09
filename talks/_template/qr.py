"""Render a QR code PNG (transparent bg) via reportlab's encoder. usage: qr.py URL out.png HEXCOLOR"""
import sys
from reportlab.graphics.barcode import qrencoder
from PIL import Image
url,out,col=sys.argv[1],sys.argv[2],sys.argv[3]
for v in range(2,15):
    try:
        q=qrencoder.QRCode(v, qrencoder.QRErrorCorrectLevel.M); q.addData(url); q.make(); break
    except Exception: continue
n=q.getModuleCount(); s=24; quiet=0
img=Image.new('RGBA',(n*s,n*s),(0,0,0,0))
rgb=tuple(int(col[i:i+2],16) for i in (0,2,4))+(255,)
px=img.load()
for r in range(n):
    for c in range(n):
        if q.isDark(r,c):
            for y in range(r*s,(r+1)*s):
                for x in range(c*s,(c+1)*s): px[x,y]=rgb
img.save(out); print(out,n)
