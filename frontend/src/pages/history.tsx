'use client';
import { useEffect, useState } from "react";

type JournalEntry = {
    id: number;
    text: string;
    sentiment: string;
    emotion: string;
    affirmation: string;
    timestamp: string;
};

export default function History(){
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [emotionFilter, setEmotionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    
    const fetchHistory = async()=>{
        let url = 'http://localhost:8000/journal-history?';
        if (emotionFilter) url += `emotion=${emotionFilter}&`;
        if (startDate) url += `start_date=${startDate}&`;
        if (endDate) url += `end_date=${endDate}`;

        const res = await fetch(url);
        const data = await res.json();
        console.log('History response:', data);
        setEntries(data.reverse()); //latest first
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory(); // Initial fetch
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-4 text-black">Journal History</h1>
            <div className="flex flex-wrap gap-4 mb-4 bg-white p-4 rounded shadow text-black">
                <select value={emotionFilter} onChange={(e) => setEmotionFilter(e.target.value)} className="border p-2 rounded text-black">
                    <option value="">All emotions</option>
                    <option value="joy">Joy</option>
                    <option value="sadness">Sadness</option>
                    <option value="fear">Fear</option>
                    <option value="disgust">Disgust</option>
                    <option value="surprise">Surprise</option>
                    <option value="anger">Anger</option>
                    <option value="neutral">Neutral</option>
                </select>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded text-black" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded text-black" />
                <button onClick={fetchHistory} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Apply filters</button>
            </div>
            {/* Display entries */}
            {entries.map((entry) => (
                <div key={entry.id} className="mb-4 p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500 mb-1">
                        {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <p className="mb-2 text-black">{entry.text}</p>
                    <p className="text-black"><strong>Emotion:</strong> {entry.emotion}</p>
                    <p className="text-black"><strong>Sentiment:</strong> {entry.sentiment}</p>
                    <p className="mt-2 italic text-green-700">"{entry.affirmation}"</p>
                </div>
            ))}
        </div>
        
    );
    
}