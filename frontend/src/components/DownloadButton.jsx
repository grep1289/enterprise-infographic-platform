export default function DownloadButton({ label = 'Download', onDownload }) {
  return (
    <button className="download-button" onClick={onDownload} type="button">
      {label}
    </button>
  );
}
