# NovaTech — Secure Workspace

Portal corporativo de demostración con Next.js, Supabase Auth y roles de empleado/administrador. Diseñado para desplegarse en Vercel.

## Desarrollo local

1. Instala Node.js 20+ y ejecuta `npm install`.
2. Copia `.env.example` a `.env.local` y completa la URL y la clave anon/public de tu proyecto Supabase.
3. En Supabase, ejecuta `supabase/schema.sql` desde SQL Editor.
4. Ejecuta `npm run dev` y abre `http://localhost:3000`.
5. Crea usuarios desde Supabase Auth. El trigger crea los perfiles como `employee` por defecto. Para conceder rol `admin`, verifica la identidad y cambia el rol desde un flujo administrativo confiable; no habilites esa operación desde el navegador.

## Vercel

Importa el repositorio en Vercel, configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en las variables de entorno de Preview y Production, y despliega primero en Preview para revisar el comportamiento. No guardes claves `service_role` en variables `NEXT_PUBLIC_*` ni en el cliente.

## Seguridad y laboratorio

- No hay cuentas privilegiadas preconfiguradas ni credenciales `admin/admin` en el sitio desplegado.
- La selección de “Administrador” en el formulario es una preferencia de acceso, no concede privilegios. El rol se comprueba con el perfil de Supabase y en middleware.
- La política RLS de perfiles limita la lectura al propio usuario. Antes de guardar datos empresariales, crea tablas específicas y políticas RLS que comprueben permisos en la base de datos; no confíes solo en ocultar componentes de la UI.
- Para practicar Hydra, utiliza un laboratorio deliberadamente vulnerable y aislado en localhost/una VM de laboratorio, con datos ficticios, sin exponerlo a Internet ni conectarlo a cuentas reales. No ejecutes pruebas de fuerza bruta contra el dominio público de Vercel.

## Estado

Starter UI y scaffolding de autenticación. Los paneles usan cifras ilustrativas; no representan información real ni incluyen todavía un módulo de auditoría conectado a eventos reales.
