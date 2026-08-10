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
  
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expiryHours, setExpiryHours] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    if (user) {
      setupDonorAndFetch();
    }
  }, [user]);

  async function setupDonorAndFetch() {
    await ensureDonorExists();
    await fetchDashboardData();
  }

  async function ensureDonorExists() {
    if (!user) return;
    try {
      const { data: existingDonor, error: checkError } = await supabase
        .from('donors')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingDonor) {
        await supabase.from('donors').insert({
          id: user.id,
          name: user.email?.split('@')[0] || 'Donor',
          email: user.email,
          address: 'Barangay Pasig'
        });
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

    if (!donationsError) {
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

    if (!user) {
      setFormMessage('You need to be logged in to donate.');
      return;
    }

    setFormLoading(true);
    setFormMessage('');

    try {
      const { data: donorCheck } = await supabase
        .from('donors')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!donorCheck) {
        await supabase.from('donors').insert({
          id: user.id,
          name: user.email?.split('@')[0] || 'Donor',
          email: user.email,
          address: 'Barangay Pasig'
        });
      }

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
        fontSize: '1.1rem',
        color: '#6E7160'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 32px 40px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        paddingTop: '0.5rem'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#16180F',
            letterSpacing: '-0.02em'
          }}>
            Dashboard
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.92rem',
            color: '#6E7160'
          }}>
            {role === 'admin' 
              ? 'Manage donations, beneficiaries, and food distribution.'
              : 'Donate surplus food and help reduce waste in your community.'}
          </p>
        </div>
        <span style={{
          background: '#FAF7EE',
          color: '#3C3E30',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          border: '1px solid #E7E3D4'
        }}>
          {role === 'admin' ? 'Admin' : 'Donor'}
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#24391F' }}>
            {stats.totalDonated} kg
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>Total Donated</div>
        </div>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C1592F' }}>
            {stats.totalClaimed} kg
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>Total Claimed</div>
        </div>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6E7160' }}>
            {stats.totalRemaining} kg
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>Still Available</div>
        </div>
      </div>

      {/* Add Donation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: '#24391F',
            color: '#E8B44E',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#345A2C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#24391F';
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Donation'}
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: '#FFFFFF',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid #E7E3D4',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#16180F' }}>
            Add New Donation
          </h3>
          <form onSubmit={handleAddDonation}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6E7160', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Food Type *
                </label>
                <input
                  type="text"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  placeholder="e.g., Tomatoes"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #E7E3D4',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#24391F';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E7E3D4';
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6E7160', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 10"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #E7E3D4',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#24391F';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E7E3D4';
                  }}
                  required
                  step="0.1"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6E7160', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #E7E3D4',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                  <option value="packs">packs</option>
                  <option value="grams">grams</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6E7160', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Expires In (hours) *
                </label>
                <input
                  type="number"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  placeholder="e.g., 24"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #E7E3D4',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#24391F';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E7E3D4';
                  }}
                  required
                />
              </div>
            </div>
            {formMessage && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: formMessage.includes('success') ? '#E8F5E9' : '#FFEBEE',
                color: formMessage.includes('success') ? '#2E7D32' : '#C62828',
                fontSize: '0.9rem'
              }}>
                {formMessage}
              </div>
            )}
            <div style={{ marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  background: '#24391F',
                  color: '#E8B44E',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  opacity: formLoading ? 0.6 : 1,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!formLoading) {
                    e.currentTarget.style.background = '#345A2C';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#24391F';
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
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#16180F' }}>
          Recent Donations
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#6E7160' }}>
          {donations.length} items
        </span>
      </div>

      <div style={{
        overflowX: 'auto',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E7E3D4',
        boxShadow: '0 2px 8px rgba(20,20,10,0.04)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: "'Inter', sans-serif"
        }}>
          <thead>
            <tr style={{
              background: '#FAF7EE',
              borderBottom: '1px solid #E7E3D4'
            }}>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Food Item</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Donor</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Quantity</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Expires In</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6E7160',
                  fontSize: '0.95rem'
                }}>
                  No donations yet. Click "Add Donation" to get started.
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id} style={{
                  borderBottom: '1px solid #F0EDE0',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FAF8F0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#16180F' }}>
                    {donation.food_type}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#3C3E30' }}>
                    {donation.donors?.name || 'You'}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#16180F' }}>
                    {donation.quantity} {donation.unit}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      color: donation.expiry_hours <= 4 ? '#C62828' : 
                             donation.expiry_hours <= 12 ? '#E65100' : '#2E7D32',
                      fontWeight: donation.expiry_hours <= 4 ? 600 : 400
                    }}>
                      {donation.expiry_hours}h
                      {donation.expiry_hours <= 4}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: donation.status === 'available' ? '#E8F5E9' :
                                 donation.status === 'claimed' ? '#FFF3E0' : '#FFEBEE',
                      color: donation.status === 'available' ? '#2E7D32' :
                             donation.status === 'claimed' ? '#E65100' : '#C62828',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
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