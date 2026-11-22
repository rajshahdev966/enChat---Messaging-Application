import ImageKit, { toFile } from '@imagekit/nodejs';
import { env } from '../config/env.js';




const client = new ImageKit({
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
});


export const generatePrivateImageUrl = (filePath)=> {
    return client.helper.buildSrc({
        urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
        src: filePath,
        signed: true,
        expiresIn:600
    })
}


export const uploadFiles = async ({ buffer, fileName }) => {
    const response = await client.files.upload({
        file: await toFile(buffer),
        fileName,
        folder: "enChat_dev",
        isPrivateFile: true,
        useUniqueFileName: true,
    });

    return { fileId: response.fileId, url: response.url, filePath: response.filePath }
}

export const deleteFile = (fileId) => client.files.delete(fileId)

export const deleteFileByPath = async (filePath) => {
    if (!filePath) return
    const normalizedPath = `/${filePath}`.replace(/^\/+/g, "/")
    const filename = decodeURIComponent(normalizedPath.split("/").pop() || "")
    if (!filename) return

    const matches = await client.assets.list({
        path: normalizedPath.slice(0, normalizedPath.lastIndexOf("/")) || "/",
        searchQuery: `name="${filename}"`,
        limit: 100,
    })
    const file = matches.find((item) => item.filePath === normalizedPath)
    if (file) return deleteFile(file.fileId)
}
