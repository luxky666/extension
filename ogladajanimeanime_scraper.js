const ogladajanimeSources = [{
    name: "OgladajAnime Scraper",
    lang: "pl",
    baseUrl: "https://ogladajanime.pl/",
    apiUrl: "",
    iconUrl: "https://ogladajanime.pl/favicon.ico",
    typeSource: "multi",
    itemType: 1,
    version: "0.0.1",
    pkgPath: "ogladajanime_scraper.js"
}];

class DefaultExtension extends MProvider {
    constructor() {
        super();
        this.client = new Client();
    }

    async requestBody(url) {
        const resp = await this.client(url);
        return new Document(resp.body);
    }

    async requestHtml(url) {
        const resp = await this.client.get(url);
        return new Document(resp.body);
    }

    async search(query, page = 1, filters) {
        const searchUrl = `https://ogladajanime.pl/?s=${encodeURIComponent(query)}&page=${page}`;
        const doc = await this.requestHtml(searchUrl);

        const results = Array.from(doc.querySelectorAll('.anime-item')).map(item => {
            const name = item.querySelector('.anime-title')?.textContent.trim();
            const link = item.querySelector('a')?.href;
            const imageUrl = item.querySelector('img')?.src;
            return {
                name,
                link: JSON.stringify({ url: link }),
                imageUrl,
                description: null,
                author: null
            };
        });

        return {
            list: results,
            hasNextPage: doc.querySelector('.next.page-numbers') !== null
        };
    }

    async getDetail(url) {
        const { url: link } = JSON.parse(url);
        const doc = await this.requestHtml(link);

        const name = doc.querySelector('.anime-title')?.textContent.trim();
        const chapters = Array.from(doc.querySelectorAll('.episode-list a')).map(ep => ({
            name: ep.textContent.trim(),
            url: JSON.stringify({ url: ep.href })
        }));

        return {
            name,
            chapters: chapters.reverse()
        };
    }

    async getVideoList(url) {
        const { url: link } = JSON.parse(url);
        const doc = await this.requestHtml(link);

        // sprawdzamy iframe lub video
        const iframes = Array.from(doc.querySelectorAll('iframe'));
        const videos = iframes.map(frame => ({
            url: frame.src,
            quality: 'default',
            originalUrl: frame.src,
            subtitles: [],
            headers: {
                Referer: "https://ogladajanime.pl/",
                Origin: "https://ogladajanime.pl"
            }
        }));

        return videos;
    }

    async getPageList(url) {
        throw new Error("getPageList not implemented");
    }
    getFilterList() {
        throw new Error("getFilterList not implemented");
    }
    getSourcePreferences() {
        throw new Error("getSourcePreferences not implemented");
    }
}
