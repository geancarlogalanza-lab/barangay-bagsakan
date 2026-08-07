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
      if (!data || data.length === 0) {
        setMessage('⚠️ No active allocation found. Please go to Matching page first.');
      }
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
      setMessage('⚠️ Please enter a QR code.');
      return;
    }

    if (!hasAllocation) {
      setMessage('⚠️ No active allocation. Please confirm an allocation on the Matching page first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Find beneficiary by QR code
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('qr_code', qrInput.trim())
        .single();

      if (error) {
        setMessage(`❌ Beneficiary not found. QR code "${qrInput.trim()}" does not exist.`);
        setBeneficiary(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setMessage('❌ No beneficiary found with this QR code.');
        setBeneficiary(null);
        setLoading(false);
        return;
      }

      // Check if beneficiary already claimed today
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
        setMessage(`⚠️ ${data.family_name} has already claimed food today.`);
        setBeneficiary({ ...data, alreadyClaimed: true });
        setLoading(false);
        return;
      }

      // Get today's allocation
      const { data: allocationData, error: allocationError } = await supabase
        .from('allocations')
        .select('*, donations(food_type, unit)')
        .eq('status', 'confirmed')
        .order('distributed_at', { ascending: false })
        .limit(1);

      if (allocationError || !allocationData || allocationData.length === 0) {
        setMessage('❌ No active allocation found for today.');
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

      setMessage(`✅ ${data.family_name} is verified and eligible for ${allocation.portion_per_family} ${allocation.donations?.unit || 'kg'} of ${allocation.donations?.food_type || 'food'}.`);

    } catch (error) {
      console.error('Error verifying:', error);
      setMessage('❌ An error occurred during verification.');
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
        setMessage('❌ Failed to record transaction.');
        setLoading(false);
        return;
      }

      setMessage(`✅ Food released to ${beneficiary.family_name}!`);
      setBeneficiary(null);
      setQrInput('');
      fetchRecentScans();

    } catch (error) {
      console.error('Error confirming release:', error);
      setMessage('❌ An error occurred.');
    }

    setLoading(false);
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Pickup Verification</h2>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        marginBottom: '2rem'
      }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Enter Beneficiary QR Code:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="e.g., BEN-001"
            style={{
              flex: 1,
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={verifyBeneficiary}
            disabled={loading || !hasAllocation}
            style={{
              backgroundColor: '#2d3b5e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: (loading || !hasAllocation) ? 'not-allowed' : 'pointer',
              opacity: (loading || !hasAllocation) ? 0.6 : 1
            }}
          >
            {loading ? 'Verifying...' : 'SCAN'}
          </button>
        </div>

        {!hasAllocation && (
          <div style={{
            marginTop: '0.5rem',
            color: '#f44336',
            fontSize: '0.9rem'
          }}>
            ⚠️ No active allocation. Please go to Matching page and confirm an allocation first.
          </div>
        )}

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: message.startsWith('✅') ? '#e8f5e9' : 
                           message.startsWith('⚠️') ? '#fff3e0' : '#ffebee',
            borderRadius: '8px',
            color: message.startsWith('✅') ? '#2e7d32' : 
                   message.startsWith('⚠️') ? '#e65100' : '#c62828'
          }}>
            {message}
          </div>
        )}

        {beneficiary && !beneficiary.alreadyClaimed && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>✓ Beneficiary Verified</h4>
            <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {beneficiary.family_name}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Purok:</strong> {beneficiary.purok}</p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Eligible for:</strong> {beneficiary.portion} {beneficiary.allocation?.donations?.unit || 'kg'} of {beneficiary.foodType}
            </p>
            <button
              onClick={confirmRelease}
              disabled={loading}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                marginTop: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'CONFIRM RELEASE'}
            </button>
          </div>
        )}
      </div>

      <h3>Recent Transactions</h3>
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
              <th style={{ padding: '12px', textAlign: 'left' }}>Family</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  No transactions yet. Scan a beneficiary and release food to see records here.
                </td>
              </tr>
            ) : (
              recentScans.map((scan) => (
                <tr key={scan.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    {scan.beneficiaries?.family_name || 'Unknown'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(scan.claimed_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      color: scan.status === 'claimed' ? '#4caf50' : '#f44336'
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