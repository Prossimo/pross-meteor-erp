import fs from 'fs-plus'
import path from 'path'

let DefaultResourcePath = '/'

module.exports = Utils = {
    imageNamed: (fullname, resourcePath) => {
        [name, ext] = fullname.split('.')

        resourcePath = resourcePath || DefaultResourcePath

        Utils.images = Utils.images || {}
        if(!Utils.images[resourcePath]) {
            imagesPath = path.join(resourcePath, 'icons')
            files = fs.listTreeSync(imagesPath)

            Utils.images[resourcePath] = Utils.images[resourcePath] || {}
            for(file of files) {
                file = file.replace(/\\/g, '/')
                Utils.images[resourcePath][path.basename(file)] = file
            }
        }

        plat = process.platform || ""
        ratio = window.devicePixelRatio || 1

        return  Utils.images[resourcePath][`${name}-#{plat}@${ratio}x.${ext}`] ||
                Utils.images[resourcePath][`${name}@${ratio}x.${ext}`] ||
                Utils.images[resourcePath][`${name}-${plat}.${ext}`] ||
                Utils.images[resourcePath][`${name}.${ext}`] ||
                Utils.images[resourcePath][`${name}-${plat}@2x.${ext}`] ||
                Utils.images[resourcePath][`${name}@2x.${ext}`] ||
                Utils.images[resourcePath][`${name}-${plat}@1x.${ext}`] ||
                Utils.images[resourcePath][`${name}@1x.${ext}`]
    },
    fastOmit: (props, without) => {
        otherProps = Object.assign({}, props)
        for(w of without) {delete otherProps[w]}
        return otherProps
    }


}