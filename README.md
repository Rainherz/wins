# Wins

Un registro personal de avance para quienes tienen días hechos de proyectos y tareas. Registra lo que terminaste, cierra el día indicando cómo se sintió y revisa tu semana de un vistazo, para que el progreso deje de desaparecer en cuanto marcas algo como hecho.

Construida con React Native (Expo). Funciona en web, iOS y Android con un solo código. Backend: Supabase. La interfaz está en español.

## El problema

Las tareas terminadas desaparecen. Al final de la semana parece que nada avanzó y la motivación cae. Wins mantiene visible cada logro, agrupado por día y por proyecto.

## Funcionalidades

| Pantalla | Qué hace |
|----------|----------|
| **Semana** | Total de logros y proyectos tocados, comparación con la semana pasada, una barra por día y cada logro agrupado por día con el ánimo de esa jornada. Marca un logro con la estrella para convertirlo en hito. Con **Importar logros** traes tus PRs fusionados e issues cerrados de GitHub y eliges cuáles contar. |
| **Agregar un logro** | Registra lo que terminaste en pocos segundos: texto, proyecto y, si quieres, hito. |
| **Cerrar el día** | Elige cómo se sintió el día (bien, regular, difícil), revisa los logros de hoy y deja una nota opcional sobre lo que se trabó. |
| **Proyectos** | Cada proyecto con sus logros de la semana, la última actividad y un gráfico de 7 días. Permite crear proyectos nuevos, cada uno con su propio color, o **importar tus repositorios de GitHub** como proyectos (ves cuáles están archivados, cuántos issues abiertos tienen y cuándo se movieron por última vez). |

Además: tema claro por defecto con una alternativa oscura, diseño adaptable (barra inferior y hojas en celular; barra lateral y diálogos centrados en pantallas anchas) e inicio de sesión para un solo usuario.

## Camino rápido

Requisitos: una versión reciente de Node.js, [pnpm](https://pnpm.io) y una cuenta gratuita de [Supabase](https://supabase.com).

1. Instala las dependencias:

   ```bash
   pnpm install
   ```

2. Crea un proyecto en Supabase, abre el **SQL Editor** y ejecuta [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

3. En Supabase, crea tu usuario en **Authentication → Users → Add user** (marca **Auto Confirm User**) y luego desactiva **Allow new users to sign up** en la configuración de inicio de sesión.

4. Copia el archivo de entorno y completa la URL del proyecto y la publishable key (botón **Connect** o **Settings → API Keys**):

   ```bash
   cp .env.example .env
   ```

5. Inicia la app:

   ```bash
   pnpm web
   ```

Resultado esperado: una pantalla de inicio de sesión. Al ingresar llegas a la pantalla Semana.

> Usa únicamente la clave **publishable**. La clave secret o service role nunca debe estar en este proyecto.

## Scripts

| Comando | Para qué sirve |
|---------|----------------|
| `pnpm start` | Inicia el servidor de desarrollo de Expo |
| `pnpm web` | Ejecuta la app en el navegador |
| `pnpm ios` / `pnpm android` | Ejecuta en un simulador o dispositivo |
| `pnpm typecheck` | Revisión de tipos con TypeScript |
| `pnpm lint` | ESLint con la configuración de Expo |

## Cómo está construida

| Área | Decisión |
|------|----------|
| App | Expo SDK 57, React Native, TypeScript (estricto), Expo Router |
| Backend | Supabase: Postgres, Auth y seguridad a nivel de fila (RLS) |
| Arquitectura | Hexagonal (puertos y adaptadores), organizada por funcionalidad |
| Diseño | Tokens y componentes documentados en [`docs/design-system.md`](docs/design-system.md) |

Cada funcionalidad (`wins`, `projects`, `closeout`, `auth`) tiene cuatro capas. Las dependencias apuntan hacia adentro, de modo que el dominio nunca importa React ni Supabase:

```
presentation → application → domain
infrastructure → application (implementa sus puertos)
```

```
src/
├── app/            # Rutas de Expo Router (delgadas)
├── features/       # wins, projects, closeout, auth
│   └── <feature>/{domain,application,infrastructure,presentation}
├── shared/         # tokens de tema, componentes base (Text, Button, Icon…), utilidades
├── shell/          # navegación (barra lateral / inferior) y captura de logros
└── composition/    # conecta los adaptadores de Supabase con los casos de uso
supabase/migrations # esquema de la base de datos y políticas RLS
```

Cambiar Supabase por otro backend implica escribir solo nuevos adaptadores. Más detalles en [`docs/architecture.md`](docs/architecture.md).

## Seguridad

- Todas las tablas tienen seguridad a nivel de fila: cada usuario solo puede leer y escribir sus propios datos.
- El registro de usuarios está desactivado, así que la cuenta creada desde el panel es la única.
- `.env` está ignorado por git. En el cliente solo se usa la clave publishable.

## Notas

- Las pruebas automáticas quedan fuera del alcance de esta primera versión. La separación hexagonal mantiene la lógica de dominio libre de React y Supabase, por lo que se pueden agregar pruebas unitarias más adelante sin refactorizar.
- Un token *fine-grained* de GitHub solo alcanza los repositorios de **un** dueño (tu cuenta o una organización) y no cubre los que compartes como colaborador en la cuenta de otra persona. Si faltan repositorios al importar, la hoja muestra cuántos aporta cada dueño para que veas cuál falta.
- Con pnpm 11, `expo install` falla. Agrega las dependencias con `pnpm add` usando las versiones que recomienda Expo.
- La documentación técnica de `docs/` está en inglés.

## Hoja de ruta

- [ ] Publicar la versión web
- [ ] Editar y eliminar logros y proyectos
- [ ] Soporte sin conexión
