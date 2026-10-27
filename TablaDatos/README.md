# Nexo — gestión de comunidades

Aplicación Ionic Angular conectada al proyecto Supabase `qvnsbjrwrohhdfdziuiu`. Usa la tabla existente `public.comunidad` para consultar, buscar, editar y exportar comunidades.

## Conexión con Supabase

La URL y la clave publicable del proyecto están configuradas en `src/environments/environment.ts` y `src/environments/environment.prod.ts`. La clave `sb_publishable` está diseñada para usarse en el cliente; el acceso a los datos depende de las políticas RLS de PostgreSQL. **No añadas nunca una clave `service_role` o una clave secreta al frontend.**

La tabla que ya existía en el proyecto debe contener estos campos: `id`, `created_at`, `comunidad`, `numero`, `email`, `coste_mensual`, `junta` y `cancelada`. El formulario genera registros con estos campos, mientras que PostgreSQL asigna el identificador y la fecha de creación.

### Preparar los permisos y la autenticación

1. Abre el SQL Editor del proyecto Supabase y ejecuta `supabase/migrations/20261027000000_initial_schema.sql`. La migración crea perfiles, activa RLS sobre `comunidad`, permite lectura autenticada y reserva las escrituras a administradores; también habilita Realtime para esa tabla.
2. Desde Authentication, crea las cuentas de prueba. Un trigger genera el perfil como usuario estándar.
3. Promociona al administrador desde el SQL Editor:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (
     select id from auth.users where email = 'admin@tu-dominio.example'
   );
   ```

4. Comprueba en **Table Editor → comunidad → RLS policies** que no haya políticas antiguas que concedan acceso anónimo o escritura más amplia que las políticas de la migración.
5. Ejecuta `npm ci`, `npm start` y abre la URL indicada por Angular CLI.

Las rutas muestran un formulario de inicio de sesión. El dashboard requiere rol de administrador; el rol estándar puede consultar las comunidades. Las escrituras se validan también en RLS, no solo en el navegador.

## Funcionalidades

- Dashboard con total de comunidades, cuota mensual activa, cancelaciones y próxima junta.
- Búsqueda por nombre o correo y filtro de comunidades activas/canceladas.
- CRUD para administradores, con validación asíncrona de correo.
- Actualizaciones Realtime de la tabla `comunidad`.
- Exportación de informes CSV y PDF.
- Interfaz en español, diseño responsive y controles con etiquetas accesibles.

## Desarrollo y entrega

- `npm run lint`: analiza TypeScript y plantillas.
- `npm test -- --watch=false`: ejecuta las pruebas unitarias.
- `npm run build`: genera la aplicación en `www`.
- `npm run docs`: genera la documentación técnica en `documentation`.

Vercel puede desplegar el contenido de `www` con `vercel.json` para la navegación SPA. La auditoría Lighthouse debe realizarse sobre la versión desplegada y adjuntarse como evidencia; el workflow de GitHub Actions ejecuta lint, pruebas y build.
