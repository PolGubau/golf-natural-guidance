# Golf Natural Guidance — Planning de la demo local

## 1. Propósito

Construir una demo navegable para validar con Golf Natural Guidance el flujo principal de un software de gestión para una academia de golf.

La demo debe permitir recorrer el flujo completo:

```text
Cliente reserva
  → elige profesor / actividad
  → selecciona horario
  → paga mediante checkout mock
  → la reserva aparece en el backoffice
  → se registra la compensación del profesor
  → se genera una factura mock individual o mensual
```

La demo funcionará completamente en local. No tendrá base de datos externa, pagos reales, email real, WhatsApp, A3 ni ningún proveedor externo.

El código debe quedar organizado para poder sustituir posteriormente los repositorios locales por repositorios reales sin reescribir la interfaz ni la lógica de negocio.

## 2. Fuente de verdad del negocio

Datos confirmados en el briefing:

- La empresa es Golf Natural Guidance.
- Es una academia de golf en Mallorca.
- Se quiere gestionar una parte de reservas conectada con web, agendas, facturación y comunicación.
- Un cliente entra desde la web y reserva una hora.
- La reserva debe aparecer en la agenda del profesor.
- La reserva debe poder alimentar la facturación.
- Los profesores son autónomos.
- Existen diferentes categorías de profesor:
  - Profesor.
  - Head profesor.
  - Master profesor.
- Cada categoría puede tener precios diferentes.
- Existen clases particulares.
- Existen cursos y actividades de grupo.
- Las actividades pueden tener plazas limitadas.
- Existen bonos prepagados.
- Existe Junior Academy con aproximadamente 200 niños y suscripción.
- Una reserva web debe pagarse online según la operativa indicada.
- También se ha indicado que las clases particulares pueden pagarse en persona.
- Las actividades de grupo no deben permitir pago presencial.
- Se desea generar una factura para cada profesor cuando se le asigna una clase.
- A final de mes se necesita una factura por profesor con todas sus horas.
- Actualmente utilizan Golfmanager, pero su operativa es distinta.
- Actualmente utilizan A3 para contabilidad.

Datos no confirmados y que no se deben inventar en la demo:

- Nombres reales de profesores.
- Tarifas reales de cada profesor.
- Datos fiscales.
- IVA o retenciones.
- Política de cancelación.
- Política de no-show.
- Fórmula exacta de compensación de los profesores.
- Formato de exportación de A3.
- Proveedor de pagos.
- Proveedor de WhatsApp.
- Proveedor de email.
- Reglas exactas de bonos y suscripciones.

La demo puede utilizar datos claramente marcados como datos de prueba y configurables desde el backoffice.

## 3. Objetivos de la demo

### Objetivos principales

- Validar la experiencia de reserva del cliente.
- Validar que el negocio puede configurar profesores, categorías y tarifas.
- Validar que las actividades de grupo muestran plazas disponibles.
- Validar la diferencia entre pagos online y pagos presenciales.
- Validar la visualización de reservas en el backoffice.
- Validar la generación de facturas mock para profesores.
- Validar el encaje visual y operativo con el equipo de Golf Natural Guidance.

### Objetivos secundarios

- Definir el vocabulario del producto.
- Detectar excepciones de negocio.
- Validar el calendario y la agenda.
- Validar qué información necesita el equipo para gestionar el día a día.

### Fuera del objetivo de la demo

- Resolver legalmente la facturación.
- Integrar con A3.
- Enviar WhatsApp reales.
- Enviar emails reales.
- Cobrar dinero real.
- Sincronizar Google Calendar.
- Resolver multiacademia o multiempresa.
- Gestionar contabilidad completa.
- Crear una aplicación móvil nativa.

## 4. Stack propuesto para la demo

### Elección

Usar React con Next.js App Router como dirección del producto final.

La demo puede ejecutarse en local con la misma estructura, aunque sustituya la capa de datos real por adaptadores de `localStorage`.

### Tecnologías

- Next.js App Router.
- React.
- TypeScript con `strict: true`.
- Tailwind CSS v4.
- Componentes propios y componentes accesibles headless.
- `lucide-react` para iconos.
- Zod para validación de formularios y contratos.
- React Hook Form para formularios no triviales.
- Vitest para lógica de dominio.
- Playwright para el flujo de reserva.
- Biome para formato y lint en la arquitectura final.

