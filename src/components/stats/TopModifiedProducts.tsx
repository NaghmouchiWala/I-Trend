import React from 'react';
import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TopModifiedProducts = ({ data }: {
    data: {
        "Designation": string,
        "Ref": string,
        "_id": string,
        "Price": number,
        "modifications_count": number
    }[];
}) => {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Produits les Plus Modifiés</CardTitle>
            <CardDescription>
            Top 10 des produits avec le plus de modifications de prix
            </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={data} 
                margin={{ 
                top: 20, 
                right: 30, 
                left: 20, 
                bottom: 60 
                }}
            >
                <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--muted))"
                    opacity={0.4}
                />
                <XAxis 
                    dataKey="Ref" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ 
                        fill: "hsl(var(--foreground))",
                        fontSize: 12 
                    }}
                />
                <YAxis 
                    tick={{ 
                        fill: "hsl(var(--foreground))",
                        fontSize: 12 
                    }}
                    label={{ 
                        value: "Nombre des modifications",
                        angle: -90,
                        // position: 'insideLeft',
                        style: {
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                        }
                    }}
                />
                <Tooltip 
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                    }}
                    formatter={(value: number) => [`${value}`, 'Nombre des Modifications']}
                />
                <Bar 
                    name="Modifications"
                    dataKey="modifications_count" 
                    fill="hsl(var(--black))"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
        </Card>
    );
}

export default TopModifiedProducts;