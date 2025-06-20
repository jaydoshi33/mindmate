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
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchHistory = async()=>{
            const res = await fetch('http://localhost:8000/journal-history');
            const data = await res.json();
            console.log('History response:', data);
            setEntries(data.reverse()); //latest first
            setLoading(false);
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">Journal History</h1>
        {loading ? (
            <p className="text-gray-600">Loading...</p>
        ) : entries.length === 0 ? (
            <p className="text-gray-600">No journal entries found.</p>
        ) : (
            <div className="space-y-4">
                {entries.map((entry)=>(
                    <div key={entry.id} className="bg-white rounded shadow p-4 text-black">
                    <p className="text-sm text-gray-500 mb-1">{new Date(entry.timestamp).toLocaleString()}</p>
                    <p className="mb-2"><strong>Entry:</strong> {entry.text}</p>
                    <p className="mb-1"><strong>Emotion:</strong> {entry.emotion}</p>
                    <p className="mb-1"><strong>Sentiment:</strong> {entry.sentiment}</p>
                    <p className="mt-2 bg-green-100 text-green-800 p-2 rounded"><strong>Affirmation:</strong> {entry.affirmation}</p>
                    </div>
                ))}
            </div>
        )}
        </div>
    );
    
}