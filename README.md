# Kalkulator Canggih

Aplikasi web kalkulator berbasis Python dan Flask dengan tampilan seperti kalkulator smartphone. Mendukung operasi aritmatika, logika bitwise, dan transformasi bilangan, dilengkapi dark mode dan riwayat perhitungan.

## Fitur

- Operasi aritmatika lengkap (+, −, ×, ÷, pangkat, akar, modulus, floor division)
- Operator logika bitwise (AND, OR, NOT, XOR, NAND, NOR)
- Konversi basis bilangan (Desimal, Biner, Oktal, Heksadesimal)
- Konversi suhu (Celsius, Fahrenheit, Kelvin, Reamur)
- Konversi mata uang sederhana dengan rate statis (IDR, USD, EUR, SGD, JPY, GBP, MYR, AUD)
- Faktorial (n = 0–20) dan deret Fibonacci (hingga 30 suku)
- Tampilan rumus dan langkah-langkah setiap perhitungan
- Riwayat perhitungan tersimpan otomatis
- Light mode (putih + soft pink) dan dark mode

## Teknologi

- Python 3
- Flask
- HTML, CSS, JavaScript
- Jinja2

## Instalasi

1. Clone repository ini

```bash
git clone https://github.com/haifasyadzaa-hash/project_kalkulator_zaa.git
cd kalkulator
```

2. Install dependensi

```bash
pip install -r requirements.txt
```

3. Jalankan aplikasi

```bash
python app.py
```

4. Buka browser dan akses

```
http://127.0.0.1:5000
```

## Struktur Project

```
kalkulator/
├── app.py
├── requirements.txt
├── .gitignore
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

## API

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/` | Halaman utama |
| POST | `/api/arithmetic` | Operasi aritmatika |
| POST | `/api/logic` | Operator logika |
| POST | `/api/transform` | Transformasi bilangan |

## Lisensi

[MIT](LICENSE)
