export default function LlmSelector({ provider, providers, onChange }) {
  return (
    <label className="llm-selector">
      Provider
      <select value={provider} onChange={(event) => onChange(event.target.value)}>
        {providers.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