### Decisiones para esta demo

- No usar Supabase.
- No usar Stripe.
- No usar APIs externas.
- No usar autenticación real.
- No usar secretos.
- No usar datos fiscales reales.
- No usar `localStorage` como dependencia de los componentes de UI.
- No acoplar la lógica de facturación al checkout.

## 5. Superficies del producto

La demo debe tener dos vistas diferenciadas.

### 5.1. Vista cliente

Ruta lógica:

```text
/booking
```

En producción se serviría en:

```text
booking.golfnaturalguidance.com
```

La vista cliente debe ser limpia, directa y orientada a conversión.

Secciones:

- Cabecera de marca.
- Selector de tipo de reserva.
- Clase particular.
- Cursos y actividades.
- Selector de fecha.
- Selector de hora.
- Selector de profesor.
- Precio.
- Datos del cliente.
- Checkout mock.
- Confirmación.

### 5.2. Vista backoffice

Ruta lógica:

```text
/admin
```

En producción se serviría en:

```text
app.golfnaturalguidance.com
```

Módulos de la demo:

- Resumen.
- Reservas.
- Agenda.
- Clientes.
- Profesores.
- Cursos y actividades.
- Facturación.
- Configuración básica.

## 6. Flujo de reserva particular

### Paso 1 — Selección de servicio

El cliente selecciona `Clase particular`.

La interfaz explica:

- Que tendrá un profesor individual.
- Duración de la clase.
- Precio configurable.
- Posibilidad de pago online o presencial.

### Paso 2 — Profesor

Se muestran únicamente profesores activos.

Cada profesor muestra:

- Nombre de demo o nombre configurado.
- Categoría.
- Precio por hora.
- Disponibilidad resumida.

No se mostrarán profesores desactivados.

### Paso 3 — Fecha y hora

El cliente selecciona:

- Día.
- Hora.

La hora debe marcarse como no disponible si existe una reserva para el mismo profesor y franja.

La demo puede trabajar con una agenda simplificada de franjas horarias predefinidas.

### Paso 4 — Datos del cliente

Campos mínimos:

- Nombre.
- Email.
- Teléfono opcional.

### Paso 5 — Método de pago

Opciones mock:

- Pagar online.
- Pagar en persona.

El pago presencial solo aparece para clases particulares.

### Paso 6 — Confirmación

Al confirmar:

- Se crea la reserva.
- Se marca como confirmada.
- Se guarda el método de pago.
- Se registra la hora y profesor.
- Se crea una factura mock pendiente para el profesor.
- Se muestra una pantalla de confirmación.

## 7. Flujo de reserva de grupo o actividad

### Paso 1 — Selección de actividad

El cliente visualiza las actividades configuradas en el backoffice.

Cada actividad muestra:

- Nombre.
- Descripción breve.
- Fecha.
- Horario.
- Número de plazas.
- Plazas ocupadas.
- Plazas disponibles.
- Precio.

### Paso 2 — Validación de plazas

No se puede continuar si:

- La actividad está inactiva.
- No quedan plazas.
- La actividad ha terminado.

### Paso 3 — Pago

Las actividades de grupo requieren pago online.

No debe mostrarse la opción de pago presencial.

El pago se realiza mediante checkout mock.

### Paso 4 — Confirmación

Al confirmar:

- Se crea una reserva vinculada a la actividad.
- Se incrementa el número de plazas ocupadas.
- Se registra el pago mock.
- Se genera la factura o línea de compensación del profesor correspondiente.
- Se muestra la confirmación.

## 8. Backoffice: profesores

La sección de profesores permite configurar los datos que afectan a la reserva.

### Campos de demo

- Nombre.
- Categoría.
- Precio por hora.
- Estado activo/inactivo.
- Disponibilidad semanal resumida.
- Color identificativo.

### Acciones

- Crear profesor.
- Editar profesor.
- Activar profesor.
- Desactivar profesor.
- Modificar categoría.
- Modificar precio.
- Modificar disponibilidad.

### Reglas

- Un profesor inactivo no aparece en la vista cliente.
- Un profesor inactivo no puede recibir nuevas reservas.
- Sus reservas históricas permanecen visibles.
- Cambiar el precio no altera el precio histórico de reservas anteriores.

