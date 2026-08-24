# Golf Natural Guidance

Demo local navegable desarrollada para Golf Natural Guidance para mostrar reservas, agenda, pagos simulados, captación y facturación.

## Rutas

- `/booking`: experiencia de reserva para clientes.
- `/admin`: backoffice operativo.

El backoffice requiere autenticación. La cuenta local de demostración es `demo@academia-demo.example` con contraseña `Demo-Academia-2026!`.

No existen pagos, comunicaciones, autenticación ni integraciones externas reales. Todos los datos se guardan de forma versionada en `localStorage` y pueden restaurarse desde Configuración.

## Desarrollo

Requiere Node.js 20+ y pnpm.

```bash
pnpm install
pnpm dev
```

## Calidad

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```

La primera ejecución de E2E puede requerir `pnpm exec playwright install chromium`.

## Arquitectura

- `src/domain`: entidades y reglas puras.
- `src/application`: casos de uso.
- `src/infrastructure`: seed, estado, contratos y adaptador local.
- `src/features`: booking y módulos del backoffice.
- `src/components`: sistema visual reutilizable.

Las vistas consumen casos de uso y estado; nunca acceden directamente a `localStorage`. La implementación local puede sustituirse en el composition root sin cambiar la lógica de negocio ni la interfaz.

La autenticación sigue el mismo criterio: `AuthProvider` desacopla la UI y la sesión del proveedor mock para poder sustituirlo por Supabase Auth. La sesión actual usa una cookie firmada `HttpOnly` y no almacena la contraseña en el navegador.

## Acceso mock

- Email: `demo@academia-demo.example`
- Contraseña: `Demo-Academia-2026!`

`docs/planning.md` es la fuente de verdad funcional del proyecto.
