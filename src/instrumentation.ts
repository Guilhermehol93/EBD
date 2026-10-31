export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initBackgroundCron } = await import("./lib/scheduler");
    initBackgroundCron();
  }
}
