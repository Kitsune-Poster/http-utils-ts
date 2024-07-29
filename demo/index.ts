import { HttpUtils } from './../src/index';

class ApiWrapper extends HttpUtils {
    constructor() {
        super(
            {
                cache: { path: './cache' },
                rateLimit: { maxRequest: 10, perMiliseconds: 1000 }
            })
    }

    private domain = "https://type.fit/"

    async getQuotes() {
        let response = await this.fetch(this.domain+"api/quotes")
        return JSON.parse(response.body) as { text: string, author: string }[]
    }
}

let main = async () => {
    const api = new ApiWrapper()
    let quotes = await api.getQuotes()
    console.log(quotes)
}
main()