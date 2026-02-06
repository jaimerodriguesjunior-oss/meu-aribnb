'use server';

interface Holiday {
    date: string;
    name: string;
    type: string;
}

// Cache holidays in memory per year
const holidaysCache: Record<number, Holiday[]> = {};

export async function getHolidays(year: number): Promise<Holiday[]> {
    // Return cached if available
    if (holidaysCache[year]) {
        return holidaysCache[year];
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!response.ok) {
            console.error('Failed to fetch holidays:', response.statusText);
            return getFallbackHolidays(year);
        }

        const data = await response.json();

        // BrasilAPI returns array like: [{ date: "2026-01-01", name: "Confraternização Universal", type: "national" }]
        const holidays: Holiday[] = data.map((h: any) => ({
            date: h.date,
            name: h.name,
            type: h.type || 'national'
        }));

        holidaysCache[year] = holidays;
        return holidays;
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return getFallbackHolidays(year);
    }
}

// Fallback static holidays if API fails
function getFallbackHolidays(year: number): Holiday[] {
    return [
        { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'national' },
        { date: `${year}-04-21`, name: 'Tiradentes', type: 'national' },
        { date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'national' },
        { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national' },
        { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'national' },
        { date: `${year}-11-02`, name: 'Finados', type: 'national' },
        { date: `${year}-11-15`, name: 'Proclamação da República', type: 'national' },
        { date: `${year}-12-25`, name: 'Natal', type: 'national' },
    ];
}
