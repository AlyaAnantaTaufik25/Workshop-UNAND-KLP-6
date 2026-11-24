/**
 * Kepala halaman standar untuk semua portal: judul, deskripsi singkat, dan aksi di kanan.
 * Gaya ada di design-language.css (.ui-page-head).
 */
export default function PageHeader({ title, description, actions }) {
  return (
    <div className="ui-page-head">
      <div className="ui-page-head-text">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </div>
  );
}
