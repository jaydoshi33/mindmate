import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";

export default function Insights(){
    const [emotionCounts, setEmotionCounts] = useState({});
    const [sentimentCounts, setSentimentCounts] = useState({});
    const [timeline, setTimeline] = useState([]);

    useEffect(()=>{
        fetch("http://localhost:8000/journal-insights")
        .then((res)=>res.json())
        .then(
            (data)=>{
                setEmotionCounts(data.emotion_counts);
                setSentimentCounts(data.sentiment_counts);
                setTimeline(data.timeline);
            });
    },[]);

    // Transform data into chart-friendly format
    const emotionData = Object.entries(emotionCounts).map(([label, count]) => ({
        label,
        count,
    }));

    const sentimentData = Object.entries(sentimentCounts).map(([label, count]) => ({
        label,
        count,
      }));

      return(
        <div className="p-6 space-y-10 bg-gray-100 min-h-screen text-black">
            <h1 className="text-3xl font-bold">Journal Insights</h1>

            {/* Emotion Bar Chart */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Emotion Distribution</h2>
                <ResponsiveContainer width="50%" height={300}>
                    <BarChart data={emotionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Sentiment pie Chart */}
            <div>
            <h2 className="text-xl font-semibold mb-2">Sentiment Distribution</h2>
                <ResponsiveContainer width="50%" height={300}>
                    <PieChart>
                        <Pie
                        data={sentimentData}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#82ca9d"
                        label
                        >
                        {sentimentData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#82ca9d" : "#8884d8"} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer> 
            </div>

            {/* Timeline Line Chart */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Entries Over Time</h2>
                <ResponsiveContainer width="50%" height={300}>
                <LineChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#ff7300" />
                </LineChart>
                </ResponsiveContainer>
            </div>
            
        </div>
      );
}
