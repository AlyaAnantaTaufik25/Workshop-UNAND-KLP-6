import './UnandLogo.css';

export default function UnandLogo({ className = '' }) {
  return (
    <img
      className={`unand-logo ${className}`.trim()}
      src={`${import.meta.env.BASE_URL}logo-unand-transparent.png`}
      alt="Logo Universitas Andalas"
      width={40}
      height={48}
      decoding="async"
    />
  );
}
