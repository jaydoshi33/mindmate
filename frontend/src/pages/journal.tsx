import { useState } from 'react';

export default function Journal() {
  const [entry, setEntry] = useState('');   //entry: Holds the journal text the user types
  //response: Stores the sentiment,emotion,confidence returned by backend.
  const [emotion, setEmotion] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  
  const handleSubmit = async (e: React.FormEvent) => {

    //Prevents the default form submit action (which reloads the page) and set loading to true to update the button.
    e.preventDefault();
    setLoading(true);

    //Sends a POST request to your FastAPI /journal endpoint.
    const res = await fetch('http://localhost:8000/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: entry }),
    });

    const data = await res.json();
    // We'll define this in the backend next
    setSentiment(data.sentiment.label);
    setEmotion(data.emotion.label);
    setConfidence(data.emotion.score);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Daily Journal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}    //e is a controlled event, it syncs entry with the user’s input
          className="w-full p-4 border border-gray-300 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder="Write your thoughts here..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Analyzing...' : 'Submit'}
        </button>
      </form>

      {(emotion || sentiment) && (        //If there's a response from the backend, it displays it in a styled box
        <div className="mt-6 p-4 bg-white rounded shadow bg-white text-black">
          <p className="mb-2"><strong>Detected Emotion:</strong> {emotion}</p>
          <p className="mb-2"><strong>Detected Sentiment:</strong> {sentiment}</p>
          {confidence && (
            <p className="text-sm text-gray-500">Confidence: {(confidence * 100).toFixed(2)}%</p>
          )}
        </div>
      )}
    </div>
  );
}
