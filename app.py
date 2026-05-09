from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

RATES = {
    "IDR": 1,
    "USD": 1 / 16200,
    "EUR": 1 / 17500,
    "SGD": 1 / 12000,
    "JPY": 1 / 108,
    "GBP": 1 / 20500,
    "MYR": 1 / 3700,
    "AUD": 1 / 10500,
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/arithmetic", methods=["POST"])
def arithmetic():
    data = request.json
    a = float(data["a"])
    b = float(data.get("b", 0))
    op = data["op"]
    steps = []
    result = None
    formula = ""
    try:
        if op == "+":
            result = a + b
            formula = f"{a} + {b} = {result}"
            steps = [f"Tambahkan {a} dengan {b}", f"Hasil: {result}"]
        elif op == "-":
            result = a - b
            formula = f"{a} - {b} = {result}"
            steps = [f"Kurangkan {b} dari {a}", f"Hasil: {result}"]
        elif op == "*":
            result = a * b
            formula = f"{a} × {b} = {result}"
            steps = [f"Kalikan {a} dengan {b}", f"Hasil: {result}"]
        elif op == "/":
            if b == 0:
                return jsonify({"error": "Pembagian dengan nol tidak diperbolehkan"}), 400
            result = a / b
            formula = f"{a} ÷ {b} = {result}"
            steps = [f"Bagi {a} dengan {b}", f"Hasil: {result}"]
        elif op == "**":
            result = a ** b
            formula = f"{a} ^ {b} = {result}"
            steps = [f"Pangkatkan {a} dengan eksponen {b}", f"Hasil: {result}"]
        elif op == "sqrt":
            if a < 0:
                return jsonify({"error": "Akar dari bilangan negatif tidak valid"}), 400
            result = math.sqrt(a)
            formula = f"√{a} = {result}"
            steps = [f"Hitung akar kuadrat dari {a}", f"√{a} = {result}"]
        elif op == "%":
            result = a % b
            formula = f"{a} mod {b} = {result}"
            steps = [f"Hitung sisa bagi {a} ÷ {b}", f"{a} = {int(a//b)} × {b} + {result}", f"Sisa = {result}"]
        elif op == "//":
            if b == 0:
                return jsonify({"error": "Pembagian dengan nol tidak diperbolehkan"}), 400
            result = int(a // b)
            formula = f"{a} // {b} = {result}"
            steps = [f"Hitung floor division {a} ÷ {b}", f"Floor({a/b:.4f}) = {result}"]
        return jsonify({"result": result, "formula": formula, "steps": steps})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/logic", methods=["POST"])
def logic():
    data = request.json
    op = data["op"]
    a = int(data["a"])
    b = int(data.get("b", 0))
    steps = []
    result = None
    formula = ""
    try:
        if op == "AND":
            result = a & b
            formula = f"{a} AND {b} = {result}"
            steps = [f"Biner {a}: {bin(a)}", f"Biner {b}: {bin(b)}", "Operasi AND bit per bit", f"Hasil biner: {bin(result)}", f"Desimal: {result}"]
        elif op == "OR":
            result = a | b
            formula = f"{a} OR {b} = {result}"
            steps = [f"Biner {a}: {bin(a)}", f"Biner {b}: {bin(b)}", "Operasi OR bit per bit", f"Hasil biner: {bin(result)}", f"Desimal: {result}"]
        elif op == "NOT":
            result = ~a
            formula = f"NOT {a} = {result}"
            steps = [f"Biner {a}: {bin(a)}", "Balik semua bit", f"Hasil: {result}"]
        elif op == "XOR":
            result = a ^ b
            formula = f"{a} XOR {b} = {result}"
            steps = [f"Biner {a}: {bin(a)}", f"Biner {b}: {bin(b)}", "XOR: bit sama→0, beda→1", f"Hasil biner: {bin(result)}", f"Desimal: {result}"]
        elif op == "NAND":
            result = ~(a & b)
            formula = f"{a} NAND {b} = {result}"
            steps = [f"AND dulu: {a} & {b} = {a & b}", f"NOT({a & b}) = {result}"]
        elif op == "NOR":
            result = ~(a | b)
            formula = f"{a} NOR {b} = {result}"
            steps = [f"OR dulu: {a} | {b} = {a | b}", f"NOT({a | b}) = {result}"]
        return jsonify({"result": result, "formula": formula, "steps": steps})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/transform", methods=["POST"])
def transform():
    data = request.json
    kind = data["kind"]
    steps = []
    result = ""
    formula = ""
    try:
        if kind == "base":
            num = data["num"]
            frm = data["from"]
            to = data["to"]
            dec_map = {"DEC": 10, "BIN": 2, "OCT": 8, "HEX": 16}
            decimal = int(str(num), dec_map[frm])
            steps.append(f"Konversi {num} ({frm}) → Desimal: {decimal}")
            if to == "DEC": result = str(decimal)
            elif to == "BIN": result = bin(decimal)[2:]
            elif to == "OCT": result = oct(decimal)[2:]
            elif to == "HEX": result = hex(decimal)[2:].upper()
            steps.append(f"Konversi {decimal} (DEC) → {to}: {result}")
            formula = f"{num} ({frm}) = {result} ({to})"
        elif kind == "temp":
            val = float(data["val"])
            frm = data["from"]
            to = data["to"]
            if frm == "C": celsius = val
            elif frm == "F": celsius = (val - 32) * 5 / 9; steps.append(f"({val}-32)×5/9 = {celsius:.4f}°C")
            elif frm == "K": celsius = val - 273.15; steps.append(f"{val}-273.15 = {celsius:.4f}°C")
            elif frm == "R": celsius = val * 5 / 4; steps.append(f"{val}×5/4 = {celsius:.4f}°C")
            if to == "C": res_val = celsius
            elif to == "F": res_val = celsius * 9/5 + 32; steps.append(f"{celsius:.4f}×9/5+32 = {res_val:.4f}°F")
            elif to == "K": res_val = celsius + 273.15; steps.append(f"{celsius:.4f}+273.15 = {res_val:.4f}K")
            elif to == "R": res_val = celsius * 4/5; steps.append(f"{celsius:.4f}×4/5 = {res_val:.4f}°Ré")
            result = f"{res_val:.4f}"
            formula = f"{val} {frm} = {result} {to}"
        elif kind == "currency":
            amount = float(data["amount"])
            frm = data["from"]
            to = data["to"]
            idr = amount / RATES[frm]
            steps.append(f"{amount} {frm} → IDR: {idr:,.2f}")
            res_val = idr * RATES[to]
            steps.append(f"IDR {idr:,.2f} → {to}: {res_val:,.4f}")
            result = f"{res_val:,.4f}"
            formula = f"{amount} {frm} = {result} {to}"
        elif kind == "factorial":
            n = int(data["n"])
            if n < 0: return jsonify({"error": "Hanya bilangan non-negatif"}), 400
            if n > 20: return jsonify({"error": "Maksimal 20"}), 400
            res_val = math.factorial(n)
            formula = f"{n}! = {res_val}"
            steps = [f"{n}! = " + " × ".join(str(i) for i in range(1, n+1 if n > 0 else 1)), f"= {res_val}"]
            result = str(res_val)
        elif kind == "fibonacci":
            n = int(data["n"])
            if n < 1 or n > 30: return jsonify({"error": "Input 1-30"}), 400
            fib = [0, 1]
            for i in range(2, n): fib.append(fib[-1] + fib[-2])
            seq = fib[:n]
            result = ", ".join(str(x) for x in seq)
            formula = f"Fibonacci {n} suku pertama"
            steps = ["F(0)=0, F(1)=1", "F(n) = F(n-1) + F(n-2)", f"Deret: {result}"]
        return jsonify({"result": result, "formula": formula, "steps": steps})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
