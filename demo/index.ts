import { HttpUtils } from './../src/index';

class ApiWrapper extends HttpUtils {
    constructor() {
        super(
            {
                cache: { path: './cache', durationMiliseconds: 3000, deleteOnExpire: true },
                rateLimit: { maxRequest: 10, perMiliseconds: 100, deleteOnExpire: true }
            }
        )
    }

    private domain = "https://type.fit/"

    async getQuotes() {
        let response = await this.fetch(this.domain+"api/quotes")
        return JSON.parse(response.body) as { text: string, author: string }[]
    }
}

let main = async () => {
    const api = new ApiWrapper()
    await api.getQuotes()
    setTimeout(async () => {
        await api.getQuotes()
    }, 2000)
}
main()