import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    include: ["test/vr/**/*.test.mjs"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        {
          browser: "chromium",
          name: "vr",
          launch: { args: ["--force-device-scale-factor=1"] },
          context: { reducedMotion: "reduce", colorScheme: "light" },
        },
      ],
    },
  },
});
