export function VolumeCheckboxes({ total }: { total: number }) {
  return (
    <div className="vol-grid">
      {Array.from({ length: total }, (_, i) => (
        <label key={i + 1} className="vol-item">
          <input type="checkbox" />
          <span>{i + 1}</span>
        </label>
      ))}
    </div>
  );
}
