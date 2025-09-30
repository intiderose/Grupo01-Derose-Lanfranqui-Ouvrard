"use strict"
const url = 'https://6670525f0900b5f8724a361e.mockapi.io/api/pedidos';

const tabla = document.querySelector("#filaTabla");

const filasMaximas = 5;

let idEditar = null;

let paginaActual = 1;

document.querySelector("#btn_enviar").addEventListener("click", enviarDatos);
document.querySelector("#btn_enviarX3").addEventListener("click", enviarX3Datos);
document.querySelector("#btn_anteriorPag").addEventListener("click", paginaAnterior);
document.querySelector("#btn_siguientePag").addEventListener("click", paginaSiguiente);



function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarDatos(paginaActual);
        document.querySelector("#numeroPagina").innerHTML = paginaActual;
    }
}

function paginaSiguiente() {
    paginaActual++;
    mostrarDatos(paginaActual);
    document.querySelector("#numeroPagina").innerHTML = paginaActual;
}

async function mostrarDatos(pagina) {
    try {
        tabla.innerHTML = `<tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Comentario</th>
                                <th>Precio</th>
                                <th>Modificar</th>
                            </tr>`;
        let res = await fetch(`${url}?page=${pagina}&limit=${filasMaximas}`);
        let json = await res.json();
        console.log(json);
        for (const pedidos of json) {
            let nombre = pedidos.producto;
            let cantidad = pedidos.cantidad;
            let comentario = pedidos.comentario;
            let precio = pedidos.precio;
            let id = pedidos.id;
            let fila = document.createElement('tr');
            fila.innerHTML = `<td>${nombre}</td>
                              <td>${cantidad}</td>
                              <td>${comentario}</td>
                              <td>$ ${precio}</td>
                              <td id="botonesModificables_${id}"></td>`;
            tabla.appendChild(fila);

            let btnEliminar = document.createElement("button");
            btnEliminar.innerHTML = "Eliminar";
            btnEliminar.addEventListener("click", () => eliminarDatos(id));

            let btnEditar = document.createElement("button");
            btnEditar.innerHTML = "Editar";
            btnEditar.addEventListener("click", () => editarDatosEnFormulario(id, nombre, cantidad, comentario, precio));

            let tdModificables = document.querySelector(`#botonesModificables_${id}`);
            tdModificables.appendChild(btnEliminar);
            tdModificables.appendChild(btnEditar);
        }
    } catch (error) {
        console.log(error);
    }
}

async function enviarDatos(){
    let productos = document.querySelector("#productoCarrito").value;
    let cantidades = document.querySelector("#cantidadCarrito").value;
    let comentarios = document.querySelector("#comentarioCarrito").value;
    let precios = document.querySelector("#precioCarrito").value;
    let pedidos = {
        "producto": productos,
        "cantidad": cantidades,
        "comentario": comentarios,
        "precio": precios
    };

    try{
        if (idEditar) {            // hacemos un PUT (editamos)
            let res = await fetch(`${url}/${idEditar}`, {
                "method": "PUT",
                "headers": { "Content-type": "application/json" },
                "body": JSON.stringify(pedidos)
            });
            if (res.status == 200) {
                console.log("Editado!");
                mostrarDatos(paginaActual);
                idEditar = null;
            }
        } else {            // hacemos un POST (creamos)
            let res = await fetch(url, {
                "method": "POST",
                "headers": { "Content-type": "application/json" },
                "body": JSON.stringify(pedidos)
            });
            if (res.status == 201) {
                console.log("Creado!");
                mostrarDatos(paginaActual);   
            }
        }
        vaciarFormulario();
    } catch (error) {
        console.log(error);
    }
}

async function enviarX3Datos() {
    let productos = document.querySelector("#productoCarrito").value;
    let cantidades = document.querySelector("#cantidadCarrito").value;
    let comentarios = document.querySelector("#comentarioCarrito").value;
    let precios = document.querySelector("#precioCarrito").value;
    let pedidos = {
        "producto": productos,
        "cantidad": cantidades,
        "comentario": comentarios,
        "precio": precios
    };

    try {
        for (let i = 0; i < 3; i++) {
            let res = await fetch(url, {
                "method": "POST",
                "headers": { "Content-type": "application/json" },
                "body": JSON.stringify(pedidos)
            });
        }
        console.log("Se agregaron las 3 filas");
        mostrarDatos(paginaActual);
        vaciarFormulario();
    } catch (error) {
        console.log(error);
    }
}

async function eliminarDatos(id){
    try{
        let res = await fetch(`${url}/${id}`, {
            "method": "DELETE",
        });
        if (res.status == 200) {
            console.log("Eliminado!");
            mostrarDatos(paginaActual);   
        }
    } catch (error) {
        console.log(error);
    }
}

function editarDatosEnFormulario(id, nombre, cantidad, comentario, precio) {
    document.querySelector("#productoCarrito").value = nombre;
    document.querySelector("#cantidadCarrito").value = cantidad;
    document.querySelector("#comentarioCarrito").value = comentario;
    document.querySelector("#precioCarrito").value = precio;
    idEditar = id; 
}

function vaciarFormulario() {
    document.querySelector("#productoCarrito").value = '';
    document.querySelector("#cantidadCarrito").value = '';
    document.querySelector("#comentarioCarrito").value = '';
    document.querySelector("#precioCarrito").value = '';
}


mostrarDatos(paginaActual);