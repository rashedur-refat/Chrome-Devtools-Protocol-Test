import CDP from "chrome-remote-interface";
import minimist from "minimist";
import { promises as fs } from "fs";
import delay from "delay";

// CLI Args
const argv = minimist(process.argv.slice(2));
const url = argv.url || "https://www.google.com";
const format = argv.format === "jpeg" ? "jpeg" : "png";
const viewportWidth = argv.viewportWidth || 1440;
let viewportHeight = argv.viewportHeight || 900;
const delayTime = argv.delay || 0;
const userAgent = argv.userAgent;
const fullPage = argv.full || true;
const outputDir = argv.outputDir || "./";
const output = argv.output || `output.${format === "png" ? "png" : "jpg"}`;

init();

async function init() {
  let client;
  try {
    // Start the Chrome Debugging Protocol
    client = await CDP();

    // Verify version
    // const { Browser } = await CDP.Version();
    // const browserVersion = Browser.match(/\/(\d+)/)[1];
    // if (Number(browserVersion) !== 60) {
    //   console.warn(
    //     `This script requires Chrome 60, however you are using version ${browserVersion}. The script is not guaranteed to work and you may need to modify it.`
    //   );
    // }

    // Extract used DevTools domains.
    const { DOM, Emulation, Network, Page } = client;

    // Enable events on domains we are interested in.
    await Page.enable();
    await DOM.enable();
    await Network.enable();

    // If user agent override was specified, pass to Network domain
    if (userAgent) {
      await Network.setUserAgentOverride({ userAgent });
    }

    // Set up viewport resolution, etc.
    const deviceMetrics = {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false,
    };
    await Emulation.setDeviceMetricsOverride(deviceMetrics);
    await Emulation.setVisibleSize({
      width: viewportWidth,
      height: viewportHeight,
    });

    // Navigate to target page
    await Page.navigate({ url });

    // Wait for page load event to take screenshot
    await Page.loadEventFired();

    await delay(delayTime);

    // If the `full` CLI option was passed, we need to measure the height of
    // the rendered page and use Emulation.setVisibleSize
    if (fullPage) {
      const {
        root: { nodeId: documentNodeId },
      } = await DOM.getDocument();
      const { nodeId: bodyNodeId } = await DOM.querySelector({
        selector: "body",
        nodeId: documentNodeId,
      });
      const { model } = await DOM.getBoxModel({ nodeId: bodyNodeId });
      viewportHeight = model.height;

      await Emulation.setVisibleSize({
        width: viewportWidth,
        height: viewportHeight,
      });
      // This forceViewport call ensures that content outside the viewport is
      // rendered, otherwise it shows up as grey. Possibly a bug?
      // await Emulation.forceViewport({ x: 0, y: 0, scale: 1 });
    }

    const screenshot = await Page.captureScreenshot({
      format,
      fromSurface: true,
      clip: {
        width: viewportWidth,
        height: viewportHeight,
        scale: 1,
        x: 0,
        y: 0,
      },
    });

    const buffer = Buffer.from(screenshot.data, "base64");
    const path = `${outputDir + output}`;
    await fs.writeFile(path, buffer, "base64");
    console.log("Screenshot saved");
    client.close();
  } catch (err) {
    if (client) {
      client.close();
    }
    console.error("Exception while taking screenshot:", err);
    process.exit(1);
  }
}
