import hash from 'hash-it';
import * as fs from 'fs';
import { HttpConfig } from './types/HttpConfig';
import { CacheResponse } from './types/CacheResponse';

/**
 * An abstract class that provides the base for all class which needs to cache HTTP responses.
 */
export abstract class HttpCache {
    constructor(
        protected config: HttpConfig
    ){
        function removeSlash(path: string){
            return path.replace(/\/$/, "")
        }

        this.config.cache.path = removeSlash(this.config.cache.path)
    }

    protected cacheResponse(url: string, response: CacheResponse){
        let cachePath = this.config.cache.path + "/" + hash(url)
        if(!fs.existsSync(this.config.cache.path)) fs.mkdirSync(this.config.cache.path, { recursive: true })
        fs.writeFileSync(cachePath, JSON.stringify(response))
    }

    protected getCachedResponse(url: string){
        let cachePath = this.config.cache.path + "/" + hash(url)
        if(fs.existsSync(cachePath)){
            return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CacheResponse
        }
        return null
    }
}