export default function SvgPreview({ svg }) {
  return (
    <div className="svg-container" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