## 9. Backoffice: actividades y cursos

### Campos

- Nombre.
- Descripción.
- Tipo.
- Precio.
- Capacidad.
- Plazas ocupadas.
- Profesor asignado.
- Fecha de inicio.
- Fecha de fin.
- Horario.
- Estado.
- Requiere pago online.

### Tipos iniciales

- Actividad de grupo.
- Curso.
- Junior Academy.
- Suscripción.
- Bono prepagado.

La demo puede implementar completamente actividades de grupo y dejar bonos/suscripciones como estructura preparada.

## 10. Backoffice: reservas

La vista de reservas debe permitir:

- Ver reservas del día.
- Filtrar por profesor.
- Filtrar por tipo.
- Filtrar por estado.
- Ver método de pago.
- Ver importe.
- Ver cliente.
- Ver actividad o clase.
- Marcar como completada.
- Marcar como cancelada.
- Marcar como no-show.

Estados de demo:

```text
pending
confirmed
completed
cancelled
no_show
```

## 11. Backoffice: facturación mock

La facturación de la demo no es fiscal. Es una simulación operativa.

### Factura individual

Al crear una reserva confirmada se genera una factura mock pendiente para el profesor.

Debe incluir:

- Identificador.
- Profesor.
- Reserva relacionada.
- Cliente.
- Fecha.
- Horas.
- Tarifa aplicada.
- Importe calculado.
- Estado.

### Factura mensual

El backoffice debe incluir una acción:

```text
Generar facturas del mes
```

La acción:

1. Agrupa reservas por profesor.
2. Filtra las reservas facturables.
3. Suma sus horas.
4. Usa el precio histórico de cada reserva.
5. Genera una factura mensual mock.
6. Muestra el total por profesor.
7. Impide generar dos veces el mismo periodo.

### Reservas facturables en la demo

Por defecto:

- `confirmed`: facturable.
- `completed`: facturable.
- `cancelled`: no facturable.
- `no_show`: pendiente de confirmar con el negocio.
- Pago presencial: facturable como deuda o pendiente de cobro.
- Pago online: facturable como cobrado.

Esta regla debe mostrarse como configurable porque el criterio final no está confirmado.

## 12. Modelo de datos de dominio

### Teacher

```ts
type Teacher = {
  id: string
  name: string
  category: string
  pricePerHour: number
  active: boolean
  availability: AvailabilityRule[]
}
```

### AvailabilityRule

```ts
type AvailabilityRule = {
  weekday: number
  startTime: string
  endTime: string
}
```

### Student

```ts
type Student = {
  id: string
  name: string
  email: string
  phone?: string
}
```

### Booking

```ts
type Booking = {
  id: string
  type: "private_lesson" | "group_activity"
  studentId: string
  teacherId: string
  activityId?: string
  startsAt: string
  endsAt: string
  price: number
  status: BookingStatus
  paymentMethod: "online" | "in_person"
  paymentStatus: PaymentStatus
  createdAt: string
}
```

### Activity

```ts
type Activity = {
  id: string
  name: string
  description: string
  price: number
  capacity: number
  enrolled: number
  teacherId: string
  startsAt: string
  endsAt: string
  active: boolean
  requiresOnlinePayment: boolean
}
```

### MockPayment

```ts
type MockPayment = {
  id: string
  bookingId: string
  amount: number
  method: "online" | "in_person"
  status: "pending" | "paid"
  createdAt: string
}
```

### TeacherInvoice

```ts
type TeacherInvoice = {
  id: string
  teacherId: string
  period: string
  bookingIds: string[]
  hours: number
  amount: number
  status: "pending" | "generated" | "paid"
  createdAt: string
}
```

## 13. Arquitectura de código

La UI no debe conocer el mecanismo de persistencia.

```text
src/
  app/
    booking/
    admin/

  features/
    client-booking/
    admin-dashboard/
    teacher-management/
    activity-management/
    billing/

  domain/
    booking/
    teacher/
    activity/
    payment/
    invoice/

  application/
    create-booking.ts
    calculate-availability.ts
    create-mock-payment.ts
    generate-monthly-invoices.ts

  infrastructure/
    repositories/
      booking-repository.ts
      teacher-repository.ts
      activity-repository.ts
      invoice-repository.ts
    local-storage/
      local-booking-repository.ts
      local-teacher-repository.ts
      local-activity-repository.ts
      local-invoice-repository.ts

  components/
    ui/
    booking/
    calendar/
    teachers/
    billing/

  lib/
    validation/
    dates/
    formatting/
```

