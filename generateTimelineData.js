import CDP from "chrome-remote-interface";
import fs from "fs";

const runCDP = async () => {
  let client;
  try {
    client = await CDP();
    const { Page, Tracing } = client;
    // enable Page domain events
    await Page.enable();
    // trace a page load
    const events = [];
    Tracing.dataCollected(({ value }) => {
      events.push(...value);
    });
    await Tracing.start();
    await Page.navigate({ url: "https://github.com" });
    await Page.loadEventFired();
    await Tracing.end();
    await Tracing.tracingComplete();
    // save the tracing data
    fs.writeFileSync("./timeline.json", JSON.stringify(events));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
};

runCDP();
