// === ABRIR Y CERRAR PANEL DEL CARRITO ===
const btnAbrirCarrito = document.querySelector('.btn-carrito');
const panelCarrito = document.getElementById('panel-carrito');
const btnCerrarCarrito = document.getElementById('cerrar-carrito');

btnAbrirCarrito.addEventListener('click', () => {
    panelCarrito.classList.remove('oculto');
});
btnCerrarCarrito.addEventListener('click', () => {
    panelCarrito.classList.add('oculto');
});

// === INICIALIZAR CARRITO DESDE LOCAL STORAGE ===
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);

    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? "inline" : "none";
}

function agregarAlCarrito(producto, cantidad = 1) {
    const existente = carrito.find(item =>
        item.id === producto.id &&
        item.color === producto.color &&
        item.presentacion === producto.presentacion &&
        (item.tipoJabon || "") === (producto.tipoJabon || "")
    );

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }

    guardarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
}

function cambiarCantidad(id, color, presentacion, tipoJabon = "", cambio) {
    const item = carrito.find(p =>
        p.id === id &&
        p.color === color &&
        p.presentacion === presentacion &&
        (p.tipoJabon || "") === tipoJabon
    );

    if (!item) return;

    item.cantidad += cambio;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(p =>
            !(p.id === id &&
              p.color === color &&
              p.presentacion === presentacion &&
              (p.tipoJabon || "") === tipoJabon)
        );
    }

    guardarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
}

function eliminarDelCarrito(id, color, presentacion, tipoJabon = "") {
    carrito = carrito.filter(item =>
        !(item.id === id &&
          item.color === color &&
          item.presentacion === presentacion &&
          (item.tipoJabon || "") === tipoJabon)
    );

    guardarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
}

function renderizarCarrito() {
    const contenedor = document.getElementById("carrito-items");
    contenedor.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        if (!item || typeof item !== "object" || !item.id || !item.nombre) return;

        const precioValido = typeof item.precio === 'number' ? item.precio : 0;
        total += precioValido * (item.cantidad || 1);

        const imagen = item.imagen || "assets/img/default.png";
        const color = item.color ? `<p>🎨 Color: ${item.color}</p>` : "";
        const presentacion = item.presentacion ? `<p>📦 Presentación: ${item.presentacion}</p>` : "";
        const gramos = item.gramos ? `<p>⚖️ ${item.gramos}</p>` : "";
        const tipoJabon = item.tipoJabon ? `<p>🧼 Tipo de jabón: ${item.tipoJabon}</p>` : "";

        const div = document.createElement("div");
        div.classList.add("carrito-item");

        div.innerHTML = `
            <img src="${imagen}" alt="${item.nombre}" onerror="this.onerror=null;this.src='assets/img/default.png';" />
            <div class="carrito-item-info">
                <p><strong>${item.nombre}</strong></p>
                ${color}
                ${presentacion}
                ${tipoJabon}
                ${gramos}
                <p>💵 Precio: ${precioValido.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })}</p>
                <div class="carrito-item-cantidad">
                    <button class="btn-disminuir">-</button>
                    <span>${item.cantidad || 1}</span>
                    <button class="btn-aumentar">+</button>
                    <button class="btn-eliminar">Eliminar</button>
                </div>
            </div>
        `;

        // Asignar eventos
        const btnAumentar = div.querySelector(".btn-aumentar");
        const btnDisminuir = div.querySelector(".btn-disminuir");
        const btnEliminar = div.querySelector(".btn-eliminar");

        btnAumentar.addEventListener("click", () => {
            cambiarCantidad(item.id, item.color, item.presentacion, item.tipoJabon, 1);
        });

        btnDisminuir.addEventListener("click", () => {
            cambiarCantidad(item.id, item.color, item.presentacion, item.tipoJabon, -1);
        });

        btnEliminar.addEventListener("click", () => {
            eliminarDelCarrito(item.id, item.color, item.presentacion, item.tipoJabon);
        });

        contenedor.appendChild(div);
    });

    if (carrito.length === 0 || contenedor.children.length === 0) {
        contenedor.innerHTML = "<p>🛒 Tu carrito está vacío.</p>";
    }
}

// === AL INICIAR LA PÁGINA ===
document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrito();
    actualizarContadorCarrito();
});
//MENSAJE DE WHATSAPP

document.getElementById("comprar-carrito").addEventListener("click", () => {
    if (carrito.length === 0) {
        mostrarToast("🛒 Tu carrito está vacío");
        return;
    }

    const productosValidos = carrito.filter(item =>
        item &&
        typeof item.precio === "number" &&
        typeof item.cantidad === "number"
    );

    if (productosValidos.length === 0) {
        mostrarToast("⚠️ No hay productos en el carrito");
        return;
    }

    let mensaje = "¡Hola! 👋 Me gustaría hacer el siguiente pedido:\n\n";

    productosValidos.forEach((item) => {
        mensaje += `🛒 *${item.nombre || "Producto sin nombre"}* x ${item.cantidad}\n`;

        if (item.presentacion) {
            mensaje += `   📦 Presentación: ${item.presentacion}\n`;
        }

        if (item.color) {
            mensaje += `   🎨 Color: ${item.color}\n`;
        }

        if (item.tipoJabon) {
            mensaje += `   🧼 Tipo de jabón: ${item.tipoJabon}\n`;
        }

        if (item.gramos) {
            mensaje += `   ⚖️ Gramos: ${item.gramos}\n`;
        }

        mensaje += `\n`;
    });

    

    // Calcular total con seguridad
    const total = productosValidos.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    mensaje += `💰 *Total a pagar:* ${total.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}\n\n`;

    mensaje += `✅ Quedo atento(a) para confirmar el pedido.`;

    const numero = ""; // Reemplaza con tu número de WhatsApp en formato internacional, ej: "573001234567"
    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
});

// Mostrar y ocultar panel
document.querySelector(".btn-carrito").addEventListener("click", () => {
    document.getElementById("panel-carrito").classList.remove("oculto");
});
document.getElementById("cerrar-carrito").addEventListener("click", () => {
    document.getElementById("panel-carrito").classList.add("oculto");
});



// Iniciar carrito cuando carga la página
/* document.addEventListener("DOMContentLoaded", renderizarCarrito); */
document.addEventListener("DOMContentLoaded", () => {
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    renderizarCarrito();
    actualizarContadorCarrito();
});



// Función toast
function mostrarToast(mensaje) {
    const toast = document.createElement("div");
    toast.textContent = mensaje;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "14px";
    toast.style.zIndex = "9999";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
    document.body.appendChild(toast);

    // Forzar reflow antes de mostrar
    setTimeout(() => {
        toast.style.opacity = "1";
    }, 10);

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
        document.body.removeChild(toast);
        }, 500);
    }, 3000);
}




//Carrito contador
function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");

    // Filtra productos válidos: deben tener id y nombre como mínimo
    const productosValidos = carrito.filter(item =>
        item && typeof item === "object" && item.id && item.nombre
    );

    const cantidadTipos = productosValidos.length;
    contador.textContent = cantidadTipos;

    contador.style.display = cantidadTipos > 0 ? "inline" : "none";
}


//Vaciar carrito for debug
function vaciarCarrito() {
    carrito = []; // Limpia la variable del carrito
    localStorage.removeItem("carrito"); // Elimina del almacenamiento local
    renderizarCarrito(); // Redibuja el panel del carrito
    actualizarContadorCarrito(); // Actualiza el contador visual
    console.log("🧹 Carrito vaciado");
}


