"use client";

import * as React from "react";
import { Control, Controller, FieldPath, FieldValues, ControllerRenderProps } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Generic interface for select options
export interface SelectOption {
    id: number | string;
    name: string;
}

// Props for text input field
interface TextFieldProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    label: string;
    type?: "text" | "email" | "date" | "time" | "password";
    placeholder?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
}

// Props for select field
interface SelectFieldProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    label: string;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

// Props for checkbox field
interface CheckboxFieldProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    label: string;
}

// Reusable text input field component
export function TextField<T extends FieldValues>({
    name,
    control,
    label,
    type = "text",
    placeholder,
    error,
    className = "col-span-3",
    disabled = false,
}: TextFieldProps<T>) {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={name} className="text-right">
                {label}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        id={name}
                        type={type}
                        {...field}
                        className={className}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )}
            />
            {error && (
                <p className="col-span-4 text-red-500 text-sm text-right">{error}</p>
            )}
        </div>
    );
}

// Reusable select field component
export function SelectField<T extends FieldValues>({
    name,
    control,
    label,
    options,
    placeholder = "選択してください",
    error,
    disabled = false,
}: SelectFieldProps<T>) {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={name} className="text-right">
                {label}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={disabled}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && (
                <p className="col-span-4 text-red-500 text-sm text-right">{error}</p>
            )}
        </div>
    );
}

// Reusable checkbox field component
export function CheckboxField<T extends FieldValues>({
    name,
    control,
    label,
}: CheckboxFieldProps<T>) {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={name} className="text-right">
                {label}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Checkbox
                        id={name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
        </div>
    );
}
