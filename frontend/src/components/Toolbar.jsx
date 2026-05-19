import LlmSelector from './LlmSelector.jsx';

export default function Toolbar({ provider, providers, onProviderChange, onGenerate, loading }) {
  return (
    <div className="toolbar">
      <LlmSelector provider={provider} providers={providers} onChange={onProviderChange} />
      <button onClick={onGenerate} disabled={loading} type="button">
        {loading ? 'Generating…' : 'Generate'}
      </button>
    </div>
  );
}
