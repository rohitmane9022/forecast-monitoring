export function filterForecastsByHorizon(
    forecasts: { startTime: string; publishTime: string; generation: number }[],
    horizonHours: number
  ) {
    // Group all forecasts by their target startTime
    const grouped: Record<string, typeof forecasts> = {};
  
    for (const f of forecasts) {
      if (!grouped[f.startTime]) grouped[f.startTime] = [];
      grouped[f.startTime].push(f);
    }
  
    const result: { startTime: string; generation: number }[] = [];
  
    for (const [startTime, entries] of Object.entries(grouped)) {
      const targetTime = new Date(startTime).getTime();
      const cutoff = targetTime - horizonHours * 60 * 60 * 1000;
  
      const valid = entries.filter(
        (e) => new Date(e.publishTime).getTime() <= cutoff
      );
  
      
      if (valid.length === 0) continue;
  
      
      const latest = valid.sort(
        (a, b) =>
          new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      )[0];
  
      result.push({
        startTime,
        generation: latest.generation,
      });
    }
  
    
    return result.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }