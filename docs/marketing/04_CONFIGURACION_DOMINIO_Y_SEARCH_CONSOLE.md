# 🌐 Guía Técnica: Dominio Propio (.com) y Google Search Console
## Cómo Salir del Tráfico Local de Uruguay y Posicionar Internacionalmente

> [!IMPORTANT]
> **Por qué tu Google Search Console solo mostraba Uruguay:**
> 1. Un subdominio gratuito (`spirixtotal.netlify.app`) tiene un techo de confianza bajo para Google y no tiene geolocalización global sólida.
> 2. Tu web solo tenía indexada la home y la página live.
> 3. Al implementar el dominio `.com` y las nuevas páginas de **Taekwondo**, **Karate** y **Kickboxing**, Google empezará a mostrarte en Argentina, México, Chile, Colombia y España.

---

### Paso 1: Adquirir el Dominio Propio (.com)
1. Ingresa a un registrador de confianza (por ejemplo: **Namecheap.com**, **Porkbun.com** o **Cloudflare Registrar**).
2. Busca la disponibilidad de:
   * `spirixtotal.com` (Primera opción recomendada).
   * Si no estuviera disponible: `spirixtotal.net` o `spirixtotal-sports.com`.
3. El costo ronda entre **\$10 y \$14 USD al año**.

---

### Paso 2: Conectar el Dominio en Netlify (3 Minutos)
1. Inicia sesión en tu panel de **Netlify**.
2. Ve a tu proyecto de SpirixTotal.
3. Haz clic en **"Site configuration"** > **"Domain management"**.
4. Haz clic en **"Add a domain"** e introduce `spirixtotal.com`.
5. Netlify te dará dos opciones:
   * **Opción A (Recomendada - Netlify DNS):** Cambiar los Nameservers en tu registrador por los que te brinda Netlify (`dns1.p01.nsone.net`, etc.). Netlify se encargará del certificado SSL HTTPS automático.
   * **Opción B (Registrador DNS):** Crear un registro `A` apuntando a `75.2.60.5` y un `CNAME` para `www` apuntando a `spirixtotal.netlify.app`.

---

### Paso 3: Configurar Google Search Console para Alcance Internacional
1. Ve a [Google Search Console](https://search.google.com/search-console).
2. Haz clic en **"Añadir propiedad"** (arriba a la izquierda).
3. Selecciona la opción **"Dominio"** (cubre tanto `http`, `https`, `www` y subdominios) e introduce `spirixtotal.com`.
4. Verifica la propiedad copiando el registro `TXT` que te da Google y pegándolo en los registros DNS de tu dominio en Netlify.
5. **Enviar el Sitemap:**
   * En el menú izquierdo de Search Console, ve a **"Sitemaps"**.
   * En "Añadir un nuevo sitemap", escribe: `sitemap.xml` y pulsa **Enviar**.
   * Verás cómo Google procesará:
     * `/` (Home)
     * `/taekwondo.html`
     * `/karate.html`
     * `/kickboxing.html`
     * `/live.html`

---

### Paso 4: Monitoreo de Palabras Clave (En 30-45 días)
Cuando Google empiece a indexar tus nuevas páginas, revisa la pestaña **Rendimiento**:
* Observarás cómo las **Impresiones** pasarán de 18 a cientos o miles.
* En la pestaña **Países**, verás aparecer a **Argentina, México, Chile, Colombia, España**.
* En la pestaña **Consultas**, empezarás a ver búsquedas orgánicas como:
  * *"marcador electronico taekwondo"*
  * *"software torneos karate wkf"*
  * *"puntuacion kickboxing celulares"*
