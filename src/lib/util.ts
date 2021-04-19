export const promisify = (fn, ...args) =>
    new Promise((resolve, reject) => {
        fn(...args, (err, ...cbArgs) => {
            if (err) return reject(err)
            return resolve(cbArgs)
        })
    })

export const hashCode = (s: string): number =>
    s.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
