import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().email("Introduce un email válido"),
  phone: z.string().trim().optional(),
});

export const teacherFormSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  publicRole: z.string().trim().min(2, "El rol es obligatorio"),
  category: z.enum(["teacher", "head_teacher", "master_teacher"]),
  customerPrice: z.coerce.number().min(0),
  compensationRate: z.coerce.number().min(0),
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
