export default function PromptEditor({ prompt, onChange }) {
  return (
    <div className="prompt-editor">
      <h2>Business Intent</h2>
      <textarea
        value={prompt}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Describe the infographic you want to generate..."
      />
    </div>
  );
}
