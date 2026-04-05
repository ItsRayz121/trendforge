"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, X, ChevronDown } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full min-h-[40px] px-3 py-2 rounded-lg border bg-surface-700 text-left transition-all duration-200",
          "border-surface-400 hover:border-violet-500/50 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none",
          isOpen && "border-violet-500/50 ring-2 ring-violet-500/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {value.length === 0 ? (
          <span className="text-slate-500 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5 items-center">
            {selectedLabels.slice(0, 3).map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-xs"
              >
                {label}
                <button
                  onClick={(e) => removeOption(value[index], e)}
                  className="hover:text-violet-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedLabels.length > 3 && (
              <span className="text-xs text-slate-500">
                +{selectedLabels.length - 3} more
              </span>
            )}
          </div>
        )}
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 py-1 bg-surface-800 border border-surface-600 rounded-lg shadow-xl max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                  "hover:bg-violet-500/10",
                  isSelected && "bg-violet-500/5"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-violet-600 border-violet-600"
                      : "border-slate-500"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                {option.icon && <span>{option.icon}</span>}
                <span className={cn(isSelected ? "text-slate-200" : "text-slate-400")}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
