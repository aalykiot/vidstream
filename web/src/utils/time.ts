function padToString(num: number) {
  return num.toString().padStart(2, '0');
}

// Convert Seconds to Minutes and Seconds.
// https://bobbyhadz.com/blog/javascript-convert-seconds-to-minutes-and-seconds
function toMinuteSeconds(num: number) {
  const totalSeconds = Math.round(num);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${padToString(minutes)}:${padToString(seconds)}`;
}

export default { toMinuteSeconds };
