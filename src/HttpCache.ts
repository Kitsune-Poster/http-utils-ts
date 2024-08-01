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

    /**
     * Search if a cache folder exist a folder with a valid
     * timestamp duration.
     */
    protected getCacheFolder(){
        if(!fs.existsSync(this.config.cache.path)) fs.mkdirSync(this.config.cache.path, { recursive: true })

        let timestamp = this.config.cache.durationMiliseconds
        let cacheFolderList = fs.readdirSync(this.config.cache.path)
        let cacheFolder = cacheFolderList.find(folder => {
            let folderPath = this.config.cache.path + "/" + folder
            let stats = fs.statSync(folderPath)
            return stats.isDirectory() && stats.mtimeMs + timestamp > Date.now()
        })

        if(!cacheFolder){
            let now = new Date()
            let foldername = now.toISOString().replace(/:/g, "-")
            fs.mkdirSync(this.config.cache.path + "/" + foldername, { recursive: true })
            cacheFolder = foldername
        }

        return this.config.cache.path + "/" + cacheFolder
    }

    private getCacheFile(url: string){
        return this.getCacheFolder() + "/" + hash(url)
    }

    protected deleteOldCache(){
        let cacheFolder = this.config.cache.path
        let cacheFolderList = fs.readdirSync(cacheFolder)
        let timestamp = this.config.cache.durationMiliseconds
        let now = Date.now()

        for(let folder of cacheFolderList){
            let folderPath = cacheFolder + "/" + folder
            let stats = fs.statSync(folderPath)
            if(stats.isDirectory() && stats.mtimeMs + timestamp < now){
                fs.rmSync(folderPath, { recursive: true })
            }
        }
    }

    protected cacheResponse(url: string, response: CacheResponse){
        if(this.config.cache.deleteOnExpire) this.deleteOldCache()
        fs.writeFileSync(this.getCacheFile(url), JSON.stringify(response))
    }

    protected getCachedResponse(url: string){
        if(this.config.cache.deleteOnExpire) this.deleteOldCache()
        let cachePath = this.getCacheFile(url)
        if(fs.existsSync(cachePath)){
            return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CacheResponse
        }
        return null
    }
}