import { useState } from 'react';

export default function Journal() {
  const [entry, setEntry] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: entry }),
    });

    const data = await res.json();
    setResponse(data.message); // We'll define this in the backend next
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Daily Journal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder="Write your thoughts here..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {response && (
        <div className="mt-6 p-4 bg-white rounded shadow bg-white text-black">
          <p><strong>Response:</strong> {response}</p>
        </div>
      )}
    </div>
  );
}
