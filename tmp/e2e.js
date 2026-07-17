import fs from 'fs';
import path from 'path';

const base = 'http://127.0.0.1:4000/api';

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
}

async function patch(url, body) {
  const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
}

async function get(url) {
  const res = await fetch(url);
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
}

(async () => {
  console.log('Creating owner...');
  const owner = await post(`${base}/users`, { firstName: 'Owner', lastName: 'User', email: 'owner@example.com', password: 'password123' });
  console.log('owner:', owner);

  console.log('Creating requester...');
  const requester = await post(`${base}/users`, { firstName: 'Requester', lastName: 'User', email: 'requester@example.com', password: 'password123' });
  console.log('requester:', requester);

  console.log('Creating category...');
  const category = await post(`${base}/marketplace/categories`, { name: 'Test Category' });
  console.log('category:', category);

  const categoryId = category.body && category.body.id ? category.body.id : (category.body && category.body[0] && category.body[0].id) || null;
  const ownerId = owner.body && owner.body.id ? owner.body.id : null;
  const requesterId = requester.body && requester.body.id ? requester.body.id : null;

  if (!categoryId || !ownerId || !requesterId) {
    console.error('Missing IDs, aborting.');
    process.exit(1);
  }

  console.log('Creating listing...');
  const listing = await post(`${base}/marketplace/listings`, { userId: ownerId, categoryId, title: 'Sprint1 Test Item', description: 'Test', condition: 'GOOD', listingType: 'SALE', price: 12, location: 'Science Library' });
  console.log('listing:', listing);
  const listingId = listing.body && listing.body.id ? listing.body.id : null;
  if (!listingId) { console.error('No listingId'); process.exit(1); }

  console.log('Requesting transaction...');
  const tx = await post(`${base}/marketplace/transactions`, { listingId, requesterId, transactionType: 'SALE' });
  console.log('transaction create:', tx);
  const txId = tx.body && tx.body.id ? tx.body.id : null;
  if (!txId) { console.error('No txId'); process.exit(1); }

  console.log('Accepting transaction...');
  const accept = await patch(`${base}/marketplace/transactions/${txId}/accept`, { actorId: ownerId });
  console.log('accept:', accept);

  console.log('Completing transaction...');
  const complete = await patch(`${base}/marketplace/transactions/${txId}/complete`, { actorId: requesterId });
  console.log('complete:', complete);

  console.log('Submitting feedback...');
  const feedback = await post(`${base}/marketplace/listings/${listingId}/feedback`, { reviewerId: requesterId, rating: 5, comment: 'Great exchange' });
  console.log('feedback:', feedback);

  console.log('Fetching owner user (trust)...');
  const user = await get(`${base}/users/${ownerId}`);
  console.log('owner user:', JSON.stringify(user, null, 2));

})();
