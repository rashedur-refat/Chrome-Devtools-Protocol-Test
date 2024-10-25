import CDP from "chrome-remote-interface";

const runCDP = async () => {
  let client;
  try {
    client = await CDP();
    const { Network, Page, Runtime } = client;
    await Network.enable();
    await Page.enable();
    await Network.setCacheDisabled({ cacheDisabled: true });
    await Page.navigate({ url: "https://github.com" });
    await Page.loadEventFired();
    const result = await Runtime.evaluate({
      expression: "document.documentElement.outerHTML",
    });
    const html = result.result.value;
    console.log(html);
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
};

runCDP();
