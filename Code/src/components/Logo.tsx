/** Marca real do Kamino (asset do handoff): peaks brancos sobre quadrado ink. */
export function KaminoLogo({ size = 34, radius = 6 }: { size?: number; radius?: number }) {
  return (
    <img
      src="/kamino-icon.png"
      alt="Kamino"
      width={size}
      height={size}
      style={{ objectFit: "contain", borderRadius: radius, display: "block" }}
    />
  );
}
