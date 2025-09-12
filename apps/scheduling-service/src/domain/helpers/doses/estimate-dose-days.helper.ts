export function estimateDaysFromLieudungAndSoluong(lieudung: string, soluong: string): number | null {
    if (!lieudung || !soluong) return null;
    const timesPerDayMatch = lieudung.match(/ngày\s+(\d+)\s+lần/i);
    const timesPerDay = timesPerDayMatch ? parseInt(timesPerDayMatch[1], 10) : 1;

    const unitsPerTimeMatch = lieudung.match(/lần\s+([\d.,]+)\s*viên/i);
    const unitsPerTime = unitsPerTimeMatch ? parseFloat(unitsPerTimeMatch[1].replace(',', '.')) : 1;

    const totalUnits = parseFloat(soluong.replace(',', '.'));
    if (!timesPerDay || !unitsPerTime || !totalUnits) return null;

    const estimatedDays = totalUnits / (timesPerDay * unitsPerTime);
    return estimatedDays > 0 ? Math.round(estimatedDays) : null;
}
