import { useState } from 'react';
import PromptEditor from './components/PromptEditor.jsx';
import LlmSelector from './components/LlmSelector.jsx';
import Toolbar from './components/Toolbar.jsx';
import SvgPreview from './components/SvgPreview.jsx';
import DownloadButton from './components/DownloadButton.jsx';
import { generateDiagram, exportPptx } from './api.js';

const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'mock', label: 'Mock (offline test)' }
];

export default function App() {
  const [prompt, setPrompt] = useState('Generate an editable DevSecOps workflow infographic for 2026, with modern cloud-native security automation, compliance, and developer enablement.');
  const [provider, setProvider] = useState('gemini');
  const [svg, setSvg] = useState('');
  const [ast, setAst] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await generateDiagram(prompt, provider);
      setAst(result.ast);
      setSvg(result.svg);
    } catch (err) {
      setError(err.message || 'Failed to generate diagram.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!ast) return;

    try {
      const result = await exportPptx(ast);
      const binary = atob(result.pptx);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enterprise-infographic.pptx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to export PPTX.');
    }
  };

  const handleDownloadSvg = () => {
    if (!svg) return;

    try {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enterprise-infographic.svg';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to download SVG.');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Enterprise Infographic Platform</h1>
        <p>Create deterministic infographic decks from plain-language prompts.</p>
      </header>

      <main>
        <Toolbar
          provider={provider}
          providers={providers}
          onProviderChange={setProvider}
          onGenerate={handleGenerate}
          loading={loading}
        />

        <div className="content-grid">
          <PromptEditor prompt={prompt} onChange={setPrompt} />
          <div className="preview-panel">
            {error && <div className="error-box">{error}</div>}
            {loading && <div className="loader">Generating...</div>}
            {!loading && !svg && <div className="placeholder">SVG preview will appear here.</div>}
            {!!svg && <SvgPreview svg={svg} />}
            {!!ast && (
              <div className="download-actions">
                <DownloadButton label="Download SVG" onDownload={handleDownloadSvg} />
                <DownloadButton label="Download PPTX" onDownload={handleDownload} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
