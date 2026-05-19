from flask import Flask, render_template, request, jsonify, session
import math
import json

app = Flask(__name__)
app.secret_key = 'kalkulator-canggih-secret-2025'

# ===================== ROUTES =====================

@app.route('/')
def index():
    if 'history' not in session:
        session['history'] = []
    return render_template('index.html')

@app.route('/clear-history', methods=['POST'])
def clear_history():
    session['history'] = []
    return jsonify({'status': 'ok'})

# ===================== ARITMATIKA =====================

@app.route('/api/aritmatika', methods=['POST'])
def aritmatika():
    data = request.get_json()
    op = data.get('operasi')
    try:
        a = float(data.get('a', 0))
        b = float(data.get('b', 0)) if data.get('b') is not None else None
    except:
        return jsonify({'error': 'Input tidak valid'}), 400

    result = None
    rumus = ''
    langkah = []

    try:
        if op == 'tambah':
            result = a + b
            rumus = f"{a} + {b} = {result}"
            langkah = [
                f"Operasi: Penjumlahan",
                f"Nilai A = {a}",
                f"Nilai B = {b}",
                f"Hasil = {a} + {b} = {result}"
            ]
        elif op == 'kurang':
            result = a - b
            rumus = f"{a} - {b} = {result}"
            langkah = [
                f"Operasi: Pengurangan",
                f"Nilai A = {a}",
                f"Nilai B = {b}",
                f"Hasil = {a} - {b} = {result}"
            ]
        elif op == 'kali':
            result = a * b
            rumus = f"{a} × {b} = {result}"
            langkah = [
                f"Operasi: Perkalian",
                f"Nilai A = {a}",
                f"Nilai B = {b}",
                f"Hasil = {a} × {b} = {result}"
            ]
        elif op == 'bagi':
            if b == 0:
                return jsonify({'error': 'Tidak bisa dibagi dengan nol!'}), 400
            result = a / b
            rumus = f"{a} ÷ {b} = {result}"
            langkah = [
                f"Operasi: Pembagian",
                f"Nilai A = {a}",
                f"Nilai B = {b}",
                f"Hasil = {a} ÷ {b} = {result}"
            ]
        elif op == 'pangkat':
            result = a ** b
            rumus = f"{a}^{b} = {result}"
            langkah = [
                f"Operasi: Pemangkatan",
                f"Basis = {a}",
                f"Eksponen = {b}",
                f"Proses: {a} dikalikan dengan dirinya sendiri sebanyak {int(b)} kali",
                f"Hasil = {a}^{b} = {result}"
            ]
        elif op == 'akar':
            if a < 0:
                return jsonify({'error': 'Tidak bisa akar dari bilangan negatif!'}), 400
            result = math.sqrt(a)
            rumus = f"√{a} = {result}"
            langkah = [
                f"Operasi: Akar Kuadrat",
                f"Nilai = {a}",
                f"Rumus: √n",
                f"Hasil = √{a} = {result}"
            ]
        elif op == 'modulus':
            if b == 0:
                return jsonify({'error': 'Modulus dengan nol tidak valid!'}), 400
            result = a % b
            rumus = f"{a} mod {b} = {result}"
            langkah = [
                f"Operasi: Modulus (Sisa Bagi)",
                f"Nilai A = {a}",
                f"Nilai B = {b}",
                f"Proses: {a} dibagi {b} = {int(a//b)} sisa {result}",
                f"Hasil = {result}"
            ]
        elif op == 'floor':
            if b == 0:
                return jsonify({'error': 'Tidak bisa dibagi dengan nol!'}), 400
            result = int(a // b)
            rumus = f"{a} // {b} = {result}"
            langkah = [
                f"Operasi: Floor Division (Pembagian Bulat Bawah)",
                f"Nilai A = {a}",
                f"Nilai B = {b}",
                f"Proses: {a} / {b} = {a/b:.4f}",
                f"Dibulatkan ke bawah: {result}",
                f"Hasil = {result}"
            ]
        else:
            return jsonify({'error': 'Operasi tidak dikenal'}), 400

        result_fmt = fmt_number(result)
        _save_history(f"Aritmatika: {rumus}", result_fmt)

        return jsonify({
            'result': result_fmt,
            'rumus': rumus,
            'langkah': langkah
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===================== LOGIKA =====================

@app.route('/api/logika', methods=['POST'])
def logika():
    data = request.get_json()
    op = data.get('operasi')
    try:
        a = int(data.get('a', 0))
        b = int(data.get('b', 0)) if data.get('b') is not None else None
    except:
        return jsonify({'error': 'Input harus bilangan bulat (0 atau 1 untuk boolean, integer untuk bitwise)'}), 400

    result = None
    rumus = ''
    langkah = []

    try:
        if op == 'AND':
            result = a & b
            rumus = f"{a} AND {b} = {result}"
            langkah = [
                f"Operasi: Bitwise AND",
                f"A = {a} (biner: {bin(a)})",
                f"B = {b} (biner: {bin(b)})",
                f"Proses: Setiap bit di-AND-kan",
                f"  {bin(a)[2:].zfill(8)}",
                f"& {bin(b)[2:].zfill(8)}",
                f"= {bin(result)[2:].zfill(8)}",
                f"Hasil = {result}"
            ]
        elif op == 'OR':
            result = a | b
            rumus = f"{a} OR {b} = {result}"
            langkah = [
                f"Operasi: Bitwise OR",
                f"A = {a} (biner: {bin(a)})",
                f"B = {b} (biner: {bin(b)})",
                f"Proses: Setiap bit di-OR-kan (1 jika salah satu atau keduanya 1)",
                f"  {bin(a)[2:].zfill(8)}",
                f"| {bin(b)[2:].zfill(8)}",
                f"= {bin(result)[2:].zfill(8)}",
                f"Hasil = {result}"
            ]
        elif op == 'NOT':
            # 8-bit NOT untuk tampilan lebih jelas
            result = ~a & 0xFF
            rumus = f"NOT {a} = {result} (8-bit)"
            langkah = [
                f"Operasi: Bitwise NOT (8-bit)",
                f"A = {a} (biner: {bin(a)[2:].zfill(8)})",
                f"Proses: Setiap bit dibalik (0→1, 1→0)",
                f"Hasil biner: {bin(result)[2:].zfill(8)}",
                f"Hasil = {result}"
            ]
        elif op == 'XOR':
            result = a ^ b
            rumus = f"{a} XOR {b} = {result}"
            langkah = [
                f"Operasi: Bitwise XOR (Exclusive OR)",
                f"A = {a} (biner: {bin(a)[2:].zfill(8)})",
                f"B = {b} (biner: {bin(b)[2:].zfill(8)})",
                f"Proses: Bit bernilai 1 jika berbeda, 0 jika sama",
                f"  {bin(a)[2:].zfill(8)}",
                f"^ {bin(b)[2:].zfill(8)}",
                f"= {bin(result)[2:].zfill(8)}",
                f"Hasil = {result}"
            ]
        elif op == 'NAND':
            result = ~(a & b) & 0xFF
            rumus = f"{a} NAND {b} = {result} (8-bit)"
            langkah = [
                f"Operasi: NAND (NOT AND)",
                f"A = {a} (biner: {bin(a)[2:].zfill(8)})",
                f"B = {b} (biner: {bin(b)[2:].zfill(8)})",
                f"Langkah 1 - AND: {a} AND {b} = {a & b} ({bin(a & b)[2:].zfill(8)})",
                f"Langkah 2 - NOT: NOT({a & b}) = {result} ({bin(result)[2:].zfill(8)})",
                f"Hasil = {result}"
            ]
        elif op == 'NOR':
            result = ~(a | b) & 0xFF
            rumus = f"{a} NOR {b} = {result} (8-bit)"
            langkah = [
                f"Operasi: NOR (NOT OR)",
                f"A = {a} (biner: {bin(a)[2:].zfill(8)})",
                f"B = {b} (biner: {bin(b)[2:].zfill(8)})",
                f"Langkah 1 - OR: {a} OR {b} = {a | b} ({bin(a | b)[2:].zfill(8)})",
                f"Langkah 2 - NOT: NOT({a | b}) = {result} ({bin(result)[2:].zfill(8)})",
                f"Hasil = {result}"
            ]
        else:
            return jsonify({'error': 'Operasi tidak dikenal'}), 400

        _save_history(f"Logika: {rumus}", str(result))
        return jsonify({
            'result': str(result),
            'rumus': rumus,
            'langkah': langkah
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===================== TRANSFORMASI =====================

@app.route('/api/konversi-basis', methods=['POST'])
def konversi_basis():
    data = request.get_json()
    nilai = data.get('nilai', '')
    dari = data.get('dari', 'decimal')
    ke = data.get('ke', 'binary')

    try:
        # Konversi ke desimal dulu
        if dari == 'decimal':
            dec = int(nilai)
        elif dari == 'binary':
            dec = int(nilai, 2)
        elif dari == 'octal':
            dec = int(nilai, 8)
        elif dari == 'hexadecimal':
            dec = int(nilai, 16)
        else:
            return jsonify({'error': 'Basis asal tidak valid'}), 400

        # Konversi dari desimal ke tujuan
        if ke == 'decimal':
            result = str(dec)
            rumus_ke = "Desimal"
        elif ke == 'binary':
            result = bin(dec)[2:]
            rumus_ke = "Biner"
        elif ke == 'octal':
            result = oct(dec)[2:]
            rumus_ke = "Oktal"
        elif ke == 'hexadecimal':
            result = hex(dec)[2:].upper()
            rumus_ke = "Heksadesimal"
        else:
            return jsonify({'error': 'Basis tujuan tidak valid'}), 400

        langkah = [
            f"Input: {nilai} ({dari})",
            f"Langkah 1: Konversi ke Desimal = {dec}",
            f"Langkah 2: Konversi {dec} ke {rumus_ke}",
            f"  Desimal: {dec}",
            f"  Biner:   {bin(dec)[2:]}",
            f"  Oktal:   {oct(dec)[2:]}",
            f"  Hex:     {hex(dec)[2:].upper()}",
            f"Hasil = {result}"
        ]
        rumus = f"{nilai} ({dari}) → {result} ({ke})"

        _save_history(f"Basis: {rumus}", result)
        return jsonify({'result': result, 'rumus': rumus, 'langkah': langkah,
                        'semua': {
                            'decimal': str(dec),
                            'binary': bin(dec)[2:],
                            'octal': oct(dec)[2:],
                            'hexadecimal': hex(dec)[2:].upper()
                        }})
    except ValueError:
        return jsonify({'error': f'Nilai "{nilai}" tidak valid untuk basis {dari}'}), 400


@app.route('/api/konversi-suhu', methods=['POST'])
def konversi_suhu():
    data = request.get_json()
    try:
        nilai = float(data.get('nilai', 0))
        dari = data.get('dari', 'celsius')
    except:
        return jsonify({'error': 'Input tidak valid'}), 400

    # Konversi ke Celsius dulu
    if dari == 'celsius':
        c = nilai
    elif dari == 'fahrenheit':
        c = (nilai - 32) * 5 / 9
    elif dari == 'kelvin':
        c = nilai - 273.15
    elif dari == 'reamur':
        c = nilai * 5 / 4
    else:
        return jsonify({'error': 'Satuan tidak valid'}), 400

    f = c * 9 / 5 + 32
    k = c + 273.15
    r = c * 4 / 5

    langkah = [
        f"Input: {nilai}° {dari.capitalize()}",
        f"Konversi ke Celsius terlebih dahulu: {c:.4f}°C",
        f"",
        f"Rumus Konversi:",
        f"  °C  = (°F - 32) × 5/9",
        f"  °F  = °C × 9/5 + 32",
        f"  K   = °C + 273.15",
        f"  °Ré = °C × 4/5",
        f"",
        f"Hasil:",
        f"  Celsius    = {c:.4f}°C",
        f"  Fahrenheit = {f:.4f}°F",
        f"  Kelvin     = {k:.4f} K",
        f"  Réaumur    = {r:.4f}°Ré"
    ]

    result_map = {
        'celsius': f"{c:.4f}",
        'fahrenheit': f"{f:.4f}",
        'kelvin': f"{k:.4f}",
        'reamur': f"{r:.4f}"
    }
    rumus = f"{nilai}° {dari.capitalize()} → C:{c:.2f} | F:{f:.2f} | K:{k:.2f} | R:{r:.2f}"

    _save_history(f"Suhu: {nilai}° {dari}", rumus)
    return jsonify({'result': result_map, 'rumus': rumus, 'langkah': langkah})


@app.route('/api/konversi-mata-uang', methods=['POST'])
def konversi_mata_uang():
    data = request.get_json()
    try:
        nilai = float(data.get('nilai', 0))
        dari = data.get('dari', 'IDR')
        ke = data.get('ke', 'USD')
    except:
        return jsonify({'error': 'Input tidak valid'}), 400

    # Rate statis (Mei 2025)
    rates_to_idr = {
        'IDR': 1,
        'USD': 16250,
        'EUR': 17500,
        'SGD': 12100,
        'JPY': 108,
        'MYR': 3600,
        'GBP': 20500,
        'AUD': 10500,
        'CNY': 2250,
        'SAR': 4333
    }

    if dari not in rates_to_idr or ke not in rates_to_idr:
        return jsonify({'error': 'Mata uang tidak valid'}), 400

    # Konversi ke IDR dulu, lalu ke tujuan
    nilai_idr = nilai * rates_to_idr[dari]
    result = nilai_idr / rates_to_idr[ke]

    rumus = f"{nilai} {dari} = {result:,.4f} {ke}"
    langkah = [
        f"Input: {nilai:,} {dari}",
        f"Rate {dari} ke IDR: 1 {dari} = Rp {rates_to_idr[dari]:,}",
        f"Langkah 1: {nilai} {dari} × {rates_to_idr[dari]:,} = Rp {nilai_idr:,.2f}",
        f"Rate IDR ke {ke}: 1 {ke} = Rp {rates_to_idr[ke]:,}",
        f"Langkah 2: Rp {nilai_idr:,.2f} ÷ {rates_to_idr[ke]:,} = {result:,.4f} {ke}",
        f"",
        f"*Rate statis per Mei 2025"
    ]

    _save_history(f"Mata Uang: {nilai} {dari}", f"{result:,.4f} {ke}")
    return jsonify({'result': f"{result:,.4f}", 'rumus': rumus, 'langkah': langkah})


@app.route('/api/faktorial', methods=['POST'])
def faktorial():
    data = request.get_json()
    try:
        n = int(data.get('n', 0))
    except:
        return jsonify({'error': 'Input harus bilangan bulat'}), 400

    if n < 0:
        return jsonify({'error': 'Faktorial tidak berlaku untuk bilangan negatif'}), 400
    if n > 20:
        return jsonify({'error': 'Input terlalu besar (maksimal 20)'}), 400

    result = math.factorial(n)
    steps = ' × '.join([str(i) for i in range(n, 0, -1)]) if n > 0 else '1'
    rumus = f"{n}! = {result}"
    langkah = [
        f"Operasi: Faktorial",
        f"n = {n}",
        f"Rumus: n! = n × (n-1) × (n-2) × ... × 1",
        f"Proses: {n}! = {steps}",
        f"Hasil = {result}"
    ]

    _save_history(f"Faktorial: {n}!", str(result))
    return jsonify({'result': str(result), 'rumus': rumus, 'langkah': langkah})


@app.route('/api/fibonacci', methods=['POST'])
def fibonacci():
    data = request.get_json()
    try:
        n = int(data.get('n', 0))
    except:
        return jsonify({'error': 'Input harus bilangan bulat'}), 400

    if n < 0:
        return jsonify({'error': 'Input harus ≥ 0'}), 400
    if n > 30:
        return jsonify({'error': 'Input terlalu besar (maksimal 30)'}), 400

    fib = []
    a, b = 0, 1
    for _ in range(n + 1):
        fib.append(a)
        a, b = b, a + b

    result = fib[n]
    rumus = f"F({n}) = {result}"
    langkah = [
        f"Operasi: Deret Fibonacci",
        f"n = {n}",
        f"Rumus: F(n) = F(n-1) + F(n-2), dengan F(0)=0, F(1)=1",
        f"Deret: {', '.join(map(str, fib))}",
        f"F({n}) = {result}"
    ]

    _save_history(f"Fibonacci: F({n})", str(result))
    return jsonify({'result': str(result), 'rumus': rumus, 'langkah': langkah, 'deret': fib})


@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify({'history': session.get('history', [])})


# ===================== HELPERS =====================

def fmt_number(n):
    if isinstance(n, float) and n.is_integer():
        return str(int(n))
    return str(n)

def _save_history(operasi, hasil):
    if 'history' not in session:
        session['history'] = []
    history = session['history']
    history.insert(0, {'operasi': operasi, 'hasil': hasil})
    if len(history) > 20:
        history = history[:20]
    session['history'] = history
    session.modified = True


if __name__ == '__main__':
    app.run(debug=True)
