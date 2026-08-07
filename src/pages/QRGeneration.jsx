import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
        <h2 style={{ color: '#1a1a2e', marginBottom: '0.5rem' }}>No Active Allocation</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          No confirmed allocation found. Please go to Matching & Allocation to confirm an allocation first.
        </p>
        <a 
          href="/matching" 
          style={{
            background: 'linear-gradient(135deg, #2d3b5e 0%, #1a1a2e 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Go to Matching
        </a>
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.8rem',
          color: '#1a1a2e'
        }}>
          QR Generation
        </h2>
        <span style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          Allocation Confirmed
        </span>
      </div>

      {/* Info Banner */}
      <div style={{
        background: '#e8f5e9',
        border: '1px solid #a5d6a7',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontWeight: '600', color: '#1e3a2f' }}>
          Distribution Ready
        </div>
        <div style={{ fontSize: '0.85rem', color: '#2e7d32' }}>
          QR code generated for today's food distribution
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* QR Code Column */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '2rem',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1a1a2e' }}>
            Distribution QR Code
          </h3>
          <div style={{ 
            display: 'inline-block', 
            padding: '1rem', 
            background: 'white',
            border: '2px solid #2d3b5e',
            borderRadius: '12px',
            transition: 'all 0.3s ease'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
              alt="Distribution QR Code" 
              style={{ 
                width: '180px', 
                height: '180px',
                display: 'block'
              }}
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem' }}>
            Scan this QR code at the pickup point
          </p>
          <button 
            onClick={() => window.print()}
            style={{
              background: 'transparent',
              color: '#2d3b5e',
              border: '2px solid #2d3b5e',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2d3b5e';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#2d3b5e';
            }}
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