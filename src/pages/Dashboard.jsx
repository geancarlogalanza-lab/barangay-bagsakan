import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Dashboard() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalClaimed: 0,
    totalRemaining: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [donors, setDonors] = useState([]);
  
  // Form state
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expiryHours, setExpiryHours] = useState('');
  const [donorId, setDonorId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchDonors();
  }, []);

  async function fetchDonors() {
    const { data, error } = await supabase
      .from('donors')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching donors:', error);
    } else {
      setDonors(data || []);
      if (data && data.length > 0) {
        setDonorId(data[0].id);
      }
    }
  }

  async function fetchDashboardData() {
    setLoading(true);
    
    const { data: donationsData, error: donationsError } = await supabase
      .from('donations')
      .select(`
        *,
        donors (name)
      `)
      .order('created_at', { ascending: false });

    if (donationsError) {
      console.error('Error fetching donations:', donationsError);
    } else {
      setDonations(donationsData || []);
      
      const totalDonated = donationsData?.reduce((sum, d) => sum + d.quantity, 0) || 0;
      const claimed = donationsData?.filter(d => d.status === 'claimed');
      const totalClaimed = claimed?.reduce((sum, d) => sum + d.quantity, 0) || 0;
      
      setStats({
        totalDonated: totalDonated,
        totalClaimed: totalClaimed,
        totalRemaining: totalDonated - totalClaimed
      });
    }
    
    setLoading(false);
  }

  async function handleAddDonation(e) {
    e.preventDefault();
    
    if (!foodType || !quantity || !expiryHours || !donorId) {
      setFormMessage('Please fill in all fields.');
      return;
    }

    setFormLoading(true);
    setFormMessage('');

    try {
      const { error } = await supabase
        .from('donations')
        .insert({
          donor_id: donorId,
          food_type: foodType,
          quantity: parseFloat(quantity),
          unit: unit,
          expiry_hours: parseInt(expiryHours),
          status: 'available'
        });

      if (error) {
        console.error('Error adding donation:', error);
        setFormMessage('Failed to add donation: ' + error.message);
      } else {
        setFormMessage('Donation added successfully!');
        setFoodType('');
        setQuantity('');
        setExpiryHours('');
        setUnit('kg');
        setTimeout(() => {
          setShowAddForm(false);
          setFormMessage('');
          fetchDashboardData();
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      setFormMessage('An error occurred.');
    }

    setFormLoading(false);
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.8rem',
          color: '#1a1a2e'
        }}>
          Dashboard
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Donation'}
        </button>
      </div>

      {/* Add Donation Form */}
      {showAddForm && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1a1a2e' }}>
            Add New Donation
          </h3>
          <form onSubmit={handleAddDonation}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                  Food Type *
                </label>
                <input
                  type="text"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  placeholder="e.g., Tomatoes"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 10"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                  step="0.1"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                  <option value="packs">packs</option>
                  <option value="grams">grams</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                  Expires In (hours) *
                </label>
                <input
                  type="number"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  placeholder="e.g., 24"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                  Donor *
                </label>
                <select
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                  required
                >
                  {donors.length === 0 ? (
                    <option value="">No donors available</option>
                  ) : (
                    donors.map((donor) => (
                      <option key={donor.id} value={donor.id}>
                        {donor.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            {formMessage && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: formMessage.includes('success') ? '#e8f5e9' : '#ffebee',
                color: formMessage.includes('success') ? '#2e7d32' : '#c62828'
              }}>
                {formMessage}
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={formLoading || donors.length === 0}
                className="btn-primary"
                style={{
                  opacity: (formLoading || donors.length === 0) ? 0.6 : 1,
                  cursor: (formLoading || donors.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {formLoading ? 'Adding...' : 'Add Donation'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormMessage('');
                }}
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #ddd',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#ddd';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon">📦</div>
          <h3 className="number">{stats.totalDonated} kg</h3>
          <p className="label">Total Donated</p>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">✅</div>
          <h3 className="number">{stats.totalClaimed} kg</h3>
          <p className="label">Total Claimed</p>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <h3 className="number">{stats.totalRemaining} kg</h3>
          <p className="label">Still Available</p>
        </div>
      </div>

      {/* Donations Table */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a2e' }}>
          Recent Donations
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#888' }}>
          {donations.length} items
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Food Item</th>
              <th>Donor</th>
              <th>Quantity</th>
              <th>Expires In</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
                  No donations available yet.
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id}>
                  <td>
                    <span style={{ fontWeight: '500' }}>{donation.food_type}</span>
                  </td>
                  <td>{donation.donors?.name || 'Unknown'}</td>
                  <td>
                    <span style={{ fontWeight: '500' }}>
                      {donation.quantity} {donation.unit}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      color: donation.expiry_hours <= 4 ? '#c62828' : 
                             donation.expiry_hours <= 12 ? '#e65100' : '#2e7d32',
                      fontWeight: donation.expiry_hours <= 4 ? '600' : '400'
                    }}>
                      {donation.expiry_hours}h
                      {donation.expiry_hours <= 4 && ' ⚠️'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${donation.status}`}>
                      {donation.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;