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

    const deleteEntry = async (entryId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/journal/${entryId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                // Remove the deleted entry from the local state
                setEntries(entries.filter(entry => entry.id !== entryId));
            } else {
                console.error('Failed to delete entry');
                // You might want to add error handling here
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
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
                <div key={entry.id} className="mb-6 p-4 border rounded-lg shadow bg-white">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold mb-2 text-black">Entry #{entry.id}</h3>
                        <button 
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete entry"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
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