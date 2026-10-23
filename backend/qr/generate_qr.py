import sys
import qrcode

def generate_qr(url, file_path):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(file_path)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_qr.py <url> <file_path>")
        sys.exit(1)
    
    url = sys.argv[1]
    file_path = sys.argv[2]
    generate_qr(url, file_path)
