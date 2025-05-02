import React from 'react';
import { ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
    title: string;
    description: string;
    data: {
        "_id": string,
        "count": number
    }[];
}

const PerDateChart = ({ data, title, description }: Props) => {
    const formatedData = data.map((item) => {
        return {
            name: item._id,
            value: item.count
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={formatedData}
                        margin={{ top: 20, right: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            tickFormatter={(value: number) => `${value}`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                            formatter={(value: number) => [`${value}`, 'Produits']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#020817" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default PerDateChart;