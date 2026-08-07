import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Matching() {
  const [inventory, setInventory] = useState([]);
  const [familiesCount, setFamiliesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    // Fetch ONLY available donations (status = 'available')
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

    setAllocating(true);
    setMessage('');

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const donation of inventory) {
        // Only allocate if still available
        if (donation.status !== 'available') {
          console.log(`Skipping ${donation.food_type} - already claimed`);
          continue;
        }

        const portion = donation.quantity / familiesCount;
        
        // Create allocation record
        const { error: insertError } = await supabase
          .from('allocations')
          .insert({
            donation_id: donation.id,
            total_families: familiesCount,
            portion_per_family: portion,
            status: 'confirmed'
          });

        if (insertError) {
          console.error('Error creating allocation:', insertError);
          errorCount++;
          continue;
        }

        // Update donation status to 'claimed'
        const { error: updateError } = await supabase
          .from('donations')
          .update({ status: 'claimed' })
          .eq('id', donation.id);

        if (updateError) {
          console.error('Error updating donation:', updateError);
          errorCount++;
          continue;
        }

        successCount++;
      }

      if (successCount > 0) {
        setMessage(`Successfully allocated ${successCount} donation(s) to ${familiesCount} families.`);
      } else if (errorCount > 0) {
        setMessage(`Failed to allocate ${errorCount} donation(s). Please check console for errors.`);
      } else {
        setMessage('No donations were allocated.');
      }
      
      // Refresh the data
      await fetchData();
    } catch (error) {
      console.error('Error in allocation:', error);
      setMessage('An error occurred during allocation: ' + error.message);
    }

    setAllocating(false);
  }

  if (loading && inventory.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading inventory...
      </div>
    );
  }

  const totalFood = inventory.reduce((sum, i) => sum + i.quantity, 0);

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
          Matching & Allocation
        </h2>
        <span style={{ 
          fontSize: '0.85rem', 
          color: '#888',
          background: '#f5f5f5',
          padding: '4px 16px',
          borderRadius: '20px'
        }}>
          {inventory.length} item(s) available
        </span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon"></div>
          <h3 className="number">{totalFood} kg</h3>
          <p className="label">Available Food</p>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"></div>
          <h3 className="number">{familiesCount}</h3>
          <p className="label">Registered Families</p>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"></div>
          <h3 className="number">
            {familiesCount > 0 && totalFood > 0 
              ? (totalFood / familiesCount).toFixed(2) 
              : 0} kg
          </h3>
          <p className="label">Per Family</p>
        </div>
      </div>

      {/* Inventory List */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a2e' }}>
          Available Inventory
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#888' }}>
          {inventory.length} items
        </span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Expires In</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2.5rem', textAlign: 'center', color: '#999' }}>
                  No available donations.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontWeight: '500' }}>{item.food_type}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      color: item.expiry_hours <= 4 ? '#c62828' : 
                             item.expiry_hours <= 12 ? '#e65100' : '#2e7d32',
                      fontWeight: item.expiry_hours <= 4 ? '600' : '400'
                    }}>
                      {item.expiry_hours} hours
                      {item.expiry_hours <= 4}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Allocation Section */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#1a1a2e' }}>
            Ready to Allocate?
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            {inventory.length > 0 && familiesCount > 0 ? (
              `${familiesCount} families will receive ${(totalFood / familiesCount).toFixed(2)} kg each`
            ) : (
              'Add donations and register families first'
            )}
          </div>
        </div>
        <button
          onClick={confirmAllocation}
          disabled={allocating || inventory.length === 0 || familiesCount === 0}
          className="btn-primary"
          style={{
            fontSize: '1rem',
            padding: '12px 32px',
            opacity: (allocating || inventory.length === 0 || familiesCount === 0) ? 0.6 : 1,
            cursor: (allocating || inventory.length === 0 || familiesCount === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {allocating ? 'Processing...' : 'Confirm Allocation'}
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          backgroundColor: message.startsWith('Success') ? '#e8f5e9' : '#ffebee',
          color: message.startsWith('Success') ? '#2e7d32' : '#c62828',
          border: `1px solid ${message.startsWith('Success') ? '#c8e6c9' : '#ffcdd2'}`,
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Matching;