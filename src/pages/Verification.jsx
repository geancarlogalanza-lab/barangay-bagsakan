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
      // Find beneficiary by QR code
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
        setMessage(`${data.family_name} has already claimed food today.`);
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
    <div style={{ padding: '0.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon"></span> Pickup Verification
          </h1>
          <p className="page-subtitle">Scan beneficiary QR codes to release food</p>
        </div>
        {hasAllocation && (
          <span className="badge badge-available">Active Distribution</span>
        )}
      </div>

      {/* Verification Box */}
      <div className="verification-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '2rem' }}></span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a2e' }}>Verify Beneficiary</div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Enter the QR code from the beneficiary's card</div>
          </div>
        </div>

        <div className="verification-input-group">
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Enter QR code (e.g., BEN-001)"
            onKeyDown={(e) => e.key === 'Enter' && verifyBeneficiary()}
            disabled={!hasAllocation}
          />
          <button
            onClick={verifyBeneficiary}
            disabled={loading || !hasAllocation}
            className="btn-primary"
            style={{
              whiteSpace: 'nowrap',
              opacity: (loading || !hasAllocation) ? 0.6 : 1,
              cursor: (loading || !hasAllocation) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verifying...' : 'Scan'}
          </button>
        </div>

        {!hasAllocation && (
          <div className="verification-warning">
             No active allocation. Please go to Matching page and confirm an allocation first.
          </div>
        )}

        {message && (
          <div className={`verification-message ${
            message.includes('verified') || message.includes('released') ? 'success' : 
            message.includes('already') ? 'warning' : 'error'
          }`}>
            {message}
          </div>
        )}

        {beneficiary && !beneficiary.alreadyClaimed && (
          <div className="verified-details">
            <div className="verified-details-header">
              <span></span>
              <span className="verified-details-title">Beneficiary Verified</span>
            </div>
            <div className="verified-row">
              <span className="verified-label">Name</span>
              <span className="verified-value">{beneficiary.family_name}</span>
            </div>
            <div className="verified-row">
              <span className="verified-label">Purok</span>
              <span className="verified-value">Purok {beneficiary.purok}</span>
            </div>
            <div className="verified-row">
              <span className="verified-label">Eligible For</span>
              <span className="verified-value-highlight">
                {beneficiary.portion} {beneficiary.allocation?.donations?.unit || 'kg'} of {beneficiary.foodType}
              </span>
            </div>
            <button
              onClick={confirmRelease}
              disabled={loading}
              className="btn-success"
              style={{ width: '100%', marginTop: '0.5rem' }}
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
        marginTop: '2rem',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a2e' }}>
          Recent Transactions
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#888' }}>
          {recentScans.length} records
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Family</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2.5rem', textAlign: 'center', color: '#999' }}>
                  No transactions yet.
                </td>
              </tr>
            ) : (
              recentScans.map((scan) => (
                <tr key={scan.id}>
                  <td>
                    <span style={{ fontWeight: '500' }}>
                      {scan.beneficiaries?.family_name || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#666' }}>
                      {new Date(scan.claimed_at).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${scan.status === 'claimed' ? 'badge-available' : 'badge-expired'}`}>
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