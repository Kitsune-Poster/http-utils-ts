import { Mixin } from "ts-mixer";
import { HttpCache } from "./HttpCache";
import { HttpRateLimit } from "./HttpRateLimit";
import { HttpConfig } from "./types/HttpConfig";
import { CacheResponse } from "./types/CacheResponse";

export class HttpUtils extends Mixin(HttpCache, HttpRateLimit) {
    constructor(
        config: HttpConfig
    ) {
        super(config)
    }

    protected async fetch(url: string | URL | globalThis.Request, init?: RequestInit, noCache: boolean = false): Promise<CacheResponse>{
        let stringUrl = ''
        switch(typeof url){
            case 'string':
                stringUrl = url
                break
            case 'object':
                if(url instanceof URL){
                    stringUrl = url.toString()
                }else if(url instanceof globalThis.Request){
                    stringUrl = url.url
                }
                break
        }

        const oldResponse = this.getCachedResponse(stringUrl)
        if(oldResponse && !noCache){
            return oldResponse
        }
        
        this.verifyRateLimit()

        this.registerRequest()
        
        const response = await fetch(url, init)
        const cacheResponse: CacheResponse = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: await response.text()
        }

        if(!noCache){
            this.cacheResponse(stringUrl, cacheResponse)
        }

        return cacheResponse
    }
}