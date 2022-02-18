import axios from 'axios';
// 原始 axios.create
const axiosCreate = axios.create;

// 请求缓存对象
export let responseCache = {}

axios.create = function (config) {
    const instance = axiosCreate(config);
    const axiosGet = instance.get;

    
    // 替换实例的 get()
    instance.get = function (url, params, opt) {
        /**
         * get请求缓存功能
         * @param url[String] 请求地址
         * @param params[Object] 请求参数
         * @param opt[Object] 扩展配置，默认值{cache: true}
         * @return [Promise] 请求Promse
         * */

        opt = Object.assign({
            cache: false
        }, opt || {})

        const paramsStr = (Object.prototype.toString.call(params) === '[object Object]') ? JSON.stringify(params) : ''
        const requestKey = (`${url}?${paramsStr}`)

        const createPromise = function (url, params) {
            return axiosGet(url, params).then((res) => {
                if (opt.cache) {
                    responseCache[requestKey].status = 'resolved';
                } else {
                    delete responseCache[requestKey];
                }
                return res
            }).catch((err) => {
                delete responseCache[requestKey];
                return err
            })
        }

        if (
            !responseCache[requestKey]  // 无缓存
            ||
            (responseCache[requestKey].status !== 'pending' && !opt.cache)  // 有缓存且不需要缓存
            ) {
            // console.log('创建缓存对象', requestKey)
            responseCache[requestKey] = {
                status: 'pending',
                promise: createPromise(url, params)
            }

        }

        return responseCache[requestKey].promise
    }

    return instance;
}

export default axios;