let productos = [];
let pagina = 0;
const porPagina = 6;
const contenedor = document.getElementById("contenedor-productos");

// Función principal que carga todos los productos del JSON
async function cargarProductos() {
  try {
    const respuesta = await fetch("JSON/productos.json");
    productos = await respuesta.json();
    cargarLote(); // Mostrar el primer lote
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Cargar los productos por lotes
function cargarLote() {
  const inicio = pagina * porPagina;
  const fin = inicio + porPagina;
  const lote = productos.slice(inicio, fin);

  lote.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>${producto["descripcion-breve"] || producto.descripcion}</p>
      <p><strong>Precio:</strong> $${producto.precio}</p>
      <button class="btn-preview">Vista previa</button>
    `;
    
    // Agregar evento al botón de vista previa
    const btn = div.querySelector(".btn-preview");
    btn.addEventListener("click", () => {
      mostrarModal(producto);
    });

    contenedor.appendChild(div);
  });

  pagina++;
}

// Mostrar el modal con la info del producto
function mostrarModal(producto) {
  const modal = document.getElementById("modal");
  const img = document.getElementById("modal-img");
  const nombre = document.getElementById("modal-nombre");
  const descripcion = document.getElementById("modal-descripcion");
  const colorContenedor = document.getElementById("color-opciones");
  const presentacionContenedor = document.getElementById("presentacion-opciones");
  const precioContenedor = document.getElementById("modal-precio");
  const seccionTipo = document.getElementById("seccion-tipo");
  const selectTipo = document.getElementById("select-tipo");
  const seccionColor = document.getElementById("seccion-color");
  const seccionPresentacion = document.getElementById("seccion-presentacion");

  // Asignar datos básicos
  img.src = producto.imagen;
  img.alt = producto.nombre;
  nombre.textContent = producto.nombre;
  descripcion.textContent = producto["descripcion"] || "";

  // ========== COLORES ==========
  colorContenedor.innerHTML = "";
  seccionColor.style.display = "none";
  const mapaColores = {
  rojo: "#ff4c4c",
  azul: "#4c6fff",
  morado: "#a64cff",
  rosa: "#ff66b2",
  verde: "#4caf50",
  plateado: "#c0c0c0",
  oro: "#ffd700",
  dorado: "#daa520",
  naranja:"#FFA500",
  arcoiris:"#ff1c1cff"
};
  if (producto.colores && producto.colores.length > 0) {
    seccionColor.style.display = "block";
    colorContenedor.innerHTML = "";

    producto.colores.forEach((nombreColor, i) => {
      const btn = document.createElement("button");
      btn.classList.add("color-circle");

      const colorReal = mapaColores[nombreColor.toLowerCase()] || "#ccc";
      btn.style.backgroundColor = colorReal;
      btn.dataset.color = nombreColor;
      btn.title = nombreColor; // Tooltip al pasar el mouse
      if (nombreColor.toLowerCase() === "arcoiris") {
        btn.classList.add("arcoiris");
      } else {
        const colorReal = mapaColores[nombreColor.toLowerCase()] || "#ccc";
        btn.style.backgroundColor = colorReal;
      }
      if (i === 0) btn.classList.add("activo");

      btn.addEventListener("click", () => {
        document.querySelectorAll(".color-circle").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
      });

      colorContenedor.appendChild(btn);
    });
}

 presentacionContenedor.innerHTML = "";
seccionPresentacion.style.display = "none";

const tieneGramos1 = producto.gramos && producto.precio;
const tieneGramos2 = producto.gramos2 && producto.precio2;

if (tieneGramos1 && tieneGramos2) {
  seccionPresentacion.style.display = "block";

  const opciones = [
    { gramos: producto.gramos, precio: producto.precio },
    { gramos: producto.gramos2, precio: producto.precio2 }
  ];

  opciones.forEach((op, i) => {
    const btn = document.createElement("button");
    btn.classList.add("presentacion-btn");
    btn.textContent = `${op.gramos}g`;
    btn.dataset.precio = op.precio;
    if (i === 0) btn.classList.add("activo");

    btn.addEventListener("click", () => {
      document.querySelectorAll(".presentacion-btn").forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      precioContenedor.textContent = `$${op.precio}`;
    });

    presentacionContenedor.appendChild(btn);
  });

  precioContenedor.textContent = `$${producto.precio}`;
} else if (tieneGramos1) {
  seccionPresentacion.style.display = "block";

  const btn = document.createElement("button");
  btn.classList.add("presentacion-btn", "activo");
  btn.textContent = `${producto.gramos}g`;
  btn.dataset.precio = producto.precio;

  // Por si en el futuro se agregan más, aún permite seleccionar
  btn.addEventListener("click", () => {
    document.querySelectorAll(".presentacion-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    precioContenedor.textContent = `$${producto.precio}`;
  });

  presentacionContenedor.appendChild(btn);
  precioContenedor.textContent = `$${producto.precio}`;
} else if (producto.precio) {
  precioContenedor.textContent = `$${producto.precio}`;
  seccionPresentacion.style.display = "none";
} else {
  precioContenedor.textContent = "Precio no disponible";
  seccionPresentacion.style.display = "none";
}

  // ========== CANTIDAD ==========
  let cantidad = 1;
  const cantidadSpan = document.getElementById("cantidad");
  const btnMenos = document.getElementById("disminuir-cantidad");
  const btnMas = document.getElementById("aumentar-cantidad");

  cantidadSpan.textContent = cantidad;

  btnMenos.onclick = () => {
    if (cantidad > 1) {
      cantidad--;
      cantidadSpan.textContent = cantidad;
    }
  };

  btnMas.onclick = () => {
    cantidad++;
    cantidadSpan.textContent = cantidad;
  };


  // ========== AGREGAR AL CARRITO ==========
  const btnAgregar = document.getElementById("agregar-al-carrito");
/*  btnAgregar.onclick = () => {
  const btnPresentacion = document.querySelector(".presentacion-btn.activo");
  const presentacionSeleccionada = btnPresentacion ? btnPresentacion.textContent : "";
  const precio = btnPresentacion?.dataset.precio || producto.precio;
  const btnColor = document.querySelector(".color-circle.activo");
  const colorSeleccionado = btnColor ? btnColor.title || btnColor.dataset.color : "";

  const itemCarrito = {
    id: producto.id,
    nombre: producto.nombre,
    imagen: producto.imagen,
    color: colorSeleccionado,
    presentacion: presentacionSeleccionada,
    cantidad: cantidad,
    precio: parseInt(precio),
  };

  agregarAlCarrito(itemCarrito, cantidad);
  cerrarModal();
  mostrarToast("🛒¡Haz añadido un producto al carrito!");
}; 
 */

btnAgregar.onclick = () => {
  const btnPresentacion = document.querySelector(".presentacion-btn.activo");
  const presentacionSeleccionada = btnPresentacion ? btnPresentacion.textContent : "";
  const precio = btnPresentacion?.dataset.precio || producto.precio;

  const btnColor = document.querySelector(".color-circle.activo");
  const colorSeleccionado = btnColor ? btnColor.title || btnColor.dataset.color : "";

  // ✅ Validación robusta sin tildes
  const esJabon = producto.nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .includes("jabon");

  const tipoJabonSelect = document.getElementById("select-tipo");
  const indexTipo = tipoJabonSelect?.value;
  const tipoJabonSeleccionado = esJabon && indexTipo !== "" ? producto.tipo?.[+indexTipo] : "";

  // ❌ Si el producto es jabón y no seleccionó un tipo
  if (esJabon && indexTipo === "") {
    mostrarToast("⚠️ Por favor selecciona un tipo de jabón antes de continuar.");
    tipoJabonSelect.focus();
    return;
  }

const itemCarrito = {
  id: producto.id + 
      (presentacionSeleccionada ? `-${presentacionSeleccionada}` : "") + 
      (colorSeleccionado ? `-${colorSeleccionado}` : "") + 
      (tipoJabonSeleccionado ? `-${tipoJabonSeleccionado}` : ""),
  nombre: producto.nombre,
  imagen: producto.imagen,
  color: colorSeleccionado,
  presentacion: presentacionSeleccionada,
  cantidad: cantidad,
  precio: parseInt(precio),
  ...(tipoJabonSeleccionado && { tipoJabon: tipoJabonSeleccionado })
};

  agregarAlCarrito(itemCarrito, cantidad);
  cerrarModal();
  mostrarToast("🛒 ¡Haz añadido un producto al carrito!");
};




// ========== TIPOS DE JABÓN ==========


if (producto.tipo && producto.tipo.length > 0) {
  seccionTipo.style.display = "block";
  selectTipo.innerHTML = ""; // Limpiar opciones anteriores

  // 🔹 Opción por defecto
  const opcionDefault = document.createElement("option");
  opcionDefault.textContent = "-- Selecciona una opción --";
  opcionDefault.value = ""; // Valor vacío
  opcionDefault.disabled = true;
  opcionDefault.selected = true;
  selectTipo.appendChild(opcionDefault);

  // 🔹 Opciones de tipos
  producto.tipo.forEach((tipoNombre, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = tipoNombre;
    selectTipo.appendChild(option);
  });

  // Evento de cambio de tipo
  selectTipo.addEventListener("change", (e) => {
    const index = e.target.value;

    if (index === "") {
      // Volvió a la opción por defecto
      img.src = producto.imagen;
      descripcion.textContent = producto.descripcion || "";
      return;
    }

    const nuevaDescripcion = producto.descripcionIndv?.[index];
    const nuevaImagen = producto.imagenesTipo?.[index];

    if (nuevaDescripcion) descripcion.textContent = nuevaDescripcion;
    if (nuevaImagen) img.src = nuevaImagen;
  });
} else {
  seccionTipo.style.display = "none";
}



  // Botón "Ver producto"
const verProductoBtn = document.getElementById("ver-producto");
verProductoBtn.onclick = () => {
  if (producto && producto.id) {
    window.location.href = `detalle.html?id=${producto.id}`;
  } else {
    console.error("No hay producto válido para mostrar");
  }
};
  // Mostrar modal
  modal.classList.remove("oculto");
  modal.style.display = "block";






}


  // ========== CANTIDAD ==========
  let cantidad = 1;
  const cantidadSpan = document.getElementById("cantidad");
  const btnMenos = document.getElementById("disminuir-cantidad");
  const btnMas = document.getElementById("aumentar-cantidad");

  btnMenos.onclick = () => {
    if (cantidad > 1) {
      cantidad--;
      cantidadSpan.textContent = cantidad;
    }
  };

  btnMas.onclick = () => {
    cantidad++;
    cantidadSpan.textContent = cantidad;
  };




// Cerrar el modal
function cerrarModal() {
  const modal = document.getElementById("modal");
  modal.classList.add("oculto");
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  // Cerrar modal al hacer clic en la X
  const cerrar = document.querySelector(".cerrar");
  cerrar.addEventListener("click", cerrarModal);

  // Cerrar modal si se hace clic fuera del contenido
  const modal = document.getElementById("modal");
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });
});

// Scroll infinito
window.addEventListener("scroll", () => {
  const cercaDelFinal = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

  if (cercaDelFinal && (pagina * porPagina) < productos.length) {
    cargarLote();
  }
});



//Funcion de categorias
document.querySelectorAll('.btn-categoria').forEach(btn => {
  btn.addEventListener('click', () => {
    const categoria = encodeURIComponent(btn.dataset.categoria);
    window.location.href = `tienda.html?categoria=${categoria}`;
  });
});