import CDP from "chrome-remote-interface";

const runCDP = async () => {
  let client;
  try {
    // Connect to the Chrome instance
    client = await CDP();

    const { Network, Page, DOM, Runtime, Log } = client;

    // Enable events
    await Page.enable();
    await Network.enable();
    await DOM.enable();
    await Log.enable();

    console.log("Tracking user interactions and DOM mutations...");

    // Log DOM mutations (e.g., elements added, removed, changed)
    await DOM.setChildNodeInsertedListener(({ parentNodeId, node }) => {
      console.log("Node inserted:", node.nodeName);
    });

    await DOM.setChildNodeRemovedListener(({ parentNodeId, nodeId }) => {
      console.log("Node removed:", nodeId);
    });

    // Log user interactions (clicks, input changes, etc.)
    Runtime.consoleAPICalled(({ type, args }) => {
      console.log(
        `User interaction [${type}]:`,
        args.map((arg) => arg.value).join(", ")
      );
    });

    // Capture all network requests and responses
    Network.requestWillBeSent((params) => {
      console.log(`Request URL: ${params.request.url}`);
    });

    Network.responseReceived((params) => {
      console.log(
        `Response received for: ${params.response.url}, Status: ${params.response.status}`
      );
    });

    // Log JavaScript console messages (warnings, errors, logs)
    Log.entryAdded((entry) => {
      console.log(`[Log] ${entry.level}: ${entry.text}`);
    });

    // Capture Page load events
    Page.loadEventFired(() => {
      console.log("Page loaded");
    });

    // Navigate to a test page
    await Page.navigate({ url: "https://google.com" });
    await Page.loadEventFired(); // Wait until the page is fully loaded

    console.log("Page loaded, start interacting...");

    // Wait for 30 seconds to collect interactions
    await new Promise((resolve) => setTimeout(resolve, 30000));
  } catch (err) {
    console.error(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
};

runCDP();
