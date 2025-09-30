import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  // This is a setup file that can be used to authenticate before running tests
  // For now, we'll skip actual authentication since it requires OAuth/Email
  // In a real scenario, you'd authenticate here and save the session
  
  await page.goto("/");
  
  // Save signed-in state to file
  // const authFile = "e2e/.auth/user.json";
  // await page.context().storageState({ path: authFile });
});
