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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Fetch donations
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
      
      // Calculate stats
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalDonated} kg</h3>
          <p style={{ margin: 0, color: '#555' }}>Donated</p>
        </div>
        <div style={{
          backgroundColor: '#fff3e0',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalClaimed} kg</h3>
          <p style={{ margin: 0, color: '#555' }}>Claimed</p>
        </div>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalRemaining} kg</h3>
          <p style={{ margin: 0, color: '#555' }}>Remaining</p>
        </div>
      </div>

      {/* Donations Table */}
      <h3 style={{ marginBottom: '1rem' }}>Recent Donations</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead style={{ backgroundColor: '#2d3b5e', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Food Item</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Donor</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Expires In</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>
                  No donations available.
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{donation.food_type}</td>
                  <td style={{ padding: '12px' }}>{donation.donors?.name || 'Unknown'}</td>
                  <td style={{ padding: '12px' }}>{donation.quantity} {donation.unit}</td>
                  <td style={{ padding: '12px' }}>{donation.expiry_hours}h</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: donation.status === 'available' ? '#4caf50' : 
                                     donation.status === 'claimed' ? '#ff9800' : '#f44336',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
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