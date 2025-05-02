"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    date?: Date
    setDate: (date: Date) => void
    className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        setDate(newDate);
    };

    return (
        <input
            type="date"
            value={date?.toISOString().split('T')[0]}
            onChange={handleChange}
            className={cn(
                "flex h-10 rounded-md border border-input bg-background px-1 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        />
    );
}
