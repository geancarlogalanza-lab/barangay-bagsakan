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

    const beneficiary = beneficiaries.find(b => b.id === id);

    if (!beneficiary) {
      console.error('Beneficiary not found');
      setGenerating(null);
      return;
    }

    let qrCode = beneficiary.qr_code;

    if (!qrCode) {
      qrCode = `BEN-${String(id).slice(0, 8).toUpperCase()}`;
    }

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
        fontSize: '1.1rem',
        color: '#6E7160'
      }}>
        Loading beneficiaries...
      </div>
    );
  }

  const withQR = beneficiaries.filter(b => b.qr_printed).length;
  const needQR = beneficiaries.filter(b => !b.qr_printed).length;

  return (
    <div style={{
      maxWidth: '1180px',
      margin: '0 auto',
      padding: '0 32px 40px'
    }}>

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
            Beneficiaries
          </h1>

          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.92rem',
            color: '#6E7160'
          }}>
            Manage registered families and their QR codes
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            background: '#24391F',
            color: '#E8B44E',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Total: {beneficiaries.length}
          </span>

          <span style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            With QR: {withQR}
          </span>

          <span style={{
            background: '#FFF3E0',
            color: '#E65100',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Need QR: {needQR}
          </span>
        </div>
      </div>

      {/* Table */}
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
              }}>
                Status
              </th>

              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>
                Family Name
              </th>

              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>
                Purok
              </th>

              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>
                Priority
              </th>

              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>
                QR Code
              </th>

              <th style={{
                padding: '14px 20px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#6E7160'
              }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#6E7160',
                    fontSize: '0.95rem'
                  }}
                >
                  No beneficiaries registered yet.
                </td>
              </tr>
            ) : (
              beneficiaries.map((beneficiary) => (
                <tr
                  key={beneficiary.id}
                  style={{
                    borderBottom: '1px solid #F0EDE0',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FAF8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >

                  {/* Status */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: beneficiary.qr_printed
                        ? '#E8F5E9'
                        : '#FFF3E0',
                      color: beneficiary.qr_printed
                        ? '#2E7D32'
                        : '#E65100',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {beneficiary.qr_printed ? 'Generated' : 'Pending'}
                    </span>
                  </td>

                  {/* Family Name */}
                  <td style={{
                    padding: '14px 20px',
                    fontWeight: 500,
                    color: '#16180F'
                  }}>
                    {beneficiary.family_name}
                  </td>

                  {/* Purok */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: '#F0EDE0',
                      color: '#3C3E30',
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {beneficiary.purok}
                    </span>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background:
                        beneficiary.priority === 'high'
                          ? '#FFEBEE'
                          : beneficiary.priority === 'medium'
                            ? '#FFF3E0'
                            : '#E8F5E9',

                      color:
                        beneficiary.priority === 'high'
                          ? '#C62828'
                          : beneficiary.priority === 'medium'
                            ? '#E65100'
                            : '#2E7D32',

                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {beneficiary.priority}
                    </span>
                  </td>

                  {/* QR Code */}
                  <td style={{ padding: '14px 20px' }}>
                    {beneficiary.qr_printed && beneficiary.qr_code ? (
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '4px',
                          background: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E7E3D4',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${beneficiary.qr_code}`}
                          alt={`QR Code for ${beneficiary.family_name}`}
                          style={{
                            width: '50px',
                            height: '50px',
                            display: 'block',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{
                        color: '#6E7160',
                        fontSize: '0.85rem'
                      }}>
                        Not generated
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 20px' }}>
                    {!beneficiary.qr_printed ? (
                      <button
                        onClick={() => generateQRCode(beneficiary.id)}
                        disabled={generating === beneficiary.id}
                        style={{
                          background: '#24391F',
                          color: '#E8B44E',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '999px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: generating === beneficiary.id
                            ? 'not-allowed'
                            : 'pointer',
                          opacity: generating === beneficiary.id ? 0.6 : 1,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!generating) {
                            e.currentTarget.style.background = '#345A2C';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#24391F';
                        }}
                      >
                        {generating === beneficiary.id
                          ? 'Generating...'
                          : 'Generate QR'}
                      </button>
                    ) : (
                      <span style={{
                        color: '#2E7D32',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        ✓ Done
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