export const time_left = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    const diff = endDate.getTime() - startDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
  
    return `${years}Y ${months}M ${remainingDays}D`;
  };