import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  async function fetchBeneficiaries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiaries:', error);
    } else {
      setBeneficiaries(data || []);
    }
    setLoading(false);
  }

  async function generateQRCode(id) {
    const { error } = await supabase
      .from('beneficiaries')
      .update({ qr_printed: true })
      .eq('id', id);

    if (error) {
      console.error('Error updating QR status:', error);
    } else {
      fetchBeneficiaries();
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Beneficiary Management</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Total: {beneficiaries.length} families | 
        With QR: {beneficiaries.filter(b => b.qr_printed).length} | 
        Need QR: {beneficiaries.filter(b => !b.qr_printed).length}
      </p>

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
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Family Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Purok</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Priority</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>QR Code</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>
                  No beneficiaries registered.
                </td>
              </tr>
            ) : (
              beneficiaries.map((beneficiary) => (
                <tr key={beneficiary.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    {beneficiary.qr_printed ? '✅' : '❌'}
                  </td>
                  <td style={{ padding: '12px' }}>{beneficiary.family_name}</td>
                  <td style={{ padding: '12px' }}>Purok {beneficiary.purok}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: beneficiary.priority === 'high' ? '#f44336' :
                                     beneficiary.priority === 'medium' ? '#ff9800' : '#4caf50',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {beneficiary.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {beneficiary.qr_printed ? (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${beneficiary.qr_code}`}
                        alt="QR Code" 
                        style={{ width: '50px', height: '50px' }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>Not generated</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {!beneficiary.qr_printed ? (
                      <button
                        onClick={() => generateQRCode(beneficiary.id)}
                        style={{
                          backgroundColor: '#2d3b5e',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Generate QR
                      </button>
                    ) : (
                      <span style={{ color: '#4caf50' }}>✓ Done</span>
                    )}
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

export default Beneficiaries;