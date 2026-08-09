import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

function QRGeneration() {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);

  useEffect(() => {
    fetchLatestAllocation();
  }, []);

  async function fetchLatestAllocation() {
    setLoading(true);
    
    const { data: allocationData, error: allocationError } = await supabase
      .from('allocations')
      .select('*')
      .eq('status', 'confirmed')
      .order('distributed_at', { ascending: false })
      .limit(1);

    if (allocationError) {
      console.error('Error fetching allocation:', allocationError);
      setLoading(false);
      return;
    }

    if (allocationData && allocationData.length > 0) {
      setAllocation(allocationData[0]);
      
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', allocationData[0].donation_id)
        .single();

      if (donationError) {
        console.error('Error fetching donation:', donationError);
      } else {
        setDonation(donationData);
      }
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
        Loading QR data...
      </div>
    );
  }

  if (!allocation || !donation) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
        <h2 style={{ color: '#1a1a2e', marginBottom: '0.5rem' }}>No Active Allocation</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          No confirmed allocation found. Please go to Matching & Allocation to confirm an allocation first.
        </p>
        <Link 
          to="/matching" 
          className="btn-primary"
          style={{ 
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Go to Matching
        </Link>
      </div>
    );
  }

  const qrData = JSON.stringify({
    allocationId: allocation.id,
    foodType: donation.food_type,
    quantity: donation.quantity,
    portionPerFamily: allocation.portion_per_family,
    families: allocation.total_families
  });

  return (
    <div style={{ padding: '0.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon"></span> QR Generation
          </h1>
          <p className="page-subtitle">Scan this QR code at the pickup point</p>
        </div>
        <span className="badge badge-available">✅ Allocation Confirmed</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* QR Code Column */}
        <div className="qr-card">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1a1a2e' }}>
            Distribution QR Code
          </h3>
          <div className="qr-code-wrapper">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
              alt="Distribution QR Code" 
              className="qr-code-image"
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem' }}>
            Scan this QR code at the pickup point
          </p>
          <button 
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ marginTop: '0.5rem' }}
          >
             Print QR Code
          </button>
        </div>

        {/* Details Column */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '2rem',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1a1a2e' }}>
            Food Package Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ color: '#666' }}>Food Item</span>
              <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{donation.food_type}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ color: '#666' }}>Total Quantity</span>
              <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{donation.quantity} {donation.unit}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ color: '#666' }}>Per Family</span>
              <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{allocation.portion_per_family} {donation.unit}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0'
            }}>
              <span style={{ color: '#666' }}>Families Served</span>
              <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{allocation.total_families}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '1.5rem',
        background: '#f5f7fa',
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Distribution ID</div>
          <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{allocation.id.slice(0, 12)}...</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Pickup Location</div>
          <div style={{ fontWeight: '600', color: '#1a1a2e' }}>Barangay Hall, Purok 1-3</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Pickup Time</div>
          <div style={{ fontWeight: '600', color: '#1a1a2e' }}>2:00 PM - 5:00 PM</div>
        </div>
      </div>
    </div>
  );
}

export default QRGeneration;