function padToString(num) {
  return num.toString().padStart(2, '0');
}

// Convert Seconds to Minutes and Seconds.
// https://bobbyhadz.com/blog/javascript-convert-seconds-to-minutes-and-seconds
export function toMinuteSeconds(num) {
  const totalSeconds = Math.round(Number.parseFloat(num));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${padToString(minutes)}:${padToString(seconds)}`;
}
