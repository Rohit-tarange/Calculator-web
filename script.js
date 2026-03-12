class ScientificCalculator {
    constructor(previousElement, currentElement) {
        this.previousElement = previousElement;
        this.currentElement = currentElement;
        this.clear();
        this.ans = 0;
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.justCalculated = false;
        this.error = false;
    }

    delete() {
        if (this.error) return this.clear();
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (this.error) this.clear();
        if (this.justCalculated) {
            this.currentOperand = number === '.' ? '0.' : number.toString();
            this.justCalculated = false;
            return;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand += number.toString();
        }
    }

    appendConstant(constant) {
        if (this.error) this.clear();
        const val = constant === 'π' ? Math.PI : Math.E;
        this.currentOperand = this.formatResult(val).toString();
        this.justCalculated = true;
    }

    chooseOperation(op) {
        if (this.error) return;
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = op;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    computeScientific(func) {
        if (this.error) return;
        const val = parseFloat(this.currentOperand);
        if (isNaN(val)) return;

        let result;
        const toRad = d => d * (Math.PI / 180);
        const toDeg = r => r * (180 / Math.PI);

        try {
            switch(func) {
                case 'sin': result = Math.sin(toRad(val)); break;
                case 'cos': result = Math.cos(toRad(val)); break;
                case 'tan': result = Math.tan(toRad(val)); break;
                case 'asin': result = toDeg(Math.asin(val)); break;
                case 'acos': result = toDeg(Math.acos(val)); break;
                case 'atan': result = toDeg(Math.atan(val)); break;
                case 'log': result = Math.log10(val); break;
                case 'ln': result = Math.log(val); break;
                case 'sqrt': result = Math.sqrt(val); break;
                case 'cbrt': result = Math.cbrt(val); break;
                case 'square': result = val * val; break;
                case 'factorial': result = this.factorial(val); break;
                default: return;
            }
            if (!isFinite(result) || isNaN(result)) throw new Error();
            
            const labels = {
                'asin': 'sin⁻¹', 'acos': 'cos⁻¹', 'atan': 'tan⁻¹',
                'sin': 'sin', 'cos': 'cos', 'tan': 'tan', 'sqrt': '√', 'cbrt': '∛'
            };
            this.previousOperand = `${labels[func] || func}(${val})`;
            this.currentOperand = this.formatResult(result).toString();
            this.justCalculated = true;
        } catch(e) {
            this.currentOperand = 'Error';
            this.error = true;
        }
    }

    compute() {
        if (this.error || !this.operation || this.currentOperand === '') return;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        let result;
        try {
            switch(this.operation) {
                case '+': result = prev + current; break;
                case '−': result = prev - current; break;
                case '×': result = prev * current; break;
                case '÷': 
                    if (current === 0) throw new Error();
                    result = prev / current; 
                    break;
                case 'mod': result = prev % current; break;
                case '^': result = Math.pow(prev, current); break;
                default: return;
            }
            this.ans = result;
            this.currentOperand = this.formatResult(result).toString();
            this.operation = undefined;
            this.previousOperand = '';
            this.justCalculated = true;
        } catch(e) {
            this.currentOperand = 'Error';
            this.error = true;
        }
    }

    factorial(n) {
        if (n < 0 || n > 170 || !Number.isInteger(n)) throw new Error();
        if (n === 0) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-10) return 0;
        const s = num.toString();
        if (s.length > 12) return num.toPrecision(8);
        return parseFloat(num.toFixed(10));
    }

    updateDisplay() {
        this.currentElement.innerText = this.currentOperand;
        if (this.operation) {
            this.previousElement.innerText = `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousElement.innerText = this.previousOperand;
        }
    }
}

const calc = new ScientificCalculator(
    document.getElementById('previous-operand'),
    document.getElementById('current-operand')
);

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const val = btn.innerText;

        if (btn.classList.contains('btn-num') && !action) {
            calc.appendNumber(val);
        } else if (btn.classList.contains('btn-op')) {
            calc.chooseOperation(val);
        } else if (btn.classList.contains('btn-sci')) {
            if (action === 'pi' || action === 'e') calc.appendConstant(val);
            else if (action === 'append-text') calc.appendNumber(val); // Logic for parens simplified
            else calc.computeScientific(action);
        } else {
            switch(action) {
                case 'clear-all': calc.clear(); break;
                case 'delete': calc.delete(); break;
                case 'equals': calc.compute(); break;
                case 'ans': calc.appendNumber(calc.ans); break;
                case 'pow10': calc.appendNumber('e'); break; // Standard calc 'exp' button
            }
        }
        calc.updateDisplay();
    });
});
