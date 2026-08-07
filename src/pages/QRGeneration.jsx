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
    return <div>Loading...</div>;
  }

  if (!allocation || !donation) {
    return (
      <div>
        <h2>QR Generation</h2>
        <p>No confirmed allocation found. Please go to Matching & Allocation to confirm an allocation first.</p>
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
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>QR Generation</h2>
      
      <div style={{
        backgroundColor: '#e8f5e9',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: 0, color: '#2e7d32' }}>✅ Allocation Confirmed!</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0 }}>Distribution QR Code</h3>
          <div style={{ 
            display: 'inline-block', 
            padding: '1rem', 
            backgroundColor: 'white',
            border: '2px solid #2d3b5e',
            borderRadius: '8px'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`}
              alt="Distribution QR Code" 
              style={{ width: '180px', height: '180px' }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
            Scan this QR at the pickup point
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Today's Food Package</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 0' }}><strong>Food Item</strong></td>
                <td style={{ padding: '8px 0' }}>{donation.food_type}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 0' }}><strong>Total Quantity</strong></td>
                <td style={{ padding: '8px 0' }}>{donation.quantity} {donation.unit}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 0' }}><strong>Per Family</strong></td>
                <td style={{ padding: '8px 0' }}>{allocation.portion_per_family} {donation.unit}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}><strong>Families Served</strong></td>
                <td style={{ padding: '8px 0' }}>{allocation.total_families}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        backgroundColor: '#e3f2fd',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <p style={{ margin: 0, color: '#1565c0' }}>
          <strong>Distribution ID:</strong> {allocation.id}
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#1565c0' }}>
          <strong>Pickup Location:</strong> Barangay Hall, Purok 1-3
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#1565c0' }}>
          <strong>Pickup Time:</strong> 2:00 PM - 5:00 PM
        </p>
      </div>
    </div>
  );
}

export default QRGeneration;