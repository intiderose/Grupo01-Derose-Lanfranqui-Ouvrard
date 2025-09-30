"use strict"
/*codigo para hacer el menu responsibe*/
document.querySelector(".btn_menu").addEventListener("click", function(e) {
    document.querySelector(".navegacion").classList.toggle("show");
});



/*codigo para modo claro y oscuro*/
let body = document.body;
body.classList.add('modo-claro');

let ModoClaro = document.querySelector('#boton_claro');
let ModoOscuro = document.querySelector('#boton_oscuro');
    
ModoClaro.addEventListener('click', function(e){
    body.classList.remove('modo-oscuro');
    body.classList.add('modo-claro');
});

ModoOscuro.addEventListener('click', function(e){
    body.classList.remove('modo-claro');
    body.classList.add('modo-oscuro');
});