import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, label = 'Kembali' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 14px',
        marginBottom: '16px',
        background: 'white',
        border: '1px solid var(--gray-300)',
        borderRadius: '8px',
        color: 'var(--gray-800)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--green-600)';
        e.currentTarget.style.color = 'var(--green-700)';
        e.currentTarget.style.background = 'var(--gray-50)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--gray-300)';
        e.currentTarget.style.color = 'var(--gray-800)';
        e.currentTarget.style.background = 'white';
      }}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}