## 14. Contratos de repositorio

La demo debe programarse contra interfaces.

```ts
interface BookingRepository {
  list(): Promise<Booking[]>
  getById(id: string): Promise<Booking | null>
  create(input: CreateBookingInput): Promise<Booking>
  update(id: string, input: UpdateBookingInput): Promise<Booking>
}
```

Implementación de demo:

```text
LocalStorageBookingRepository
```

Implementación futura:

```text
SupabaseBookingRepository
```

El cambio debe producirse en el composition root, no en las pantallas.

## 15. Persistencia local

Claves de almacenamiento:

```text
gng-demo:teachers
gng-demo:activities
gng-demo:students
gng-demo:bookings
gng-demo:payments
gng-demo:invoices
gng-demo:settings
```

Requisitos:

- Inicializar datos seed solo si la clave no existe.
- Manejar JSON corrupto devolviendo un estado seguro.
- Versionar el formato local.
- Permitir reiniciar la demo.
- Mostrar claramente que los datos son locales.
- No depender de `localStorage` durante SSR.
- Encapsular la lectura/escritura en repositorios.

Formato recomendado:

```ts
type LocalStore<T> = {
  version: number
  data: T
}
```

## 16. Estado de la interfaz

### Estado de cliente

- Paso actual del flujo.
- Servicio seleccionado.
- Profesor seleccionado.
- Fecha seleccionada.
- Hora seleccionada.
- Datos del formulario.
- Estado del checkout mock.
- Estado de confirmación.

### Estado de backoffice

- Sección actual.
- Filtros.
- Vista del calendario.
- Modal abierto.
- Registro seleccionado.
- Estado de generación de facturas.

### Estados obligatorios de cada pantalla

- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Sin disponibilidad.
- Datos locales no persistidos.

## 17. Reglas de negocio de la demo

1. Solo los profesores activos aparecen en el booking.
2. Solo las actividades activas aparecen en el booking.
3. Una actividad no puede superar su capacidad.
4. Una reserva no puede solaparse con otra del mismo profesor.
5. Una clase particular permite pago online o presencial.
6. Una actividad de grupo requiere pago online.
7. El precio queda copiado en la reserva al crearla.
8. Cambiar el precio de un profesor no modifica reservas históricas.
9. Una reserva cancelada no ocupa disponibilidad.
10. Una reserva confirmada ocupa disponibilidad.
11. Una reserva completada sigue siendo histórica.
12. El total de una factura mensual se calcula a partir de las reservas asociadas.
13. La generación mensual debe ser idempotente.
14. Una factura mock no es una factura fiscal válida.
15. La demo debe avisar de que todos los pagos son simulados.

## 18. Validaciones

### Cliente

- Nombre obligatorio.
- Email válido.
- Profesor activo.
- Hora disponible.
- Actividad con plazas.
- Método de pago permitido.

### Backoffice

- Precio mayor o igual que cero.
- Capacidad mayor que cero.
- Horarios válidos.
- Nombre obligatorio.
- No permitir eliminar profesores con reservas históricas.

## 19. Diseño UX

### Vista cliente

Debe transmitir:

- Confianza.
- Claridad.
- Calidad de servicio.
- Pocos pasos.
- Precio visible.
- Disponibilidad realista.

No debe parecer un panel administrativo.

### Vista backoffice

Debe priorizar:

- Lectura rápida del día.
- Agenda.
- Próximas reservas.
- Estado de pagos.
- Profesores activos.
- Alertas de facturación.

El estilo visual debe ser limpio, sobrio, cálido y relacionado con golf sin abusar de imágenes decorativas.

## 20. Accesibilidad

- HTML semántico.
- Labels asociados a todos los campos.
- Navegación por teclado.
- Estados de focus visibles.
- Modales accesibles.
- Mensajes de error descriptivos.
- No depender solo del color.
- Contraste WCAG 2.2 AA.
- `prefers-reduced-motion`.
- Botones con nombres accesibles.
- Calendario navegable con teclado en la versión final.

