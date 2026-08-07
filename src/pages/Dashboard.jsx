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
      {/* Hero Section with Gradient Background */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
      }}>
        {/* Decorative background circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-30px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '3rem',
              lineHeight: 1
            }}></span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Community Food Rescue
            </span>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0.5rem 0 0.25rem 0',
            letterSpacing: '-0.5px',
            lineHeight: 1.1
          }}>
            Barangay Bagsakan
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            marginTop: '0.25rem',
            maxWidth: '550px',
            lineHeight: 1.5
          }}>
            A food surplus redistribution system connecting donors to families in need.
            <br />
            <span style={{ opacity: 0.7, fontSize: '0.95rem' }}>
              Every donation counts. Every family matters.
            </span>
          </p>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '0.6rem 1.5rem',
              borderRadius: '30px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '1.1rem' }}></span>
              {donations.length} Donations
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '0.6rem 1.5rem',
              borderRadius: '30px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '1.1rem' }}></span>
              {stats.totalDonated} kg Rescued
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '0.6rem 1.5rem',
              borderRadius: '30px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '1.1rem' }}></span>
              {new Set(donations.map(d => d.donor_id)).size} Donors
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <span className="stat-icon"></span>
          <h3 className="number">{stats.totalDonated} kg</h3>
          <p className="label">Total Donated</p>
        </div>
        <div className="stat-card orange">
          <span className="stat-icon"></span>
          <h3 className="number">{stats.totalClaimed} kg</h3>
          <p className="label">Total Claimed</p>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon"></span>
          <h3 className="number">{stats.totalRemaining} kg</h3>
          <p className="label">Still Available</p>
        </div>
      </div>

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
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
                  No donations available yet.
                  <br />
                  <span style={{ fontSize: '0.85rem', color: '#bbb' }}>Check back later.</span>
                </td>
              </tr>
            ) : (
              donations.slice(0, 10).map((donation) => (
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
                      {donation.expiry_hours <= 4}
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

      {/* Footer Stats */}
      <div style={{
        marginTop: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        padding: '1.25rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Active Donors</span>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a2e' }}>
            {new Set(donations.map(d => d.donor_id)).size}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Total Donations</span>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a2e' }}>
            {donations.length}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Avg. Expiry</span>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1a1a2e' }}>
            {donations.length > 0 
              ? Math.round(donations.reduce((sum, d) => sum + d.expiry_hours, 0) / donations.length) + 'h'
              : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;