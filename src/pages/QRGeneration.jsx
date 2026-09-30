import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import QRCodeImage from '../components/QRCodeImage';

function QRGeneration() {
  const [allocation, setAllocation] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const location = useLocation();

  // A specific family's QR can be opened from the Beneficiaries page (/qr?code=BEN-XXXXXXXX)
  const qrCodeFromUrl = (new URLSearchParams(location.search).get('code') || '').trim().toUpperCase();

  useEffect(() => {
    let cancelled = false;

    async function fetchQRData() {
      setLoading(true);
      setError('');

      const [allocationResult, beneficiariesResult] = await Promise.all([
        supabase
          .from('allocations')
          .select('*, donations(food_type, quantity, unit)')
          .eq('status', 'confirmed')
          .order('distributed_at', { ascending: false })
          .limit(1),
        supabase
          .from('beneficiaries')
          .select('id, family_name, purok, qr_code')
          .not('qr_code', 'is', null)
          .order('family_name')
      ]);

      if (cancelled) return;

      const queryError = allocationResult.error || beneficiariesResult.error;
      if (queryError) {
        console.error('Error loading QR data:', queryError);
        setError('Could not load QR data from the database. Please check your connection and try again.');
      } else {
        setAllocation(allocationResult.data[0] || null);
        setBeneficiaries(beneficiariesResult.data || []);
      }

      setLoading(false);
    }

    fetchQRData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

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

  if (error) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#16180F', marginBottom: '0.5rem', fontWeight: 800 }}>
          Unable to Load QR Codes
        </h2>
        <p style={{ color: '#C62828', marginBottom: '1.5rem' }}>
          {error}
        </p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          style={{
            background: '#24391F',
            color: '#E8B44E',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '999px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#16180F', marginBottom: '0.5rem', fontWeight: 800 }}>
          No QR Codes Yet
        </h2>
        <p style={{ color: '#6E7160', marginBottom: '1.5rem' }}>
          No beneficiary has a QR code yet. Generate one from the Beneficiaries page first.
        </p>
        <Link
          to="/beneficiaries"
          style={{
            background: '#24391F',
            color: '#E8B44E',
            padding: '12px 28px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'inline-block'
          }}
        >
          Go to Beneficiaries
        </Link>
      </div>
    );
  }

  // Show the family from the URL, or the first family with a QR code
  const selected = qrCodeFromUrl
    ? beneficiaries.find((b) => b.qr_code === qrCodeFromUrl)
    : beneficiaries[0];
  const donation = allocation?.donations;

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
            {selected ? `QR code for ${selected.family_name}` : 'Select a family below to show their QR code'}
          </p>
        </div>
        <span style={{
          background: allocation ? '#E8F5E9' : '#FFF3E0',
          color: allocation ? '#2E7D32' : '#E65100',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {allocation ? 'Allocation Confirmed' : 'No Active Allocation'}
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
          {selected ? (
            <>
              <div style={{
                display: 'inline-block',
                padding: '1rem',
                background: '#FFFFFF',
                border: '2px solid #24391F',
                borderRadius: '12px'
              }}>
                <QRCodeImage
                  value={selected.qr_code}
                  size={220}
                  alt={`Scannable QR Code for ${selected.family_name}`}
                />
              </div>
              <div style={{
                marginTop: '0.75rem',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#16180F'
              }}>
                {selected.family_name}
              </div>
              {selected.purok && (
                <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>
                  Purok {selected.purok}
                </div>
              )}
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
                  {selected.qr_code}
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
                className="no-print"
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
            </>
          ) : (
            <div style={{
              padding: '12px 16px',
              background: '#FFEBEE',
              color: '#C62828',
              borderRadius: '10px',
              fontSize: '0.9rem',
              border: '1px solid #FFCDD2'
            }}>
              QR code "{qrCodeFromUrl}" does not belong to any registered beneficiary.
              Select a family below.
            </div>
          )}
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
          {allocation && donation ? (
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
          ) : (
            <div>
              <p style={{ color: '#6E7160', marginTop: 0 }}>
                No confirmed allocation yet. This QR code is valid, but it cannot be
                verified at pickup until an allocation is confirmed.
              </p>
              <Link
                to="/matching"
                className="no-print"
                style={{
                  background: '#24391F',
                  color: '#E8B44E',
                  padding: '10px 24px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  display: 'inline-block'
                }}
              >
                Go to Matching
              </Link>
            </div>
          )}
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
        {allocation && (
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6E7160', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Distribution ID
            </div>
            <div style={{ fontWeight: 600, color: '#16180F' }}>{allocation.id.slice(0, 12)}...</div>
          </div>
        )}
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

      {/* Beneficiary QR Codes */}
      <div className="no-print" style={{
        marginTop: '2rem',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E7E3D4',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#16180F' }}>
          Beneficiary QR Codes ({beneficiaries.length})
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          {beneficiaries.map((beneficiary) => {
            const isSelected = selected?.id === beneficiary.id;
            return (
              <Link
                key={beneficiary.id}
                to={`/qr?code=${encodeURIComponent(beneficiary.qr_code)}`}
                style={{
                  background: isSelected ? '#E8F5E9' : '#FAF7EE',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: `1.5px solid ${isSelected ? '#2E7D32' : '#E7E3D4'}`,
                  textAlign: 'center',
                  textDecoration: 'none'
                }}
              >
                <QRCodeImage
                  value={beneficiary.qr_code}
                  size={60}
                  alt={`QR for ${beneficiary.family_name}`}
                  style={{ margin: '0 auto', borderRadius: '4px' }}
                />
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#16180F',
                  marginTop: '4px'
                }}>
                  {beneficiary.family_name}
                </div>
                <code style={{
                  fontSize: '0.65rem',
                  color: '#6E7160',
                  fontFamily: '"Space Mono", monospace',
                  background: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '2px'
                }}>
                  {beneficiary.qr_code}
                </code>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default QRGeneration;
