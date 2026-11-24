import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Tombol kembali standar (gaya .ui-back di design-language.css) */
export default function BackButton({ to, onClick, label = 'Kembali', style }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
    else navigate(-1);
  };
  return (
    <button type="button" className="ui-back" onClick={handleClick} style={style}>
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}
