document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        document.getElementById("detalle-producto").innerHTML = "<p>Producto no encontrado</p>";
        return;
    }

    try {
        const res = await fetch("JSON/productos.json");
        const data = await res.json();
        const producto = data.find(p => p.id == id);
        if (!producto) throw new Error();

        mostrarProducto(producto);
    } catch (e) {
        document.getElementById("detalle-producto").innerHTML = "<p>Error cargando el producto.</p>";
    }
});

function mostrarProducto(producto) {
  const contenedor = document.getElementById("detalle-producto");

  const mapaColores = {
    rojo: "#ff4c4c",
    azul: "#4c6fff",
    morado: "#a64cff",
    rosa: "#ff66b2",
    verde: "#4caf50",
    plateado: "#c0c0c0",
    oro: "#ffd700",
    dorado: "#daa520",
    naranja: "#FFA500",
    arcoiris: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)"
  };

  contenedor.innerHTML = `
    <div class="detalle-container">
      <img src="${producto.imagen || ''}" alt="${producto.nombre || 'Producto'}">
      <h2>${producto.nombre || 'Sin nombre'}</h2>
      ${producto["descripcion-breve"] ? `<p><strong>Características:</strong> ${producto["descripcion-breve"]}</p>` : ''}
      <p id="detalle-descripcion">${producto.descripcion || ''}</p>

      ${producto.Frases?.length ? `<ul>${producto.Frases.map(f => `<li>${f}</li>`).join("")}</ul>` : ""}

      ${producto.tipo?.length ? `
      <div id="seccion-tipo">
        <h4>Tipo de jabón:</h4>
        <select id="select-tipo">
          <option disabled selected value="">-- Selecciona una opción --</option>
          ${producto.tipo.map((tipo, i) => `<option value="${i}">${tipo}</option>`).join("")}
        </select>
      </div>` : ''}

      ${producto.colores?.length ? `
      <div id="colores">
        <h4>Colores disponibles:</h4>
        <div id="color-opciones"></div>
      </div>` : ''}

      ${(producto.gramos && producto.precio) || (producto.gramos2 && producto.precio2) ? `
      <div class="container-presentacion" id="presentaciones">
        <h4>Presentaciones:</h4>
        <div class="btn-presentacion" id="presentacion-opciones"></div>
        <p id="precio-actual"></p>
      </div>` : ''}

      <div class="cantidad-container" id="cantidad">
        <h4>Cantidad:</h4>
        <button id="decrementar">-</button>
        <input type="number" id="cantidad-input" value="1" min="1" max="20" readonly>
        <button id="incrementar">+</button>
      </div>

      <button class="btn-principal" id="agregar-carrito">Agregar al carrito</button>
      <a class="btn-secundario" href="tienda.html">Ir a tienda</a>
    </div>
  `;

  // Colores
  const colorContenedor = document.getElementById("color-opciones");
  if (colorContenedor && producto.colores?.length) {
    producto.colores.forEach((nombreColor, i) => {
      const btn = document.createElement("button");
      btn.classList.add("color-circle");
      btn.dataset.color = nombreColor;

      if (nombreColor.toLowerCase() === "arcoiris") {
        btn.style.background = mapaColores["arcoiris"];
      } else {
        btn.style.backgroundColor = mapaColores[nombreColor.toLowerCase()] || "#ccc";
      }

      if (i === 0) btn.classList.add("activo");

      btn.addEventListener("click", () => {
        document.querySelectorAll(".color-circle").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
      });

      colorContenedor.appendChild(btn);
    });
  }

  // Presentaciones
  const presentacionContenedor = document.getElementById("presentacion-opciones");
  const precioContenedor = document.getElementById("precio-actual");
  const opciones = [];

  if (producto.gramos && producto.precio) {
    opciones.push({ gramos: producto.gramos, precio: producto.precio });
  }
  if (producto.gramos2 && producto.precio2) {
    opciones.push({ gramos: producto.gramos2, precio: producto.precio2 });
  }

  if (presentacionContenedor && opciones.length > 0) {
    presentacionContenedor.innerHTML = "";
    opciones.forEach((op, i) => {
      const btn = document.createElement("button");
      btn.classList.add("presentacion-btn");
      btn.textContent = `${op.gramos}g`;
      btn.dataset.precio = op.precio;
      if (i === 0) btn.classList.add("activo");

      btn.addEventListener("click", () => {
        document.querySelectorAll(".presentacion-btn").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
        precioContenedor.textContent = `Precio: $${op.precio}`;
      });

      presentacionContenedor.appendChild(btn);
    });

    if (precioContenedor) {
      precioContenedor.textContent = `Precio: $${opciones[0].precio}`;
    }
  }

  // Tipos de jabón
  const selectTipo = document.getElementById("select-tipo");
  const descripcion = document.getElementById("detalle-descripcion");
  if (producto.tipo?.length && selectTipo) {
    selectTipo.addEventListener("change", (e) => {
      const index = e.target.value;
      const nuevaDescripcion = producto.descripcionIndv?.[index];
      const nuevaImagen = producto.imagenesTipo?.[index];
      if (nuevaDescripcion) descripcion.textContent = nuevaDescripcion;
      if (nuevaImagen) {
        document.querySelector(".detalle-container img").src = nuevaImagen;
      }
    });
  }

  // Cantidad
  const cantidadInput = document.getElementById("cantidad-input");
  document.getElementById("incrementar").onclick = () => {
    let val = parseInt(cantidadInput.value);
    if (val < 20) cantidadInput.value = val + 1;
  };
  document.getElementById("decrementar").onclick = () => {
    let val = parseInt(cantidadInput.value);
    if (val > 1) cantidadInput.value = val - 1;
  };

  // Agregar al carrito
  document.getElementById("agregar-carrito").onclick = () => {
    const cantidad = parseInt(cantidadInput.value);
    const color = document.querySelector(".color-circle.activo")?.dataset.color || "";
    const presentacion = document.querySelector(".presentacion-btn.activo")?.textContent || "";
    const precio = document.querySelector(".presentacion-btn.activo")?.dataset.precio || producto.precio || 0;

    const tipoIndex = selectTipo?.value;
    const tipoJabonSeleccionado = producto.tipo && tipoIndex !== "" ? producto.tipo[+tipoIndex] : "";

    // Validación obligatoria
    const esJabon = producto.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("jabon");
    if (esJabon && tipoIndex === "") {
      mostrarToast("⚠️ Por favor selecciona un tipo de jabón antes de continuar.");
      selectTipo.focus();
      return;
    }

    const itemCarrito = {
      id: producto.id + 
        (presentacion ? `-${presentacion}` : "") + 
        (color ? `-${color}` : "") + 
        (tipoJabonSeleccionado ? `-${tipoJabonSeleccionado}` : ""),
      nombre: producto.nombre,
      imagen: producto.imagen,
      color,
      presentacion,
      cantidad,
      precio: parseFloat(precio),
      ...(tipoJabonSeleccionado && { tipoJabon: tipoJabonSeleccionado })
    };

    agregarAlCarrito(itemCarrito, cantidad);
    mostrarToast("🛒 ¡Haz añadido un producto al carrito!");
  };
}
