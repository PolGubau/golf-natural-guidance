import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().email("Introduce un email válido"),
  phone: z.string().trim().optional(),
  fiscalId: z.string().trim().min(5, "Introduce tu NIF, NIE o CIF"),
  fiscalAddress: z
    .string()
    .trim()
    .min(8, "Introduce tu dirección fiscal completa"),
});

export const teacherFormSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z
    .string()
    .trim()
    .email("Introduce un email válido")
    .or(z.literal(""))
    .transform((value) => value || undefined),
  phone: z.string().trim(),
  fiscalName: z.string().trim().min(2, "La razón social es obligatoria"),
  fiscalId: z.string().trim().min(5, "Introduce el NIF o CIF"),
  fiscalAddress: z.string().trim().min(8, "Introduce la dirección fiscal"),
  invoiceSeries: z.string().trim().min(2, "Indica la serie de facturación"),
  publicRole: z.string().trim().min(2, "El rol es obligatorio"),
  category: z.enum(["teacher", "head_teacher", "master_teacher"]),
  active: z.boolean(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

export const activityFormSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  description: z.string().trim().min(5, "Añade una descripción"),
  price: z.coerce.number().min(0),
  memberPrice: z.coerce.number().min(0).optional(),
  capacity: z.coerce.number().int().positive(),
  teacherId: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  active: z.boolean(),
});

export type CustomerForm = z.infer<typeof customerSchema>;
export type TeacherForm = z.infer<typeof teacherFormSchema>;
export type ActivityForm = z.infer<typeof activityFormSchema>;
export type TeacherFormInput = z.input<typeof teacherFormSchema>;
export type ActivityFormInput = z.input<typeof activityFormSchema>;
