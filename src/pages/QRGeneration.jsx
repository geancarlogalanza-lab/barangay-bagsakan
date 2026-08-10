import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

function QRGeneration() {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const location = useLocation();

  // Get QR code from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const qrCodeFromUrl = queryParams.get('code');

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    await fetchLatestAllocation();
    setLoading(false);
  }

  async function fetchLatestAllocation() {
    const { data: allocationData, error: allocationError } = await supabase
      .from('allocations')
      .select('*')
      .eq('status', 'confirmed')
      .order('distributed_at', { ascending: false })
      .limit(1);

    if (allocationError) {
      console.error('Error fetching allocation:', allocationError);
      return;
    }

    if (allocationData && allocationData.length > 0) {
      setAllocation(allocationData[0]);
      
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', allocationData[0].donation_id)
        .single();

      if (!donationError) {
        setDonation(donationData);
      }
    }
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
        Loading QR data...
      </div>
    );
  }

  if (!allocation || !donation) {
    return (
      <div style={{ 
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#16180F', marginBottom: '0.5rem', fontWeight: 800 }}>
          No Active Allocation
        </h2>
        <p style={{ color: '#6E7160', marginBottom: '1.5rem' }}>
          No confirmed allocation found. Please go to Matching & Allocation to confirm an allocation first.
        </p>
        <Link 
          to="/matching" 
          style={{
            background: '#24391F',
            color: '#E8B44E',
            padding: '12px 28px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'inline-block',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#345A2C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#24391F';
          }}
        >
          Go to Matching
        </Link>
      </div>
    );
  }

  // Use QR code from URL if available
  const displayQRCode = qrCodeFromUrl || 'BEN-001';

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 32px 40px' }}>
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
            QR Generation
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.92rem',
            color: '#6E7160'
          }}>
            {qrCodeFromUrl ? `QR Code: ${qrCodeFromUrl}` : 'Generate a QR code from Beneficiaries'}
          </p>
        </div>
        <span style={{
          background: '#E8F5E9',
          color: '#2E7D32',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          Allocation Confirmed
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E7E3D4',
          padding: '2rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#16180F' }}>
            Distribution QR Code
          </h3>
          <div style={{
            display: 'inline-block',
            padding: '1rem',
            background: '#FFFFFF',
            border: '2px solid #24391F',
            borderRadius: '12px'
          }}>
            <img 
              key={displayQRCode}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${displayQRCode}`}
              alt="Scannable QR Code"
              style={{
                width: '220px',
                height: '220px',
                display: 'block'
              }}
            />
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#6E7160',
            marginTop: '0.75rem'
          }}>
            Scan this QR code with any phone camera
          </p>
          <div style={{
            background: '#FAF7EE',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginTop: '0.75rem',
            border: '1px solid #E7E3D4'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#6E7160', fontWeight: 600 }}>
              QR Code Value:
            </span>
            <code style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#24391F',
              background: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid #E7E3D4',
              fontFamily: '"Space Mono", monospace'
            }}>
              {displayQRCode}
            </code>
            <p style={{
              fontSize: '0.7rem',
              color: '#6E7160',
              marginTop: '6px'
            }}>
              Enter this code in the Verification page
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            style={{
              background: 'transparent',
              color: '#24391F',
              border: '1.5px solid #24391F',
              padding: '8px 20px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginTop: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#24391F';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#24391F';
            }}
          >
            Print QR Code
          </button>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E7E3D4',
          padding: '2rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#16180F' }}>
            Food Package Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #F0EDE0'
            }}>
              <span style={{ color: '#6E7160' }}>Food Item</span>
              <span style={{ fontWeight: 600, color: '#16180F' }}>{donation.food_type}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #F0EDE0'
            }}>
              <span style={{ color: '#6E7160' }}>Total Quantity</span>
              <span style={{ fontWeight: 600, color: '#16180F' }}>{donation.quantity} {donation.unit}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #F0EDE0'
            }}>
              <span style={{ color: '#6E7160' }}>Per Family</span>
              <span style={{ fontWeight: 600, color: '#16180F' }}>{allocation.portion_per_family} {donation.unit}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0'
            }}>
              <span style={{ color: '#6E7160' }}>Families Served</span>
              <span style={{ fontWeight: 600, color: '#16180F' }}>{allocation.total_families}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        background: '#FAF7EE',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #E7E3D4',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#6E7160', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Distribution ID
          </div>
          <div style={{ fontWeight: 600, color: '#16180F' }}>{allocation.id.slice(0, 12)}...</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#6E7160', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pickup Location
          </div>
          <div style={{ fontWeight: 600, color: '#16180F' }}>Barangay Hall, Purok 1-3</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#6E7160', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pickup Time
          </div>
          <div style={{ fontWeight: 600, color: '#16180F' }}>2:00 PM - 5:00 PM</div>
        </div>
      </div>
    </div>
  );
}

export default QRGeneration;