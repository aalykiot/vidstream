// Promise based set-timeout.
async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export { wait };
