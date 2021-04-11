export const promisify = (fn, ...args) =>
    new Promise((resolve, reject) => {
        fn(...args, (err, ...cbArgs) => {
            if (err) return reject(err)
            return resolve(cbArgs)
        })
    })
