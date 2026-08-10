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
    
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'available')
      .order('expiry_hours', { ascending: true });

    if (!inventoryError) {
      setInventory(inventoryData || []);
    }

    const { count, error: countError } = await supabase
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
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
        if (donation.status !== 'available') {
          continue;
        }

        const portion = donation.quantity / familiesCount;
        
        const { error: insertError } = await supabase
          .from('allocations')
          .insert({
            donation_id: donation.id,
            total_families: familiesCount,
            portion_per_family: portion,
            status: 'confirmed'
          });

        if (insertError) {
          errorCount++;
          continue;
        }

        const { error: updateError } = await supabase
          .from('donations')
          .update({ status: 'claimed' })
          .eq('id', donation.id);

        if (updateError) {
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
        fontSize: '1.1rem',
        color: '#6E7160'
      }}>
        Loading inventory...
      </div>
    );
  }

  const totalFood = inventory.reduce((sum, i) => sum + i.quantity, 0);

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
            Matching & Allocation
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.92rem',
            color: '#6E7160'
          }}>
            Match available food to registered families
          </p>
        </div>
        <span style={{
          background: '#FAF7EE',
          color: '#3C3E30',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          border: '1px solid #E7E3D4'
        }}>
          {inventory.length} item(s) available
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#24391F' }}>
            {totalFood} kg
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>Available Food</div>
        </div>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C1592F' }}>
            {familiesCount}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>Registered Families</div>
        </div>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E7E3D4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,20,10,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6E7160' }}>
            {familiesCount > 0 && totalFood > 0 
              ? (totalFood / familiesCount).toFixed(2) 
              : 0} kg
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6E7160' }}>Per Family</div>
        </div>
      </div>

      {/* Inventory List */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#16180F' }}>
          Available Inventory
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#6E7160' }}>
          {inventory.length} items
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
              }}>Food Item</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Quantity</th>
              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>Expires In</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="3" style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6E7160',
                  fontSize: '0.95rem'
                }}>
                  No available donations.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} style={{
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
                    {item.food_type}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#16180F' }}>
                    {item.quantity} {item.unit}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      color: item.expiry_hours <= 4 ? '#C62828' : 
                             item.expiry_hours <= 12 ? '#E65100' : '#2E7D32',
                      fontWeight: item.expiry_hours <= 4 ? 600 : 400
                    }}>
                      {item.expiry_hours} hours
                      {item.expiry_hours <= 4 && ' ⚠️'}
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
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E7E3D4',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#16180F' }}>
            Ready to Allocate?
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6E7160' }}>
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
          style={{
            background: '#24391F',
            color: '#E8B44E',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: (allocating || inventory.length === 0 || familiesCount === 0) ? 'not-allowed' : 'pointer',
            opacity: (allocating || inventory.length === 0 || familiesCount === 0) ? 0.6 : 1,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (!allocating && inventory.length > 0 && familiesCount > 0) {
              e.currentTarget.style.background = '#345A2C';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#24391F';
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
          background: message.startsWith('Success') ? '#E8F5E9' : '#FFEBEE',
          color: message.startsWith('Success') ? '#2E7D32' : '#C62828',
          border: `1px solid ${message.startsWith('Success') ? '#C8E6C9' : '#FFCDD2'}`,
          fontSize: '0.95rem'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Matching;