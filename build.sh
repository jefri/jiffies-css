npx esbuild --sourcemap --bundle v2/index.css --outfile=jiffies-css-bundle.css
npx esbuild --sourcemap --bundle --minify v2/index.css --outfile=jiffies-css-bundle.min.css

# Compatibility copies under the old -v2- name, so existing consumers (e.g.
# davidsouther/resume, still on the old unpkg URL as of this writing) keep
# working until they migrate. Built separately, not copied, so each carries
# its own correct sourceMappingURL rather than pointing at the other name.
# Drop these once known consumers have moved to jiffies-css-bundle.*.
npx esbuild --sourcemap --bundle v2/index.css --outfile=jiffies-css-v2-bundle.css
npx esbuild --sourcemap --bundle --minify v2/index.css --outfile=jiffies-css-v2-bundle.min.css
