let productosOriginales = [];
let productosFiltrados = [];
let productosMostrados = 0;
const CANTIDAD_POR_CARGA = 6;

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("contenedor-productos");
  const params = new URLSearchParams(window.location.search);
  const busqueda = params.get("buscar")?.toLowerCase() || "";
  const btnToggleFiltros = document.getElementById("btnToggleFiltros");
  const panelFiltros = document.getElementById("panel-filtros");

  if (btnToggleFiltros && panelFiltros) {
    btnToggleFiltros.addEventListener("click", () => {
      panelFiltros.classList.toggle("visible");
    });
  }

  try {
    const respuesta = await fetch("JSON/productos.json");
    productosOriginales = await respuesta.json();

    aplicarFiltros(busqueda);
    configurarEventosDeFiltros();

    // Detectar scroll infinito
    window.addEventListener("scroll", handleScroll);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    contenedor.innerHTML = `<p class="error">Error al cargar los productos.</p>`;
  }
});


/* function aplicarFiltros(busqueda = "") {
  const contenedor = document.getElementById("contenedor-productos");

  productosFiltrados = [...productosOriginales];

  if (busqueda) {
    productosFiltrados = productosFiltrados.filter((producto) =>
      producto.nombre.toLowerCase().includes(busqueda)
    );
  }

  const categoriaSeleccionada = document.getElementById("filtro-categoria")?.value;
  if (categoriaSeleccionada && categoriaSeleccionada !== "todas") {
    productosFiltrados = productosFiltrados.filter((producto) =>
      producto.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
    );
  }

  const precioMin = parseFloat(document.getElementById("filtro-precio-min")?.value || 0);
  const precioMax = parseFloat(document.getElementById("filtro-precio-max")?.value || Infinity);

  productosFiltrados = productosFiltrados.filter((producto) => {
    return producto.precio >= precioMin && producto.precio <= precioMax;
  });

  productosMostrados = 0;
  contenedor.innerHTML = "";
  cargarMasProductos();
} */


function aplicarFiltros(busqueda = "") {
  const contenedor = document.getElementById("contenedor-productos");

  productosFiltrados = [...productosOriginales];

  // Revisar si vino una categoría por la URL y forzarla en el select
  const params = new URLSearchParams(window.location.search);
  const categoriaURL = params.get("categoria");
  const selectCategoria = document.getElementById("filtro-categoria");

  if (categoriaURL && selectCategoria) {
    selectCategoria.value = categoriaURL;
  }

  //  Aplicar filtros normales
  const categoriaSeleccionada = selectCategoria?.value;
  if (categoriaSeleccionada && categoriaSeleccionada !== "todas") {
    productosFiltrados = productosFiltrados.filter((producto) =>
      producto.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
    );
  }

  // Filtro por nombre (busqueda)
  if (busqueda) {
    productosFiltrados = productosFiltrados.filter((producto) =>
      producto.nombre.toLowerCase().includes(busqueda)
    );
  }

  //  Filtros por precio
  const precioMin = parseFloat(document.getElementById("filtro-precio-min")?.value || 0);
  const precioMax = parseFloat(document.getElementById("filtro-precio-max")?.value || Infinity);

  productosFiltrados = productosFiltrados.filter((producto) => {
    return producto.precio >= precioMin && producto.precio <= precioMax;
  });

  productosMostrados = 0;
  contenedor.innerHTML = "";
  cargarMasProductos();
}

function cargarMasProductos() {
  const contenedor = document.getElementById("contenedor-productos");

  const nuevosProductos = productosFiltrados.slice(productosMostrados, productosMostrados + CANTIDAD_POR_CARGA);

  if (nuevosProductos.length === 0 && productosMostrados === 0) {
    contenedor.innerHTML = `<p class="no-result">No se encontraron productos.</p>`;
    return;
  }

  renderizarProductos(nuevosProductos, contenedor);
  productosMostrados += CANTIDAD_POR_CARGA;
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 100) {
    cargarMasProductos();
  }
}

