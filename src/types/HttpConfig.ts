import { RateLimit } from "./RateLimit"
import { Cache } from "./Cache"

export type HttpConfig = {
    cache: Cache,
    rateLimit: RateLimit
}