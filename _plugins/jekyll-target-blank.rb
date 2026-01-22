require 'nokogiri'

module Jekyll
  class TargetBlank < Generator
    def generate(site)
      site.pages.each do |page|
        process(page) if page.output_ext == '.html'
      end

      site.posts.docs.each do |post|
        process(post)
      end
    end

    def process(doc)
      return unless doc.output

      html = Nokogiri::HTML(doc.output)

      html.css('a[href]').each do |link|
        href = link['href']
        next if href.start_with?('#', '/', 'mailto:')

        link.set_attribute('target', '_blank')
        link.set_attribute('rel', 'noopener noreferrer')
      end

      doc.output = html.to_html
    end
  end
end
