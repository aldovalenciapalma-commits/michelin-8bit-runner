# 🏁 BIBENDUM RUNNER: MICHELIN 8-BIT HIGHWAY DASH

Un videojuego retro de 8 bits estilo arcade horizontal (inspirado en Subway Surfers y el dinosaurio de Google), protagonizado por **Bibendum** (el muñeco Michelin).

---

## 🎮 Características del Juego

1. **Perspectiva Horizontal en 3 Carriles (Superior, Medio, Inferior)**:
   - Bibendum corre de izquierda a derecha sobre una autopista al atardecer.
   - Movimiento fluido entre carriles con esquiva vertical, salto y deslizamiento.

2. **Mecánicas & Controles**:
   - **Cambio de Carril**: `W` / `▲ Flecha Arriba` (Subir) y `S` / `▼ Flecha Abajo` (Bajar).
   - **Salto**: `Barra Espaciadora` (permite saltar sobre obstáculos terrestres).
   - **Agacharse / Deslizarse**: `Alt` (mantén presionado para agacharte el tiempo que desees bajo obstáculos altos).
   - **Controles Táctiles y de Ratón**: Botones virtuales en pantalla para jugar en pantallas táctiles o con ratón.

3. **Obstáculos Extraídos del Arte Conceptual y Retro 8-Bit**:
   - 🚗 **Carros Rojos**: Vienen a gran velocidad hacia Bibendum. *¡No se pueden saltar, debes cambiar de carril!*
   - 🛑 **Vallas de Obra**: Obstáculos medianos. *Salta o cambia de carril.*
   - 🕳️ **Baches en el Pavimento**: Grietas profundas. *Salta o cambia de carril.*
   - 🪚 **Clavos / Púas**: Dañan los neumáticos. *Salta o cambia de carril.*
   - 💧 **Charcos de Agua**: Resbaladizos. *Salta o cambia de carril.*
   - 🦅 **Pájaros Voladores**: Vuelan aleteando a la altura de la cabeza. *¡Mantén presionado ALT para agacharte por debajo o cambia de carril!*

4. **Sistema de Puntos & Coleccionables**:
   - 🛞 **Llantas Doradas Animadas**: Giran en los carriles otorgando +100 puntos cada una.
   - 🛡️ **Escudo Dorado**: Absorbe 1 impacto sin perder vidas.
   - 🧲 **Imán de Llantas**: Atrae magnéticamente todas las llantas doradas cercanas durante 8 segundos.
   - 🔧 **Llanta de Repuesto**: Recupera 1 vida perdida (máximo 3).

5. **Sistema de Vidas (3 Llantas Michelin)**:
   - Indicador idéntico al arte conceptual con 3 llantas en el HUD superior izquierdo.
   - Efecto de sacudida de pantalla (*screen shake*), parpadeo de invulnerabilidad temporal y sonido de daño retro.

6. **Dificultad Progresiva**:
   - A medida que aumentan la distancia y los puntos, la velocidad del juego se incrementa progresivamente y los patrones de obstáculos se vuelven más dinámicos y desafiantes, garantizando siempre rutas posibles de evasión.

7. **Banda Sonora y Efectos de Sonido 8-bit**:
   - Música de fondo original: `One_More_Quarter.mp3` en bucle continuo.
   - Efectos sintetizados en tiempo real con Web Audio API (salto, deslizamiento, recolección de llantas, choque y fanfarria de game over).

---

## 🚀 Cómo Jugar

### Opción 1: Lanzador de 1 Clic (Recomendado)
Haz doble clic en el archivo **`start_game.bat`**. Se iniciará un servidor local y se abrirá automáticamente tu navegador web en `http://localhost:8080`.

### Opción 2: Abrir directamente
Abre el archivo **`index.html`** directamente con cualquier navegador web moderno (Google Chrome, Microsoft Edge, Firefox, etc.).

