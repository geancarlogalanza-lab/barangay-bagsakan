import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

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
    setGenerating(id);
    
    // Find the beneficiary
    const beneficiary = beneficiaries.find(b => b.id === id);
    if (!beneficiary) {
      console.error('Beneficiary not found');
      setGenerating(null);
      return;
    }

    // If QR code doesn't exist, generate one
    let qrCode = beneficiary.qr_code;
    if (!qrCode) {
      // Generate a unique QR code (using the ID as base)
      qrCode = `BEN-${String(id).slice(0, 8).toUpperCase()}`;
    }

    // Update the database with QR code and printed status
    const { error } = await supabase
      .from('beneficiaries')
      .update({ 
        qr_code: qrCode,
        qr_printed: true 
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating QR status:', error);
    } else {
      // Refresh the list
      await fetchBeneficiaries();
    }
    setGenerating(null);
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading beneficiaries...
      </div>
    );
  }

  const withQR = beneficiaries.filter(b => b.qr_printed).length;
  const needQR = beneficiaries.filter(b => !b.qr_printed).length;

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
          Beneficiary Management
        </h2>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span className="stat-badge" style={{ background: '#2d3b5e', color: 'white' }}>
            Total: {beneficiaries.length}
          </span>
          <span className="stat-badge" style={{ background: '#4caf50', color: 'white' }}>
            With QR: {withQR}
          </span>
          <span className="stat-badge" style={{ background: '#ff9800', color: 'white' }}>
            Need QR: {needQR}
          </span>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Family Name</th>
              <th>Purok</th>
              <th>Priority</th>
              <th>QR Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#999' }}>
                  No beneficiaries registered yet.
                </td>
              </tr>
            ) : (
              beneficiaries.map((beneficiary) => (
                <tr key={beneficiary.id}>
                  <td>
                    {beneficiary.qr_printed ? '✅' : '⏳'}
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>
                      {beneficiary.family_name}
                    </span>
                  </td>
                  <td>
                    <span className="purok-badge">
                      {beneficiary.purok}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${beneficiary.priority}`}>
                      {beneficiary.priority}
                    </span>
                  </td>
                  <td>
                    {beneficiary.qr_printed && beneficiary.qr_code ? (
                      <div className="qr-container">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${beneficiary.qr_code}`}
                          alt={`QR Code for ${beneficiary.family_name}`}
                          style={{ width: '60px', height: '60px' }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.85rem' }}>
                        Not generated
                      </span>
                    )}
                  </td>
                  <td>
                    {!beneficiary.qr_printed ? (
                      <button
                        onClick={() => generateQRCode(beneficiary.id)}
                        disabled={generating === beneficiary.id}
                        className="btn-primary"
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.8rem',
                          opacity: generating === beneficiary.id ? 0.7 : 1,
                          cursor: generating === beneficiary.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {generating === beneficiary.id ? 'Generating...' : 'Generate QR'}
                      </button>
                    ) : (
                      <span className="done-badge">
                        Done
                      </span>
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