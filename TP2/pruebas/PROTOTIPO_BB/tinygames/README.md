# Página TinyGames

Esta página es una implementación del prototipo de Figma para "TinyGames". Se ha creado siguiendo las convenciones de estilo y estructura del proyecto `PROTOTIPO_BB`.

## Cómo ejecutar

1.  Abre el archivo `PROTOTIPO_BB/tinygames/index.html` en un navegador web.
2.  No se requiere un servidor local ni pasos de compilación, ya que utiliza HTML, CSS y JavaScript planos.

## Estructura y Estilo

-   **HTML**: Se utiliza marcado semántico con atributos ARIA para mejorar la accesibilidad.
-   **CSS**: Se sigue una metodología similar a BEM (`bloque__elemento--modificador`) para las clases. Los valores de diseño clave (colores, espaciado) se definen como variables CSS en `:root`. El diseño es *mobile-first*.
-   **JavaScript**: El comportamiento interactivo del encabezado está encapsulado en una clase `TinyGamesHeader` en `main.js`, que se instancia cuando el DOM está completamente cargado.

## Lista de Verificación de QA

-   [ ] **Responsividad**: Verificar que el encabezado se adapta correctamente en diferentes tamaños de pantalla (móvil, tablet, escritorio). La barra de búsqueda debe aparecer en vistas más amplias.
-   [ ] **Navegación con teclado**:
    -   [ ] Se puede acceder a todos los elementos interactivos del encabezado (hamburguesa, logo, búsqueda, avatar) usando la tecla `Tab`.
    -   [ ] Los menús desplegables (hamburguesa y avatar) se pueden abrir con `Enter` o `Espacio`.
    -   [ ] Se puede navegar por los enlaces dentro de los menús desplegables.
-   [ ] **Accesibilidad**:
    -   [ ] Los botones tienen etiquetas `aria-label` descriptivas.
    -   [ ] Los menús desplegables utilizan `aria-expanded` para indicar su estado.
    -   [ ] Las imágenes tienen texto `alt` apropiado (el avatar es decorativo pero tiene un `alt` para contexto).
    -   [ ] El campo de búsqueda tiene una `<label>` asociada (visible solo para lectores de pantalla).
-   [ ] **Funcionalidad**:
    -   [ ] Al hacer clic en el botón de hamburguesa se muestra/oculta el menú lateral.
    -   [ ] Al hacer clic en el avatar se muestra/oculta el menú de usuario.
    -   [ ] Los menús se cierran al hacer clic fuera de ellos.

## Recursos de Figma a Reemplazar

-   **Icono de Avatar**: El avatar actual (`assets/tinygames/avatar-placeholder.svg`) es un marcador de posición. Debe ser reemplazado por el icono de avatar final del diseño de Figma.
-   **Iconos**: Los iconos de hamburguesa y búsqueda son SVGs en línea. Si el diseño de Figma especifica iconos personalizados, estos deben ser reemplazados.

---
**Mensaje de commit sugerido:**

```
feat(tinygames): create TinyGames page and header following PROTOTIPO_BB style
```

**Descripción de PR sugerida:**

```
Adds TinyGames page implementing Figma prototype at {FIGMA_URL}. Header uses #1E90FF background, Luckiest Guy brand TINYGAMES in #FFA866, hamburger and avatar edge spacing 34px, logo gap 50px. Mirrors styling and structure from PROTOTIPO_BB; README included with QA checklist.
```

