export function limiteHasta(valor: string): Date {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new Error("fecha inválida");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    fecha.setUTCHours(23, 59, 59, 999);
  }
  return fecha;
}
