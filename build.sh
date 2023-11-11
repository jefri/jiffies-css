# npx @parcel/css-cli --sourcemap --bundle --nesting index.css -o jiffies-css-bundle.css
# npx @parcel/css-cli --sourcemap --bundle --nesting --minify index.css -o jiffies-css-bundle.min.css
npx esbuild --sourcemap --bundle index.css --outfile=jiffies-css-bundle.css
npx esbuild --sourcemap --bundle --minify index.css --outfile=jiffies-css-bundle.min.css
npx esbuild --sourcemap --bundle v2/index.css --outfile=jiffies-css-v2-bundle.css
npx esbuild --sourcemap --bundle --minify v2/index.css --outfile=jiffies-css-v2-bundle.min.css