import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COLORS = [
    '#000000', // Pure black
    '#191919', // Very dark gray
    '#323232', // Dark gray
    '#4B4B4B', // Medium dark gray
    '#646464', // Neutral gray
    '#7D7D7D', // Medium gray
    '#969696', // Medium-light gray
    '#AFAFAF', // Light gray
    '#C8C8C8', // Pale gray
    '#E1E1E1', // Very light gray
    '#2A2A2A', // Slightly lighter than black
    '#3C3C3C', // Soft dark
    '#4F4F4F', // Balanced
    '#707070', // Neutral
    '#909090', // Muted light gray
];

const CategoryDistribution = ({ data }: {
     data: {
        _id: string;
        count: number;
    }[];
}) => {
    const formaterData = data.map((item) => ({
        name: item._id,
        count: item.count
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribution des Catégories</CardTitle>
                <CardDescription>
                    Répartition des produits par catégorie
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            dataKey="count"
                            isAnimationActive={false}
                            data={formaterData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {formaterData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => [`${value}`, 'Produits']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default CategoryDistribution;