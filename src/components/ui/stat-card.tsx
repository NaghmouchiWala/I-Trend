"use client";
import React from 'react';

interface Props {
    title: string;
    number: number;
    subText?: string;
    children: React.ReactNode;
}

export const StatCard = ({ title, number, subText, children }: Props) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <div className="bg-primary text-black p-3 rounded-full">
                    {children}
                </div>
            </div>
            {subText ? <p className="text-sm text-gray-500">{subText}</p> : null}
            <div className="mt-4">
                <p className="text-3xl font-bold text-gray-800">{number}</p>
            </div>
        </div>
    );
};