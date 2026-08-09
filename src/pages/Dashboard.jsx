import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/authcontext';

function Dashboard() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalClaimed: 0,
    totalRemaining: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user, role } = useAuth();
  
  // Form state
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expiryHours, setExpiryHours] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
    ensureDonorExists();
  }, []);

  // This function creates a donor record for the user if they don't have one
  async function ensureDonorExists() {
    if (!user) return;

    try {
      // Check if user exists in donors table
      const { data: existingDonor, error: checkError } = await supabase
        .from('donors')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking donor:', checkError);
      }

      if (!existingDonor) {
        // Create donor record
        const { error: createError } = await supabase
          .from('donors')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'Donor',
            email: user.email,
            address: 'Barangay Pasig'
          });

        if (createError) {
          console.error('Error creating donor:', createError);
        } else {
          console.log('✅ Donor profile created for:', user.email);
        }
      }
    } catch (error) {
      console.error('Error in ensureDonorExists:', error);
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
    
    if (!foodType || !quantity || !expiryHours) {
      setFormMessage('Please fill in all fields.');
      return;
    }

    setFormLoading(true);
    setFormMessage('');

    try {
      // Make sure donor exists
      if (!user) {
        setFormMessage('You need to be logged in to donate.');
        setFormLoading(false);
        return;
      }

      // Insert donation using user.id as donor_id
      const { error } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
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
        setFormMessage('✅ Donation added successfully!');
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
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '3rem' }}>🍽️</span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {role === 'admin' ? 'Admin' : 'Donor'} Dashboard
            </span>
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            margin: '0.5rem 0 0.25rem 0',
            letterSpacing: '-0.5px'
          }}>
            Barangay Bagsakan
          </h1>
          <p style={{
            fontSize: '1rem',
            opacity: 0.9,
            marginTop: '0.25rem',
            maxWidth: '550px'
          }}>
            {role === 'admin' 
              ? 'Manage donations, beneficiaries, and food distribution.'
              : 'Donate surplus food and help reduce waste in our community.'
            }
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <span className="stat-icon">📦</span>
          <h3 className="number">{stats.totalDonated} kg</h3>
          <p className="label">Total Donated</p>
        </div>
        <div className="stat-card orange">
          <span className="stat-icon">✅</span>
          <h3 className="number">{stats.totalClaimed} kg</h3>
          <p className="label">Total Claimed</p>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">📋</span>
          <h3 className="number">{stats.totalRemaining} kg</h3>
          <p className="label">Still Available</p>
        </div>
      </div>

      {/* Add Donation Button and Form */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Donation'}
        </button>
      </div>

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
            🍽️ Add New Donation
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
                disabled={formLoading}
                className="btn-primary"
                style={{
                  opacity: formLoading ? 0.6 : 1,
                  cursor: formLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {formLoading ? 'Adding...' : 'Add Donation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Donations */}
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
                  No donations available yet. Click "+ Add Donation" to donate food!
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id}>
                  <td>
                    <span style={{ fontWeight: '500' }}>{donation.food_type}</span>
                  </td>
                  <td>{donation.donors?.name || 'You'}</td>
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