/* function renderizarProductos(productos, contenedor) {
  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.classList.add("producto");

    card.innerHTML = `
      <img src="${producto.imagen || 'assets/img/default.png'}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='assets/img/default.png';" />
      <h3>${producto.nombre}</h3>
      <p>${producto["descripcion-breve"] || producto.descripcion || "Sin descripción."}</p>
      <span class="precio">${typeof producto.precio === "number"
        ? producto.precio.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
        : "Precio no disponible"}</span>
      <div>
      <button class="btn-preview-Tienda">Vista previa</button>
      <button class="btn-Agregar-Carrito" id="agregar-carrito">Agregar al carrito</button>
      </div>
      
    `;
    
    contenedor.appendChild(card);
  });
  



} */

  function renderizarProductos(productos, contenedor) {
  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.classList.add("producto");

    card.innerHTML = `
      <img src="${producto.imagen || 'assets/img/default.png'}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='assets/img/default.png';" />
      <h3>${producto.nombre}</h3>
      <p>${producto["descripcion-breve"] || producto.descripcion || "Sin descripción."}</p>
      <span class="precio">
        ${typeof producto.precio === "number"
          ? producto.precio.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : "Precio no disponible"}
      </span>
      <div>
        <button class="btn-preview-Tienda" data-id="${producto.id}">Ver producto</button>
        <button class="btn-Agregar-Carrito">Agregar al carrito</button>
      </div>
    `;

    
    const btnAgregar = card.querySelector(".btn-Agregar-Carrito");
    btnAgregar.addEventListener("click", () => {
      const cantidad = 1;
      const color = producto.colores?.[0] || "Sin color";
      const presentacion = producto.gramos? `${producto.gramos}g`: "Sin presentación";
      const precio = producto.presentaciones?.[0]?.precio || producto.precio || 0;

      const itemCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        color,
        presentacion,
        cantidad,
        precio: parseFloat(precio),
        imagen: producto.imagen,
      };

      agregarAlCarrito(itemCarrito, cantidad);
      mostrarToast("🛒 ¡Has añadido un producto al carrito!");
    });


    
    contenedor.appendChild(card);
  });
}


//Ir al detalle con el boton ver producto
const contenedor = document.getElementById("contenedor-productos");
contenedor.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-preview-Tienda")) {
    const id = e.target.dataset.id;
    if (id) {
      window.location.href = `detalle.html?id=${id}`;
    } else {
      console.error("ID de producto no encontrado");
    }
  }
});



function configurarEventosDeFiltros() {
  const filtros = ["filtro-categoria", "filtro-precio-min", "filtro-precio-max"];

  filtros.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("change", () => {
        const params = new URLSearchParams(window.location.search);
        const busqueda = params.get("buscar")?.toLowerCase() || "";
        aplicarFiltros(busqueda);
      });
    }
  });

  const btnQuitarFiltros = document.getElementById("quitarFiltros");
  if (btnQuitarFiltros) {
    btnQuitarFiltros.addEventListener("click", () => {
      filtros.forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.value = "";
      });

      window.history.replaceState({}, document.title, window.location.pathname);
      aplicarFiltros();
    });
  }
}



//--------------------------PANEL DE FILTROS ACTIVACION-----
const panelFiltros = document.getElementById("panel-filtros");
const btnToggleFiltros = document.getElementById("btnToggleFiltros");

btnToggleFiltros.addEventListener("click", () => {
  if (panelFiltros.classList.contains("visible")) {
    // Oculta con animación
    panelFiltros.style.opacity = "0";
    panelFiltros.style.transform = "translateX(-20px)";
    setTimeout(() => {
      panelFiltros.style.display = "none";
      panelFiltros.classList.remove("visible");
    }, 300); // debe coincidir con la transición
  } else {
    // Muestra con animación
    panelFiltros.style.display = "block";
    setTimeout(() => {
      panelFiltros.classList.add("visible");
      panelFiltros.style.opacity = "1";
      panelFiltros.style.transform = "translateX(0)";
    }, 10); // leve retardo para que display:block se aplique antes
  }
});


