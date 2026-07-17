import React, { useState } from 'react';

interface Props {
  listingId: string;
  reviewerId?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function FeedbackModal({ listingId, reviewerId = 'u1', onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (rating < 1 || rating > 5) return setError('Rating must be 1-5');
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId, rating, comment })
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || 'Failed to submit feedback');
      } else {
        onSubmitted && onSubmitted();
        onClose();
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <h3>Submit Feedback</h3>
        <div className="form-row">
          <label>Rating</label>
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Okay</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Terrible</option>
          </select>
        </div>
        <div className="form-row">
          <label>Comment (optional)</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}></textarea>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={loading}>Submit</button>
        </div>
      </div>
    </div>
  );
}
