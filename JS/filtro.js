document.addEventListener('DOMContentLoaded', () => {
  const inputBusqueda = document.getElementById('srch');
  const listaSugerencias = document.getElementById('sugerencias');
  const btnBorrar = document.getElementById('btnBorrar');
  const formBuscar = document.getElementById('formBuscar');

  let productos = [];

  // 1. Cargar productos
  fetch('JSON/productos.json')
    .then(res => res.json())
    .then(data => productos = data)
    .catch(err => console.error('Error al cargar productos:', err));

  // 2. Mostrar sugerencias mientras escribes
  inputBusqueda.addEventListener('input', () => {
    const texto = inputBusqueda.value.trim().toLowerCase();
    listaSugerencias.innerHTML = '';

    if (texto === '') {
      listaSugerencias.style.display = 'none';
      return;
    }

    const coincidencias = productos.filter(p =>
      p.nombre.toLowerCase().includes(texto)
    );

    if (coincidencias.length === 0) {
      listaSugerencias.innerHTML = '<li>No hay coincidencias</li>';
    } else {
      coincidencias.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = producto.nombre;
        li.addEventListener('click', () => {
          inputBusqueda.value = producto.nombre;
          listaSugerencias.innerHTML = '';
          listaSugerencias.style.display = 'none';

          // Redirigir directamente al hacer click en sugerencia
          window.location.href = `tienda.html?buscar=${encodeURIComponent(producto.nombre)}`;
        });
        listaSugerencias.appendChild(li);
      });
    }

    listaSugerencias.style.display = 'block';
  });

  // 3. Botón "x" limpia
  btnBorrar.addEventListener('click', () => {
    inputBusqueda.value = '';
    listaSugerencias.innerHTML = '';
    listaSugerencias.style.display = 'none';
    inputBusqueda.focus();
  });

  // 4. Submit (lupa)
  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBusqueda.value.trim();
    if (texto !== '') {
      window.location.href = `tienda.html?buscar=${encodeURIComponent(texto)}`;
    }
  });
});