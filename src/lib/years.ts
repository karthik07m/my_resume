const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "Jan 2023" -> months since year 0; "Present" -> now. Hand-parsed because Safari can't Date.parse("Jan 2023").
export const toMonths = (s: string) => {
    if (s === 'Present') { const d = new Date(); return d.getFullYear() * 12 + d.getMonth() }
    const [mon, year] = s.split(' ')
    return Number(year) * 12 + MONTHS.indexOf(mon)
}
