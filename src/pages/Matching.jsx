import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Matching() {
  const [inventory, setInventory] = useState([]);
  const [familiesCount, setFamiliesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    // Fetch available donations
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'available')
      .order('expiry_hours', { ascending: true });

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
    } else {
      setInventory(inventoryData || []);
    }

    // Fetch beneficiaries count
    const { count, error: countError } = await supabase
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching count:', countError);
    } else {
      setFamiliesCount(count || 0);
    }

    setLoading(false);
  }

  async function confirmAllocation() {
    if (inventory.length === 0) {
      setMessage('No available donations to allocate.');
      return;
    }

    if (familiesCount === 0) {
      setMessage('No registered families to allocate food to.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Process each donation
      let successCount = 0;
      for (const donation of inventory) {
        const portion = donation.quantity / familiesCount;
        
        const { error } = await supabase
          .from('allocations')
          .insert({
            donation_id: donation.id,
            total_families: familiesCount,
            portion_per_family: portion,
            status: 'confirmed'
          });

        if (error) {
          console.error('Error creating allocation:', error);
          continue; // Skip this donation and try the next
        }

        // Update donation status to 'claimed'
        await supabase
          .from('donations')
          .update({ status: 'claimed' })
          .eq('id', donation.id);

        successCount++;
      }

      if (successCount > 0) {
        setMessage(`✅ Successfully allocated ${successCount} donation(s) to ${familiesCount} families!`);
      } else {
        setMessage('❌ Failed to allocate. Please check console for errors.');
      }
      
      await fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error in allocation:', error);
      setMessage('An error occurred during allocation: ' + error.message);
    }

    setLoading(false);
  }

  if (loading && inventory.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Matching & Allocation</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>
            {inventory.reduce((sum, i) => sum + i.quantity, 0)} kg
          </h3>
          <p style={{ margin: 0, color: '#555' }}>Available Food</p>
        </div>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{familiesCount}</h3>
          <p style={{ margin: 0, color: '#555' }}>Registered Families</p>
        </div>
      </div>

      {/* Inventory List */}
      <h3 style={{ marginBottom: '0.5rem' }}>Available Inventory</h3>
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
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
              <th style={{ padding: '12px', textAlign: 'left' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Expires In</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center' }}>
                  No available donations.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{item.food_type}</td>
                  <td style={{ padding: '12px' }}>{item.quantity} {item.unit}</td>
                  <td style={{ padding: '12px' }}>{item.expiry_hours} hours</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Allocation Button */}
      <button
        onClick={confirmAllocation}
        disabled={loading || inventory.length === 0 || familiesCount === 0}
        style={{
          backgroundColor: '#2d3b5e',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: (loading || inventory.length === 0 || familiesCount === 0) ? 'not-allowed' : 'pointer',
          opacity: (loading || inventory.length === 0 || familiesCount === 0) ? 0.6 : 1
        }}
      >
        {loading ? 'Processing...' : 'CONFIRM ALLOCATION'}
      </button>

      {message && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: message.startsWith('✅') ? '#e8f5e9' : '#ffebee',
          borderRadius: '8px',
          color: message.startsWith('✅') ? '#2e7d32' : '#c62828'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Matching;