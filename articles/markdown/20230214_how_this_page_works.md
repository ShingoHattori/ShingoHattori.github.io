# このページの動き方

このページは，GitHub Actionによってビルドとデプロイがなされ，GitHub Pagesによって公開されています．

近代的なフレームワークはよくわかりませんし，使う必要がなかったため，コンテンツはHTMLとMarkdownによって作成されています．

# 処理フロー

生のHTMLを手打ちすることは大変ですが，気軽に記事を書けるようにしたかったので， `articles/` 以下のHTMLは，CUにおいてMarkdownをHTMLに変換することで，作成されています．

走っているCIは以下の通りです．

```
# Simple workflow for deploying static content to GitHub Pages
name: Deploy static content to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Single deploy job since we're just deploying
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pandoc
        run: |
          sudo apt-get update
          sudo apt-get install -y pandoc
      - name: Convert Markdown to HTML and move
        run: |
          cd articles/markdown && \
          for file in *.md; do
            pandoc "$file" -o "${file%.md}.html"
          done && \
          mkdir ../html && \
          mv *.html ../html/

      - name: Insert converted HTML to index.html
        run: |
          rm -f articles.html && \
          cd articles/html
          for file in *.html; do
              article_name=$(echo "$file" | sed -e 's/^[0-9]\{8\}_//' -e 's/\.html$//')
              cat >> articles.html <<EOF
              <ul>
                <li>
                  <a href=./articles/html/$file>$article_name</a>
                </li>
              </ul>
          EOF
          done && \
          cd ../../ && \
          mv articles/html/articles.html ./ && \
          sed '/#PLACEHOLDER_REPLACED_BY_CI/{
          r articles.html
          d
          }' index.html > temp_index.html && \
          mv temp_index.html index.html


      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload entire repository
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```