#!/usr/bin/env python3
"""Generate the SPAYD payment QR code used in the README support section.

SPAYD (Short Payment Descriptor) is the Czech Banking Association standard that
every Czech banking app can scan. No amount is encoded on purpose: the app asks
the payer how much, so the code never reads as a price tag.

Needs `segno`:

    pip install segno

Then:

    python3 tools/make-qr.py

Writes docs/support-qr.png and docs/support-qr.svg. Rerun after changing ACCOUNT.
"""

import pathlib

import segno

# IBAN of the account that receives voluntary contributions, plus the BIC.
# This is published in a public repository on purpose. It is the same
# information that sits on any invoice and cannot be used to withdraw money.
IBAN = "CZ4920100000002800927751"
BIC = "FIOBCZPPXXX"

# SPAYD payload. ASCII only, no diacritics, no AM (amount) field.
SPAYD = f"SPD*1.0*ACC:{IBAN}+{BIC}*CC:CZK*MSG:POCTARSKY ZAVOD - DOBROVOLNY PRISPEVEK"

OUT_DIR = pathlib.Path(__file__).resolve().parent.parent / "docs"


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    # Error correction M is what the SPAYD spec recommends for payment codes.
    qr = segno.make(SPAYD, error="m")
    qr.save(OUT_DIR / "support-qr.png", scale=8, border=3, dark="#2b1a4d", light="#ffffff")
    qr.save(OUT_DIR / "support-qr.svg", scale=8, border=3, dark="#2b1a4d", light="#ffffff")
    print(f"payload: {SPAYD}")
    print(f"written: {OUT_DIR / 'support-qr.png'}")
    print(f"written: {OUT_DIR / 'support-qr.svg'}")


if __name__ == "__main__":
    main()
