/* 
   FUNCIÓN: generarMatriz()
   Crea una tabla con inputs vacíos según el tamaño indicado por el usuario.
*/
function generarMatriz() {
    let n = parseInt(document.getElementById("n").value);

    // Validación del tamaño
    if (isNaN(n) || n < 1) {
        alert("Indica un tamaño de matriz válido.");
        return;
    }

    let html = "<table>";

    // Crear tabla n×n
    for (let i = 0; i < n; i++) {
        html += "<tr>";
        for (let j = 0; j < n; j++) {
            // Cada celda es un input de texto vacío
            html += `<td><input type="text" class="cell" id="c${i}${j}" value=""></td>`;
        }
        html += "</tr>";
    }

    html += "</table>";

    // Insertar la tabla en el HTML
    document.getElementById("matriz").innerHTML = html;

    // Limpiar resultados anteriores
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("definitud").innerHTML = "";

    // Activar funciones adicionales
    activarNavegacionConEnter();
    activarAutocompletado();
}

/*
   FUNCIÓN: activarNavegacionConEnter()
   Permite que al presionar Enter se pase al siguiente input.
*/
function activarNavegacionConEnter() {
    const inputs = document.querySelectorAll("#matriz input");

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                let next = inputs[index + 1];
                if (next) next.focus();
            }
        });
    });
}

/*
   FUNCIÓN: activarAutocompletado()
   Convierte fracciones a decimales automáticamente
   y marca en rojo los valores inválidos.
*/
function activarAutocompletado() {
    const inputs = document.querySelectorAll("#matriz input");

    inputs.forEach(input => {
        input.addEventListener("blur", () => {
            let val = input.value.trim();
            let parsed = parseValor(val);

            // Si es inválido → marcar en rojo
            if (parsed === null) {
                input.classList.add("invalid");
            } else {
                // Si es válido → limpiar error y autocompletar
                input.classList.remove("invalid");
                input.value = parsed;
            }
        });
    });
}

/*
   FUNCIÓN: parseValor(valor)
   Acepta:
   - números normales
   - fracciones tipo "1/2"
   Devuelve:
   - número decimal válido
   - null si es inválido
*/
function parseValor(valor) {
    valor = valor.trim();

    if (valor === "") return null;

    // Caso: número normal
    if (!isNaN(valor)) return Number(valor);

    // Caso: fracción
    if (valor.includes("/")) {
        let partes = valor.split("/");
        if (partes.length === 2) {
            let num = Number(partes[0]);
            let den = Number(partes[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
                return num / den;
            }
        }
    }

    return null;
}

/*
   FUNCIÓN: calcular()
   - Lee la matriz
   - Valida valores
   - Corrige simetría
   - Calcula forma cuadrática
   - Determina definitud
*/
function calcular() {
    const matrizDiv = document.getElementById("matriz");

    // Si no hay matriz generada
    if (!matrizDiv.innerHTML.trim()) {
        alert("Primero genera la matriz.");
        return;
    }

    let n = parseInt(document.getElementById("n").value);
    let A = [];

    // Leer valores de la matriz
    for (let i = 0; i < n; i++) {
        let fila = [];
        for (let j = 0; j < n; j++) {
            let input = document.getElementById(`c${i}${j}`);
            let val = input.value;

            let num = parseValor(val);

            // Si hay error → detener
            if (num === null) {
                alert("Hay valores inválidos. Corrige las celdas en rojo.");
                input.classList.add("invalid");
                input.focus();
                return;
            }

            fila.push(num);
        }
        A.push(fila);
    }

    // Corregir simetría automáticamente
    A = corregirSimetria(A);

    // Calcular forma cuadrática
    let forma = formaCuadratica(A);
    document.getElementById("resultado").innerHTML = "Q(x) = " + forma;

    // Determinar definitud
    let tipo = definitud(A);
    document.getElementById("definitud").innerHTML = "Tipo: " + tipo;
}

/*
   FUNCIÓN: corregirSimetria(A)
   Copia los valores de la parte superior a la inferior
   para garantizar que la matriz sea simétrica.
*/
function corregirSimetria(A) {
    let n = A.length;
    let B = JSON.parse(JSON.stringify(A)); // Copia profunda

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            B[j][i] = B[i][j];
        }
    }

    return B;
}

/*
   Convierte números a superíndices bonitos (², ³, etc.)
*/
function superindice(n) {
    const map = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
    return n.toString().split("").map(c => map[c]).join("");
}

/*
   Genera variables: a, b, c, ...
*/
function generarVariables(n) {
    const letras = "abcdefghijklmnopqrstuvwxyz";
    return letras.slice(0, n).split("");
}

/*
   FUNCIÓN: formaCuadratica(A)
   Construye la expresión simbólica de la forma cuadrática.
*/
function formaCuadratica(A) {
    let n = A.length;
    let vars = generarVariables(n);
    let terminos = [];

    // Términos de la diagonal (a², b², c²...)
    for (let i = 0; i < n; i++) {
        let a = A[i][i];
        if (a !== 0) {
            let coefStr = (a === 1 ? "" : a === -1 ? "-" : a);
            terminos.push(`${coefStr}${vars[i]}${superindice(2)}`);
        }
    }

    // Términos fuera de la diagonal (2ab, 2ac...)
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let a = A[i][j];
            if (a !== 0) {
                let coef = 2 * a;
                let coefStr = (coef === 1 ? "" : coef === -1 ? "-" : coef);
                terminos.push(`${coefStr}${vars[i]}${vars[j]}`);
            }
        }
    }

    if (terminos.length === 0) return "0";

    // Unir términos con signos correctos
    let expr = terminos[0];
    for (let k = 1; k < terminos.length; k++) {
        let t = terminos[k];
        expr += t.startsWith("-") ? " - " + t.slice(1) : " + " + t;
    }

    return expr;
}

/*
   Calcula determinante usando math.js
*/
function determinante(M) {
    return math.det(math.matrix(M));
}

/*
   FUNCIÓN: definitud(A)
   Usa el criterio de Sylvester para clasificar la matriz.
*/
function definitud(A) {
    let n = A.length;
    let menores = [];

    // Calcular menores principales
    for (let k = 1; k <= n; k++) {
        let sub = A.slice(0, k).map(row => row.slice(0, k));
        menores.push(determinante(sub));
    }

    let todosPos = menores.every(m => m > 0);
    let alternaNeg = menores.every((m, i) => ((i % 2 === 0) ? m < 0 : m > 0));
    let semiPos = menores.every(m => m >= 0) && menores.some(m => m === 0);
    let semiNeg = menores.every((m, i) => ((i % 2 === 0) ? m <= 0 : m >= 0)) && menores.some(m => m === 0);

    if (todosPos) return "Definida Positiva";
    if (alternaNeg) return "Definida Negativa";
    if (semiPos) return "Semidefinida Positiva";
    if (semiNeg) return "Semidefinida Negativa";

    return "Indefinida";
}
