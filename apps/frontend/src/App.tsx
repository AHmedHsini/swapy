import React, { useState, useEffect } from 'react';
import './App.css';
import FeedbackModal from './components/FeedbackModal';
import UserProfile from './components/UserProfile';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  condition: string;
  listingType: string;
  price: number | null;
  location: string;
  category: { name: string };
  owner: { firstName: string; lastName: string };
}

interface RepairTicket {
  id: string;
  deviceName: string;
  problemDescription: string;
  aiRecommendation: string;
  repairDifficulty: string;
  estimatedRepairCost: number;
  estimatedResaleValue: number;
  estimatedReplacementCost: number;
  status: string;
}

interface Leader {
  id: string;
  firstName: string;
  lastName: string;
  reputationScore: number;
  totalPoints: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  completedTransactions: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'repair' | 'sustainability' | 'trust'>('marketplace');
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    co2KgAvoided: 142.5,
    ewasteKgReduced: 12.8,
    waterLitersSaved: 840,
    moneySaved: 420.0,
    impactEvents: 14
  });

  // State lists
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Electronics', slug: 'electronics' },
    { id: '2', name: 'Books', slug: 'books' },
    { id: '3', name: 'Home & Kitchen', slug: 'home-kitchen' },
    { id: '4', name: 'Tools & Lab', slug: 'tools-lab' },
    { id: '5', name: 'Clothing', slug: 'clothing' }
  ]);

  const [listings, setListings] = useState<Listing[]>([
    {
      id: 'l1',
      title: 'Arduino Uno Starter Kit',
      description: 'Used for one semester in ECE 101. Includes board, breadboard, resistors, and sensors.',
      condition: 'LIKE_NEW',
      listingType: 'SALE',
      price: 15.0,
      location: 'Engineering Quad',
      category: { name: 'Tools & Lab' },
      owner: { firstName: 'Sarah', lastName: 'Chen' }
    },
    {
      id: 'l2',
      title: 'Dell 24" IPS Monitor',
      description: 'Upgraded to a dual-monitor setup. Screen is in perfect condition, power cable included.',
      condition: 'GOOD',
      listingType: 'EXCHANGE',
      price: null,
      location: 'Science Library',
      category: { name: 'Electronics' },
      owner: { firstName: 'Alex', lastName: 'Rodriguez' }
    },
    {
      id: 'l3',
      title: 'Organic Chemistry Study Guide',
      description: '12th Edition textbook, has minor highlights but otherwise perfectly readable.',
      condition: 'FAIR',
      listingType: 'DONATION',
      price: null,
      location: 'Main Campus Center',
      category: { name: 'Books' },
      owner: { firstName: 'Emma', lastName: 'Watson' }
    },
    {
      id: 'l4',
      title: 'Calculus: Early Transcendentals',
      description: 'Essential textbook. Donating to any student who needs it for Math 1A.',
      condition: 'GOOD',
      listingType: 'DONATION',
      price: null,
      location: 'Science Library',
      category: { name: 'Books' },
      owner: { firstName: 'Sarah', lastName: 'Chen' }
    }
  ]);

  const [repairTickets, setRepairTickets] = useState<RepairTicket[]>([
    {
      id: 't1',
      deviceName: 'Logitech MX Master 3',
      problemDescription: 'The scroll wheel button is stuck and clicking noise is loud.',
      aiRecommendation: 'Clean dust and inspect the mechanical spring latch under the wheel. Safety: Disconnect USB battery before opening.',
      repairDifficulty: 'medium',
      estimatedRepairCost: 8.0,
      estimatedResaleValue: 45.0,
      estimatedReplacementCost: 99.0,
      status: 'AI_RECOMMENDED'
    },
    {
      id: 't2',
      deviceName: 'MacBook Air 2020 M1',
      problemDescription: 'The laptop runs extremely hot and the fan is constantly spinning loudly.',
      aiRecommendation: 'Clean dust from vents while the device is powered off. Check whether fan noise changes under load. Safety: Avoid puncturing battery.',
      repairDifficulty: 'medium',
      estimatedRepairCost: 35.0,
      estimatedResaleValue: 380.0,
      estimatedReplacementCost: 899.0,
      status: 'OPEN'
    }
  ]);

  const [leaders, setLeaders] = useState<Leader[]>([
    { id: 'u1', firstName: 'Sarah', lastName: 'Chen', reputationScore: 4.95, totalPoints: 1250, riskLevel: 'LOW', completedTransactions: 28 },
    { id: 'u2', firstName: 'Alex', lastName: 'Rodriguez', reputationScore: 4.80, totalPoints: 920, riskLevel: 'LOW', completedTransactions: 19 },
    { id: 'u3', firstName: 'Emma', lastName: 'Watson', reputationScore: 4.70, totalPoints: 780, riskLevel: 'LOW', completedTransactions: 14 },
    { id: 'u4', firstName: 'Michael', lastName: 'Scott', reputationScore: 4.10, totalPoints: 340, riskLevel: 'MEDIUM', completedTransactions: 5 }
  ]);

  const [feedbackModalListingId, setFeedbackModalListingId] = useState<string | null>(null);

  // Form states
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    categoryId: '1',
    condition: 'GOOD',
    listingType: 'SALE',
    price: '',
    location: ''
  });

  const [newTicket, setNewTicket] = useState({
    deviceName: '',
    problemDescription: ''
  });

  // Load actual data from API on start if available
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resStats = await fetch('/api/sustainability/dashboard');
      if (resStats.ok) {
        const data = await resStats.json();
        setMetrics({
          co2KgAvoided: Number(data.co2KgAvoided),
          ewasteKgReduced: Number(data.ewasteKgReduced),
          waterLitersSaved: Number(data.waterLitersSaved),
          moneySaved: Number(data.moneySaved),
          impactEvents: data.impactEvents
        });
      }

      const resCats = await fetch('/api/marketplace/categories');
      if (resCats.ok) {
        const data = await resCats.json();
        if (data.length > 0) setCategories(data);
      }

      const resListings = await fetch('/api/marketplace/listings');
      if (resListings.ok) {
        const data = await resListings.json();
        if (data.length > 0) setListings(data);
      }
    } catch (e) {
      console.log("Backend offline or unreachable. Using premium mock data fallback.");
    }
  };

  // Add Listing
  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title || !newListing.description || !newListing.location) return;

    const selectedCategory = categories.find(c => c.id === newListing.categoryId) || categories[0];
    const item: Listing = {
      id: 'l_' + Date.now(),
      title: newListing.title,
      description: newListing.description,
      condition: newListing.condition,
      listingType: newListing.listingType,
      price: newListing.price ? parseFloat(newListing.price) : null,
      location: newListing.location,
      category: { name: selectedCategory.name },
      owner: { firstName: 'Sarah', lastName: 'Chen' } // Default logged-in user
    };

    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'u1', // Default mock user
          categoryId: newListing.categoryId,
          title: newListing.title,
          description: newListing.description,
          condition: newListing.condition,
          listingType: newListing.listingType,
          price: newListing.price ? parseFloat(newListing.price) : undefined,
          location: newListing.location
        })
      });
      if (response.ok) {
        const savedListing = await response.json();
        setListings([savedListing, ...listings]);
      } else {
        setListings([item, ...listings]);
      }
    } catch (error) {
      setListings([item, ...listings]);
    }

    // Update sustainability metrics dynamically on simulation
    let co2 = 1.2;
    let ewaste = 0.1;
    let water = 10;
    if (newListing.listingType === 'SALE' || newListing.listingType === 'DONATION') {
      co2 = 5.6;
      ewaste = 1.5;
      water = 200;
    }
    setMetrics(prev => ({
      ...prev,
      co2KgAvoided: parseFloat((prev.co2KgAvoided + co2).toFixed(1)),
      ewasteKgReduced: parseFloat((prev.ewasteKgReduced + ewaste).toFixed(1)),
      waterLitersSaved: prev.waterLitersSaved + water,
      moneySaved: prev.moneySaved + (item.price || 10),
      impactEvents: prev.impactEvents + 1
    }));

    // Reset Form
    setNewListing({
      title: '',
      description: '',
      categoryId: '1',
      condition: 'GOOD',
      listingType: 'SALE',
      price: '',
      location: ''
    });
  };

  // Add Repair Ticket (Simulate AI Advice)
  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.deviceName || !newTicket.problemDescription) return;

    // Call actual backend which triggers AI service or fallback
    try {
      const response = await fetch('/api/repair/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'u1',
          deviceName: newTicket.deviceName,
          problemDescription: newTicket.problemDescription
        })
      });

      if (response.ok) {
        const savedTicket = await response.json();
        setRepairTickets([savedTicket, ...repairTickets]);
      } else {
        triggerMockAiService();
      }
    } catch (error) {
      triggerMockAiService();
    }

    function triggerMockAiService() {
      // Offline fallback: simulate the AI rules
      const device = newTicket.deviceName.toLowerCase();
      const prob = newTicket.problemDescription.toLowerCase();
      let recommendation = "Check cables, ports, power source, and visible physical damage. Safety: Disconnect power source before opening.";
      let difficulty = "medium";
      let cost = 12.00;
      let resale = 45.00;
      let replacement = 120.00;

      if (device.includes('arduino') || device.includes('board')) {
        recommendation = "Try another USB data cable and port. Check if it appears in the device manager. Safety: Avoid short circuits.";
        difficulty = "low";
        cost = 5.00; resale = 15.00; replacement = 30.00;
      } else if (device.includes('iphone') || device.includes('phone') || device.includes('screen')) {
        recommendation = "Verify if touch digitizer functions. Remove screen cautiously using suction cup. Safety: Beware of swollen battery or glass fragments.";
        difficulty = "high";
        cost = 55.00; resale = 220.00; replacement = 699.00;
      } else if (device.includes('laptop') || device.includes('macbook')) {
        recommendation = "Clean dust from vents while powered off. Verify thermal paste application. Safety: Disconnect the battery terminal immediately after opening.";
        difficulty = "high";
        cost = 45.00; resale = 420.00; replacement = 999.00;
      }

      const ticket: RepairTicket = {
        id: 't_' + Date.now(),
        deviceName: newTicket.deviceName,
        problemDescription: newTicket.problemDescription,
        aiRecommendation: recommendation,
        repairDifficulty: difficulty,
        estimatedRepairCost: cost,
        estimatedResaleValue: resale,
        estimatedReplacementCost: replacement,
        status: 'AI_RECOMMENDED'
      };

      setRepairTickets([ticket, ...repairTickets]);
    }

    // Reset Form
    setNewTicket({ deviceName: '', problemDescription: '' });
  };

  // Transaction actions (minimal integration)
  const handleRequestTransaction = async (listingId: string) => {
    try {
      const res = await fetch('/api/marketplace/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, requesterId: 'u1', transactionType: 'SALE' })
      });
      if (res.ok) {
        alert('Transaction requested');
      } else {
        alert('Failed to request transaction (backend may be offline)');
      }
    } catch (e) {
      alert('Failed to request transaction');
    }
  };

  const handleAcceptTransaction = async (txId: string) => {
    try {
      const res = await fetch(`/api/marketplace/transactions/${txId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'u1' })
      });
      if (res.ok) alert('Transaction accepted'); else alert('Accept failed');
    } catch (e) { alert('Accept failed'); }
  };

  const handleCompleteTransaction = async (txId: string) => {
    try {
      const res = await fetch(`/api/marketplace/transactions/${txId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'u1' })
      });
      if (res.ok) alert('Transaction completed'); else alert('Complete failed');
    } catch (e) { alert('Complete failed'); }
  };

  const handleSubmitFeedback = (listingId: string) => {
    setFeedbackModalListingId(listingId);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon">S</div>
          <span className="logo-text">swapy campus</span>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'repair' ? 'active' : ''}`}
            onClick={() => setActiveTab('repair')}
          >
            AI Repair Center
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'sustainability' ? 'active' : ''}`}
            onClick={() => setActiveTab('sustainability')}
          >
            Sustainability
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'trust' ? 'active' : ''}`}
            onClick={() => setActiveTab('trust')}
          >
            Trust & Community
          </button>
        </nav>

        <div className="user-status">
          <div className="points-badge">
            <span role="img" aria-label="eco">🌱</span> 1,250 Pts
          </div>
          <div className="user-profile">
            <UserProfile userId={'u1'} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Metric Banner */}
        <section className="stats-grid">
          <div className="stat-card co2">
            <span className="stat-title">CO2 Avoided</span>
            <span className="stat-value">{metrics.co2KgAvoided} kg</span>
            <span className="stat-desc">equivalent to planting 6 trees</span>
          </div>
          <div className="stat-card ewaste">
            <span className="stat-title">E-Waste Prevented</span>
            <span className="stat-value">{metrics.ewasteKgReduced} kg</span>
            <span className="stat-desc">electronic gear salvaged</span>
          </div>
          <div className="stat-card water">
            <span className="stat-title">Water Conserved</span>
            <span className="stat-value">{metrics.waterLitersSaved} L</span>
            <span className="stat-desc">retained clean fresh water</span>
          </div>
          <div className="stat-card money">
            <span className="stat-title">Money Saved</span>
            <span className="stat-value">${metrics.moneySaved.toFixed(2)}</span>
            <span className="stat-desc">saved by student community</span>
          </div>
        </section>

        {/* Tab View Contents */}
        {activeTab === 'marketplace' && (
          <div>
            <div className="view-title-section">
              <h2 className="view-title">Campus Circular Marketplace</h2>
              <p className="view-desc">Buy, trade, or accept donations from fellow students on campus.</p>
            </div>
            
            <div className="listings-layout">
              {/* Add Listing Form */}
              <div className="sidebar-form-panel">
                <h3>Publish Listing</h3>
                <form onSubmit={handleAddListing}>
                  <div className="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Arduino Board"
                      value={newListing.title}
                      onChange={e => setNewListing({...newListing, title: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      className="form-textarea" 
                      rows={3}
                      placeholder="Describe the item condition..."
                      value={newListing.description}
                      onChange={e => setNewListing({...newListing, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select 
                        className="form-select"
                        value={newListing.categoryId}
                        onChange={e => setNewListing({...newListing, categoryId: e.target.value})}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Condition</label>
                      <select 
                        className="form-select"
                        value={newListing.condition}
                        onChange={e => setNewListing({...newListing, condition: e.target.value})}
                      >
                        <option value="NEW">New</option>
                        <option value="LIKE_NEW">Like New</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="NEEDS_REPAIR">Needs Repair</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select 
                        className="form-select"
                        value={newListing.listingType}
                        onChange={e => setNewListing({...newListing, listingType: e.target.value})}
                      >
                        <option value="SALE">Sale</option>
                        <option value="DONATION">Donation</option>
                        <option value="EXCHANGE">Exchange</option>
                        <option value="REPAIR_SERVICE">Repair Service</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-input" 
                        disabled={newListing.listingType === 'DONATION' || newListing.listingType === 'EXCHANGE'}
                        placeholder="Free"
                        value={newListing.price}
                        onChange={e => setNewListing({...newListing, price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Science Library"
                      value={newListing.location}
                      onChange={e => setNewListing({...newListing, location: e.target.value})}
                      required 
                    />
                  </div>
                  <button type="submit" className="submit-btn">Publish Item</button>
                </form>
              </div>

              {/* Items List */}
              <div className="listings-grid">
                {listings.length === 0 ? (
                  <div className="empty-state">No listings published yet.</div>
                ) : (
                  listings.map(item => (
                    <div key={item.id} className="listing-card">
                      <div className="listing-image-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <span className={`listing-type-badge ${item.listingType.toLowerCase()}`}>
                          {item.listingType}
                        </span>
                      </div>
                      <div className="listing-details">
                        <span className="listing-category">{item.category.name}</span>
                        <h4 className="listing-title">{item.title}</h4>
                        <p className="listing-desc">{item.description}</p>
                        <div className="listing-footer">
                          <span className="listing-price">
                            {item.listingType === 'DONATION' ? 'FREE' : item.listingType === 'EXCHANGE' ? 'Trade' : `$${item.price}`}
                          </span>
                          <span className="listing-condition">{item.condition.replace('_', ' ')}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-small" onClick={() => handleRequestTransaction(item.id)}>Request</button>
                          <button className="btn-small muted" onClick={() => handleSubmitFeedback(item.id)}>Feedback</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repair' && (
          <div>
            <div className="view-title-section">
              <h2 className="view-title">AI Repair Recommendation Center</h2>
              <p className="view-desc">Enter device models and faults to receive instant repair blueprints and cost prediction metrics.</p>
            </div>

            <div className="listings-layout">
              {/* Submit Ticket Form */}
              <div className="sidebar-form-panel">
                <h3>Diagnose Device</h3>
                <form onSubmit={handleAddTicket}>
                  <div className="form-group">
                    <label>Device Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Arduino Board / iPhone 12"
                      value={newTicket.deviceName}
                      onChange={e => setNewTicket({...newTicket, deviceName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Describe the Issue</label>
                    <textarea 
                      className="form-textarea" 
                      rows={5}
                      placeholder="Explain exactly what is wrong..."
                      value={newTicket.problemDescription}
                      onChange={e => setNewTicket({...newTicket, problemDescription: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-btn">Run AI Diagnostic</button>
                </form>
              </div>

              {/* Tickets List */}
              <div className="tickets-grid">
                {repairTickets.length === 0 ? (
                  <div className="empty-state">No diagnostic tickets requested yet.</div>
                ) : (
                  repairTickets.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                      <div>
                        <div className="ticket-header">
                          <h4 className="ticket-device">{ticket.deviceName}</h4>
                          <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="ticket-desc"><strong>Issue:</strong> {ticket.problemDescription}</p>
                        
                        {ticket.aiRecommendation && (
                          <div className="ai-recommendation-box">
                            <div className="ai-rec-title">
                              <span role="img" aria-label="ai">🤖</span> AI Recommended Procedure
                            </div>
                            <p>{ticket.aiRecommendation}</p>
                          </div>
                        )}
                      </div>

                      <div className="cost-predictions-panel">
                        <div className="cost-row">
                          <span className="cost-label">Difficulty:</span>
                          <span className={`difficulty-badge ${ticket.repairDifficulty?.toLowerCase() || 'medium'}`}>
                            {ticket.repairDifficulty || 'Medium'}
                          </span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">Estimated Repair:</span>
                          <span className="cost-value highlight">${ticket.estimatedRepairCost}</span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">Resale Value:</span>
                          <span className="cost-value">${ticket.estimatedResaleValue}</span>
                        </div>
                        <div className="cost-row">
                          <span className="cost-label">New Replacement:</span>
                          <span className="cost-value">${ticket.estimatedReplacementCost}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sustainability' && (
          <div>
            <div className="view-title-section">
              <h2 className="view-title">Sustainability Analytics</h2>
              <p className="view-desc">View overall ecological impacts accomplished by the Swapy Campus circular economy.</p>
            </div>
            
            <div style={{ background: '#121214', border: '1px solid #27272a', padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Campus Green Milestones</h3>
              <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Every transaction, trade, donation, and device repair replaces new resource manufacturing, directly saving water, raw metals, and avoiding massive carbon footprints.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: '#1a1a1e', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #27272a' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌲</div>
                  <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>CO2 Offset equivalent</h4>
                  <p style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 'bold' }}>{Math.round(metrics.co2KgAvoided / 20)} Trees</p>
                  <p style={{ fontSize: '0.8rem', color: '#71717a' }}>Saved over a decade period</p>
                </div>
                <div style={{ background: '#1a1a1e', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #27272a' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚡</div>
                  <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>E-waste reduction rate</h4>
                  <p style={{ fontSize: '1.5rem', color: '#3b82f6', fontWeight: 'bold' }}>{(metrics.ewasteKgReduced * 2).toFixed(1)} Wh saved</p>
                  <p style={{ fontSize: '0.8rem', color: '#71717a' }}>Mining refabrication saved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trust' && (
          <div>
            <div className="view-title-section">
              <h2 className="view-title">Trust & Community Leaderboard</h2>
              <p className="view-desc">Explore reliable contributors on campus, evaluated via transaction records and reviews.</p>
            </div>

            <div className="leaderboard-list">
              <div className="leaderboard-row header">
                <div>Rank</div>
                <div>User</div>
                <div>Reputation Score</div>
                <div>Transactions</div>
                <div>Trust Risk</div>
              </div>

              {leaders.map((user, index) => (
                <div key={user.id} className="leaderboard-row">
                  <div>
                    <div className="rank-badge">{index + 1}</div>
                  </div>
                  <div>
                    <div className="user-name-cell">
                      <div className="user-avatar" style={{ width: '1.85rem', height: '1.85rem', fontSize: '0.75rem' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: 'white' }}>{user.reputationScore.toFixed(2)} ★</div>
                  <div style={{ color: '#a1a1aa' }}>{user.completedTransactions} completed</div>
                  <div>
                    <span className={`trust-badge ${user.riskLevel.toLowerCase()}`}>
                      {user.riskLevel} RISK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      {feedbackModalListingId && (
        <FeedbackModal
          listingId={feedbackModalListingId}
          onClose={() => setFeedbackModalListingId(null)}
          onSubmitted={() => { /* could refresh listings or trust info */ }}
        />
      )}
      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Swapy Campus Circular Monorepo. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
