# HTTP Utils TS
This is a simple library which provides a set of utilities to work with HTTP requests and responses in TypeScript. Especially, for caching and applying a rate limit to requests.

## Run demo
Run the following command to install the dependencies
```bash
npm i
```

Run the demo
```bash
npm run demo
```

## Installation
```bash
npm install @nathangasc/http-utils-ts
```

The following is an example to demonstrates how to use the library to fetch quotes from the [Type Fit API](https://type.fit/api/quotes) and cache the responses in the `./cache` directory. The rate limit is set to 10 requests per second.
```ts
import { HttpUtils } from '@nathangasc/http-utils-ts'

class ApiWrapper extends HttpUtils {
    constructor() {
        super(
            {
                cache: { path: './cache', durationMiliseconds: 3000, deleteOnExpire: true },
                rateLimit: { maxRequest: 10, perMiliseconds: 100, deleteOnExpire: true, waitTillLimitReset: true }
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
```

## Usage
The library provides a class `HttpUtils` which can be extended to create a custom API wrapper.

### Cache
Requests are cached by default. The cache is stored in the given directory by the `HttpUtils` constructor.

#### Disable cache
Sometimes, you may want to disable the cache for some requests. You can do this by setting the `noCache` option to `false` in the `fetch` method. The cache is created based on the request URL. So if you request multiple time the same URL, the response will be cached and returned from the cache.
```ts
let response = await this.fetch("https://type.fit/api/quotes", undefined, true)
```

### Rate Limit
The rate limit define how many requests can be made in a given time frame. The rate limit is set by the `rateLimit` option in the `HttpUtils` constructor.

#### Catch rate limit error
When the rate limit is reached, the library will throw a `RateLimitError` error. You can catch this error and wait for the rate limit to reset.
```ts
let response = await this.fetch("https://type.fit/api/quotes").catch((error) => {
    if (error instanceof RateLimitError) {
        console.error("Rate limit reached!")
    }
})
```