## 21. Testing de la demo

### Unit tests

- Cálculo de disponibilidad.
- Detección de solapamientos.
- Cálculo de plazas.
- Validación de métodos de pago.
- Cálculo de factura individual.
- Agrupación mensual por profesor.
- Idempotencia de facturación.

### Integration tests

- Crear reserva y persistirla.
- Desactivar profesor y ocultarlo en booking.
- Crear actividad y reducir plazas.
- Generar factura mensual.
- Reiniciar y restaurar datos locales.

### E2E tests

Flujo principal:

```text
Abrir booking
→ seleccionar clase particular
→ seleccionar profesor
→ seleccionar hora
→ introducir datos
→ completar pago mock
→ comprobar confirmación
→ abrir backoffice
→ comprobar reserva
→ generar factura
```

Segundo flujo:

```text
Abrir booking
→ seleccionar actividad de grupo
→ comprobar plazas
→ verificar que pago presencial no existe
→ completar pago mock
→ comprobar plaza ocupada
```

## 22. Criterios de aceptación

La demo se considera lista cuando:

- Existen dos vistas diferenciadas.
- El cliente puede reservar una clase particular.
- El cliente puede escoger profesor, categoría, precio, día y hora.
- Las horas ocupadas aparecen como no disponibles.
- El cliente puede reservar una actividad de grupo con plazas.
- Las actividades agotadas no permiten continuar.
- Las particulares permiten pago presencial.
- Las actividades de grupo no permiten pago presencial.
- El pago online es mock y no realiza cargos reales.
- La reserva aparece en el backoffice.
- El profesor se puede activar y desactivar.
- El precio del profesor es configurable.
- Se crea una factura mock por profesor.
- Se pueden generar facturas mensuales agrupadas.
- Todo persiste localmente tras refrescar.
- La demo se puede reiniciar.
- No se utiliza ninguna integración externa.
- La lógica de datos está separada de la UI.
- `lint`, `typecheck`, `test` y `build` pasan.

## 23. Plan de implementación

### Fase A — Base técnica

- Reorganizar el código en módulos.
- Definir tipos de dominio.
- Crear repositorios locales.
- Crear seed configurable.
- Crear utilidades de fechas y dinero.

### Fase B — Booking cliente

- Selector de modalidad.
- Selector de profesor.
- Selector de fecha y hora.
- Actividades de grupo.
- Validaciones.
- Checkout mock.
- Confirmación.

### Fase C — Backoffice

- Dashboard.
- Reservas.
- Agenda.
- Configuración de profesores.
- Configuración de actividades.
- Clientes.

### Fase D — Facturación mock

- Factura por reserva.
- Agrupación mensual.
- Estados.
- Exportación local simple.
- Reinicio de demo.

### Fase E — Calidad

- Tests unitarios.
- Tests de integración.
- E2E del flujo principal.
- Responsive.
- Accesibilidad.
- Documentación.

## 24. Migración futura

Cuando se valide la demo:

1. Mantener los tipos de dominio.
2. Mantener los casos de uso.
3. Sustituir repositorios locales por repositorios Supabase.
4. Añadir autenticación.
5. Añadir RLS.
6. Mover validaciones críticas al servidor.
7. Sustituir checkout mock por Stripe.
8. Añadir webhooks.
9. Añadir tareas programadas.
10. Añadir proveedor de WhatsApp y email.
11. Añadir exportación o integración con A3.
12. Añadir auditoría y logs.

La interfaz no debería tener que cambiar sustancialmente durante esta migración.

## 25. Decisiones pendientes antes de producción

- Tarifas reales.
- Datos fiscales.
- IVA y retenciones.
- Política de cancelación.
- Política de no-show.
- Criterio de facturación.
- Formato A3.
- Proveedor de pagos.
- Proveedor de WhatsApp.
- Proveedor de email.
- Sistema de autenticación de clientes.
- Sincronización de calendarios.
- Reglas de bonos.
- Reglas de Junior Academy.
- Suscripciones y renovaciones.

Hasta resolver estas decisiones, se deben tratar como configuraciones de demo y no como comportamiento definitivo del producto.
