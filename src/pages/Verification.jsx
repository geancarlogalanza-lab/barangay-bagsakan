import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Verification() {
  const [qrInput, setQrInput] = useState('');
  const [beneficiary, setBeneficiary] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [hasAllocation, setHasAllocation] = useState(false);

  useEffect(() => {
    checkAllocation();
    fetchRecentScans();
  }, []);

  async function checkAllocation() {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .eq('status', 'confirmed')
      .limit(1);

    if (error) {
      console.error('Error checking allocation:', error);
    } else {
      setHasAllocation(data && data.length > 0);
    }
  }

  async function fetchRecentScans() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        beneficiaries (family_name)
      `)
      .order('claimed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setRecentScans(data || []);
    }
  }

  async function verifyBeneficiary() {
    if (!qrInput.trim()) {
      setMessage('Please enter a QR code.');
      return;
    }

    if (!hasAllocation) {
      setMessage('No active allocation. Please go to Matching page and confirm an allocation first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('qr_code', qrInput.trim())
        .single();

      if (error) {
        setMessage(`Beneficiary not found. QR code "${qrInput.trim()}" does not exist.`);
        setBeneficiary(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setMessage('No beneficiary found with this QR code.');
        setBeneficiary(null);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: claims, error: claimsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('beneficiary_id', data.id)
        .gte('claimed_at', today);

      if (claimsError) {
        console.error('Error checking claims:', claimsError);
      }

      if (claims && claims.length > 0) {
        setMessage(`${data.family_name} has already claimed food today.`);
        setBeneficiary({ ...data, alreadyClaimed: true });
        setLoading(false);
        return;
      }

      const { data: allocationData, error: allocationError } = await supabase
        .from('allocations')
        .select('*, donations(food_type, unit)')
        .eq('status', 'confirmed')
        .order('distributed_at', { ascending: false })
        .limit(1);

      if (allocationError || !allocationData || allocationData.length === 0) {
        setMessage('No active allocation found for today.');
        setBeneficiary(null);
        setLoading(false);
        return;
      }

      const allocation = allocationData[0];
      
      setBeneficiary({
        ...data,
        alreadyClaimed: false,
        allocation: allocation,
        foodType: allocation.donations?.food_type || 'Unknown',
        portion: allocation.portion_per_family
      });

      setMessage(`${data.family_name} is verified and eligible for ${allocation.portion_per_family} ${allocation.donations?.unit || 'kg'} of ${allocation.donations?.food_type || 'food'}.`);

    } catch (error) {
      console.error('Error verifying:', error);
      setMessage('An error occurred during verification.');
    }

    setLoading(false);
  }

  async function confirmRelease() {
    if (!beneficiary) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          beneficiary_id: beneficiary.id,
          allocation_id: beneficiary.allocation?.id,
          status: 'claimed'
        });

      if (error) {
        console.error('Error recording transaction:', error);
        setMessage('Failed to record transaction.');
        setLoading(false);
        return;
      }

      setMessage(`Food released to ${beneficiary.family_name}!`);
      setBeneficiary(null);
      setQrInput('');
      fetchRecentScans();

    } catch (error) {
      console.error('Error confirming release:', error);
      setMessage('An error occurred.');
    }

    setLoading(false);
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
            Pickup Verification
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.92rem',
            color: '#6E7160'
          }}>
            Enter the beneficiary's QR code to verify and release food
          </p>
        </div>
        {hasAllocation && (
          <span style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Active Distribution
          </span>
        )}
      </div>

      {/* Verification Box */}
      <div style={{
        background: '#FFFFFF',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid #E7E3D4',
        maxWidth: '650px',
        marginBottom: '2rem',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.3rem', color: '#6E7160' }}>🔍</span>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#16180F' }}>
              Enter Beneficiary QR Code
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>
              Type the QR code from the beneficiary's card
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem'
        }}>
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Type QR code (e.g., BEN-001)"
            onKeyDown={(e) => e.key === 'Enter' && verifyBeneficiary()}
            disabled={!hasAllocation}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1.5px solid #E7E3D4',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              background: !hasAllocation ? '#FAFAF8' : '#FFFFFF'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#24391F';
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(36,57,31,0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E7E3D4';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={verifyBeneficiary}
            disabled={loading || !hasAllocation}
            style={{
              background: '#24391F',
              color: '#E8B44E',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              cursor: (loading || !hasAllocation) ? 'not-allowed' : 'pointer',
              opacity: (loading || !hasAllocation) ? 0.6 : 1,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!loading && hasAllocation) {
                e.currentTarget.style.background = '#345A2C';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#24391F';
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {!hasAllocation && (
          <div style={{
            marginTop: '0.75rem',
            padding: '12px 16px',
            background: '#FFF3E0',
            color: '#E65100',
            borderRadius: '10px',
            fontSize: '0.9rem',
            borderLeft: '4px solid #FF9800'
          }}>
            No active allocation. Please go to Matching page and confirm an allocation first.
          </div>
        )}

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.95rem',
            background: message.includes('verified') || message.includes('released') ? '#E8F5E9' : 
                       message.includes('already') ? '#FFF3E0' : '#FFEBEE',
            color: message.includes('verified') || message.includes('released') ? '#2E7D32' : 
                   message.includes('already') ? '#E65100' : '#C62828',
            border: `1px solid ${message.includes('verified') || message.includes('released') ? '#C8E6C9' : 
                     message.includes('already') ? '#FFE0B2' : '#FFCDD2'}`
          }}>
            {message}
          </div>
        )}

        {beneficiary && !beneficiary.alreadyClaimed && (
          <div style={{
            marginTop: '1.25rem',
            padding: '1.25rem',
            background: '#E8F5E9',
            borderRadius: '12px',
            borderLeft: '5px solid #4CAF50',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span>✅</span>
              <span style={{ fontWeight: 600, color: '#1E3A2F', fontSize: '1rem' }}>Beneficiary Verified</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#2E7D32', fontSize: '0.85rem', fontWeight: 500 }}>Name</span>
                <span style={{ color: '#16180F', fontWeight: 500 }}>{beneficiary.family_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#2E7D32', fontSize: '0.85rem', fontWeight: 500 }}>Purok</span>
                <span style={{ color: '#16180F', fontWeight: 500 }}>Purok {beneficiary.purok}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#2E7D32', fontSize: '0.85rem', fontWeight: 500 }}>Eligible For</span>
                <span style={{
                  color: '#1E3A2F',
                  fontWeight: 600,
                  background: 'rgba(46,125,50,0.15)',
                  padding: '2px 10px',
                  borderRadius: '6px'
                }}>
                  {beneficiary.portion} {beneficiary.allocation?.donations?.unit || 'kg'} of {beneficiary.foodType}
                </span>
              </div>
            </div>
            <button
              onClick={confirmRelease}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.15s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#43A047';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4CAF50';
              }}
            >
              {loading ? 'Processing...' : 'Confirm Release'}
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#16180F' }}>
          Recent Transactions
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#6E7160' }}>
          {recentScans.length} records
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
              }}>Family</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Time</th>
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
            {recentScans.length === 0 ? (
              <tr>
                <td colSpan="3" style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6E7160',
                  fontSize: '0.95rem'
                }}>
                  No transactions yet.
                </td>
              </tr>
            ) : (
              recentScans.map((scan) => (
                <tr key={scan.id} style={{
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
                    {scan.beneficiaries?.family_name || 'Unknown'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#6E7160' }}>
                    {new Date(scan.claimed_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: scan.status === 'claimed' ? '#E8F5E9' : '#FFEBEE',
                      color: scan.status === 'claimed' ? '#2E7D32' : '#C62828'
                    }}>
                      {scan.status}
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

export default Verification;