import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

const inputBase =
  "w-full rounded-lg border border-surface-400 bg-surface-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors duration-200 focus:border-violet-500/50 focus:bg-surface-600 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(inputBase, "resize-none min-h-[80px]", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, style, children, ...props }, ref) => (
    <div
      className="relative w-full rounded-lg"
      style={{ backgroundColor: "#1a1a2e" }}
    >
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-surface-400 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors duration-200 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50",
          "cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center]",
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")]",
          "[&>option]:bg-[#141420] [&>option]:text-slate-200",
          className
        )}
        style={{ backgroundColor: "transparent", color: "#e2e8f0", colorScheme: "dark", ...style }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
Select.displayName = "Select";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export function Label({ children, className, required }: LabelProps) {
  return (
    <label className={cn("block text-xs font-medium text-slate-400 mb-1.5", className)}>
      {children}
      {required && <span className="text-violet-400 ml-0.5">*</span>}
    </label>
  );
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}
