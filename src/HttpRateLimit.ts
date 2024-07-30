import { HttpConfig } from "./types/HttpConfig";
import * as fs from 'fs'

type RateLimit = {
    [key: string]: number
}

export class HttpRateLimitError extends Error{
    constructor(){
        super("Rate limit reached")
    }
}

export abstract class HttpRateLimit{
    constructor(
        protected config: HttpConfig,
    ){}

    private createCacheFile(){
        if(!fs.existsSync(this.config.cache.path)) fs.mkdirSync(this.config.cache.path, { recursive: true })

        let cacheFile = this.config.cache.path + "/rate-limit.json"
        if(!fs.existsSync(cacheFile)){
            fs.writeFileSync(cacheFile, JSON.stringify({ }))
        }

        return cacheFile
    }

    private getCache(){
        let cacheFile = this.createCacheFile()
        return JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as RateLimit
    }

    private setCache(cache: any){
        let cacheFile = this.createCacheFile()
        fs.writeFileSync(cacheFile, JSON.stringify(cache))
    }

    private isRateLimitReached(){
        let cache = this.getCache()
        let now = Date.now()
        let count = 0
        for(let key in cache){
            if(parseInt(key) + this.config.rateLimit.perMiliseconds > now){
                count += cache[key]
            }
        }

        return count+1 > this.config.rateLimit.maxRequest
    }

    private clearRateLimit(){
        let cache = this.getCache()
        let now = Date.now()
        for(let key in cache){
            if(parseInt(key) + this.config.rateLimit.perMiliseconds < now){
                delete cache[key]
            }
        }
        this.setCache(cache)
    }
    
    protected registerRequest(){
        if(this.config.rateLimit.deleteOnExpire) this.clearRateLimit()
        let cache = this.getCache()
        let now = Date.now()
        cache[now] = (cache[now] || 0) + 1
        this.setCache(cache)
    }

    protected verifyRateLimit(): void {
        if(this.config.rateLimit.deleteOnExpire) this.clearRateLimit()
        if(this.isRateLimitReached()){
            throw new HttpRateLimitError()
        }
    }
}