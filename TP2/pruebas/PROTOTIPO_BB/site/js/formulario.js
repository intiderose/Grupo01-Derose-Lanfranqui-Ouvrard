"use strict"
let form = document.querySelector('#fomrulario');
form.addEventListener('submit', agregar);

let formData = new FormData(form);
let nombre = formData.get('nombreUsuario');
let apellido = formData.get('apellidoUsuario');
let email = formData.get('emailUsuario');
let telefono = formData.get('telefonoUsuario');
let fecha = formData.get('fechaUsuario');
let lugar = formData.get('dondePaso');
let comentario = formData.get('comentarioUsuario');
let captcha = formData.get('captchaEntrada');


let numerosrandoms1 = Math.floor(Math.random() * 10) + 1;
let numerosrandoms2 = Math.floor(Math.random() * 10) + 1;

document.querySelector("#numeroRamdon1").innerHTML = numerosrandoms1;
document.querySelector("#numeroRamdon2").innerHTML = numerosrandoms2;


function agregar(e) {
    e.preventDefault();
    let respuesta = document.querySelector('#captchaEntradas').value;
    if (respuesta == ((numerosrandoms1) + (numerosrandoms2))) {
        console.log('Excelente');
        document.querySelector(".captchaMensaje").innerHTML = ('Correcto, tus datos fueron enviados!');
    }
    else {
        console.log('Error');
        document.querySelector(".captchaMensaje").innerHTML = ('Incorrecto, por favor intentar nuevamente.');
        numerosrandoms1 = Math.floor(Math.random() * 10) + 1;
        numerosrandoms2 = Math.floor(Math.random() * 10) + 1;
        document.querySelector("#numeroRamdon1").innerHTML = numerosrandoms1;
        document.querySelector("#numeroRamdon2").innerHTML = numerosrandoms2;
    }
}