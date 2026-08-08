import {
  cloneElement,
  forwardRef,
  type InputHTMLAttributes,
  isValidElement,
  type ReactElement,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from "react";
import { cn } from "~/lib/cn";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const controlElement = isValidElement(children)
    ? cloneElement(
        children as ReactElement<{ id?: string; "aria-describedby"?: string }>,
        { id, "aria-describedby": error || hint ? descriptionId : undefined },
      )
    : children;
  return (
    <div className="grid gap-1.5 text-sm font-medium text-ink">
      <label htmlFor={id}>{label}</label>
      {controlElement}
      {error ? (
        <span id={descriptionId} className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : hint ? (
        <span id={descriptionId} className="text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

const control =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink shadow-xs outline-none transition placeholder:text-muted/65 focus:border-forest/40 focus:ring-3 focus:ring-forest/10 disabled:bg-sand";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(control, className)} {...props} />
));
Input.displayName = "Input";
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(control, "appearance-none pr-9", className)}
    {...props}
  />
));
Select.displayName = "Select";
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(control, "min-h-24 resize-y py-3", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
