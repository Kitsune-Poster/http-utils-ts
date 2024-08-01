export type RateLimit = {
    maxRequest: number,
    perMiliseconds: number,
    deleteOnExpire: boolean,
    waitTillLimitReset: boolean
}